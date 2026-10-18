// Frases prohibidas en cualquier texto publicado (spec/00-constitution.md P1 y P3,
// spec/02-content-spec.md §1 y FR-08). content.ts las busca en todo el contenido
// durante el build: si aparece una, la compilación falla.
export const FORBIDDEN_CLAIMS = [
  // P3: sin afirmaciones de salud.
  "diabetes",
  "cáncer",
  "pérdida de peso",
  "perder peso",
  "bajar de peso",
  "adelgazar",
  // P1 y voz y tono: sin exageraciones ni escasez artificial.
  "el mejor",
  "100 % garantizado",
  "100% garantizado",
  "cupos limitados",
];

// Minúsculas y sin tildes, para que "Cancer" o "CÁNCER" también se detecten.
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/** Devuelve las frases prohibidas que aparecen en el texto. */
export function findForbiddenClaims(text: string): string[] {
  const haystack = normalize(text);
  return FORBIDDEN_CLAIMS.filter((claim) =>
    haystack.includes(normalize(claim)),
  );
}
