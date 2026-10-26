import { describe, expect, it } from "vitest";
import {
  acercar,
  amplitud,
  DPR_MAX,
  entrada,
  ESCALA,
  esRenderizadorSoftware,
  FOCO,
  INTENSIDAD,
  objetivoArrastre,
  objetivoCursor,
  PIXELES_MAX,
  posicionObjeto,
  tamanoLienzo,
  tamanoTextura,
  ventanaCover,
} from "@/lib/parallax";

describe("suavizado por tiempo", () => {
  const recorrer = (hz: number, segundos: number) => {
    let v = 1;
    for (let i = 0; i < hz * segundos; i++) v = acercar(v, 0, 1 / hz, 0.2);
    return v;
  };

  it("el mismo recorrido a 30, 60 y 120 Hz", () => {
    expect(recorrer(30, 0.5)).toBeCloseTo(recorrer(60, 0.5), 10);
    expect(recorrer(120, 0.5)).toBeCloseTo(recorrer(60, 0.5), 10);
  });

  it("se acerca sin pasarse y sin tiempo no cambia", () => {
    expect(acercar(1, 0, 0.1, 0.2)).toBeGreaterThan(0);
    expect(acercar(1, 0, 0.1, 0.2)).toBeLessThan(1);
    expect(acercar(1, 0, 0, 0.2)).toBe(1);
  });

  it("al activarse, el movimiento entra de forma gradual (sin salto si el cursor ya estaba)", () => {
    expect(entrada(0)).toBe(0);
    expect(entrada(0.1)).toBeLessThan(0.2);
    expect(entrada(10)).toBe(1);
  });
});

describe("gestos normalizados al contenedor", () => {
  const rect = { left: 100, top: 50, width: 400, height: 200 };

  it("cursor: centro en reposo, bordes en ±1 y fuera del área limitado", () => {
    expect(objetivoCursor(300, 150, rect)).toEqual({ x: 0, y: 0 });
    expect(objetivoCursor(100, 50, rect)).toEqual({ x: -1, y: -1 });
    expect(objetivoCursor(500, 250, rect)).toEqual({ x: 1, y: 1 });
    expect(objetivoCursor(900, -400, rect)).toEqual({ x: 1, y: -1 });
    expect(objetivoCursor(1, 1, { ...rect, width: 0 })).toEqual({
      x: 0,
      y: 0,
    });
  });

  it("arrastre: medio ancho recorre todo el efecto, sin pasarse", () => {
    expect(objetivoArrastre(100, 400)).toBe(0.5);
    expect(objetivoArrastre(-1000, 400)).toBe(-1);
    expect(objetivoArrastre(50, 0)).toBe(0);
  });
});

describe("encuadre: el lienzo coincide con la foto", () => {
  it("lee object-position en porcentajes y, si no, usa el centro", () => {
    expect(posicionObjeto("50% 80%")).toEqual({ x: 0.5, y: 0.8 });
    expect(posicionObjeto("10px 20px")).toEqual({ x: 0.5, y: 0.5 });
  });

  it("equivale a object-fit: cover con object-position", () => {
    // Foto móvil 800×1000 en una caja cuadrada con el foco abajo (50% 80%).
    const v = ventanaCover(328, 328, 800, 1000, { x: 0.5, y: 0.8 });
    expect(v.x).toBe(0);
    expect(v.ancho).toBe(1);
    expect(v.alto).toBeCloseTo(0.8);
    expect(v.y).toBeCloseTo(0.16);
    // Misma proporción: la foto entera.
    expect(ventanaCover(544, 340, 1600, 1000)).toEqual({
      x: 0,
      y: 0,
      ancho: 1,
      alto: 1,
    });
  });

  // Cajas reales: móvil cuadrada y escritorio 16:10, cada una con su margen.
  const CAJAS = [
    { nombre: "móvil", ancho: 358, alto: 358, escala: ESCALA.movil },
    { nombre: "escritorio", ancho: 544, alto: 340, escala: ESCALA.escritorio },
  ];

  it.each(CAJAS)(
    "$nombre: en esquinas y extremos ningún punto sale de la ventana (sin bordes vacíos)",
    ({ ancho, alto, escala }) => {
      const max = amplitud(ancho, alto, escala);
      for (const sx of [-1, 0, 1])
        for (const sy of [-1, 0, 1])
          for (const uv of [0, 1])
            for (const h of [0, 1]) {
              const q = 0.5 + (uv - 0.5) / escala;
              for (const t of [
                q - ((sx * max.x) / escala) * (h - FOCO),
                q - ((sy * max.y) / escala) * (h - FOCO),
              ]) {
                expect(t).toBeGreaterThanOrEqual(-1e-9);
                expect(t).toBeLessThanOrEqual(1 + 1e-9);
              }
            }
    },
  );

  it("el vertical recorre los mismos píxeles que el horizontal en la caja cuadrada", () => {
    const max = amplitud(358, 358, ESCALA.movil);
    expect(max.y * 358).toBeCloseTo(max.x * 358);
    expect(max.x).toBeCloseTo(INTENSIDAD, 10);
  });

  it("en 16:10 el vertical llega al 75 % de los píxeles del horizontal (límite del margen)", () => {
    const max = amplitud(544, 340, ESCALA.escritorio);
    expect(max.x).toBeCloseTo(INTENSIDAD, 10);
    expect((max.y * 340) / (max.x * 544)).toBeCloseTo(0.75, 2);
  });

  it("textura con margen par: en reposo cada píxel cae en el centro de un texel", () => {
    for (const [w, h, e] of [
      [544, 340, ESCALA.escritorio],
      [1074, 1074, ESCALA.movil],
      [656, 656, ESCALA.movil],
      [1, 1, ESCALA.movil],
    ]) {
      const t = tamanoTextura(w, h, e);
      expect((t.ancho - w) % 2).toBe(0);
      expect((t.alto - h) % 2).toBe(0);
      expect(t.ancho / w).toBeCloseTo(e, 1);
    }
  });
});

describe("tamaño del lienzo", () => {
  it("sigue la densidad de la pantalla hasta DPR_MAX (a DPR 3 ya no se amplía)", () => {
    expect(tamanoLienzo(358, 358, 3)).toEqual({ ancho: 1074, alto: 1074 });
    expect(tamanoLienzo(400, 500, 4)).toEqual({
      ancho: 400 * DPR_MAX,
      alto: 500 * DPR_MAX,
    });
  });

  it("no pasa del total de píxeles", () => {
    const { ancho, alto } = tamanoLienzo(1800, 1125, 2);
    expect(ancho * alto).toBeLessThanOrEqual(PIXELES_MAX * 1.01);
  });

  it("sin tamaño, lienzo vacío", () => {
    expect(tamanoLienzo(0, 100, 1)).toEqual({ ancho: 0, alto: 0 });
  });
});

describe("sin GPU se queda la foto", () => {
  it.each([
    "ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)",
    "llvmpipe (LLVM 15.0.7, 256 bits)",
    "ANGLE (Microsoft, Microsoft Basic Render Driver Direct3D11)",
  ])("software: %s", (nombre) => {
    expect(esRenderizadorSoftware(nombre)).toBe(true);
  });

  it.each([
    "ANGLE (Intel, Intel(R) HD Graphics 630 (0x00005912) Direct3D11 vs_5_0 ps_5_0, D3D11)",
    "Apple GPU",
    "Adreno (TM) 640",
    "Mali-G78",
  ])("GPU: %s", (nombre) => {
    expect(esRenderizadorSoftware(nombre)).toBe(false);
  });
});
