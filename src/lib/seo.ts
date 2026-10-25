import type { Metadata } from "next";
import { getContent, isProduction, site } from "@/lib/content";
import {
  DEFAULT_LOCALE,
  LOCALES,
  OG_LOCALE,
  rutaDe,
  type Locale,
  type Pagina,
} from "@/lib/i18n";
import { IMAGES } from "@/lib/images";
import { fill } from "@/lib/template";

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

export const seoTitle = (locale: Locale) =>
  fill(getContent(locale).copy.seo.title, seoValues());
export const seoDescription = (locale: Locale) =>
  fill(getContent(locale).copy.seo.description, seoValues());

/**
 * Serializa datos estructurados para un <script type="application/ld+json">.
 * "<" se escapa como < para que ningún texto pueda cerrar la etiqueta.
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

// Imagen para redes: recorte JPG de la foto del hero (IMAGES.og, generado por npm run images).
// Es solo una foto, sin texto: la comparten los dos idiomas y solo cambia el texto alternativo.
export function ogImage(locale: Locale) {
  return {
    url: absoluteUrl(`/images/${IMAGES.og.output}.jpg`),
    width: IMAGES.og.width,
    height: IMAGES.og.height,
    alt: fill(getContent(locale).copy.seo.ogImageAlt, seoValues()),
  };
}

/**
 * Canonical propio y versiones en cada idioma (FR-28, AC-25): `es-CO`, `en` y
 * `x-default` (el español), las mismas en las dos páginas de cada pareja.
 */
export function alternates(pagina: Pagina, locale: Locale) {
  const languages: Record<string, string> = Object.fromEntries(
    LOCALES.map((l) => [l, absoluteUrl(rutaDe(pagina, l))]),
  );
  languages["x-default"] = absoluteUrl(rutaDe(pagina, DEFAULT_LOCALE));
  return { canonical: absoluteUrl(rutaDe(pagina, locale)), languages };
}

/** Metadatos de una página en un idioma: título, descripción, URL, Open Graph y Twitter. */
export function pageMetadata(
  pagina: Pagina,
  locale: Locale,
  { title, description }: { title: string; description: string },
): Metadata {
  const { canonical, languages } = alternates(pagina, locale);
  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map(
        (l) => OG_LOCALE[l],
      ),
      siteName: site.brand,
      title,
      description,
      url: canonical,
      images: [ogImage(locale)],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage(locale)],
    },
  };
}

/** Metadatos del inicio de un idioma (T-31, NFR-03). */
export const homeMetadata = (locale: Locale) =>
  pageMetadata("inicio", locale, {
    title: seoTitle(locale),
    description: seoDescription(locale),
  });

/** Metadatos de todo documento, también la 404. */
export const baseMetadata: Metadata = {
  // Todas las URL se arman absolutas con absoluteUrl(), que ya incluye el prefijo de la demo.
  metadataBase: new URL(site.url),
  // Explícita (SEC-03, T-62) mientras el hosting no permita cabeceras (D-11, T-32).
  // Con origen cruzado envía solo el origen, que OpenStreetMap pide en las teselas.
  referrer: "strict-origin-when-cross-origin",
};

/** Metadatos comunes de los layouts raíz de los dos idiomas. */
export const rootMetadata: Metadata = {
  ...baseMetadata,
  // La demo no se indexa en ningún idioma (D-11).
  robots: isProduction
    ? { index: true, follow: true }
    : { index: false, follow: false },
};
