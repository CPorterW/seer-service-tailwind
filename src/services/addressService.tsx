
import { supabase } from '../lib/supabaseClient';

export async function getAddresses() {
  const { data, error } = await supabase
    .from("address")
    .select("id, name, street, zip_code, last_used")
    .order("id");

  if (error) throw error;

  return data.map((a) => ({
    id: a.id,
    name: a.name,
    street: a.street,
    zipCode: a.zip_code,
    lastUsed: a.last_used,
  }));
}


export async function createAddress(street: string, zip_code: string, name: string) {
  const { data, error } = await supabase
    .from("address")
    .insert({ street, zip_code, name })
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