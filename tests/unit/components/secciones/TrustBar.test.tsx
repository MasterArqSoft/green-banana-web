import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TrustBar } from "@/components/secciones/TrustBar";
import copyJson from "@/content/copy.json";
import { copy, site } from "@/lib/content";
import { copySchema } from "@/lib/schema";

describe("TrustBar (FR-03)", () => {
  const html = renderToStaticMarkup(<TrustBar />);

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
