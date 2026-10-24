import { site } from "@/lib/content";
import { securityTxt } from "@/lib/security-txt";

// Requerido por `output: "export"`: el archivo se genera una sola vez en el build
// (out/.well-known/security.txt). pages.yml publica las carpetas ocultas (include-hidden-files).
export const dynamic = "force-static";

// RFC 9116 (SEC-07, T-67). Solo tiene efecto en la raíz de un dominio propio (RP-01):
// en la demo queda bajo /green-banana-web/, como robots.txt.
export function GET() {
  return new Response(securityTxt(site, new Date()), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
