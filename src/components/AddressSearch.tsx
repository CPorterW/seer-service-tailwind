import { useState } from "react";

export default function AddressTaxLookup() {
  const [address, setAddress] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiKey = import.meta.env.VITE_USGEOCODER_KEY;
      const url = `https://usgeocoder.com/api/get_info.php?address=${encodeURIComponent(
        address
      )}&format=json&zip4=n&api_key=${apiKey}`;
      

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch tax data");
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      // Sales/use tax data may be in data.salesTax or similar
      setResult(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatTaxRates = () => {
    if (!result) return null;
    const tax = result.salesTax || result.data?.salesTax;

    if (!tax) {
      return <p>No tax rate data found for this address.</p>;
    }

    return (
      <div className="space-y-1">
        <p><strong>State:</strong> {tax.state_sales_tax_rate}%</p>
        <p><strong>County:</strong> {tax.county_sales_tax_rate}%</p>
        <p><strong>City:</strong> {tax.city_sales_tax_rate}%</p>
        <p><strong>Total:</strong> {tax.total_sales_tax_rate}%</p>
      </div>
    );
  };

  return (
    <div className="mt-10 p-6 bg-white shadow-md rounded-lg" style={{ width: "80vw" }}>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        U.S. Address Tax Rate Lookup
      </h2>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter full address (e.g., 1600 Pennsylvania Ave NW, Washington, DC)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}
      {result && (
        <div className="mt-4 border-t pt-4">
          <h3 className="text-lg font-medium mb-2">Results:</h3>
          {formatTaxRates()}
        </div>
      )}
    </div>
  );
}
