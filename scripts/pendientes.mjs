// Lista los pendientes de producción agrupados por la decisión que los cierra (T-117,
// F-01), desde pendingMarkerEntries() de src/lib/content.ts: las mismas entradas que
// pendingMarkers(), la lista que bloquea el build con SITE_ENV=production. Nunca un
// número fijo: se calcula cada vez.
// Uso: npm run pendientes            (Markdown por la salida estándar)
//      npm run pendientes -- --json  (para otras herramientas)
// Necesita el registro de scripts/cargar-src.mjs (alias "@/" y JSON), que pone el script npm.
import { pendingMarkerEntries } from "../src/lib/content.ts";
import { agrupar, informeMarkdown } from "./pendientes-grupos.mjs";

const entradas = pendingMarkerEntries();
if (process.argv.includes("--json")) {
  console.log(JSON.stringify(agrupar(entradas), null, 2));
} else {
  process.stdout.write(
    informeMarkdown(entradas, new Date().toISOString().slice(0, 10)),
  );
}
