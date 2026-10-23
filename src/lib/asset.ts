import type { ImageFormat, ImageSpec } from "@/lib/images";

// Ruta a un archivo de public/ con el prefijo de la demo en GitHub Pages
// (next.config.ts basePath). next/image no lo agrega solo a un src de texto.
export function assetPath(src: string): string {
  return `${process.env.PAGES_BASE_PATH ?? ""}${src}`;
}

// Ruta de una foto de src/lib/images.ts en public/images/: la principal o una versión
// menor del srcset ("<output>-<ancho>.<formato>"). Vive aquí y no en images.ts porque
// images.ts no tiene imports (lo carga scripts/images.mjs con Node).
export function imageSrc(
  spec: ImageSpec,
  format: ImageFormat,
  width = spec.width,
): string {
  return assetPath(
    `/images/${spec.output}${width === spec.width ? "" : `-${width}`}.${format}`,
  );
}
