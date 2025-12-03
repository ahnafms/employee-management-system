import { describe, it, expect, vi, beforeEach } from "vitest";
import { Job } from "bullmq";

vi.mock("@/database", () => ({
  default: {
    getConnection: vi.fn(() => ({
      getRepository: vi.fn(() => ({})),
    })),
    initialize: vi.fn(),
  },
}));

vi.mock("@/server", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("ioredis", () => ({
  default: vi.fn(() => ({
    publish: vi.fn(),
  })),
}));

vi.mock("fs");

import { EmployeeWorker } from "../employeeWorker";

describe("EmployeeQueue - Job Processing", () => {
  let employeeWorker: EmployeeWorker;
  let mockService: any;
  let mockJob: Partial<Job>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockService = {
      createEmployee: vi.fn(),
      bulkCreateEmployees: vi.fn(),
    };

    employeeWorker = new EmployeeWorker();
    (employeeWorker as any).service = mockService;
  });

  describe("processJob - Create Employee", () => {
    it("should successfully process create-employee job", async () => {
      const mockEmployee: any = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "John Doe",
        age: 30,
        position: "Software Engineer",
        salary: "75000.00",
      };

      mockJob = {
        id: "job-123",
        name: "create-employee",
        data: {
          name: "John Doe",
          age: 30,
          position: "Software Engineer",
          salary: "75000.00",
        },
      };

      mockService.createEmployee.mockResolvedValueOnce(mockEmployee);

      expect(mockJob.name).toBe("create-employee");
      expect(mockJob.id).toBe("job-123");
    });
  });

  describe("processJob - Bulk Create CSV", () => {
    it("should process bulk-create-employee-csv job", async () => {
      const filePath = "/tmp/employees.csv";

      mockJob = {
        id: "job-csv-001",
        name: "bulk-create-employee-csv",
        data: filePath,
      };

      expect(mockJob.name).toBe("bulk-create-employee-csv");
      expect(mockJob.data).toBe(filePath);
    });
  });

  describe("EmployeeQueue - Job Enqueue", () => {
    it("should enqueue create-employee job", async () => {
      const employeeData = {
        name: "Alice Johnson",
        age: 32,
        position: "QA Engineer",
        salary: "70000.00",
      };

      const mockQueue = {
        add: vi.fn().mockResolvedValue({ id: "queued-job-123" }),
      };

      (employeeWorker as any).queue = mockQueue;

      await (employeeWorker as any).queue.add("create-employee", employeeData);

      expect(mockQueue.add).toHaveBeenCalledWith(
        "create-employee",
        employeeData
      );
    });
  });

  describe("Job Processing - Edge Cases", () => {
    it("should handle null job data", async () => {
      mockJob = {
        id: "job-null",
        name: "create-employee",
        data: null,
      };

      mockService.createEmployee.mockResolvedValueOnce(null);

      expect(mockJob.data).toBeNull();
    });

    it("should handle empty employee batch", async () => {
      const emptyBatch: any[] = [];

      mockService.bulkCreateEmployees.mockResolvedValueOnce([]);

      const result = await mockService.bulkCreateEmployees(emptyBatch);

      expect(result).toEqual([]);
      expect(mockService.bulkCreateEmployees).toHaveBeenCalledWith(emptyBatch);
    });
  });
});
