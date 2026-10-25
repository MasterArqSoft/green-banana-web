import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FreshInfo } from "@/components/secciones/FreshInfo";
import { getContent } from "@/lib/content";

const { copy } = getContent("es-CO");

describe("FreshInfo (FR-05)", () => {
  const html = renderToStaticMarkup(<FreshInfo locale="es-CO" />);

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

describe("FreshInfo en inglés (FR-27)", () => {
  it("traduce el texto y conserva los datos pendientes entre corchetes (AC-26)", () => {
    const html = renderToStaticMarkup(<FreshInfo locale="en" />);
    expect(html).toContain(getContent("en").copy.freshInfo.title);
    expect(html).toContain("[4 to 7]");
    expect(html).toContain("[TO BE CONFIRMED");
  });
});
