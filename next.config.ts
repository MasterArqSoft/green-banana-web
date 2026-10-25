import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sitio 100 % estático (spec/03-plan.md §1): `next build` genera la carpeta `out/`.
  output: "export",
  // La demo en GitHub Pages vive en /green-banana-web (lo define el workflow pages.yml).
  // En local queda vacío y el sitio se sirve en la raíz.
  basePath: process.env.PAGES_BASE_PATH ?? "",
  // Solo con prefijo (la demo): sin barra final, Next pedía el payload de la página de
  // inicio en /green-banana-web.txt, fuera del sitio (404 y recarga completa al volver al
  // inicio). Con barra final lo pide en /green-banana-web/index.txt (T-71). Producción,
  // en la raíz de su dominio, no lo necesita y conserva las URL sin barra.
  trailingSlash: Boolean(process.env.PAGES_BASE_PATH),
  // La exportación estática no admite el optimizador de imágenes por defecto.
  // Las fotos se entregan ya convertidas a AVIF/WebP en public/ cuando lleguen (T-04).
  images: {
    unoptimized: true,
  },
  // Un layout raíz por idioma, (es) y (en) (spec/03-plan.md D7): no queda uno común para
  // componer la 404, y Next exportaba una propia en inglés y sin lang. global-not-found
  // (src/app/global-not-found.tsx) es experimental en Next 16.4; T-88 comprobó que
  // exporta out/404.html con y sin prefijo. Revisar al actualizar Next.
  experimental: {
    globalNotFound: true,
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
