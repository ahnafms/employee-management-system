import express, { type Router } from "express";
import { employeeController } from "./employeeController";
import { validateRequest } from "@/common/utils/httpHandlers";
import { CreateEmployeeSchema, UpdateEmployeeSchema } from "./employeeModel";

export const employeeRouter: Router = express.Router();

//!TODO: Protect all routes with authentication
// employeeRouter.use(authMiddleware);

employeeRouter.post(
  "/",
  validateRequest(CreateEmployeeSchema),
  employeeController.createEmployee
);

employeeRouter.get("/", employeeController.getAllEmployees);

employeeRouter.get("/:id", employeeController.getEmployeeById);

employeeRouter.put(
  "/:id",
  validateRequest(UpdateEmployeeSchema),
  employeeController.updateEmployee
);

employeeRouter.delete("/:id", employeeController.deleteEmployee);
