import { Employee } from "@/database/entities/employeeEntity";
import { EmployeeRepository } from "./employeeRepository";

export class EmployeeService {
  constructor(private repo: EmployeeRepository) {}

  async createEmployee(employee: Partial<Employee>): Promise<Employee> {
    return this.repo.createEmployee(employee);
  }

  async getAllEmployees(): Promise<Employee[]> {
    return this.repo.findAll();
  }

  async getEmployeeById(id: string): Promise<Employee | null> {
    return this.repo.findById(id);
  }

  async updateEmployee(
    id: string,
    data: Partial<Employee>
  ): Promise<Employee | null> {
    return this.repo.updateEmployee(id, data);
  }

  async deleteEmployee(id: string): Promise<boolean> {
    return this.repo.deleteEmployee(id);
  }

  async bulkCreateEmployees(
    employees: Partial<Employee>[]
  ): Promise<Employee[]> {
    // 🎯 Delegate the array insertion to the repository layer.
    return this.repo.bulkCreateEmployees(employees);
  }
}
