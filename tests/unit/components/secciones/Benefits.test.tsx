import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Benefits } from "@/components/secciones/Benefits";
import { copy } from "@/lib/content";
import { findForbiddenClaims } from "@/lib/claims";

describe("Benefits (FR-08)", () => {
  const html = renderToStaticMarkup(<Benefits />);

  it("muestra el título y la formulación permitida", () => {
    expect(html).toContain(copy.benefits.title);
    expect(html).toContain("fuente de almidón resistente, un tipo de fibra");
  });

  it("no contiene afirmaciones de salud prohibidas (P3)", () => {
    expect(findForbiddenClaims(html)).toEqual([]);
  });
});
