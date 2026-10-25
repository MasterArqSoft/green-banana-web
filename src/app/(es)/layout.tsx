import type { Metadata } from "next";
import type { ReactNode } from "react";
import { rootMetadata } from "@/lib/seo";
import { Documento } from "@/app/documento";

// Layout raíz del español (es-CO), el idioma predeterminado: conserva las URL de
// siempre (/, /terminos…) y su HTML inicial lleva lang="es-CO" (FR-25, D7).
export const metadata: Metadata = rootMetadata;

export default function LayoutEspanol({ children }: { children: ReactNode }) {
  return <Documento locale="es-CO">{children}</Documento>;
}
