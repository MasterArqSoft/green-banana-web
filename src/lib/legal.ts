import type { Metadata } from "next";
import { copy, legal, site } from "@/lib/content";
import type { LegalPageKey } from "@/lib/schema";
import { absoluteUrl } from "@/lib/seo";
import { formatPhone } from "@/lib/tel";
import { fill } from "@/lib/template";

// Datos de site.json que pueden usar los párrafos de legal.json.
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

/** Metadatos de una página legal (FR-18): título, descripción y URL canónica. */
export function legalMetadata(page: LegalPageKey): Metadata {
  return {
    title: fill(copy.seo.legalTitle, {
      pagina: legal[page].title,
      marca: site.brand,
    }),
    description: fill(legal[page].description, legalValues()),
    alternates: { canonical: absoluteUrl(`/${page}`) },
  };
}
