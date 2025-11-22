
import { supabase } from '../lib/supabaseClient';

export async function saveAddress(street: string, city: string, state: string, zip: string) {
  const { data, error } = await supabase
    .from("address")
    .insert([
      {
        street,
        city,
        state,
        zip
      }
    ])
    .select(); // returns the inserted row

  if (error) throw error;

  return data;
}

export async function getAddressesByUserId(userId: string | number) {
  const { data, error } = await supabase
    .from("address")
    .select("*")
    .eq("user_id", userId)
    .order("last_used", { ascending: false });

  if (error) throw error;

  return data; // array of addresses
}