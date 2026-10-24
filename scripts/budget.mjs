// Presupuesto de peso inicial (P5, spec/03-plan.md §8): suma, comprimido con gzip
// como lo sirve el hosting, el HTML de cada página y los JS, CSS y fuentes que
// precarga. Las imágenes diferidas no cuentan, y la foto del hero tiene su propio límite.
// Falla si alguna página supera el límite o si alguna versión del hero supera el suyo.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { IMAGES } from "../src/lib/images.ts";

const LIMIT_KB = 300;
// Carpeta a medir: out/ por defecto, u out-pages/ (el artefacto que publica GitHub
// Pages, con prefijo y barra final) con `node scripts/budget.mjs out-pages`.
const outDir = process.argv[2] ?? "out";
const out = join(process.cwd(), outDir);
// Con barra final (trailingSlash), cada página queda en <ruta>/index.html.
const pages = ["index", "terminos", "privacidad", "garantia"].map((page) =>
  page === "index" || existsSync(join(out, `${page}.html`))
    ? `${page}.html`
    : `${page}/index.html`,
);
console.log(`Presupuesto de ${outDir}/`);

const transferred = (file) => {
  const data = readFileSync(join(out, file));
  // woff2 y las imágenes ya vienen comprimidos; el hosting no los vuelve a comprimir.
  return /\.(woff2|avif|webp|jpg|png)$/.test(file)
    ? data.length
    : gzipSync(data, { level: 9 }).length;
};

let failed = false;
for (const page of pages) {
  const html = readFileSync(join(out, page), "utf8");
  const assets = [
    ...new Set(
      [
        ...html.matchAll(
          /["'](?:\/[^"']*?)?(\/_next\/static\/[^"']+\.(?:js|css|woff2))["']/g,
        ),
      ].map((match) => match[1]),
    ),
  ];
  const parts = { html: transferred(page), js: 0, css: 0, fuentes: 0 };
  for (const asset of assets) {
    const size = transferred(asset);
    if (asset.endsWith(".js")) parts.js += size;
    else if (asset.endsWith(".css")) parts.css += size;
    else parts.fuentes += size;
  }
  const total = Object.values(parts).reduce((a, b) => a + b, 0) / 1024;
  const detail = Object.entries(parts)
    .map(([name, bytes]) => `${name} ${(bytes / 1024).toFixed(1)}`)
    .join(" · ");
  const ok = total <= LIMIT_KB;
  failed ||= !ok;
  console.log(
    `${ok ? "✓" : "✗"} ${page}: ${total.toFixed(1)} KB de ${LIMIT_KB} (${detail})`,
  );
  // La landing además descarga la foto del hero (la imagen LCP, no diferida). Tiene su
  // propio límite (maxKB en images.ts) y no entra en los 300 KB (P5, decisión del
  // usuario del 2026-10-24, T-73). Se informa el total para no leer el indicador como
  // la carga completa. El navegador elige AVIF; los demás formatos son respaldo.
  if (page === "index.html") {
    for (const [viewport, spec] of [
      ["móvil", IMAGES.heroMobile],
      ["escritorio", IMAGES.heroDesktop],
    ]) {
      const avif = transferred(`images/${spec.output}.avif`) / 1024;
      console.log(
        `  con la foto del hero en ${viewport} (AVIF ${avif.toFixed(1)} KB): ${(total + avif).toFixed(1)} KB (informativo)`,
      );
      for (const format of spec.formats) {
        const kb = transferred(`images/${spec.output}.${format}`) / 1024;
        const okHero = kb <= spec.maxKB;
        failed ||= !okHero;
        if (!okHero) {
          console.log(
            `✗ hero ${viewport} ${format}: ${kb.toFixed(1)} KB de ${spec.maxKB}`,
          );
        }
      }
    }
  }
}
process.exit(failed ? 1 : 0);
