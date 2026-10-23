import { describe, expect, it } from "vitest";
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
