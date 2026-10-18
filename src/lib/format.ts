const decimal = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });
// UTC para que una fecha ISO "2026-10-15" no se corra un día según la zona horaria.
const longDate = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "long",
  timeZone: "UTC",
});

const conjunction = new Intl.ListFormat("es-CO", { type: "conjunction" });

/** Lista legible: ["A", "B", "C"] → "A, B y C". */
export function formatList(items: string[]): string {
  return conjunction.format(items);
}

/** Fecha ISO legible: "2026-10-15" → "15 de octubre de 2026". */
export function formatDate(isoDate: string): string {
  return longDate.format(new Date(isoDate));
}

/** Marca una cifra pendiente de confirmar, como en el spec: "220" → "[220]". */
export function markPending(value: string, pending: boolean): string {
  return pending ? `[${value}]` : value;
}

/**
 * Peso aproximado legible: 220 → "220 g", 3000 → "3 kg", [18000, 20000] → "18–20 kg".
 * Un rango usa la misma unidad en ambos extremos. Con `pending`, la cifra va entre
 * corchetes: "[220] g".
 */
export function formatWeight(
  grams: number | [number, number],
  pending = false,
): string {
  const [min, max] = Array.isArray(grams) ? grams : [grams, grams];
  const inKg = max >= 1000;
  const show = (g: number) => decimal.format(inKg ? g / 1000 : g);
  const value = min === max ? show(min) : `${show(min)}–${show(max)}`;
  return `${markPending(value, pending)} ${inKg ? "kg" : "g"}`;
}
