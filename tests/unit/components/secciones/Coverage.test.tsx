import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Coverage } from "@/components/secciones/Coverage";
import { copy, site, zones } from "@/lib/content";
import { telHref } from "@/lib/tel";

describe("Coverage (FR-10)", () => {
  const html = renderToStaticMarkup(<Coverage />);

  it("muestra el acopio con ciudad y departamento", () => {
    expect(html).toContain(`${site.acopio.city}, ${site.acopio.department}`);
  });

  it("muestra las zonas de distribución de zones.json", () => {
    for (const zone of zones) expect(html).toContain(zone.name);
    expect(html).not.toMatch(/\{\w+\}/);
  });

  it("invita a llamar si la zona no aparece", () => {
    expect(html).toContain(copy.coverage.notListed);
    expect(html).toContain(`href="${telHref(site.phone)}"`);
  });

  it("no publica precios ni costos de envío (AC-02, AC-04)", () => {
    expect(html).not.toMatch(/\$\s?\d|COP/);
  });
});
