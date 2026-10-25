import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Benefits } from "@/components/secciones/Benefits";
import { getContent } from "@/lib/content";
import { findForbiddenClaims } from "@/lib/claims";

const { copy } = getContent("es-CO");

describe("Benefits (FR-08)", () => {
  const html = renderToStaticMarkup(<Benefits locale="es-CO" />);

  it("muestra el título y la formulación permitida", () => {
    expect(html).toContain(copy.benefits.title);
    expect(html).toContain("fuente de almidón resistente, un tipo de fibra");
  });

  it("no contiene afirmaciones de salud prohibidas (P3)", () => {
    expect(findForbiddenClaims(html)).toEqual([]);
  });
});

describe("Benefits en inglés (FR-27)", () => {
  const html = renderToStaticMarkup(<Benefits locale="en" />);

  it("usa la formulación permitida traducida, sin afirmaciones prohibidas", () => {
    expect(html).toContain(getContent("en").copy.benefits.title);
    expect(html).toContain("source of resistant starch, a type of fiber");
    expect(findForbiddenClaims(html)).toEqual([]);
  });
});
