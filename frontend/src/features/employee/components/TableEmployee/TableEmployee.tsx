import { useRef } from "react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { Loader2, AlertCircle } from "lucide-react";
import { useTableEmployee } from "./useTableEmployee";
import { createEmployeeColumns } from "./EmployeeTableColumns";
import { VirtualizedTable } from "./VirtualizedTable";
import { TablePagination } from "./TablePagination";
import { TableSearch } from "./TableSearch";
import {
  DialogEditEmployee,
  type DialogEditEmployeeRef,
} from "./DialogEditEmployee";
import {
  DialogDeleteEmployee,
  type DialogDeleteEmployeeRef,
} from "./DialogDeleteEmployee";
import type { Employee } from "@/features/employee/dto/employee";

export function TableEmployee() {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const editDialogRef = useRef<DialogEditEmployeeRef>(null);
  const deleteDialogRef = useRef<DialogDeleteEmployeeRef>(null);

  const {
    employees,
    pagination,
    isLoading,
    error,
    params,
    sorting,
    handleSearchChange,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    searchInput,
  } = useTableEmployee();

  const handleEditClick = (employee: Employee) => {
    editDialogRef.current?.openDialog(employee);
  };

  const handleDeleteClick = (employee: Employee) => {
    deleteDialogRef.current?.openDialog(employee);
  };

  const columns = createEmployeeColumns({
    params,
    loadingIds: [],
    onSort: handleSort,
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
  });

  const table = useReactTable({
    data: employees,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="w-full flex flex-col gap-4 p-4">
      {/* Search Section */}
      <TableSearch
        searchInput={searchInput}
        onSearchChange={handleSearchChange}
        totalRecords={pagination?.totalRecords}
        currentCount={employees.length}
      />

      {/* Table Section */}
      <div className="border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading employees...</span>
          </div>
        ) : error ? (
          <div className="flex h-64 items-center justify-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>Error loading employees: {error.message}</span>
          </div>
        ) : employees.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            No employees found
          </div>
        ) : (
        <VirtualizedTable table={table} containerRef={tableContainerRef} />
        )}
      </div>

      {/* Pagination Section */}
      {pagination && (
        <TablePagination
          pagination={pagination}
          currentPage={params.page || 1}
          currentPageSize={params.pageSize || 50}
          isLoading={isLoading}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      <DialogEditEmployee ref={editDialogRef} />
      <DialogDeleteEmployee ref={deleteDialogRef} />
    </div>
  );
}
