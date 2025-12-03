import type { ApiClientOptions, ApiErrorResponse } from "@/types/api";
import { ApiError } from "@/types/api";

const API_BASE_URL = "http://localhost:8080";
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Parse error response from API
 */
function parseErrorResponse(
  statusCode: number,
  data: unknown
): ApiErrorResponse {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    const errorData = data as Record<string, unknown>;
    return {
      message: errorData.message as string,
      statusCode,
      errors:
        typeof errorData.errors === "object"
          ? (errorData.errors as Record<string, string[]>)
          : undefined,
    };
  }

  return {
    message: `HTTP error! status: ${statusCode}`,
    statusCode,
  };
}

/**
 * Main API client function with proper error handling
 * @param endpoint - API endpoint path
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param data - Request body data
 * @param options - Additional options (isFormData, timeout)
 * @returns Parsed response data
 * @throws ApiError with statusCode and error details
 */
export async function apiClient<T = unknown>(
  endpoint = "",
  method: string = "GET",
  data?: unknown,
  options?: ApiClientOptions
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const isFormData = options?.isFormData || data instanceof FormData;
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;

  const headers: Record<string, string> = {};

  // Get auth token from localStorage
  const authToken = localStorage.getItem("authToken");
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  // Set content type if not FormData
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const body = data
    ? isFormData
      ? (data as BodyInit)
      : JSON.stringify(data)
    : undefined;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const config: RequestInit = {
    method,
    headers,
    credentials: "include",
    signal: controller.signal,
    ...(body && { body }),
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
      const errorResponse = parseErrorResponse(401, {
        message: "Unauthorized - please login again",
      });
      throw new ApiError(401, errorResponse.message, errorResponse.errors);
    }

    if (response.status === 204) {
      return {} as T;
    }

    let responseData: unknown;
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      const errorResponse = parseErrorResponse(response.status, responseData);
      throw new ApiError(
        response.status,
        errorResponse.message,
        errorResponse.errors
      );
    }

    return responseData as T;
  } catch (error) {
    clearTimeout(timeoutId);

    // If it's already an ApiError, re-throw it
    if (ApiError.isApiError(error)) {
      throw error;
    }

    // Handle abort/timeout
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(408, "Request timeout");
    }

    // Handle network errors
    if (error instanceof TypeError) {
      throw new ApiError(0, "Network error - unable to reach server");
    }

    // Handle unexpected errors
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new ApiError(500, message);
  } finally {
    clearTimeout(timeoutId);
  }
}
