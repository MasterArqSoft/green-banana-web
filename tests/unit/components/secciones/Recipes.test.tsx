import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Recipes } from "@/components/secciones/Recipes";
import { copy, recipes } from "@/lib/content";

describe("Recipes (FR-07)", () => {
  const html = renderToStaticMarkup(<Recipes />);

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
