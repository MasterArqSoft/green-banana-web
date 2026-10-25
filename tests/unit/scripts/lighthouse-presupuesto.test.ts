import { describe, expect, it } from "vitest";
import {
  desgloseLcp,
  evaluar,
  mediana,
  PRESUPUESTO,
  resumenMarkdown,
  resumirDesgloses,
  SUBPARTES_LCP,
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

// Fragmento de un informe de Lighthouse 13 con el insight del desglose del LCP.
const informe = (carga: number, elemento = "section#hero > picture > img") => ({
  audits: {
    "lcp-breakdown-insight": {
      details: {
        items: [
          {
            type: "table",
            items: [
              { subpart: "timeToFirstByte", duration: 12 },
              { subpart: "resourceLoadDelay", duration: 700 },
              { subpart: "resourceLoadDuration", duration: carga },
              { subpart: "elementRenderDelay", duration: 47 },
            ],
          },
          { type: "node", selector: elemento },
        ],
      },
    },
  },
});

describe("desglose del LCP (T-80)", () => {
  it("extrae el elemento y las cuatro subpartes del informe", () => {
    expect(desgloseLcp(informe(1951))).toEqual({
      elemento: "section#hero > picture > img",
      subpartes: {
        timeToFirstByte: 12,
        resourceLoadDelay: 700,
        resourceLoadDuration: 1951,
        elementRenderDelay: 47,
      },
    });
  });

  it("sin el insight devuelve nulos en vez de fallar", () => {
    const vacio = desgloseLcp({ audits: {} });
    expect(vacio.elemento).toBeNull();
    expect(SUBPARTES_LCP.every((id) => vacio.subpartes[id] === null)).toBe(
      true,
    );
  });

  it("resume con la mediana de cada subparte y un solo elemento", () => {
    const resumen = resumirDesgloses(
      [1951, 1500, 2600].map((carga) => desgloseLcp(informe(carga))),
    );
    expect(resumen.subpartes.resourceLoadDuration).toBe(1951);
    expect(resumen.elementos).toEqual(["section#hero > picture > img"]);
  });

  it("informa si el elemento LCP cambió entre corridas", () => {
    const resumen = resumirDesgloses([
      desgloseLcp(informe(1951)),
      desgloseLcp(informe(1900, "main h1")),
    ]);
    expect(resumen.elementos).toEqual([
      "section#hero > picture > img",
      "main h1",
    ]);
  });
});

describe("resumen para GitHub Actions (T-85)", () => {
  const resumen = (corridas: ReturnType<typeof corrida>[]) =>
    resumenMarkdown({
      metodo: "simulate",
      runs: corridas.length,
      filas: evaluar(corridas),
      subpartes: resumirDesgloses([desgloseLcp(informe(1951))]).subpartes,
      elementos: ["section#hero > picture > img"],
    });

  it("con la ruta, la nombra en el título de su tabla (T-96)", () => {
    const texto = resumenMarkdown({
      metodo: "simulate",
      runs: 1,
      filas: evaluar([corrida(3000)]),
      subpartes: resumirDesgloses([desgloseLcp(informe(1951))]).subpartes,
      elementos: ["section#hero > picture > img"],
      ruta: "/en",
    });
    expect(texto).toContain(
      "### Lighthouse móvil, /en (simulate, mediana de 1 corridas)",
    );
  });

  it("muestra cada control con su mediana, su límite y si cumple", () => {
    const texto = resumen([corrida(3000), corrida(3100), corrida(2900)]);
    expect(texto).toContain(
      "| largest-contentful-paint | 3000 ms | ≤ 3400ms | sí |",
    );
    expect(texto).toContain("| performance | 92 | ≥ 90 | sí |");
    expect(texto).toContain("resourceLoadDuration 1951 ms");
    expect(texto).toContain("no bloquea la publicación");
  });

  it("marca con «no» lo que no cumple", () => {
    expect(resumen([corrida(3600), corrida(3700), corrida(3500)])).toContain(
      "| largest-contentful-paint | 3600 ms | ≤ 3400ms | no |",
    );
  });
});
