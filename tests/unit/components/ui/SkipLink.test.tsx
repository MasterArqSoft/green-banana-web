import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MAIN_ID, SkipLink } from "@/components/ui/SkipLink";
import { getContent } from "@/lib/content";

const { copy } = getContent("es-CO");

describe("SkipLink (UX-08, T-58)", () => {
  it("enlaza al <main> con el texto de copy.json", () => {
    const html = renderToStaticMarkup(<SkipLink locale="es-CO" />);
    expect(html).toContain(`href="#${MAIN_ID}"`);
    expect(html).toContain(`>${copy.navigation.skipToContent}</a>`);
  });

  it("en inglés usa su texto y el mismo destino", () => {
    const html = renderToStaticMarkup(<SkipLink locale="en" />);
    expect(html).toContain(`href="#${MAIN_ID}"`);
    expect(html).toContain(">Skip to content</a>");
  });

  it("queda oculto hasta recibir el foco", () => {
    const html = renderToStaticMarkup(<SkipLink locale="es-CO" />);
    expect(html).toContain("sr-only");
    expect(html).toContain("focus:not-sr-only");
  });
});
