import { Queue } from "bullmq";
import { env } from "@/common/utils/envConfig";
import { CreateEmployee } from "../employeeModel";
import * as fs from "fs";
import csv from "csv-parser";
import { Transform } from "stream";
import { logger } from "@/server";

const connection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
};

export class EmployeeQueue {
  private queue: Queue;

  constructor() {
    this.queue = new Queue("employee-queue", { connection });
  }

  /**
   * Add a job to the queue to create an employee.
   * The controller will call this function instead of calling the service directly.
   */
  public async enqueueCreateEmployee(data: CreateEmployee) {
    return this.queue.add("create-employee", data);
  }

  public async enqueueEmployeeCsv(filePath: string) {
    const batchSize = 1000;
    let employeeBatch: any[] = [];
    let recordCount = 0;
    const employeeQueueInstance = this.queue;

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
            await employeeQueueInstance.add(
              "bulk-create-employee",
              employeeBatch
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
            await employeeQueueInstance.add(
              "bulk-create-employee",
              employeeBatch
            );
            employeeBatch = [];
          } catch (error) {
            logger.error(`Error processing final batch: ${error}`);
            callback(error as Error);
            return;
          }
        }
        logger.info(`CSV file fully processed. Total records: ${recordCount}`);
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
      console.error("Pipeline failed:", error);
      throw new Error("Failed to process CSV file via stream pipeline.");
    }
  }
}
