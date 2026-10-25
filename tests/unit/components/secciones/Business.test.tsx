import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Business } from "@/components/secciones/Business";
import { getContent, site } from "@/lib/content";
import { telHref } from "@/lib/tel";

const { copy } = getContent("es-CO");

describe("Business (FR-11)", () => {
  const html = renderToStaticMarkup(<Business locale="es-CO" />);

  it("se dirige a tiendas, hoteles y puntos de venta", () => {
    expect(html).toContain(copy.business.title);
    expect(html).toContain(`Distribuimos en ${site.acopio.city}`);
  });

  it("tiene el botón de llamada (AC-03)", () => {
    expect(html).toContain(`href="${telHref(site.phone)}"`);
  });

  it("no tiene formulario ni campos (alcance F-06)", () => {
    expect(html).not.toMatch(/<form|<input|<textarea|<select/);
  });
});

describe("Business en inglés (FR-27)", () => {
  const html = renderToStaticMarkup(<Business locale="en" />);

  it("traduce el texto y llama al mismo número (AC-26)", () => {
    expect(html).toContain(getContent("en").copy.business.title);
    expect(html).toContain(`We distribute in ${site.acopio.city}`);
    expect(html).toContain(`href="${telHref(site.phone)}"`);
  });
});
