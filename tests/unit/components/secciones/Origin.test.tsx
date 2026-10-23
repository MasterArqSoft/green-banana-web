import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Origin } from "@/components/secciones/Origin";
import { origin, site } from "@/lib/content";
import { formatDate } from "@/lib/format";

describe("Origin (FR-06)", () => {
  const html = renderToStaticMarkup(<Origin />);

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
    expect(html).toContain(formatDate(origin.batch.cutDate));
  });
});
