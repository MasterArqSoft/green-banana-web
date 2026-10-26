import {
  objetivoArrastre,
  objetivoCursor,
  posicionObjeto,
} from "@/lib/parallax";
import type { Capas } from "./HeroProfundidad";
import type { AlWorker, DelWorker, Tamano } from "./profundidad.worker";

// Efecto de profundidad del hero, lado del hilo principal. HeroProfundidad lo importa con
// import() después de la carga, así que no está en el JavaScript inicial. Crea el lienzo
// encima de la foto, le pasa el control a profundidad.worker.ts (OffscreenCanvas: WebGL
// fuera del hilo principal) y solo le envía tamaño, puntero y pausas. Sin OffscreenCanvas
// con WebGL, sin GPU, si alguna capa no carga o si se pierde el contexto llama a
// `alFallar` y se vuelve a la foto. Las capas (profundidad, fondo reconstruido y matte
// del producto) se generan en tools/profundidad/, nunca en el navegador.

// Encima de la foto, del mismo tamaño (el contenedor recorta las esquinas). Queda oculto
// hasta el primer cuadro en movimiento, y desde ahí se queda: al activarse el efecto la
// foto no cambia. El navegador pinta el <img> ajustado a píxeles enteros con su propio
// filtro (en Chrome, 1148 × 716 px de dispositivo para un layout de 1146,75 × 716,72),
// así que el lienzo en reposo no coincide con él en los contornos (hasta ~0,6 px y un
// 1–3 % menos de contraste de borde); mostrarlo en reposo se veía como un cambio de
// nitidez al cargar. Al empezar el gesto la diferencia queda dentro del movimiento.
// Sin fundido: mezclaba dos remuestreos de la misma foto y no aportaba nada.
const CLASE_LIENZO = "pointer-events-none invisible absolute inset-0 size-full";

export type Efecto = { destruir: () => void };

