import { Fraunces, Inter } from "next/font/google";

// Tipografía de spec/02-content-spec.md §5: Fraunces para títulos, Inter para el texto.
// next/font descarga los archivos en el build y los sirve desde el propio sitio:
// el visitante nunca se conecta a Google. Ambas tienen licencia SIL Open Font License.

export const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
});

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
