import { supabase } from "../lib/supabaseClient";
import { getAddresses } from "./addressService";
import { getTaxDetailsByAddressForMonth } from "./taxCodeService";
import type { AddressMonthlySpend } from "../types/addressMonthlySpend";

const ADDRESS_MONTHLY_SPEND_TABLE =
  import.meta.env.VITE_ADDRESS_MONTHLY_SPEND_TABLE || "address_money_spent";

type MonthlySpendRow = {
  id: number;
  address_id: number;
  money_spent: number | string | null;
  month: number;
  year: number;
};

function parseNumericValue(value: number | string | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export async function getAddressMonthlySpend(
  month: number,
  year: number
): Promise<AddressMonthlySpend[]> {
  const addresses = await getAddresses();

  if (addresses.length === 0) {
    return [];
  }

  const addressIds = addresses.map((address) => address.id);
  const monthlySpendPromise = supabase
    .from(ADDRESS_MONTHLY_SPEND_TABLE)
    .select("id, address_id, money_spent, month, year")
    .eq("month", month)
    .eq("year", year)
    .in("address_id", addressIds)
    .order("id", { ascending: false });
  const [monthlySpendResult, taxDetailsByAddress] = await Promise.all([
    monthlySpendPromise,
    getTaxDetailsByAddressForMonth(addressIds, month, year),
  ]);

  const { data: monthlyRows, error } = monthlySpendResult;

  if (error) throw error;

  const spendByAddress = new Map<number, MonthlySpendRow>();

  for (const row of (monthlyRows ?? []) as MonthlySpendRow[]) {
    if (!spendByAddress.has(row.address_id)) {
      spendByAddress.set(row.address_id, row);
    }
  }

  return addresses.map((address) => {
    const monthlySpend = spendByAddress.get(address.id);
    const taxDetails = taxDetailsByAddress.get(address.id);

    return {
      id: monthlySpend?.id ?? null,
      addressId: address.id,
      name: address.name,
      street: address.street,
      zipCode: address.zipCode,
      lastUsed: address.lastUsed,
      isVendor: address.isVendor,
      totalTaxRate: taxDetails?.totalTaxRate ?? parseNumericValue(address.totalTaxRate),
      taxCode: taxDetails?.taxCode ?? null,
      moneySpent: parseNumericValue(monthlySpend?.money_spent),
      month,
      year,
    };
  });
}

export async function upsertAddressMonthlySpend(
  addressId: number,
  month: number,
  year: number,
  moneySpent: number
): Promise<number> {
  const nowIso = new Date().toISOString();
  const { data: existingRows, error: existingError } = await supabase
    .from(ADDRESS_MONTHLY_SPEND_TABLE)
    .select("id")
    .eq("address_id", addressId)
    .eq("month", month)
    .eq("year", year)
    .order("id", { ascending: false })
    .limit(1);

  if (existingError) throw existingError;

  const existingId = existingRows?.[0]?.id;

  if (existingId) {
    const { error: updateError } = await supabase
      .from(ADDRESS_MONTHLY_SPEND_TABLE)
      .update({
        money_spent: moneySpent,
      })
      .eq("id", existingId);

    if (updateError) throw updateError;
    const { error: touchAddressError } = await supabase
      .from("address")
      .update({
        last_used: nowIso,
      })
      .eq("id", addressId);

    if (touchAddressError) throw touchAddressError;
    return existingId;
  }

  const { data: insertedRow, error: insertError } = await supabase
    .from(ADDRESS_MONTHLY_SPEND_TABLE)
    .insert({
      address_id: addressId,
      money_spent: moneySpent,
      month,
      year,
    })
    .select("id")
    .single();

  if (insertError) throw insertError;
  const { error: touchAddressError } = await supabase
    .from("address")
    .update({
      last_used: nowIso,
    })
    .eq("id", addressId);

  if (touchAddressError) throw touchAddressError;
  return insertedRow.id;
}
