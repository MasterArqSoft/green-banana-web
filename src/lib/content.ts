import { z } from "zod";
import siteJson from "@/content/site.json";
import productsJson from "@/content/products.json";
import zonesJson from "@/content/zones.json";
import faqJson from "@/content/faq.json";
import recipesJson from "@/content/recipes.json";
import originJson from "@/content/origin.json";
import copyJson from "@/content/copy.json";
import {
  copySchema,
  faqSchema,
  originSchema,
  productsSchema,
  recipesSchema,
  siteSchema,
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

// Solo la pipeline de producción define SITE_ENV=production (decisión D-11).
// El build local y el de la demo en GitHub Pages trabajan con datos ficticios.
export const isProduction = process.env.SITE_ENV === "production";

if (isProduction && site.phoneIsPlaceholder) {
  throw new Error(
    "Build de producción bloqueado: site.json tiene phoneIsPlaceholder: true. " +
      "Configura el número real (RP-01) antes de publicar.",
  );
}
