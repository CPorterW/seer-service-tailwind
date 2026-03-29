import { supabase } from "../lib/supabaseClient";
import { getTaxRatesByAddress } from "./geocoderService";

const TAX_CODE_TABLE = import.meta.env.VITE_TAX_CODE_TABLE || "tax_code";

type TaxCodeRow = {
  id: number;
  address_id: number;
  total_tax_rate: number | string | null;
  tax_code: string | null;
  created_at: string | null;
};

type TaxCodeInsertRow = {
  id: number;
  total_tax_rate: number | string | null;
  tax_code: string | null;
};

export type EnsureMonthlyTaxCodeParams = {
  addressId: number;
  street: string;
  zipCode: string;
  month: number;
  year: number;
};

export type EnsureMonthlyTaxCodeResult = {
  id: number;
  totalTaxRate: number;
  taxCode: string | null;
  created: boolean;
};

export type TaxCodeDetails = {
  totalTaxRate: number;
  taxCode: string | null;
};

function parseNumericValue(value: number | string | null | undefined): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace("%", "").trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function parseTextValue(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getMonthBounds(month: number, year: number): { startIso: string; endIso: string } {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Month must be an integer between 1 and 12.");
  }
  if (!Number.isInteger(year) || year < 1900 || year > 3000) {
    throw new Error("Year must be a valid integer.");
  }

  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 1, 0, 0, 0, 0);

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

function buildLatestTaxDetailsMap(rows: TaxCodeRow[]): Map<number, TaxCodeDetails> {
  const taxDetailsByAddress = new Map<number, TaxCodeDetails>();

  for (const row of rows) {
    if (!taxDetailsByAddress.has(row.address_id)) {
      taxDetailsByAddress.set(row.address_id, {
        totalTaxRate: parseNumericValue(row.total_tax_rate),
        taxCode: parseTextValue(row.tax_code),
      });
    }
  }

  return taxDetailsByAddress;
}

function buildTaxRateMap(taxDetailsByAddress: Map<number, TaxCodeDetails>): Map<number, number> {
  const taxRatesByAddress = new Map<number, number>();

  for (const [addressId, details] of taxDetailsByAddress.entries()) {
    taxRatesByAddress.set(addressId, details.totalTaxRate);
  }

  return taxRatesByAddress;
}

async function getTaxCodeRowForAddressMonth(
  addressId: number,
  month: number,
  year: number
): Promise<TaxCodeRow | null> {
  const { startIso, endIso } = getMonthBounds(month, year);

  const { data, error } = await supabase
    .from(TAX_CODE_TABLE)
    .select("id, address_id, total_tax_rate, tax_code, created_at")
    .eq("address_id", addressId)
    .gte("created_at", startIso)
    .lt("created_at", endIso)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(1);

  if (error) throw error;

  const row = ((data ?? []) as TaxCodeRow[])[0];
  return row ?? null;
}

export async function getLatestTaxRatesByAddress(
  addressIds: number[]
): Promise<Map<number, number>> {
  if (addressIds.length === 0) {
    return new Map<number, number>();
  }

  const { data, error } = await supabase
    .from(TAX_CODE_TABLE)
    .select("id, address_id, total_tax_rate, tax_code, created_at")
    .in("address_id", addressIds)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) throw error;

  const taxDetailsByAddress = buildLatestTaxDetailsMap((data ?? []) as TaxCodeRow[]);
  return buildTaxRateMap(taxDetailsByAddress);
}

export async function getTaxDetailsByAddressForMonth(
  addressIds: number[],
  month: number,
  year: number
): Promise<Map<number, TaxCodeDetails>> {
  if (addressIds.length === 0) {
    return new Map<number, TaxCodeDetails>();
  }

  const { startIso, endIso } = getMonthBounds(month, year);

  const { data, error } = await supabase
    .from(TAX_CODE_TABLE)
    .select("id, address_id, total_tax_rate, tax_code, created_at")
    .in("address_id", addressIds)
    .gte("created_at", startIso)
    .lt("created_at", endIso)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) throw error;

  return buildLatestTaxDetailsMap((data ?? []) as TaxCodeRow[]);
}

export async function getTaxRatesByAddressForMonth(
  addressIds: number[],
  month: number,
  year: number
): Promise<Map<number, number>> {
  const taxDetailsByAddress = await getTaxDetailsByAddressForMonth(
    addressIds,
    month,
    year
  );
  return buildTaxRateMap(taxDetailsByAddress);
}

export async function ensureMonthlyTaxCodeForAddress({
  addressId,
  street,
  zipCode,
  month,
  year,
}: EnsureMonthlyTaxCodeParams): Promise<EnsureMonthlyTaxCodeResult> {
  const existingRow = await getTaxCodeRowForAddressMonth(addressId, month, year);

  if (existingRow) {
    return {
      id: existingRow.id,
      totalTaxRate: parseNumericValue(existingRow.total_tax_rate),
      taxCode: parseTextValue(existingRow.tax_code),
      created: false,
    };
  }

  const rates = await getTaxRatesByAddress(street, zipCode);

  const { data: insertedRow, error: insertError } = await supabase
    .from(TAX_CODE_TABLE)
    .insert({
      address_id: addressId,
      total_tax_rate: rates.salesTaxRate,
      tax_code: rates.taxCode,
    })
    .select("id, total_tax_rate, tax_code")
    .single();

  if (insertError) throw insertError;

  const saved = insertedRow as TaxCodeInsertRow;
  return {
    id: saved.id,
    totalTaxRate: parseNumericValue(saved.total_tax_rate),
    taxCode: parseTextValue(saved.tax_code),
    created: true,
  };
}
