import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  applyCsp,
  cspPolicy,
  inlineScriptHashes,
  TILE_ORIGIN,
} from "@/lib/csp";

const sha = (body: string) =>
  `'sha256-${createHash("sha256").update(body).digest("base64")}'`;

const html = [
  '<!DOCTYPE html><html><head><meta charSet="utf-8"/>',
  '<script src="/_next/static/chunks/a.js" async=""></script>',
  "<script>self.__next_f.push([1])</script>",
  '<script id="_R_">self.__next_f.push([2])</script>',
  "<script>self.__next_f.push([1])</script>",
  '<script type="application/ld+json">{"@type":"FAQPage"}</script>',
  "</head><body></body></html>",
].join("");

describe("CSP por <meta> (SEC-01, T-66)", () => {
  it("calcula un hash por cada script en línea ejecutable, sin repetir", () => {
    expect(inlineScriptHashes(html)).toEqual([
      sha("self.__next_f.push([1])"),
      sha("self.__next_f.push([2])"),
    ]);
  });

  it("no calcula hash de los scripts externos ni del JSON-LD", () => {
    const hashes = inlineScriptHashes(html);
    expect(hashes).not.toContain(sha('{"@type":"FAQPage"}'));
    expect(hashes).toHaveLength(2);
  });

  it("la política no permite scripts en línea sin hash ni eval", () => {
    const policy = cspPolicy(["'sha256-abc'"]);
    expect(policy).toContain("script-src 'self' 'sha256-abc'");
    expect(policy).not.toMatch(/script-src[^;]*'unsafe-(inline|eval)'/);
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("base-uri 'none'");
    expect(policy).toContain(`img-src 'self' data: ${TILE_ORIGIN}`);
  });

  it("no usa directivas que por <meta> se ignoran o rompen las pruebas locales", () => {
    const policy = cspPolicy([]);
    expect(policy).not.toContain("frame-ancestors");
    expect(policy).not.toContain("upgrade-insecure-requests");
  });

  it("inserta la <meta> después del charset y antes del primer script", () => {
    const result = applyCsp(html);
    const meta = result.indexOf('http-equiv="Content-Security-Policy"');
    expect(meta).toBeGreaterThan(result.indexOf("charSet"));
    expect(meta).toBeLessThan(result.indexOf("<script"));
  });

  it("un script en línea con data-src también lleva hash", () => {
    const body = "console.log(1)";
    expect(inlineScriptHashes(`<script data-src="x">${body}</script>`)).toEqual(
      [sha(body)],
    );
  });

  it("falla si hay un script antes del charset, que quedaría sin CSP", () => {
    expect(() =>
      applyCsp('<head><script>x()</script><meta charSet="utf-8"/></head>'),
    ).toThrow("antes de la CSP");
  });

  it("TILE_ORIGIN coincide con las teselas del componente del mapa", () => {
    const fuente = readFileSync(
      "src/components/cliente/MapaFincasInteractivo.tsx",
      "utf8",
    );
    const tiles = fuente.match(/const TILES = "([^"]+)"/)?.[1];
    expect(tiles?.startsWith(`${TILE_ORIGIN}/`)).toBe(true);
  });

  it("falla si la página ya tiene CSP o no tiene charset", () => {
    expect(() => applyCsp(applyCsp(html))).toThrow();
    expect(() => applyCsp("<html><head></head></html>")).toThrow();
  });
});
