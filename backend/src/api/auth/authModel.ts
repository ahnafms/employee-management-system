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

// Verify Token Endpoint Schemas
export const VerifyTokenSchema = z.object({
  token: z.string().openapi({
    description: "JWT token to verify",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  }),
});

export const VerifyTokenRequestSchema = z.object({
  body: VerifyTokenSchema.openapi({
    description: "Token verification request",
  }),
});

export const VerifyTokenResponseSchema = z.object({
  valid: z.boolean().openapi({
    description: "Whether the token is valid and not expired",
    example: true,
  }),
  email: z.email().optional().openapi({
    description: "Email from token (if valid)",
    example: "user@example.com",
  }),
  roles: z
    .array(z.string())
    .optional()
    .openapi({
      description: "Roles from token (if valid)",
      example: ["admin"],
    }),
  expiresAt: z.string().optional().openapi({
    description: "Token expiration time (ISO 8601)",
    example: "2025-12-05T10:30:00.000Z",
  }),
  message: z.string().openapi({
    description: "Status message",
    example: "Token is valid",
  }),
});

export type VerifyToken = z.infer<typeof VerifyTokenSchema>;
export type VerifyTokenRequest = z.infer<typeof VerifyTokenRequestSchema>;
export type VerifyTokenResponse = z.infer<typeof VerifyTokenResponseSchema>;
