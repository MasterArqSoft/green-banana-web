import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FinalCta } from "@/components/secciones/FinalCta";
import { copy, site } from "@/lib/content";
import { telHref } from "@/lib/tel";

describe("FinalCta (FR-15)", () => {
  const html = renderToStaticMarkup(<FinalCta />);

  it("cierra con el título y el botón de llamada (AC-03)", () => {
    expect(html).toContain(copy.finalCta.title);
    expect(html).toContain(`href="${telHref(site.phone)}"`);
  });
});
