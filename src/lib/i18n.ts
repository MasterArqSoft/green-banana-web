// Idiomas y rutas del sitio (FR-25, FR-26; spec/03-plan.md D7). Módulo puro, sin
// contenido ni React: lo usan el servidor (metadatos, sitemap, enlaces) y el selector de
// idioma del navegador. La URL es la única fuente del idioma: "/" siempre es español.
// Sin imports y solo con TypeScript que Node sepa quitar: scripts/budget.mjs lo carga
// con Node, sin el alias @/ (como images.ts). tests/unit/lib/i18n.test.ts lo verifica.

export const LOCALES = ["es-CO", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es-CO";

// Páginas lógicas y su ruta en cada idioma (sin el prefijo de la demo ni barra final).
export const RUTAS = {
  inicio: { "es-CO": "/", en: "/en" },
  terminos: { "es-CO": "/terminos", en: "/en/terms" },
  privacidad: { "es-CO": "/privacidad", en: "/en/privacy" },
  garantia: { "es-CO": "/garantia", en: "/en/guarantee" },
} as const satisfies Record<string, Record<Locale, string>>;

export type Pagina = keyof typeof RUTAS;
export const PAGINAS = Object.keys(RUTAS) as Pagina[];

/** Ruta de una página en un idioma: rutaDe("terminos", "en") → "/en/terms". */
export function rutaDe(pagina: Pagina, locale: Locale): string {
  return RUTAS[pagina][locale];
}

/**
 * Página e idioma de una ruta, sin prefijo de la demo: "/en/terms/" → terminos, en.
 * null si la ruta no es una página publicada (p. ej. la 404).
 */
export function paginaDeRuta(
  ruta: string,
): { pagina: Pagina; locale: Locale } | null {
  const limpia = ruta.length > 1 ? ruta.replace(/\/+$/, "") : ruta;
  for (const pagina of PAGINAS) {
    for (const locale of LOCALES) {
      if (RUTAS[pagina][locale] === limpia) return { pagina, locale };
    }
  }
  return null;
}

/** Ruta equivalente en otro idioma; el inicio de ese idioma si la ruta no es conocida. */
export function rutaEquivalente(ruta: string, destino: Locale): string {
  return rutaDe(paginaDeRuta(ruta)?.pagina ?? "inicio", destino);
}

/** Recurso generado por idioma (p. ej. el mapa ilustrado): "/mapa-fincas.svg" → "/en/mapa-fincas.svg". */
export function recursoDe(ruta: string, locale: Locale): string {
  return locale === DEFAULT_LOCALE ? ruta : `${RUTAS.inicio[locale]}${ruta}`;
}

/** Código de Open Graph (og:locale), que usa guion bajo y región. */
export const OG_LOCALE: Record<Locale, string> = {
  "es-CO": "es_CO",
  en: "en_US",
};
