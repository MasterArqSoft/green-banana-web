import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { pendingMarkerEntries } from "@/lib/content";
import { agrupar } from "../../../scripts/pendientes-grupos.mjs";

// Revisión de T-121 (N-6 a): scripts/cargar-src.mjs ubica src/ desde su propio archivo,
// no desde el directorio de trabajo. Se ejecuta Node de verdad desde un directorio ajeno
// al repositorio, con rutas absolutas.
const raiz = resolve(import.meta.dirname, "../../..");
const cargador = pathToFileURL(join(raiz, "scripts/cargar-src.mjs")).href;
const ajeno = mkdtempSync(join(tmpdir(), "cargar-src-"));
afterAll(() => rmSync(ajeno, { recursive: true, force: true }));

function node(...args: string[]) {
  return spawnSync(
    process.execPath,
    [
      "--no-warnings=MODULE_TYPELESS_PACKAGE_JSON",
      "--import",
      cargador,
      ...args,
    ],
    { cwd: ajeno, encoding: "utf8", env: { ...process.env, SITE_ENV: "" } },
  );
}

describe("scripts/cargar-src.mjs", () => {
  it("desde otro directorio, npm run pendientes da los mismos grupos que el contenido", () => {
    const salida = node(join(raiz, "scripts/pendientes.mjs"), "--json");
    expect(salida.stderr).toBe("");
    expect(salida.status).toBe(0);
    const grupos: { id: string; entradas: unknown[] }[] = JSON.parse(
      salida.stdout,
    );
    expect(grupos).toEqual(agrupar(pendingMarkerEntries()));
    expect(
      grupos.find((g) => g.id === "RP-04")?.entradas.length,
    ).toBeGreaterThan(0);
  }, 30_000);

  it("un «@/» que no existe falla con un mensaje que dice qué falta", () => {
    const script = join(ajeno, "falta.mjs");
    writeFileSync(script, 'import "@/lib/no-existe";\n');
    const salida = node(script);
    expect(salida.status).not.toBe(0);
    expect(salida.stderr).toContain("cargar-src: no existe «@/lib/no-existe»");
  }, 30_000);
});
