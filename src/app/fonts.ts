import { Fraunces } from "next/font/google";
import localFont from "next/font/local";

// Tipografía de spec/02-content-spec.md §5: Fraunces para títulos, Inter para el texto.
// Las dos se sirven desde el propio sitio: el visitante nunca se conecta a Google.
// Ambas tienen licencia SIL Open Font License (doc/creditos.md).

// Solo el peso 600: todos los títulos usan font-semibold. Fijo pesa 18 KB frente a
// 36,5 KB del archivo variable (T-30).
export const fraunces = Fraunces({
  weight: "600",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
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
