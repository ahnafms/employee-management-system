import express from "express";
import { sseHandler } from "@/common/utils/sseHandler";

export const notificationRouter = express.Router();

notificationRouter.get("/employee", sseHandler);
