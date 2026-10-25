import { afterEach, describe, expect, it, vi } from "vitest";

// Archivos de src/content/: datos comunes y un catálogo por idioma (spec/03-plan.md D7).
const COMUNES = [
  "site",
  "products",
  "zones",
  "recipes",
  "origin",
  "testimonials",
  "fincas",
];
const POR_IDIOMA = [
  "copy",
  "products",
  "faq",
  "recipes",
  "legal",
  "testimonials",
  "fincas",
];
const ARCHIVOS = [
  ...COMUNES,
  ...["es-CO", "en"].flatMap((l) => POR_IDIOMA.map((f) => `${l}/${f}`)),
];

type Datos = Record<string, unknown>;

// Reemplaza un archivo de contenido por una versión modificada del original.
function cambiar(archivo: string, modificar: (datos: Datos) => void) {
  vi.doMock(`@/content/${archivo}.json`, async (original) => {
    const datos = structuredClone(
      ((await original()) as { default: Datos }).default,
    );
    modificar(datos);
    return { default: datos };
  });
}

// Contenido controlado como si estuviera listo para publicar: sin "(FICTICIO)", sin
// "[…]", sin pendingConfirmation, con número real y dominio propio. No toca los archivos.
const limpiar = (valor: unknown): unknown => {
  if (typeof valor === "string") {
    return valor
      .replace(/\(FICTICIO\)/g, "real")
      .replace(/\[[^\]]*\]/g, "dato");
  }
  if (Array.isArray(valor)) return valor.map(limpiar);
  if (valor && typeof valor === "object") {
    return Object.fromEntries(
      Object.entries(valor)
        .filter(([clave]) => clave !== "pendingConfirmation")
        .map(([clave, item]) => [clave, limpiar(item)]),
    );
  }
  return valor;
};

function contenidoListoParaPublicar(
  ...fallos: [archivo: string, modificar: (datos: Datos) => void][]
) {
  for (const archivo of ARCHIVOS) {
    cambiar(archivo, (datos) => {
      const limpio = limpiar(datos) as Datos;
      for (const clave of Object.keys(datos)) delete datos[clave];
      Object.assign(datos, limpio);
      if (archivo === "site") {
        datos.phoneIsPlaceholder = false;
        datos.url = "https://www.ejemplo.com.co";
      }
      for (const [destino, modificar] of fallos) {
        if (destino === archivo) modificar(datos);
      }
    });
  }
}

