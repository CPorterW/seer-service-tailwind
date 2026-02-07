import { useState } from "react";
import { supabase } from '../lib/supabaseClient';

type AddressInputProps = {
  isVendor: boolean;
};

export default function AddressInput({ isVendor }: AddressInputProps) {
  const [street, setStreet] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [name, setName] = useState("")
  const [status, setStatus] = useState("");

  async function sendToSupabase() {
    setStatus("Saving...");

    const { error } = await supabase
      .from("address")
      .insert({
        street: street,
        zip_code: zipCode,
        name: name,
        is_vendor: isVendor,
      });

    if (error) {
      setStatus("Error: " + error.message);
    } else {
      setStatus("Saved!");
      setStreet("");
      setZipCode("");
      setName("");
    }
  }

  return (
    <div>
      <h3>Input a New Address:</h3>

      <input
        type="text"
        placeholder="Street (No state, city, or apartment # needed)"
        value={street}
        onChange={(e) => setStreet(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <input
        type="text"
        placeholder="Zip Code"
        value={zipCode}
        onChange={(e) => setZipCode(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <input
        type="text"
        placeholder="A name for this place that you'll remember"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button onClick={sendToSupabase}>
        Submit
      </button>

      <p>{status}</p>
    </div>
  );
}
