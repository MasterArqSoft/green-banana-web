"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Map as LeafletMap, TileLayer } from "leaflet";
import type { Fincas, MapaTextos, Ubicacion } from "@/lib/schema";
import { claveTesela, saludVista, type EstadoTesela } from "@/lib/salud-mapa";
import { fill } from "@/lib/template";

// Segundo componente cliente (spec/03-plan.md D6). Nunca importa @/lib/content: los
// datos y los textos llegan por props desde MapaFincas. Leaflet y su CSS se importan
// solo al pulsar "Ver mapa" (AC-15), así que no están en la carga inicial. Si la
// carga falla, la lista de fincas del componente de servidor sigue disponible.
// Antes del clic se ve el mapa ilustrado (`previa`, /mapa-fincas.svg servido por el
// propio sitio, sin terceros) y una tarjeta con el aviso (`aviso`, renderizado en el
// servidor) y el botón (AC-19).

type Estado = "idle" | "loading" | "ready" | "error";

const TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
// Tiempo máximo desde que se pide una tesela sin que termine el lote, antes de evaluar la
// vista con lo que haya llegado: lo pendiente cuenta como fallido (Fase 9, T-79).
const ESPERA_TESELAS_MS = 15_000;

export function MapaFincasInteractivo({
  avisoId,
  aviso,
  previa,
  fincas,
  centro,
  zoom,
  textos,
}: {
  avisoId: string;
  aviso: ReactNode;
  previa: { escritorio: string; movil: string; ancho: number; alto: number };
  fincas: Ubicacion[];
  centro: Fincas["centro"];
  zoom: number;
  textos: MapaTextos;
}) {
  const [estado, setEstado] = useState<Estado>("idle");
  const [intento, setIntento] = useState(0);
  // Con el mapa listo, si faltan teselas en la vista se muestra un aviso discreto (H-03).
  const [parcial, setParcial] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<LeafletMap | null>(null);
  const capa = useRef<TileLayer | null>(null);
  const montado = useRef(true);
  const region = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const espera = useRef<ReturnType<typeof setTimeout> | null>(null);
  // El mapa ilustrado se pide solo cuando la sección se acerca a la pantalla: con
  // loading="lazy", Chrome lo descargaba en la carga inicial y competía con el LCP.
  const [cercano, setCercano] = useState(false);

  useEffect(() => {
    const elemento = region.current;
    if (!elemento) return;
    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setCercano(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(elemento);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
      if (espera.current) clearTimeout(espera.current);
      mapa.current?.remove();
      mapa.current = null;
    };
  }, []);

  function cancelarEspera() {
    if (espera.current) clearTimeout(espera.current);
    espera.current = null;
  }

  // Tras un error, el foco pasa a "Reintentar": el botón anterior ya no existe.
  useEffect(() => {
    if (estado === "error") boton.current?.focus();
  }, [estado]);

  // Error: se destruye la instancia (un reintento la crea de nuevo en el mismo
  // contenedor) y vuelven el mapa ilustrado, el aviso y "Reintentar" (H-04, T-69).
  // remove() no quita las clases que Leaflet agregó al contenedor (fondo gris): un
  // `key` nuevo hace que React lo reemplace por un nodo limpio.
  function fallar() {
    cancelarEspera();
    mapa.current?.remove();
    mapa.current = null;
    capa.current = null;
    if (!montado.current) return;
    setIntento((n) => n + 1);
    setParcial(false);
    setEstado("error");
  }

  // "Reintentar" del aviso parcial: vuelve a pedir las teselas sin destruir el mapa ni
  // los marcadores. Nunca se reintenta solo, para no generar peticiones en bucle.
  function recargarTeselas() {
    setParcial(false);
    contenedor.current?.focus();
    capa.current?.redraw();
  }

  async function cargarMapa() {
    setEstado("loading");
    setParcial(false);
    cancelarEspera();
    mapa.current?.remove();
    mapa.current = null;
    capa.current = null;
    try {
      const [{ default: L }] = await Promise.all([
        import("leaflet"),
        import("leaflet/dist/leaflet.css"),
      ]);
      if (!montado.current || !contenedor.current || mapa.current) return;

      const map = L.map(contenedor.current, {
        scrollWheelZoom: false,
        zoomControl: false,
        attributionControl: false,
      });
      mapa.current = map;
      L.control
        .zoom({ zoomInTitle: textos.zoomIn, zoomOutTitle: textos.zoomOut })
        .addTo(map);
      // Atribución siempre visible y sin el prefijo de Leaflet (AC-18).
      L.control.attribution({ prefix: false }).addTo(map);
      // Salud de la vista actual (MAP-01, MAP-02, T-79). Se registra el estado de cada
      // tesela con los eventos públicos de Leaflet y, al terminar cada lote ("load", que
      // llega también si fallaron) o al vencer la espera, saludVista() (src/lib/) mira
      // solo las teselas de la vista y del zoom actuales. Un contador acumulado no sirve:
      // una tesela correcta al principio ocultaba que después fallaran todas. Sin
      // ninguna válida en la vista, pasa a error; con algunas, el mapa queda usable con
      // un aviso.
      const teselas = new Map<string, EstadoTesela>();
      const layer = L.tileLayer(TILES, {
        maxZoom: 19,
        attribution: textos.attribution,
      });
      capa.current = layer;

      // Mientras el mapa se mueve (desplazamiento o animación de zoom) la vista no está
      // asentada y destruirlo lanza un TypeError de Leaflet (`_leaflet_pos`): la
      // evaluación se aplaza hasta "moveend".
      let moviendo = false;
      let aplazada = false;
      map
        .on("movestart", () => (moviendo = true))
        .on("moveend", () => {
          moviendo = false;
          if (aplazada) {
            aplazada = false;
            setTimeout(evaluar, 0);
          }
        });

      function evaluar() {
        if (mapa.current !== map) return;
        // La espera queda libre: la próxima tesela pedida arranca otra.
        cancelarEspera();
        if (moviendo) {
          aplazada = true;
          return;
        }
        const salud = saludVista(
          teselas,
          Math.round(map.getZoom()),
          map.getPixelBounds(),
          layer.getTileSize(),
        );
        if (salud === "sin-mapa") {
          fallar();
          return;
        }
        setParcial(salud === "parcial");
        setEstado("ready");
      }

      layer
        // Cada tesela pedida arranca la espera si no hay una en curso. No se usa el
        // evento "loading": Leaflet solo lo emite si el lote anterior terminó, y tras un
        // lote colgado y "Reintentar" (redraw) no llegaba, así que no había espera.
        .on("tileloadstart", (e) => {
          teselas.set(claveTesela(e.coords), "pendiente");
          espera.current ??= setTimeout(evaluar, ESPERA_TESELAS_MS);
        })
        .on("tileload", (e) => teselas.set(claveTesela(e.coords), "ok"))
        .on("tileerror", (e) => teselas.set(claveTesela(e.coords), "error"))
        .on("tileunload", (e) => teselas.delete(claveTesela(e.coords)))
        // Leaflet descarta sin "tileunload" las teselas de otro zoom que aún cargaban.
        .on("tileabort", (e) => teselas.delete(claveTesela(e.coords)))
        // La evaluación espera a que Leaflet termine su evento: si destruye el mapa al
        // volver de "load", Leaflet todavía lo usa y lanza un TypeError.
        .on("load", () => {
          cancelarEspera();
          setTimeout(evaluar, 0);
        })
        .addTo(map);

      // Leaflet escribe "Close popup" en el botón de cierre; se reemplaza por copy.json.
      map.on("popupopen", (event) => {
        event.popup
          .getElement()
          ?.querySelector(".leaflet-popup-close-button")
          ?.setAttribute("aria-label", textos.closePopup);
      });

      for (const finca of fincas) {
        // El popup se arma con textContent: ningún dato pasa por innerHTML.
        const popup = document.createElement("div");
        const nombre = document.createElement("strong");
        nombre.textContent = finca.nombre;
        const detalle = document.createElement("span");
        detalle.textContent =
          finca.tipo === "acopio"
            ? fill(textos.acopioDetail, { municipio: finca.municipio })
            : finca.municipio;
        popup.append(nombre, document.createElement("br"), detalle);

        L.marker([finca.lat, finca.lng], {
          title: finca.nombre,
          icon: L.divIcon({
            className:
              finca.tipo === "acopio" ? "marcador-acopio" : "marcador-finca",
            iconSize: [18, 18],
          }),
        })
          .bindPopup(popup)
          .addTo(map);
      }

      if (fincas.length > 0) {
        // Margen de 20 px: con 32 px el mapa móvil (320 px de alto) baja a zoom 8 y los
        // marcadores de Aracataca y Fundación se superponen (WCAG 2.5.8).
        map.fitBounds(
          L.latLngBounds(fincas.map((finca) => [finca.lat, finca.lng])),
          { padding: [20, 20] },
        );
      } else {
        map.setView([centro.lat, centro.lng], zoom);
      }
      // "ready" llega con la primera evaluación de teselas, no al crear el mapa: hasta
      // entonces siguen el mapa ilustrado y "Cargando mapa…". Si ningún lote llegó a
      // empezar, la espera evalúa igual. El botón desaparece: el foco pasa al mapa.
      espera.current ??= setTimeout(evaluar, ESPERA_TESELAS_MS);
      contenedor.current.focus();
    } catch {
      fallar();
    }
  }

  const listo = estado === "ready";
  return (
    // Altura reservada desde el primer render para no mover la página (CLS). En
    // escritorio toma la altura de la lista (celda de la grilla) con un mínimo.
    // En móvil: mapa ilustrado arriba y aviso en un panel abajo, sin taparlo.
    // isolate: los paneles de Leaflet no tapan la barra superior fija.
    <div
      ref={region}
      role="region"
      aria-label={textos.title}
      className="relative isolate h-[33rem] w-full overflow-hidden rounded-card bg-hoja-claro shadow-suave md:h-full md:min-h-[28rem]"
    >
      {/* z-0 encierra los paneles de Leaflet (z-index 400 a 1000): el mapa ilustrado y
          los avisos, que van después, quedan encima mientras carga o si falta algo. */}
      <div key={intento} ref={contenedor} className="relative z-0 size-full" />
      {!listo && (
        <>
          {/* Mapa ilustrado de la zona (decorativo: la lista y el aviso llevan la
              información). Se pide al acercarse a la sección; no cuenta en el peso inicial. En móvil,
              una versión recortada a las fincas con símbolos más grandes. */}
          {cercano && (
            <picture>
              <source media="(max-width: 767px)" srcSet={previa.movil} />
              <img
                src={previa.escritorio}
                alt=""
                width={previa.ancho}
                height={previa.alto}
                loading="lazy"
                decoding="async"
                className="absolute inset-x-0 top-0 h-[21rem] w-full object-cover md:inset-0 md:h-full md:object-[62%_50%]"
              />
            </picture>
          )}
          <p className="absolute top-[19.6rem] right-2 rounded bg-white/85 px-1.5 text-xs md:top-2">
            {textos.attribution}
          </p>
        </>
      )}

      {/* Un solo panel, siempre montado, para que el lector de pantalla anuncie cada
          cambio del estado: antes de "Ver mapa" y tras un error, el aviso (AC-19) con el
          botón; con el mapa listo, oculto, o un aviso discreto abajo a la izquierda si
          faltan teselas (H-03, T-79), sin tapar el zoom ni la atribución. En escritorio, tarjeta compacta abajo a la izquierda. */}
      <div
        className={
          !listo
            ? "absolute inset-x-0 bottom-0 flex flex-col gap-2 border-t border-hoja/10 bg-white p-4 md:inset-x-auto md:bottom-5 md:left-5 md:max-w-xs md:rounded-card md:border-0 md:bg-white/90 md:shadow-suave md:backdrop-blur-sm"
            : parcial
              ? "absolute inset-x-2 bottom-7 flex items-center gap-3 rounded-card bg-white/95 px-3 py-2 shadow-suave md:right-auto md:bottom-2"
              : "sr-only"
        }
      >
        {!listo && aviso}
        {(estado === "idle" || estado === "error") && (
          <button
            ref={boton}
            type="button"
            onClick={cargarMapa}
            aria-describedby={avisoId}
            className="inline-flex min-h-11 items-center justify-center rounded-control bg-hoja px-5 font-semibold text-white"
          >
            {estado === "error" ? textos.retry : textos.showButton}
          </button>
        )}
        <p
          role="status"
          className={
            estado === "idle" || (listo && !parcial)
              ? "sr-only"
              : "text-sm font-semibold text-hoja"
          }
        >
          {estado === "loading" && textos.loading}
          {estado === "error" && textos.error}
          {listo && parcial && textos.partial}
        </p>
        {listo && parcial && (
          <button
            type="button"
            onClick={recargarTeselas}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-control bg-hoja px-4 font-semibold text-white"
          >
            {textos.retry}
          </button>
        )}
      </div>
    </div>
  );
}
