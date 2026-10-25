import type { MetadataRoute } from "next";
import { LOCALES, PAGINAS, rutaDe } from "@/lib/i18n";
import { absoluteUrl, alternates } from "@/lib/seo";

// Requerido por `output: "export"`: el archivo se genera una sola vez en el build.
export const dynamic = "force-static";

// Las ocho páginas, cada una con sus versiones en los dos idiomas (FR-28, AC-25): las
// mismas URL que el canonical y los alternates de cada página.
export default function sitemap(): MetadataRoute.Sitemap {
  return PAGINAS.flatMap((pagina) =>
    LOCALES.map((locale) => ({
      url: absoluteUrl(rutaDe(pagina, locale)),
      changeFrequency: "monthly" as const,
      priority: pagina === "inicio" ? 1 : 0.3,
      alternates: { languages: alternates(pagina, locale).languages },
    })),
  );
}
