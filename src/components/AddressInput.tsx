import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { getTaxRatesByAddress } from "../services/geocoderService";



type AddressInputProps = {
  isVendor: boolean;
};

export default function AddressInput({ isVendor }: AddressInputProps) {
  const [street, setStreet] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);


  useEffect(() => {
  async function testGeocoder() {
    try {
      const result = await getTaxRatesByAddress(
        "1600 Pennsylvania Ave NW",
        "20500"
      );
      console.log("Tax result:", result);
    } catch (err) {
      console.error("Geocoder error:", err);
    }
  }

  testGeocoder();
}, []);

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

      // 🔹 Save all info to Supabase
      const { error } = await supabase.from("address").insert({
        street: street,
        zip_code: zipCode,
        name: name,
        is_vendor: isVendor,
        sales_tax_rate: taxRates.salesTaxRate,
        use_tax_rate: taxRates.useTaxRate,
      });

      if (error) {
        setStatus("Error: " + error.message);
      } else {
        setStatus("Saved!");
        setStreet("");
        setZipCode("");
        setName("");
      }

    } catch (err: any) {
      setStatus("Error: " + (err.message || "Failed to get tax rates"));
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