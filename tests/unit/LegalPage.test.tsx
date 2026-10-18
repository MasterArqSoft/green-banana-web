import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LegalPage } from "@/components/LegalPage";
import legalJson from "@/content/legal.json";
import { legal, site } from "@/lib/content";
import { legalSchema } from "@/lib/schema";

describe("Páginas legales (FR-18)", () => {
  it.each(["terminos", "privacidad", "garantia"] as const)(
    "%s muestra su título, el aviso de borrador y los datos de site.json",
    (page) => {
      const html = renderToStaticMarkup(<LegalPage page={page} />);
      expect(html).toContain(legal[page].title);
      expect(html).toContain(legal.draftNotice);
      expect(html).not.toMatch(/\{\w+\}/);
      expect(html).not.toMatch(/<form|<input/);
    },
  );

  it("los términos incluyen la identidad del vendedor y la exclusión de retracto (AC-06)", () => {
    const html = renderToStaticMarkup(<LegalPage page="terminos" />);
    expect(html).toContain(site.legal.razonSocial);
    expect(html).toContain(site.legal.nit);
    expect(html).toContain("no aplica el derecho de retracto");
  });

  it("la política de datos cita la Ley 1581 de 2012", () => {
    const html = renderToStaticMarkup(<LegalPage page="privacidad" />);
    expect(html).toContain("Ley 1581 de 2012");
  });

  it("el esquema rechaza una página sin secciones", () => {
    const broken = structuredClone(legalJson);
    broken.terminos.sections = [];
    expect(legalSchema.safeParse(broken).success).toBe(false);
  });
});
