import { copy, site } from "@/lib/content";
import { IMAGES } from "@/lib/images";
import { fill } from "@/lib/template";

// Rutas publicadas del sitio, para el sitemap.
export const PAGES = ["/", "/terminos", "/privacidad", "/garantia"];

/** URL absoluta de una ruta del sitio: "/terminos" → "https://…/terminos". */
export function absoluteUrl(path: string): string {
  return `${site.url}${path}`;
}

/** Datos de site.json que pueden usar los textos de SEO de copy.json. */
export function seoValues() {
  return { marca: site.brand, ciudad: site.acopio.city };
}

export const seoTitle = () => fill(copy.seo.title, seoValues());
export const seoDescription = () => fill(copy.seo.description, seoValues());

// Imagen para redes: recorte JPG de la foto del hero (IMAGES.og, generado por npm run images).
export function ogImage() {
  return {
    url: absoluteUrl(`/images/${IMAGES.og.output}.jpg`),
    width: IMAGES.og.width,
    height: IMAGES.og.height,
    alt: fill(copy.seo.ogImageAlt, seoValues()),
  };
}
