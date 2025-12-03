import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { authController } from "./authController";
import {
  LoginRequestSchema,
  LoginResponseSchema,
  LoginSchema,
} from "./authModel";
import z from "zod";

export const authRegistry = new OpenAPIRegistry();
export const authRouter: Router = express.Router();

authRegistry.register("Login", LoginRequestSchema);

authRegistry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Authentication"],
  summary: "User Login",
  description: "Authenticate user and return JWT token",
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginSchema,
        },
      },
    },
  },
  responses: createApiResponse(LoginResponseSchema, "Success"),
});

authRegistry.registerPath({
  method: "get",
  path: "/auth/verify",
  tags: ["Authentication"],
  summary: "Verify User Authentication",
  description: "Check if user is authenticated by verifying JWT from cookie",
  responses: createApiResponse(LoginResponseSchema, "Success"),
});

authRegistry.registerPath({
  method: "get",
  path: "/auth/logout",
  tags: ["Authentication"],
  summary: "Logout User",
  description: "Clear JWT cookie to log out the user",
  responses: createApiResponse(z.object(), "Logout successful"),
});

authRouter.post(
  "/login",
  validateRequest(LoginRequestSchema),
  authController.login
);
authRouter.get("/verify", authController.verify);
authRouter.post("/logout", authController.logout);
