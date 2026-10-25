import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TrustBar } from "@/components/secciones/TrustBar";
import copyJson from "@/content/es-CO/copy.json";
import { getContent, site } from "@/lib/content";
import { copySchema } from "@/lib/schema";

const { copy } = getContent("es-CO");

describe("TrustBar (FR-03)", () => {
  const html = renderToStaticMarkup(<TrustBar locale="es-CO" />);

  it("muestra los cuatro elementos con sus textos", () => {
    expect(html.match(/<li/g)).toHaveLength(4);
    for (const item of copy.trustBar) expect(html).toContain(item.text);
  });

  it("rellena la ciudad de acopio en el título", () => {
    expect(html).toContain(`Acopio en ${site.acopio.city}`);
    expect(html).not.toContain("{ciudad}");
  });

  it("no muestra ningún precio (AC-02)", () => {
    expect(html).not.toMatch(/\$\s?\d|COP/);
  });

  it("el esquema exige exactamente cuatro elementos", () => {
    const copyWithThree = {
      ...structuredClone(copyJson),
      trustBar: copyJson.trustBar.slice(0, 3),
    };
    expect(copySchema.safeParse(copyWithThree).success).toBe(false);
  });
});

describe("TrustBar en inglés (FR-27)", () => {
  it("muestra los mismos cuatro íconos con textos ingleses", () => {
    const html = renderToStaticMarkup(<TrustBar locale="en" />);
    const en = getContent("en").copy.trustBar;
    expect(en.map((item) => item.icon)).toEqual(
      copy.trustBar.map((item) => item.icon),
    );
    for (const item of en) expect(html).toContain(item.text);
    expect(html).toContain(`Collection center in ${site.acopio.city}`);
  });
});
