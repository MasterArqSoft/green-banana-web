import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MAIN_ID, SkipLink } from "@/components/ui/SkipLink";
import { copy } from "@/lib/content";

describe("SkipLink (UX-08, T-58)", () => {
  it("enlaza al <main> con el texto de copy.json", () => {
    const html = renderToStaticMarkup(<SkipLink />);
    expect(html).toContain(`href="#${MAIN_ID}"`);
    expect(html).toContain(`>${copy.navigation.skipToContent}</a>`);
  });

  it("queda oculto hasta recibir el foco", () => {
    const html = renderToStaticMarkup(<SkipLink />);
    expect(html).toContain("sr-only");
    expect(html).toContain("focus:not-sr-only");
  });
});
