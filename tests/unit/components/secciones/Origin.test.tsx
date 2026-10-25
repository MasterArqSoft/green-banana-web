import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import * as contenido from "@/lib/content";
import { Origin } from "@/components/secciones/Origin";
import { getContent, site } from "@/lib/content";
import { formatDate } from "@/lib/format";

const { origin } = getContent("es-CO");

describe("Origin (FR-06)", () => {
  const html = renderToStaticMarkup(<Origin locale="es-CO" />);

  it("es el destino del botón Ver origen", () => {
    expect(html).toContain('id="origen"');
  });

  it("muestra productor, municipio y ciudad de acopio desde los archivos de contenido", () => {
    expect(html).toContain(origin.producer);
    expect(html).toContain(origin.municipality);
    expect(html).toContain(site.acopio.city);
    expect(html).not.toMatch(/\{\w+\}/);
  });

  it("muestra el esquema en tres pasos", () => {
    expect(html.match(/<li/g)).toHaveLength(3);
  });

  it("muestra el lote vigente con su fecha de corte", () => {
    expect(html).toContain(origin.batch.code);
    expect(html).toContain(formatDate(origin.batch.cutDate, "es-CO"));
  });
});

describe("Origin en inglés (FR-27, AC-26)", () => {
  const html = renderToStaticMarkup(<Origin locale="en" />);

  it("traduce las descripciones del ejemplo y conserva lote y fecha", () => {
    expect(html).toContain('id="origen"');
    expect(html).toContain("Example farm (FICTICIO)");
    expect(html).toContain("Example municipality (FICTICIO)");
    expect(html).toContain("Example department (FICTICIO)");
    expect(html).not.toContain("Finca de ejemplo");
    expect(html).not.toContain("Municipio de ejemplo");
    expect(html).not.toContain("Departamento de ejemplo");
    expect(html).toContain(origin.batch.code);
    expect(html).toContain("October 15, 2026");
    expect(html).not.toMatch(/\{\w+\}/);
  });

  it("no traduce ni sustituye nombres propios al reemplazar los datos de ejemplo", () => {
    const original = contenido.getContent;
    const acceso = vi
      .spyOn(contenido, "getContent")
      .mockImplementation((locale) => {
        const datos = original(locale);
        return {
          ...datos,
          origin: {
            ...datos.origin,
            producer: "Finca La Esperanza",
            municipality: "Zona Bananera",
            department: "Magdalena",
          },
        };
      });
    try {
      const real = renderToStaticMarkup(<Origin locale="en" />);
      expect(real).toContain("Finca La Esperanza");
      expect(real).toContain("Zona Bananera");
      expect(real).toContain("Magdalena");
      expect(real).not.toContain("Example farm");
    } finally {
      acceso.mockRestore();
    }
  });
});
