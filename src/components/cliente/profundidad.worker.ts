import {
  acercar,
  entrada,
  ENTRADA_SEG,
  amplitud,
  esRenderizadorSoftware,
  FOCO,
  REPOSO,
  tamanoLienzo,
  tamanoTextura,
  TAU_SEGUIR,
  TAU_VOLVER,
  ventanaCover,
  type Vec,
  type Ventana,
} from "@/lib/parallax";

// Worker del efecto de profundidad del hero: todo el trabajo de WebGL (crear el
// contexto, compilar, subir texturas y dibujar) ocurre aquí, sobre el OffscreenCanvas
// que le transfiere profundidad-webgl.ts. Crear el contexto en frío tardaba ~170 ms en
// el hilo principal (Lighthouse lo medía como más de 1 s de bloqueo); aquí no bloquea la
// página. Solo dibuja mientras hay movimiento; en reposo el lienzo coincide con la foto.

/** Mensajes del hilo principal al worker. */
export type AlWorker =
  | {
      tipo: "iniciar";
      lienzo: OffscreenCanvas;
      foto: ImageBitmap;
      /** R = profundidad del fondo, G = del producto (blanco = cerca). */
      mapa: ImageBitmap;
      /** La mesa y el fondo reconstruidos detrás del producto. */
      fondo: ImageBitmap;
      /** R = opacidad del producto, G = dónde se usa `fondo`. */
      alfa: ImageBitmap;
      tamano: Tamano;
    }
  | { tipo: "tamano"; tamano: Tamano }
  | { tipo: "objetivo"; x: number; y: number }
  | { tipo: "pausar" };

/** Mensajes del worker al hilo principal. */
export type DelWorker =
  | { tipo: "listo" }
  | { tipo: "estado"; parallax: "reposo" | "movimiento" }
  /** `motivo`: por qué no se activó (diagnóstico; queda en data-motivo). */
  | { tipo: "fallo"; motivo: string };

/** Caja de la foto en CSS, densidad de píxeles y object-position (fracciones). */
export type Tamano = {
  anchoCss: number;
  altoCss: number;
  dpr: number;
  posicion: Vec;
  /** Ampliación real de la foto frente a la caja (margen del desplazamiento). */
  escala: number;
  /**
   * Fracción de píxel CSS entre la posición del contenedor y la que el navegador da al
   * lienzo (lo coloca en un píxel entero; la foto se pinta en la posición fraccionaria).
   */
  desfase: Vec;
};

const VERTICES = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// Dos capas: el producto y, detrás, la mesa y el fondo (tools/profundidad/capas.py).
// Cada una se desplaza con su profundidad (pf y pb: de dónde se toma cada píxel). El
// fondo que el producto destapa sale de la reconstrucción (u_fondo), no de estirar el
// borde. Composición con la ecuación del matte, a partir de la foto:
//   color = foto(pf) + (1 − α(pf)) · (fondo(pb) − fondo(pf))
// con fondo(p) = la foto, o la reconstrucción donde la tapaba el producto (u_alfa.g).
// En reposo pf = pb y el resultado es la foto exacta; al moverse, el borde del producto
// cambia el fondo que tenía mezclado (fondo(pf)) por el nuevo (fondo(pb)): no arrastra
// colores del fondo original ni del tallo. La foto y la opacidad se muestrean con
// Catmull-Rom: en reposo cada píxel cae en el centro de un texel y al moverse no se
// ablandan. Las texturas de foto, fondo y matte son la parte visible (cover) ampliada
// por el margen, a la misma escala.
const FRAGMENTOS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D u_foto;
uniform sampler2D u_mapa;
uniform sampler2D u_fondo;
uniform sampler2D u_alfa;
uniform vec2 u_desplazamiento;
uniform vec2 u_escala;
uniform vec4 u_ventana;
uniform vec2 u_texeles;
uniform vec2 u_subpixel;
uniform float u_foco;
varying vec2 v_uv;

vec3 catmullRom(sampler2D tex, vec2 uv) {
  vec2 pos = uv * u_texeles;
  vec2 c = floor(pos - 0.5) + 0.5;
  vec2 f = pos - c;
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));
  vec2 w3 = f * f * (-0.5 + 0.5 * f);
  vec2 w12 = w1 + w2;
  vec2 t0 = (c - 1.0) / u_texeles;
  vec2 t3 = (c + 2.0) / u_texeles;
  vec2 t12 = (c + w2 / w12) / u_texeles;
  vec3 r = texture2D(tex, vec2(t0.x, t0.y)).rgb * w0.x * w0.y
    + texture2D(tex, vec2(t12.x, t0.y)).rgb * w12.x * w0.y
    + texture2D(tex, vec2(t3.x, t0.y)).rgb * w3.x * w0.y
    + texture2D(tex, vec2(t0.x, t12.y)).rgb * w0.x * w12.y
    + texture2D(tex, vec2(t12.x, t12.y)).rgb * w12.x * w12.y
    + texture2D(tex, vec2(t3.x, t12.y)).rgb * w3.x * w12.y
    + texture2D(tex, vec2(t0.x, t3.y)).rgb * w0.x * w3.y
    + texture2D(tex, vec2(t12.x, t3.y)).rgb * w12.x * w3.y
    + texture2D(tex, vec2(t3.x, t3.y)).rgb * w3.x * w3.y;
  return clamp(r, 0.0, 1.0);
}

