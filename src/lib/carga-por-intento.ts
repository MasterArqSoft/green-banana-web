// Plazo e intentos de la carga del mapa de fincas (T-105, F-03, DR-02). Lógica pura, sin
// Leaflet ni React, para probarla sin navegador; la usa MapaFincasInteractivo (cliente).
// No importa nada de lib/ que cargue el contenido.

/** Espera máxima de cada etapa del mapa: descarga de Leaflet y primer lote de teselas. */
export const ESPERA_MAPA_MS = 15_000;

/** Rechazo de conPlazo() cuando la promesa no se resolvió a tiempo. */
export class PlazoVencido extends Error {
  constructor(ms: number) {
    super(`Sin respuesta en ${ms} ms`);
    this.name = "PlazoVencido";
  }
}

/**
 * Devuelve una promesa que se rechaza con PlazoVencido si `promesa` no termina en `ms`.
 * Un import() pendiente no se puede cancelar: si llega tarde, su resultado se descarta.
 */
export function conPlazo<T>(promesa: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const temporizador = setTimeout(() => reject(new PlazoVencido(ms)), ms);
    promesa.then(
      (valor) => {
        clearTimeout(temporizador);
        resolve(valor);
      },
      (error: unknown) => {
        clearTimeout(temporizador);
        reject(error);
      },
    );
  });
}

/**
 * Contador de intentos de carga. Cada carga o reintento pide un id con nuevo(); una
 * continuación tardía comprueba vigente(id) antes de tocar el estado. invalidar()
 * deja sin vigencia el intento en curso (al fallar o al desmontar).
 */
export function crearIntentos() {
  let actual = 0;
  return {
    nuevo: () => ++actual,
    vigente: (id: number) => id === actual,
    invalidar: () => {
      actual += 1;
    },
  };
}
