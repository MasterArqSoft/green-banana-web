import type { Metadata } from "next";
import type { ReactNode } from "react";
import { rootMetadata } from "@/lib/seo";
import { Documento } from "@/app/documento";

// Layout raíz del inglés (en), bajo /en: HTML inicial con lang="en" (FR-27, D7). Al
// cambiar de idioma cambia el layout raíz y Next recarga la página completa.
export const metadata: Metadata = rootMetadata;

export default function LayoutIngles({ children }: { children: ReactNode }) {
  return <Documento locale="en">{children}</Documento>;
}
