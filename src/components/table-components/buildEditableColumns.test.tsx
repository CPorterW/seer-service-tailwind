import { describe, expect, it, vi } from "vitest";
import type { ColumnDef } from "@tanstack/react-table";
import { buildEditableColumns } from "./buildEditableColumns";

type RowType = {
  id: number;
  name: string;
};

describe("buildEditableColumns", () => {
  it("keeps non-editable columns unchanged", () => {
    const columns: ColumnDef<RowType, unknown>[] = [
      { accessorKey: "id", header: "ID" },
    ];

    const result = buildEditableColumns(columns, ["name"], vi.fn());
    expect(result[0].cell).toBeUndefined();
    expect(result[0]).toBe(columns[0]);
  });

  it("wraps editable columns with an input cell and forwards changes", () => {
    const onChange = vi.fn();
    const columns: ColumnDef<RowType, unknown>[] = [
      { accessorKey: "name", header: "Name" },
    ];

    const result = buildEditableColumns(columns, ["name"], onChange);
    const cellRenderer = result[0].cell;
    expect(cellRenderer).toBeTypeOf("function");
    if (typeof cellRenderer !== "function") {
      throw new Error("Expected editable column cell renderer to be a function.");
    }

    const element = cellRenderer(
      {
        getValue: () => "Alice",
        row: { index: 3 },
      } as never
    ) as {
      props: { onChange: (event: { target: { value: string } }) => void };
    };

    element.props.onChange({ target: { value: "Bob" } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(3, "name", "Bob");
  });
});
