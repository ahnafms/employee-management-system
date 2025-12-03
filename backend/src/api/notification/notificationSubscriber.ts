import { env } from "@/common/utils/envConfig";
import { sendSseMessage } from "@/common/utils/sseHandler";
import { logger } from "@/server";
import Redis from "ioredis";

export const redisSubscriber = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
});

// Subscribe to the channel
redisSubscriber.subscribe("employee-events", (err, count) => {
  if (err) {
    logger.error("Failed to subscribe to Redis channel:", err);
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
      logger.error("Failed to parse Redis message:", error);
    }
  }
});
