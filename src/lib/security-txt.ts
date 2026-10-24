import type { Site } from "@/lib/schema";

export const SECURITY_TXT_PATH = "/.well-known/security.txt";

// RFC 9116 recomienda que Expires quede a menos de un año: cada build lo renueva.
const VIGENCIA_DIAS = 180;

// Canal para reportar vulnerabilidades (SEC-07, T-67). Los nombres de campo son del
// estándar, no textos de interfaz; el contacto sale de site.json, como el resto de datos legales.
export function securityTxt(site: Site, now: Date): string {
  const expires = new Date(now.getTime() + VIGENCIA_DIAS * 24 * 60 * 60 * 1000);
  return [
    `Contact: mailto:${site.legal.correo}`,
    `Expires: ${expires.toISOString()}`,
    "Preferred-Languages: es",
    // Del mismo site recibido (no del global de seo.ts): la función solo depende de sus argumentos.
    `Canonical: ${site.url}${SECURITY_TXT_PATH}`,
    "",
  ].join("\n");
}
