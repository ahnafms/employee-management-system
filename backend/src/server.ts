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
import AppDataSource from "./database";
import { env } from "./common/utils/envConfig";

const logger = pino({ name: "server start" });
const app: Express = express();

//init database connection
AppDataSource.initialize()
  .then(() => {
    const DB_PORT = env.DB_PORT || 5432;

    logger.info(`Database connected successfully on port ${DB_PORT}`);
  })
  .catch((err) => {
    console.log(err);
    logger.error("Database connection failed", err);
    process.exit(1);
  });

app.set("trust proxy", true);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/users", userRouter);

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
