import { getContent } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { mapaIlustradoSvg, type Variante } from "@/lib/mapa-ilustrado";

// Mapa ilustrado de la sección del mapa (FR-24), servido desde el propio sitio. Cuatro
// rutas estáticas lo generan en el build: /mapa-fincas.svg y /mapa-fincas-movil.svg con
// los rótulos en español, y las mismas bajo /en en inglés (T-95). La geometría y las
// fincas son comunes; solo cambian los rótulos.
export function respuestaMapa(locale: Locale, variante: Variante) {
  const { copy, fincas } = getContent(locale);
  return new Response(
    mapaIlustradoSvg(fincas.fincas, copy.map.previewLabels, variante),
    { headers: { "Content-Type": "image/svg+xml; charset=utf-8" } },
  );
}
