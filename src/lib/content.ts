import { z } from "zod";
import { findForbiddenClaims } from "@/lib/claims";
import siteJson from "@/content/site.json";
import productsJson from "@/content/products.json";
import zonesJson from "@/content/zones.json";
import faqJson from "@/content/faq.json";
import recipesJson from "@/content/recipes.json";
import originJson from "@/content/origin.json";
import copyJson from "@/content/copy.json";
import testimonialsJson from "@/content/testimonials.json";
import legalJson from "@/content/legal.json";
import {
  copySchema,
  faqSchema,
  legalSchema,
  originSchema,
  productsSchema,
  recipesSchema,
  siteSchema,
  testimonialsSchema,
  zonesSchema,
} from "@/lib/schema";

// Punto único de acceso al contenido. Se evalúa durante el build: si un archivo
// no cumple su esquema, la compilación falla con el detalle del error.
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
export const products = parse(productsSchema, productsJson, "products.json");
export const zones = parse(zonesSchema, zonesJson, "zones.json");
export const faq = parse(faqSchema, faqJson, "faq.json");
export const recipes = parse(recipesSchema, recipesJson, "recipes.json");
export const origin = parse(originSchema, originJson, "origin.json");
export const copy = parse(copySchema, copyJson, "copy.json");
export const legal = parse(legalSchema, legalJson, "legal.json");
export const testimonials = parse(
  testimonialsSchema,
  testimonialsJson,
  "testimonials.json",
);

// P1 y P3: ninguna frase prohibida en el contenido publicado.
const forbidden = findForbiddenClaims(
  JSON.stringify([
    site,
    products,
    zones,
    faq,
    recipes,
    origin,
    copy,
    testimonials,
    legal,
  ]),
);
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
