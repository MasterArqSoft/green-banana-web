import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Recipes } from "@/components/secciones/Recipes";
import { getContent } from "@/lib/content";

const { copy, recipes } = getContent("es-CO");

describe("Recipes (FR-07)", () => {
  const html = renderToStaticMarkup(<Recipes locale="es-CO" />);

  it("tiene el título y una tarjeta por receta", () => {
    expect(html).toContain(copy.recipes.title);
    expect(html.match(/<li/g)).toHaveLength(recipes.length);
  });

  it("cada tarjeta muestra nombre, tiempo y descripción", () => {
    for (const recipe of recipes) {
      expect(html).toContain(recipe.name);
      expect(html).toContain(recipe.time);
      expect(html).toContain(recipe.description);
    }
  });

  it("no enlaza a sitios externos", () => {
    expect(html).not.toMatch(/href="https?:/);
  });

  it("no muestra ningún precio (AC-02)", () => {
    expect(html).not.toMatch(/\$\s?\d|COP/);
  });
});

describe("Recipes en inglés (FR-27)", () => {
  const en = getContent("en").recipes;
  const html = renderToStaticMarkup(<Recipes locale="en" />);

  it("mismas recetas (id y tiempo) con nombre, descripción y alternativa traducidos", () => {
    expect(en.map((r) => [r.id, r.time])).toEqual(
      recipes.map((r) => [r.id, r.time]),
    );
    for (const recipe of en) {
      expect(html).toContain(recipe.name);
      expect(html).toContain(recipe.description);
      expect(html).toContain(`alt="${recipe.imageAlt}"`);
    }
  });
});
