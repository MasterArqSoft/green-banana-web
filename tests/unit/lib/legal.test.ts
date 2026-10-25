import { describe, expect, it } from "vitest";
import { getContent, site } from "@/lib/content";
import { LOCALES, rutaDe } from "@/lib/i18n";
import { legalMetadata, legalValues } from "@/lib/legal";
import { absoluteUrl } from "@/lib/seo";

const pages = ["terminos", "privacidad", "garantia"] as const;

describe("metadatos de las páginas legales (FR-18, FR-28)", () => {
  it.each(pages.flatMap((page) => LOCALES.map((l) => [page, l] as const)))(
    "%s en %s tiene título con la marca, descripción y URL canónica de su idioma",
    (page, locale) => {
      const { legal } = getContent(locale);
      const metadata = legalMetadata(page, locale);
      expect(metadata.title).toBe(`${legal[page].title} | ${site.brand}`);
      expect(metadata.description).not.toMatch(/\{\w+\}/);
      expect(metadata.alternates?.canonical).toBe(
        absoluteUrl(rutaDe(page, locale)),
      );
      expect(metadata.alternates?.languages).toMatchObject({
        "x-default": absoluteUrl(rutaDe(page, "es-CO")),
      });
    },
  );

  it("las rutas inglesas son /en/terms, /en/privacy y /en/guarantee", () => {
    expect(
      pages.map((page) => legalMetadata(page, "en").alternates?.canonical),
    ).toEqual(["/en/terms", "/en/privacy", "/en/guarantee"].map(absoluteUrl));
  });

  it("los valores de los marcadores salen de site.json", () => {
    expect(legalValues()).toMatchObject({
      razonSocial: site.legal.razonSocial,
      nit: site.legal.nit,
    });
  });

  it("localiza solo los ejemplos y no modifica los datos compartidos", () => {
    expect(legalValues("en")).toMatchObject({
      razonSocial: "Example legal entity S.A.S. (FICTICIO)",
      direccion: "Example address, Santa Marta (FICTICIO)",
      nit: site.legal.nit,
    });
    expect(site.legal.razonSocial).toBe(
      "Razón social de ejemplo S.A.S. (FICTICIO)",
    );
  });

  it("conserva una razón social y dirección reales en la versión inglesa", () => {
    const original = { ...site.legal };
    try {
      site.legal.razonSocial = "Distribuciones del Caribe S.A.S.";
      site.legal.direccion = "Carrera 1 # 2-30, Santa Marta";
      expect(legalValues("en")).toMatchObject({
        razonSocial: site.legal.razonSocial,
        direccion: site.legal.direccion,
      });
    } finally {
      Object.assign(site.legal, original);
    }
  });
});
