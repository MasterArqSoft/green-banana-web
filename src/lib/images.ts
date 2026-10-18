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
  },
  heroMobile: {
    source: "hero-movil",
    output: "hero/hero-movil",
    width: 800,
    height: 1000,
    formats: ["avif", "webp", "jpg"],
    maxKB: 120,
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

/** Todas las imágenes, para el script de generación y las pruebas. */
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
