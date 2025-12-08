// src/components/Table.tsx

import React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  type Row,
  useReactTable,
} from "@tanstack/react-table";

interface TableProps<TData extends object> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];

  // ✅ NEW: Optional right-click hook
  onRowRightClick?: (e: React.MouseEvent, row: Row<TData>) => void;
}

export default function Table<TData extends object>({
  data,
  columns,
  onRowRightClick, // ✅ NEW
}: TableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-300">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="px-4 py-2 text-left font-semibold text-gray-700 select-none cursor-pointer"
                >
                  <div className="flex items-center gap-1">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}

                    {{
                      asc: "▲",
                      desc: "▼",
                    }[header.column.getIsSorted() as string] ?? ""}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody className="divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="hover:bg-gray-50 transition-colors"

              // ✅ RIGHT-CLICK SUPPORT
              onContextMenu={(e) => onRowRightClick?.(e, row)}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2">
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