describe("carga del contenido", () => {
  afterEach(() => {
    for (const archivo of ARCHIVOS) vi.doUnmock(`@/content/${archivo}.json`);
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("valida los archivos actuales fuera de producción", async () => {
    const content = await import("@/lib/content");
    expect(content.isProduction).toBe(false);
    expect(content.site.phoneIsPlaceholder).toBe(true);
  });

  it("compone cada idioma con los mismos datos comunes (AC-26)", async () => {
    const { getContent } = await import("@/lib/content");
    const [es, en] = [getContent("es-CO"), getContent("en")];
    expect(es.locale).toBe("es-CO");
    expect(en.locale).toBe("en");
    expect(en.site).toBe(es.site);
    expect(en.zones).toBe(es.zones);
    expect(en.origin).toBe(es.origin);
    const datos = (c: typeof es) =>
      c.products.map(({ id, approxWeightG, approxUnits }) => ({
        id,
        approxWeightG,
        approxUnits,
      }));
    expect(datos(en)).toEqual(datos(es));
    const ubicaciones = (c: typeof es) =>
      c.fincas.fincas.map(({ id, lat, lng, municipio }) => ({
        id,
        lat,
        lng,
        municipio,
      }));
    expect(ubicaciones(en)).toEqual(ubicaciones(es));
    expect(en.copy.hero.title).not.toBe(es.copy.hero.title);
    // Siempre el mismo objeto: no hay estado de idioma que cambie entre llamadas.
    expect(getContent("en")).toBe(en);
  });

  it("ningún texto inglés queda vacío ni cae al español", async () => {
    const { getContent } = await import("@/lib/content");
    const en = getContent("en");
    for (const product of en.products) expect(product.label).toBeTruthy();
    for (const finca of en.fincas.fincas) expect(finca.nombre).toBeTruthy();
    expect(en.products.map((p) => p.label)).not.toEqual(
      getContent("es-CO").products.map((p) => p.label),
    );
  });

  it("el contenido actual no tiene frases prohibidas (P1, P3)", async () => {
    await expect(import("@/lib/content")).resolves.toBeDefined();
  });

  it("cuenta 62 datos ficticios o por confirmar en los dos idiomas (checklist para publicar)", async () => {
    const { pendingMarkers } = await import("@/lib/content");
    const pendientes = pendingMarkers();
    expect(pendientes).toHaveLength(62);
    // 43 en los datos comunes y en español (los de antes de la Fase 12) y 19 en inglés.
    expect(pendientes.filter((item) => item.startsWith("en."))).toHaveLength(
      19,
    );
  });
});

// AC-24: el build falla, cada causa por separado. Los archivos reales no se tocan.
describe("controles de los catálogos (AC-24, T-91)", () => {
  afterEach(() => {
    for (const archivo of ARCHIVOS) vi.doUnmock(`@/content/${archivo}.json`);
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("falta una traducción inglesa: sin respaldo en español", async () => {
    cambiar("en/copy", (copy) => delete copy.hero);
    await expect(import("@/lib/content")).rejects.toThrow(
      "Contenido inválido en src/content/en/copy.json",
    );
  });

  it("falta el texto de un dato común (una presentación)", async () => {
    cambiar("en/products", (products) => delete products.box);
    await expect(import("@/lib/content")).rejects.toThrow(
      "en/products.box: falta el texto",
    );
  });

  it("un texto sin dato común (id que no existe)", async () => {
    cambiar("es-CO/recipes", (recipes) => {
      recipes.arepa = { name: "Arepa", description: "x", imageAlt: "x" };
    });
    await expect(import("@/lib/content")).rejects.toThrow(
      "es-CO/recipes.arepa: no corresponde a ningún dato común",
    );
  });

  it("cambian los marcadores de plantilla", async () => {
    cambiar("en/legal", (legal) => {
      const terminos = legal.terminos as {
        sections: { paragraphs: string[] }[];
      };
      terminos.sections[0].paragraphs[0] = "{razonSocial}, NIT {taxId}.";
    });
    await expect(import("@/lib/content")).rejects.toThrow(
      "en/legal.terminos.sections[0].paragraphs[0]: marcadores {razonSocial}, {taxId}",
    );
  });

  it("la traducción pierde una marca de dato pendiente", async () => {
    cambiar("en/faq", (faq) => {
      (faq as unknown as { answer: string }[])[1].answer = "Between 4 and 5.";
    });
    await expect(import("@/lib/content")).rejects.toThrow(
      "en/faq[1].answer: 0 marcas de pendiente, se esperaban 1",
    );
  });

  it("cambia el orden o el id de una pregunta", async () => {
    cambiar("en/faq", (faq) => {
      (faq as unknown as { id: string }[])[0].id = "difference";
    });
    await expect(import("@/lib/content")).rejects.toThrow(
      "en/faq[0]: id difference, se esperaba diferencia-platano",
    );
  });

  it("una frase prohibida en inglés (P1, P3)", async () => {
    cambiar("en/copy", (copy) => {
      (copy.benefits as { text: string }).text =
        "Green banana helps with weight loss.";
    });
    await expect(import("@/lib/content")).rejects.toThrow(
      "frases prohibidas (P1, P3): weight loss",
    );
  });

  it("un campo no previsto en un texto (p. ej. un precio)", async () => {
    cambiar("en/products", (products) => {
      (products.kg as Datos).price = "3500";
    });
    await expect(import("@/lib/content")).rejects.toThrow(
      "Contenido inválido en src/content/en/products.json",
    );
  });
});

describe("build de producción (T-39, T-91)", () => {
  afterEach(() => {
    for (const archivo of ARCHIVOS) vi.doUnmock(`@/content/${archivo}.json`);
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("bloquea el build de producción con el número ficticio (riesgo R5)", async () => {
    vi.stubEnv("SITE_ENV", "production");
    await expect(import("@/lib/content")).rejects.toThrow(
      "Build de producción bloqueado",
    );
  });

  it("bloquea producción mientras queden datos ficticios o por confirmar", async () => {
    vi.stubEnv("SITE_ENV", "production");
    cambiar("site", (site) => (site.phoneIsPlaceholder = false));
    await expect(import("@/lib/content")).rejects.toThrow(
      /quedan 62 datos ficticios o por confirmar/,
    );
  });

  it("las fincas (FICTICIO) de cada idioma aparecen en la lista (AC-17)", async () => {
    vi.stubEnv("SITE_ENV", "production");
    cambiar("site", (site) => (site.phoneIsPlaceholder = false));
    const error = await import("@/lib/content").catch((e: Error) => e);
    expect(String(error)).toContain(
      "es-CO.fincas.finca-a: Finca de ejemplo A (FICTICIO)",
    );
    expect(String(error)).toContain(
      "en.fincas.finca-a: Example farm A (FICTICIO)",
    );
  });

  it("con contenido controlado listo para publicar, producción compila", async () => {
    vi.stubEnv("SITE_ENV", "production");
    contenidoListoParaPublicar();
    const content = await import("@/lib/content");
    expect(content.isProduction).toBe(true);
    expect(content.pendingMarkers()).toEqual([]);
  });

  it.each([
    [
      "origin",
      "origin.producer",
      (d: Datos) => {
        d.producer = "Finca (FICTICIO)";
      },
    ],
    [
      "products",
      "products[0].pendingConfirmation",
      (d: Datos) => {
        (d as unknown as Datos[])[0].pendingConfirmation = ["approxWeightG"];
      },
    ],
    [
      "site",
      "site.url",
      (d: Datos) => {
        d.url = "https://masterarqsoft.github.io/green-banana-web";
      },
    ],
  ] as const)(
    "un solo pendiente en %s bloquea producción (%s)",
    async (archivo, ruta, modificar) => {
      vi.stubEnv("SITE_ENV", "production");
      contenidoListoParaPublicar([archivo, modificar]);
      const error = await import("@/lib/content").catch((e: Error) => e);
      expect(String(error)).toContain("quedan 1 datos ficticios");
      expect(String(error)).toContain(ruta);
    },
  );

  it("un pendiente en los dos catálogos bloquea producción en los dos idiomas", async () => {
    vi.stubEnv("SITE_ENV", "production");
    contenidoListoParaPublicar(
      ["es-CO/fincas", (d) => (d["finca-b"] = "Finca B (FICTICIO)")],
      ["en/fincas", (d) => (d["finca-b"] = "Farm B (FICTICIO)")],
    );
    const error = await import("@/lib/content").catch((e: Error) => e);
    expect(String(error)).toContain("quedan 2 datos ficticios");
    expect(String(error)).toContain("es-CO.fincas.finca-b");
    expect(String(error)).toContain("en.fincas.finca-b");
  });

  it("una marca solo en inglés no pasa: la detiene la paridad antes que producción", async () => {
    vi.stubEnv("SITE_ENV", "production");
    contenidoListoParaPublicar(["en/copy", (d) => (d.demoNotice = "[TBC]")]);
    await expect(import("@/lib/content")).rejects.toThrow(
      "en/copy.demoNotice: 1 marcas de pendiente, se esperaban 0",
    );
  });
});
