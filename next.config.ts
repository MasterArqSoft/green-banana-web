import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sitio 100 % estático (spec/03-plan.md §1): `next build` genera la carpeta `out/`.
  output: "export",
  // La demo en GitHub Pages vive en /green-banana-web (lo define el workflow pages.yml).
  // En local queda vacío y el sitio se sirve en la raíz.
  basePath: process.env.PAGES_BASE_PATH ?? "",
  // La exportación estática no admite el optimizador de imágenes por defecto.
  // Las fotos se entregan ya convertidas a AVIF/WebP en public/ cuando lleguen (T-04).
  images: {
    unoptimized: true,
  },
  // `experimental.inlineCss` se probó en T-30 y se descartó: el LCP de laboratorio
  // solo bajaba de 2,7 a 2,6 s y el HTML pasaba de 14,5 a 29,2 KB gzip, porque el
  // CSS queda duplicado en la carga de React.
  // `cacheComponents` y `partialPrefetching` (activos en la plantilla) se quitaron:
  // usan PPR, que Next.js no permite con `output: "export"`.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
