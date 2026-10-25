// Presupuesto de laboratorio de Lighthouse (T-75, R-01, NFR-01). Lógica pura, sin E/S,
// para probarla con Vitest (tests/unit/scripts/). La usa scripts/lighthouse.mjs.
// Es una guarda contra regresiones medida en laboratorio (móvil simulado, 4G lenta,
// CPU ×4); la meta de NFR-01 (LCP ≤ 2,5 s p75) se mide con usuarios reales al lanzar.

export const PRESUPUESTO = {
  // Categorías (AC-08): mínimo de puntuación, de 0 a 100.
  categorias: {
    performance: 90,
    accessibility: 90,
    "best-practices": 90,
    seo: 90,
  },
  // Métricas: máximo permitido, medido con el método simulado (el de Lighthouse por
  // defecto). LCP fijado en T-76 en lo logrado con un margen pequeño (mediana de 3182 ms
  // + ~7 %; decisión del usuario, 2026-10-24). Es una guarda contra regresiones, no la
  // meta de 2,5 s. Los métodos simulado y DevTools dan valores distintos y ninguno es el
  // dato de campo: el presupuesto no se traslada de uno a otro (T-80).
  // CLS y TBT con los umbrales "buenos" de Lighthouse.
  metricas: {
    "largest-contentful-paint": { max: 3400, unidad: "ms" },
    "cumulative-layout-shift": { max: 0.1, unidad: "" },
    "total-blocking-time": { max: 200, unidad: "ms" },
  },
};

export function mediana(valores) {
  const orden = [...valores].sort((a, b) => a - b);
  const mitad = Math.floor(orden.length / 2);
  return orden.length % 2
    ? orden[mitad]
    : (orden[mitad - 1] + orden[mitad]) / 2;
}

// corridas: [{ categorias: { id: 0-100 }, metricas: { id: valor } }, ...]
// Devuelve una fila por control con la mediana y si cumple.
export function evaluar(corridas, presupuesto = PRESUPUESTO) {
  const filas = [];
  for (const [id, min] of Object.entries(presupuesto.categorias)) {
    const valor = mediana(corridas.map((c) => c.categorias[id]));
    filas.push({ id, valor, unidad: "", limite: `≥ ${min}`, ok: valor >= min });
  }
  for (const [id, { max, unidad }] of Object.entries(presupuesto.metricas)) {
    const valor = mediana(corridas.map((c) => c.metricas[id]));
    filas.push({
      id,
      valor,
      unidad,
      limite: `≤ ${max}${unidad}`,
      ok: valor <= max,
    });
  }
  return filas;
}

// Subpartes del LCP (insight "lcp-breakdown-insight" de Lighthouse 13), en el orden en
// que ocurren: dicen si el tiempo se va en descubrir, descargar o pintar el elemento.
export const SUBPARTES_LCP = [
  "timeToFirstByte",
  "resourceLoadDelay",
  "resourceLoadDuration",
  "elementRenderDelay",
];

// De un informe JSON de Lighthouse: selector del elemento LCP y duración de cada subparte
// (null si el informe no trae el desglose).
export function desgloseLcp(informe) {
  const items = informe.audits["lcp-breakdown-insight"]?.details?.items ?? [];
  const tabla = items.find((item) => item.type === "table");
  const nodo = items.find((item) => item.type === "node");
  const subpartes = Object.fromEntries(
    SUBPARTES_LCP.map((id) => [
      id,
      tabla?.items.find((fila) => fila.subpart === id)?.duration ?? null,
    ]),
  );
  return { elemento: nodo?.selector ?? null, subpartes };
}

// Mediana de cada subparte en varias corridas y los elementos LCP distintos que hubo:
// comparar dos variantes solo tiene sentido si el elemento LCP es el mismo (T-80).
export function resumirDesgloses(desgloses) {
  const subpartes = Object.fromEntries(
    SUBPARTES_LCP.map((id) => {
      const valores = desgloses
        .map((d) => d.subpartes[id])
        .filter((v) => typeof v === "number");
      return [id, valores.length ? mediana(valores) : null];
    }),
  );
  const elementos = [...new Set(desgloses.map((d) => d.elemento))];
  return { subpartes, elementos };
}

// Resumen en Markdown para el job de GitHub Actions ($GITHUB_STEP_SUMMARY, T-85).
// En CI el paso es informativo (CI-01): la tabla dice qué cumplió, pero no bloquea.
export function resumenMarkdown({
  metodo,
  runs,
  filas,
  subpartes,
  elementos,
  ruta = "",
}) {
  const valor = ({ valor: v, unidad }) =>
    unidad === "ms" ? `${Math.round(v)} ms` : String(Number(v.toFixed(3)));
  const lineas = [
    // Una tabla por página medida (/ y /en, T-96).
    `### Lighthouse móvil${ruta ? `, ${ruta}` : ""} (${metodo}, mediana de ${runs} corridas)`,
    "",
    "Paso informativo: no bloquea la publicación (CI-01). Los servidores de GitHub varían entre corridas; el presupuesto se verifica en local con `npm run lighthouse`.",
    "",
    "| Control | Mediana | Límite | Cumple |",
    "|---|---:|---:|:---:|",
    ...filas.map(
      (fila) =>
        `| ${fila.id} | ${valor(fila)} | ${fila.limite} | ${fila.ok ? "sí" : "no"} |`,
    ),
    "",
    `Subpartes del LCP${metodo === "simulate" ? " (traza sin throttling: no suman el LCP simulado)" : ""}: ${SUBPARTES_LCP.map((id) => `${id} ${subpartes[id] === null ? "–" : `${Math.round(subpartes[id])} ms`}`).join(" · ")}`,
    "",
    elementos.length === 1
      ? `Elemento LCP: \`${elementos[0]}\``
      : `Elemento LCP distinto entre corridas: ${elementos.map((e) => `\`${e}\``).join(", ")}`,
  ];
  return `${lineas.join("\n")}\n`;
}
