import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TopBar } from "@/components/secciones/TopBar";
import { site } from "@/lib/content";
import { formatPhone, telHref } from "@/lib/tel";

describe("TopBar (FR-01)", () => {
  // Los textos salen de copy.json; aquí se comprueba el resultado ya rellenado.
  const html = renderToStaticMarkup(<TopBar locale="es-CO" />);

  it("muestra la empresa, el acopio y el número", () => {
    expect(html).toContain(site.brand);
    expect(html).toContain(`Acopio en ${site.acopio.city}`);
    expect(html).toContain(formatPhone(site.phone));
  });

  it("la marca es un enlace al inicio (FR-19, AC-14)", () => {
    const brand = html.match(/<a [^>]*href="\/"[^>]*>(.*?)<\/a>/);
    expect(brand?.[1]).toBe(site.brand);
  });

  it("incluye el botón Llamar con el enlace tel:", () => {
    expect(html).toContain(`href="${telHref(site.phone)}"`);
  });

  it("no muestra ningún precio (AC-02)", () => {
    expect(html).not.toMatch(/\$\s?\d|COP/);
  });
});

describe("TopBar en inglés (FR-26, FR-27)", () => {
  const html = renderToStaticMarkup(<TopBar locale="en" />);

  it("la marca, sin traducir, lleva al inicio inglés", () => {
    const brand = html.match(/<a [^>]*href="\/en"[^>]*>(.*?)<\/a>/);
    expect(brand?.[1]).toBe(site.brand);
  });

  it("traduce el acopio y conserva el número", () => {
    expect(html).toContain(`Collection center in ${site.acopio.city}`);
    expect(html).toContain(formatPhone(site.phone));
    expect(html).toContain(`href="${telHref(site.phone)}"`);
  });
});
