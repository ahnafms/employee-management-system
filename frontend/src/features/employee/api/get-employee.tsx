import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { ApiError, type ApiResponse } from "@/types/api";
import { EmployeeSchema, type GetEmployeeResponse } from "../dto/employee";

export async function fetchEmployeeDetail(
  employeeId: string
): Promise<GetEmployeeResponse> {
  if (!employeeId) {
    throw new ApiError(400, "Employee ID is required to fetch details.");
  }

  const endpoint = `/employees/${employeeId}`;

  try {
    const response = await apiClient<ApiResponse<GetEmployeeResponse>>(
      endpoint,
      "GET"
    );

    if (!response.success) {
      throw new ApiError(response.statusCode, response.message);
    }

    const rawData = response.data;

    const parsed = EmployeeSchema.safeParse(rawData);
    if (!parsed.success) {
      const issues = parsed.error;
      throw new ApiError(
        500,
        `Invalid get-employee-detail response from server: ${JSON.stringify(
          issues
        )}`
      );
    }

    return parsed;
  } catch (error) {
    if (ApiError.isApiError(error)) {
      throw error;
    }
    throw new ApiError(
      500,
      error instanceof Error
        ? error.message
        : "Failed to fetch employee details"
    );
  }
}

export function useGetEmployeeDetail(
  employeeId: string,
  options?: UseQueryOptions<GetEmployeeResponse, ApiError>
) {
  const enabled = !!employeeId;

  return useQuery({
    queryKey: ["employee", employeeId],
    queryFn: () => fetchEmployeeDetail(employeeId),
    enabled,
    ...options,
  });
}
