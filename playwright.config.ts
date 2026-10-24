import { defineConfig, devices } from "@playwright/test";

// Pruebas en navegador (T-33, T-37) sobre el sitio ya exportado en out/.
// `npm run test:e2e` construye primero y luego levanta tests/e2e/server.mjs.
export default defineConfig({
  testDir: "tests/e2e",
  // La prueba de humo con prefijo tiene su propia configuración (playwright.prefijo.config.ts).
  testIgnore: "prefijo.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4173",
    trace: "retain-on-failure",
  },
  projects: [
    {
      // Móvil pequeño: diseño mobile-first a 360 px (P4).
      name: "movil-360",
      use: {
        ...devices["Galaxy S9+"],
        viewport: { width: 360, height: 640 },
      },
    },
    {
      name: "escritorio",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  webServer: {
    command: "node tests/e2e/server.mjs",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
  },
});
