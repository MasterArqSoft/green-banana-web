// Íconos para navegadores y móviles (SEO-05, T-63), generados desde el ícono propio
// src/app/icon.svg. Next.js publica los archivos de src/app/ con su <link> correspondiente.
// - favicon.ico: 16, 32 y 48 px, para navegadores y lectores de feeds que no usan SVG.
// - apple-icon.png: 180 px, para la pantalla de inicio de iOS. iOS redondea las esquinas
//   por su cuenta y pinta de negro lo transparente, así que el fondo se rellena entero.
// Se ejecuta a mano (npm run icons) solo si cambia icon.svg; los archivos van en Git.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const app = join(process.cwd(), "src", "app");
const svg = readFileSync(join(app, "icon.svg"));
// Verde hoja, el fondo del ícono: se lee del token de globals.css para no copiarlo.
const HOJA = readFileSync(join(app, "globals.css"), "utf8").match(
  /--color-hoja:\s*(#[0-9a-f]{6})/i,
)?.[1];
if (!HOJA) throw new Error("No se encontró --color-hoja en globals.css");

const png = (size, options = {}) => {
  let image = sharp(svg, { density: 72 * (size / 32) }).resize(size, size);
  if (options.flatten) image = image.flatten({ background: HOJA });
  return image.png({ compressionLevel: 9 }).toBuffer();
};

// ICO con imágenes PNG adentro (formato válido desde Windows Vista y en todos los
// navegadores actuales): cabecera de 6 bytes, una entrada de 16 por imagen y los PNG.
const ico = (images) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2); // tipo: ícono
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0); // ancho
    entry.writeUInt8(size, 1); // alto
    entry.writeUInt16LE(1, 4); // planos
    entry.writeUInt16LE(32, 6); // bits por píxel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map(({ data }) => data)]);
};

const sizes = [16, 32, 48];
const images = await Promise.all(
  sizes.map(async (size) => ({ size, data: await png(size) })),
);
writeFileSync(join(app, "favicon.ico"), ico(images));
writeFileSync(join(app, "apple-icon.png"), await png(180, { flatten: true }));
console.log("Íconos generados en src/app/: favicon.ico y apple-icon.png");
