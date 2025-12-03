import { Employee } from "@/database/entities/employeeEntity";
import { EmployeeRepository } from "./employeeRepository";
import { PaginatedResponse } from "./employeeModel";

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
    return this.repo.bulkCreateEmployees(employees);
  }

  async getEmployeesWithPagination(
    page: number,
    pageSize: number,
    search?: string,
    sortBy?: string,
    sortOrder?: "ASC" | "DESC"
  ): Promise<PaginatedResponse<Employee>> {
    const { data, totalRecords } = await this.repo.findWithPagination(
      page,
      pageSize,
      search,
      sortBy,
      sortOrder
    );

    const totalPages = Math.ceil(totalRecords / pageSize);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data,
      pagination: {
        page,
        pageSize,
        totalRecords,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }
}
