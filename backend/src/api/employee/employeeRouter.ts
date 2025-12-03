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

extendZodWithOpenApi(z);

export const employeeRouter: Router = express.Router();
export const employeeRegistry = new OpenAPIRegistry();

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

employeeRouter.post(
  "/upload-csv",
  upload.single("file"),
  employeeController.createEmployeeByCsv
);

employeeRegistry.registerPath({
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
