import type { ApiClientOptions, ApiErrorResponse } from "@/types/api";
import { ApiError } from "@/types/api";
import { env } from "@/config/env";
const DEFAULT_TIMEOUT = 30000;

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

export async function apiClient<T = unknown>(
  endpoint = "",
  method: string = "GET",
  data?: unknown,
  options?: ApiClientOptions
): Promise<T> {
  const url = `${env.baseUrl}${endpoint}`;
  const isFormData = options?.isFormData || data instanceof FormData;
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;

  const headers: Record<string, string> = {};

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

    if (response.status === 401) {
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
