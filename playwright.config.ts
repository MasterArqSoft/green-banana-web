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
  // Matriz soportada (T-108, DR-05; spec/01-spec.md, NFR de navegadores): Chromium en
  // todas las pruebas a 360 y 1280 px; Chromium a 320 px para reflow, composición,
  // accesibilidad y teclado; WebKit (perfil iPhone) y Firefox solo el subconjunto @smoke
  // (las 8 páginas, los botones Llamar, el selector de idioma y el mapa por clic).
  projects: [
    {
      // Móvil pequeño: diseño mobile-first a 360 px (P4).
      name: "movil-360",
      testIgnore: ["prefijo.spec.ts", "reflow.spec.ts"],
      use: {
        ...devices["Galaxy S9+"],
        viewport: { width: 360, height: 640 },
      },
    },
    {
      // 320 CSS px (WCAG 1.4.10): reflow con espaciado de texto y fuente al 200 % y
      // controles con foco no tapados (T-102, R-01), más composición, axe y teclado.
      name: "movil-320",
      testMatch: [
        "reflow.spec.ts",
        "layout.spec.ts",
        "a11y.spec.ts",
        "calls.spec.ts",
      ],
      use: {
        ...devices["Galaxy S9+"],
        viewport: { width: 320, height: 640 },
      },
    },
    {
      name: "escritorio",
      testIgnore: ["prefijo.spec.ts", "reflow.spec.ts"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "webkit-movil",
      grep: /@smoke/,
      testIgnore: ["prefijo.spec.ts", "reflow.spec.ts"],
      use: { ...devices["iPhone 13"] },
    },
    {
      name: "firefox-escritorio",
      grep: /@smoke/,
      testIgnore: ["prefijo.spec.ts", "reflow.spec.ts"],
      use: {
        ...devices["Desktop Firefox"],
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
