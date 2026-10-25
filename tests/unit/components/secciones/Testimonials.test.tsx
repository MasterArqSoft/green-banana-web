import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Testimonials } from "@/components/secciones/Testimonials";
import { testimonialsSchema, type Testimonial } from "@/lib/schema";

const sample = (name: string): Testimonial => ({
  id: name,
  name,
  context: "Barrio de ejemplo",
  text: "Texto de prueba.",
  photo: name,
  photoAlt: `Foto de ${name}`,
  authorized: true,
});

describe("Testimonials (FR-12)", () => {
  it("no se renderiza sin testimonios reales (AC-11)", () => {
    expect(renderToStaticMarkup(<Testimonials locale="es-CO" />)).toBe("");
  });

  it("muestra los testimonios cuando existen", () => {
    const items = ["ana", "luis", "rosa"].map(sample);
    const html = renderToStaticMarkup(
      <Testimonials locale="es-CO" items={items} />,
    );
    expect(html.match(/<li/g)).toHaveLength(3);
    expect(html).toContain("Foto de ana");
  });

  it("las fotos pasan por images.ts: AVIF, WebP y carga diferida", () => {
    const html = renderToStaticMarkup(
      <Testimonials
        locale="es-CO"
        items={["ana", "luis", "rosa"].map(sample)}
      />,
    );
    expect(html).toContain("/images/testimonios/ana.avif");
    expect(html).toContain("/images/testimonios/ana.webp");
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('width="96"');
  });

  it("el esquema exige 0 o entre 3 y 5 testimonios autorizados", () => {
    // Solo los datos comunes: los textos van en el catálogo de cada idioma.
    const comun = (name: string) => ({
      id: name,
      name,
      photo: name,
      authorized: true,
    });
    expect(testimonialsSchema.safeParse([]).success).toBe(true);
    expect(
      testimonialsSchema.safeParse(["a", "b", "c"].map(comun)).success,
    ).toBe(true);
    expect(testimonialsSchema.safeParse(["a", "b"].map(comun)).success).toBe(
      false,
    );
    const unauthorized = ["a", "b", "c"].map((name) => ({
      ...comun(name),
      authorized: false,
    }));
    expect(testimonialsSchema.safeParse(unauthorized).success).toBe(false);
  });
});

describe("Testimonials en inglés (FR-27)", () => {
  it("tampoco se renderiza sin testimonios, y con ellos usa el título inglés", () => {
    expect(renderToStaticMarkup(<Testimonials locale="en" />)).toBe("");
    const html = renderToStaticMarkup(
      <Testimonials locale="en" items={["ana", "luis", "rosa"].map(sample)} />,
    );
    expect(html).toContain(">Testimonials</h2>");
  });
});
