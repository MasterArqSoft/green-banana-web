import { describe, expect, it } from "vitest";
import fincasJson from "@/content/fincas.json";
import enFincas from "@/content/en/fincas.json";
import esFincas from "@/content/es-CO/fincas.json";
import {
  countPendingMarkers,
  findForbiddenClaims,
  findPendingMarkerEntries,
  findPendingMarkers,
} from "@/lib/claims";

describe("findForbiddenClaims (P1, P3)", () => {
  it("detecta frases prohibidas sin importar tildes ni mayúsculas", () => {
    expect(findForbiddenClaims("Ayuda contra el CANCER")).toEqual(["cáncer"]);
    expect(findForbiddenClaims("Controla la diabetes")).toEqual(["diabetes"]);
    expect(findForbiddenClaims("Ideal para bajar de peso")).toEqual([
      "bajar de peso",
    ]);
    expect(findForbiddenClaims("¡Cupos limitados!")).toEqual([
      "cupos limitados",
    ]);
  });

  it("detecta los equivalentes en inglés (D-16)", () => {
    expect(findForbiddenClaims("Great for WEIGHT LOSS")).toEqual([
      "weight loss",
    ]);
    expect(findForbiddenClaims("Prevents cancer")).toEqual(["cáncer"]);
    expect(findForbiddenClaims("The best green banana")).toEqual(["the best"]);
    expect(findForbiddenClaims("Limited time offer, today only")).toEqual([
      "today only",
      "limited time",
    ]);
    expect(findForbiddenClaims("Only a few left!")).toEqual([
      "only a few left",
    ]);
  });

  it("acepta la formulación permitida", () => {
    expect(
      findForbiddenClaims("Fuente de almidón resistente, un tipo de fibra."),
    ).toEqual([]);
    expect(
      findForbiddenClaims("A source of resistant starch, a type of fiber."),
    ).toEqual([]);
  });
});

describe("findPendingMarkers (T-39)", () => {
  it("encuentra marcas de dato ficticio o pendiente con su ruta", () => {
    const found = findPendingMarkers({
      site: { brand: "Marca (FICTICIO)", url: "https://x.github.io/demo" },
      faq: [{ answer: "Entre [4 y 7] días" }, { answer: "Listo" }],
    });
    expect(found).toEqual([
      "site.brand: Marca (FICTICIO)",
      "site.url: https://x.github.io/demo",
      "faq[0].answer: Entre [4 y 7] días",
    ]);
  });

  it("cuenta las cifras de productos sin confirmar", () => {
    expect(
      findPendingMarkers({
        products: [{ id: "unit", pendingConfirmation: ["approxWeightG"] }],
      }),
    ).toEqual(["products[0].pendingConfirmation: approxWeightG"]);
  });

  it("encuentra los productores ficticios y los nombres de fincas de cada idioma", () => {
    const found = findPendingMarkers({
      fincas: structuredClone(fincasJson),
      "es-CO": { fincas: esFincas },
      en: { fincas: enFincas },
    });
    expect(found).toHaveLength(15);
    expect(found).toContain(
      "fincas.fincas[5].productor: Productor de ejemplo (FICTICIO)",
    );
    expect(found).toContain(
      "es-CO.fincas.finca-a: Finca de ejemplo A (FICTICIO)",
    );
    expect(found).toContain("en.fincas.finca-a: Example farm A (FICTICIO)");
  });

  it("no marca contenido definitivo", () => {
    expect(
      findPendingMarkers({ site: { brand: "Marca", url: "https://marca.co" } }),
    ).toEqual([]);
  });
});

describe("countPendingMarkers (paridad, AC-24)", () => {
  it("cuenta cada marca, también varias en el mismo texto", () => {
    expect(countPendingMarkers("Entre [4 y 7] días [POR CONFIRMAR]")).toBe(2);
    expect(countPendingMarkers("Finca (FICTICIO)")).toBe(1);
    expect(countPendingMarkers("Listo")).toBe(0);
  });
});

describe("findPendingMarkerEntries (T-117)", () => {
  it("devuelve la ruta y el texto completo, sin recortar", () => {
    const largo = `${"x".repeat(100)} [POR CONFIRMAR, RP-04]`;
    expect(findPendingMarkerEntries({ copy: { texto: largo } })).toEqual([
      { ruta: "copy.texto", texto: largo },
    ]);
    expect(findPendingMarkers({ copy: { texto: largo } })).toEqual([
      `copy.texto: ${largo.slice(0, 80)}`,
    ]);
  });
});
