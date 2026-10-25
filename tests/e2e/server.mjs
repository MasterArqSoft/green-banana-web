// Servidor estático mínimo para probar la exportación de Next (carpeta out/) con
// Playwright y Lighthouse, sin dependencias. Resuelve /terminos → out/terminos.html y
// comprime con gzip, como GitHub Pages, para que las mediciones de peso sean realistas.
// Con OUT_DIR y BASE_PATH sirve el build de la demo (out-pages/) solo bajo su prefijo,
// como GitHub Pages: fuera de /green-banana-web/ todo es 404 (T-71).
// Si el build trae los archivos de cabeceras de producción (T-115), emite las cabeceras
// como documenta el proveedor: con out/_headers, como Cloudflare (las de "/*" en toda
// respuesta y las de la regla exacta, unidas con coma si se repiten); con
// HOSTING_PROVEEDOR=azure o si solo está out/staticwebapp.config.json, como Azure (las
// globales y las de la ruta exacta, que sustituyen a las globales). Así las e2e prueban el
// archivo generado. Es una emulación de lo documentado: el comportamiento del hosting
// real solo lo acredita scripts/verificar-cabeceras.mjs contra el dominio (F-11). El
// build con prefijo (demo) no trae ninguno.
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { createGzip } from "node:zlib";
import {
  cabecerasAzurePara,
  cabecerasPara,
  leerCloudflare,
} from "../../src/lib/cabeceras.ts";

const root = join(process.cwd(), process.env.OUT_DIR ?? "out");
const basePath = process.env.BASE_PATH ?? "";
const cloudflare = join(root, "_headers");
const azure = join(root, "staticwebapp.config.json");
const usaAzure =
  existsSync(azure) &&
  (process.env.HOSTING_PROVEEDOR === "azure" || !existsSync(cloudflare));
const cabecerasDe = usaAzure
  ? (
      (config) => (ruta) =>
        cabecerasAzurePara(config, ruta)
    )(JSON.parse(readFileSync(azure, "utf8")))
  : (
      (reglas) => (ruta) =>
        cabecerasPara(reglas, ruta)
    )(
      existsSync(cloudflare)
        ? leerCloudflare(readFileSync(cloudflare, "utf8"))
        : [],
    );
// Los archivos de configuración del hosting no se sirven como contenido.
const PRIVADOS = new Set(["/_headers", "/staticwebapp.config.json"]);
const port = Number(process.env.PORT ?? 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

function resolve(urlPath) {
  const path = urlPath.split("?")[0];
  if (basePath && path !== basePath && !path.startsWith(`${basePath}/`)) {
    return null;
  }
  const clean = normalize(decodeURIComponent(path.slice(basePath.length)));
  const base = join(root, clean);
  if (!base.startsWith(root)) return null;
  const candidates = [base, `${base}.html`, join(base, "index.html")];
  return candidates.find((file) => existsSync(file) && statSync(file).isFile());
}

createServer((req, res) => {
  const ruta = (req.url ?? "/").split("?")[0];
  const seguridad = cabecerasDe(ruta);
  const file = PRIVADOS.has(ruta) ? null : resolve(req.url ?? "/");
  if (!file) {
    res.writeHead(404, { "content-type": types[".html"], ...seguridad });
    createReadStream(join(root, "404.html")).pipe(res);
    return;
  }
  const type = types[extname(file)] ?? "application/octet-stream";
  // Las fuentes woff2 e imágenes ya vienen comprimidas.
  const compressible = /text|javascript|json|svg/.test(type);
  const acceptsGzip = (req.headers["accept-encoding"] ?? "").includes("gzip");
  const gzip = compressible && acceptsGzip;
  res.writeHead(200, {
    ...seguridad,
    "content-type": type,
    ...(gzip && { "content-encoding": "gzip", vary: "accept-encoding" }),
  });
  const stream = createReadStream(file);
  (gzip ? stream.pipe(createGzip()) : stream).pipe(res);
})
  // Puerto ocupado u otro error: termina con código 1 y un mensaje claro, en vez de
  // morir en silencio y dejar que otro proceso responda en ese puerto.
  .on("error", (error) => {
    console.error(`server.mjs: ${error.message}`);
    process.exit(1);
  })
  .listen(port, () =>
    console.log(
      `${root} en http://localhost:${port}${basePath}/${existsSync(cloudflare) || existsSync(azure) ? ` (cabeceras como ${usaAzure ? "Azure" : "Cloudflare"})` : ""}`,
    ),
  );
