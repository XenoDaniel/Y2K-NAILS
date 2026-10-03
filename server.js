import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import helmet from "helmet";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const PRIVATE_FILES = new Set([
  "/.env",
  "/.gitignore",
  "/README.md",
  "/package.json",
  "/package-lock.json",
  "/server.js",
  "/server.test.js",
]);

export function createApp(publicDirectory = ROOT) {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net", "data:"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        frameSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      },
    },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }));

  app.use((request, response, next) => {
    if (
      PRIVATE_FILES.has(request.path) ||
      request.path.startsWith("/node_modules/") ||
      request.path.startsWith("/.git/")
    ) {
      return response.sendStatus(404);
    }
    next();
  });

  app.use(express.static(publicDirectory, { extensions: ["html"] }));

  app.use((error, _request, response, _next) => {
    console.error("Static site request failed:", error.message);
    return response.status(500).send("The site could not serve this page.");
  });

  return app;
}

export function startServer() {
  if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }
  return createApp().listen(PORT, () => {
    console.log(`Set Studio is available at http://localhost:${PORT}`);
    console.log("Booking mode: browser-only demo scheduler (no appointments are reserved).");
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    startServer();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
