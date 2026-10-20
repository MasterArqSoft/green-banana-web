import { copy, fincas } from "@/lib/content";
import { mapaIlustradoSvg } from "@/lib/mapa-ilustrado";

// Requerido por `output: "export"`: el SVG se genera una sola vez en el build.
export const dynamic = "force-static";

// Variante móvil del mapa ilustrado (FR-24): recortada a las fincas, con símbolos más grandes.
export function GET() {
  return new Response(
    mapaIlustradoSvg(fincas.fincas, copy.map.previewLabels, "movil"),
    { headers: { "Content-Type": "image/svg+xml; charset=utf-8" } },
  );
}
