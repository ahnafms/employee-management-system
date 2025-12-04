import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
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

  it("should handle search change", async () => {
    const { result } = renderHook(() => useTableEmployee());

    act(() => {
      result.current.handleSearchChange("John");
    });

    await waitFor(() => {
      expect(result.current.searchInput).toBe("John");
    });
  });

  it("should reset page to 1 on search", async () => {
    const { result } = renderHook(() => useTableEmployee());

    act(() => {
      result.current.handlePageChange(2);
    });
    await waitFor(() => {
      expect(result.current.params.page).toBe(2);
    });

    act(() => {
      result.current.handleSearchChange("test");
    });
    await waitFor(() => {
      expect(result.current.params.page).toBe(1);
    });
  });

  it("should handle sorting by field", async () => {
    const { result } = renderHook(() => useTableEmployee());

    act(() => {
      result.current.handleSort("name");
    });

    await waitFor(() => {
      expect(result.current.params.sortBy).toBe("name");
      expect(result.current.params.sortOrder).toBe("ASC");
    });
  });

  it("should toggle sort order on same field", async () => {
    const { result } = renderHook(() => useTableEmployee());

    act(() => {
      result.current.handleSort("name");
    });
    await waitFor(() => {
      expect(result.current.params.sortOrder).toBe("ASC");
    });

    act(() => {
      result.current.handleSort("name");
    });
    await waitFor(() => {
      expect(result.current.params.sortOrder).toBe("DESC");
    });
  });

  it("should reset page to 1 on sort", async () => {
    const { result } = renderHook(() => useTableEmployee());

    act(() => {
      result.current.handlePageChange(2);
    });
    await waitFor(() => {
      expect(result.current.params.page).toBe(2);
    });

    act(() => {
      result.current.handleSort("salary");
    });
    await waitFor(() => {
      expect(result.current.params.page).toBe(1);
    });
  });

  it("should handle page change", async () => {
    const { result } = renderHook(() => useTableEmployee());

    act(() => {
      result.current.handlePageChange(3);
    });

    await waitFor(() => {
      expect(result.current.params.page).toBe(3);
    });
  });

  it("should handle page size change", async () => {
    const { result } = renderHook(() => useTableEmployee());

    act(() => {
      result.current.handlePageSizeChange(100);
    });

    await waitFor(() => {
      expect(result.current.params.pageSize).toBe(100);
    });
  });

  it("should reset page to 1 on page size change", async () => {
    const { result } = renderHook(() => useTableEmployee());

    act(() => {
      result.current.handlePageChange(2);
    });
    await waitFor(() => {
      expect(result.current.params.page).toBe(2);
    });

    act(() => {
      result.current.handlePageSizeChange(100);
    });
    await waitFor(() => {
      expect(result.current.params.page).toBe(1);
    });
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
});
