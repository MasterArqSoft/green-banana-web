// Lighthouse móvil sobre el sitio ya construido (out/). Corre varias veces (LH_RUNS, 3 por
// defecto) y evalúa la mediana contra el presupuesto de laboratorio de
// scripts/lighthouse-presupuesto.mjs: las cuatro categorías ≥ 90 (AC-08) y, desde T-75
// (R-01), también LCP, CLS y TBT. Falla si cualquiera no cumple. Usa el Chromium de
// Playwright y Lighthouse 13.5.0 vía npx.
// Desde T-80 informa también las subpartes del LCP y el elemento LCP de cada corrida, y
// acepta dos variables para comparar variantes con el mismo método:
// - LH_THROTTLING=devtools: throttling aplicado durante la carga en vez del simulado. Es
//   solo diagnóstico: el presupuesto está medido con el simulado y no se evalúa.
// - LH_SALIDA=<archivo.json>: guarda el resumen (corridas, medianas, subpartes, elemento).
// Uso: npm run build && npm run lighthouse
import { execFileSync, spawn } from "node:child_process";
import { appendFileSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import {
  desgloseLcp,
  evaluar,
  PRESUPUESTO,
  resumenMarkdown,
  resumirDesgloses,
  SUBPARTES_LCP,
} from "./lighthouse-presupuesto.mjs";

const RUNS = Number(process.env.LH_RUNS ?? 3);
if (!Number.isInteger(RUNS) || RUNS < 1) {
  throw new Error(
    `LH_RUNS debe ser un entero ≥ 1 (recibido: ${process.env.LH_RUNS})`,
  );
}
const METODO = process.env.LH_THROTTLING ?? "simulate";
if (!["simulate", "devtools"].includes(METODO)) {
  throw new Error(
    `LH_THROTTLING debe ser simulate o devtools (recibido: ${METODO})`,
  );
}
const diagnostico = METODO !== "simulate";
const port = 4190;
const report = join(tmpdir(), "lighthouse-green-banana.json");

function medir() {
  // Sin restos de la corrida anterior: si esta falla a medias, no se lee el informe viejo.
  rmSync(report, { force: true });
  execFileSync(
    "npx",
    [
      "--yes",
      "lighthouse@13.5.0",
      `http://localhost:${port}/`,
      "--quiet",
      // En CI (GitHub Actions, Ubuntu) Chrome no puede usar su sandbox: el sistema no
      // permite los espacios de nombres que necesita. Playwright hace lo mismo.
      `--chrome-flags=--headless=new${process.env.CI ? " --no-sandbox" : ""}`,
      `--throttling-method=${METODO}`,
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
  if (result.runtimeError) {
    throw new Error(`Lighthouse no pudo medir: ${result.runtimeError.message}`);
  }
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
  return { categorias, metricas, desglose: desgloseLcp(result) };
}

// Se espera el mensaje con que server.mjs confirma que escucha. Sondear el puerto no
// basta: si otro proceso lo ocupara (p. ej. un servidor viejo con otro out/), respondería
// él y se mediría el sitio equivocado. Si el servidor muere o no confirma en 10 s, se aborta.
const server = spawn(process.execPath, ["tests/e2e/server.mjs"], {
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
});
process.on("SIGINT", () => {
  server.kill();
  process.exit(130);
});
await new Promise((resolve, reject) => {
  const limite = setTimeout(
    () => reject(new Error("server.mjs no confirmó en 10 s")),
    10_000,
  );
  let errores = "";
  server.stderr.on("data", (chunk) => (errores += chunk));
  server.stdout.on("data", (chunk) => {
    if (String(chunk).includes(`http://localhost:${port}`)) {
      clearTimeout(limite);
      resolve();
    }
  });
  server.once("exit", (code) => {
    clearTimeout(limite);
    reject(new Error(`server.mjs terminó (código ${code}): ${errores.trim()}`));
  });
});

let failed = false;
try {
  console.log(
    `Método de throttling: ${METODO}${diagnostico ? " (diagnóstico: el presupuesto no se evalúa)" : ""}`,
  );
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
  const filas = evaluar(corridas);
  for (const { id, valor, unidad, limite, ok } of filas) {
    if (!diagnostico) failed ||= !ok;
    const texto =
      unidad === "ms" ? `${Math.round(valor)}ms` : Number(valor.toFixed(3));
    const marca = diagnostico ? "·" : ok ? "✓" : "✗";
    console.log(`${marca} ${id}: ${texto} (${limite})`);
  }
  const { subpartes, elementos } = resumirDesgloses(
    corridas.map((c) => c.desglose),
  );
  console.log(
    `Subpartes del LCP (mediana): ${SUBPARTES_LCP.map((id) => `${id} ${subpartes[id] === null ? "–" : `${Math.round(subpartes[id])}ms`}`).join(" · ")}`,
  );
  // Con el método simulado, Lighthouse calcula las subpartes sobre la traza sin
  // throttling: no suman el LCP simulado. Para saber dónde se va el tiempo, DevTools.
  if (!diagnostico) {
    console.log(
      "  (traza sin throttling: no suman el LCP simulado; para el desglose, LH_THROTTLING=devtools)",
    );
  }
  // Comparar variantes solo vale si el elemento LCP no cambió (T-80).
  console.log(
    elementos.length === 1
      ? `Elemento LCP: ${elementos[0]}`
      : `⚠ El elemento LCP cambió entre corridas: ${elementos.join(" | ")}`,
  );
  // En GitHub Actions, tabla en el resumen del job (T-85).
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      resumenMarkdown({
        metodo: METODO,
        runs: RUNS,
        filas,
        subpartes,
        elementos,
      }),
    );
  }
  if (process.env.LH_SALIDA) {
    writeFileSync(
      process.env.LH_SALIDA,
      JSON.stringify(
        { metodo: METODO, corridas, mediana: filas, subpartes, elementos },
        null,
        2,
      ),
    );
    console.log(`Resumen guardado en ${process.env.LH_SALIDA}`);
  }
} finally {
  server.kill();
  rmSync(report, { force: true });
}
process.exit(failed ? 1 : 0);
