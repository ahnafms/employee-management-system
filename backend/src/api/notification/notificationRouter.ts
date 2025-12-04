import express, { Router } from "express";
import { sseHandler } from "@/common/utils/sseHandler";
import { authenticateJWT, authorizeAdmin } from "@/common/middleware/auth";

export const notificationRouter: Router = express.Router();

notificationRouter.use(authenticateJWT, authorizeAdmin);

notificationRouter.get("/employee", sseHandler);
