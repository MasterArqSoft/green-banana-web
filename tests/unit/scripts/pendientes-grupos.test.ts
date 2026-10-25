import { describe, expect, it } from "vitest";
import {
  agrupar,
  GRUPOS,
  grupoDe,
  informeMarkdown,
} from "../../../scripts/pendientes-grupos.mjs";

// T-117 (F-01): el expediente de lanzamiento agrupa los pendientes de pendingMarkerEntries()
// por la decisión que los cierra.
describe("grupoDe", () => {
  it("usa primero la etiqueta del texto, aunque vaya al final de un texto largo", () => {
    const largo = `${"Tienes 24 horas desde la entrega para reclamar con una foto. ".repeat(3)}[POR CONFIRMAR política, RP-04].`;
    expect(grupoDe({ ruta: "es-CO.faq[7].answer", texto: largo })).toBe(
      "RP-04",
    );
    expect(
      grupoDe({
        ruta: "en.copy.footer.pqr",
        texto: "PQR [TO BE CONFIRMED, RP-05].",
      }),
    ).toBe("RP-05");
    expect(
      grupoDe({
        ruta: "es-CO.legal.draftNotice",
        texto: "Borrador [POR CONFIRMAR, T-05].",
      }),
    ).toBe("T-05");
  });

  it.each([
    ["site.legal.nit", "000 (FICTICIO)", "RP-01"],
    ["site.url", "https://x.github.io/y", "RP-01"],
    ["fincas.fincas[1].productor", "Productor (FICTICIO)", "RP-02"],
    ["es-CO.fincas.finca-a", "Finca A (FICTICIO)", "RP-02"],
    ["en.copy.map.text", "Reference farms (FICTICIO)", "RP-02"],
    ["products[0].pendingConfirmation", "approxWeightG", "T-03"],
    ["es-CO.faq[2].answer", "Entre [4 y 7] días", "T-03"],
    ["recipes[0].time", "[60–90] min", "Contenido"],
    ["es-CO.legal.privacidad.sections[1].paragraphs[1]", "[…]", "T-05"],
    ["es-CO.copy.otra.cosa", "[X]", "Sin clasificar"],
  ])("sin etiqueta, por la ruta: %s → %s", (ruta, texto, grupo) => {
    expect(grupoDe({ ruta, texto })).toBe(grupo);
  });
});

describe("agrupar e informeMarkdown", () => {
  const entradas = [
    { ruta: "site.brand", texto: "Marca (FICTICIO)" },
    { ruta: "recipes[0].time", texto: "[30] min" },
    {
      ruta: "en.copy.guarantee.text",
      texto: "… [TO BE CONFIRMED policy, RP-04].",
    },
  ];

  it("respeta el orden de GRUPOS y omite los vacíos", () => {
    expect(agrupar(entradas).map((g) => g.id)).toEqual([
      "RP-01",
      "RP-04",
      "Contenido",
    ]);
    expect(GRUPOS.at(-1)?.id).toBe("Sin clasificar");
  });

  it("el informe cuenta las entradas y detalla cada grupo", () => {
    const md = informeMarkdown(entradas, "2026-10-25");
    expect(md).toContain("Pendientes de producción: 3 (generado 2026-10-25");
    expect(md).toContain("| RP-04 | Política de garantía |");
    expect(md).toContain("- `site.brand: Marca (FICTICIO)`");
  });
});
