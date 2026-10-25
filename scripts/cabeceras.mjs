// Genera los archivos de cabeceras del hosting de producción en out/ (T-115, DR-06):
// `_headers` (Cloudflare) y/o `staticwebapp.config.json` (Azure Static Web Apps), desde
// src/lib/cabeceras.ts y la CSP de cada página (los mismos hashes que su <meta>). Corre
// después de scripts/csp.mjs en `npm run build`.
// Qué proveedor: HOSTING_PROVEEDOR=cloudflare|azure genera solo su archivo (y borra el del
// otro si quedara en out/). Con SITE_ENV=production es obligatorio (R-08): el artefacto
// de producción nunca publica la configuración del proveedor alternativo. Sin elegir y
// fuera de producción, genera los dos para probarlos en local.
// En el build de la demo con prefijo (PAGES_BASE_PATH, GitHub Pages) no genera nada:
// Pages no usa estos archivos y no deben publicarse allí.
import {
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import {
  ARCHIVO_PROVEEDOR,
  archivoAzure,
  archivoCloudflare,
  proveedoresDelBuild,
  rutaDeHtml,
} from "../src/lib/cabeceras.ts";
import { cspPolicyCabecera, inlineScriptHashes } from "../src/lib/csp.ts";

const GENERADORES = { cloudflare: archivoCloudflare, azure: archivoAzure };

if (process.env.PAGES_BASE_PATH) {
  console.log("Cabeceras: build de la demo (GitHub Pages), no se generan");
} else {
  let proveedores;
  try {
    proveedores = proveedoresDelBuild(process.env);
  } catch (error) {
    console.error(`Cabeceras: ${error.message}`);
    process.exit(1);
  }
  const out = join(process.cwd(), "out");
  const paginas = readdirSync(out, { recursive: true, encoding: "utf8" })
    .filter((archivo) => archivo.endsWith(".html"))
    .map((archivo) => ({ archivo, ruta: rutaDeHtml(archivo) }))
    .filter(({ ruta }) => ruta !== null)
    .map(({ archivo, ruta }) => ({
      ruta,
      csp: cspPolicyCabecera(
        inlineScriptHashes(readFileSync(join(out, archivo), "utf8")),
      ),
    }))
    .sort((a, b) => a.ruta.localeCompare(b.ruta));
  for (const [proveedor, archivo] of Object.entries(ARCHIVO_PROVEEDOR)) {
    const destino = join(out, archivo);
    if (proveedores.includes(proveedor)) {
      writeFileSync(destino, GENERADORES[proveedor](paginas));
    } else if (existsSync(destino)) {
      rmSync(destino);
    }
  }
  console.log(
    `Cabeceras de producción de ${paginas.length} páginas para ${proveedores.join(" y ")}: ${proveedores.map((p) => `out/${ARCHIVO_PROVEEDOR[p]}`).join(", ")}${process.env.HOSTING_PROVEEDOR ? "" : " (sin HOSTING_PROVEEDOR: las dos variantes, solo para probar en local)"}`,
  );
}
