
import { supabase } from '../lib/supabaseClient';
import type { Address } from '../types/address';

export async function getAddresses() {
  const { data, error } = await supabase
    .from("address")
    .select("id, name, street, zip_code, last_used, is_vendor, total_tax_rate, created_at")
    .order("id");

  if (error) throw error;

  return data.map((a) => ({
    id: a.id,
    name: a.name,
    street: a.street,
    zipCode: a.zip_code,
    lastUsed: a.last_used,
    isVendor: a.is_vendor,
    totalTaxRate: a.total_tax_rate,
    createdDateTime: a.created_at
  }));
}
async function getFilteredAddresses(predicate: (a: Address) => boolean) {
  const addresses = await getAddresses();
  return addresses.filter(predicate);
}

export const getVendors = () => getFilteredAddresses(a => a.isVendor);
export const getClients = () => getFilteredAddresses(a => !a.isVendor);

export async function createAddress(street: string, zip_code: string, name: string, is_vendor: boolean, total_tax_rate: number) {
  const { data, error } = await supabase
    .from("address")
    .insert({ street, zip_code, name, is_vendor, total_tax_rate })
    .select()
    .single();

  if (error) throw error;
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