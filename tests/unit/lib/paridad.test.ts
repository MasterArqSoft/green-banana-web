import { describe, expect, it } from "vitest";
import enCopy from "@/content/en/copy.json";
import esCopy from "@/content/es-CO/copy.json";
import { diferenciasDeCatalogo, idsSinPareja, variables } from "@/lib/paridad";

describe("variables", () => {
  it("devuelve los marcadores sin repetir y ordenados", () => {
    expect(variables("{b} y {a}, otra vez {b}")).toEqual(["a", "b"]);
    expect(variables("sin marcadores")).toEqual([]);
  });
});

describe("paridad entre catálogos (AC-24)", () => {
  it("los copy.json actuales coinciden", () => {
    expect(diferenciasDeCatalogo(esCopy, enCopy)).toEqual([]);
  });

  it("detecta una traducción que falta", () => {
    const sinHero: Partial<typeof enCopy> = structuredClone(enCopy);
    delete sinHero.hero;
    expect(diferenciasDeCatalogo(esCopy, sinHero)).toEqual(["hero: falta"]);
  });

  it("detecta una clave que sobra", () => {
    const extra = { ...structuredClone(enCopy), extra: "x" };
    expect(diferenciasDeCatalogo(esCopy, extra)).toEqual(["extra: sobra"]);
  });

  it("detecta un marcador {…} distinto", () => {
    const en = structuredClone(enCopy);
    en.topBar.acopio = "Collection center in {city}";
    expect(diferenciasDeCatalogo(esCopy, en)).toEqual([
      "topBar.acopio: marcadores {city}, se esperaba {ciudad}",
    ]);
  });

  it("detecta una marca de pendiente perdida en la traducción", () => {
    const en = structuredClone(enCopy);
    en.freshInfo.text = "They keep for 4 to 7 days.";
    expect(diferenciasDeCatalogo(esCopy, en)).toEqual([
      "freshInfo.text: 0 marcas de pendiente, se esperaban 2",
    ]);
  });

  it("detecta listas de distinto largo y elementos con otro id", () => {
    expect(diferenciasDeCatalogo(["a", "b"], ["a"], "pasos")).toEqual([
      "pasos: 1 elementos, se esperaban 2",
    ]);
    expect(
      diferenciasDeCatalogo(
        [{ id: "precio", q: "¿Cuánto?" }],
        [{ id: "price", q: "How much?" }],
        "faq",
      ),
    ).toEqual(["faq[0]: id price, se esperaba precio"]);
  });

  it("detecta un tipo distinto", () => {
    expect(diferenciasDeCatalogo({ a: ["x"] }, { a: "x" })).toEqual([
      "a: tipo string, se esperaba lista",
    ]);
  });
});

describe("idsSinPareja", () => {
  it("informa textos faltantes y textos sin dato común", () => {
    expect(
      idsSinPareja(["unit", "kg"], { unit: {}, caja: {} }, "en/products"),
    ).toEqual([
      "en/products.kg: falta el texto",
      "en/products.caja: no corresponde a ningún dato común",
    ]);
    expect(idsSinPareja(["unit"], { unit: {} }, "x")).toEqual([]);
  });
});
