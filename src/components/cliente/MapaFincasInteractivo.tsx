"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Map as LeafletMap } from "leaflet";
import type { Fincas, MapaTextos, Ubicacion } from "@/lib/schema";
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
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<LeafletMap | null>(null);
  const montado = useRef(true);
  const region = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
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
      mapa.current?.remove();
      mapa.current = null;
    };
  }, []);

  // Tras un error, el foco pasa a "Reintentar": el botón anterior ya no existe.
  useEffect(() => {
    if (estado === "error") boton.current?.focus();
  }, [estado]);

  // Error: se destruye la instancia (un reintento la crea de nuevo en el mismo
  // contenedor) y vuelven el mapa ilustrado, el aviso y "Reintentar" (H-04, T-69).
  // remove() no quita las clases que Leaflet agregó al contenedor (fondo gris): un
  // `key` nuevo hace que React lo reemplace por un nodo limpio.
  function fallar() {
    mapa.current?.remove();
    mapa.current = null;
    if (!montado.current) return;
    setIntento((n) => n + 1);
    setEstado("error");
  }

  async function cargarMapa() {
    setEstado("loading");
    mapa.current?.remove();
    mapa.current = null;
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
      // "load" llega cuando terminan las teselas visibles, también las que fallaron.
      // Si ninguna cargó (OSM caído o bloqueado), el mapa quedaría gris: pasa a error
      // (H-03). Un fallo parcial deja huecos, pero no reemplaza el mapa entero.
      let teselasCargadas = 0;
      L.tileLayer(TILES, {
        maxZoom: 19,
        attribution: textos.attribution,
      })
        .on("tileload", () => {
          teselasCargadas += 1;
        })
        .on("load", () => {
          if (teselasCargadas === 0 && mapa.current === map) fallar();
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
      setEstado("ready");
      // El botón desaparece: el foco pasa al mapa para no perderse.
      contenedor.current.focus();
    } catch {
      fallar();
    }
  }

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
      <div key={intento} ref={contenedor} className="size-full" />
      {estado !== "ready" && (
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

          {/* Aviso antes del botón (AC-19). En escritorio, tarjeta compacta abajo a la
              izquierda, como un control del mapa: el mapa es lo principal. */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 border-t border-hoja/10 bg-white p-4 md:inset-x-auto md:bottom-5 md:left-5 md:max-w-xs md:rounded-card md:border-0 md:bg-white/90 md:shadow-suave md:backdrop-blur-sm">
            {aviso}
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
            {/* Siempre en el árbol de accesibilidad para que se anuncie al cambiar. */}
            <p
              role="status"
              className={
                estado === "idle"
                  ? "sr-only"
                  : "text-sm font-semibold text-hoja"
              }
            >
              {estado === "loading" && textos.loading}
              {estado === "error" && textos.error}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
