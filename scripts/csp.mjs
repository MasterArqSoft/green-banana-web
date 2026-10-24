// Agrega la Content-Security-Policy por <meta> a cada HTML de out/ (T-66). Corre después
// de `next build` (npm run build): los hashes de los scripts en línea cambian en cada build.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { applyCsp } from "../src/lib/csp.ts";

const out = join(process.cwd(), "out");
const pages = readdirSync(out, { recursive: true, encoding: "utf8" }).filter(
  (file) => file.endsWith(".html"),
);
if (pages.length === 0) {
  throw new Error("out/ no tiene páginas HTML: corre antes next build");
}
for (const page of pages) {
  const file = join(out, page);
  writeFileSync(file, applyCsp(readFileSync(file, "utf8")));
}
console.log(`CSP agregada a ${pages.length} páginas de out/`);
