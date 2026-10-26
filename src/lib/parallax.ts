// Lógica pura del efecto de profundidad del hero (foto 2.5D con mapa de profundidad).
// Sin DOM ni WebGL: la usan components/cliente/profundidad.worker.ts, el controlador y
// Hero.tsx, y se prueba sola. Coordenadas en fracciones (0 a 1). Un píxel se toma de
// `posición − desplazamiento × (profundidad − FOCO)`, con profundidad 1 = cerca.

/**
 * Plano que no se desplaza. Con las capas publicadas (variante C de
 * tools/profundidad/generar.py) el producto queda un poco por delante (0,88) y se mueve
 * entero, poco y en sentido contrario al fondo, con la mesa en contacto; con la variante A
 * quedaba justo en este plano, quieto.
 */
export const FOCO = 0.75;
/**
 * Desplazamiento máximo, en fracción del ancho visible (≈ 2,3 % del fondo frente al
 * racimo). El vertical busca los mismos píxeles CSS que el horizontal, hasta donde lo
 * permita el margen (amplitud()): antes era la mitad y en fracción del alto, y en 16:10
 * el fondo apenas subía o bajaba 2 px frente a 8–10 en horizontal.
 */
export const INTENSIDAD = 0.03;
/** Parte del desplazamiento que recibe, como máximo, un punto del mapa (el fondo, a 0). */
const ALCANCE = Math.max(FOCO, 1 - FOCO);
/** Margen (ampliación) que admite un desplazamiento máximo `d` en fracción del lado. */
const escalaPara = (d: number) => 1 + 2 * d * ALCANCE;
/**
 * Margen fijo: la foto estática y el lienzo se muestran ampliados lo justo para que el
 * desplazamiento máximo nunca deje bordes vacíos. Al ser fijo (antes crecía con el
 * movimiento) el encuadre no «respira» y el reposo del lienzo coincide con la foto.
 * Móvil (caja cuadrada): 4,5 %, igual en los dos ejes. Escritorio (16:10): 5,4 %, para
 * que el vertical llegue al 75 % de los píxeles del horizontal (1,2 = 0,75 × 16/10).
 */
export const ESCALA = {
  movil: escalaPara(INTENSIDAD),
  escritorio: escalaPara(INTENSIDAD * 1.2),
} as const;
/** Constantes de tiempo del suavizado, en segundos: seguir el gesto y volver al reposo. */
export const TAU_SEGUIR = 0.12;
export const TAU_VOLVER = 0.4;
/** El movimiento entra de forma gradual durante este tiempo tras activarse el efecto. */
export const ENTRADA_SEG = 0.6;
/**
 * Por debajo de esto (fracción del recorrido) se da por alcanzado el objetivo: con el
 * desplazamiento máximo son ~0,05 px, imperceptible, y se deja de dibujar antes.
 */
export const REPOSO = 0.005;
/** Límite del lienzo interno: densidad de píxeles y total de píxeles. */
export const DPR_MAX = 3;
export const PIXELES_MAX = 2_500_000;

export type Vec = { x: number; y: number };
/** Rectángulo en fracciones de la foto completa. */
export type Ventana = { x: number; y: number; ancho: number; alto: number };

const limitar = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/**
 * WebGL sin GPU (rasterizado por software): el primer cuadro bloqueaba el hilo principal
 * más de un segundo (Lighthouse, SwiftShader). Ahí se queda la foto.
 */
const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render/i;

export function esRenderizadorSoftware(renderizador: string): boolean {
  return SOFTWARE.test(renderizador);
}

/**
 * Acerca `actual` a `objetivo` con un suavizado exponencial por tiempo: el mismo
 * movimiento a 30, 60 o 120 Hz.
 */
export function acercar(
  actual: number,
  objetivo: number,
  dtSeg: number,
  tau: number,
): number {
  if (dtSeg <= 0) return actual;
  return objetivo + (actual - objetivo) * Math.exp(-dtSeg / tau);
}

/**
 * Desplazamiento máximo por eje (fracción de ese lado de la caja) con la ampliación
 * `escala`: horizontal INTENSIDAD; vertical, los mismos píxeles CSS (INTENSIDAD × ancho /
 * alto), los dos limitados por el margen para no descubrir bordes, también en diagonal
 * (los ejes son independientes).
 */
