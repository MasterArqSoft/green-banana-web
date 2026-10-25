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
  // Si las pruebas se atascan, Playwright falla con un mensaje propio a los 5 min (en local
  // tardan ~12 s; T-111). No cubre un cierre colgado después de terminar: eso lo limita
  // timeout-minutes del paso en pages.yml.
  globalTimeout: 5 * 60_000,
  // Los dos proyectos de Chromium de siempre, sin sus filtros de archivos (que excluyen
  // prefijo.spec.ts). movil-320, WebKit y Firefox no corren la prueba de humo (T-108).
  projects: base.projects
    ?.filter((project) =>
      ["movil-360", "escritorio"].includes(project.name ?? ""),
    )
    .map((project) => ({
      ...project,
      testIgnore: undefined,
      testMatch: undefined,
    })),
  use: { ...base.use, baseURL: `http://localhost:${PORT}${BASE_PATH}/` },
  webServer: {
    command: "node tests/e2e/server.mjs",
    url: `http://localhost:${PORT}${BASE_PATH}/`,
    env: { OUT_DIR: "out-pages", BASE_PATH, PORT: String(PORT) },
    reuseExistingServer: !process.env.CI,
  },
});
