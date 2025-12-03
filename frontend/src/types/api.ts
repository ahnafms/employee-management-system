export type Params = {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: "name" | "position" | "age" | "salary" | "created_at";
  sortOrder?: "ASC" | "DESC";
};

export type ServiceResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
};

export type ApiResponse<T> = ServiceResponse<T>;

export type PaginatedData<T> = {
  data: T;
  pagination: Pagination;
};

export type ApiPaginationResponse<T> = ServiceResponse<PaginatedData<T>>;

export type Pagination = {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  success?: boolean;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  readonly statusCode: number;
  readonly errors?: Record<string, string[]>;

  constructor(
    statusCode: number,
    message: string,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }
}

export type ApiClientOptions = {
  isFormData?: boolean;
  timeout?: number;
};
