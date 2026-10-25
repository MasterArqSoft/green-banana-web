import { describe, expect, it } from "vitest";
import {
  ARCHIVO_PROVEEDOR,
  archivoAzure,
  archivoCloudflare,
  CABECERAS_COMUNES,
  cabecerasAzurePara,
  cabecerasPara,
  CSP,
  CSP_TODA_RESPUESTA,
  cspDeMeta,
  LIMITE_LINEA_CLOUDFLARE,
  leerCloudflare,
  politicasCsp,
  proveedoresDelBuild,
  revisarCabeceras,
  rutaDeHtml,
} from "@/lib/cabeceras";
import { cspPolicy, cspPolicyCabecera } from "@/lib/csp";

// T-115 (DR-06, F-11): fuente única de las cabeceras de seguridad de producción.
const hash = "'sha256-abc='";
const paginas = [
  { ruta: "/", csp: cspPolicyCabecera([hash]) },
  { ruta: "/en/terms", csp: cspPolicyCabecera(["'sha256-def='"]) },
];
const metaDe404 = cspPolicy(["'sha256-404='"]);

describe("cabeceras comunes", () => {
  it("tienen HSTS sin preload ni includeSubDomains, nosniff, Referrer-Policy compatible con OSM y Permissions-Policy", () => {
    const hsts = CABECERAS_COMUNES["Strict-Transport-Security"];
    expect(hsts).toMatch(/max-age=\d+/);
    // includeSubDomains espera a saber que todos los subdominios de RP-01 usan HTTPS.
    expect(hsts).not.toMatch(/preload|includeSubDomains/i);
    expect(CABECERAS_COMUNES["X-Content-Type-Options"]).toBe("nosniff");
    expect(CABECERAS_COMUNES["Referrer-Policy"]).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(CABECERAS_COMUNES["Permissions-Policy"]).toContain("geolocation=()");
  });

  it("la política para toda respuesta solo prohíbe el enmarcado", () => {
    expect(CSP_TODA_RESPUESTA).toBe("frame-ancestors 'none'");
  });
});

describe("proveedor del build (N-6 b)", () => {
  it("con HOSTING_PROVEEDOR genera solo el archivo de ese proveedor", () => {
    expect(proveedoresDelBuild({ HOSTING_PROVEEDOR: "cloudflare" })).toEqual([
      "cloudflare",
    ]);
    expect(
      proveedoresDelBuild({
        HOSTING_PROVEEDOR: "azure",
        SITE_ENV: "production",
      }),
    ).toEqual(["azure"]);
  });

  it("rechaza un proveedor desconocido", () => {
    expect(() => proveedoresDelBuild({ HOSTING_PROVEEDOR: "netlify" })).toThrow(
      /no es válido/,
    );
  });

  it("producción sin elección falla (R-08); fuera de producción genera los dos", () => {
    expect(() => proveedoresDelBuild({ SITE_ENV: "production" })).toThrow(
      /R-08/,
    );
    expect(proveedoresDelBuild({})).toEqual(Object.keys(ARCHIVO_PROVEEDOR));
  });
});

describe("Cloudflare: _headers", () => {
  const texto = archivoCloudflare(paginas);
  const reglas = leerCloudflare(texto);

  it("pone las comunes y la política mínima en /* y la CSP completa en la regla exacta de cada página", () => {
    expect(reglas.map((r) => r.ruta)).toEqual(["/*", "/", "/en/terms"]);
    expect(reglas[0].cabeceras).toEqual({
      ...CABECERAS_COMUNES,
      [CSP]: CSP_TODA_RESPUESTA,
    });
    expect(reglas[2].cabeceras[CSP]).toContain("'sha256-def='");
  });

  it("cada página recibe las dos políticas unidas con coma y cumple", () => {
    const inicio = cabecerasPara(reglas, "/");
    expect(politicasCsp(inicio[CSP])).toEqual([
      CSP_TODA_RESPUESTA,
      paginas[0].csp,
    ]);
    expect(revisarCabeceras(inicio, "html")).toEqual([]);
  });

  it("una ruta inexistente (la 404) recibe las comunes y frame-ancestors, y con su <meta> cumple", () => {
    const noExiste = cabecerasPara(reglas, "/en/no-existe");
    expect(noExiste).toEqual({
      ...CABECERAS_COMUNES,
      [CSP]: CSP_TODA_RESPUESTA,
    });
    expect(revisarCabeceras(noExiste, "404", { metaCsp: metaDe404 })).toEqual(
      [],
    );
  });

  it("respeta los límites de Cloudflare", () => {
    expect(
      texto.split("\n").every((l) => l.length <= LIMITE_LINEA_CLOUDFLARE),
    ).toBe(true);
    const muchas = Array.from({ length: 100 }, (_, i) => ({
      ruta: `/p${i}`,
      csp: "default-src 'self'",
    }));
    expect(() => archivoCloudflare(muchas)).toThrow(/reglas/);
    expect(() =>
      archivoCloudflare([{ ruta: "/", csp: "x".repeat(2001) }]),
    ).toThrow(/caracteres/);
  });

  it("rechaza una línea mal formada", () => {
    expect(() => leerCloudflare("/\n  sin-dos-puntos")).toThrow(/inválida/);
  });
});

