import { describe, expect, it } from "vitest";
import copyJson from "@/content/copy.json";
import { copySchema } from "@/lib/schema";
import { fill } from "@/lib/template";

describe("fill", () => {
  it("reemplaza los marcadores por sus valores", () => {
    expect(fill("Acopio en {ciudad}", { ciudad: "Santa Marta" })).toBe(
      "Acopio en Santa Marta",
    );
  });

  it("deja igual un texto sin marcadores", () => {
    expect(fill("Llamar", {})).toBe("Llamar");
  });

  it("falla si falta un valor", () => {
    expect(() => fill("Llámanos: {telefono}", {})).toThrow("{telefono}");
  });
});

describe("esquema de copy.json", () => {
  it("rechaza un texto al que le falta su marcador", () => {
    const copy = structuredClone(copyJson);
    copy.topBar.acopio = "Acopio en Santa Marta";
    expect(copySchema.safeParse(copy).success).toBe(false);
  });

  it("rechaza una sección no prevista", () => {
    const copy = { ...structuredClone(copyJson), hero: { title: "Hola" } };
    expect(copySchema.safeParse(copy).success).toBe(false);
  });
});
