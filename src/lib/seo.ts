import { copy, site } from "@/lib/content";
import { IMAGES } from "@/lib/images";
import { fill } from "@/lib/template";

// Rutas publicadas del sitio, para el sitemap.
export const PAGES = ["/", "/terminos", "/privacidad", "/garantia"];

// Con el prefijo de la demo, next.config.ts activa trailingSlash y las páginas llevan
// barra final (Next ya la agrega al canonical). Misma condición, para que el sitemap
// coincida (revisión de la Fase 9). Los archivos (con extensión) no la llevan.
const barraFinal = Boolean(process.env.PAGES_BASE_PATH);

/** URL absoluta de una ruta del sitio: "/terminos" → "https://…/terminos" ("…/terminos/" en la demo). */
export function absoluteUrl(path: string): string {
  const conBarra =
    barraFinal && !path.endsWith("/") && !/\.[a-z0-9]+$/i.test(path);
  return `${site.url}${path}${conBarra ? "/" : ""}`;
}

/** Datos de site.json que pueden usar los textos de SEO de copy.json. */
export function seoValues() {
  return { marca: site.brand, ciudad: site.acopio.city };
}

export const seoTitle = () => fill(copy.seo.title, seoValues());
export const seoDescription = () => fill(copy.seo.description, seoValues());

/**
 * Serializa datos estructurados para un <script type="application/ld+json">.
 * "<" se escapa como \u003c para que ningún texto pueda cerrar la etiqueta.
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

// Imagen para redes: recorte JPG de la foto del hero (IMAGES.og, generado por npm run images).
export function ogImage() {
  return {
    url: absoluteUrl(`/images/${IMAGES.og.output}.jpg`),
    width: IMAGES.og.width,
    height: IMAGES.og.height,
    alt: fill(copy.seo.ogImageAlt, seoValues()),
  };
}
