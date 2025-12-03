import { useVirtualizer } from "@tanstack/react-virtual";
import { flexRender } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface VirtualizedTableProps {
  table: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function VirtualizedTable({
  table,
  containerRef,
}: VirtualizedTableProps) {
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 50,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  return (
    <div
      ref={containerRef}
      className="h-96 overflow-y-auto overflow-x-auto"
      style={{ contain: "layout style paint" }}
    >
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background">
          {table.getHeaderGroups().map((headerGroup: any) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header: any) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header as any,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {paddingTop > 0 && (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                style={{ height: `${paddingTop}px` }}
              />
            </TableRow>
          )}
          {virtualRows.map((virtualRow: any) => {
            const row = table.getRowModel().rows[virtualRow.index];
            return (
              <TableRow className="bg-white" key={row.id}>
                {row.getVisibleCells().map((cell: any) => (
                  <TableCell key={cell.id}>
                    {
                      flexRender(
                        cell.column.columnDef.cell as any,
                        cell.getContext()
                      ) as any
                    }
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
          {paddingBottom > 0 && (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                style={{ height: `${paddingBottom}px` }}
              />
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
