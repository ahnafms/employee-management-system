import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";
import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import { userRouter } from "@/api/user/userRouter";
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
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/users", userRouter);

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
    console.error(err);
    logger.error("Database connection failed", err);
    process.exit(1);
  }
}
