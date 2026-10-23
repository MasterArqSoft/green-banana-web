import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Hero } from "@/components/secciones/Hero";
import { copy, site } from "@/lib/content";
import { telHref } from "@/lib/tel";
import { fill } from "@/lib/template";

describe("Hero (FR-02)", () => {
  const html = renderToStaticMarkup(<Hero />);

  it("tiene un H1 con la propuesta de valor y la ciudad de acopio", () => {
    const title = fill(copy.hero.title, { ciudad: site.acopio.city });
    expect(html).toMatch(new RegExp(`<h1[^>]*>${title}</h1>`));
    expect(title).toContain(site.acopio.city);
  });

  it("tiene el CTA de llamada con el número de site.json (AC-03)", () => {
    expect(html).toContain(`href="${telHref(site.phone)}"`);
    expect(html).toContain(copy.hero.primaryCta);
  });

  it("tiene el CTA secundario hacia la sección de origen", () => {
    expect(html).toContain('href="#origen"');
    expect(html).toContain(copy.hero.secondaryCta);
  });

  it("no muestra ningún precio (AC-02)", () => {
    expect(html).not.toMatch(/\$\s?\d|COP/);
  });
});
