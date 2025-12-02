import { Employee } from "@/database/entities/employeeEntity";
import { Repository } from "typeorm";

export class EmployeeRepository {
  private readonly employeeRepository: Repository<Employee>;

  constructor(repository: Repository<Employee>) {
    this.employeeRepository = repository;
  }

  async createEmployee(employee: Partial<Employee>): Promise<Employee> {
    return this.employeeRepository.save(employee);
  }

  async findById(id: string): Promise<Employee | null> {
    return this.employeeRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.find({
      order: { created_at: "DESC" },
    });
  }

  async updateEmployee(
    id: string,
    data: Partial<Employee>
  ): Promise<Employee | null> {
    const employee = await this.findById(id);
    if (!employee) return null;

    Object.assign(employee, data);
    return this.employeeRepository.save(employee);
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const result = await this.employeeRepository.delete(id);
    return result.affected !== undefined && result.affected > 0;
  }

  async findByName(name: string): Promise<Employee | null> {
    return this.employeeRepository.findOne({ where: { name } });
  }
}
