import { describe, expect, it } from "vitest";
import { recursosIniciales } from "../../../scripts/budget-recursos.mjs";

describe("recursos de carga inicial del presupuesto (T-83)", () => {
  it("cuenta JS, CSS y fuentes precargadas, sin repetir", () => {
    const html = `<link rel="preload" href="/_next/static/media/inter.woff2" as="font"/>
      <link rel="stylesheet" href="/_next/static/chunks/a.css"/>
      <script src="/_next/static/chunks/b.js" async=""></script>
      <script src="/_next/static/chunks/b.js" async=""></script>`;
    expect(recursosIniciales(html)).toEqual([
      "/_next/static/media/inter.woff2",
      "/_next/static/chunks/a.css",
      "/_next/static/chunks/b.js",
    ]);
  });

  it("excluye los <script noModule>, que los navegadores actuales no descargan", () => {
    const html = `<script src="/_next/static/chunks/polyfill.js" noModule=""></script>
      <script nomodule src="/_next/static/chunks/otro.js"></script>
      <script src="/_next/static/chunks/app.js" async=""></script>`;
    expect(recursosIniciales(html)).toEqual(["/_next/static/chunks/app.js"]);
  });

  it("conserva el prefijo de la demo fuera de la ruta medida", () => {
    const html = `<script src="/green-banana-web/_next/static/chunks/app.js" async=""></script>`;
    expect(recursosIniciales(html)).toEqual(["/_next/static/chunks/app.js"]);
  });
});
