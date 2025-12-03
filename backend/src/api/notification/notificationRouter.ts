import express from "express";
import { sseHandler } from "@/common/utils/sseHandler";
import { authenticateJWT, authorizeAdmin } from "@/common/middleware/auth";

export const notificationRouter = express.Router();

// Protect notification endpoints to admin users only
notificationRouter.use(authenticateJWT, authorizeAdmin);

notificationRouter.get("/employee", sseHandler);
