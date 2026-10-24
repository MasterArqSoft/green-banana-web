// Servidor estático mínimo para probar la exportación de Next (carpeta out/) con
// Playwright y Lighthouse, sin dependencias. Resuelve /terminos → out/terminos.html y
// comprime con gzip, como GitHub Pages, para que las mediciones de peso sean realistas.
// Con OUT_DIR y BASE_PATH sirve el build de la demo (out-pages/) solo bajo su prefijo,
// como GitHub Pages: fuera de /green-banana-web/ todo es 404 (T-71).
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { createGzip } from "node:zlib";

const root = join(process.cwd(), process.env.OUT_DIR ?? "out");
const basePath = process.env.BASE_PATH ?? "";
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
  const file = resolve(req.url ?? "/");
  if (!file) {
    res.writeHead(404, { "content-type": types[".html"] });
    createReadStream(join(root, "404.html")).pipe(res);
    return;
  }
  const type = types[extname(file)] ?? "application/octet-stream";
  // Las fuentes woff2 e imágenes ya vienen comprimidas.
  const compressible = /text|javascript|json|svg/.test(type);
  const acceptsGzip = (req.headers["accept-encoding"] ?? "").includes("gzip");
  const gzip = compressible && acceptsGzip;
  res.writeHead(200, {
    "content-type": type,
    ...(gzip && { "content-encoding": "gzip", vary: "accept-encoding" }),
  });
  const stream = createReadStream(file);
  (gzip ? stream.pipe(createGzip()) : stream).pipe(res);
}).listen(port, () =>
  console.log(`${root} en http://localhost:${port}${basePath}/`),
);
