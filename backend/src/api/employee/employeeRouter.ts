import express, { type Router } from "express";
import { employeeController } from "./employeeController";
import { validateRequest } from "@/common/utils/httpHandlers";
import { CreateEmployeeSchema, UpdateEmployeeSchema } from "./employeeModel";
import {
  OpenAPIRegistry,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import z from "zod";
import multer from "multer";
import path from "path";
import { authenticateJWT, authorizeAdmin } from "@/common/middleware/auth";

extendZodWithOpenApi(z);

export const employeeRouter: Router = express.Router();
export const employeeRegistry = new OpenAPIRegistry();

employeeRouter.use(authenticateJWT, authorizeAdmin);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `./src/tmp/uploads`);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

export const upload = multer({ storage: storage });

employeeRouter.post(
  "/",
  validateRequest(CreateEmployeeSchema),
  employeeController.createEmployee
);
employeeRegistry.registerPath({
  tags: ["Employee"],
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

employeeRouter.get("/", employeeController.getEmployeesWithPagination);
employeeRegistry.registerPath({
  tags: ["Employee"],
  method: "get",
  path: "/employees",
  description: "Get all employees with pagination, search, and sort",
  request: {
    query: z.object({
      page: z.coerce
        .number()
        .int()
        .positive()
        .default(1)
        .openapi({ description: "Page number (1-indexed)", example: 1 }),
      pageSize: z.coerce.number().int().positive().default(10).openapi({
        description: "Number of records per page (10, 25, 50, 100, etc.)",
        example: 10,
      }),
      search: z.string().optional().openapi({
        description: "Search term to filter by name or position",
        example: "John",
      }),
      sortBy: z
        .enum(["name", "position", "age", "salary", "created_at"])
        .default("created_at")
        .openapi({
          description: "Field to sort by",
          example: "name",
        }),
      sortOrder: z.enum(["ASC", "DESC"]).default("DESC").openapi({
        description: "Sort order (ASC for ascending, DESC for descending)",
        example: "ASC",
      }),
    }),
  },
  responses: {
    200: {
      description: "Paginated list of employees",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              data: z.array(CreateEmployeeSchema),
              pagination: z.object({
                page: z.number(),
                pageSize: z.number(),
                totalRecords: z.number(),
                totalPages: z.number(),
                hasNextPage: z.boolean(),
                hasPreviousPage: z.boolean(),
              }),
            }),
            statusCode: z.number(),
          }),
        },
      },
    },
  },
});

employeeRouter.get(
  "/:id",
  validateRequest(z.object({ params: z.object({ id: z.uuid() }) })),
  employeeController.getEmployeeById
);
employeeRegistry.registerPath({
  tags: ["Employee"],
  method: "get",
  path: "/employees/{id}",
  description: "Get employee by ID",
  request: {
    params: z.object({
      id: z.uuid(),
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

employeeRouter.patch(
  "/:id",
  validateRequest(z.object({ body: UpdateEmployeeSchema })),
  employeeController.updateEmployee
);
employeeRegistry.registerPath({
  tags: ["Employee"],
  method: "put",
  path: "/employees/{id}",
  description: "Update an employee",
  request: {
    params: z.object({
      id: z.uuid(),
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
  tags: ["Employee"],
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

employeeRouter.post(
  "/upload-csv",
  upload.single("file"),
  employeeController.createEmployeeByCsv
);

employeeRegistry.registerPath({
  tags: ["Employee"],
  method: "post",
  path: "/employees/upload-csv",
  description: "Upload a CSV file to batch-create employees",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            file: z
              .any()
              .openapi({
                type: "string",
                format: "binary",
              })
              .describe("CSV file containing employee records"),
          }),
        },
      },
    },
  },
  responses: {
    202: {
      description: "CSV received and processing started (queued)",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            totalRows: z.number().optional(),
            queued: z.number().optional(),
            invalidRows: z.number().optional(),
          }),
        },
      },
    },
    400: {
      description: "Invalid CSV file",
    },
  },
});
