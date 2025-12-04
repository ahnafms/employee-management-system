import { logger } from "@/server";
import { RedisOptions } from "bullmq";
import IORedis from "ioredis";

class RedisSingleton {
  private static instance: IORedis;

  private constructor() {}

  public static getInstance(): IORedis {
    if (!RedisSingleton.instance) {
      RedisSingleton.instance = new IORedis({
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD || undefined,
      });
      logger.info("Redis connected");
    }
    return RedisSingleton.instance;
  }
}

export const redisConnection = RedisSingleton.getInstance();
