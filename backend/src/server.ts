import cors from "cors";
import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { pino } from "pino";
import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import { openAPIRouter } from "@/api-docs/openAPIRouter";
import errorHandler from "@/common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "./common/utils/envConfig";
import SingletonDb from "./database";
import { authRouter } from "./api/auth/authRouter";
import { employeeRouter } from "./api/employee/employeeRouter";
import { notificationRouter } from "./api/notification/notificationRouter";
import "@/api/notification/notificationSubscriber";

const logger = pino({ name: "server start" });
const app: Express = express();

bootstrap();

app.set("trust proxy", true);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use("/health-check", healthCheckRouter);

app.use("/login", authRouter);
app.use("/employees", employeeRouter);

app.use("/notifications", notificationRouter);

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };

async function bootstrap() {
  try {
    const DB_PORT = env.DB_PORT || 5432;

    await SingletonDb.initialize();
    logger.info(`Database connected successfully on port ${DB_PORT}`);
  } catch (err) {
    const error = err as Error;
    logger.error({ err: error }, "Database connection failed");
    process.exit(1);
  }
}
