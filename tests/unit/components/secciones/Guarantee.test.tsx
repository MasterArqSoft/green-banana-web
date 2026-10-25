import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Guarantee } from "@/components/secciones/Guarantee";
import { getContent } from "@/lib/content";

const { copy } = getContent("es-CO");

describe("Guarantee (FR-14)", () => {
  const html = renderToStaticMarkup(<Guarantee locale="es-CO" />);

  it("explica el reclamo en 24 horas con foto", () => {
    expect(html).toContain(copy.guarantee.title);
    expect(html).toContain("24 horas");
  });

  it("aclara que no aplica el derecho de retracto en perecederos", () => {
    expect(html).toContain("no aplica el derecho de retracto");
  });
});

describe("Guarantee en inglés (FR-27)", () => {
  it("mantiene el plazo de 24 horas y la exclusión de retracto", () => {
    const html = renderToStaticMarkup(<Guarantee locale="en" />);
    expect(html).toContain(getContent("en").copy.guarantee.title);
    expect(html).toContain("24 hours");
    expect(html).toContain("the right of withdrawal does not apply");
  });
});
