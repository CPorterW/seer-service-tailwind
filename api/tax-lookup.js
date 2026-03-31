function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function parseAddress(rawBody) {
  if (!rawBody) return null;

  if (typeof rawBody === "string") {
    try {
      const parsed = JSON.parse(rawBody);
      return parseAddress(parsed);
    } catch {
      return null;
    }
  }

  if (typeof rawBody !== "object" || rawBody === null) {
    return null;
  }

  const address = rawBody.address;
  if (typeof address !== "string") {
    return null;
  }

  const trimmed = address.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  const geocoderApiKey =
    process.env.USGEOCODER_KEY || process.env.VITE_USGEOCODER_KEY || "";

  if (!geocoderApiKey) {
    sendJson(res, 500, { error: "Server is missing USGEOCODER_KEY." });
    return;
  }

  const address = parseAddress(req.body);
  if (!address) {
    sendJson(res, 400, { error: "Address is required." });
    return;
  }

  try {
    const params = new URLSearchParams({
      address,
      format: "json",
      zip4: "n",
      api_key: geocoderApiKey,
    });
    const upstream = await fetch(
      `https://usgeocoder.com/api/get_info.php?${params.toString()}`
    );
    const payload = await upstream.text();

    res.statusCode = upstream.status;
    res.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") ?? "application/json"
    );
    res.end(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Tax lookup request failed.";
    sendJson(res, 502, { error: message });
  }
}
