import { describe, expect, it } from "vitest";
import { claveTesela, saludVista, type EstadoTesela } from "@/lib/salud-mapa";

const TAM = { x: 256, y: 256 };
// Vista de 512 × 256 px desde (256, 256): teselas x 1-2, y 1, zoom 9.
const VISTA = { min: { x: 256, y: 256 }, max: { x: 768, y: 512 } };
const registro = (entradas: [number, number, number, EstadoTesela][]) =>
  new Map(entradas.map(([z, x, y, e]) => [claveTesela({ x, y, z }), e]));

describe("salud de la vista del mapa (T-79)", () => {
  it("todas las teselas de la vista cargadas: ok", () => {
    const t = registro([
      [9, 1, 1, "ok"],
      [9, 2, 1, "ok"],
    ]);
    expect(saludVista(t, 9, VISTA, TAM)).toBe("ok");
  });

  it("alguna fallida o pendiente con otras válidas: parcial", () => {
    expect(
      saludVista(
        registro([
          [9, 1, 1, "ok"],
          [9, 2, 1, "error"],
        ]),
        9,
        VISTA,
        TAM,
      ),
    ).toBe("parcial");
    expect(
      saludVista(
        registro([
          [9, 1, 1, "ok"],
          [9, 2, 1, "pendiente"],
        ]),
        9,
        VISTA,
        TAM,
      ),
    ).toBe("parcial");
  });

  it("ninguna válida en la vista: sin mapa, aunque haya válidas fuera de ella (MAP-02)", () => {
    const t = registro([
      [9, 0, 1, "ok"], // a la izquierda, fuera de la vista (búfer de Leaflet)
      [9, 1, 1, "error"],
      [9, 2, 1, "error"],
      [8, 1, 0, "ok"], // otro zoom
    ]);
    expect(saludVista(t, 9, VISTA, TAM)).toBe("sin-mapa");
  });

  it("los bordes exactos de la vista no incluyen la tesela siguiente", () => {
    // max.x = 768 es el borde derecho de la tesela 2: la 3 queda fuera.
    const t = registro([
      [9, 1, 1, "ok"],
      [9, 2, 1, "ok"],
      [9, 3, 1, "error"],
    ]);
    expect(saludVista(t, 9, VISTA, TAM)).toBe("ok");
  });

  it("sin teselas en la vista o sin límites: vacía", () => {
    expect(saludVista(new Map(), 9, VISTA, TAM)).toBe("vacia");
    expect(saludVista(registro([[9, 1, 1, "error"]]), 9, {}, TAM)).toBe(
      "vacia",
    );
  });
});
