import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LegalPage } from "@/components/ui/LegalPage";
import { MAIN_ID } from "@/components/ui/SkipLink";
import legalJson from "@/content/es-CO/legal.json";
import { getContent, site } from "@/lib/content";
import { legalSchema } from "@/lib/schema";

const { copy, legal } = getContent("es-CO");

describe("Páginas legales (FR-18)", () => {
  it.each(["terminos", "privacidad", "garantia"] as const)(
    "%s muestra su título, el aviso de borrador y los datos de site.json",
    (page) => {
      const html = renderToStaticMarkup(
        <LegalPage locale="es-CO" page={page} />,
      );
      expect(html).toContain(legal[page].title);
      expect(html).toContain(legal.draftNotice!);
      expect(html).not.toMatch(/\{\w+\}/);
      expect(html).not.toMatch(/<form|<input/);
      // Destino de "Saltar al contenido" (T-58).
      expect(html).toContain(`<main id="${MAIN_ID}"`);
    },
  );

  it.each(["terminos", "privacidad", "garantia"] as const)(
    "%s enlaza al inicio antes del título (FR-19, AC-14)",
    (page) => {
      const html = renderToStaticMarkup(
        <LegalPage locale="es-CO" page={page} />,
      );
      const back = html.match(/<a [^>]*href="\/"[^>]*>.*?<\/a>/)?.[0] ?? "";
      expect(back).toContain(copy.navigation.backHome);
      expect(back).toContain('aria-hidden="true"');
      expect(html.indexOf(back)).toBeLessThan(html.indexOf("<h1"));
    },
  );

  it("la privacidad describe la conexión opcional del mapa igual que su aviso (H-10, T-70)", () => {
    const html = renderToStaticMarkup(
      <LegalPage locale="es-CO" page="privacidad" />,
    );
    // Los mismos hechos que copy.map.consent: cuándo, a quién y qué dato.
    expect(copy.map.consent).toContain("OpenStreetMap");
    expect(copy.map.consent).toContain("dirección IP");
    expect(html).toContain(`«${copy.map.showButton}»`);
    expect(html).toContain("OpenStreetMap, que recibe tu dirección IP");
    // Ya no afirma que el sitio no recoge ningún dato.
    expect(html).not.toContain("No recoge datos personales");
  });

  it("los términos incluyen la identidad del vendedor y la exclusión de retracto (AC-06)", () => {
    const html = renderToStaticMarkup(
      <LegalPage locale="es-CO" page="terminos" />,
    );
    expect(html).toContain(site.legal.razonSocial);
    expect(html).toContain(site.legal.nit);
    expect(html).toContain("no aplica el derecho de retracto");
  });

  it("la política de datos cita la Ley 1581 de 2012", () => {
    const html = renderToStaticMarkup(
      <LegalPage locale="es-CO" page="privacidad" />,
    );
    expect(html).toContain("Ley 1581 de 2012");
  });

  describe("en inglés (FR-27)", () => {
    const en = getContent("en");

    it.each(["terminos", "privacidad", "garantia"] as const)(
      "%s muestra su título y el aviso de borrador en inglés, y vuelve a /en (FR-26)",
      (page) => {
        const html = renderToStaticMarkup(
          <LegalPage locale="en" page={page} />,
        );
        expect(html).toContain(en.legal[page].title);
        expect(html).toContain(en.legal.draftNotice!);
        expect(html).not.toMatch(/\{\w+\}/);
        const back = html.match(/<a [^>]*href="\/en"[^>]*>.*?<\/a>/)?.[0] ?? "";
        expect(back).toContain(en.copy.navigation.backHome);
        expect(html.indexOf(back)).toBeLessThan(html.indexOf("<h1"));
      },
    );

    it("conserva la identidad del vendedor sin traducir (AC-26)", () => {
      const html = renderToStaticMarkup(
        <LegalPage locale="en" page="terminos" />,
      );
      expect(html).toContain(site.legal.razonSocial);
      expect(html).toContain(site.legal.nit);
      expect(html).toContain(site.legal.direccion);
      expect(html).toContain("the right of withdrawal does not apply");
    });

    it("la privacidad cita la Ley 1581 y describe la conexión del mapa", () => {
      const html = renderToStaticMarkup(
        <LegalPage locale="en" page="privacidad" />,
      );
      expect(html).toContain("Law 1581 of 2012");
      expect(html).toContain(`“${en.copy.map.showButton}”`);
      expect(html).toContain("OpenStreetMap, which receives your IP address");
    });
  });

  it("el esquema rechaza una página sin secciones", () => {
    const broken = structuredClone(legalJson);
    broken.terminos.sections = [];
    expect(legalSchema.safeParse(broken).success).toBe(false);
  });
});
