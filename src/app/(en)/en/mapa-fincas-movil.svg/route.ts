import { respuestaMapa } from "@/app/mapa-svg";

// Requerido por `output: "export"`: el SVG se genera una sola vez en el build (out/en/mapa-fincas-movil.svg).
export const dynamic = "force-static";

export function GET() {
  return respuestaMapa("en", "movil");
}