// La foto, o el fondo reconstruido donde el producto la tapaba. Se evalúa igual en pf y
// en pb: en reposo los dos términos se anulan exactamente.
vec3 fondo(vec2 p, vec3 foto) {
  return mix(foto, texture2D(u_fondo, p).rgb, texture2D(u_alfa, p).g);
}

void main() {
  // q: coordenada en la textura (ventana ampliada); el lienzo ve su centro 1/escala.
  vec2 q = 0.5 + (v_uv + u_subpixel - 0.5) / u_escala;
  vec2 h = texture2D(u_mapa, u_ventana.xy + q * u_ventana.zw).rg;
  vec2 k = u_desplazamiento / u_escala;
  vec2 pb = q - k * (h.r - u_foco);
  vec2 pf = q - k * (h.g - u_foco);
  vec3 fotoF = catmullRom(u_foto, pf);
  float alfa = catmullRom(u_alfa, pf).r;
  vec3 color = fotoF
    + (1.0 - alfa) * (fondo(pb, catmullRom(u_foto, pb)) - fondo(pf, fotoF));
  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`;

const ambito = self as unknown as {
  onmessage: ((e: MessageEvent<AlWorker>) => void) | null;
  postMessage: (m: DelWorker) => void;
  requestAnimationFrame?: (fn: (t: number) => void) => number;
};
const enviar = (m: DelWorker) => ambito.postMessage(m);
// requestAnimationFrame existe en workers con OffscreenCanvas; si no, ~60 Hz.
const pedirCuadro = (fn: (t: number) => void) =>
  ambito.requestAnimationFrame
    ? ambito.requestAnimationFrame(fn)
    : setTimeout(() => fn(performance.now()), 16);

type Escena = {
  gl: WebGLRenderingContext;
  lienzo: OffscreenCanvas;
  // Foto, fondo reconstruido y matte: se recortan a la ventana visible juntos.
  imagenes: [ImageBitmap, ImageBitmap, ImageBitmap];
  texturas: [WebGLTexture, WebGLTexture, WebGLTexture];
  u: Record<
    "desplazamiento" | "escala" | "ventana" | "texeles" | "subpixel",
    WebGLUniformLocation | null
  >;
};

let escena: Escena | null = null;
let tamano: Tamano = {
  anchoCss: 0,
  altoCss: 0,
  dpr: 1,
  posicion: { x: 0.5, y: 0.5 },
  escala: 1,
  desfase: { x: 0, y: 0 },
};
// Clave de la textura subida (tamaño y ventana): solo se vuelve a subir si cambia.
let subida = "";
const objetivo: Vec = { x: 0, y: 0 };
const actual: Vec = { x: 0, y: 0 };
let animando = false;
let ultimo = 0;
// Momento de la activación: el movimiento entra de forma gradual (entrada()), así que
// si el cursor ya estaba sobre la foto no salta.
let inicio = 0;
let estado: "reposo" | "movimiento" = "reposo";
let fallado = false;

const segundosDesdeInicio = () =>
  inicio ? (performance.now() - inicio) / 1000 : 0;

function fallar(motivo: string) {
  if (fallado) return;
  fallado = true;
  escena = null;
  enviar({ tipo: "fallo", motivo: motivo.slice(0, 200) });
}

ambito.onmessage = ({ data }) => {
  if (fallado) return;
  try {
    if (data.tipo === "iniciar") iniciar(data);
    else if (data.tipo === "tamano") {
      tamano = data.tamano;
      ajustar();
    } else if (data.tipo === "objetivo") {
      objetivo.x = data.x;
      objetivo.y = data.y;
      animar();
    } else if (data.tipo === "pausar") {
      objetivo.x = objetivo.y = actual.x = actual.y = 0;
      animando = false;
      ultimo = 0;
      dibujar();
      avisar("reposo");
    }
  } catch (e) {
    fallar(`excepción: ${e instanceof Error ? e.message : String(e)}`);
  }
};

function iniciar(m: Extract<AlWorker, { tipo: "iniciar" }>) {
  const gl = m.lienzo.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    premultipliedAlpha: false,
    powerPreference: "low-power",
  });
  if (!gl) return fallar("sin WebGL en OffscreenCanvas");
  if (esRenderizadorSoftware(renderizador(gl)))
    return fallar(`renderizador por software: ${renderizador(gl)}`);
  m.lienzo.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    fallar("contexto perdido");
  });
  const programa = compilar(gl);
  if (typeof programa === "string") return fallar(programa);
  const u = (nombre: string) => gl.getUniformLocation(programa, nombre);
  gl.uniform1f(u("u_foco"), FOCO);
  gl.uniform1i(u("u_foto"), 0);
  gl.uniform1i(u("u_mapa"), 1);
  gl.uniform1i(u("u_fondo"), 2);
  gl.uniform1i(u("u_alfa"), 3);
  // Dos triángulos que cubren el lienzo.
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const aPos = gl.getAttribLocation(programa, "a_pos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  // El mapa es un dato: sin conversión de color al subirlo.
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  subir(gl, gl.TEXTURE1, crearTextura(gl, gl.TEXTURE1), m.mapa);
  gl.pixelStorei(
    gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,
    gl.BROWSER_DEFAULT_WEBGL,
  );
  m.mapa.close();
  escena = {
    gl,
    lienzo: m.lienzo,
    imagenes: [m.foto, m.fondo, m.alfa],
    texturas: [
      crearTextura(gl, gl.TEXTURE0),
      crearTextura(gl, gl.TEXTURE2),
      crearTextura(gl, gl.TEXTURE3),
    ],
    u: {
      desplazamiento: u("u_desplazamiento"),
      escala: u("u_escala"),
      ventana: u("u_ventana"),
      texeles: u("u_texeles"),
      subpixel: u("u_subpixel"),
    },
  };
  tamano = m.tamano;
  ajustar();
  avisar("reposo", true);
  // Se muestra después de entregar el primer cuadro, que ya es el reposo.
  pedirCuadro(() => {
    if (!escena) return;
    inicio = performance.now();
    enviar({ tipo: "listo" });
  });
}

function ajustar() {
  if (!escena) return;
  const { gl, lienzo, imagenes, texturas, u } = escena;
  const foto = imagenes[0];
  const { ancho, alto } = tamanoLienzo(
    tamano.anchoCss,
    tamano.altoCss,
    tamano.dpr,
  );
  if (!ancho || !alto) return;
  if (lienzo.width !== ancho || lienzo.height !== alto) {
    lienzo.width = ancho;
    lienzo.height = alto;
  }
  gl.viewport(0, 0, ancho, alto);
  const ventana = ventanaCover(
    tamano.anchoCss,
    tamano.altoCss,
    foto.width,
    foto.height,
    tamano.posicion,
  );
  const textura = tamanoTextura(ancho, alto, tamano.escala);
  const clave = `${textura.ancho}x${textura.alto}@${ventana.x},${ventana.y}`;
  if (clave !== subida) {
    subida = clave;
    const unidades = [gl.TEXTURE0, gl.TEXTURE2, gl.TEXTURE3];
    imagenes.forEach((imagen, i) => {
      // El matte es un dato: sin conversión de color al subirlo.
      if (i === 2)
        gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
      subir(
        gl,
        unidades[i],
        texturas[i],
        recortar(imagen, ventana, { ancho, alto }, textura),
      );
      if (i === 2)
        gl.pixelStorei(
          gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,
          gl.BROWSER_DEFAULT_WEBGL,
        );
    });
  }
  gl.uniform2f(u.escala, textura.ancho / ancho, textura.alto / alto);
  gl.uniform2f(u.texeles, textura.ancho, textura.alto);
  gl.uniform2f(
    u.subpixel,
    tamano.desfase.x / tamano.anchoCss,
    tamano.desfase.y / tamano.altoCss,
  );
  gl.uniform4f(u.ventana, ventana.x, ventana.y, ventana.ancho, ventana.alto);
  dibujar();
}

function dibujar() {
  if (!escena) return;
  const { gl, u } = escena;
  // Amplitud por eje en fracción de cada lado (el vertical, en los mismos píxeles CSS
  // que el horizontal hasta el límite del margen).
  const max = amplitud(tamano.anchoCss, tamano.altoCss, tamano.escala);
  const fuerza = entrada(segundosDesdeInicio());
  // Cursor a la derecha (o abajo) = cámara a la derecha (o abajo): el fondo acompaña al
  // cursor y lo cercano (el producto y la mesa en primer plano) va al revés.
  gl.uniform2f(
    u.desplazamiento,
    -actual.x * max.x * fuerza,
    -actual.y * max.y * fuerza,
  );
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function animar() {
  if (animando || !escena) return;
  animando = true;
  pedirCuadro(paso);
}

function paso(ahora: number) {
  if (!animando || !escena) return;
  const dt = ultimo ? Math.min((ahora - ultimo) / 1000, 0.1) : 1 / 60;
  ultimo = ahora;
  const alReposo = objetivo.x === 0 && objetivo.y === 0;
  const tau = alReposo ? TAU_VOLVER : TAU_SEGUIR;
  actual.x = acercar(actual.x, objetivo.x, dt, tau);
  actual.y = acercar(actual.y, objetivo.y, dt, tau);
  const quieto =
    Math.abs(actual.x - objetivo.x) < REPOSO &&
    Math.abs(actual.y - objetivo.y) < REPOSO;
  if (quieto) {
    actual.x = objetivo.x;
    actual.y = objetivo.y;
  }
  dibujar();
  avisar(quieto && alReposo ? "reposo" : "movimiento");
  // Mientras el movimiento entra se sigue dibujando aunque el objetivo no cambie.
  const entrando = !alReposo && segundosDesdeInicio() < ENTRADA_SEG;
  if (quieto && !entrando) {
    animando = false;
    ultimo = 0;
  } else pedirCuadro(paso);
}

// Solo avisa los cambios: el hilo principal lo refleja en data-parallax.
function avisar(nuevo: "reposo" | "movimiento", siempre = false) {
  if (nuevo === estado && !siempre) return;
  estado = nuevo;
  enviar({ tipo: "estado", parallax: nuevo });
}

// Nombre del renderizador; sin la extensión (algunos navegadores la ocultan), el genérico.
function renderizador(gl: WebGLRenderingContext): string {
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  return String(
    gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? "",
  );
}

// El programa, o el motivo del error (con el registro del compilador).
function compilar(gl: WebGLRenderingContext): WebGLProgram | string {
  const programa = gl.createProgram();
  for (const [tipo, fuente] of [
    [gl.VERTEX_SHADER, VERTICES],
    [gl.FRAGMENT_SHADER, FRAGMENTOS],
  ] as const) {
    const shader = gl.createShader(tipo);
    if (!shader) return "sin shader";
    gl.shaderSource(shader, fuente);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      return `shader: ${gl.getShaderInfoLog(shader) ?? ""}`;
    gl.attachShader(programa, shader);
  }
  gl.linkProgram(programa);
  if (!gl.getProgramParameter(programa, gl.LINK_STATUS))
    return `programa: ${gl.getProgramInfoLog(programa) ?? ""}`;
  gl.useProgram(programa);
  return programa;
}

// La parte de la foto que se ve (cover) con el escalado de calidad del navegador,
// dibujada exactamente a lienzo × escala (como el <img>) y centrada en una textura de
// margen par: en reposo cada píxel cae en el centro de un texel y coincide con la foto.
function recortar(
  foto: ImageBitmap,
  ventana: Ventana,
  lienzo: { ancho: number; alto: number },
  textura: { ancho: number; alto: number },
): OffscreenCanvas {
  const copia = new OffscreenCanvas(textura.ancho, textura.alto);
  const ctx = copia.getContext("2d");
  if (!ctx) throw new Error("sin contexto 2D");
  ctx.imageSmoothingQuality = "high";
  const origen = [
    ventana.x * foto.width,
    ventana.y * foto.height,
    ventana.ancho * foto.width,
    ventana.alto * foto.height,
  ] as const;
  // Primero toda la textura (cubre la franja de menos de un texel del borde), después
  // la ventana a su escala exacta.
  ctx.drawImage(foto, ...origen, 0, 0, textura.ancho, textura.alto);
  const ancho = lienzo.ancho * tamano.escala;
  const alto = lienzo.alto * tamano.escala;
  ctx.drawImage(
    foto,
    ...origen,
    (textura.ancho - ancho) / 2,
    (textura.alto - alto) / 2,
    ancho,
    alto,
  );
  return copia;
}

// Cada textura se crea en su unidad: bindTexture actúa sobre la unidad activa, y crear la
// de la foto con la del mapa activa reemplazaba el mapa por la foto (el desplazamiento
// seguía el brillo de cada píxel: deformación y bordes dentados, revisión del 2026-10-25).
function crearTextura(gl: WebGLRenderingContext, unidad: number): WebGLTexture {
  const tex = gl.createTexture();
  gl.activeTexture(unidad);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  // Texturas de cualquier tamaño en WebGL 1: sin mipmaps ni repetición.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return tex;
}

function subir(
  gl: WebGLRenderingContext,
  unidad: number,
  tex: WebGLTexture,
  imagen: TexImageSource,
) {
  gl.activeTexture(unidad);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imagen);
}
