import { describe, expect, it } from "vitest";
import { formatDate, formatList, formatWeight } from "@/lib/format";

describe("formatWeight", () => {
  it.each([
    [220, "220 g"],
    [1000, "1 kg"],
    [1500, "1,5 kg"],
    [3000, "3 kg"],
    [[18000, 20000] as [number, number], "18–20 kg"],
    [[200, 250] as [number, number], "200–250 g"],
  ])("%j → %s", (grams, expected) => {
    expect(formatWeight(grams, "es-CO")).toBe(expected);
  });

  it("en inglés usa punto decimal y las mismas unidades métricas (AC-26)", () => {
    expect(formatWeight(1500, "en")).toBe("1.5 kg");
    expect(formatWeight(220, "en")).toBe("220 g");
    expect(formatWeight([18000, 20000], "en")).toBe("18–20 kg");
  });
});

describe("formatWeight con cifra pendiente", () => {
  it("pone la cifra entre corchetes y deja la unidad afuera", () => {
    expect(formatWeight(220, "es-CO", true)).toBe("[220] g");
    expect(formatWeight([18000, 20000], "es-CO", true)).toBe("[18–20] kg");
    expect(formatWeight(220, "en", true)).toBe("[220] g");
  });
});

describe("formatDate", () => {
  it("escribe la fecha en español de Colombia sin correrla de día", () => {
    expect(formatDate("2026-10-15", "es-CO")).toBe("15 de octubre de 2026");
    expect(formatDate("2026-01-01", "es-CO")).toBe("1 de enero de 2026");
  });

  it("en inglés, el mismo día (UTC, AC-26)", () => {
    expect(formatDate("2026-10-15", "en")).toBe("October 15, 2026");
    expect(formatDate("2026-01-01", "en")).toBe("January 1, 2026");
  });
});

describe("formatList", () => {
  it("une los elementos con comas e «y»", () => {
    expect(formatList(["Santa Marta"], "es-CO")).toBe("Santa Marta");
    expect(formatList(["A", "B", "C"], "es-CO")).toBe("A, B y C");
  });

  it("en inglés une con «and»", () => {
    expect(formatList(["Santa Marta"], "en")).toBe("Santa Marta");
    expect(formatList(["A", "B", "C"], "en")).toBe("A, B, and C");
  });
});
