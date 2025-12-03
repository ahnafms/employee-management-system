import z from "zod";

export const EmployeeSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number(),
  position: z.string(),
  salary: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Employee = z.infer<typeof EmployeeSchema>;

export const CreateEmployeeSchema = EmployeeSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type CreateEmployee = z.infer<typeof CreateEmployeeSchema>;

export const PaginationSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  totalRecords: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

export const GetEmployeesResponseSchema = z.array(EmployeeSchema);

export type GetEmployeesResponse = {
  data: Employee[];
  pagination: Pagination;
};
