import { describe, expect, it } from "vitest";
import { site } from "@/lib/content";
import { SECURITY_TXT_PATH, securityTxt } from "@/lib/security-txt";

describe("security.txt (SEC-07, T-67, RFC 9116)", () => {
  const now = new Date("2026-10-24T12:00:00.000Z");
  const lines = securityTxt(site, now).trimEnd().split("\n");

  it("tiene los campos obligatorios Contact y Expires", () => {
    expect(lines).toContain(`Contact: mailto:${site.legal.correo}`);
    expect(lines).toContain("Expires: 2027-04-22T12:00:00.000Z");
  });

  it("vence a menos de un año, como recomienda el RFC", () => {
    const expires = new Date(
      lines.find((line) => line.startsWith("Expires: "))!.slice(9),
    );
    const dias = (expires.getTime() - now.getTime()) / 86_400_000;
    expect(dias).toBeGreaterThan(0);
    expect(dias).toBeLessThan(365);
  });

  it("declara idioma y URL canónica desde site.url", () => {
    expect(lines).toContain("Preferred-Languages: es");
    expect(lines).toContain(`Canonical: ${site.url}${SECURITY_TXT_PATH}`);
  });
});
