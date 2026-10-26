import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Hero } from "@/components/secciones/Hero";
import { ProductCards } from "@/components/secciones/ProductCards";
import { Recipes } from "@/components/secciones/Recipes";
import { getContent } from "@/lib/content";
import sharp from "sharp";
import {
  allImages,
  HERO_PROFUNDIDAD,
  IMAGES,
  recipeImage,
  testimonialImage,
} from "@/lib/images";
import { FOCO } from "@/lib/parallax";

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

describe("capas del efecto de profundidad del hero", () => {
  const leer = async (archivo: string) => {
    const { data, info } = await sharp(join("public", "images", archivo))
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const canal = (x: number, y: number, c: number) =>
      data[(y * info.width + x) * info.channels + c] / 255;
    return { ...info, canal };
  };

  it.each([
    ["escritorio", HERO_PROFUNDIDAD.escritorio, IMAGES.heroDesktop],
    ["movil", HERO_PROFUNDIDAD.movil, IMAGES.heroMobile],
  ] as const)(
    "%s: las tres capas existen, pesan poco y casan con su foto",
    async (_, capas, foto) => {
      for (const archivo of Object.values(capas)) {
        const path = join("public", "images", archivo);
        expect(statSync(path).size / 1024).toBeLessThanOrEqual(
          HERO_PROFUNDIDAD.maxKB,
        );
        const { width = 0, height = 0 } = await sharp(path).metadata();
        // Desalineadas, el recorte y el relieve no caerían sobre el guineo.
        expect(width / height).toBeCloseTo(foto.width / foto.height, 3);
      }
      // El fondo reconstruido y el matte, a la resolución de la foto publicada.
      for (const archivo of [capas.fondo, capas.alfa]) {
        const { width } = await sharp(
          join("public", "images", archivo),
        ).metadata();
        expect(width).toBe(foto.width);
      }
    },
  );

  // Variante C de tools/profundidad/generar.py: el producto, por delante del plano que no
  // se mueve (FOCO), con solo su volumen de conjunto; el fondo lejano, detrás; y la mesa
  // justo debajo del borde inferior del producto, a la profundidad de su base (no flota).
  it.each([
    ["escritorio", HERO_PROFUNDIDAD.escritorio],
    ["movil", HERO_PROFUNDIDAD.movil],
  ] as const)(
    "%s: producto por delante del foco y apoyado en la mesa",
    async (_, capas) => {
      const alfa = await leer(capas.alfa);
      const mapa = await leer(capas.profundidad);
      const enMapa = (x: number, y: number, c: number) =>
        mapa.canal(
          Math.min(mapa.width - 1, Math.floor((x * mapa.width) / alfa.width)),
          Math.min(
            mapa.height - 1,
            Math.floor((y * mapa.height) / alfa.height),
          ),
          c,
        );
      const producto: number[] = [];
      const lejano: number[] = [];
      const apoyo: number[] = [];
      for (let y = 0; y < alfa.height - 12; y += 2)
        for (let x = 0; x < alfa.width; x += 2) {
          const a = alfa.canal(x, y, 0);
          if (a > 0.99) producto.push(enMapa(x, y, 1));
          if (y < alfa.height * 0.15 && a === 0) lejano.push(enMapa(x, y, 0));
          // Borde inferior del producto en la mitad de abajo: la mesa 12 px más abajo.
          if (
            y > alfa.height * 0.55 &&
            a > 0.99 &&
            alfa.canal(x, y + 12, 0) === 0
          )
            apoyo.push(enMapa(x, y + 12, 0) - enMapa(x, y, 1));
        }
      const mediana = (v: number[]) => v.sort((p, q) => p - q)[v.length >> 1];
      const rango = (v: number[]) =>
        v[Math.floor(v.length * 0.98)] - v[Math.floor(v.length * 0.02)];
      expect(mediana(producto)).toBeGreaterThan(FOCO);
      expect(mediana(lejano)).toBeLessThan(FOCO - 0.5);
      // Solo el volumen de conjunto: ~0,1 de profundidad son ~1,6 px CSS de diferencia
      // de desplazamiento en escritorio con el cursor en un extremo. Del corte del tallo
      // (más lejos) a las puntas de delante, hoy 0,15 y 0,14.
      expect(rango(producto)).toBeLessThan(0.2);
      expect(Math.abs(mediana(apoyo))).toBeLessThan(0.03);
    },
  );

  it.each([
    ["escritorio", HERO_PROFUNDIDAD.escritorio],
    ["movil", HERO_PROFUNDIDAD.movil],
  ] as const)(
    "%s: el fondo reconstruido se usa en todo el producto y su borde",
    async (_, capas) => {
      const alfa = await leer(capas.alfa);
      let producto = 0;
      let fuera = 0;
      for (let y = 0; y < alfa.height; y += 2)
        for (let x = 0; x < alfa.width; x += 2) {
          const a = alfa.canal(x, y, 0);
          const uso = alfa.canal(x, y, 1);
          // Donde hay producto (aunque sea poco) la foto lleva fondo mezclado: el
          // shader lo cambia por el reconstruido, así que uso = 1.
          if (a > 0.01) {
            producto++;
            expect(uso).toBe(1);
          }
          if (uso === 0) fuera++;
        }
      // El producto ocupa una parte de la foto y el resto es la foto tal cual.
      expect(producto).toBeGreaterThan(0);
      expect(fuera).toBeGreaterThan(producto);
    },
  );
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
