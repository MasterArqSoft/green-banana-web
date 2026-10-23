import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Guarantee } from "@/components/secciones/Guarantee";
import { copy } from "@/lib/content";

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
