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

export type Employee = z.infer<typeof EmployeeSchema>;
export type CreateEmployee = z.infer<typeof CreateEmployeeSchema>;
export type UpdateEmployee = z.infer<typeof UpdateEmployeeSchema>;
