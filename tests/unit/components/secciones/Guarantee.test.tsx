import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FinalCta } from "@/components/secciones/FinalCta";
import { Guarantee } from "@/components/secciones/Guarantee";
import { copy, site } from "@/lib/content";
import { telHref } from "@/lib/tel";

describe("Guarantee (FR-14)", () => {
  const html = renderToStaticMarkup(<Guarantee />);

  it("explica el reclamo en 24 horas con foto", () => {
    expect(html).toContain(copy.guarantee.title);
    expect(html).toContain("24 horas");
  });

  it("aclara que no aplica el derecho de retracto en perecederos", () => {
    expect(html).toContain("no aplica el derecho de retracto");
  });
});

describe("FinalCta (FR-15)", () => {
  const html = renderToStaticMarkup(<FinalCta />);

  it("cierra con el título y el botón de llamada (AC-03)", () => {
    expect(html).toContain(copy.finalCta.title);
    expect(html).toContain(`href="${telHref(site.phone)}"`);
  });
});
