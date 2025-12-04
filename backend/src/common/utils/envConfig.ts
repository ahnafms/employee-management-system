import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("production"),

  HOST: z.string().min(1).default("localhost"),

  PORT: z.coerce.number().int().positive().default(3001),

  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  COMMON_RATE_LIMIT_MAX_REQUESTS: z.coerce
    .number()
    .int()
    .positive()
    .default(1000),

  COMMON_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(1000),

  DB_HOST: z.string().min(1).default("localhost"),

  DB_PORT: z.coerce.number().int().positive().default(5432),

  DB_USERNAME: z.string().min(1).default("postgres"),

  DB_PASSWORD: z.string().min(1).default("password"),

  DB_DATABASE: z.string().min(1).default("employee_management_system"),

  REDIS_HOST: z.string().min(1).default("localhost"),

  REDIS_PORT: z.coerce.number().int().positive().default(6379),

  SALT_ROUNDS: z.coerce.number().int().positive().default(10),

  JWT_SECRET: z.string().min(64),

  JWT_EXPIRES_IN: z.number().default(3600),

  ADMIN_EMAIL: z.email().default("admin@gmail.com"),

  ADMIN_PASSWORD: z.string().default("12345678"),

  JWT_COOKIE_NAME: z.string().default("auth_token"),

  JWT_COOKIE_MAX_AGE: z.coerce.number().int().positive().default(3600000),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  throw new Error("Invalid environment variables");
}

export const env = {
  ...parsedEnv.data,
  isDevelopment: parsedEnv.data.NODE_ENV === "development",
  isProduction: parsedEnv.data.NODE_ENV === "production",
  isTest: parsedEnv.data.NODE_ENV === "test",
};
