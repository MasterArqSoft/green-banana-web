import { copy, fincas } from "@/lib/content";
import { mapaIlustradoSvg } from "@/lib/mapa-ilustrado";

// Requerido por `output: "export"`: el SVG se genera una sola vez en el build (out/mapa-fincas.svg).
export const dynamic = "force-static";

// Fondo ilustrado de la sección del mapa en escritorio (FR-24), servido desde el propio sitio.
export function GET() {
  return new Response(
    mapaIlustradoSvg(fincas.fincas, copy.map.previewLabels, "escritorio"),
    { headers: { "Content-Type": "image/svg+xml; charset=utf-8" } },
  );
}
