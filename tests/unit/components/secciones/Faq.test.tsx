import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Faq } from "@/components/secciones/Faq";
import { getContent } from "@/lib/content";

const { copy, faq } = getContent("es-CO");

describe("Faq (FR-13)", () => {
  const html = renderToStaticMarkup(<Faq locale="es-CO" />);

  it("muestra el título y un acordeón nativo por pregunta", () => {
    expect(html).toContain(copy.faq.title);
    expect(html.match(/<details/g)).toHaveLength(faq.length);
    expect(html.match(/<summary/g)).toHaveLength(faq.length);
  });

  it("incluye cada pregunta y su respuesta", () => {
    for (const item of faq) {
      expect(html).toContain(item.question);
      expect(html).toContain(item.answer);
    }
  });

  it("publica datos estructurados FAQPage válidos", () => {
    const json = html.match(
      /<script type="application\/ld\+json">(.*?)<\/script>/,
    )?.[1];
    expect(json).toBeDefined();
    const data = JSON.parse(json!);
    expect(data["@type"]).toBe("FAQPage");
    expect(data.inLanguage).toBe("es-CO");
    expect(data.mainEntity).toHaveLength(faq.length);
    expect(data.mainEntity[0].acceptedAnswer.text).toBe(faq[0].answer);
  });

  it("no publica la pregunta de facturación (R-09)", () => {
    expect(html).not.toMatch(/¿Facturan\?/);
  });
});

describe("Faq en inglés (FR-27)", () => {
  const en = getContent("en").faq;
  const html = renderToStaticMarkup(<Faq locale="en" />);

  it("tiene las mismas preguntas (mismos id) traducidas", () => {
    expect(en.map((item) => item.id)).toEqual(faq.map((item) => item.id));
    for (const item of en) {
      expect(html).toContain(`id="faq-${item.id}"`);
      expect(html).toContain(item.question);
    }
  });

  it("publica FAQPage en inglés", () => {
    const data = JSON.parse(
      html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)![1],
    );
    expect(data.inLanguage).toBe("en");
    expect(data.mainEntity[0].name).toBe(en[0].question);
  });
});
