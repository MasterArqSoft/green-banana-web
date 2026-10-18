// Presupuesto de peso inicial (P5, spec/03-plan.md §8): suma, comprimido con gzip
// como lo sirve el hosting, el HTML de cada página y los JS, CSS y fuentes que
// precarga. Las imágenes diferidas no cuentan. Falla si alguna página supera el límite.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const LIMIT_KB = 300;
const out = join(process.cwd(), "out");
const pages = [
  "index.html",
  "terminos.html",
  "privacidad.html",
  "garantia.html",
];

const transferred = (file) => {
  const data = readFileSync(join(out, file));
  // woff2 ya viene comprimido; el hosting no lo vuelve a comprimir.
  return file.endsWith(".woff2")
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
}
process.exit(failed ? 1 : 0);
