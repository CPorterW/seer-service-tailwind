
import { supabase } from '../lib/supabaseClient';

export async function getAddresses() {
  const { data, error } = await supabase
    .from("address")
    .select("id, street, zip_code, last_used")
    .order("id");

  if (error) throw error;

  return data.map((a) => ({
    id: a.id,
    street: a.street,
    zipCode: a.zip_code,
    lastUsed: a.last_used,
  }));
}


export async function createAddress(street: string, zip_code: string) {
  const { data, error } = await supabase
    .from("address")
    .insert({ street, zip_code })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAddress(id: number) {
  const { error } = await supabase
    .from("address")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/* Usage template for components.
import { useEffect, useState } from "react";
import { getAddresses, createAddress, deleteAddress } from "../services/addressService";

export default function AddressList() {
  const [addresses, setAddresses] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await getAddresses();
    setAddresses(data);
  }

  async function add() {
    await createAddress("123 Main St", "90210");
    await load();
  }

  async function remove(id: number) {
    await deleteAddress(id);
    await load();
  }

  return (
    <div>
      <button onClick={add}>Add Address</button>

      {addresses.map(a => (
        <div key={a.id}>
          {a.street} ({a.zipcode}) — last used {a.last_used}
          <button onClick={() => remove(a.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
} */