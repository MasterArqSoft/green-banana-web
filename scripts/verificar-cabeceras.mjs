// Comprueba las cabeceras de seguridad de un sitio publicado (T-115, DR-06, F-11): las
// ocho páginas de los dos idiomas, un recurso de /_next/static/ y dos rutas inexistentes
// (una española y una inglesa, que deben dar la 404), con revisarCabeceras() de
// src/lib/cabeceras.ts. A la 404 se le exige frame-ancestors por cabecera y la política
// completa por cabecera o por la <meta> de su cuerpo. F-11 solo cierra cuando esto pasa
// contra el dominio final de producción (tras R-08 y RP-01). Sin dependencias: fetch de Node.
// Uso: npm run cabeceras:verificar -- https://dominio.example
//      (en local, con el servidor de pruebas: http://localhost:4173)
import { cspDeMeta, revisarCabeceras } from "../src/lib/cabeceras.ts";
import { LOCALES, PAGINAS, rutaDe } from "../src/lib/i18n.ts";

const base = (process.argv[2] ?? "").replace(/\/$/, "");
if (!/^https?:\/\//.test(base)) {
  console.error("Uso: node scripts/verificar-cabeceras.mjs <url-del-sitio>");
  process.exit(2);
}

async function pedir(ruta) {
  const respuesta = await fetch(`${base}${ruta}`, { redirect: "manual" });
  return {
    estado: respuesta.status,
    tipoContenido: respuesta.headers.get("content-type") ?? "",
    cabeceras: Object.fromEntries(respuesta.headers),
    cuerpo: await respuesta.text(),
  };
}

const sello = Date.now();
const paginas = LOCALES.flatMap((locale) =>
  PAGINAS.map((pagina) => rutaDe(pagina, locale)),
);
const casos = [
  ...paginas.map((ruta) => ({ ruta, tipo: "html", estado: 200 })),
  { ruta: `/no-existe-${sello}`, tipo: "404", estado: 404 },
  { ruta: `/en/no-existe-${sello}`, tipo: "404", estado: 404 },
];

let fallos = 0;
let recurso;
async function revisar({ ruta, tipo, estado }) {
  const respuesta = await pedir(ruta);
  const problemas = revisarCabeceras(respuesta.cabeceras, tipo, {
    metaCsp: tipo === "404" ? cspDeMeta(respuesta.cuerpo) : null,
  });
  if (respuesta.estado !== estado) {
    problemas.push(`estado ${respuesta.estado}, se esperaba ${estado}`);
  }
  if (tipo !== "recurso" && !respuesta.tipoContenido.startsWith("text/html")) {
    problemas.push(
      `Content-Type «${respuesta.tipoContenido}», se esperaba text/html`,
    );
  }
  if (ruta === "/") {
    recurso = respuesta.cuerpo.match(/\/_next\/static\/[^"']+\.js/)?.[0];
  }
  fallos += problemas.length;
  console.log(
    `${problemas.length ? "✗" : "✓"} ${tipo} ${ruta}${problemas.map((p) => `\n    ${p}`).join("")}`,
  );
}

for (const caso of casos) await revisar(caso);
if (recurso) {
  await revisar({ ruta: recurso, tipo: "recurso", estado: 200 });
} else {
  console.log("✗ no se encontró un recurso de /_next/static/ en el HTML de /");
  fallos += 1;
}
console.log(fallos ? `${fallos} problema(s)` : "Todas las respuestas cumplen");
process.exitCode = fallos ? 1 : 0;
