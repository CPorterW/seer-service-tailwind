import { useState } from "react";
import { supabase } from '../lib/supabaseClient';

export default function AddressInput() {
  const [street, setStreet] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [status, setStatus] = useState("");

  async function sendToSupabase() {
    setStatus("Saving...");

    const { error } = await supabase
      .from("address")
      .insert({
        street: street,
        zip_code: zipCode
      });

    if (error) {
      setStatus("Error: " + error.message);
    } else {
      setStatus("Saved!");
      setStreet("");
      setZipCode("");
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

      <button onClick={sendToSupabase}>
        Submit
      </button>

      <p>{status}</p>
    </div>
  );
}
