import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/database", () => ({
  default: {
    getConnection: vi.fn(),
    initialize: vi.fn(),
  },
}));

vi.mock("@/server", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

import { EmployeeService } from "../employeeService";

describe("EmployeeService - CRUD Operations", () => {
  let employeeService: EmployeeService;
  let mockRepository: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRepository = {
      createEmployee: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findWithPagination: vi.fn(),
      updateEmployee: vi.fn(),
      deleteEmployee: vi.fn(),
      bulkCreateEmployees: vi.fn(),
    };

    employeeService = new EmployeeService(mockRepository);
  });

  describe("createEmployee", () => {
    it("should successfully create a new employee", async () => {
      const newEmployee: any = {
        name: "John Doe",
        age: 30,
        position: "Software Engineer",
        salary: "75000.00",
      };

      const createdEmployee: any = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        ...newEmployee,
      };

      mockRepository.createEmployee.mockResolvedValueOnce(createdEmployee);

      const result = await employeeService.createEmployee(newEmployee);

      expect(mockRepository.createEmployee).toHaveBeenCalledWith(newEmployee);
      expect(result).toEqual(createdEmployee);
    });
  });

  describe("getEmployeeById", () => {
    it("should return an employee by ID", async () => {
      const employeeId = "123e4567-e89b-12d3-a456-426614174000";
      const mockEmployee: any = {
        id: employeeId,
        name: "John Doe",
        age: 30,
        position: "Software Engineer",
        salary: "75000.00",
      };

      mockRepository.findById.mockResolvedValueOnce(mockEmployee);

      const result = await employeeService.getEmployeeById(employeeId);

      expect(mockRepository.findById).toHaveBeenCalledWith(employeeId);
      expect(result).toEqual(mockEmployee);
    });

    it("should return null for non-existent employee", async () => {
      mockRepository.findById.mockResolvedValueOnce(null);

      const result = await employeeService.getEmployeeById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("getAllEmployees", () => {
    it("should return all employees", async () => {
      const mockEmployees: any[] = [
        {
          id: "id1",
          name: "John Doe",
          age: 30,
          position: "Software Engineer",
          salary: "75000.00",
        },
        {
          id: "id2",
          name: "Jane Doe",
          age: 28,
          position: "Product Manager",
          salary: "80000.00",
        },
      ];

      mockRepository.findAll.mockResolvedValueOnce(mockEmployees);

      const result = await employeeService.getAllEmployees();

      expect(result).toEqual(mockEmployees);
      expect(result.length).toBe(2);
    });
  });

  describe("getEmployeesWithPagination", () => {
    it("should return paginated employees", async () => {
      const mockEmployees: any[] = [
        {
          id: "id1",
          name: "John Doe",
          age: 30,
          position: "Software Engineer",
          salary: "75000.00",
        },
      ];

      mockRepository.findWithPagination.mockResolvedValueOnce({
        data: mockEmployees,
        totalRecords: 100,
      });

      const result = await employeeService.getEmployeesWithPagination(1, 10);

      expect(result.data).toEqual(mockEmployees);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.totalRecords).toBe(100);
      expect(result.pagination.totalPages).toBe(10);
    });

    it("should apply search filter", async () => {
      mockRepository.findWithPagination.mockResolvedValueOnce({
        data: [],
        totalRecords: 0,
      });

      await employeeService.getEmployeesWithPagination(1, 10, "Engineer");

      expect(mockRepository.findWithPagination).toHaveBeenCalledWith(
        1,
        10,
        "Engineer",
        undefined,
        undefined
      );
    });

    it("should apply sorting", async () => {
      mockRepository.findWithPagination.mockResolvedValueOnce({
        data: [],
        totalRecords: 0,
      });

      await employeeService.getEmployeesWithPagination(
        1,
        10,
        undefined,
        "salary",
        "DESC"
      );

      expect(mockRepository.findWithPagination).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        "salary",
        "DESC"
      );
    });
  });

  describe("updateEmployee", () => {
    it("should successfully update an employee", async () => {
      const employeeId = "123e4567-e89b-12d3-a456-426614174000";
      const updateData = { position: "Senior Software Engineer" };
      const updatedEmployee: any = {
        id: employeeId,
        ...updateData,
      };

      mockRepository.updateEmployee.mockResolvedValueOnce(updatedEmployee);

      const result = await employeeService.updateEmployee(
        employeeId,
        updateData
      );

      expect(mockRepository.updateEmployee).toHaveBeenCalledWith(
        employeeId,
        updateData
      );
      expect(result).toEqual(updatedEmployee);
    });
  });

  describe("deleteEmployee", () => {
    it("should successfully delete an employee", async () => {
      mockRepository.deleteEmployee.mockResolvedValueOnce(true);

      const result = await employeeService.deleteEmployee("123");

      expect(result).toBe(true);
    });
  });

  describe("bulkCreateEmployees", () => {
    it("should successfully bulk create employees", async () => {
      const employees: any[] = [
        { name: "Employee 1", age: 25 },
        { name: "Employee 2", age: 26 },
      ];

      const createdEmployees: any[] = employees.map((emp, idx) => ({
        id: `id${idx}`,
        ...emp,
      }));

      mockRepository.bulkCreateEmployees.mockResolvedValueOnce(
        createdEmployees
      );

      const result = await employeeService.bulkCreateEmployees(employees);

      expect(result).toEqual(createdEmployees);
      expect(result.length).toBe(2);
    });
  });
});
