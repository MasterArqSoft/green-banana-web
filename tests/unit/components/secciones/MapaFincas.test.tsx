import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MapaFincas } from "@/components/secciones/MapaFincas";
import { copy, fincas } from "@/lib/content";
import { fill } from "@/lib/template";

describe("MapaFincas (FR-24)", () => {
  const html = renderToStaticMarkup(<MapaFincas />);
  const items = html.match(/<li[\s>][\s\S]*?<\/li>/g) ?? [];

  it("lista las 6 ubicaciones con nombre y municipio en HTML (AC-16)", () => {
    expect(items).toHaveLength(6);
    fincas.fincas.forEach((finca, index) => {
      expect(items[index]).toContain(finca.nombre);
      expect(items[index]).toContain(finca.municipio);
    });
  });

  it("no muestra las coordenadas de las fincas en la lista (AC-16)", () => {
    fincas.fincas.forEach((finca) => {
      expect(html).not.toContain(finca.lat.toFixed(4));
      expect(html).not.toContain(String(finca.lat));
    });
  });

  it("marca el acopio con su etiqueta", () => {
    const acopio = items.find((item) => item.includes("Acopio en Santa Marta"));
    expect(acopio).toContain(
      fill(copy.map.acopioDetail, { municipio: "Santa Marta" }),
    );
  });

  it("muestra el aviso con el enlace a la política de privacidad antes del botón (AC-19)", () => {
    const aviso = html.indexOf(copy.map.consent);
    const boton = html.indexOf(`>${copy.map.showButton}</button>`);
    expect(aviso).toBeGreaterThan(-1);
    expect(boton).toBeGreaterThan(aviso);
    expect(html).toContain(`href="${copy.map.privacyUrl}"`);
    expect(html).toContain(`>${copy.map.privacyLink}</a>`);
    expect(html).toContain('aria-describedby="mapa-fincas-aviso"');
  });

  it("empieza solo con el botón: sin mapa, sin Leaflet y sin teselas (AC-15)", () => {
    expect(html).toContain(`aria-label="${copy.map.title}"`);
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toContain("leaflet");
    expect(html).not.toContain("tile.openstreetmap.org");
    expect(html).not.toContain(copy.map.loading);
  });

  it("el mapa ilustrado no va en el HTML inicial: se pide al acercarse a la sección", () => {
    expect(html).not.toContain("mapa-fincas.svg");
    expect(html).not.toContain("mapa-fincas-movil.svg");
    expect(html).toContain(copy.map.attribution);
  });

  it("no muestra ningún precio (AC-02)", () => {
    expect(html).not.toMatch(/\$\s?\d|COP/);
  });
});
