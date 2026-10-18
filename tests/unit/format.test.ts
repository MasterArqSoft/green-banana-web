import { describe, expect, it } from "vitest";
import { formatWeight } from "@/lib/format";

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
