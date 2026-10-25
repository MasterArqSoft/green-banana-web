import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FinalCta } from "@/components/secciones/FinalCta";
import { getContent, site } from "@/lib/content";
import { telHref } from "@/lib/tel";

const { copy } = getContent("es-CO");

describe("FinalCta (FR-15)", () => {
  const html = renderToStaticMarkup(<FinalCta locale="es-CO" />);

  it("cierra con el título y el botón de llamada (AC-03)", () => {
    expect(html).toContain(copy.finalCta.title);
    expect(html).toContain(`href="${telHref(site.phone)}"`);
  });
});

describe("FinalCta en inglés", () => {
  it("traduce el título y conserva el botón de llamada", () => {
    const html = renderToStaticMarkup(<FinalCta locale="en" />);
    // React escribe el apóstrofo como &#x27;.
    expect(html).toContain(
      getContent("en").copy.finalCta.title.replace("'", "&#x27;"),
    );
    expect(html).toContain(`href="${telHref(site.phone)}"`);
  });
});
