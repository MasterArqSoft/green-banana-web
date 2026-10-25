import { countPendingMarkers } from "@/lib/claims";

// Paridad entre los catálogos de idioma (FR-27, AC-24; spec/03-plan.md D7). content.ts
// compara el catálogo inglés con el español en cada build: si falta una traducción o
// cambian las claves, los IDs, los marcadores {…} o las marcas de dato pendiente, la
// compilación falla. No hay respaldo silencioso de un idioma a otro.

/** Marcadores de plantilla de un texto, sin repetir y ordenados: "{a} y {b}" → ["a", "b"]. */
export function variables(texto: string): string[] {
  return [
    ...new Set([...texto.matchAll(/\{(\w+)\}/g)].map((m) => m[1])),
  ].sort();
}

const tipo = (valor: unknown) =>
  Array.isArray(valor) ? "lista" : valor === null ? "null" : typeof valor;

/**
 * Diferencias de estructura entre dos catálogos: claves, tipos, largo de las listas,
 * `id` de cada elemento, marcadores {…} y cantidad de marcas "(FICTICIO)" o "[…]".
 * Devuelve una línea por diferencia, con su ruta; vacío si coinciden.
 */
export function diferenciasDeCatalogo(
  base: unknown,
  otro: unknown,
  ruta = "",
): string[] {
  const donde = ruta || "(raíz)";
  if (tipo(base) !== tipo(otro)) {
    return [`${donde}: tipo ${tipo(otro)}, se esperaba ${tipo(base)}`];
  }
  if (typeof base === "string" && typeof otro === "string") {
    const diferencias: string[] = [];
    const [a, b] = [variables(base), variables(otro)];
    if (a.join() !== b.join()) {
      diferencias.push(
        `${donde}: marcadores {${b.join("}, {")}}, se esperaba {${a.join("}, {")}}`,
      );
    }
    if (countPendingMarkers(base) !== countPendingMarkers(otro)) {
      diferencias.push(
        `${donde}: ${countPendingMarkers(otro)} marcas de pendiente, se esperaban ${countPendingMarkers(base)}`,
      );
    }
    return diferencias;
  }
  if (Array.isArray(base) && Array.isArray(otro)) {
    if (base.length !== otro.length) {
      return [
        `${donde}: ${otro.length} elementos, se esperaban ${base.length}`,
      ];
    }
    return base.flatMap((item, i) => {
      const id = (item as { id?: unknown })?.id;
      const otroId = (otro[i] as { id?: unknown })?.id;
      if (id !== otroId) {
        return [
          `${ruta}[${i}]: id ${String(otroId)}, se esperaba ${String(id)}`,
        ];
      }
      return diferenciasDeCatalogo(item, otro[i], `${ruta}[${i}]`);
    });
  }
  if (base && otro && typeof base === "object" && typeof otro === "object") {
    const [a, b] = [base, otro] as Record<string, unknown>[];
    const faltan = Object.keys(a).filter((clave) => !(clave in b));
    const sobran = Object.keys(b).filter((clave) => !(clave in a));
    return [
      ...faltan.map((clave) => `${ruta ? `${ruta}.` : ""}${clave}: falta`),
      ...sobran.map((clave) => `${ruta ? `${ruta}.` : ""}${clave}: sobra`),
      ...Object.keys(a)
        .filter((clave) => clave in b)
        .flatMap((clave) =>
          diferenciasDeCatalogo(
            a[clave],
            b[clave],
            ruta ? `${ruta}.${clave}` : clave,
          ),
        ),
    ];
  }
  return [];
}

/** IDs de los datos comunes sin texto en un catálogo, y textos sin dato común. */
export function idsSinPareja(
  comunes: string[],
  textos: Record<string, unknown>,
  ruta: string,
): string[] {
  return [
    ...comunes
      .filter((id) => !(id in textos))
      .map((id) => `${ruta}.${id}: falta el texto`),
    ...Object.keys(textos)
      .filter((id) => !comunes.includes(id))
      .map((id) => `${ruta}.${id}: no corresponde a ningún dato común`),
  ];
}
