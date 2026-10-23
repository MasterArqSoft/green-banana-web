import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProductCards } from "@/components/secciones/ProductCards";
import { copy, products, site } from "@/lib/content";
import { telHref } from "@/lib/tel";

describe("ProductCards (FR-04)", () => {
  const html = renderToStaticMarkup(<ProductCards />);

  it("muestra una tarjeta por presentación", () => {
    expect(html.match(/<li/g)).toHaveLength(products.length);
    for (const product of products) expect(html).toContain(product.label);
  });

  it("muestra el detalle de peso y unidades del spec", () => {
    // Entre corchetes mientras estén sin confirmar (T-03), como en el spec.
    expect(html).toContain("~[220] g por unidad");
    expect(html).toContain("~[4–5] unidades");
    expect(html).toContain("3 kg · ~[13–15] unidades");
    expect(html).toContain("[18–20] kg");
  });

  it("cada tarjeta tiene el botón de llamada al número de site.json", () => {
    const links = html.split(`href="${telHref(site.phone)}"`).length - 1;
    expect(links).toBe(products.length);
    expect(html).toContain(products[0].callLabel);
  });

  it("incluye la nota de precio y envío por teléfono", () => {
    expect(html).toContain(copy.products.note);
  });

  it("no muestra ningún precio (AC-02)", () => {
    expect(html).not.toMatch(/\$\s?\d|COP/);
  });
});
