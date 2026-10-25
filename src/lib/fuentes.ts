// Caracteres incluidos en los recortes de Inter (src/app/fonts/inter-es.woff2, T-82) y de
// Fraunces (src/app/fonts/fraunces-es.woff2, T-112; mismos rangos):
// ASCII imprimible, Latin-1 (tildes, ñ, ü, ¿, ¡, «», ©, ·) y la puntuación tipográfica
// común. Un carácter fuera de estos rangos se vería con la fuente de respaldo.
// Los rangos son los que recibió fontTools (--unicodes) al generar el archivo.
export const INTER_UNICODES: readonly (readonly [number, number])[] = [
  [0x0020, 0x007e],
  [0x00a0, 0x00ff],
  [0x2013, 0x2014], // – —
  [0x2018, 0x2019], // ‘ ’
  [0x201c, 0x201d], // “ ”
  [0x2022, 0x2022], // •
  [0x2026, 0x2026], // …
];

/** Caracteres de `texto` que no están en el recorte de Inter (sin repetir). */
export function fueraDeInter(texto: string): string[] {
  const fuera = new Set<string>();
  for (const caracter of texto) {
    const codigo = caracter.codePointAt(0) ?? 0;
    // Saltos de línea y tabulaciones no se dibujan.
    if (codigo < 0x20) continue;
    if (!INTER_UNICODES.some(([min, max]) => codigo >= min && codigo <= max)) {
      fuera.add(caracter);
    }
  }
  return [...fuera];
}
