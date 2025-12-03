import express, { type Router } from "express";
import { employeeController } from "./employeeController";
import { validateRequest } from "@/common/utils/httpHandlers";
import { CreateEmployeeSchema, UpdateEmployeeSchema } from "./employeeModel";
import {
  OpenAPIRegistry,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import z from "zod";

extendZodWithOpenApi(z);

export const employeeRouter: Router = express.Router();
export const employeeRegistry = new OpenAPIRegistry();

//!TODO: Protect all routes with authentication
// employeeRouter.use(authMiddleware);

// --- Routes with OpenAPI metadata ---
employeeRouter.post(
  "/",
  validateRequest(CreateEmployeeSchema),
  employeeController.createEmployee
);
employeeRegistry.registerPath({
  method: "post",
  path: "/employees",
  description: "Create a new employee",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateEmployeeSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Employee created successfully",
      content: {
        "application/json": {
          schema: CreateEmployeeSchema,
        },
      },
    },
  },
});

employeeRouter.get("/", employeeController.getAllEmployees);
employeeRegistry.registerPath({
  method: "get",
  path: "/employees",
  description: "Get all employees",
  responses: {
    200: {
      description: "List of employees",
      content: {
        "application/json": {
          schema: z.array(CreateEmployeeSchema),
        },
      },
    },
  },
});

employeeRouter.get("/:id", employeeController.getEmployeeById);
employeeRegistry.registerPath({
  method: "get",
  path: "/employees/{id}",
  description: "Get employee by ID",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Employee found",
      content: {
        "application/json": {
          schema: CreateEmployeeSchema,
        },
      },
    },
    404: {
      description: "Employee not found",
    },
  },
});

employeeRouter.put(
  "/:id",
  validateRequest(UpdateEmployeeSchema),
  employeeController.updateEmployee
);
employeeRegistry.registerPath({
  method: "put",
  path: "/employees/{id}",
  description: "Update an employee",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateEmployeeSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Employee updated successfully",
      content: {
        "application/json": {
          schema: UpdateEmployeeSchema,
        },
      },
    },
    404: {
      description: "Employee not found",
    },
  },
});

employeeRouter.delete("/:id", employeeController.deleteEmployee);
employeeRegistry.registerPath({
  method: "delete",
  path: "/employees/{id}",
  description: "Delete an employee",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    204: {
      description: "Employee deleted successfully",
    },
    404: {
      description: "Employee not found",
    },
  },
});
