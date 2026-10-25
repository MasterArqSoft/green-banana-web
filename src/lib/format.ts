import type { Locale } from "@/lib/i18n";

// Formatos por idioma (FR-27, AC-26): `Intl` recibe siempre el idioma de forma explícita.
// Unidades métricas en los dos idiomas.
const formatos = (locale: Locale) => ({
  decimal: new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }),
  // UTC para que una fecha ISO "2026-10-15" no se corra un día según la zona horaria.
  longDate: new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: "UTC",
  }),
  conjunction: new Intl.ListFormat(locale, { type: "conjunction" }),
});
const porIdioma = {
  "es-CO": formatos("es-CO"),
  en: formatos("en"),
} satisfies Record<Locale, ReturnType<typeof formatos>>;

/** Lista legible: ["A", "B", "C"] → "A, B y C" (es-CO) o "A, B, and C" (en). */
export function formatList(items: string[], locale: Locale): string {
  return porIdioma[locale].conjunction.format(items);
}

/** Fecha ISO legible: "2026-10-15" → "15 de octubre de 2026" o "October 15, 2026". */
export function formatDate(isoDate: string, locale: Locale): string {
  return porIdioma[locale].longDate.format(new Date(isoDate));
}

/** Marca una cifra pendiente de confirmar, como en el spec: "220" → "[220]". */
export function markPending(value: string, pending: boolean): string {
  return pending ? `[${value}]` : value;
}

/**
 * Peso aproximado legible: 220 → "220 g", 3000 → "3 kg", [18000, 20000] → "18–20 kg".
 * Un rango usa la misma unidad en ambos extremos. Los decimales siguen el idioma
 * ("1,5 kg" o "1.5 kg"). Con `pending`, la cifra va entre corchetes: "[220] g".
 */
export function formatWeight(
  grams: number | [number, number],
  locale: Locale,
  pending = false,
): string {
  const [min, max] = Array.isArray(grams) ? grams : [grams, grams];
  const inKg = max >= 1000;
  const show = (g: number) =>
    porIdioma[locale].decimal.format(inKg ? g / 1000 : g);
  const value = min === max ? show(min) : `${show(min)}–${show(max)}`;
  return `${markPending(value, pending)} ${inKg ? "kg" : "g"}`;
}
