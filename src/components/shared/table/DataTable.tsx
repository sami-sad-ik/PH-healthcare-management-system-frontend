import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

interface DataTableActions<TData> {
  onView?: (row: TData) => void;
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
}

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  actions?: DataTableActions<TData>;
  emptyMessage?: string;
  isLoading?: boolean;
}

const DataTable = <TData,>({
  data,
  columns,
  actions,
  emptyMessage,
  isLoading,
}: DataTableProps<TData>) => {
  const tableColumns: ColumnDef<TData>[] = actions
    ? [
        ...columns,
        {
          id: "actions",
          header: "Actions",
          cell: ({ row }) => {
            const rowData = row.original;
            return (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {actions.onView && (
                    <DropdownMenuItem onClick={() => actions.onView!(rowData)}>
                      View
                    </DropdownMenuItem>
                  )}
                  {actions.onEdit && (
                    <DropdownMenuItem onClick={() => actions.onEdit!(rowData)}>
                      Edit
                    </DropdownMenuItem>
                  )}
                  {actions.onDelete && (
                    <DropdownMenuItem
                      onClick={() => actions.onDelete!(rowData)}>
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          },
        },
      ]
    : columns;

  const { getHeaderGroups, getRowModel } = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
          <span className="text-gray-500">Loading...</span>
        </div>
      )}
      {/* table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {getHeaderGroups().map((hg) => {
              return (
                <TableRow key={hg.id}>
                  {hg.headers.map(
                    (
                      header, // map over the hg headers array
                    ) => (
                      <TableHead key={header.id}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </TableHead>
                    ),
                  )}
                </TableRow>
              );
            })}
          </TableHeader>
          <TableBody>
            {getRowModel().rows.length ? (
              getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center">
                  {emptyMessage || "No data available."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DataTable;
