import { Queue } from "bullmq";
import { env } from "@/common/utils/envConfig";
import { CreateEmployee } from "../employeeModel";

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
    return this.queue.add("bulk-create-employee-csv", filePath);
  }
}
