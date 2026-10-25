// Agrupa los pendientes de producción de pendingMarkerEntries() (src/lib/content.ts: las
// mismas entradas que pendingMarkers(), con el texto completo) por la
// decisión o el dato que los cierra (T-117, F-01). Lógica pura, probada en
// tests/unit/scripts/pendientes-grupos.test.ts; la usa scripts/pendientes.mjs.
// Regla: primero la etiqueta explícita del texto (p. ej. "[POR CONFIRMAR, RP-05]"); si no
// la hay, la ruta del dato. Lo que no encaja queda "sin clasificar", para revisarlo.

/** Grupos del expediente de lanzamiento, en el orden en que se muestran. */
export const GRUPOS = [
  {
    id: "RP-01",
    tema: "Datos reales de la empresa y dominio",
    responsable: "Usuario",
    evidencia:
      "site.json con datos verificados (marca, razón social, NIT, dirección, horario, teléfono real) y dominio registrado",
  },
  {
    id: "RP-02",
    tema: "Origen real, fincas, productores y fotos",
    responsable: "Usuario y productores",
    evidencia:
      "Datos de origen y fincas reales, autorización escrita de cada productor y fotos propias con licencia",
  },
  {
    id: "RP-03",
    tema: "Precio por teléfono, medios de pago y entrega (Ley 1480)",
    responsable: "Usuario con asesor jurídico",
    evidencia: "Concepto jurídico escrito",
  },
  {
    id: "RP-04",
    tema: "Política de garantía",
    responsable: "Usuario con asesor jurídico",
    evidencia:
      "Política aprobada (plazo, remedios, condiciones); luego T-116 la estructura como dato común",
  },
  {
    id: "RP-05",
    tema: "Procedimiento de PQR con constancia",
    responsable: "Usuario con asesor jurídico",
    evidencia: "Canal y forma de la constancia definidos y probados",
  },
  {
    id: "T-03",
    tema: "Pesos, unidades, vida útil y porcentaje de pintón",
    responsable: "Proveedor",
    evidencia: "Confirmación escrita del proveedor",
  },
  {
    id: "T-05",
    tema: "Textos legales (términos, privacidad, garantía)",
    responsable: "Asesor jurídico",
    evidencia: "Textos revisados y aprobados por escrito",
  },
  {
    id: "Contenido",
    tema: "Datos editoriales (p. ej. tiempos de receta)",
    responsable: "Usuario",
    evidencia: "Valor revisado por el usuario",
  },
  {
    id: "Sin clasificar",
    tema: "Pendiente sin regla de agrupación",
    responsable: "Revisar",
    evidencia: "Asignar a un grupo en scripts/pendientes-grupos.mjs",
  },
];

const ETIQUETA = /\b(RP-0[1-5]|T-0[35])\b/;

// Ruta del dato (sin el prefijo de idioma) → grupo, cuando el texto no trae etiqueta.
const POR_RUTA = [
  [/^site\./, "RP-01"],
  [/^(origin|fincas)\./, "RP-02"],
  [/^copy\.map\./, "RP-02"],
  [/^products\[\d+\]\.pendingConfirmation$/, "T-03"],
  [/^faq\[\d+\]\.answer$/, "T-03"],
  [/^copy\.freshInfo\./, "T-03"],
  [/^legal\./, "T-05"],
  [/^recipes\[\d+\]\.time$/, "Contenido"],
];

/** Grupo de una entrada { ruta, texto } de pendingMarkerEntries(). */
export function grupoDe({ ruta, texto }) {
  const etiqueta = texto.match(ETIQUETA)?.[1];
  if (etiqueta) return etiqueta;
  const sinIdioma = ruta.replace(/^(es-CO|en)\./, "");
  return (
    POR_RUTA.find(([patron]) => patron.test(sinIdioma))?.[1] ?? "Sin clasificar"
  );
}

/** Entradas agrupadas en el orden de GRUPOS; omite los grupos vacíos. */
export function agrupar(entradas) {
  return GRUPOS.map((grupo) => ({
    ...grupo,
    entradas: entradas.filter((entrada) => grupoDe(entrada) === grupo.id),
  })).filter((grupo) => grupo.entradas.length > 0);
}

/** Informe en Markdown: resumen por grupo y detalle. */
export function informeMarkdown(entradas, fecha) {
  const grupos = agrupar(entradas);
  const lineas = [
    `Pendientes de producción: ${entradas.length} (generado ${fecha} con \`npm run pendientes\` desde pendingMarkerEntries()).`,
    "",
    "| Grupo | Tema | Responsable | Evidencia para cerrar | Entradas |",
    "|---|---|---|---|---:|",
    ...grupos.map(
      (g) =>
        `| ${g.id} | ${g.tema} | ${g.responsable} | ${g.evidencia} | ${g.entradas.length} |`,
    ),
  ];
  for (const g of grupos) {
    lineas.push("", `### ${g.id}: ${g.tema}`, "");
    lineas.push(
      ...g.entradas.map(({ ruta, texto }) => `- \`${ruta}: ${texto}\``),
    );
  }
  return `${lineas.join("\n")}\n`;
}
