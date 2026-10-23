import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TopBar } from "@/components/secciones/TopBar";
import { site } from "@/lib/content";
import { formatPhone, telHref } from "@/lib/tel";

describe("TopBar (FR-01)", () => {
  // Los textos salen de copy.json; aquí se comprueba el resultado ya rellenado.
  const html = renderToStaticMarkup(<TopBar />);

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
