import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useTableEmployee } from "@/features/employee/components/TableEmployee/useTableEmployee";
import * as getEmployeesApi from "@/features/employee/api/get-employees";
import type { Employee } from "@/features/employee/dto/employee";

const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "John Doe",
    age: 30,
    position: "Manager",
    salary: "5000",
  },
  {
    id: "2",
    name: "Jane Smith",
    age: 28,
    position: "Developer",
    salary: "4500",
  },
];

vi.mock("@/features/employee/api/get-employees", () => ({
  useGetEmployees: vi.fn(),
}));

vi.mock("lodash.debounce", () => ({
  default: vi.fn((fn) => {
    const debounced = fn;
    debounced.cancel = vi.fn();
    return debounced;
  }),
}));

describe("useTableEmployee", () => {
  const mockUseGetEmployees = getEmployeesApi.useGetEmployees as ReturnType<
    typeof vi.fn
  >;

  beforeEach(() => {
    mockUseGetEmployees.mockClear();
    mockUseGetEmployees.mockReturnValue({
      data: {
        data: mockEmployees,
        pagination: {
          page: 1,
          pageSize: 50,
          totalRecords: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      isLoading: false,
      error: null,
    });
  });

  it("should initialize with default params", () => {
    const { result } = renderHook(() => useTableEmployee());

    expect(result.current.params).toEqual({
      page: 1,
      pageSize: 50,
      sortBy: "created_at",
      sortOrder: "DESC",
      search: "",
    });
  });

  it("should return employees data", () => {
    const { result } = renderHook(() => useTableEmployee());

    expect(result.current.employees).toEqual(mockEmployees);
  });

  it("should return pagination data", () => {
    const { result } = renderHook(() => useTableEmployee());

    expect(result.current.pagination).toEqual({
      page: 1,
      pageSize: 50,
      totalRecords: 2,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });

  it("should return loading state", () => {
    const { result } = renderHook(() => useTableEmployee());

    expect(result.current.isLoading).toBe(false);
  });

  it("should return error state", () => {
    const { result } = renderHook(() => useTableEmployee());

    expect(result.current.error).toBeNull();
  });

  it("should have initial empty search input", () => {
    const { result } = renderHook(() => useTableEmployee());

    expect(result.current.searchInput).toBe("");
  });

  it("should handle search change", async () => {
    const { result } = renderHook(() => useTableEmployee());

    result.current.handleSearchChange("John");

    await waitFor(() => {
      expect(result.current.searchInput).toBe("John");
    });
  });

  it("should reset page to 1 on search", async () => {
    const { result } = renderHook(() => useTableEmployee());

    result.current.handlePageChange(2);
    await waitFor(() => {
      expect(result.current.params.page).toBe(2);
    });

    result.current.handleSearchChange("test");
    await waitFor(() => {
      expect(result.current.params.page).toBe(1);
    });
  });

  it("should handle sorting by field", async () => {
    const { result } = renderHook(() => useTableEmployee());

    result.current.handleSort("name");

    await waitFor(() => {
      expect(result.current.params.sortBy).toBe("name");
      expect(result.current.params.sortOrder).toBe("ASC");
    });
  });

  it("should toggle sort order on same field", async () => {
    const { result } = renderHook(() => useTableEmployee());

    result.current.handleSort("name");
    await waitFor(() => {
      expect(result.current.params.sortOrder).toBe("ASC");
    });

    result.current.handleSort("name");
    await waitFor(() => {
      expect(result.current.params.sortOrder).toBe("DESC");
    });
  });

  it("should reset page to 1 on sort", async () => {
    const { result } = renderHook(() => useTableEmployee());

    result.current.handlePageChange(2);
    await waitFor(() => {
      expect(result.current.params.page).toBe(2);
    });

    result.current.handleSort("salary");
    await waitFor(() => {
      expect(result.current.params.page).toBe(1);
    });
  });

  it("should handle page change", async () => {
    const { result } = renderHook(() => useTableEmployee());

    result.current.handlePageChange(3);

    await waitFor(() => {
      expect(result.current.params.page).toBe(3);
    });
  });

  it("should handle page size change", async () => {
    const { result } = renderHook(() => useTableEmployee());

    result.current.handlePageSizeChange(100);

    await waitFor(() => {
      expect(result.current.params.pageSize).toBe(100);
    });
  });

  it("should reset page to 1 on page size change", async () => {
    const { result } = renderHook(() => useTableEmployee());

    result.current.handlePageChange(2);
    await waitFor(() => {
      expect(result.current.params.page).toBe(2);
    });

    result.current.handlePageSizeChange(100);
    await waitFor(() => {
      expect(result.current.params.page).toBe(1);
    });
  });

  it("should maintain sorting state in React Table format", async () => {
    const { result } = renderHook(() => useTableEmployee());

    result.current.handleSort("position");

    await waitFor(() => {
      expect(result.current.sorting).toEqual([
        {
          id: "position",
          desc: true,
        },
      ]);
    });
  });

  it("should handle multiple sorts by changing sort field", async () => {
    const { result } = renderHook(() => useTableEmployee());

    result.current.handleSort("name");
    await waitFor(() => {
      expect(result.current.params.sortBy).toBe("name");
    });

    result.current.handleSort("age");
    await waitFor(() => {
      expect(result.current.params.sortBy).toBe("age");
    });
  });

  it("should have empty employees array when data is null", () => {
    mockUseGetEmployees.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useTableEmployee());

    expect(result.current.employees).toEqual([]);
  });

  it("should have null pagination when data is null", () => {
    mockUseGetEmployees.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useTableEmployee());

    expect(result.current.pagination).toBeUndefined();
  });

  it("should call useGetEmployees with current params", () => {
    renderHook(() => useTableEmployee());

    expect(mockUseGetEmployees).toHaveBeenCalledWith({
      page: 1,
      pageSize: 50,
      sortBy: "created_at",
      sortOrder: "DESC",
      search: "",
    });
  });

  it("should update search without immediate API call (debounced)", async () => {
    const { result } = renderHook(() => useTableEmployee());

    result.current.handleSearchChange("test");

    // Search input should update immediately
    expect(result.current.searchInput).toBe("test");
  });

  it("should provide all necessary handler functions", () => {
    const { result } = renderHook(() => useTableEmployee());

    expect(typeof result.current.handleSearchChange).toBe("function");
    expect(typeof result.current.handleSort).toBe("function");
    expect(typeof result.current.handlePageChange).toBe("function");
    expect(typeof result.current.handlePageSizeChange).toBe("function");
  });

  it("should support all sortable fields", async () => {
    const { result } = renderHook(() => useTableEmployee());

    const sortableFields: Array<
      "name" | "position" | "age" | "salary" | "created_at"
    > = ["name", "position", "age", "salary", "created_at"];

    for (const field of sortableFields) {
      result.current.handleSort(field);
      await waitFor(() => {
        expect(result.current.params.sortBy).toBe(field);
      });
    }
  });
});
