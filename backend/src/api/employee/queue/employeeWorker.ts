import { Worker, Job, RedisClient } from "bullmq";
import SingletonDb from "@/database";
import { Employee } from "@/database/entities/employeeEntity";
import { EmployeeRepository } from "../employeeRepository";
import { EmployeeService } from "../employeeService";
import { env } from "@/common/utils/envConfig";
import { logger } from "@/server";
import { sendSseMessage, sseHandler } from "@/common/utils/sseHandler";
import Redis from "ioredis";

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
    console.log(`[EmployeeWorker] Processing job: ${job.name}`);

    const dataSource = SingletonDb.getConnection();
    const repo = new EmployeeRepository(dataSource.getRepository(Employee));
    const service = new EmployeeService(repo);

    switch (job.name) {
      case "create-employee":
        const result = await service.createEmployee(job.data);
        try {
          const res = await this.redisPublisher.publish(
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
          console.log(res);
        } catch (err) {
          console.error("Error publishing SSE message:", err);
        }
        logger.info(`[EmployeeWorker] Employee created with ID: ${result.id}`);
        break;

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

// Export instance if needed
export const employeeWorker = new EmployeeWorker();
