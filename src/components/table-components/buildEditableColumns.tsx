import type { ColumnDef } from "@tanstack/react-table";

export function buildEditableColumns<TData extends Record<string, unknown>>(
  cols: ColumnDef<TData, unknown>[],
  editableFields: (keyof TData)[],
  onChange: (
    rowIndex: number,
    field: keyof TData,
    value: unknown
  ) => void
): ColumnDef<TData, unknown>[] {
  return cols.map((col) => {
    const accessor =
      "accessorKey" in col ? (col.accessorKey as keyof TData) : null;

    if (!accessor || !editableFields.includes(accessor)) {
      return col; // read-only column
    }

    return {
      ...col,
      cell: (ctx) => {
        const value = ctx.getValue();
        const rowIndex = ctx.row.index;

        return (
          <input
            className="border px-2 py-1 rounded w-full"
            value={String(value ?? "")}
            onChange={(e) =>
              onChange(rowIndex, accessor, e.target.value)
            }
          />
        );
      },
    };
  });
}
