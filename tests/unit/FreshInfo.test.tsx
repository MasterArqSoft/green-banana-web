import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FreshInfo } from "@/components/FreshInfo";
import { copy } from "@/lib/content";

describe("FreshInfo (FR-05)", () => {
  const html = renderToStaticMarkup(<FreshInfo />);

  it("tiene el título como H2 y el texto de conservación", () => {
    expect(html).toMatch(new RegExp(`<h2[^>]*>${copy.freshInfo.title}</h2>`));
    expect(html).toContain(copy.freshInfo.text);
  });

  it("muestra el consejo", () => {
    expect(html).toContain(copy.freshInfo.tip);
  });

  it("no muestra ningún precio (AC-02)", () => {
    expect(html).not.toMatch(/\$\s?\d|COP/);
  });
});
