import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sitio 100 % estático (spec/03-plan.md §1): `next build` genera la carpeta `out/`.
  output: "export",
  // La exportación estática no admite el optimizador de imágenes por defecto.
  // Los formatos AVIF/WebP y `srcset` se resuelven en T-30.
  images: {
    unoptimized: true,
  },
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
