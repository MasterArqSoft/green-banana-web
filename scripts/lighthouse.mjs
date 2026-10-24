// Lighthouse móvil sobre el sitio ya construido (out/). Corre varias veces (LH_RUNS, 3 por
// defecto) y evalúa la mediana contra el presupuesto de laboratorio de
// scripts/lighthouse-presupuesto.mjs: las cuatro categorías ≥ 90 (AC-08) y, desde T-75
// (R-01), también LCP, CLS y TBT. Falla si cualquiera no cumple. Usa el Chromium de
// Playwright y Lighthouse 13.5.0 vía npx.
// Uso: npm run build && npm run lighthouse
import { execFileSync, spawn } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import { evaluar, PRESUPUESTO } from "./lighthouse-presupuesto.mjs";

const RUNS = Number(process.env.LH_RUNS ?? 3);
const port = 4190;
const report = join(tmpdir(), "lighthouse-green-banana.json");

function medir() {
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
  const categorias = Object.fromEntries(
    Object.keys(PRESUPUESTO.categorias).map((id) => [
      id,
      Math.round(result.categories[id].score * 100),
    ]),
  );
  const metricas = Object.fromEntries(
    Object.keys(PRESUPUESTO.metricas).map((id) => [
      id,
      result.audits[id].numericValue,
    ]),
  );
  return { categorias, metricas };
}

const server = spawn(process.execPath, ["tests/e2e/server.mjs"], {
  env: { ...process.env, PORT: String(port) },
  stdio: "ignore",
});
await new Promise((resolve) => setTimeout(resolve, 1000));

let failed = false;
try {
  const corridas = [];
  for (let i = 1; i <= RUNS; i++) {
    const corrida = medir();
    corridas.push(corrida);
    const lcp = corrida.metricas["largest-contentful-paint"];
    console.log(
      `  corrida ${i}/${RUNS}: Rendimiento ${corrida.categorias.performance}, LCP ${(lcp / 1000).toFixed(2)} s, TBT ${Math.round(corrida.metricas["total-blocking-time"])} ms`,
    );
  }
  console.log(`Mediana de ${RUNS} corridas:`);
  for (const { id, valor, unidad, limite, ok } of evaluar(corridas)) {
    failed ||= !ok;
    const texto =
      unidad === "ms" ? `${Math.round(valor)}ms` : Number(valor.toFixed(3));
    console.log(`${ok ? "✓" : "✗"} ${id}: ${texto} (${limite})`);
  }
} finally {
  server.kill();
  rmSync(report, { force: true });
}
process.exit(failed ? 1 : 0);
