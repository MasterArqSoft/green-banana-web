import localFont from "next/font/local";

// Tipografía de spec/02-content-spec.md §5: Fraunces para títulos, Inter para el texto.
// Las dos se sirven desde el propio sitio: el visitante nunca se conecta a Google, y el
// build tampoco (T-112, F-12: antes Fraunces se descargaba de Google Fonts al compilar).
// Ambas tienen licencia SIL Open Font License (doc/creditos.md).

// Fraunces autoalojada (T-112, DR-07): instancia estática del archivo variable de
// google/fonts (OFL) con wght 600, opsz 14, SOFT 0 y WONK 1, los valores de la versión
// que servía Google (mismas métricas). Solo el peso 600: todos los títulos usan
// font-semibold. Recortada a los mismos caracteres que Inter (src/lib/fuentes.ts):
// 16,8 KB frente a los 18,1 KB del subconjunto latino de Google. Procedimiento, origen y
// SHA-256 en doc/bitacora.md y doc/creditos.md. Respaldo con métricas de Times New Roman,
// como hacía next/font/google con esta serif.
export const fraunces = localFont({
  src: "./fonts/fraunces-es.woff2",
  weight: "600",
  display: "swap",
  variable: "--font-fraunces",
  adjustFontFallback: "Times New Roman",
});

// Inter recortada (T-82, PERF-02): variable de 400 a 700 (texto normal, font-semibold y
// <strong>), solo los caracteres de INTER_UNICODES (src/lib/fuentes.ts) y las funciones
// tipográficas básicas, con el kerning. 23,9 KB frente a los 48,4 KB del subconjunto latino de Google.
// El archivo se generó una vez con fontTools; el procedimiento está en doc/bitacora.md.
// Si el contenido usa un carácter nuevo, tests/unit/lib/fuentes.test.ts falla.
export const inter = localFont({
  src: "./fonts/inter-es.woff2",
  weight: "400 700",
  display: "swap",
  variable: "--font-inter",
});
