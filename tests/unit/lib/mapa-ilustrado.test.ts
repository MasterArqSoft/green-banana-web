import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getContent } from "@/lib/content";
import {
  COLORES,
  mapaIlustradoSvg,
  medidasMapa,
  proyectar,
} from "@/lib/mapa-ilustrado";

const { copy, fincas } = getContent("es-CO");

describe("mapa ilustrado (fondo antes de «Ver mapa», FR-24)", () => {
  const escritorio = mapaIlustradoSvg(fincas.fincas, copy.map.previewLabels);
  const movil = mapaIlustradoSvg(
    fincas.fincas,
    copy.map.previewLabels,
    "movil",
  );

  it("usa los mismos colores que los tokens de globals.css", () => {
    const css = readFileSync(
      join(process.cwd(), "src/app/globals.css"),
      "utf8",
    );
    const token = (nombre: string) =>
      css.match(new RegExp(`--color-${nombre}:\\s*(#[0-9a-f]{6})`, "i"))?.[1];
    expect(COLORES).toEqual({
      hoja: token("hoja"),
      hojaClaro: token("hoja-claro"),
      carbon: token("carbon"),
      crema: token("crema"),
    });
  });

  it("dibuja un marcador por ubicación de fincas.json, en su posición", () => {
    const fincasCount = fincas.fincas.filter((f) => f.tipo === "finca").length;
    for (const svg of [escritorio, movil]) {
      expect(svg.match(/<circle /g)).toHaveLength(fincasCount);
      expect(svg.match(/<rect [^>]*rx=/g)).toHaveLength(1);
    }
    const a = fincas.fincas.find((f) => f.id === "finca-a")!;
    const [x, y] = proyectar(a.lng, a.lat).map(Math.round);
    expect(escritorio).toContain(`cx="${x}" cy="${y}"`);
  });

  it("toma los nombres de copy.json y de los municipios", () => {
    expect(escritorio).toContain(
      copy.map.previewLabels.sea[0].toLocaleUpperCase("es"),
    );
    for (const finca of fincas.fincas) {
      expect(escritorio).toContain(`>${finca.municipio}</text>`);
    }
  });

  it("no enlaza ni carga nada de terceros (AC-19)", () => {
    const urls = escritorio.match(/https?:\/\/[^"]+/g) ?? [];
    expect(urls).toEqual(["http://www.w3.org/2000/svg"]);
    expect(escritorio).not.toMatch(/<image|<script|href=/);
  });

  it("escapa el texto del contenido", () => {
    const svg = mapaIlustradoSvg(
      [{ ...fincas.fincas[0], municipio: "A & <B>" }],
      copy.map.previewLabels,
    );
    expect(svg).toContain("A &amp; &lt;B&gt;");
    expect(svg).not.toContain("<B>");
  });

  it("la variante móvil recorta el encuadre a la zona de las fincas", () => {
    expect(movil).toMatch(/viewBox="330 60 820 850"/);
    expect(escritorio).toMatch(/viewBox="0 0 \d+ \d+"/);
    // El <img> de la vista previa usa estas medidas: deben ser las del SVG (CLS 0).
    for (const [svg, variante] of [
      [escritorio, "escritorio"],
      [movil, "movil"],
    ] as const) {
      const { ancho, alto } = medidasMapa(variante);
      expect(svg).toContain(`width="${ancho}" height="${alto}"`);
    }
  });
});

describe("mapa ilustrado en inglés (T-95, AC-27)", () => {
  const en = getContent("en");
  const svg = mapaIlustradoSvg(en.fincas.fincas, en.copy.map.previewLabels);

  it("traduce el rótulo del mar y conserva los nombres geográficos y las posiciones", () => {
    expect(svg).toContain(">CARIBBEAN SEA</text>");
    expect(svg).not.toContain("MAR CARIBE");
    expect(svg).toContain(">SIERRA NEVADA</text>");
    for (const finca of en.fincas.fincas) {
      expect(svg).toContain(`>${finca.municipio}</text>`);
    }
    // Misma geometría y marcadores: solo cambian los rótulos.
    const sinTexto = (s: string) => s.replace(/<text[^>]*>[^<]*<\/text>/g, "");
    expect(sinTexto(svg)).toBe(
      sinTexto(mapaIlustradoSvg(fincas.fincas, copy.map.previewLabels)),
    );
  });
});
