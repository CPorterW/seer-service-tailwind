function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function firstQueryValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeServerPath(serverPath) {
  return serverPath.trim().replace(/\/+$/, "");
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  const geocoderServerPath =
    process.env.USGEOCODER_SERVER_PATH ||
    process.env.VITE_USGEOCODER_BASE_URL ||
    "https://api.usgeocoder.com/api";
  const geocoderApiKey =
    process.env.USGEOCODER_KEY || process.env.VITE_USGEOCODER_KEY || "";

  const normalizedServerPath = normalizeServerPath(geocoderServerPath);
  const endpoint = normalizedServerPath.endsWith("/get_info.php")
    ? normalizedServerPath
    : `${normalizedServerPath}/get_info.php`;

  if (!normalizedServerPath) {
    sendJson(res, 500, { error: "Server is missing USGEOCODER_SERVER_PATH." });
    return;
  }

  if (!geocoderApiKey) {
    sendJson(res, 500, { error: "Server is missing USGEOCODER_KEY." });
    return;
  }

  const address = String(firstQueryValue(req.query.address) ?? "").trim();
  const zipcode = String(firstQueryValue(req.query.zipcode) ?? "").trim();
  const option = String(firstQueryValue(req.query.option) ?? "").trim();

  if (!address || !zipcode) {
    sendJson(res, 400, { error: "Both address and zipcode are required." });
    return;
  }

  try {
    const params = new URLSearchParams({
      address,
      zipcode,
      authkey: geocoderApiKey,
      format: "json",
    });

    if (option) {
      params.set("option", option);
    }

    const upstream = await fetch(`${endpoint}?${params.toString()}`);
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
