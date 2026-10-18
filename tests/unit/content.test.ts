import { afterEach, describe, expect, it, vi } from "vitest";
import productsJson from "@/content/products.json";
import siteJson from "@/content/site.json";
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
});
