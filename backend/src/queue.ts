import "@/zod-setup";
import "./api/employee/queue/employeeWorker";
import { logger } from "./server";

logger.info("Starting Employee Worker...");
