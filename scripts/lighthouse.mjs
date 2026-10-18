// Lighthouse móvil sobre el sitio ya construido (out/), con los umbrales de AC-08:
// las cuatro categorías ≥ 90. Usa el Chromium de Playwright y Lighthouse 13.5.0 vía npx.
// Uso: npm run build && npm run lighthouse
import { execFileSync, spawn } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const MIN_SCORE = 90;
const port = 4190;
const report = join(tmpdir(), "lighthouse-green-banana.json");

const server = spawn(process.execPath, ["tests/e2e/server.mjs"], {
  env: { ...process.env, PORT: String(port) },
  stdio: "ignore",
});
await new Promise((resolve) => setTimeout(resolve, 1000));

let failed = false;
try {
  execFileSync(
    "npx",
    [
      "--yes",
      "lighthouse@13.5.0",
      `http://localhost:${port}/`,
      "--quiet",
      "--chrome-flags=--headless=new",
      "--output=json",
      `--output-path=${report}`,
      // Fuera de producción la página lleva noindex a propósito (demo con datos
      // ficticios, D-11); esa auditoría de SEO fallaría siempre. En producción se mide.
      ...(process.env.SITE_ENV === "production"
        ? []
        : ["--skip-audits=is-crawlable"]),
    ],
    {
      env: { ...process.env, CHROME_PATH: chromium.executablePath() },
      stdio: "inherit",
      shell: process.platform === "win32",
    },
  );
  const result = JSON.parse(readFileSync(report, "utf8"));
  for (const id of ["performance", "accessibility", "best-practices", "seo"]) {
    const { title, score } = result.categories[id];
    const value = Math.round(score * 100);
    failed ||= value < MIN_SCORE;
    console.log(`${value >= MIN_SCORE ? "✓" : "✗"} ${title}: ${value}`);
  }
  for (const id of [
    "largest-contentful-paint",
    "cumulative-layout-shift",
    "total-blocking-time",
  ]) {
    console.log(
      `  ${result.audits[id].title}: ${result.audits[id].displayValue}`,
    );
  }
} finally {
  server.kill();
  rmSync(report, { force: true });
}
process.exit(failed ? 1 : 0);
