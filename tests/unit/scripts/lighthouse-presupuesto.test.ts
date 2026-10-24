import { describe, expect, it } from "vitest";
import {
  evaluar,
  mediana,
  PRESUPUESTO,
} from "../../../scripts/lighthouse-presupuesto.mjs";

const corrida = (lcp: number, tbt = 100, perf = 92, cls = 0) => ({
  categorias: {
    performance: perf,
    accessibility: 100,
    "best-practices": 100,
    seo: 100,
  },
  metricas: {
    "largest-contentful-paint": lcp,
    "cumulative-layout-shift": cls,
    "total-blocking-time": tbt,
  },
});

const fallidos = (corridas: ReturnType<typeof corrida>[]) =>
  evaluar(corridas)
    .filter((fila) => !fila.ok)
    .map((fila) => fila.id);

describe("presupuesto de laboratorio de Lighthouse (T-75, R-01)", () => {
  it("la mediana resiste una corrida atípica", () => {
    expect(mediana([3200, 9000, 3100])).toBe(3200);
    expect(mediana([1, 2, 3, 4])).toBe(2.5);
  });

  it("pasa con las mediciones actuales (LCP 3,2 s, TBT 110 ms, Rendimiento 92)", () => {
    expect(
      fallidos([corrida(3200, 110), corrida(3300), corrida(3200)]),
    ).toEqual([]);
  });

  it("falla si el LCP supera su presupuesto aunque las categorías den ≥ 90", () => {
    expect(fallidos([corrida(3450), corrida(3500), corrida(3200)])).toEqual([
      "largest-contentful-paint",
    ]);
  });

  it("falla por TBT o por una categoría bajo el mínimo", () => {
    expect(fallidos([corrida(3200, 250), corrida(3200, 260)])).toEqual([
      "total-blocking-time",
    ]);
    expect(fallidos([corrida(3200, 100, 85), corrida(3200, 100, 88)])).toEqual([
      "performance",
    ]);
  });

  it("el límite exacto pasa (≤) y un CLS de 0,15 falla", () => {
    expect(fallidos([corrida(3400), corrida(3400), corrida(3400)])).toEqual([]);
    expect(
      fallidos([corrida(3200, 100, 92, 0.15), corrida(3200, 100, 92, 0.2)]),
    ).toEqual(["cumulative-layout-shift"]);
  });

  it("el presupuesto de LCP es 3400 ms, no la meta de campo de 2,5 s (T-76)", () => {
    // Cambiar el presupuesto es una decisión explícita: hay que actualizar esta prueba.
    expect(PRESUPUESTO.metricas["largest-contentful-paint"].max).toBe(3400);
  });
});
