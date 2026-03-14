import { useState } from "react";
import { getTaxRatesByAddress } from "../services/geocoderService";
import { createAddress } from "../services/addressService";



type AddressInputProps = {
  isVendor: boolean;
};

export default function AddressInput({ isVendor }: AddressInputProps) {
  const [street, setStreet] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendToSupabase() {
    if (!street || !zipCode) {
      setStatus("Please enter both street and zip code");
      return;
    }

    try {
      setLoading(true);
      setStatus("Getting tax rates...");

      // 🔹 Call geocoder service
      const taxRates = await getTaxRatesByAddress(street, zipCode);

      setStatus("Saving to database...");

      console.log(taxRates);

      await createAddress(
        street,
        zipCode,
        name,
        isVendor,
        taxRates.salesTaxRate
      );

      setStatus("Saved!");
      setStreet("");
      setZipCode("");
      setName("");

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to get tax rates";
      setStatus("Error: " + message);
    } finally {
      setLoading(false);
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

      <button onClick={sendToSupabase} disabled={loading}>
        {loading ? "Processing..." : "Submit"}
      </button>

      <p>{status}</p>
    </div>
  );
}