import { describe, expect, it } from "vitest";
import { legal, site } from "@/lib/content";
import { legalMetadata, legalValues } from "@/lib/legal";
import { absoluteUrl } from "@/lib/seo";

describe("metadatos de las páginas legales (FR-18)", () => {
  it.each(["terminos", "privacidad", "garantia"] as const)(
    "%s tiene título con la marca, descripción y URL canónica",
    (page) => {
      const metadata = legalMetadata(page);
      expect(metadata.title).toBe(`${legal[page].title} | ${site.brand}`);
      expect(metadata.description).not.toMatch(/\{\w+\}/);
      expect(metadata.alternates?.canonical).toBe(absoluteUrl(`/${page}`));
    },
  );

  it("los valores de los marcadores salen de site.json", () => {
    expect(legalValues()).toMatchObject({
      razonSocial: site.legal.razonSocial,
      nit: site.legal.nit,
    });
  });
});
