import { logger } from "@/server";
import { Request, Response } from "express";

type SSEClient = {
  id: number;
  res: Response;
};

const CONNECTION_TIMEOUT = 15 * 60 * 1000;

let clientId = 0;
export const clients: SSEClient[] = [];

export const sseHandler = (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  res.setTimeout(0);

  const id = clientId++;
  clients.push({ id, res });
  logger.info(`🔌 SSE client connected: ${id} (user: ${id})`);

  const heartbeatInterval = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 30000);

  res.write("event: connected\ndata: connected\n\n");

  req.on("close", () => {
    clearInterval(heartbeatInterval);
    const index = clients.findIndex((c) => c.id === id);
    if (index !== -1) clients.splice(index, 1);
    logger.info(`❌ SSE client disconnected: ${id}`);
  });
};

export const sendSseMessage = (event: string, data: any) => {
  logger.info(
    `📤 Sending SSE message to ${clients.length} client(s): ${event}`
  );

  const disconnectedClients: number[] = [];

  for (const client of clients) {
    try {
      if (!client.res.writableEnded) {
        client.res.write(`event: ${event}\n`);
        client.res.write(`data: ${JSON.stringify(data)}\n\n`);
        logger.debug(`✅ Message sent to client ${client.id}`);
      } else {
        logger.warn(`⚠️ Client ${client.id} connection already ended`);
        disconnectedClients.push(client.id);
      }
    } catch (error) {
      logger.error(`❌ Failed to send to client ${client.id}:`, error as any);
      disconnectedClients.push(client.id);
    }
  }

  for (const id of disconnectedClients) {
    const index = clients.findIndex((c) => c.id === id);
    if (index !== -1) {
      clients.splice(index, 1);
      logger.info(`🧹 Cleaned up disconnected client: ${id}`);
    }
  }
};
