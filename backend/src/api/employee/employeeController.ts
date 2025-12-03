import { Request, RequestHandler, Response } from "express";
import { EmployeeService } from "./employeeService";
import SingletonDb from "@/database";
import { Employee } from "@/database/entities/employeeEntity";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { CreateEmployeeSchema, UpdateEmployeeSchema } from "./employeeModel";
import z from "zod";
import { EmployeeQueue } from "./queue/employeeQueue";
import { EmployeeRepository } from "./employeeRepository";

export class EmployeeController {
  private employeeService: EmployeeService;
  private employeeQueue: EmployeeQueue;

  constructor() {
    const dataSource = SingletonDb.getConnection();
    const employeeRepository = new EmployeeRepository(
      dataSource.getRepository(Employee)
    );

    this.employeeService = new EmployeeService(employeeRepository);
    this.employeeQueue = new EmployeeQueue();
  }

  public createEmployee: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    try {
      const validatedBody = CreateEmployeeSchema.parse(req.body);
      await this.employeeQueue.enqueueCreateEmployee(validatedBody);
      return res
        .status(201)
        .json(ServiceResponse.success("Employee queue created", {}));
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid request",
          errors: err,
        });
      }
      return res.status(500).json({ message: (err as Error).message });
    }
  };

  public getAllEmployees: RequestHandler = async (
    _req: Request,
    res: Response
  ) => {
    try {
      const employees = await this.employeeService.getAllEmployees();
      return res.json(
        ServiceResponse.success<Employee[]>("Employees fetched", employees)
      );
    } catch (err) {
      return res.status(500).json({ message: (err as Error).message });
    }
  };

  public getEmployeeById: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    try {
      const employee = await this.employeeService.getEmployeeById(
        req.params.id
      );
      if (!employee)
        return res.status(404).json({ message: "Employee not found" });
      return res.json(
        ServiceResponse.success<Employee>("Employee fetched", employee)
      );
    } catch (err) {
      return res.status(500).json({ message: (err as Error).message });
    }
  };

  public updateEmployee: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    try {
      const validatedBody = UpdateEmployeeSchema.parse(req.body);
      const updatedEmployee = await this.employeeService.updateEmployee(
        req.params.id,
        validatedBody
      );
      if (!updatedEmployee)
        return res.status(404).json({ message: "Employee not found" });
      return res.json(
        ServiceResponse.success<Employee>("Employee updated", updatedEmployee)
      );
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid request",
          errors: err,
        });
      }
      return res.status(500).json({ message: (err as Error).message });
    }
  };

  public deleteEmployee: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    try {
      const success = await this.employeeService.deleteEmployee(req.params.id);
      if (!success)
        return res.status(404).json({ message: "Employee not found" });
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ message: (err as Error).message });
    }
  };

  // ... inside the EmployeeController class ...

  public createEmployeeByCsv: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    // ⚠️ The `multer` middleware (upload.single("file")) populates `req.file`
    // when using diskStorage, not `req.body.file`. We must cast the type.
    const file = (req as any).file as Express.Multer.File;

    try {
      if (!file) {
        return res.status(400).json({ message: "CSV file is required." });
      }

      // 1. Basic validation (optional: check file type, size, etc.)
      if (
        file.mimetype !== "text/csv" &&
        file.mimetype !== "application/vnd.ms-excel"
      ) {
        // You might also want to delete the file if it's the wrong type
        return res
          .status(400)
          .json({ message: "Invalid file type. Only CSV files are accepted." });
      }

      // 2. Enqueue the job with the temporary file path.
      // The queue worker will read the file from this path as a stream.
      // We assume your queue method accepts the temporary file path.
      await this.employeeQueue.enqueueEmployeeCsv(file.path);

      // 3. Return 202 Accepted immediately.
      // The client knows the request was valid and processing has started.
      return res.status(202).json(
        ServiceResponse.success("Employee CSV processing started (queued)", {
          fileName: file.originalname,
          filePath: file.path, // Optional: for debugging
        })
      );
    } catch (err) {
      // If an error occurs (e.g., file system error, queue connection issue)
      return res.status(500).json({ message: (err as Error).message });
    }
  };

  // ...
}

export const employeeController = new EmployeeController();
