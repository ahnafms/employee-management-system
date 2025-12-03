import { Worker, Job, RedisClient } from "bullmq";
import SingletonDb from "@/database";
import { Employee } from "@/database/entities/employeeEntity";
import { EmployeeRepository } from "../employeeRepository";
import { EmployeeService } from "../employeeService";
import { env } from "@/common/utils/envConfig";
import { logger } from "@/server";
import Redis from "ioredis";

import * as fs from "fs";
import csv from "csv-parser";
import { Transform } from "stream";
import { countCsvLines } from "@/common/utils/fileHelper";

export class EmployeeWorker {
  private worker: Worker;
  private redisPublisher: RedisClient;

  constructor() {
    const connection = {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    };

    this.worker = new Worker(
      "employee-queue",
      async (job) => this.processJob(job),
      { connection }
    );

    this.redisPublisher = new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    });

    this.registerEvents();

    logger.info("[EmployeeWorker] Worker started and listening...");
  }

  /**
   * Core job processor
   */
  private async processJob(job: Job) {
    logger.info(`[EmployeeWorker] Processing job: ${job.name}`);

    const dataSource = SingletonDb.getConnection();
    const repo = new EmployeeRepository(dataSource.getRepository(Employee));
    const service = new EmployeeService(repo);

    switch (job.name) {
      case "create-employee":
        try {
          const result = await service.createEmployee(job.data);
          await this.redisPublisher.publish(
            "employee-events",
            JSON.stringify({
              event: "create-employee",
              data: {
                jobId: job.id,
                result,
                message: `Employee created with ID: ${result.id}`,
              },
            })
          );
          logger.info(
            `[EmployeeWorker] Employee created with ID: ${result.id}`
          );
        } catch (err) {
          logger.error(`Error publishing SSE message: ${err}`);
        }
        break;

      case "bulk-create-employee-csv":
        try {
          const filePath = job.data;

          const batchSize = 1000;
          let employeeBatch: any[] = [];
          let recordCount = 0;
          const redisPublisher = this.redisPublisher;

          const totalRecordCount = await countCsvLines(filePath);

          const readStream = fs.createReadStream(filePath);

          const batcherStream = new Transform({
            objectMode: true,
            async transform(chunk, encoding, callback) {
              employeeBatch.push(chunk);
              recordCount++;

              if (employeeBatch.length >= batchSize) {
                try {
                  logger.info(
                    `Processing batch of ${employeeBatch.length} records...`
                  );

                  const percentCompleted = Math.round(
                    (recordCount / totalRecordCount) * 100
                  );

                  const status =
                    percentCompleted === 100 ? "COMPLETED" : "PROCESSING";

                  await service.bulkCreateEmployees(employeeBatch);
                  await redisPublisher.publish(
                    "employee-events",
                    JSON.stringify({
                      event: "bulk-create-employee-progress",
                      data: {
                        jobId: job.id,
                        status,
                        progress: percentCompleted,
                        message: `Processed ${recordCount} of ${totalRecordCount} records (${percentCompleted}% complete)...`,
                      },
                    })
                  );
                  employeeBatch = [];
                  callback();
                } catch (error) {
                  console.error("Error processing batch:", error);
                  callback(error as Error);
                }
              } else {
                callback();
              }
            },
            async flush(callback) {
              if (employeeBatch.length > 0) {
                try {
                  logger.info(
                    `Processing final batch of ${employeeBatch.length} records...`
                  );
                  await service.bulkCreateEmployees(employeeBatch);
                  await redisPublisher.publish(
                    "employee-events",
                    JSON.stringify({
                      event: "bulk-create-employee-completed",
                      data: {
                        jobId: job.id,
                        status: "COMPLETED",
                        progress: 100,
                        message: `CSV file fully processed. Total records: ${recordCount}`,
                      },
                    })
                  );
                  employeeBatch = [];
                } catch (error) {
                  logger.error(`Error processing final batch: ${error}`);
                  callback(error as Error);
                  return;
                }
              }
              logger.info(
                `CSV file fully processed. Total records: ${recordCount}`
              );
              fs.unlink(filePath, (err) => {
                if (err) console.error("Could not delete temp file:", err);
              });
              callback();
            },
          });

          try {
            await new Promise<void>((resolve, reject) => {
              readStream
                .pipe(csv())
                .pipe(batcherStream)
                .on("error", (err) => {
                  readStream.close();
                  reject(err);
                })
                .on("finish", () => {
                  resolve();
                });
            });
          } catch (error) {
            logger.error(
              error,
              "Failed to process CSV file via stream pipeline."
            );
            throw new Error("Failed to process CSV file via stream pipeline.");
          }
          await service.bulkCreateEmployees(job.data);
        } catch (err) {
          logger.error(`[EmployeeWorker] Employee failed bulk create: ${err}`);
        }

      default:
        logger.warn(`[EmployeeWorker] Unknown job: ${job.name}`);
    }
  }

  /**
   * Optional worker lifecycle events
   */
  private registerEvents() {
    this.worker.on("completed", (job) => {
      logger.info(`[EmployeeWorker] Job completed: ${job.id}`);
    });

    this.worker.on("failed", (job, error) => {
      logger.info(`[EmployeeWorker] Job failed: ${job?.id} ${error}`);
    });
  }
}

export const employeeWorker = new EmployeeWorker();
