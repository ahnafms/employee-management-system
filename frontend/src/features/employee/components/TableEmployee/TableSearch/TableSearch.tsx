import { Input } from "@/components/ui/input";

interface TableSearchProps {
  searchInput: string;
  onSearchChange: (query: string) => void;
  totalRecords?: number;
  currentCount?: number;
}

export function TableSearch({
  searchInput,
  onSearchChange,
  totalRecords,
  currentCount,
}: TableSearchProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Employees</h2>

      <div className="flex gap-2">
        <Input
          placeholder="Search by name or position..."
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 max-w-sm"
        />
      </div>

      {totalRecords !== undefined && (
        <div className="text-sm text-muted-foreground">
          Showing {currentCount || 0} of {totalRecords} total employees
        </div>
      )}
    </div>
  );
}
