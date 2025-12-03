import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const EmployeeSchema = z.object({
  id: z.uuid().meta({
    description: "Employee's unique identifier",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  name: z.string().meta({
    description: "Employee's full name",
    example: "John Doe",
  }),
  age: z.number().int().meta({
    description: "Employee's age",
    example: 30,
  }),
  position: z.string().meta({
    description: "Employee's job position",
    example: "Software Engineer",
  }),
  salary: z.number().meta({
    description: "Employee's salary",
    example: "75000.00",
  }),
  created_at: z.date().meta({
    description: "Timestamp when the employee record was created",
    example: "2023-10-01T12:00:00Z",
  }),
  updated_at: z.date().meta({
    description: "Timestamp when the employee record was last updated",
    example: "2023-10-10T15:30:00Z",
  }),
});

export const CreateEmployeeSchema = EmployeeSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateEmployeeSchema = EmployeeSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const GetEmployeesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).meta({
    description: "Page number (1-indexed)",
    example: 1,
  }),
  pageSize: z.coerce.number().int().positive().default(10).meta({
    description: "Number of records per page (10, 25, 50, 100, etc.)",
    example: 10,
  }),
  search: z.string().optional().meta({
    description: "Search term to filter employees by name or position",
    example: "John",
  }),
  sortBy: z
    .enum(["name", "position", "age", "salary", "created_at"])
    .default("created_at")
    .meta({
      description: "Field to sort by",
      example: "name",
    }),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC").meta({
    description: "Sort order (ASC for ascending, DESC for descending)",
    example: "ASC",
  }),
});

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
) =>
  z.object({
    data: z.array(dataSchema),
    pagination: z.object({
      page: z.number(),
      pageSize: z.number(),
      totalRecords: z.number(),
      totalPages: z.number(),
      hasNextPage: z.boolean(),
      hasPreviousPage: z.boolean(),
    }),
  });

export type Employee = z.infer<typeof EmployeeSchema>;
export type CreateEmployee = z.infer<typeof CreateEmployeeSchema>;
export type UpdateEmployee = z.infer<typeof UpdateEmployeeSchema>;
export type GetEmployeesQuery = z.infer<typeof GetEmployeesQuerySchema>;
export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};
