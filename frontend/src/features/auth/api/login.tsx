import { z } from "zod";
import { apiClient } from "@/lib/api";
import { ApiError } from "@/types/api";

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

const VerifyAuthResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  statusCode: z.number(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type VerifyAuthResponse = z.infer<typeof VerifyAuthResponseSchema>;

let authCache: boolean | null = null;
let authCacheTimeout: NodeJS.Timeout | null = null;

export async function verifyAuthentication(): Promise<boolean> {
  try {
    const response = await apiClient<VerifyAuthResponse>("/auth/verify", "GET");
    return response.success === true;
  } catch (error: any) {
    if (ApiError.isApiError(error) && error.statusCode === 401) {
      return false;
    }
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  if (authCache !== null) {
    return authCache;
  }

  const authenticated = await verifyAuthentication();
  authCache = authenticated;

  if (authCacheTimeout) clearTimeout(authCacheTimeout);
  authCacheTimeout = setTimeout(() => {
    authCache = null;
  }, 5 * 60 * 1000);

  return authenticated;
}

export function clearAuthCache(): void {
  authCache = null;
  if (authCacheTimeout) clearTimeout(authCacheTimeout);
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient("/auth/login", "POST", credentials);

  const validatedResponse = LoginResponseSchema.parse(response);

  clearAuthCache();
  authCache = true;

  return validatedResponse;
}

export async function logout(): Promise<void> {
  try {
    await apiClient("/auth/logout", "POST");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    clearAuthCache();
  }
}
