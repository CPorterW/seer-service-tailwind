// src/services/geocoderService.ts

//const BASE_URL = import.meta.env.VITE_USGEOCODER_BASE_URL;
//const API_KEY = import.meta.env.VITE_USGEOCODER_KEY;

export interface TaxRateResult {
  salesTaxRate: number;
  useTaxRate: number;
}

export async function getTaxRatesByAddress(
  address: string,
  zipcode: string
): Promise<TaxRateResult> {

  //const encodedAddress = encodeURIComponent(address);

  /*const url =
    `${BASE_URL}?address=${encodedAddress}` +
    `&zipcode=${zipcode}` +
    `&authkey=${API_KEY}` +
    `&option=tax_details` +
    `&format=json`;*/
  const url = `/api/usgeocoder?option=tax_details&format=json&address=${encodeURIComponent(address)}&zipcode=${encodeURIComponent(zipcode)}`

  console.log("Fetching tax data from:", url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch tax details");
  }

  const data = await response.json();

  // Access the correct path
  const taxDetails = data.usgeocoder?.totalcollection_tax_details;

  if (!taxDetails || !taxDetails.t_tax_total_tax) {
    throw new Error("Invalid tax data returned from API");
  }

  // Remove the '%' and convert to number
  const salesTaxRate = parseFloat(taxDetails.t_tax_total_tax.replace('%', ''));

  if (isNaN(salesTaxRate)) {
    throw new Error("Invalid tax data returned from API");
  }

  // For simplicity, use the same rate for use tax (or adjust if API has separate field)
  const useTaxRate = salesTaxRate;

  return {
    salesTaxRate,
    useTaxRate,
  };
}