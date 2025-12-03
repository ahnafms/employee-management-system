import { env } from "@/common/utils/envConfig";
import { sendSseMessage } from "@/common/utils/sseHandler";
import { logger } from "@/server";
import Redis from "ioredis";

export const redisSubscriber = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
});

redisSubscriber.subscribe("employee-events", (err, count) => {
  if (err) {
    logger.error(err, "Failed to subscribe to Redis channel:");
  } else {
    logger.info(`📡 Subscribed to ${count} Redis channel(s)`);
  }
});

redisSubscriber.on("message", (channel, message) => {
  if (channel === "employee-events") {
    try {
      const { event, data } = JSON.parse(message);
      sendSseMessage(event, data);
      logger.info(`📨 Forwarded SSE message from Redis: ${event}`);
    } catch (error) {
      logger.error(error, "Failed to parse Redis message:");
    }
  }
});
