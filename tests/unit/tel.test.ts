import { describe, expect, it } from "vitest";
import { formatPhone, telHref } from "@/lib/tel";

describe("telHref", () => {
  it("arma el enlace tel: con el número E.164", () => {
    expect(telHref("+573001234567")).toBe("tel:+573001234567");
  });

  it.each([
    ["sin indicativo", "3001234567"],
    ["con espacios", "+57 300 123 4567"],
    ["con 9 dígitos", "+57300123456"],
    ["con 11 dígitos", "+5730012345678"],
    ["de otro país", "+13001234567"],
    ["vacío", ""],
  ])("rechaza un número %s", (_, phone) => {
    expect(() => telHref(phone)).toThrow("se espera +57 y 10 dígitos");
  });
});

describe("formatPhone", () => {
  it("separa el número en grupos legibles", () => {
    expect(formatPhone("+573001234567")).toBe("+57 300 123 4567");
  });

  it("rechaza un número inválido", () => {
    expect(() => formatPhone("3001234567")).toThrow();
  });
});
