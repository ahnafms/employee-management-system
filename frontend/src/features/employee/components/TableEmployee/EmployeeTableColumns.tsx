import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, ChevronsUpDown, Loader2 } from "lucide-react";
import type { Employee } from "@/features/employee/dto/employee";

type SortField = "name" | "position" | "age" | "salary" | "created_at";

interface CreateEmployeeColumnsProps {
  params: {
    sortBy?: SortField;
    sortOrder?: "ASC" | "DESC";
  };
  loadingIds: string[];
  onSort: (field: SortField) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export function createEmployeeColumns(
  props: CreateEmployeeColumnsProps
): ColumnDef<Employee>[] {
  const { params, loadingIds, onSort, onEdit, onDelete } = props;

  return [
    {
      accessorFn: (row) => row.id,
      accessorKey: "id",
      header: () => (
        <div className="flex w-full">
          <button
            onClick={() => onSort("created_at")}
            className="flex items-center justify-center hover:text-foreground cursor-pointer"
          >
            ID
            <SortIcon
              field="created_at"
              currentField={params.sortBy}
              sortOrder={params.sortOrder}
            />
          </button>
        </div>
      ),
      cell: (info) => (
        <span className="text-right text-xs text-muted-foreground">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: () => (
        <button
          onClick={() => onSort("name")}
          className="flex items-center hover:text-foreground cursor-pointer w-full"
        >
          Name
          <SortIcon
            field="name"
            currentField={params.sortBy}
            sortOrder={params.sortOrder}
          />
        </button>
      ),
      cell: (info) => (
        <span className="font-medium">{info.getValue() as string}</span>
      ),
    },
    {
      accessorKey: "age",
      header: () => (
        <button
          onClick={() => onSort("age")}
          className="flex items-center hover:text-foreground cursor-pointer w-full"
        >
          Age
          <SortIcon
            field="age"
            currentField={params.sortBy}
            sortOrder={params.sortOrder}
          />
        </button>
      ),
    },
    {
      accessorKey: "position",
      header: () => (
        <button
          onClick={() => onSort("position")}
          className="flex items-center hover:text-foreground cursor-pointer w-full"
        >
          Position
          <SortIcon
            field="position"
            currentField={params.sortBy}
            sortOrder={params.sortOrder}
          />
        </button>
      ),
    },
    {
      accessorKey: "salary",
      header: () => (
        <button
          onClick={() => onSort("salary")}
          className="flex items-center hover:text-foreground cursor-pointer w-full"
        >
          Salary
          <SortIcon
            field="salary"
            currentField={params.sortBy}
            sortOrder={params.sortOrder}
          />
        </button>
      ),
      cell: (info) => (
        <span>
          IDR{" "}
          {Number(info.getValue()).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const employee = row.original;
        const isLoading = loadingIds.includes(employee.id);

        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(employee)}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Edit
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="text-red-600"
              onClick={() => onDelete(employee)}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Delete
            </Button>
          </div>
        );
      },
    },
  ];
}

const SortIcon = ({
  field,
  currentField,
  sortOrder,
}: {
  field: SortField;
  currentField?: SortField;
  sortOrder?: "ASC" | "DESC";
}) => {
  if (currentField === field) {
    return sortOrder === "ASC" ? (
      <ChevronUp className="w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1" />
    );
  }
  return <ChevronsUpDown className="w-4 h-4 ml-1 text-muted-foreground" />;
};