describe("Azure: staticwebapp.config.json", () => {
  const config = JSON.parse(archivoAzure(paginas));

  it("globalHeaders con las comunes y la política mínima, CSP por ruta y la 404 reescrita", () => {
    expect(config.globalHeaders).toEqual({
      ...CABECERAS_COMUNES,
      [CSP]: CSP_TODA_RESPUESTA,
    });
    expect(config.routes).toEqual([
      { route: "/", headers: { [CSP]: paginas[0].csp } },
      { route: "/en/terms", headers: { [CSP]: paginas[1].csp } },
    ]);
    expect(config.responseOverrides["404"].rewrite).toBe("/404.html");
  });

  it("la CSP de la ruta sustituye a la global; la 404 recibe la global", () => {
    const terms = cabecerasAzurePara(config, "/en/terms");
    expect(terms[CSP]).toBe(paginas[1].csp);
    expect(revisarCabeceras(terms, "html")).toEqual([]);
    const noExiste = cabecerasAzurePara(config, "/no-existe");
    expect(noExiste[CSP]).toBe(CSP_TODA_RESPUESTA);
    expect(revisarCabeceras(noExiste, "404", { metaCsp: metaDe404 })).toEqual(
      [],
    );
  });
});

describe("rutaDeHtml", () => {
  it.each([
    ["index.html", "/"],
    ["terminos.html", "/terminos"],
    ["en.html", "/en"],
    ["en/terms.html", "/en/terms"],
    ["en\\privacy.html", "/en/privacy"],
    ["404.html", null],
    ["_not-found.html", null],
  ])("%s → %s", (archivo, ruta) => {
    expect(rutaDeHtml(archivo)).toBe(ruta);
  });
});

describe("cspDeMeta", () => {
  it("lee la CSP de la <meta> que inserta scripts/csp.mjs, o null", () => {
    expect(
      cspDeMeta(
        `<meta charSet="utf-8"/><meta http-equiv="Content-Security-Policy" content="${metaDe404}"/>`,
      ),
    ).toBe(metaDe404);
    expect(cspDeMeta("<html></html>")).toBeNull();
  });
});

describe("revisarCabeceras", () => {
  const html = { ...CABECERAS_COMUNES, [CSP]: cspPolicyCabecera([hash]) };

  it("acepta un HTML correcto, sin distinguir mayúsculas en los nombres", () => {
    const minusculas = Object.fromEntries(
      Object.entries(html).map(([k, v]) => [k.toLowerCase(), v]),
    );
    expect(revisarCabeceras(minusculas, "html")).toEqual([]);
  });

  it("detecta cabeceras ausentes o distintas", () => {
    expect(revisarCabeceras({}, "recurso")).toHaveLength(4);
    expect(
      revisarCabeceras({ ...html, "Referrer-Policy": "no-referrer" }, "html"),
    ).toEqual([
      "Referrer-Policy: «no-referrer» en vez de «strict-origin-when-cross-origin»",
    ]);
  });

  it("exige en el HTML una CSP con frame-ancestors, con script-src y sin unsafe-inline", () => {
    expect(revisarCabeceras(CABECERAS_COMUNES, "html")).toEqual([
      `falta ${CSP}`,
    ]);
    expect(
      revisarCabeceras(
        { ...CABECERAS_COMUNES, [CSP]: "script-src 'self' 'unsafe-inline'" },
        "html",
      ),
    ).toEqual([
      `${CSP}: script-src con 'unsafe-inline' o 'unsafe-eval'`,
      `${CSP} sin frame-ancestors 'none'`,
    ]);
    expect(
      revisarCabeceras(
        { ...CABECERAS_COMUNES, [CSP]: CSP_TODA_RESPUESTA },
        "html",
      ),
    ).toEqual([`${CSP} por cabecera sin la política completa (script-src)`]);
  });

  it("detecta 'unsafe-eval' en cualquiera de las políticas unidas", () => {
    expect(
      revisarCabeceras(
        { ...html, [CSP]: `${html[CSP]}, script-src 'self' 'unsafe-eval'` },
        "html",
      ),
    ).toEqual([`${CSP}: script-src con 'unsafe-inline' o 'unsafe-eval'`]);
  });

  it("un recurso cumple con las comunes, sin CSP", () => {
    expect(revisarCabeceras(CABECERAS_COMUNES, "recurso")).toEqual([]);
  });
});

describe("revisarCabeceras: la 404 (N-6 c)", () => {
  it("una 404 con solo las comunes, sin CSP en cabecera, falla", () => {
    expect(revisarCabeceras(CABECERAS_COMUNES, "404")).toContain(
      `falta ${CSP}`,
    );
    // La <meta> no sustituye a frame-ancestors por cabecera.
    expect(
      revisarCabeceras(CABECERAS_COMUNES, "404", { metaCsp: metaDe404 }),
    ).toEqual([`falta ${CSP}`]);
  });

  it("una 404 con frame-ancestors pero sin política completa por cabecera ni <meta> falla", () => {
    expect(
      revisarCabeceras(
        { ...CABECERAS_COMUNES, [CSP]: CSP_TODA_RESPUESTA },
        "404",
      ),
    ).toEqual([
      `${CSP}: sin política completa (script-src) por cabecera ni por <meta>`,
    ]);
  });

  it("una <meta> con 'unsafe-inline' en script-src también falla", () => {
    expect(
      revisarCabeceras(
        { ...CABECERAS_COMUNES, [CSP]: CSP_TODA_RESPUESTA },
        "404",
        { metaCsp: "script-src 'self' 'unsafe-inline'" },
      ),
    ).toEqual([`${CSP}: script-src con 'unsafe-inline' o 'unsafe-eval'`]);
  });
});
