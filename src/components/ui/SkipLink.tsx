import { copy } from "@/lib/content";

// Destino del enlace: el <main> de cada página lleva este id.
export const MAIN_ID = "contenido";

// "Saltar al contenido" (UX-08, T-58, WCAG 2.4.1): primer elemento enfocable de la
// página. Oculto hasta recibir el foco con el teclado; entonces aparece arriba a la izquierda.
export function SkipLink() {
  return (
    <a
      href={`#${MAIN_ID}`}
      className="sr-only rounded-control bg-carbon px-4 py-3 font-semibold text-crema focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
    >
      {copy.navigation.skipToContent}
    </a>
  );
}
