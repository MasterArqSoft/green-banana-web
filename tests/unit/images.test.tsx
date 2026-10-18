import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Hero } from "@/components/Hero";
import { Picture } from "@/components/Picture";
import { ProductCards } from "@/components/ProductCards";
import { Recipes } from "@/components/Recipes";
import { products, recipes } from "@/lib/content";
import { allImages, IMAGES } from "@/lib/images";

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
      expect(
        IMAGES.recipes[recipe.id as keyof typeof IMAGES.recipes],
      ).toBeDefined();
    }
  });
});

describe("Picture", () => {
  const html = renderToStaticMarkup(
    <Picture spec={IMAGES.origin} alt="Prueba" />,
  );

  it("ofrece AVIF y usa WebP como respaldo", () => {
    expect(html).toContain('type="image/avif"');
    expect(html).toMatch(/<img[^>]*src="\/images\/origen\/origen\.webp"/);
  });

  it("declara ancho y alto, y carga en diferido", () => {
    expect(html).toContain('width="1200"');
    expect(html).toContain('height="800"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('alt="Prueba"');
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
    const html = renderToStaticMarkup(<ProductCards />);
    expect(html).toContain("/images/presentaciones/unit-200.avif 200w");
    expect(html).toContain('sizes="(min-width: 1024px) 280px, 96px"');
  });
});

describe("fotos en las secciones", () => {
  it("el hero tiene prioridad alta y versión móvil y de escritorio", () => {
    const html = renderToStaticMarkup(<Hero />);
    expect(html).toMatch(/fetchPriority="high"|fetchpriority="high"/);
    expect(html).not.toContain('loading="lazy"');
    expect(html).toContain("hero-movil.avif");
    expect(html).toContain('media="(min-width: 768px)"');
  });

  it("las tarjetas y recetas tienen texto alternativo y carga diferida", () => {
    const html =
      renderToStaticMarkup(<ProductCards />) +
      renderToStaticMarkup(<Recipes />);
    for (const item of [...products, ...recipes]) {
      expect(html).toContain(`alt="${item.imageAlt}"`);
    }
    expect(html).not.toMatch(/fetchPriority="high"|fetchpriority="high"/);
  });
});
