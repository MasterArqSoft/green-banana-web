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
  // Métricas: máximo permitido. LCP fijado en T-76 en lo logrado con un margen pequeño
  // (mediana de 3182 ms + ~7 %; decisión del usuario, 2026-10-24). El modo simulado
  // infla el LCP: con throttling real (--throttling-method=devtools) mide ~2,7 s.
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
