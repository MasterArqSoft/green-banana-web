import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LocalBusinessJsonLd } from "@/components/seo/LocalBusinessJsonLd";
import { getContent, site } from "@/lib/content";
import { ogImage } from "@/lib/seo";

const { fincas } = getContent("es-CO");

describe("LocalBusinessJsonLd (T-31)", () => {
  it("publica LocalBusiness con datos de site.json y sin precios", () => {
    const html = renderToStaticMarkup(<LocalBusinessJsonLd locale="es-CO" />);
    const json = html.match(/<script[^>]*>(.*)<\/script>/)?.[1];
    const data = JSON.parse(json!);
    expect(data["@type"]).toBe("LocalBusiness");
    expect(data.telephone).toBe(site.phone);
    expect(data.address.addressLocality).toBe(site.acopio.city);
    expect(JSON.stringify(data)).not.toMatch(/price|offer/i);
  });

  it("incluye la imagen y las coordenadas del acopio (SEO-07, T-65)", () => {
    const html = renderToStaticMarkup(<LocalBusinessJsonLd locale="es-CO" />);
    const data = JSON.parse(html.match(/<script[^>]*>(.*)<\/script>/)![1]);
    const acopio = fincas.fincas.find((finca) => finca.tipo === "acopio")!;
    expect(data.image).toBe(ogImage("es-CO").url);
    expect(data.geo).toEqual({
      "@type": "GeoCoordinates",
      latitude: acopio.lat,
      longitude: acopio.lng,
    });
  });

  it("en inglés es la misma identidad de negocio: mismo @id, nombre, teléfono y URL (FR-28)", () => {
    const datos = (locale: "es-CO" | "en") =>
      JSON.parse(
        renderToStaticMarkup(<LocalBusinessJsonLd locale={locale} />).match(
          /<script[^>]*>(.*)<\/script>/,
        )![1],
      );
    const [es, en] = [datos("es-CO"), datos("en")];
    expect(es["@id"]).toMatch(/#negocio$/);
    expect(en).toEqual(es);
  });
});
