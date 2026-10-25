import type { Metadata } from "next";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import { getContent, site } from "@/lib/content";
import { baseMetadata } from "@/lib/seo";
import { fill } from "@/lib/template";
import { Documento } from "@/app/documento";

// 404 global (AC-28). Con un layout raíz por idioma no hay uno común para componer la
// 404: Next usa este archivo para toda URL desconocida, también /en/no-existe. Es una
// función experimental (experimental.globalNotFound en next.config.ts); T-88 comprobó
// con Next 16.4.2 que exporta out/404.html con lang="es-CO", con y sin prefijo. Sin
// ella, Next genera una 404 propia en inglés y sin lang. Español principal con ayuda en
// inglés (NotFoundPage). Next agrega noindex; sin canonical ni alternates.
const { copy } = getContent("es-CO");

// Sin el robots de los layouts (rootMetadata): Next ya marca la 404 con noindex, y en
// producción rootMetadata diría index.
export const metadata: Metadata = {
  ...baseMetadata,
  title: fill(copy.seo.legalTitle, {
    pagina: copy.notFound.title,
    marca: site.brand,
  }),
};

export default function GlobalNotFound() {
  return (
    <Documento locale="es-CO" selector={false}>
      <NotFoundPage />
    </Documento>
  );
}