export function amplitud(
  anchoCss: number,
  altoCss: number,
  escala: number,
): Vec {
  if (anchoCss <= 0 || altoCss <= 0) return { x: 0, y: 0 };
  const limite = (escala - 1) / 2 / ALCANCE;
  return {
    x: Math.min(INTENSIDAD, limite),
    y: Math.min((INTENSIDAD * anchoCss) / altoCss, limite),
  };
}

/** Fracción del movimiento permitida `seg` segundos después de activarse (0 a 1, suave). */
export function entrada(seg: number): number {
  const t = limitar(seg / ENTRADA_SEG, 0, 1);
  return t * t * (3 - 2 * t);
}

/** Posición del cursor dentro del rectángulo, de −1 a 1 en cada eje (0 en el centro). */
export function objetivoCursor(
  x: number,
  y: number,
  rect: { left: number; top: number; width: number; height: number },
): Vec {
  if (rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 };
  return {
    x: limitar(((x - rect.left) / rect.width) * 2 - 1, -1, 1),
    y: limitar(((y - rect.top) / rect.height) * 2 - 1, -1, 1),
  };
}

/** Arrastre horizontal: medio ancho del contenedor recorre todo el efecto. */
export function objetivoArrastre(dx: number, ancho: number): number {
  if (ancho <= 0) return 0;
  return limitar(dx / (ancho / 2), -1, 1);
}

/** `object-position` calculado ("50% 80%") en fracciones; si no son porcentajes, centro. */
export function posicionObjeto(css: string): Vec {
  const [x, y] = css
    .trim()
    .split(/\s+/)
    .map((v) => (v.endsWith("%") ? Number.parseFloat(v) / 100 : Number.NaN));
  return {
    x: Number.isFinite(x) ? limitar(x, 0, 1) : 0.5,
    y: Number.isFinite(y) ? limitar(y, 0, 1) : 0.5,
  };
}

/**
 * Parte de la foto que muestra `object-fit: cover` con `object-position`, en fracciones
 * de la foto completa (antes de la ampliación del margen).
 */
export function ventanaCover(
  contW: number,
  contH: number,
  imgW: number,
  imgH: number,
  posicion: Vec = { x: 0.5, y: 0.5 },
): Ventana {
  const escala = Math.max(contW / imgW, contH / imgH);
  const ancho = contW / (imgW * escala);
  const alto = contH / (imgH * escala);
  return {
    x: (1 - ancho) * posicion.x,
    y: (1 - alto) * posicion.y,
    ancho,
    alto,
  };
}

/**
 * Tamaño interno del lienzo: el del contenedor por la densidad de píxeles, sin pasar de
 * DPR_MAX ni de PIXELES_MAX. Con DPR 3 el lienzo ya no se amplía en pantalla (antes, con
 * el límite en 2, se veía más blando que la foto).
 */
export function tamanoLienzo(
  cssW: number,
  cssH: number,
  dpr: number,
): { ancho: number; alto: number } {
  if (cssW <= 0 || cssH <= 0) return { ancho: 0, alto: 0 };
  let escala = limitar(dpr, 1, DPR_MAX);
  escala = Math.min(escala, Math.sqrt(PIXELES_MAX / (cssW * cssH)));
  return {
    ancho: Math.max(1, Math.round(cssW * escala)),
    alto: Math.max(1, Math.round(cssH * escala)),
  };
}

/**
 * Tamaño de la textura con la ventana de la foto: el lienzo por `escala`, con una
 * diferencia par en cada eje para que en reposo cada píxel caiga en el centro de un
 * texel (sin remuestrear: el lienzo coincide con la foto).
 */
export function tamanoTextura(
  lienzoAncho: number,
  lienzoAlto: number,
  escala: number,
): { ancho: number; alto: number } {
  const margen = (n: number) => 2 * Math.round((n * (escala - 1)) / 2);
  return {
    ancho: lienzoAncho + margen(lienzoAncho),
    alto: lienzoAlto + margen(lienzoAlto),
  };
}
