
import { supabase } from '../lib/supabaseClient';
import type { Address } from '../types/address';
import {
  ensureMonthlyTaxCodeForAddress,
  getLatestTaxRatesByAddress,
} from "./taxCodeService";

type AddressRow = {
  id: number;
  name: string;
  street: string;
  zip_code: string;
  last_used: string | null;
  is_vendor: boolean;
  created_at: string;
};

export async function getAddresses(): Promise<Address[]> {
  const { data, error } = await supabase
    .from("address")
    .select("id, name, street, zip_code, last_used, is_vendor, created_at")
    .order("id");

  if (error) throw error;
  const addressRows = (data ?? []) as AddressRow[];
  const addressIds = addressRows.map((address) => address.id);
  const latestTaxRatesByAddress = await getLatestTaxRatesByAddress(addressIds);

  return addressRows.map((a) => ({
    id: a.id,
    name: a.name,
    street: a.street,
    zipCode: a.zip_code,
    lastUsed: a.last_used,
    isVendor: a.is_vendor,
    totalTaxRate: latestTaxRatesByAddress.get(a.id) ?? 0,
    createdDateTime: a.created_at
  }));
}
async function getFilteredAddresses(predicate: (a: Address) => boolean) {
  const addresses = await getAddresses();
  return addresses.filter(predicate);
}

export const getVendors = () => getFilteredAddresses(a => a.isVendor);
export const getClients = () => getFilteredAddresses(a => !a.isVendor);

export async function getAddressesByMonth(month: number, year: number): Promise<Address[]> {
  const addresses = await getAddresses();
  return addresses.filter((a) => {
    if (!a.createdDateTime) return false;
    const date = new Date(a.createdDateTime);
    return date.getMonth() + 1 === month && date.getFullYear() === year;
  });
}

export async function createAddress(
  street: string,
  zip_code: string,
  name: string,
  is_vendor: boolean
) {
  const normalizedStreet = street.trim();
  const normalizedZipCode = zip_code.trim();
  const normalizedName = name.trim();
  const { data, error } = await supabase
    .from("address")
    .insert({
      street: normalizedStreet,
      zip_code: normalizedZipCode,
      name: normalizedName,
      is_vendor,
    })
    .select("id, street, zip_code")
    .single();

  if (error) throw error;

  const createdAddress = data as {
    id: number;
    street: string;
    zip_code: string;
  };
  const now = new Date();
  await ensureMonthlyTaxCodeForAddress({
    addressId: createdAddress.id,
    street: createdAddress.street,
    zipCode: createdAddress.zip_code,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });
  return data;
}

export async function deleteAddress(id: number) {
  const { data, error, count } = await supabase
    .from("address")
    .delete({ count: "exact" })
    .eq("id", id);

  console.log({ data, count });

  if (error) throw error;
}