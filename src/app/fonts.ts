import { Fraunces, Inter } from "next/font/google";

// Tipografía de spec/02-content-spec.md §5: Fraunces para títulos, Inter para el texto.
// next/font descarga los archivos en el build y los sirve desde el propio sitio:
// el visitante nunca se conecta a Google. Ambas tienen licencia SIL Open Font License.

// Solo el peso 600: todos los títulos usan font-semibold. Fijo pesa 18 KB frente a
// 36,5 KB del archivo variable (T-30). Inter se deja variable: Google entrega el
// mismo archivo aunque se pidan solo algunos pesos.
export const fraunces = Fraunces({
  weight: "600",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
});

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
