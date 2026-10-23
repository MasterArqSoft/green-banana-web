import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { copy } from "@/lib/content";

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
    const html = renderToStaticMarkup(<DemoBanner />);
    expect(html).toContain('role="note"');
    expect(html).toContain(copy.demoNotice);
  });

  it("fuera de producción la página lleva noindex", async () => {
    const { metadata } = await import("@/app/layout");
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it("en producción no muestra la franja", async () => {
    simularProduccion();
    const { DemoBanner } = await import("@/components/ui/DemoBanner");
    expect(renderToStaticMarkup(<DemoBanner />)).toBe("");
  });

  it("en producción la página es indexable", async () => {
    simularProduccion();
    const { metadata } = await import("@/app/layout");
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });
});
