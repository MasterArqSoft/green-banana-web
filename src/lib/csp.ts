// Content-Security-Policy por <meta> (SEC-01 parcial, T-66). GitHub Pages no permite
// cabeceras propias (D-11); la cabecera completa llega con el hosting de producción (T-32).
// scripts/csp.mjs aplica applyCsp() a cada HTML de out/ después de `next build`.
// Sin imports de "@/": lo carga Node desde el script (igual que images.ts).
import { createHash } from "node:crypto";

// Teselas del mapa de fincas (FR-24). Debe coincidir con TILES de
// components/cliente/MapaFincasInteractivo.tsx; lo verifican tests/unit/lib/csp.test.ts
// (lee el fuente del componente) y tests/e2e/csp.spec.ts (carga el mapa).
export const TILE_ORIGIN = "https://tile.openstreetmap.org";

// Scripts en línea ejecutables. Los de datos (JSON-LD) no se ejecutan y la CSP no
// los bloquea, así que no necesitan hash. Los atributos van precedidos de un espacio:
// así `data-src=` no se confunde con `src=`.
const INLINE_SCRIPT =
  /<script(?![^>]*\ssrc=)(?![^>]*\stype="application\/(?:ld\+)?json")[^>]*>([\s\S]*?)<\/script>/g;

export function inlineScriptHashes(html: string): string[] {
  const hashes = [...html.matchAll(INLINE_SCRIPT)].map(
    ([, body]) =>
      `'sha256-${createHash("sha256").update(body, "utf8").digest("base64")}'`,
  );
  return [...new Set(hashes)];
}

// Política mínima para un sitio estático sin formularios ni terceros, salvo las teselas.
// - style-src 'unsafe-inline': la página 404 de Next trae <style> y atributos style, y
//   Leaflet posiciona el mapa con estilos en línea. Inyectar CSS no ejecuta código.
// - Sin frame-ancestors ni upgrade-insecure-requests: por <meta> el primero se ignora
//   (y deja un error en consola) y el segundo rompería las pruebas sobre http://localhost.
export function cspPolicy(hashes: string[]): string {
  return [
    "default-src 'self'",
    `script-src 'self' ${hashes.join(" ")}`.trim(),
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: ${TILE_ORIGIN}`,
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join("; ");
}

// La misma política para la cabecera HTTP del hosting de producción (T-115, DR-06):
// agrega frame-ancestors 'none', que por <meta> no tiene efecto. La genera
// scripts/cabeceras.mjs para cada página, con los mismos hashes que su <meta>.
export function cspPolicyCabecera(hashes: string[]): string {
  return `${cspPolicy(hashes)}; frame-ancestors 'none'`;
}

// Inserta la <meta> justo después de <meta charSet>, antes de cualquier script.
export function applyCsp(html: string): string {
  if (html.includes('http-equiv="Content-Security-Policy"')) {
    throw new Error("El HTML ya tiene una CSP");
  }
  const charset = /<meta charSet="utf-8"\/>/i;
  if (!charset.test(html)) throw new Error('Falta <meta charSet="utf-8"/>');
  const meta = `<meta http-equiv="Content-Security-Policy" content="${cspPolicy(inlineScriptHashes(html))}"/>`;
  const result = html.replace(charset, (match) => `${match}${meta}`);
  // Un script anterior a la <meta> se ejecutaría sin CSP y sin dejar violaciones.
  const firstScript = result.indexOf("<script");
  if (firstScript !== -1 && firstScript < result.indexOf(meta)) {
    throw new Error("Hay un <script> antes de la CSP");
  }
  return result;
}
