// Recursos de carga inicial que enlaza el HTML de una página (lógica pura, sin E/S, para
// probarla con Vitest en tests/unit/scripts/). La usa scripts/budget.mjs.
// Los <script noModule> (polyfills de Next para navegadores sin módulos ES) no cuentan:
// los navegadores actuales no los descargan (T-83, verificado en la red con Lighthouse).

const RECURSO =
  /["'](?:\/[^"']*?)?(\/_next\/static\/[^"']+\.(?:js|css|woff2))["']/g;

/** Rutas /_next/static/… de JS, CSS y fuentes precargadas, sin repetir. */
export function recursosIniciales(html) {
  const sinModulo = new Set();
  for (const [etiqueta] of html.matchAll(/<script\b[^>]*>/gi)) {
    if (!/\snomodule\b/i.test(etiqueta)) continue;
    for (const [, ruta] of etiqueta.matchAll(RECURSO)) sinModulo.add(ruta);
  }
  const rutas = [...html.matchAll(RECURSO)].map((match) => match[1]);
  return [...new Set(rutas)].filter((ruta) => !sinModulo.has(ruta));
}
