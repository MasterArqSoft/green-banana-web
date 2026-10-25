import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Picture } from "@/components/ui/Picture";
import { IMAGES } from "@/lib/images";

describe("Picture", () => {
  const html = renderToStaticMarkup(
    <Picture spec={IMAGES.origin} alt="Prueba" />,
  );

  it("ofrece AVIF y usa WebP como respaldo", () => {
    expect(html).toContain('type="image/avif"');
    expect(html).toMatch(/<img[^>]*src="\/images\/origen\/origen\.webp"/);
  });

  it("declara ancho y alto, y carga en diferido", () => {
    expect(html).toContain('width="1200"');
    expect(html).toContain('height="800"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('alt="Prueba"');
  });

  it("antepone auto al sizes de las fotos con versiones (N-5) y no lo pone sin ellas", () => {
    const conSizes = renderToStaticMarkup(
      <Picture spec={IMAGES.origin} alt="Prueba" sizes="50vw" />,
    );
    expect(conSizes.match(/sizes="auto, 50vw"/g)).toHaveLength(2);
    const sinVersiones = renderToStaticMarkup(
      <Picture
        spec={{ ...IMAGES.origin, variants: undefined }}
        alt="Prueba"
        sizes="50vw"
      />,
    );
    expect(sinVersiones).not.toContain("sizes=");
  });
});
