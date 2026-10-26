// Fotos del sitio (T-04, NFR-08, 02-content-spec.md §6). Única fuente de verdad:
// la usan los componentes y scripts/images.mjs, que genera public/images/ a partir de
// fotos-originales/ (fuera de Git). Sin imports para que Node pueda cargarlo desde el script.
// Hoy son imágenes generadas con IA, "propias ficticias", hasta RP-02 (ver doc/creditos.md).

export type ImageFormat = "avif" | "webp" | "jpg";

export type ImageSpec = {
  /** Archivo en fotos-originales/, sin extensión (.png). */
  source: string;
  /** Ruta de salida en public/images/, sin extensión. */
  output: string;
  width: number;
  height: number;
  /** El último formato es el respaldo del <img>. */
  formats: ImageFormat[];
  /** Peso máximo por archivo (02-content-spec.md §6). */
  maxKB: number;
  /** Recorte previo en píxeles del original, para sacar elementos que no deben salir. */
  crop?: { left: number; top: number; width: number; height: number };
  /**
   * Anchos menores extra para srcset (archivo "<output>-<ancho>.<formato>"). El navegador
   * elige según `sizes`: así el móvil no descarga 600 px para mostrar 96 px (T-30).
   */
  variants?: number[];
  /**
   * Calidad AVIF inicial (1 a 80): scripts/images.mjs empieza por ella en vez de por la
   * máxima, y solo baja si el archivo no cabe en `maxKB`. Solo el hero: calidad 50,
   * aprobada por el usuario tras comparar capturas y medir el LCP (T-81).
   */
  avifQuality?: number;
};

const card = (source: string, output: string): ImageSpec => ({
  source,
  output,
  width: 600,
  height: 600,
  formats: ["avif", "webp"],
  maxKB: 40,
  variants: [200],
});

const recipe = (
  source: string,
  output: string,
  crop?: ImageSpec["crop"],
): ImageSpec => ({
  source,
  output,
  width: 600,
  height: 400,
  formats: ["avif", "webp"],
  maxKB: 40,
  crop,
  variants: [400],
});

export const IMAGES = {
  heroDesktop: {
    source: "hero-escritorio",
    output: "hero/hero-escritorio",
    width: 1600,
    height: 1000,
    formats: ["avif", "webp", "jpg"],
    maxKB: 120,
    avifQuality: 50,
  },
  heroMobile: {
    source: "hero-movil",
    output: "hero/hero-movil",
    width: 800,
    height: 1000,
    formats: ["avif", "webp", "jpg"],
    maxKB: 120,
    avifQuality: 50,
  },
  // Imagen para compartir en redes: recorte del hero (Open Graph pide JPG o PNG).
  og: {
    source: "hero-escritorio",
    output: "og",
    width: 1200,
    height: 630,
    formats: ["jpg"],
    maxKB: 150,
  },
  products: {
    unit: card("presentacion-unidad", "presentaciones/unit"),
    kg: card("presentacion-kilo", "presentaciones/kg"),
    bag: card("presentacion-bolsa", "presentaciones/bag"),
    box: card("presentacion-caja", "presentaciones/box"),
  },
  origin: {
    source: "origen-acopio",
    output: "origen/origen",
    width: 1200,
    height: 800,
    formats: ["avif", "webp"],
    maxKB: 90,
    variants: [600],
  },
  // Cayeye, patacón y chips se recortan para dejar fuera plátanos hartón del fondo (T-39).
  recipes: {
    sancocho: recipe("receta-sancocho", "recetas/sancocho"),
    cayeye: recipe("receta-cayeye", "recetas/cayeye", {
      left: 330,
      top: 330,
      width: 1020,
      height: 680,
    }),
    guineitos: recipe("receta-guineitos", "recetas/guineitos"),
    patacon: recipe("receta-patacon", "recetas/patacon", {
      left: 300,
      top: 390,
      width: 950,
      height: 633,
    }),
    "chips-horneados": recipe("receta-chips", "recetas/chips-horneados", {
      left: 0,
      top: 330,
      width: 870,
      height: 580,
    }),
  },
} satisfies {
  heroDesktop: ImageSpec;
  heroMobile: ImageSpec;
  og: ImageSpec;
  products: Record<string, ImageSpec>;
  origin: ImageSpec;
  recipes: Record<string, ImageSpec>;
};

/**
 * Capas del efecto de profundidad del hero (components/cliente/HeroProfundidad.tsx),
 * con la proporción y el encuadre de cada foto publicada: `profundidad` (R = fondo,
 * G = producto; blanco = cerca), `fondo` (la mesa y el fondo reconstruidos detrás del
 * producto) y `alfa` (R = opacidad del producto, G = dónde se usa el fondo
 * reconstruido). No los genera scripts/images.mjs sino tools/profundidad/generar.py
 * (variante c, tools/profundidad/capas.py), a partir de las fotos de
 * public/images/hero/: si cambian, hay que volver a correrlo. Se piden después de la
 * carga y solo si el efecto se activa.
 */
const capasHero = (foto: string) => ({
  profundidad: `hero/${foto}-profundidad.webp`,
  fondo: `hero/${foto}-fondo.webp`,
  alfa: `hero/${foto}-alfa.webp`,
});
export const HERO_PROFUNDIDAD = {
  escritorio: capasHero("hero-escritorio"),
  movil: capasHero("hero-movil"),
  maxKB: 50,
} as const;

/** Foto de una receta por su id de recipes.json. Si falta, el build falla con el id. */
export function recipeImage(id: string): ImageSpec {
  const recipes: Record<string, ImageSpec> = IMAGES.recipes;
  if (!Object.hasOwn(recipes, id))
    throw new Error(
      `Falta la foto de la receta "${id}" en IMAGES.recipes (src/lib/images.ts).`,
    );
  return recipes[id];
}

/**
 * Foto de un testimonio (FR-12), por el campo `photo` de testimonials.json. Se muestra a
 * 48 px; 96 px cubre pantallas de alta densidad. scripts/images.mjs la genera.
 */
export function testimonialImage(photo: string): ImageSpec {
  // Mismo patrón que `slug` en schema.ts. Se repite aquí porque scripts/images.mjs lee
  // testimonials.json sin pasar por Zod, y `photo` forma rutas de archivo: así un "../"
  // no puede escribir fuera de public/images/.
  if (!/^[a-z0-9-]+$/.test(photo))
    throw new Error(
      `Foto de testimonio no válida: "${photo}". Solo minúsculas, números y guiones.`,
    );
  return {
    source: `testimonio-${photo}`,
    output: `testimonios/${photo}`,
    width: 96,
    height: 96,
    formats: ["avif", "webp"],
    maxKB: 10,
  };
}

/** Todas las imágenes fijas, para el script de generación y las pruebas. */
export function allImages(): ImageSpec[] {
  return [
    IMAGES.heroDesktop,
    IMAGES.heroMobile,
    IMAGES.og,
    ...Object.values(IMAGES.products),
    IMAGES.origin,
    ...Object.values(IMAGES.recipes),
  ];
}
