import { describe, expect, it } from "vitest";
import copyJson from "@/content/copy.json";
import fincasJson from "@/content/fincas.json";
import productsJson from "@/content/products.json";
import siteJson from "@/content/site.json";
import {
  copySchema,
  fincasSchema,
  productsSchema,
  siteSchema,
} from "@/lib/schema";

// Copia profunda para modificar el contenido sin tocar el import original.
const clone = <T>(value: T): T => structuredClone(value);

describe("esquemas de contenido", () => {
  it("rechaza un precio en una presentación (AC-02)", () => {
    const products = clone(productsJson) as Record<string, unknown>[];
    products[1].pricePerKg = 3500;
    expect(productsSchema.safeParse(products).success).toBe(false);
  });

  it("rechaza un teléfono sin formato E.164", () => {
    const site = { ...clone(siteJson), phone: "3000000000" };
    expect(siteSchema.safeParse(site).success).toBe(false);
  });

  it("rechaza un dato legal vacío", () => {
    const site = clone(siteJson);
    site.legal.nit = "  ";
    expect(siteSchema.safeParse(site).success).toBe(false);
  });
});

describe("esquema de fincas (FR-24, AC-17)", () => {
  it("acepta el archivo actual", () => {
    expect(fincasSchema.safeParse(fincasJson).success).toBe(true);
  });

  it("rechaza una latitud fuera de rango", () => {
    const data = clone(fincasJson);
    data.fincas[1].lat = 95;
    expect(fincasSchema.safeParse(data).success).toBe(false);
  });

  it("rechaza una longitud fuera de rango", () => {
    const data = clone(fincasJson);
    data.fincas[1].lng = -181;
    expect(fincasSchema.safeParse(data).success).toBe(false);
  });

  it("rechaza un id repetido", () => {
    const data = clone(fincasJson);
    data.fincas[2].id = data.fincas[1].id;
    expect(fincasSchema.safeParse(data).success).toBe(false);
  });

  it("rechaza un campo no previsto", () => {
    const data = clone(fincasJson) as {
      fincas: Record<string, unknown>[];
    };
    data.fincas[1].hectareas = 12;
    expect(fincasSchema.safeParse(data).success).toBe(false);
  });

  it("rechaza un zoom fuera de 5 a 15", () => {
    expect(
      fincasSchema.safeParse({ ...clone(fincasJson), zoom: 18 }).success,
    ).toBe(false);
  });
});

describe("esquema de copy.json", () => {
  it("rechaza un texto al que le falta su marcador", () => {
    const copy = structuredClone(copyJson);
    copy.topBar.acopio = "Acopio en Santa Marta";
    expect(copySchema.safeParse(copy).success).toBe(false);
  });

  it("rechaza una sección no prevista", () => {
    const copy = { ...structuredClone(copyJson), hero: { title: "Hola" } };
    expect(copySchema.safeParse(copy).success).toBe(false);
  });
});
