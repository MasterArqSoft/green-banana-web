import { afterEach, describe, expect, it, vi } from "vitest";
import productsJson from "@/content/products.json";
import siteJson from "@/content/site.json";
import { findPendingMarkers } from "@/lib/claims";
import { productsSchema, siteSchema } from "@/lib/schema";

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

describe("carga del contenido", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("valida los archivos actuales fuera de producción", async () => {
    const content = await import("@/lib/content");
    expect(content.isProduction).toBe(false);
    expect(content.site.phoneIsPlaceholder).toBe(true);
  });

  it("el contenido actual no tiene frases prohibidas (P1, P3)", async () => {
    await expect(import("@/lib/content")).resolves.toBeDefined();
  });

  it("bloquea el build de producción con el número ficticio (riesgo R5)", async () => {
    vi.stubEnv("SITE_ENV", "production");
    await expect(import("@/lib/content")).rejects.toThrow(
      "Build de producción bloqueado",
    );
  });

  it("bloquea producción mientras queden datos ficticios o por confirmar (T-39)", async () => {
    vi.stubEnv("SITE_ENV", "production");
    // Aun con el número real, quedan las demás marcas (FICTICIO), [POR CONFIRMAR]...
    vi.doMock("@/content/site.json", async (original) => ({
      default: {
        ...((await original()) as { default: object }).default,
        phoneIsPlaceholder: false,
      },
    }));
    await expect(import("@/lib/content")).rejects.toThrow(
      /quedan \d+ datos ficticios o por confirmar/,
    );
    vi.doUnmock("@/content/site.json");
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

  it("no marca contenido definitivo", () => {
    expect(
      findPendingMarkers({ site: { brand: "Marca", url: "https://marca.co" } }),
    ).toEqual([]);
  });
});
