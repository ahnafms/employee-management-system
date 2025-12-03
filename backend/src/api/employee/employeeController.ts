import { Request, RequestHandler, Response } from "express";
import { EmployeeService } from "./employeeService";
import { EmployeeRepository } from "./employeeRepository";
import SingletonDb from "@/database";
import { Employee } from "@/database/entities/employeeEntity";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { CreateEmployeeSchema, UpdateEmployeeSchema } from "./employeeModel";
import z from "zod";

export class EmployeeController {
  private employeeService: EmployeeService;

  constructor() {
    const dataSource = SingletonDb.getConnection();
    const employeeRepository = new EmployeeRepository(
      dataSource.getRepository(Employee)
    );
    this.employeeService = new EmployeeService(employeeRepository);
  }

  public createEmployee: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    try {
      const validatedBody = CreateEmployeeSchema.parse(req.body);
      const employee = await this.employeeService.createEmployee(validatedBody);
      return res
        .status(201)
        .json(ServiceResponse.success<Employee>("Employee created", employee));
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
}

export const employeeController = new EmployeeController();
