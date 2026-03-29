import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Autocomplete, TextField } from "@mui/material";
import Table from "./Table";
import type { AddressMonthlySpend } from "../types/addressMonthlySpend";
import {
  getAddressMonthlySpend,
  upsertAddressMonthlySpend,
} from "../services/addressMonthlySpendService";
import { ensureMonthlyTaxCodeForAddress } from "../services/taxCodeService";

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

function getDisplayMoneyAmount(value: number): string {
  if (value === 0) return "0";
  return String(Math.abs(value));
}

function parseMoneySpent(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const normalized = trimmed.replaceAll(",", "").replaceAll("$", "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeMoneyAmount(value: number, isVendor: boolean): number {
  if (value === 0) return 0;
  return isVendor ? Math.abs(value) : -Math.abs(value);
}

function calculateVendorDeduction(moneySpent: number, totalTaxRate: number): number {
  return Math.abs(moneySpent) * (Math.abs(totalTaxRate) / 100);
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
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
  const [clientSearchInput, setClientSearchInput] = useState("");
  const [vendorSearchInput, setVendorSearchInput] = useState("");
  const [draftMoneySpent, setDraftMoneySpent] = useState<Record<number, string>>(
    {}
  );
  const [dirtyByAddressId, setDirtyByAddressId] = useState<Record<number, boolean>>(
    {}
  );
  const [savingByAddressId, setSavingByAddressId] = useState<Record<number, boolean>>(
    {}
  );
  const [status, setStatus] = useState("");

  const draftMoneySpentRef = useRef<Record<number, string>>({});
  const dirtyByAddressIdRef = useRef<Record<number, boolean>>({});
  const savingByAddressIdRef = useRef<Record<number, boolean>>({});

  draftMoneySpentRef.current = draftMoneySpent;
  dirtyByAddressIdRef.current = dirtyByAddressId;
  savingByAddressIdRef.current = savingByAddressId;

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
            data.map((address) => [address.addressId, getDisplayMoneyAmount(address.moneySpent)])
          )
        );
        setClientSearchInput("");
        setVendorSearchInput("");
        setDirtyByAddressId({});
        setSavingByAddressId({});
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

  async function addRow(addressId: number, isVendor: boolean) {
    const rows = isVendor ? vendorRows : clientRows;
    if (rows.some((row) => row.addressId === addressId)) {
      setStatus(`${isVendor ? "Vendor" : "Client"} already exists in this month.`);
      return;
    }

    const sourceAddress = allAddresses.find(
      (address) => address.addressId === addressId && address.isVendor === isVendor
    );

    if (!sourceAddress) return;

    setStatus("Checking monthly tax code...");

    try {
      const ensuredTaxCode = await ensureMonthlyTaxCodeForAddress({
        addressId,
        street: sourceAddress.street,
        zipCode: sourceAddress.zipCode,
        month,
        year,
      });

      const nextRow: AddressMonthlySpend = {
        ...sourceAddress,
        id: null,
        moneySpent: 0,
        totalTaxRate: ensuredTaxCode.totalTaxRate,
        taxCode: ensuredTaxCode.taxCode,
        month,
        year,
      };

      if (isVendor) {
        setVendorRows((prev) =>
          prev.some((row) => row.addressId === addressId) ? prev : [...prev, nextRow]
        );
      } else {
        setClientRows((prev) =>
          prev.some((row) => row.addressId === addressId) ? prev : [...prev, nextRow]
        );
      }

      setAllAddresses((prev) =>
        prev.map((address) =>
          address.addressId === addressId
            ? {
                ...address,
                totalTaxRate: ensuredTaxCode.totalTaxRate,
                taxCode: ensuredTaxCode.taxCode,
              }
            : address
        )
      );

      setDraftMoneySpent((prev) => ({
        ...prev,
        [addressId]: prev[addressId] ?? "0",
      }));
      setDirtyByAddressId((prev) => ({
        ...prev,
        [addressId]: false,
      }));
      setSavingByAddressId((prev) => ({
        ...prev,
        [addressId]: false,
      }));
      setStatus("");
    } catch (err) {
      console.error("Failed to ensure tax code:", err);
      const message =
        err instanceof Error ? err.message : "Could not create monthly tax code.";
      setStatus(message);
    }
  }

  const handleDraftMoneyAmountChange = useCallback(
    (row: AddressMonthlySpend, nextValue: string) => {
      const persistedDisplayValue = getDisplayMoneyAmount(row.moneySpent);

      setDraftMoneySpent((prev) => ({
        ...prev,
        [row.addressId]: nextValue,
      }));
      setDirtyByAddressId((prev) => ({
        ...prev,
        [row.addressId]: nextValue !== persistedDisplayValue,
      }));
      setStatus("");
    },
    []
  );

  const handleSaveMoneyAmount = useCallback(
    async (row: AddressMonthlySpend) => {
      const addressId = row.addressId;
      if (savingByAddressIdRef.current[addressId]) return;

      const candidate = draftMoneySpentRef.current[addressId] ?? "0";
      const parsed = parseMoneySpent(candidate);

      if (parsed === null) {
        setStatus("Please enter a valid number for this amount.");
        return;
      }

      const normalizedAmount = normalizeMoneyAmount(parsed, row.isVendor);
      setSavingByAddressId((prev) => ({ ...prev, [addressId]: true }));

      try {
        const savedId = await upsertAddressMonthlySpend(
          addressId,
          month,
          year,
          normalizedAmount
        );
        const touchedAt = new Date().toISOString();

        const updateRows = (rows: AddressMonthlySpend[]) =>
          rows.map((address) =>
            address.addressId === addressId
              ? {
                  ...address,
                  id: savedId,
                  moneySpent: normalizedAmount,
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
                  moneySpent: normalizedAmount,
                  month,
                  year,
                  lastUsed: touchedAt,
                }
              : address
          )
        );

        setDraftMoneySpent((prev) => ({
          ...prev,
          [addressId]: getDisplayMoneyAmount(normalizedAmount),
        }));
        setDirtyByAddressId((prev) => ({
          ...prev,
          [addressId]: false,
        }));
        setStatus("Saved.");
      } catch (err) {
        console.error("Save failed:", err);
        setStatus("Could not save monthly amount.");
      } finally {
        setSavingByAddressId((prev) => ({
          ...prev,
          [addressId]: false,
        }));
      }
    },
    [month, year]
  );

  const buildColumns = useCallback(
    (
      amountHeader: string,
      includeVendorDeduction: boolean
    ): ColumnDef<AddressMonthlySpend>[] => {
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
          accessorKey: "taxCode",
          header: "Tax Code",
          cell: ({ row }) => row.original.taxCode ?? "—",
        },
        {
          accessorKey: "moneySpent",
          header: amountHeader,
          cell: ({ row }) => (
            <input
              type="number"
              step="0.01"
              min={0}
              className="no-number-spinner border px-2 py-1 rounded w-full"
              value={draftMoneySpentRef.current[row.original.addressId] ?? "0"}
              onChange={(event) => {
                handleDraftMoneyAmountChange(row.original, event.target.value);
              }}
            />
          ),
        },
      ];

      if (includeVendorDeduction) {
        columns.push({
          id: "deduction",
          header: "Deduction",
          cell: ({ row }) => {
            const addressId = row.original.addressId;
            const draftValue =
              draftMoneySpentRef.current[addressId] ??
              getDisplayMoneyAmount(row.original.moneySpent);
            const parsed = parseMoneySpent(draftValue);
            const moneySpent = parsed === null ? Math.abs(row.original.moneySpent) : Math.abs(parsed);
            const deduction = calculateVendorDeduction(moneySpent, row.original.totalTaxRate);

            return formatCurrency(deduction);
          },
        });
      }

      columns.push({
        id: "save",
        header: "Save",
        enableSorting: false,
        cell: ({ row }) => {
          const addressId = row.original.addressId;
          const isDirty = Boolean(dirtyByAddressIdRef.current[addressId]);
          const isSaving = Boolean(savingByAddressIdRef.current[addressId]);

          return (
            <button
              type="button"
              className="!px-3 !py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isDirty || isSaving}
              onClick={() => {
                void handleSaveMoneyAmount(row.original);
              }}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          );
        },
      });

      return columns;
    },
    [handleDraftMoneyAmountChange, handleSaveMoneyAmount]
  );

  const clientColumns = useMemo(
    () => buildColumns("Money Made", false),
    [buildColumns]
  );
  const vendorColumns = useMemo(
    () => buildColumns("Money Spent", true),
    [buildColumns]
  );

  return (
    <>
      <section className="space-y-2 mb-10">
        <h2 className="on-white text-xl font-semibold">Clients</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Autocomplete
            options={clientOptions}
            value={null}
            inputValue={clientSearchInput}
            onInputChange={(_, value) => setClientSearchInput(value)}
            onChange={(_, value) => {
              if (value) {
                void addRow(value.addressId, false);
                setClientSearchInput("");
              }
            }}
            getOptionLabel={(option) => `${option.name} (${option.zipCode})`}
            isOptionEqualToValue={(option, value) =>
              option.addressId === value.addressId
            }
            filterOptions={(options, state) =>
              options.filter((address) => matchesSearch(address, state.inputValue))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search clients"
                placeholder="Type and choose a client to add"
                size="small"
              />
            )}
            sx={{ minWidth: 300 }}
          />
        </div>
        <Table data={clientRows} columns={clientColumns} />
      </section>

      <section className="space-y-2">
        <h2 className="on-white text-xl font-semibold">Vendors</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Autocomplete
            options={vendorOptions}
            value={null}
            inputValue={vendorSearchInput}
            onInputChange={(_, value) => setVendorSearchInput(value)}
            onChange={(_, value) => {
              if (value) {
                void addRow(value.addressId, true);
                setVendorSearchInput("");
              }
            }}
            getOptionLabel={(option) => `${option.name} (${option.zipCode})`}
            isOptionEqualToValue={(option, value) =>
              option.addressId === value.addressId
            }
            filterOptions={(options, state) =>
              options.filter((address) => matchesSearch(address, state.inputValue))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search vendors"
                placeholder="Type and choose a vendor to add"
                size="small"
              />
            )}
            sx={{ minWidth: 300 }}
          />
        </div>
        <Table data={vendorRows} columns={vendorColumns} />
      </section>

      {status && <p className="mt-2 text-sm on-white">{status}</p>}
    </>
  );
}
