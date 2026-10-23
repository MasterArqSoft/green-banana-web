import { afterEach, describe, expect, it, vi } from "vitest";
import { findPendingMarkers } from "@/lib/claims";

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

  it("las fincas (FICTICIO) bloquean por sí solas el build de producción (AC-17)", async () => {
    vi.stubEnv("SITE_ENV", "production");
    vi.doMock("@/content/site.json", async (original) => ({
      default: {
        ...((await original()) as { default: object }).default,
        phoneIsPlaceholder: false,
      },
    }));
    await expect(import("@/lib/content")).rejects.toThrow(
      "fincas.fincas[1].nombre: Finca de ejemplo A (FICTICIO)",
    );
    vi.doUnmock("@/content/site.json");
  });

  it("cuenta 42 datos ficticios o por confirmar (checklist para publicar)", async () => {
    const content = await import("@/lib/content");
    const { site, products, zones, faq, recipes, origin, copy } = content;
    const { testimonials, legal, fincas } = content;
    expect(
      findPendingMarkers({
        site,
        products,
        zones,
        faq,
        recipes,
        origin,
        copy,
        testimonials,
        legal,
        fincas,
      }),
    ).toHaveLength(42);
  });
});
