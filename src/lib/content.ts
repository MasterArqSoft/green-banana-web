import { z } from "zod";
import {
  findForbiddenClaims,
  findPendingMarkerEntries,
  findPendingMarkers,
  type PendingEntry,
} from "@/lib/claims";
import type { Locale } from "@/lib/i18n";
import { diferenciasDeCatalogo, idsSinPareja } from "@/lib/paridad";
// Datos comunes a los dos idiomas (spec/03-plan.md D7).
import siteJson from "@/content/site.json";
import productsJson from "@/content/products.json";
import zonesJson from "@/content/zones.json";
import recipesJson from "@/content/recipes.json";
import originJson from "@/content/origin.json";
import testimonialsJson from "@/content/testimonials.json";
import fincasJson from "@/content/fincas.json";
// Catálogo español (es-CO), el contenido editorial base.
import esCopy from "@/content/es-CO/copy.json";
import esProducts from "@/content/es-CO/products.json";
import esFaq from "@/content/es-CO/faq.json";
import esRecipes from "@/content/es-CO/recipes.json";
import esLegal from "@/content/es-CO/legal.json";
import esTestimonials from "@/content/es-CO/testimonials.json";
import esFincas from "@/content/es-CO/fincas.json";
// Catálogo inglés (en).
import enCopy from "@/content/en/copy.json";
import enProducts from "@/content/en/products.json";
import enFaq from "@/content/en/faq.json";
import enRecipes from "@/content/en/recipes.json";
import enLegal from "@/content/en/legal.json";
import enTestimonials from "@/content/en/testimonials.json";
import enFincas from "@/content/en/fincas.json";
import {
  copySchema,
  faqSchema,
  fincaNamesSchema,
  fincasSchema,
  legalSchema,
  originSchema,
  productsSchema,
  productTextsSchema,
  recipesSchema,
  recipeTextsSchema,
  siteSchema,
  testimonialsSchema,
  testimonialTextsSchema,
  zonesSchema,
  type Copy,
  type FaqItem,
  type Fincas,
  type Legal,
  type Origin,
  type Presentation,
  type Recipe,
  type Site,
  type Testimonial,
  type Zone,
} from "@/lib/schema";

// Punto único de acceso al contenido. Se evalúa durante el build: si un archivo
// no cumple su esquema, la compilación falla con el detalle del error. Los dos
// idiomas se validan siempre, aunque solo se pida una página.
// Úsalo solo desde componentes de servidor.

function parse<T>(schema: z.ZodType<T>, data: unknown, file: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Contenido inválido en src/content/${file}:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}

export const site = parse(siteSchema, siteJson, "site.json");
const comunes = {
  site,
  products: parse(productsSchema, productsJson, "products.json"),
  zones: parse(zonesSchema, zonesJson, "zones.json"),
  recipes: parse(recipesSchema, recipesJson, "recipes.json"),
  origin: parse(originSchema, originJson, "origin.json"),
  testimonials: parse(
    testimonialsSchema,
    testimonialsJson,
    "testimonials.json",
  ),
  fincas: parse(fincasSchema, fincasJson, "fincas.json"),
};

function catalogo(locale: Locale, archivos: Record<string, unknown>) {
  const leer = <T>(schema: z.ZodType<T>, nombre: string) =>
    parse(schema, archivos[nombre], `${locale}/${nombre}.json`);
  return {
    copy: leer(copySchema, "copy"),
    products: leer(productTextsSchema, "products"),
    faq: leer(faqSchema, "faq"),
    recipes: leer(recipeTextsSchema, "recipes"),
    legal: leer(legalSchema, "legal"),
    testimonials: leer(testimonialTextsSchema, "testimonials"),
    fincas: leer(fincaNamesSchema, "fincas"),
  };
}
type Catalogo = ReturnType<typeof catalogo>;

const catalogos: Record<Locale, Catalogo> = {
  "es-CO": catalogo("es-CO", {
    copy: esCopy,
    products: esProducts,
    faq: esFaq,
    recipes: esRecipes,
    legal: esLegal,
    testimonials: esTestimonials,
    fincas: esFincas,
  }),
  en: catalogo("en", {
    copy: enCopy,
    products: enProducts,
    faq: enFaq,
    recipes: enRecipes,
    legal: enLegal,
    testimonials: enTestimonials,
    fincas: enFincas,
  }),
};

