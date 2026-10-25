import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  LOCALES,
  OG_LOCALE,
  PAGINAS,
  paginaDeRuta,
  recursoDe,
  rutaDe,
  rutaEquivalente,
} from "@/lib/i18n";

describe("idiomas y rutas (FR-25, FR-26, D7)", () => {
  it("el español es el predeterminado y conserva las URL de siempre", () => {
    expect(DEFAULT_LOCALE).toBe("es-CO");
    expect(PAGINAS.map((p) => rutaDe(p, "es-CO"))).toEqual([
      "/",
      "/terminos",
      "/privacidad",
      "/garantia",
    ]);
  });

  it("el inglés vive bajo /en con rutas en inglés", () => {
    expect(PAGINAS.map((p) => rutaDe(p, "en"))).toEqual([
      "/en",
      "/en/terms",
      "/en/privacy",
      "/en/guarantee",
    ]);
  });

  it("ocho rutas distintas, sin /es ni otros idiomas", () => {
    const rutas = PAGINAS.flatMap((p) => LOCALES.map((l) => rutaDe(p, l)));
    expect(new Set(rutas).size).toBe(8);
    expect(rutas.some((ruta) => ruta.startsWith("/es"))).toBe(false);
  });

  it.each([
    ["/", "inicio", "es-CO"],
    ["/en", "inicio", "en"],
    ["/en/", "inicio", "en"],
    ["/terminos/", "terminos", "es-CO"],
    ["/en/privacy", "privacidad", "en"],
    ["/en/guarantee/", "garantia", "en"],
  ])("%s → %s en %s", (ruta, pagina, locale) => {
    expect(paginaDeRuta(ruta)).toEqual({ pagina, locale });
  });

  it("una ruta desconocida no es ninguna página", () => {
    expect(paginaDeRuta("/no-existe")).toBeNull();
    expect(paginaDeRuta("/en/terminos")).toBeNull();
    expect(paginaDeRuta("/es")).toBeNull();
  });

  it("la ruta equivalente cambia de idioma en los dos sentidos", () => {
    expect(rutaEquivalente("/terminos", "en")).toBe("/en/terms");
    expect(rutaEquivalente("/en/terms/", "es-CO")).toBe("/terminos");
    expect(rutaEquivalente("/en", "es-CO")).toBe("/");
    expect(rutaEquivalente("/", "en")).toBe("/en");
    expect(rutaEquivalente("/privacidad", "es-CO")).toBe("/privacidad");
  });

  it("sin página conocida, la equivalente es el inicio del idioma", () => {
    expect(rutaEquivalente("/no-existe", "en")).toBe("/en");
    expect(rutaEquivalente("/en/no-existe", "es-CO")).toBe("/");
  });

  it("los recursos por idioma van bajo /en solo en inglés", () => {
    expect(recursoDe("/mapa-fincas.svg", "es-CO")).toBe("/mapa-fincas.svg");
    expect(recursoDe("/mapa-fincas.svg", "en")).toBe("/en/mapa-fincas.svg");
  });

  it("og:locale usa los códigos de Open Graph", () => {
    expect(OG_LOCALE).toEqual({ "es-CO": "es_CO", en: "en_US" });
  });

  it("no tiene imports: scripts/budget.mjs lo carga con Node, sin el alias @/", () => {
    const fuente = readFileSync("src/lib/i18n.ts", "utf8");
    expect(fuente).not.toMatch(/^\s*import\s/m);
    expect(fuente).not.toMatch(/\brequire\(/);
  });
});
