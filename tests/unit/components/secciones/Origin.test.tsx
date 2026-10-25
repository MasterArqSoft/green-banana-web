import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
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

  it("conserva productor, municipio y lote, y formatea la fecha en inglés sin correr el día", () => {
    expect(html).toContain('id="origen"');
    expect(html).toContain(origin.producer);
    expect(html).toContain(origin.batch.code);
    expect(html).toContain("October 15, 2026");
    expect(html).not.toMatch(/\{\w+\}/);
  });
});