export function crearEfecto({
  contenedor,
  foto,
  capas,
  alActivar,
  alFallar,
}: {
  contenedor: HTMLElement;
  foto: HTMLImageElement;
  capas: Capas;
  alActivar: () => void;
  alFallar: () => void;
}): Efecto {
  let destruido = false;
  // Un solo abort() quita todos los listeners; el resto de la limpieza va en la lista.
  const eventos = new AbortController();
  const opciones = { signal: eventos.signal };
  const limpiezas: (() => void)[] = [];
  let worker: Worker | null = null;

  const destruir = () => {
    if (destruido) return;
    destruido = true;
    eventos.abort();
    // terminate() libera el contexto WebGL y la GPU del worker.
    worker?.terminate();
    for (const limpiar of limpiezas.splice(0)) limpiar();
  };
  const fallar = () => {
    if (destruido) return;
    destruir();
    alFallar();
  };

  const lienzo = document.createElement("canvas");
  if (
    typeof lienzo.transferControlToOffscreen !== "function" ||
    typeof createImageBitmap !== "function"
  ) {
    queueMicrotask(fallar);
    return { destruir };
  }
  lienzo.className = CLASE_LIENZO;
  lienzo.setAttribute("aria-hidden", "true");
  contenedor.append(lienzo);
  limpiezas.push(() => lienzo.remove());

  const enviar = (m: AlWorker, transferir: Transferable[] = []) =>
    worker?.postMessage(m, transferir);
  const tamano = (): Tamano => {
    const caja = contenedor.getBoundingClientRect();
    // La caja visible (el contenedor); la foto la desborda por el margen (escala).
    return {
      anchoCss: contenedor.clientWidth,
      altoCss: contenedor.clientHeight,
      dpr: window.devicePixelRatio || 1,
      posicion: posicionObjeto(getComputedStyle(foto).objectPosition),
      // La ampliación real del layout (cambia con el breakpoint): así el lienzo no puede
      // desincronizarse de la foto. Con getBoundingClientRect y no offsetWidth, que
      // redondea a píxeles enteros (573 frente a 573,375 px: la textura quedaba algo más
      // chica que la foto y los contornos no coincidían al activarse).
      escala: foto.getBoundingClientRect().width / Math.max(1, caja.width),
      // Posición en el documento (no cambia con el scroll): Chrome coloca el lienzo en el
      // píxel CSS redondeado y la foto en la posición exacta (medio píxel de diferencia
      // con el hero en y = 567,5 px, revisión del 2026-10-25).
      desfase: {
        x: Math.round(caja.left + scrollX) - (caja.left + scrollX),
        y: Math.round(caja.top + scrollY) - (caja.top + scrollY),
      },
    };
  };

  // Se anima solo con el hero en pantalla y la pestaña visible.
  let enPantalla = true;
  const visible = () => enPantalla && document.visibilityState === "visible";
  const apuntar = (x: number, y: number) => {
    if (visible()) enviar({ tipo: "objetivo", x, y });
  };
  const pausar = () => enviar({ tipo: "pausar" });

  // Puntero: el ratón (y el lápiz) mueven con su posición; el dedo, arrastrando en
  // horizontal. touch-action: pan-y deja al navegador el scroll vertical y el zoom.
  let dedo: { id: number; x0: number } | null = null;
  contenedor.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType === "touch") {
        if (dedo?.id === e.pointerId)
          apuntar(
            objetivoArrastre(e.clientX - dedo.x0, contenedor.clientWidth),
            0,
          );
        return;
      }
      const p = objetivoCursor(
        e.clientX,
        e.clientY,
        contenedor.getBoundingClientRect(),
      );
      apuntar(p.x, p.y);
    },
    opciones,
  );
  contenedor.addEventListener(
    "pointerdown",
    (e) => {
      if (e.pointerType === "touch" && e.isPrimary)
        dedo = { id: e.pointerId, x0: e.clientX };
    },
    opciones,
  );
  const soltar = (e: PointerEvent) => {
    if (e.pointerType === "touch" && dedo?.id !== e.pointerId) return;
    dedo = null;
    apuntar(0, 0);
  };
  contenedor.addEventListener("pointerup", soltar, opciones);
  contenedor.addEventListener("pointercancel", soltar, opciones);
  contenedor.addEventListener("pointerleave", soltar, opciones);

  const vista = new IntersectionObserver(([entrada]) => {
    enPantalla = entrada.isIntersecting;
    if (!enPantalla) pausar();
  });
  vista.observe(contenedor);
  limpiezas.push(() => vista.disconnect());
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.visibilityState !== "visible") pausar();
    },
    opciones,
  );

  contenedor.style.touchAction = "pan-y pinch-zoom";
  limpiezas.push(() => {
    contenedor.style.touchAction = "";
    delete contenedor.dataset.parallax;
  });

  // La foto ya está decodificada (la muestra el <img>); las capas se piden aparte. Todas
  // viajan al worker como ImageBitmap, sin copiar.
  const cargar = (url: string, datos: boolean) => {
    const imagen = new Image();
    imagen.decoding = "async";
    imagen.src = url;
    return imagen.decode().then(() =>
      // El mapa y el matte son datos: sin conversión de color. El fondo es una foto,
      // con el mismo trato que la foto para que sus colores casen.
      createImageBitmap(
        imagen,
        datos ? { colorSpaceConversion: "none", premultiplyAlpha: "none" } : {},
      ),
    );
  };
  Promise.all([
    foto.decode().then(() => createImageBitmap(foto)),
    cargar(capas.profundidad, true),
    cargar(capas.fondo, false),
    cargar(capas.alfa, true),
  ])
    .then(([bitmapFoto, bitmapMapa, bitmapFondo, bitmapAlfa]) => {
      if (destruido) return;
      worker = new Worker(new URL("./profundidad.worker.ts", import.meta.url), {
        type: "module",
      });
      worker.addEventListener("error", fallar, opciones);
      worker.addEventListener(
        "message",
        ({ data }: MessageEvent<DelWorker>) => {
          if (data.tipo === "fallo") fallar();
          else if (data.tipo === "estado") {
            contenedor.dataset.parallax = data.parallax;
            if (data.parallax === "movimiento")
              lienzo.classList.remove("invisible");
          } else if (data.tipo === "listo") alActivar();
        },
        opciones,
      );
      const offscreen = lienzo.transferControlToOffscreen();
      enviar(
        {
          tipo: "iniciar",
          lienzo: offscreen,
          foto: bitmapFoto,
          mapa: bitmapMapa,
          fondo: bitmapFondo,
          alfa: bitmapAlfa,
          tamano: tamano(),
        },
        [offscreen, bitmapFoto, bitmapMapa, bitmapFondo, bitmapAlfa],
      );
      const cambio = new ResizeObserver(() =>
        enviar({ tipo: "tamano", tamano: tamano() }),
      );
      cambio.observe(contenedor);
      limpiezas.push(() => cambio.disconnect());
    })
    .catch(fallar);

  return { destruir };
}
