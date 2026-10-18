import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Benefits } from "@/components/Benefits";
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

describe("findForbiddenClaims (P1, P3)", () => {
  it("detecta frases prohibidas sin importar tildes ni mayúsculas", () => {
    expect(findForbiddenClaims("Ayuda contra el CANCER")).toEqual(["cáncer"]);
    expect(findForbiddenClaims("Controla la diabetes")).toEqual(["diabetes"]);
    expect(findForbiddenClaims("Ideal para bajar de peso")).toEqual([
      "bajar de peso",
    ]);
    expect(findForbiddenClaims("¡Cupos limitados!")).toEqual([
      "cupos limitados",
    ]);
  });

  it("acepta la formulación permitida", () => {
    expect(
      findForbiddenClaims("Fuente de almidón resistente, un tipo de fibra."),
    ).toEqual([]);
  });
});
