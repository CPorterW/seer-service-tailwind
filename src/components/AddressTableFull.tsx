import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import Table from "./Table";
import type { AddressMonthlySpend } from "../types/addressMonthlySpend";
import {
  getAddressMonthlySpend,
  upsertAddressMonthlySpend,
} from "../services/addressMonthlySpendService";

const getStartOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

function parseLastUsedMs(lastUsed: string | null): number {
  if (!lastUsed) return 0;
  const parsed = Date.parse(lastUsed);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sortByMostRecentThenName(a: AddressMonthlySpend, b: AddressMonthlySpend): number {
  const recencyDifference = parseLastUsedMs(b.lastUsed) - parseLastUsedMs(a.lastUsed);
  if (recencyDifference !== 0) return recencyDifference;
  return a.name.localeCompare(b.name);
}

function matchesSearch(address: AddressMonthlySpend, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return (
    address.name.toLowerCase().includes(normalized) ||
    address.street.toLowerCase().includes(normalized) ||
    address.zipCode.toLowerCase().includes(normalized)
  );
}

type AddressesPageProps = {
  month: number;
  year: number;
};

export default function AddressesPage({
  month = getStartOfToday().getMonth() + 1,
  year = getStartOfToday().getFullYear(),
}: AddressesPageProps) {
  const [allAddresses, setAllAddresses] = useState<AddressMonthlySpend[]>([]);
  const [clientRows, setClientRows] = useState<AddressMonthlySpend[]>([]);
  const [vendorRows, setVendorRows] = useState<AddressMonthlySpend[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");
  const [draftMoneySpent, setDraftMoneySpent] = useState<Record<number, string>>(
    {}
  );
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await getAddressMonthlySpend(month, year);
        if (!active) return;

        setAllAddresses(data);
        setClientRows(data.filter((address) => !address.isVendor && address.id !== null));
        setVendorRows(data.filter((address) => address.isVendor && address.id !== null));
        setDraftMoneySpent(
          Object.fromEntries(
            data.map((address) => [address.addressId, String(address.moneySpent)])
          )
        );
        setSelectedClientId("");
        setSelectedVendorId("");
        setClientSearch("");
        setVendorSearch("");
        setStatus("");
      } catch (err) {
        console.error("Failed to load addresses:", err);
        if (active) {
          setStatus("Could not load monthly spending values.");
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [month, year]);

  const clientOptions = useMemo(
    () => allAddresses.filter((address) => !address.isVendor).sort(sortByMostRecentThenName),
    [allAddresses]
  );

  const vendorOptions = useMemo(
    () => allAddresses.filter((address) => address.isVendor).sort(sortByMostRecentThenName),
    [allAddresses]
  );

  const filteredClientOptions = useMemo(
    () => clientOptions.filter((address) => matchesSearch(address, clientSearch)),
    [clientOptions, clientSearch]
  );

  const filteredVendorOptions = useMemo(
    () => vendorOptions.filter((address) => matchesSearch(address, vendorSearch)),
    [vendorOptions, vendorSearch]
  );

  function parseMoneySpent(value: string): number | null {
    const trimmed = value.trim();
    if (!trimmed) return 0;

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function addRow(addressId: number, isVendor: boolean) {
    const rows = isVendor ? vendorRows : clientRows;
    if (rows.some((row) => row.addressId === addressId)) {
      setStatus(`${isVendor ? "Vendor" : "Client"} already exists in this month.`);
      return;
    }

    const sourceAddress = allAddresses.find(
      (address) => address.addressId === addressId && address.isVendor === isVendor
    );

    if (!sourceAddress) return;

    const nextRow: AddressMonthlySpend = {
      ...sourceAddress,
      id: null,
      moneySpent: 0,
      month,
      year,
    };

    if (isVendor) {
      setVendorRows((prev) => [...prev, nextRow]);
    } else {
      setClientRows((prev) => [...prev, nextRow]);
    }

    setDraftMoneySpent((prev) => ({
      ...prev,
      [addressId]: prev[addressId] ?? "0",
    }));
    setStatus("");
  }

  async function handleMoneySpentBlur(row: AddressMonthlySpend) {
    const addressId = row.addressId;
    const candidate = draftMoneySpent[addressId] ?? "0";
    const parsed = parseMoneySpent(candidate);

    if (parsed === null) {
      setStatus("Please enter a valid number for this amount.");
      setDraftMoneySpent((prev) => ({
        ...prev,
        [addressId]: String(row.moneySpent),
      }));
      return;
    }

    try {
      const savedId = await upsertAddressMonthlySpend(addressId, month, year, parsed);
      const touchedAt = new Date().toISOString();

      const updateRows = (rows: AddressMonthlySpend[]) =>
        rows.map((address) =>
          address.addressId === addressId
            ? {
                ...address,
                id: savedId,
                moneySpent: parsed,
                month,
                year,
                lastUsed: touchedAt,
              }
            : address
        );

      if (row.isVendor) {
        setVendorRows(updateRows);
      } else {
        setClientRows(updateRows);
      }

      setAllAddresses((prev) =>
        prev.map((address) =>
          address.addressId === addressId
            ? {
                ...address,
                id: savedId,
                moneySpent: parsed,
                month,
                year,
                lastUsed: touchedAt,
              }
            : address
        )
      );

      setDraftMoneySpent((prev) => ({
        ...prev,
        [addressId]: String(parsed),
      }));
      setStatus("Saved.");
    } catch (err) {
      console.error("Save failed:", err);
      setStatus("Could not save monthly amount.");
    }
  }

  const columns: ColumnDef<AddressMonthlySpend>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "street", header: "Street" },
    { accessorKey: "zipCode", header: "Zip Code" },
    {
      accessorKey: "totalTaxRate",
      header: "Tax Rate",
      cell: ({ row }) => `${row.original.totalTaxRate}%`,
    },
    {
      accessorKey: "moneySpent",
      header: "Money Spent (+) / Made (-)",
      cell: ({ row }) => (
        <input
          type="number"
          step="0.01"
          className="border px-2 py-1 rounded w-full"
          value={draftMoneySpent[row.original.addressId] ?? "0"}
          onChange={(event) =>
            setDraftMoneySpent((prev) => ({
              ...prev,
              [row.original.addressId]: event.target.value,
            }))
          }
          onBlur={() => {
            void handleMoneySpentBlur(row.original);
          }}
        />
      ),
    },
  ];

  return (
    <>
      <section className="space-y-2 mb-10">
        <h2 className="on-white text-xl font-semibold">Clients</h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            className="border px-2 py-1 rounded min-w-[260px]"
            placeholder="Search clients..."
            value={clientSearch}
            onChange={(event) => setClientSearch(event.target.value)}
          />
          <select
            className="border px-2 py-1 rounded min-w-[260px]"
            value={selectedClientId}
            onChange={(event) => setSelectedClientId(event.target.value)}
          >
            <option value="">Select a client</option>
            {filteredClientOptions.map((client) => (
              <option key={client.addressId} value={client.addressId}>
                {client.name} ({client.zipCode})
              </option>
            ))}
          </select>
          <button
            className="border rounded px-3 py-1"
            disabled={!selectedClientId}
            onClick={() => {
              const parsedId = Number(selectedClientId);
              if (Number.isFinite(parsedId)) {
                addRow(parsedId, false);
              }
              setSelectedClientId("");
            }}
          >
            Add Client
          </button>
        </div>
        <Table data={clientRows} columns={columns} />
      </section>

      <section className="space-y-2">
        <h2 className="on-white text-xl font-semibold">Vendors</h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            className="border px-2 py-1 rounded min-w-[260px]"
            placeholder="Search vendors..."
            value={vendorSearch}
            onChange={(event) => setVendorSearch(event.target.value)}
          />
          <select
            className="border px-2 py-1 rounded min-w-[260px]"
            value={selectedVendorId}
            onChange={(event) => setSelectedVendorId(event.target.value)}
          >
            <option value="">Select a vendor</option>
            {filteredVendorOptions.map((vendor) => (
              <option key={vendor.addressId} value={vendor.addressId}>
                {vendor.name} ({vendor.zipCode})
              </option>
            ))}
          </select>
          <button
            className="border rounded px-3 py-1"
            disabled={!selectedVendorId}
            onClick={() => {
              const parsedId = Number(selectedVendorId);
              if (Number.isFinite(parsedId)) {
                addRow(parsedId, true);
              }
              setSelectedVendorId("");
            }}
          >
            Add Vendor
          </button>
        </div>
        <Table data={vendorRows} columns={columns} />
      </section>

      {status && <p className="mt-2 text-sm on-white">{status}</p>}
    </>
  );
}
