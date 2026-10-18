import type { MetadataRoute } from "next";
import { absoluteUrl, PAGES } from "@/lib/seo";

// Requerido por `output: "export"`: el archivo se genera una sola vez en el build.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.3,
  }));
}
