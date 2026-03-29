import { afterEach, describe, expect, it, vi } from "vitest";
import { getTaxRatesByAddress } from "./geocoderService";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("getTaxRatesByAddress", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("builds the expected request URL and parses legacy payload shape", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        usgeocoder: {
          totalcollection_tax_details: {
            t_tax_total_tax: "7.25%",
          },
        },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await getTaxRatesByAddress("123 Main St", "75001");

    expect(result).toEqual({
      salesTaxRate: 7.25,
      useTaxRate: 7.25,
      taxCode: null,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/usgeocoder?option=tax_details&format=json&address=123+Main+St&zipcode=75001"
    );
  });

  it("parses alternate total rate paths", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        data: {
          salesTax: {
            total_sales_tax_rate: "8.375",
          },
        },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await getTaxRatesByAddress(
      "1600 Pennsylvania Ave NW",
      "20500"
    );

    expect(result.salesTaxRate).toBe(8.375);
    expect(result.useTaxRate).toBe(8.375);
    expect(result.taxCode).toBeNull();
  });

  it("extracts tax code when present in tax details", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        usgeocoder: {
          totalcollection_tax_details: {
            t_tax_total_tax: "9.5%",
            t_tax_code: "ABC-123",
          },
        },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await getTaxRatesByAddress("1 Main St", "12345");

    expect(result.salesTaxRate).toBe(9.5);
    expect(result.taxCode).toBe("ABC-123");
  });

  it("surfaces API error messages from non-200 responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ error: "Invalid auth key" }, 401))
    );

    await expect(getTaxRatesByAddress("1 Main St", "12345")).rejects.toThrow(
      "Invalid auth key"
    );
  });

  it("throws when tax rate is missing from payload", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ ok: true })));

    await expect(getTaxRatesByAddress("1 Main St", "12345")).rejects.toThrow(
      "Tax API response did not include a usable total tax rate."
    );
  });
});
