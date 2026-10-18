// Ruta a un archivo de public/ con el prefijo de la demo en GitHub Pages
// (next.config.ts basePath). next/image no lo agrega solo a un src de texto.
export function assetPath(src: string): string {
  return `${process.env.PAGES_BASE_PATH ?? ""}${src}`;
}
