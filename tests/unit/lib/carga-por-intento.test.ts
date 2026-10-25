import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  conPlazo,
  crearIntentos,
  ESPERA_MAPA_MS,
  PlazoVencido,
} from "@/lib/carga-por-intento";

// T-105 (F-03, DR-02): plazo de la descarga del mapa e intentos.
describe("conPlazo", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("resuelve si la promesa llega antes del plazo", async () => {
    const resultado = conPlazo(Promise.resolve("ok"), ESPERA_MAPA_MS);
    await expect(resultado).resolves.toBe("ok");
  });

  it("propaga el rechazo de la promesa", async () => {
    const resultado = conPlazo(Promise.reject(new Error("red")), 1000);
    await expect(resultado).rejects.toThrow("red");
  });

  it("rechaza con PlazoVencido si la promesa sigue pendiente al vencer", async () => {
    const resultado = conPlazo(new Promise(() => {}), ESPERA_MAPA_MS);
    vi.advanceTimersByTime(ESPERA_MAPA_MS);
    await expect(resultado).rejects.toBeInstanceOf(PlazoVencido);
  });

  it("no vence antes de tiempo y limpia el temporizador al resolver", async () => {
    let resolver!: (valor: number) => void;
    const resultado = conPlazo(
      new Promise<number>((r) => (resolver = r)),
      ESPERA_MAPA_MS,
    );
    vi.advanceTimersByTime(ESPERA_MAPA_MS - 1);
    resolver(7);
    await expect(resultado).resolves.toBe(7);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("una llegada tardía no cambia el rechazo", async () => {
    let resolver!: (valor: string) => void;
    const resultado = conPlazo(
      new Promise<string>((r) => (resolver = r)),
      1000,
    );
    vi.advanceTimersByTime(1000);
    resolver("tarde");
    await expect(resultado).rejects.toBeInstanceOf(PlazoVencido);
  });

  it("usa 15 s, el mismo plazo que las teselas", () => {
    expect(ESPERA_MAPA_MS).toBe(15_000);
  });
});

describe("crearIntentos", () => {
  it("solo el último intento está vigente", () => {
    const intentos = crearIntentos();
    const primero = intentos.nuevo();
    expect(intentos.vigente(primero)).toBe(true);
    const segundo = intentos.nuevo();
    expect(intentos.vigente(primero)).toBe(false);
    expect(intentos.vigente(segundo)).toBe(true);
  });

  it("invalidar() deja sin vigencia el intento en curso", () => {
    const intentos = crearIntentos();
    const id = intentos.nuevo();
    intentos.invalidar();
    expect(intentos.vigente(id)).toBe(false);
    expect(intentos.vigente(intentos.nuevo())).toBe(true);
  });

  it("cada contador es independiente", () => {
    const a = crearIntentos();
    const b = crearIntentos();
    a.nuevo();
    a.nuevo();
    expect(b.vigente(b.nuevo())).toBe(true);
  });
});
