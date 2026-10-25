import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProductCards } from "@/components/secciones/ProductCards";
import { getContent, site } from "@/lib/content";
import { formatPhone, telHref } from "@/lib/tel";
import { fill } from "@/lib/template";

const { copy, products } = getContent("es-CO");

describe("ProductCards (FR-04)", () => {
  const html = renderToStaticMarkup(<ProductCards locale="es-CO" />);

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

  it("cada botón nombra su presentación para el lector de pantalla (UX-02, T-59)", () => {
    for (const product of products) {
      const name = fill(copy.callButton.accessibleNameWithContext, {
        texto: product.callLabel,
        contexto: product.label,
        telefono: formatPhone(site.phone),
      });
      expect(html).toContain(`aria-label="${name}"`);
    }
  });

  it("incluye la nota de precio y envío por teléfono", () => {
    expect(html).toContain(copy.products.note);
  });

  it("no muestra ningún precio (AC-02)", () => {
    expect(html).not.toMatch(/\$\s?\d|COP/);
  });
});

describe("ProductCards en inglés (FR-27, AC-26)", () => {
  const en = getContent("en");
  const html = renderToStaticMarkup(<ProductCards locale="en" />);

  it("traduce los nombres y conserva pesos, unidades y marcas de pendiente", () => {
    for (const product of en.products) expect(html).toContain(product.label);
    expect(html).toContain("~[220] g each");
    expect(html).toContain("~[4–5] bananas");
    expect(html).toContain("3 kg · ~[13–15] bananas");
    expect(html).toContain("[18–20] kg");
  });

  it("cada botón llama al mismo número con su nombre accesible en inglés", () => {
    const links = html.split(`href="${telHref(site.phone)}"`).length - 1;
    expect(links).toBe(en.products.length);
    const [first] = en.products;
    const name = fill(en.copy.callButton.accessibleNameWithContext, {
      texto: first.callLabel,
      contexto: first.label,
      telefono: formatPhone(site.phone),
    });
    expect(html).toContain(`aria-label="${name}"`);
    expect(html).not.toMatch(/\$\s?\d|COP/);
  });
});
