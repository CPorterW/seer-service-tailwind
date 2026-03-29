// vite.config.ts
import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
type MiddlewareNext = (err?: unknown) => void;
function sendJson(
  res: ServerResponse<IncomingMessage>,
  status: number,
  body: Record<string, unknown>
) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk: string) => {
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function parseAddress(rawBody: string): string | null {
  try {
    const parsed = JSON.parse(rawBody) as unknown;
    if (!parsed || typeof parsed !== "object" || !("address" in parsed)) {
      return null;
    }

    const address = (parsed as { address: unknown }).address;
    if (typeof address !== "string") return null;

    const trimmed = address.trim();
    return trimmed.length > 0 ? trimmed : null;
  } catch {
    return null;
  }
}

function normalizeServerPath(serverPath: string): string {
  return serverPath.trim().replace(/\/+$/, "");
}

function geocoderMiddleware(serverPath: string, authKey: string) {
  const normalizedServerPath = normalizeServerPath(serverPath);
  const endpoint = normalizedServerPath.endsWith("/get_info.php")
    ? normalizedServerPath
    : `${normalizedServerPath}/get_info.php`;

  return async (
    req: IncomingMessage,
    res: ServerResponse<IncomingMessage>,
    next: MiddlewareNext
  ) => {
    const path = req.url?.split("?")[0];
    if (path !== "/api/usgeocoder") {
      next();
      return;
    }

    if (req.method !== "GET") {
      sendJson(res, 405, { error: "Method not allowed." });
      return;
    }

    if (!normalizedServerPath) {
      sendJson(res, 500, { error: "Server is missing USGEOCODER_SERVER_PATH." });
      return;
    }

    if (!authKey) {
      sendJson(res, 500, { error: "Server is missing USGEOCODER_KEY." });
      return;
    }

    try {
      const url = new URL(req.url ?? "/api/usgeocoder", "http://localhost");
      const address = url.searchParams.get("address")?.trim();
      const zipcode = url.searchParams.get("zipcode")?.trim();
      const option = url.searchParams.get("option")?.trim();

      if (!address || !zipcode) {
        sendJson(res, 400, { error: "Both address and zipcode are required." });
        return;
      }

      const params = new URLSearchParams({
        address,
        zipcode,
        authkey: authKey,
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
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Tax lookup request failed.";
      sendJson(res, 502, { error: message });
    }
  };
}

function geocoderProxy(serverPath: string, authKey: string): Plugin {
  const middleware = geocoderMiddleware(serverPath, authKey);

  return {
    name: "geocoder-proxy",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

function taxLookupMiddleware(apiKey: string) {
  return async (
    req: IncomingMessage,
    res: ServerResponse<IncomingMessage>,
    next: MiddlewareNext
  ) => {
    const path = req.url?.split("?")[0];
    if (path !== "/api/tax-lookup") {
      next();
      return;
    }

    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Method not allowed." });
      return;
    }

    if (!apiKey) {
      sendJson(res, 500, { error: "Server is missing USGEOCODER_KEY." });
      return;
    }

    try {
      const rawBody = await readRequestBody(req);
      const address = parseAddress(rawBody);

      if (!address) {
        sendJson(res, 400, { error: "Address is required." });
        return;
      }

      const params = new URLSearchParams({
        address,
        format: "json",
        zip4: "n",
        api_key: apiKey,
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
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Tax lookup request failed.";
      sendJson(res, 502, { error: message });
    }
  };
}

function taxLookupProxy(apiKey: string): Plugin {
  const middleware = taxLookupMiddleware(apiKey);

  return {
    name: "tax-lookup-proxy",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const geocoderServerPath =
    env.USGEOCODER_SERVER_PATH ||
    process.env.USGEOCODER_SERVER_PATH ||
    env.VITE_USGEOCODER_BASE_URL ||
    process.env.VITE_USGEOCODER_BASE_URL ||
    "https://api.usgeocoder.com/api";
  const geocoderApiKey =
    env.USGEOCODER_KEY ||
    process.env.USGEOCODER_KEY ||
    env.VITE_USGEOCODER_KEY ||
    process.env.VITE_USGEOCODER_KEY ||
    "";

  return {
    plugins: [
      react(),
      tailwindcss(),
      geocoderProxy(geocoderServerPath, geocoderApiKey),
      taxLookupProxy(geocoderApiKey),
    ],
  };
});
