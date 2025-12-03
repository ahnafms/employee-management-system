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

export const authRegistry = new OpenAPIRegistry();
export const authRouter: Router = express.Router();

authRegistry.register("Login", LoginRequestSchema);

authRegistry.registerPath({
  method: "post",
  path: "/login",
  tags: ["Auhentication"],
  summary: "User Login",
  description: "Authenticate user and return JWT token",
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginRequestSchema,
        },
      },
    },
  },
  responses: createApiResponse(LoginResponseSchema, "Success"),
});

authRouter.post("/login", validateRequest(LoginSchema), authController.login);
