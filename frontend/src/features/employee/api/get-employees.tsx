import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import {
  GetEmployeesResponseSchema,
  type GetEmployeesResponse,
} from "../dto/employee";
import type { ApiPaginationResponse, Params } from "@/types/api";
import { ApiError } from "@/types/api";

export async function fetchEmployees(
  params: Params = {}
): Promise<GetEmployeesResponse> {
  const {
    page = 1,
    pageSize = 10,
    search,
    sortBy = "created_at",
    sortOrder = "DESC",
  } = params;

  const queryParams = new URLSearchParams();
  queryParams.append("page", String(page));
  queryParams.append("pageSize", String(pageSize));
  queryParams.append("sortBy", sortBy);
  queryParams.append("sortOrder", sortOrder);
  if (search) {
    queryParams.append("search", search);
  }

  const endpoint = `/employees?${queryParams.toString()}`;

  try {
    const response = await apiClient<
      ApiPaginationResponse<GetEmployeesResponse>
    >(endpoint, "GET");

    if (!response.success) {
      throw new ApiError(response.statusCode, response.message);
    }

    const { data, pagination } = response.data;
    const parsed = GetEmployeesResponseSchema.safeParse(data);
    if (!parsed.success) {
      const issues = parsed.error;
      throw new ApiError(
        500,
        `Invalid get-employees response from server: ${JSON.stringify(issues)}`
      );
    }

    return {
      data: parsed.data,
      pagination,
    };
  } catch (error) {
    if (ApiError.isApiError(error)) {
      throw error;
    }
    throw new ApiError(
      500,
      error instanceof Error ? error.message : "Failed to fetch employees"
    );
  }
}

export function useGetEmployees(
  params: Params = {},
  options?: UseQueryOptions<GetEmployeesResponse, ApiError>
) {
  return useQuery({
    queryKey: ["employees", params],
    queryFn: () => fetchEmployees(params),
    ...options,
  });
}
