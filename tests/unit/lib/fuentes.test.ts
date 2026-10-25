import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { brotliDecompressSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { fueraDeInter, INTER_UNICODES } from "@/lib/fuentes";

describe("recorte de Inter (T-82)", () => {
  it("cubre el español: tildes, ñ, ü, signos de apertura y comillas", () => {
    expect(fueraDeInter("¿Cómo? ¡Ñandú, pingüino! «Sí» – “ok”… © ·")).toEqual(
      [],
    );
  });

  it("detecta caracteres fuera del recorte, sin repetir", () => {
    expect(fueraDeInter("Precio en € y €, flecha →")).toEqual(["€", "→"]);
  });

  it("ignora saltos de línea y tabulaciones", () => {
    expect(fueraDeInter("línea\n\totra")).toEqual([]);
  });

  it("los rangos están ordenados y no se solapan", () => {
    for (let i = 1; i < INTER_UNICODES.length; i++) {
      expect(INTER_UNICODES[i][0]).toBeGreaterThan(INTER_UNICODES[i - 1][1]);
    }
  });

  // Todo texto visible sale de src/content/: si aparece un carácter nuevo, hay que
  // regenerar el recorte (procedimiento en doc/bitacora.md, T-82) y ampliar los rangos.
  // Datos comunes y los catálogos de los dos idiomas (T-95, D-16).
  const contenido = readdirSync("src/content", { recursive: true })
    .map(String)
    .filter((f) => f.endsWith(".json"));
  it.each(contenido)("src/content/%s solo usa caracteres del recorte", (f) => {
    expect(fueraDeInter(readFileSync(join("src/content", f), "utf8"))).toEqual(
      [],
    );
  });
});

// T-112 (F-12): Fraunces y Inter autoalojadas. Se lee la tabla cmap de cada .woff2 (sin
// dependencias: WOFF2 comprime las tablas con Brotli, que trae node:zlib, y la cmap nunca
// se transforma) y se comprueba que la fuente tenga de verdad cada carácter del contenido.
function leerBase128(datos: Buffer, inicio: number): [number, number] {
  let valor = 0;
  for (let i = 0; i < 5; i++) {
    const byte = datos[inicio + i];
    valor = valor * 128 + (byte & 0x7f);
    if (!(byte & 0x80)) return [valor, inicio + i + 1];
  }
  throw new Error("UIntBase128 inválido");
}

/** Puntos de código que la fuente WOFF2 tiene en su cmap (subtablas de formato 4 y 12). */
function cmapWoff2(archivo: string): Set<number> {
  const datos = readFileSync(archivo);
  expect(datos.toString("latin1", 0, 4)).toBe("wOF2");
  const numTablas = datos.readUInt16BE(12);
  const comprimido = datos.readUInt32BE(20);
  // Etiquetas conocidas de WOFF2: cmap es la 0; glyf (10) y loca (11) se transforman con la
  // versión 0; las demás, con cualquier versión distinta de 0 (p. ej. hmtx).
  const GLYF = 10,
    LOCA = 11;
  let pos = 48;
  const tablas: { indice: number; largo: number }[] = [];
  for (let t = 0; t < numTablas; t++) {
    const flags = datos[pos++];
    const indice = flags & 0x3f;
    const version = flags >> 6;
    if (indice === 63) pos += 4;
    let largo: number;
    [largo, pos] = leerBase128(datos, pos);
    const transformada =
      indice === GLYF || indice === LOCA ? version === 0 : version !== 0;
    if (transformada) [largo, pos] = leerBase128(datos, pos);
    tablas.push({ indice, largo });
  }
  const flujo = brotliDecompressSync(datos.subarray(pos, pos + comprimido));
  let desde = 0;
  let cmap: Buffer | undefined;
  for (const { indice, largo } of tablas) {
    if (indice === 0) cmap = flujo.subarray(desde, desde + largo);
    desde += largo;
  }
  if (!cmap) throw new Error(`${archivo} no tiene cmap`);
  const codigos = new Set<number>();
  const subtablas = cmap.readUInt16BE(2);
  for (let i = 0; i < subtablas; i++) {
    const offset = cmap.readUInt32BE(4 + i * 8 + 4);
    const formato = cmap.readUInt16BE(offset);
    if (formato === 4) {
      const segmentos = cmap.readUInt16BE(offset + 6) / 2;
      const fines = offset + 14;
      const inicios = fines + segmentos * 2 + 2;
      for (let s = 0; s < segmentos; s++) {
        const fin = cmap.readUInt16BE(fines + s * 2);
        const ini = cmap.readUInt16BE(inicios + s * 2);
        for (let c = ini; c <= fin && c !== 0xffff; c++) codigos.add(c);
      }
    } else if (formato === 12) {
      const grupos = cmap.readUInt32BE(offset + 12);
      for (let g = 0; g < grupos; g++) {
        const base = offset + 16 + g * 12;
        const ini = cmap.readUInt32BE(base);
        const fin = cmap.readUInt32BE(base + 4);
        for (let c = ini; c <= fin; c++) codigos.add(c);
      }
    }
  }
  return codigos;
}

describe("fuentes autoalojadas (T-112, F-12)", () => {
  // Si se regenera un archivo, se actualizan su SHA-256 aquí y en doc/creditos.md, y el
  // procedimiento de doc/bitacora.md.
  const FUENTES = {
    "fraunces-es.woff2":
      "24cadecb2f85ed979e4996f11c188716e73d34be3c878095403c8a70791d3d5b",
    "inter-es.woff2":
      "292426673183cbdefaa2081737f8c649f0694195e7b4e4eadf2fb4430562c45d",
  };
  const caracteresDelContenido = new Set(
    readdirSync("src/content", { recursive: true })
      .map(String)
      .filter((f) => f.endsWith(".json"))
      .flatMap((f) =>
        [...readFileSync(join("src/content", f), "utf8")]
          .map((c) => c.codePointAt(0) ?? 0)
          .filter((c) => c >= 0x20),
      ),
  );

  for (const [archivo, hash] of Object.entries(FUENTES)) {
    const ruta = join("src/app/fonts", archivo);

    it(`${archivo} es el archivo registrado (SHA-256)`, () => {
      expect(
        createHash("sha256").update(readFileSync(ruta)).digest("hex"),
      ).toBe(hash);
    });

    it(`${archivo} tiene todos los rangos de INTER_UNICODES y cada carácter del contenido ES/EN`, () => {
      const cmap = cmapWoff2(ruta);
      const faltan: string[] = [];
      // U+00AD (guion suave) es invisible e ignorable al dibujar: Inter no lo trae en su
      // cmap aunque esté en el rango; no se exige (tampoco se usa en el contenido).
      for (const [min, max] of INTER_UNICODES)
        for (let c = min; c <= max; c++)
          if (c !== 0xad && !cmap.has(c)) faltan.push(c.toString(16));
      for (const c of caracteresDelContenido)
        if (!cmap.has(c)) faltan.push(c.toString(16));
      expect(faltan).toEqual([]);
    });
  }

  it("el lector de cmap detecta un carácter que falta", () => {
    expect(cmapWoff2("src/app/fonts/fraunces-es.woff2").has(0x20ac)).toBe(
      false,
    );
  });
});
