// vite.config.ts
import type { IncomingMessage } from "node:http";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import usgeocoderHandler from "./api/usgeocoder.js";
import taxLookupHandler from "./api/tax-lookup.js";

type MiddlewareNext = (err?: unknown) => void;

type QueryValue = string | string[];
type QueryParams = Record<string, QueryValue>;

type LocalApiRequest = IncomingMessage & {
  body?: unknown;
  query: QueryParams;
};

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

function parseQueryParams(req: IncomingMessage): QueryParams {
  const url = new URL(req.url ?? "/", "http://localhost");
  const query: QueryParams = {};

  for (const [key, value] of url.searchParams.entries()) {
    const existing = query[key];
    if (existing === undefined) {
      query[key] = value;
      continue;
    }

    if (Array.isArray(existing)) {
      existing.push(value);
    } else {
      query[key] = [existing, value];
    }
  }

  return query;
}

function parseBody(rawBody: string, contentTypeHeader: string | undefined): unknown {
  if (!rawBody) return "";
  if (!contentTypeHeader?.toLowerCase().includes("application/json")) {
    return rawBody;
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    return rawBody;
  }
}

function localApiMiddleware(): Plugin {
  return {
    name: "local-api-middleware",
    configureServer(server) {
      server.middlewares.use(async (req, res, next: MiddlewareNext) => {
        const path = req.url?.split("?")[0];

        if (path !== "/api/usgeocoder" && path !== "/api/tax-lookup") {
          next();
          return;
        }

        const localReq = req as LocalApiRequest;
        localReq.query = parseQueryParams(req);

        if (path === "/api/tax-lookup") {
          const rawBody = await readRequestBody(req);
          const contentType =
            typeof req.headers["content-type"] === "string"
              ? req.headers["content-type"]
              : undefined;
          localReq.body = parseBody(rawBody, contentType);
        }

        try {
          if (path === "/api/usgeocoder") {
            await usgeocoderHandler(localReq, res);
            return;
          }

          await taxLookupHandler(localReq, res);
        } catch (error: unknown) {
          next(error);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), localApiMiddleware()],
});
