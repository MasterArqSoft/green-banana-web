import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Hero } from "@/components/secciones/Hero";
import { ProductCards } from "@/components/secciones/ProductCards";
import { Recipes } from "@/components/secciones/Recipes";
import { getContent } from "@/lib/content";
import { allImages, IMAGES, recipeImage, testimonialImage } from "@/lib/images";

const { products, recipes } = getContent("es-CO");

describe("fotos publicadas (T-04, NFR-08)", () => {
  it.each(
    allImages().flatMap((spec) =>
      spec.formats.map((format) => [`${spec.output}.${format}`, spec.maxKB]),
    ),
  )("public/images/%s existe y pesa ≤ %i KB", (file, maxKB) => {
    // Las versiones menores (-200, -400, -600) pesan menos que la principal.
    const path = join("public", "images", String(file));
    expect(existsSync(path)).toBe(true);
    expect(statSync(path).size / 1024).toBeLessThanOrEqual(Number(maxKB));
  });

  it("cada presentación y cada receta tiene su foto", () => {
    for (const product of products) {
      expect(IMAGES.products[product.id]).toBeDefined();
    }
    for (const recipe of recipes) {
      expect(recipeImage(recipe.id)).toBe(
        IMAGES.recipes[recipe.id as keyof typeof IMAGES.recipes],
      );
    }
  });

  it("una receta sin foto falla con su id, no con un TypeError", () => {
    expect(() => recipeImage("arepa")).toThrow(/"arepa"/);
    expect(() => recipeImage("constructor")).toThrow(/"constructor"/);
  });

  it("la foto de un testimonio solo acepta un slug (no puede salir de public/images/)", () => {
    expect(testimonialImage("ana-maria").output).toBe("testimonios/ana-maria");
    expect(() => testimonialImage("../../src/app/page")).toThrow(/no válida/);
    expect(() => testimonialImage("Ana")).toThrow(/no válida/);
  });
});

describe("calidad AVIF del hero (T-81)", () => {
  it("solo el hero fija avifQuality, en 50 (aprobada por el usuario)", () => {
    const conCalidad = allImages().filter((s) => s.avifQuality !== undefined);
    expect(conCalidad.map((s) => s.output)).toEqual([
      "hero/hero-escritorio",
      "hero/hero-movil",
    ]);
    expect(conCalidad.every((s) => s.avifQuality === 50)).toBe(true);
  });

  it("toda avifQuality es un entero de 1 a 80 (scripts/images.mjs suma 20)", () => {
    for (const { avifQuality } of allImages()) {
      if (avifQuality === undefined) continue;
      expect(Number.isInteger(avifQuality)).toBe(true);
      expect(avifQuality).toBeGreaterThanOrEqual(1);
      expect(avifQuality).toBeLessThanOrEqual(80);
    }
  });
});

describe("versiones menores (srcset)", () => {
  it.each(
    allImages().flatMap((spec) =>
      (spec.variants ?? []).flatMap((width) =>
        spec.formats.map((format) => `${spec.output}-${width}.${format}`),
      ),
    ),
  )("public/images/%s existe", (file) => {
    expect(existsSync(join("public", "images", file))).toBe(true);
  });

  it("las tarjetas ofrecen 200 px para el móvil", () => {
    const html = renderToStaticMarkup(<ProductCards locale="es-CO" />);
    expect(html).toContain("/images/presentaciones/unit-200.avif 200w");
    // Con la foto arriba (tarjeta estrecha, T-103) se pide la versión grande.
    expect(html).toContain(
      'sizes="auto, (min-width: 64rem) 17.5rem, (min-width: 43rem) 6rem, (min-width: 40rem) 18rem, (min-width: 22rem) 6rem, 18rem"',
    );
  });
});

describe("fotos en las secciones", () => {
  it("el hero tiene prioridad alta y versión móvil y de escritorio", () => {
    const html = renderToStaticMarkup(<Hero locale="es-CO" />);
    expect(html).toMatch(/fetchPriority="high"|fetchpriority="high"/);
    expect(html).not.toContain('loading="lazy"');
    expect(html).toContain("hero-movil.avif");
    expect(html).toContain('media="(min-width: 768px)"');
  });

  it("las tarjetas y recetas tienen texto alternativo y carga diferida", () => {
    const html =
      renderToStaticMarkup(<ProductCards locale="es-CO" />) +
      renderToStaticMarkup(<Recipes locale="es-CO" />);
    for (const item of [...products, ...recipes]) {
      expect(html).toContain(`alt="${item.imageAlt}"`);
    }
    expect(html).not.toMatch(/fetchPriority="high"|fetchpriority="high"/);
  });
});

describe("fotos en inglés (FR-27)", () => {
  it("las mismas fotos con el texto alternativo traducido", () => {
    const en = getContent("en");
    const html =
      renderToStaticMarkup(<ProductCards locale="en" />) +
      renderToStaticMarkup(<Recipes locale="en" />);
    for (const item of [...en.products, ...en.recipes]) {
      expect(html).toContain(`alt="${item.imageAlt}"`);
    }
    expect(html).toContain("/images/presentaciones/unit-200.avif 200w");
  });
});
