// Genera las fotos publicadas en public/images/ desde fotos-originales/ (T-04).
// Recorta a la proporción, redimensiona y baja la calidad hasta cumplir el peso máximo
// de cada imagen (src/lib/images.ts). Falla si alguna no cabe. Uso: npm run images
import { existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import sharp from "sharp";
import { allImages } from "../src/lib/images.ts";

const SOURCE_DIR = "fotos-originales";
const OUT_DIR = join("public", "images");
const QUALITIES = [80, 72, 64, 56, 48, 40];

const encoders = {
  avif: (img, quality) => img.avif({ quality: quality - 20, effort: 6 }),
  webp: (img, quality) => img.webp({ quality, effort: 6 }),
  jpg: (img, quality) => img.jpeg({ quality, mozjpeg: true }),
};

let failed = false;
for (const spec of allImages()) {
  const source = join(SOURCE_DIR, `${spec.source}.png`);
  if (!existsSync(source)) {
    console.log(`✗ Falta ${source}`);
    failed = true;
    continue;
  }
  // Tamaño principal y versiones menores para srcset (misma proporción).
  const sizes = [
    { suffix: "", width: spec.width, height: spec.height },
    ...(spec.variants ?? []).map((width) => ({
      suffix: `-${width}`,
      width,
      height: Math.round((width * spec.height) / spec.width),
    })),
  ];
  for (const { suffix, width, height } of sizes)
    for (const format of spec.formats) {
      const out = join(OUT_DIR, `${spec.output}${suffix}.${format}`);
      mkdirSync(dirname(out), { recursive: true });
      let size = Infinity;
      let usedQuality = 0;
      for (const quality of QUALITIES) {
        let img = sharp(source);
        if (spec.crop) img = img.extract(spec.crop);
        img = img.resize(width, height, {
          fit: "cover",
          position: "attention",
        });
        await encoders[format](img, quality).toFile(out);
        size = statSync(out).size / 1024;
        usedQuality = quality;
        if (size <= spec.maxKB) break;
      }
      const ok = size <= spec.maxKB;
      failed ||= !ok;
      console.log(
        `${ok ? "✓" : "✗"} ${out}: ${size.toFixed(1)} KB de ${spec.maxKB} (calidad ${usedQuality})`,
      );
    }
}
process.exit(failed ? 1 : 0);
