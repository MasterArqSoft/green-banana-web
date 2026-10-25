import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getContent } from "@/lib/content";

const { copy } = getContent("es-CO");

// next/font solo funciona dentro del build de Next; en Vitest se simula.
vi.mock("@/app/fonts", () => ({
  fraunces: { variable: "" },
  inter: { variable: "" },
}));

// Controles del modo demo (D-11): franja de aviso y noindex fuera de producción.
describe("modo demo y producción (D-11)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.doUnmock("@/content/site.json");
    vi.doUnmock("@/lib/claims");
    vi.resetModules();
  });

  // En producción no puede haber datos ficticios; se simulan resueltos para
  // probar solo el cambio de modo (mismo patrón que seo.test.tsx).
  function simularProduccion() {
    vi.stubEnv("SITE_ENV", "production");
    vi.doMock("@/content/site.json", async (original) => ({
      default: {
        ...((await original()) as { default: object }).default,
        phoneIsPlaceholder: false,
      },
    }));
    vi.doMock("@/lib/claims", async (original) => ({
      ...(await original<typeof import("@/lib/claims")>()),
      findPendingMarkers: () => [],
    }));
  }

  it("fuera de producción muestra la franja de aviso", async () => {
    const { DemoBanner } = await import("@/components/ui/DemoBanner");
    const html = renderToStaticMarkup(<DemoBanner locale="es-CO" />);
    expect(html).toContain('role="note"');
    expect(html).toContain(copy.demoNotice);
  });

  it("en inglés el aviso explica la marca (FICTICIO), que se conserva (AC-26)", async () => {
    const { DemoBanner } = await import("@/components/ui/DemoBanner");
    const html = renderToStaticMarkup(<DemoBanner locale="en" />);
    expect(html).toContain(getContent("en").copy.demoNotice);
    expect(html).toContain("fictitious");
    expect(html).toContain("FICTICIO");
  });

  it.each(["(es)", "(en)"])(
    "fuera de producción las páginas del layout %s llevan noindex",
    async (grupo) => {
      const { metadata } = await import(`@/app/${grupo}/layout`);
      expect(metadata.robots).toEqual({ index: false, follow: false });
    },
  );

  it("en producción no muestra la franja", async () => {
    simularProduccion();
    const { DemoBanner } = await import("@/components/ui/DemoBanner");
    expect(renderToStaticMarkup(<DemoBanner locale="es-CO" />)).toBe("");
    expect(renderToStaticMarkup(<DemoBanner locale="en" />)).toBe("");
  });

  it.each(["(es)", "(en)"])(
    "en producción las páginas del layout %s son indexables",
    async (grupo) => {
      simularProduccion();
      const { metadata } = await import(`@/app/${grupo}/layout`);
      expect(metadata.robots).toEqual({ index: true, follow: true });
    },
  );

  it.each([false, true])(
    "la 404 no declara robots propio (Next agrega noindex), también en producción: %s",
    async (produccion) => {
      if (produccion) simularProduccion();
      const { metadata } = await import("@/app/global-not-found");
      expect(metadata.robots).toBeUndefined();
      expect(metadata.referrer).toBe("strict-origin-when-cross-origin");
    },
  );
});
