// Salud de la vista del mapa de fincas (T-79, MAP-01, MAP-02). Lógica pura, sin Leaflet ni
// React, para probarla sin navegador; la usa MapaFincasInteractivo (cliente). No importa
// nada de lib/ que cargue el contenido.

export type EstadoTesela = "pendiente" | "ok" | "error";

/** Estado de la vista: sin teselas en ella, todas bien, faltan algunas o no hay ninguna válida. */
export type SaludVista = "vacia" | "ok" | "parcial" | "sin-mapa";

/** Clave de una tesela en el registro: "z/x/y". */
export const claveTesela = ({ x, y, z }: { x: number; y: number; z: number }) =>
  `${z}/${x}/${y}`;

/**
 * Evalúa solo las teselas del zoom actual dentro de la vista (en píxeles, como
 * map.getPixelBounds() de Leaflet). Las pendientes cuentan como fallidas: se evalúa al
 * terminar el lote o al vencer la espera. Sin ninguna válida y alguna fallida, "sin-mapa".
 */
export function saludVista(
  teselas: ReadonlyMap<string, EstadoTesela>,
  zoom: number,
  vista: { min?: { x: number; y: number }; max?: { x: number; y: number } },
  tam: { x: number; y: number },
): SaludVista {
  const { min, max } = vista;
  if (!min || !max) return "vacia";
  const x0 = Math.floor(min.x / tam.x);
  const x1 = Math.floor((max.x - 1) / tam.x);
  const y0 = Math.floor(min.y / tam.y);
  const y1 = Math.floor((max.y - 1) / tam.y);
  let validas = 0;
  let fallidas = 0;
  for (const [clave, estado] of teselas) {
    const [z, x, y] = clave.split("/").map(Number);
    if (z !== zoom || x < x0 || x > x1 || y < y0 || y > y1) continue;
    if (estado === "ok") validas += 1;
    else fallidas += 1;
  }
  if (validas === 0) return fallidas > 0 ? "sin-mapa" : "vacia";
  return fallidas > 0 ? "parcial" : "ok";
}
