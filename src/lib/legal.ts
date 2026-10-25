import type { Metadata } from "next";
import { getContent, site } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import type { LegalPageKey } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { formatPhone } from "@/lib/tel";
import { fill } from "@/lib/template";

// Datos de site.json que pueden usar los párrafos de legal.json. Son los mismos en
// los dos idiomas: la identidad del vendedor no se traduce (02 §1).
export function legalValues() {
  return {
    razonSocial: site.legal.razonSocial,
    nit: site.legal.nit,
    direccion: site.legal.direccion,
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
    description: fill(legal[page].description, legalValues()),
  });
}
