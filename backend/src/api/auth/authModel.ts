import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const LoginSchema = z.object({
  email: z.email().openapi({
    description: "User's email address",
    example: "user@example.com",
  }),
  password: z.string().openapi({
    description: "User's password",
    example: "strongPassword123",
  }),
});

export const LoginRequestSchema = z.object({
  body: LoginSchema.openapi({
    description: "Login request payload",
  }),
});
export const LoginResponseSchema = z.object({
  token: z.string().openapi({
    description: "JWT authentication token",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  }),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type Login = z.infer<typeof LoginSchema>;

export const JwtPayloadSchema = z.object({
  email: z.email(),
  roles: z.array(z.string()),
});
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
