import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Testimonials } from "@/components/secciones/Testimonials";
import { assetPath } from "@/lib/asset";
import { testimonialsSchema, type Testimonial } from "@/lib/schema";

const sample = (name: string): Testimonial => ({
  name,
  context: "Barrio de ejemplo",
  text: "Texto de prueba.",
  photo: name,
  photoAlt: `Foto de ${name}`,
  authorized: true,
});

describe("Testimonials (FR-12)", () => {
  it("no se renderiza sin testimonios reales (AC-11)", () => {
    expect(renderToStaticMarkup(<Testimonials />)).toBe("");
  });

  it("muestra los testimonios cuando existen", () => {
    const items = ["ana", "luis", "rosa"].map(sample);
    const html = renderToStaticMarkup(<Testimonials items={items} />);
    expect(html.match(/<li/g)).toHaveLength(3);
    expect(html).toContain("Foto de ana");
  });

  it("las fotos pasan por images.ts: AVIF, WebP y carga diferida", () => {
    const html = renderToStaticMarkup(
      <Testimonials items={["ana", "luis", "rosa"].map(sample)} />,
    );
    expect(html).toContain("/images/testimonios/ana.avif");
    expect(html).toContain("/images/testimonios/ana.webp");
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('width="96"');
  });

  it("el esquema exige 0 o entre 3 y 5 testimonios autorizados", () => {
    expect(testimonialsSchema.safeParse([]).success).toBe(true);
    expect(testimonialsSchema.safeParse(["a", "b"].map(sample)).success).toBe(
      false,
    );
    const unauthorized = ["a", "b", "c"].map((name) => ({
      ...sample(name),
      authorized: false,
    }));
    expect(testimonialsSchema.safeParse(unauthorized).success).toBe(false);
  });
});

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
