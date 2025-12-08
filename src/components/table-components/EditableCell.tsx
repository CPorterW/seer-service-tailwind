

interface EditableCellProps {
  value: unknown;
  rowIndex: number;
  columnId: string;
  onChange: (rowIndex: number, columnId: string, value: unknown) => void;
}

export function EditableCell({
  value,
  rowIndex,
  columnId,
  onChange,
}: EditableCellProps) {
  return (
    <input
      className="border rounded px-2 py-1 w-full"
      value={String(value ?? "")}
      onChange={(e) => onChange(rowIndex, columnId, e.target.value)}
    />
  );
}
