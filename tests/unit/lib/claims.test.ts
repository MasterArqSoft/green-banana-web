import { describe, expect, it } from "vitest";
import fincasJson from "@/content/fincas.json";
import { findForbiddenClaims, findPendingMarkers } from "@/lib/claims";

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

  it("acepta la formulación permitida", () => {
    expect(
      findForbiddenClaims("Fuente de almidón resistente, un tipo de fibra."),
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

  it("encuentra las fincas y productores ficticios", () => {
    const found = findPendingMarkers({ fincas: structuredClone(fincasJson) });
    expect(found).toHaveLength(10);
    expect(found).toContain(
      "fincas.fincas[1].nombre: Finca de ejemplo A (FICTICIO)",
    );
    expect(found).toContain(
      "fincas.fincas[5].productor: Productor de ejemplo (FICTICIO)",
    );
  });

  it("no marca contenido definitivo", () => {
    expect(
      findPendingMarkers({ site: { brand: "Marca", url: "https://marca.co" } }),
    ).toEqual([]);
  });
});
