import base from "@/lib/mapa-base.json";
import type { Copy, Finca } from "@/lib/schema";

// Mapa ilustrado de la zona bananera (FR-24): fondo de la sección del mapa antes de
// pulsar "Ver mapa". Se genera en el build como /mapa-fincas.svg y /mapa-fincas-movil.svg
// (src/app/) y se sirve desde el propio sitio: no conecta con terceros (AC-19).
// Geometría: src/lib/mapa-base.json, derivada de OpenStreetMap (ODbL, doc/creditos.md).
// Los marcadores salen de fincas.json y los nombres de copy.json.

// Valores de los tokens de globals.css: el SVG se usa como <img> y no puede leer las
// variables CSS. Una prueba unitaria verifica que coincidan con globals.css.
export const COLORES = {
  hoja: "#2f6b3a",
  hojaClaro: "#e8f3e6",
  carbon: "#1f2a24",
  crema: "#fffbf2",
} as const;

type Punto = readonly [number, number];
const punto = ([x, y]: number[]): Punto => [x, y];

/** Variantes: escritorio (encuadre completo) y móvil (recortado a las fincas, símbolos más grandes). */
export const VARIANTES: Record<
  "escritorio" | "movil",
  {
    recorte: readonly [number, number, number, number];
    factor: number; // tamaño de marcadores y municipios
    rotulos: number; // tamaño de los nombres geográficos
    mar: Punto;
    sierra: Punto;
  }
> = {
  escritorio: {
    recorte: [0, 0, base.ancho, base.alto],
    factor: 1.4,
    rotulos: 1.4,
    mar: punto(base.etiquetas.mar),
    sierra: punto(base.etiquetas.sierra),
  },
  // En móvil los rótulos del mar y de la Sierra se mueven para no tapar Santa Marta ni la finca B.
  movil: {
    recorte: [330, 60, 820, 850],
    factor: 2.2,
    rotulos: 1.3,
    mar: [520, 200],
    sierra: [943, 190],
  },
};

export type Variante = keyof typeof VARIANTES;

const { oeste, norte, escala, sur } = base.encuadre;
const K = Math.cos((((sur + norte) / 2) * Math.PI) / 180);

/** Proyección equirectangular local del encuadre, en px del SVG. */
export function proyectar(lng: number, lat: number): [number, number] {
  return [(lng - oeste) * K * escala, (norte - lat) * escala];
}

const xml = (texto: string) =>
  texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const n = (valor: number) => Math.round(valor);

type Etiquetas = Copy["map"]["previewLabels"];

// Rótulo centrado en [x, y], desplazado lo justo para no salirse del recorte.
function rotulo(
  [x0, y]: Punto,
  lineas: string[],
  tamano: number,
  espaciado: number,
  [rx, , rw]: readonly number[],
) {
  const largo = Math.max(...lineas.map((l) => l.length));
  const medio = (largo * (tamano * 0.72 + espaciado)) / 2 + 16;
  const x = n(Math.min(Math.max(x0, rx + medio), rx + rw - medio));
  return lineas
    .map(
      (linea, i) =>
        `<text x="${x}" y="${n(y + i * tamano * 1.25)}" font-size="${n(tamano)}" letter-spacing="${espaciado}">${xml(linea.toLocaleUpperCase("es"))}</text>`,
    )
    .join("");
}

export function mapaIlustradoSvg(
  fincas: Omit<Finca, "productor">[],
  etiquetas: Etiquetas,
  variante: Variante = "escritorio",
): string {
  const { recorte, factor, rotulos, mar, sierra } = VARIANTES[variante];
  const [rx, ry, rw, rh] = recorte;
  const { hoja, hojaClaro, carbon, crema } = COLORES;
  const capa = (paths: string[], atributos: string) =>
    `<g ${atributos}>${paths.map((d) => `<path d="${d}"/>`).join("")}</g>`;

  // Tamaños de marcadores y nombres según la variante, para que se lean al reducirse.
  const radio = n(11 * factor);
  const borde = n(4 * factor);
  const letra = n(17 * factor);

  const municipios = new Set<string>();
  const marcadores = fincas.map((finca) => {
    const [x, y] = proyectar(finca.lng, finca.lat).map(n);
    const figura =
      finca.tipo === "acopio"
        ? `<rect x="${x - radio}" y="${y - radio}" width="${2 * radio}" height="${2 * radio}" rx="${n(radio / 3)}" fill="${carbon}" stroke="${crema}" stroke-width="${borde}"/>`
        : `<circle cx="${x}" cy="${y}" r="${radio}" fill="${hoja}" stroke="${crema}" stroke-width="${borde}"/>`;
    // Un nombre por municipio, a la derecha del primer marcador.
    let nombre = "";
    if (!municipios.has(finca.municipio)) {
      municipios.add(finca.municipio);
      nombre = `<text x="${x + radio + borde + 4}" y="${n(y + letra * 0.35)}">${xml(finca.municipio)}</text>`;
    }
    return { figura, nombre };
  });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${rx} ${ry} ${rw} ${rh}" width="${rw}" height="${rh}">`,
    `<defs>`,
    `<pattern id="olas" width="28" height="14" patternUnits="userSpaceOnUse"><path d="M0 7q7-5 14 0t14 0" fill="none" stroke="${hoja}" stroke-opacity=".1" stroke-width="1.5"/></pattern>`,
    `<radialGradient id="sierra" gradientUnits="userSpaceOnUse" cx="1090" cy="430" r="520"><stop offset="0" stop-color="${hoja}" stop-opacity=".14"/><stop offset="1" stop-color="${hoja}" stop-opacity="0"/></radialGradient>`,
    `</defs>`,
    // Mar
    `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="${hojaClaro}"/>`,
    `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="url(#olas)"/>`,
    // Tierra, sombra de la Sierra, aguas interiores, ríos, vías y relieve
    capa(
      base.tierra,
      `fill="${crema}" stroke="${hoja}" stroke-opacity=".35" stroke-width="1.5"`,
    ),
    `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="url(#sierra)"/>`,
    capa(
      base.agua,
      `fill="${hojaClaro}" stroke="${hoja}" stroke-opacity=".3" stroke-width="1"`,
    ),
    capa(
      base.rios,
      `fill="none" stroke="${hoja}" stroke-opacity=".35" stroke-width="1.6" stroke-linecap="round"`,
    ),
    capa(
      base.vias,
      `fill="none" stroke="${carbon}" stroke-opacity=".14" stroke-width="2" stroke-linecap="round"`,
    ),
    `<path d="${base.relieve}" fill="none" stroke="${hoja}" stroke-opacity=".32" stroke-width="1.6" stroke-linejoin="round"/>`,
    // Nombres geográficos
    `<g font-family="Georgia, serif" font-style="italic" fill="${hoja}" fill-opacity=".75" text-anchor="middle">`,
    rotulo(mar, etiquetas.sea, 30 * rotulos, 6, recorte),
    rotulo(
      punto(base.etiquetas.cienaga),
      etiquetas.lagoon,
      18 * rotulos,
      1,
      recorte,
    ),
    rotulo(sierra, etiquetas.sierra, 20 * rotulos, 3, recorte),
    `</g>`,
    // Marcadores y municipios (con halo crema para leerse sobre las líneas)
    marcadores.map((m) => m.figura).join(""),
    `<g font-family="system-ui, sans-serif" font-size="${letra}" font-weight="600" fill="${carbon}" stroke="${crema}" stroke-width="${borde}" paint-order="stroke">`,
    marcadores.map((m) => m.nombre).join(""),
    `</g>`,
    `</svg>`,
  ].join("");
}
