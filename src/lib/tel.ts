// Único punto que genera el enlace de llamada (spec/01-spec.md §4.1, principio P9).
// Recibe el número de site.json (`site.phone`); ningún componente arma el `tel:` por su cuenta.

// Teléfono colombiano en formato E.164: +57 y 10 dígitos. También lo usa el esquema de site.json.
export const PHONE_E164_CO = /^\+57(\d{3})(\d{3})(\d{4})$/;

function parsePhone(phone: string): RegExpExecArray {
  const match = PHONE_E164_CO.exec(phone);
  if (!match) {
    throw new Error(
      `Número inválido "${phone}": se espera +57 y 10 dígitos, sin espacios`,
    );
  }
  return match;
}

/** Enlace para abrir el marcador del teléfono: "tel:+573000000000". */
export function telHref(phone: string): string {
  parsePhone(phone);
  return `tel:${phone}`;
}

/** Número legible para mostrar en la página: "+57 300 000 0000". */
export function formatPhone(phone: string): string {
  const [, prefix, middle, last] = parsePhone(phone);
  return `+57 ${prefix} ${middle} ${last}`;
}
