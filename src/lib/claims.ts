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
  "últimas unidades",
  "quedan pocos",
  "solo hoy",
  "por tiempo limitado",
];

// Marcas de dato ficticio o pendiente que no pueden llegar a producción.
const PENDING_MARKER = /\(FICTICIO\)|\[[^\]]*\]/;

/**
 * Recorre el contenido y devuelve la ruta y el texto de cada valor con una marca
 * "(FICTICIO)" o "[…]" (p. ej. "[POR CONFIRMAR]", "[4 y 7]"), la URL de la demo y los
 * `pendingConfirmation` no vacíos de products.json.
 */
export function findPendingMarkers(content: Record<string, unknown>): string[] {
  const found: string[] = [];
  const walk = (value: unknown, path: string) => {
    if (typeof value === "string") {
      if (PENDING_MARKER.test(value) || value.includes("github.io")) {
        found.push(`${path}: ${value.slice(0, 80)}`);
      }
    } else if (Array.isArray(value)) {
      if (path.endsWith(".pendingConfirmation") && value.length > 0) {
        found.push(`${path}: ${value.join(", ")}`);
      }
      value.forEach((item, index) => walk(item, `${path}[${index}]`));
    } else if (value && typeof value === "object") {
      for (const [key, item] of Object.entries(value)) {
        walk(item, path ? `${path}.${key}` : key);
      }
    }
  };
  walk(content, "");
  return found;
}

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
