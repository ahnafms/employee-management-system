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
    return Boolean(result.affected);
  }

  async findByName(name: string): Promise<Employee | null> {
    return this.employeeRepository.findOne({ where: { name } });
  }

  async bulkCreateEmployees(
    employees: Partial<Employee>[]
  ): Promise<Employee[]> {
    const result = await this.employeeRepository.insert(employees);
    return employees as Employee[];
  }

  async findWithPagination(
    page: number,
    pageSize: number,
    search?: string,
    sortBy: string = "created_at",
    sortOrder: "ASC" | "DESC" = "DESC"
  ): Promise<{ data: Employee[]; totalRecords: number }> {
    let query = this.employeeRepository.createQueryBuilder("employee");

    // Apply search filter
    if (search && search.trim()) {
      query = query.where(
        "employee.name ILIKE :search OR employee.position ILIKE :search",
        { search: `%${search}%` }
      );
    }

    // Get total records before pagination
    const totalRecords = await query.getCount();

    // Apply sorting
    const validSortFields = ["name", "position", "age", "salary", "created_at"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at";
    query = query.orderBy(
      `employee.${sortField}`,
      sortOrder === "ASC" ? "ASC" : "DESC"
    );

    // Apply pagination
    const skip = (page - 1) * pageSize;
    query = query.skip(skip).take(pageSize);

    const data = await query.getMany();

    return { data, totalRecords };
  }
}
