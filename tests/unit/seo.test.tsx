import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocalBusinessJsonLd } from "@/components/LocalBusinessJsonLd";
import { site } from "@/lib/content";
import { absoluteUrl, ogImage, PAGES, seoTitle } from "@/lib/seo";

describe("SEO (T-31, NFR-03)", () => {
  it("arma URL absolutas a partir de site.url", () => {
    expect(absoluteUrl("/")).toBe(`${site.url}/`);
    expect(absoluteUrl("/terminos")).toBe(`${site.url}/terminos`);
    expect(ogImage().url).toBe(`${site.url}/images/og.jpg`);
  });

  it("el título incluye la ciudad y la marca", () => {
    expect(seoTitle()).toContain(site.acopio.city);
    expect(seoTitle()).toContain(site.brand);
  });

  it("publica LocalBusiness con datos de site.json y sin precios", () => {
    const html = renderToStaticMarkup(<LocalBusinessJsonLd />);
    const json = html.match(/<script[^>]*>(.*)<\/script>/)?.[1];
    const data = JSON.parse(json!);
    expect(data["@type"]).toBe("LocalBusiness");
    expect(data.telephone).toBe(site.phone);
    expect(data.address.addressLocality).toBe(site.acopio.city);
    expect(JSON.stringify(data)).not.toMatch(/price|offer/i);
  });
});

describe("sitemap y robots", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("el sitemap lista las páginas publicadas", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    expect(sitemap().map((entry) => entry.url)).toEqual(PAGES.map(absoluteUrl));
  });

  it("fuera de producción pide no rastrear (D-11)", async () => {
    const { default: robots } = await import("@/app/robots");
    expect(robots()).toEqual({ rules: { userAgent: "*", disallow: "/" } });
  });

  it("en producción permite rastrear y apunta al sitemap", async () => {
    vi.stubEnv("SITE_ENV", "production");
    // En producción no puede haber datos ficticios; se simulan resueltos para probar solo robots.
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
    const { default: robots } = await import("@/app/robots");
    expect(robots()).toMatchObject({
      rules: { userAgent: "*", allow: "/" },
      sitemap: `${site.url}/sitemap.xml`,
    });
    vi.doUnmock("@/content/site.json");
    vi.doUnmock("@/lib/claims");
  });
});