// AC-24: cada catálogo tiene un texto por cada dato común, y el inglés tiene la misma
// estructura que el español (claves, IDs, marcadores {…} y marcas de pendiente).
const ids = (items: { id: string }[]) => items.map((item) => item.id);
const paridad = Object.entries(catalogos).flatMap(([locale, textos]) => [
  ...idsSinPareja(ids(comunes.products), textos.products, `${locale}/products`),
  ...idsSinPareja(ids(comunes.recipes), textos.recipes, `${locale}/recipes`),
  ...idsSinPareja(
    ids(comunes.testimonials),
    textos.testimonials,
    `${locale}/testimonials`,
  ),
  ...idsSinPareja(
    ids(comunes.fincas.fincas),
    textos.fincas,
    `${locale}/fincas`,
  ),
]);
paridad.push(
  ...diferenciasDeCatalogo(catalogos["es-CO"], catalogos.en).map(
    (diferencia) => `en/${diferencia}`,
  ),
);
if (paridad.length > 0) {
  throw new Error(
    `Los catálogos de idioma no coinciden (AC-24):\n${paridad.map((item) => `  ${item}`).join("\n")}`,
  );
}

// P1 y P3: ninguna frase prohibida, en ningún idioma.
const forbidden = findForbiddenClaims(JSON.stringify([comunes, catalogos]));
if (forbidden.length > 0) {
  throw new Error(
    `Contenido con frases prohibidas (P1, P3): ${forbidden.join(", ")}`,
  );
}

// Solo la pipeline de producción define SITE_ENV=production (decisión D-11).
// El build local y el de la demo en GitHub Pages trabajan con datos ficticios.
export const isProduction = process.env.SITE_ENV === "production";

if (isProduction && site.phoneIsPlaceholder) {
  throw new Error(
    "Build de producción bloqueado: site.json tiene phoneIsPlaceholder: true. " +
      "Configura el número real (RP-01) antes de publicar.",
  );
}

/** Datos ficticios o por confirmar en los datos comunes y en los dos catálogos. */
export function pendingMarkers(): string[] {
  return findPendingMarkers({ ...comunes, ...catalogos });
}

/** Las mismas entradas con el texto completo, para el expediente de lanzamiento (T-117). */
export function pendingMarkerEntries(): PendingEntry[] {
  return findPendingMarkerEntries({ ...comunes, ...catalogos });
}

// 00-constitution.md §4: nada ficticio ni pendiente al publicar (RP-01 a RP-05, T-03, T-05),
// en ningún idioma. Fuera de producción estas marcas se ven a propósito en la demo.
if (isProduction) {
  const pending = pendingMarkers();
  if (pending.length > 0) {
    throw new Error(
      `Build de producción bloqueado: quedan ${pending.length} datos ficticios o por confirmar:\n` +
        pending.map((item) => `  ${item}`).join("\n"),
    );
  }
}

/** Contenido de un idioma: datos comunes con los textos de ese idioma ya compuestos. */
export type Contenido = {
  locale: Locale;
  site: Site;
  copy: Copy;
  products: Presentation[];
  zones: Zone[];
  faq: FaqItem[];
  recipes: Recipe[];
  origin: Origin;
  testimonials: Testimonial[];
  legal: Legal;
  fincas: Fincas;
};

function componer(locale: Locale): Contenido {
  const textos = catalogos[locale];
  return {
    locale,
    site,
    copy: textos.copy,
    products: comunes.products.map((p) => ({ ...p, ...textos.products[p.id] })),
    zones: comunes.zones,
    faq: textos.faq,
    recipes: comunes.recipes.map((r) => ({ ...r, ...textos.recipes[r.id] })),
    origin: comunes.origin,
    testimonials: comunes.testimonials.map((t) => ({
      ...t,
      ...textos.testimonials[t.id],
    })),
    legal: textos.legal,
    fincas: {
      ...comunes.fincas,
      fincas: comunes.fincas.fincas.map((f) => ({
        ...f,
        nombre: textos.fincas[f.id],
      })),
    },
  };
}

// Se compone una vez por idioma; nada cambia después (sin estado global de idioma).
const contenidos: Record<Locale, Contenido> = {
  "es-CO": componer("es-CO"),
  en: componer("en"),
};

/** Contenido validado de un idioma (FR-27). */
export function getContent(locale: Locale): Contenido {
  return contenidos[locale];
}
