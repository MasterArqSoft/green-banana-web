import type { Metadata } from "next";
import { getContent, site } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import type { LegalPageKey } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { formatPhone } from "@/lib/tel";
import { fill } from "@/lib/template";

// La identidad real sigue saliendo de site.json y no se traduce. Solo se localizan
// las descripciones exactas del ejemplo ficticio, sin cambiar el dato común.
export function legalValues(locale: Locale = "es-CO") {
  const base = getContent("es-CO").copy.footer.exampleValues;
  const textos = getContent(locale).copy.footer.exampleValues;
  const nombre = (campo: keyof typeof base) => {
    const values = { ciudad: site.acopio.city };
    return site.legal[campo] === `${fill(base[campo], values)} (FICTICIO)`
      ? `${fill(textos[campo], values)} (FICTICIO)`
      : site.legal[campo];
  };
  return {
    razonSocial: nombre("razonSocial"),
    nit: site.legal.nit,
    direccion: nombre("direccion"),
    correo: site.legal.correo,
    telefono: formatPhone(site.phone),
    ciudad: site.acopio.city,
  };
}

/** Metadatos de una página legal (FR-18, FR-28): título, descripción y URL en su idioma. */
export function legalMetadata(page: LegalPageKey, locale: Locale): Metadata {
  const { copy, legal } = getContent(locale);
  return pageMetadata(page, locale, {
    title: fill(copy.seo.legalTitle, {
      pagina: legal[page].title,
      marca: site.brand,
    }),
    description: fill(legal[page].description, legalValues(locale)),
  });
}
