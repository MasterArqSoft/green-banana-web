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
    expect(formatWeight(grams)).toBe(expected);
  });
});

describe("formatWeight con cifra pendiente", () => {
  it("pone la cifra entre corchetes y deja la unidad afuera", () => {
    expect(formatWeight(220, true)).toBe("[220] g");
    expect(formatWeight([18000, 20000], true)).toBe("[18–20] kg");
  });
});

describe("formatDate", () => {
  it("escribe la fecha en español de Colombia sin correrla de día", () => {
    expect(formatDate("2026-10-15")).toBe("15 de octubre de 2026");
    expect(formatDate("2026-01-01")).toBe("1 de enero de 2026");
  });
});

describe("formatList", () => {
  it("une los elementos con comas e «y»", () => {
    expect(formatList(["Santa Marta"])).toBe("Santa Marta");
    expect(formatList(["A", "B", "C"])).toBe("A, B y C");
  });
});
