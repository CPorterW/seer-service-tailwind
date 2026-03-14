import { useState } from "react";
type SalesTax = {
  state_sales_tax_rate?: string | number;
  county_sales_tax_rate?: string | number;
  city_sales_tax_rate?: string | number;
  total_sales_tax_rate?: string | number;
};

type TaxLookupResult = {
  error?: string;
  salesTax?: SalesTax;
  data?: {
    salesTax?: SalesTax;
  };
};

export default function AddressTaxLookup() {
  const [address, setAddress] = useState("");
  const [result, setResult] = useState<TaxLookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!address) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/tax-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = (await res.json()) as TaxLookupResult;
      if (!res.ok) throw new Error(data.error || "Failed to fetch tax data");

      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatTaxRates = () => {
    if (!result) return null;
    const tax = result.salesTax ?? result.data?.salesTax;

    if (!tax) {
      return <p>No tax rate data found for this address.</p>;
    }

    return (
      <div className="space-y-1">
        <p><strong>State:</strong> {tax.state_sales_tax_rate ?? "N/A"}%</p>
        <p><strong>County:</strong> {tax.county_sales_tax_rate ?? "N/A"}%</p>
        <p><strong>City:</strong> {tax.city_sales_tax_rate ?? "N/A"}%</p>
        <p><strong>Total:</strong> {tax.total_sales_tax_rate ?? "N/A"}%</p>
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
