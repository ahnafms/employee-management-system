import { Worker, Job } from "bullmq";
import SingletonDb from "@/database";
import { Employee } from "@/database/entities/employeeEntity";
import { EmployeeRepository } from "../employeeRepository";
import { EmployeeService } from "../employeeService";
import { env } from "@/common/utils/envConfig";
import { logger } from "@/server";

export class EmployeeWorker {
  private worker: Worker;

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
        return await service.createEmployee(job.data);

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
