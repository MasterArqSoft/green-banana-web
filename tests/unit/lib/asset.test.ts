import { afterEach, describe, expect, it, vi } from "vitest";
import { assetPath, imageSrc } from "@/lib/asset";
import { IMAGES } from "@/lib/images";

describe("assetPath", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("agrega el prefijo de la demo en GitHub Pages", () => {
    vi.stubEnv("PAGES_BASE_PATH", "/green-banana-web");
    expect(assetPath("/images/a.webp")).toBe("/green-banana-web/images/a.webp");
  });

  it("deja la ruta igual en local", () => {
    vi.stubEnv("PAGES_BASE_PATH", undefined);
    expect(assetPath("/images/a.webp")).toBe("/images/a.webp");
  });
});

describe("imageSrc", () => {
  it("arma la ruta de la foto principal y de sus versiones menores", () => {
    const spec = IMAGES.products.unit;
    expect(imageSrc(spec, "avif")).toBe(`/images/${spec.output}.avif`);
    expect(imageSrc(spec, "webp", 200)).toBe(`/images/${spec.output}-200.webp`);
  });
});
