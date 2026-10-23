import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Archivos de una carpeta y sus subcarpetas, con "/" como separador.
const files = (dir: string): string[] =>
  readdirSync(dir, { recursive: true, encoding: "utf8" })
    .map((file) => file.replaceAll("\\", "/"))
    .filter((file) => /\.(ts|tsx)$/.test(file));

// Los componentes cliente necesitan un navegador (IntersectionObserver, Leaflet):
// los prueban tests/e2e/layout.spec.ts y mapa-fincas.spec.ts.
const SIN_PRUEBA_UNITARIA = ["components/cliente/"];

describe("tests/unit refleja src/ (CLAUDE.md, Pruebas)", () => {
  const modules = [
    ...files("src/components").map((file) => `components/${file}`),
    ...files("src/lib").map((file) => `lib/${file}`),
  ].filter((file) => !SIN_PRUEBA_UNITARIA.some((dir) => file.startsWith(dir)));

  it.each(modules)(
    "src/%s tiene su prueba en la carpeta equivalente",
    (file) => {
      const base = join("tests", "unit", file.replace(/\.tsx?$/, ""));
      expect(
        existsSync(`${base}.test.ts`) || existsSync(`${base}.test.tsx`),
      ).toBe(true);
    },
  );

  const tests = [
    ...files("tests/unit/components").map((file) => `components/${file}`),
    ...files("tests/unit/lib").map((file) => `lib/${file}`),
  ];

  it.each(tests)("tests/unit/%s corresponde a un módulo de src/", (file) => {
    const base = join("src", file.replace(/\.test\.tsx?$/, ""));
    expect(existsSync(`${base}.ts`) || existsSync(`${base}.tsx`)).toBe(true);
  });
});

describe("matriz de trazabilidad (spec/03-plan.md §12)", () => {
  const requisitos = [
    ...readFileSync("spec/01-spec.md", "utf8").matchAll(/^\| (FR-\d+) \|/gm),
  ].map((match) => match[1]);
  const matriz =
    readFileSync("spec/03-plan.md", "utf8").split("## 12.")[1] ?? "";

  it("01-spec.md define requisitos funcionales", () => {
    expect(requisitos.length).toBeGreaterThan(20);
  });

  it.each(requisitos)("%s aparece en la matriz", (fr) => {
    expect(matriz).toMatch(new RegExp(`\\b${fr}\\b`));
  });
});
