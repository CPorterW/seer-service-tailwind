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
  const geocoderApiKey =
    env.USGEOCODER_KEY ||
    process.env.USGEOCODER_KEY ||
    env.VITE_USGEOCODER_KEY ||
    process.env.VITE_USGEOCODER_KEY ||
    "";

  return {
    plugins: [react(), tailwindcss(), taxLookupProxy(geocoderApiKey)],
    server: {
      proxy: {
        "/api/usgeocoder": {
          target: "https://api.usgeocoder.com/api/sample_info.php",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/usgeocoder/, ""),
        },
      },
    },
  };
});
