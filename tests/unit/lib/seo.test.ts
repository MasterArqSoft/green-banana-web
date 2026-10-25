import { afterEach, describe, expect, it, vi } from "vitest";
import { getContent, site } from "@/lib/content";
import { LOCALES, PAGINAS, rutaDe } from "@/lib/i18n";
import {
  absoluteUrl,
  alternates,
  homeMetadata,
  jsonLd,
  ogImage,
  pageMetadata,
  seoTitle,
} from "@/lib/seo";

describe("SEO (T-31, NFR-03)", () => {
  it("arma URL absolutas a partir de site.url", () => {
    expect(absoluteUrl("/")).toBe(`${site.url}/`);
    expect(absoluteUrl("/terminos")).toBe(`${site.url}/terminos`);
    expect(absoluteUrl("/en/terms")).toBe(`${site.url}/en/terms`);
    expect(ogImage("es-CO").url).toBe(`${site.url}/images/og.jpg`);
  });

  it("con el prefijo de la demo, las páginas llevan barra final y los archivos no", async () => {
    vi.stubEnv("PAGES_BASE_PATH", "/green-banana-web");
    vi.resetModules();
    const seo = await import("@/lib/seo");
    expect(seo.absoluteUrl("/")).toBe(`${site.url}/`);
    expect(seo.absoluteUrl("/terminos")).toBe(`${site.url}/terminos/`);
    expect(seo.absoluteUrl("/en")).toBe(`${site.url}/en/`);
    expect(seo.absoluteUrl("/en/privacy")).toBe(`${site.url}/en/privacy/`);
    expect(seo.absoluteUrl("/sitemap.xml")).toBe(`${site.url}/sitemap.xml`);
    expect(seo.ogImage("en").url).toBe(`${site.url}/images/og.jpg`);
    // site.url ya trae el prefijo: no se duplica.
    expect(seo.absoluteUrl("/en")).not.toContain(
      "/green-banana-web/green-banana-web",
    );
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("el título incluye la ciudad y la marca en los dos idiomas", () => {
    for (const locale of LOCALES) {
      expect(seoTitle(locale)).toContain(site.acopio.city);
      expect(seoTitle(locale)).toContain(site.brand);
    }
    expect(seoTitle("en")).not.toBe(seoTitle("es-CO"));
  });

  it("la imagen para redes es la misma; solo cambia su texto alternativo", () => {
    expect(ogImage("en").url).toBe(ogImage("es-CO").url);
    expect(ogImage("en").alt).toContain("green banana");
    expect(ogImage("es-CO").alt).toContain("guineo verde");
  });

  it('jsonLd escapa "<" para que ningún texto cierre el <script> (A03)', () => {
    const out = jsonLd({ text: "a</script><b>" });
    expect(out).not.toContain("<");
    expect(JSON.parse(out)).toEqual({ text: "a</script><b>" });
  });
});

describe("metadatos por idioma (FR-28, AC-25)", () => {
  it.each(
    PAGINAS.flatMap((pagina) => LOCALES.map((l) => [pagina, l] as const)),
  )(
    "%s en %s: canonical propio y alternates recíprocos con x-default español",
    (pagina, locale) => {
      const { canonical, languages } = alternates(pagina, locale);
      expect(canonical).toBe(absoluteUrl(rutaDe(pagina, locale)));
      expect(languages).toEqual({
        "es-CO": absoluteUrl(rutaDe(pagina, "es-CO")),
        en: absoluteUrl(rutaDe(pagina, "en")),
        "x-default": absoluteUrl(rutaDe(pagina, "es-CO")),
      });
    },
  );

  it("el inicio inglés usa textos, URL y og:locale ingleses", () => {
    const metadata = homeMetadata("en");
    expect(metadata.title).toBe(seoTitle("en"));
    expect(metadata.alternates?.canonical).toBe(absoluteUrl("/en"));
    expect(metadata.openGraph).toMatchObject({
      locale: "en_US",
      alternateLocale: ["es_CO"],
      url: absoluteUrl("/en"),
      title: seoTitle("en"),
      siteName: site.brand,
    });
    expect(metadata.twitter).toMatchObject({ title: seoTitle("en") });
  });

  it("el inicio español conserva sus textos y og:locale es_CO", () => {
    const metadata = homeMetadata("es-CO");
    expect(metadata.description).toMatch(/guineo verde/i);
    expect(metadata.openGraph).toMatchObject({
      locale: "es_CO",
      alternateLocale: ["en_US"],
      url: absoluteUrl("/"),
    });
  });

  it("pageMetadata no deja marcadores sin rellenar", () => {
    const metadata = pageMetadata("terminos", "en", {
      title: "T",
      description: "D",
    });
    expect(JSON.stringify(metadata)).not.toMatch(/\{\w+\}/);
    expect(
      (metadata.openGraph?.images as { alt: string }[])[0].alt,
    ).not.toMatch(/\{\w+\}/);
  });
});

describe("sitemap y robots", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("el sitemap lista las ocho páginas, cada una con sus alternates (AC-25)", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const entradas = sitemap();
    expect(entradas).toHaveLength(8);
    expect(entradas.map((entry) => entry.url).sort()).toEqual(
      PAGINAS.flatMap((p) =>
        LOCALES.map((l) => absoluteUrl(rutaDe(p, l))),
      ).sort(),
    );
    for (const entrada of entradas) {
      expect(Object.values(entrada.alternates!.languages!)).toContain(
        entrada.url,
      );
    }
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

describe("textos de SEO", () => {
  it("cada idioma tiene su descripción, sin marcadores pendientes de rellenar", () => {
    for (const locale of LOCALES) {
      expect(homeMetadata(locale).description).not.toMatch(/\{\w+\}/);
    }
    expect(getContent("en").copy.seo.description).not.toBe(
      getContent("es-CO").copy.seo.description,
    );
  });
});
