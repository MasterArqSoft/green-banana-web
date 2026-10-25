import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HowItWorks } from "@/components/secciones/HowItWorks";
import { getContent } from "@/lib/content";

const { copy } = getContent("es-CO");

describe("HowItWorks (FR-09)", () => {
  const html = renderToStaticMarkup(<HowItWorks locale="es-CO" />);

  it("muestra el título y los tres pasos en una lista ordenada", () => {
    expect(html).toContain(copy.howItWorks.title);
    expect(html).toContain("<ol");
    expect(html.match(/<li/g)).toHaveLength(3);
  });

  it("respeta el orden llamar, confirmar, recibir", () => {
    const [first, second, third] = copy.howItWorks.steps.map((step) =>
      html.indexOf(step.highlight),
    );
    expect(first).toBeLessThan(second);
    expect(second).toBeLessThan(third);
  });
});

describe("HowItWorks en inglés", () => {
  it("muestra los tres pasos traducidos", () => {
    const html = renderToStaticMarkup(<HowItWorks locale="en" />);
    for (const step of getContent("en").copy.howItWorks.steps) {
      expect(html).toContain(step.highlight);
    }
    expect(html.match(/<li/g)).toHaveLength(3);
  });
});
