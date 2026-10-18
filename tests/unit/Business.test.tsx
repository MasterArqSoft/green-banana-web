import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Business } from "@/components/Business";
import { copy, site } from "@/lib/content";
import { telHref } from "@/lib/tel";

describe("Business (FR-11)", () => {
  const html = renderToStaticMarkup(<Business />);

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
