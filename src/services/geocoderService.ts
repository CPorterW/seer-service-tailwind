
export interface TaxRateResult {
  salesTaxRate: number;
  useTaxRate: number;
  taxCode: string | null;
}

type JsonRecord = Record<string, unknown>;

const TAX_RATE_PATHS: ReadonlyArray<ReadonlyArray<string>> = [
  ["usgeocoder", "totalcollection_tax_details", "t_tax_total_tax"],
  ["totalcollection_tax_details", "t_tax_total_tax"],
  ["data", "salesTax", "total_sales_tax_rate"],
  ["salesTax", "total_sales_tax_rate"],
  ["total_sales_tax_rate"],
  ["total_tax_rate"],
  ["t_tax_total_tax"],
];

const TAX_CODE_PATHS: ReadonlyArray<ReadonlyArray<string>> = [
  ["usgeocoder", "totalcollection_tax_details", "tax_code"],
  ["usgeocoder", "totalcollection_tax_details", "t_tax_code"],
  ["totalcollection_tax_details", "tax_code"],
  ["totalcollection_tax_details", "t_tax_code"],
  ["data", "salesTax", "tax_code"],
  ["salesTax", "tax_code"],
  ["tax_code"],
  ["taxcode"],
  ["t_tax_code"],
];

const ERROR_KEYS: ReadonlyArray<string> = [
  "error",
  "errors",
  "error_message",
  "error_description",
  "detail",
  "description",
];

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseRate(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.replace(/%/g, "").trim();
  if (!cleaned) {
    return null;
  }

  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseTaxCode(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function getValueAtPath(data: unknown, path: ReadonlyArray<string>): unknown {
  let current: unknown = data;

  for (const key of path) {
    if (!isRecord(current)) {
      return null;
    }
    current = current[key];
  }

  return current;
}

function findTaxRateByPattern(payload: unknown): number | null {
  const queue: unknown[] = [payload];

  while (queue.length > 0) {
    const current = queue.shift();

    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }

    if (!isRecord(current)) {
      continue;
    }

    for (const [key, value] of Object.entries(current)) {
      const keyName = key.toLowerCase();
      if (
        (keyName.includes("tax") && keyName.includes("total")) ||
        keyName === "total_sales_tax_rate"
      ) {
        const parsed = parseRate(value);
        if (parsed !== null) {
          return parsed;
        }
      }

      if (isRecord(value) || Array.isArray(value)) {
        queue.push(value);
      }
    }
  }

  return null;
}

function extractTaxRate(payload: unknown): number | null {
  for (const path of TAX_RATE_PATHS) {
    const value = getValueAtPath(payload, path);
    const parsed = parseRate(value);
    if (parsed !== null) {
      return parsed;
    }
  }

  return findTaxRateByPattern(payload);
}

function findTaxCodeByPattern(payload: unknown): string | null {
  const queue: unknown[] = [payload];

  while (queue.length > 0) {
    const current = queue.shift();

    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }

    if (!isRecord(current)) {
      continue;
    }

    for (const [key, value] of Object.entries(current)) {
      const keyName = key.toLowerCase();
      const looksLikeTaxCodeKey =
        keyName === "tax_code" ||
        keyName === "taxcode" ||
        keyName === "t_tax_code" ||
        (keyName.includes("tax") && keyName.includes("code"));

      if (looksLikeTaxCodeKey) {
        const parsed = parseTaxCode(value);
        if (parsed !== null) {
          return parsed;
        }
      }

      if (isRecord(value) || Array.isArray(value)) {
        queue.push(value);
      }
    }
  }

  return null;
}

function extractTaxCode(payload: unknown): string | null {
  for (const path of TAX_CODE_PATHS) {
    const value = getValueAtPath(payload, path);
    const parsed = parseTaxCode(value);
    if (parsed !== null) {
      return parsed;
    }
  }

  return findTaxCodeByPattern(payload);
}

function readErrorKeyValue(payload: JsonRecord): string | null {
  for (const key of ERROR_KEYS) {
    const value = payload[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}

function extractApiError(payload: unknown): string | null {
  if (!isRecord(payload)) {
    return null;
  }

  const topLevelMessage = readErrorKeyValue(payload);
  if (topLevelMessage) {
    return topLevelMessage;
  }

  const nestedError = payload.error;
  if (isRecord(nestedError)) {
    return readErrorKeyValue(nestedError);
  }

  const status = payload.status;
  const message = payload.message;
  if (
    typeof status === "string" &&
    status.toLowerCase() === "error" &&
    typeof message === "string" &&
    message.trim().length > 0
  ) {
    return message.trim();
  }

  return null;
}

function parseJsonPayload(rawPayload: string): unknown {
  try {
    return JSON.parse(rawPayload) as unknown;
  } catch {
    return null;
  }
}

export async function getTaxRatesByAddress(
  address: string,
  zipcode: string
): Promise<TaxRateResult> {
  const normalizedAddress = address.trim();
  const normalizedZipcode = zipcode.trim();

  if (!normalizedAddress || !normalizedZipcode) {
    throw new Error("Address and zipcode are required.");
  }

  const params = new URLSearchParams({
    option: "tax_details",
    format: "json",
    address: normalizedAddress,
    zipcode: normalizedZipcode,
  });
  const response = await fetch(`/api/usgeocoder?${params.toString()}`);
  const rawPayload = await response.text();
  const payload = parseJsonPayload(rawPayload);
  const apiError = extractApiError(payload);

  if (!response.ok) {
    throw new Error(apiError ?? `Tax lookup failed (${response.status}).`);
  }

  if (!payload) {
    throw new Error("Tax API returned non-JSON data.");
  }

  if (apiError) {
    throw new Error(apiError);
  }

  const salesTaxRate = extractTaxRate(payload);
  if (salesTaxRate === null) {
    throw new Error("Tax API response did not include a usable total tax rate.");
  }
  const taxCode = extractTaxCode(payload);

  return {
    salesTaxRate,
    useTaxRate: salesTaxRate,
    taxCode,
  };
}