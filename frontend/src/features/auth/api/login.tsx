import { z } from "zod";
import { apiClient } from "@/lib/api";

const LoginRequestSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const LoginResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    token: z.string(),
  }),
  statusCode: z.number(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient("/login/", "POST", credentials);

  console.log(response);
  const validatedResponse = LoginResponseSchema.parse(response);

  if (validatedResponse.success && validatedResponse.data.token) {
    localStorage.setItem("authToken", validatedResponse.data.token);
  }

  return validatedResponse;
}

export function getAuthToken(): string | null {
  return localStorage.getItem("authToken");
}

export function logout(): void {
  localStorage.removeItem("authToken");
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
