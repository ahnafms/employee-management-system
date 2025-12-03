import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Pagination {
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface TablePaginationProps {
  pagination: Pagination;
  currentPage: number;
  currentPageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function TablePagination({
  pagination,
  currentPage,
  currentPageSize,
  isLoading,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <span className="text-xs">
          ({pagination.totalRecords} total records)
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Per page:</label>
          <select
            value={currentPageSize}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
            disabled={isLoading}
            className="px-2 py-1 rounded border text-sm bg-background disabled:opacity-50"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={!pagination.hasPreviousPage || isLoading}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1 px-2">
            <span className="text-sm">Page:</span>
            <Input
              type="number"
              min="1"
              max={pagination.totalPages}
              value={currentPage}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val >= 1 && val <= pagination.totalPages) {
                  onPageChange(val);
                }
              }}
              disabled={isLoading}
              className="w-12 h-8 text-center text-sm disabled:opacity-50"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!pagination.hasNextPage || isLoading}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
