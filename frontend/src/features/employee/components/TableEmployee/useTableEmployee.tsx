import { useState, useMemo, useEffect, useCallback } from "react";
import debounce from "lodash.debounce";
import type { SortingState } from "@tanstack/react-table";
import { useGetEmployees } from "@/features/employee/api/get-employees";
import type { Params } from "@/types/api";
import { useNavigate } from "@tanstack/react-router";
import type { Employee } from "../../dto/employee";

type SortField = "name" | "position" | "age" | "salary" | "created_at";

export function useTableEmployee() {
  const [params, setParams] = useState<Params>({
    page: 1,
    pageSize: 50,
    sortBy: "created_at",
    sortOrder: "DESC",
    search: "",
  });

  const [searchInput, setSearchInput] = useState(params.search || "");
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, isLoading, error } = useGetEmployees(params);

  const employees = data?.data || [];
  const pagination = data?.pagination;
  const navigate = useNavigate();

  const updateSearchParam = useCallback((query: string) => {
    setParams((prev) => ({
      ...prev,
      page: 1,
      search: query || undefined,
    }));
  }, []);

  const debouncedSearch = useMemo(() => {
    return debounce(updateSearchParam, 500);
  }, [updateSearchParam]);

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchInput(query);
      debouncedSearch(query);
    },
    [debouncedSearch]
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Sorting
  const handleSort = useCallback(
    (field: SortField) => {
      setParams((prev) => ({
        ...prev,
        page: 1,
        sortBy: field,
        sortOrder:
          prev.sortBy === field && prev.sortOrder === "ASC" ? "DESC" : "ASC",
      }));
      setSorting([
        {
          id: field,
          desc: params.sortOrder === "DESC",
        },
      ]);
    },
    [params.sortOrder]
  );

  // Pagination
  const handlePageChange = useCallback((newPage: number) => {
    setParams((prev) => ({
      ...prev,
      page: newPage,
    }));
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setParams((prev) => ({
      ...prev,
      pageSize: newSize,
      page: 1,
    }));
  }, []);

  const handleRowClick = (employee: Employee) => {
    navigate({ to: `/home/employee/${employee.id}` });
  };

  return {
    employees,
    pagination,
    isLoading,
    error,
    params,
    sorting,
    searchInput,
    handleSearchChange,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    handleRowClick,
  };
}
