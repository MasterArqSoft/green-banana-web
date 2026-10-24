import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

// Prueba de humo del artefacto que se publica en GitHub Pages (T-71, H-01): el build
// con prefijo de out-pages/ (npm run build:prefijo), servido solo bajo ese prefijo.
// Mismo valor por defecto que scripts/build-prefijo.mjs.
const BASE_PATH = process.env.PAGES_BASE_PATH ?? "/green-banana-web";
const PORT = 4174;

export default defineConfig({
  ...base,
  testIgnore: undefined,
  testMatch: "prefijo.spec.ts",
  use: { ...base.use, baseURL: `http://localhost:${PORT}${BASE_PATH}/` },
  webServer: {
    command: "node tests/e2e/server.mjs",
    url: `http://localhost:${PORT}${BASE_PATH}/`,
    env: { OUT_DIR: "out-pages", BASE_PATH, PORT: String(PORT) },
    reuseExistingServer: !process.env.CI,
  },
});
