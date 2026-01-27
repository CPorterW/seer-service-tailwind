import { useEffect, useState } from "react";
import Table from "../components/Table";
import type { Address } from "../types/address";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { getAddresses, deleteAddress } from "../services/addressService";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [contextRow, setContextRow] = useState<Row<Address> | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAddresses();
        setAddresses(data);
      } catch (err) {
        console.error("Failed to load addresses:", err);
      }
    }

    load();
  }, []);

  const columns: ColumnDef<Address>[] = [
    { accessorKey: "name", header: "Name"},
    { accessorKey: "street", header: "Street" },
    { accessorKey: "zipCode", header: "Zip Code" },
    { accessorKey: "lastUsed", header: "Last Used" },
  ];

  // ✅ Right-click handler
  function handleRowRightClick(
    e: React.MouseEvent,
    row: Row<Address>
  ) {
    e.preventDefault();
    setContextRow(row);
    setMenuPos({ x: e.clientX, y: e.clientY });
  }

  // ✅ Delete handler
  async function handleDelete() {
    if (!contextRow) return;

    const id = contextRow.original.id;

    try {
      await deleteAddress(id);

      setAddresses((prev) =>
        prev.filter((a) => a.id !== id)
      );
    } catch (err) {
      console.error("Delete failed:", err);
    }

    setContextRow(null);
    setMenuPos(null);
  }

  // ✅ Close menu on click anywhere
  useEffect(() => {
    function closeMenu() {
      setMenuPos(null);
      setContextRow(null);
    }

    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  return (
    <>
      <Table
        data={addresses}
        columns={columns}
        onRowRightClick={handleRowRightClick}
      />

      {/* ✅ Context Menu */}
      {menuPos && (
        <div
          style={{
            position: "fixed",
            top: menuPos.y,
            left: menuPos.x,
            background: "#111",
            border: "1px solid #444",
            borderRadius: 6,
            padding: "6px 0",
            zIndex: 1000,
            minWidth: 140,
          }}
        >
          <div
            onClick={handleDelete}
            style={{
              padding: "6px 12px",
              cursor: "pointer",
              color: "red",
            }}
          >
            🗑 Delete Row
          </div>
        </div>
      )}
    </>
  );
}
