import type { MetadataRoute } from "next";
import { isProduction } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

// Requerido por `output: "export"`: el archivo se genera una sola vez en el build.
export const dynamic = "force-static";

// Fuera de producción (demo con datos ficticios, D-11) se pide no rastrear nada. En la
// demo de GitHub Pages este archivo queda en /green-banana-web/robots.txt y los buscadores
// solo leen el de la raíz del host: ahí la señal efectiva es el meta noindex (T-84).
export default function robots(): MetadataRoute.Robots {
  if (!isProduction) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
