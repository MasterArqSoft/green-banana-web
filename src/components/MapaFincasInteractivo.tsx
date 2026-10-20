"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Map as LeafletMap } from "leaflet";
import type { Finca } from "@/lib/schema";

// Segundo componente cliente (spec/03-plan.md D6). Nunca importa @/lib/content: los
// datos y los textos llegan por props desde MapaFincas. Leaflet y su CSS se importan
// solo al pulsar "Ver mapa" (AC-15), así que no están en la carga inicial. Si la
// carga falla, la lista de fincas del componente de servidor sigue disponible.
// Antes del clic se ve el mapa ilustrado (`previa`, /mapa-fincas.svg servido por el
// propio sitio, sin terceros) y una tarjeta con el aviso (`aviso`, renderizado en el
// servidor) y el botón (AC-19).

type Ubicacion = Omit<Finca, "productor">;

type Textos = {
  title: string;
  showButton: string;
  loading: string;
  error: string;
  acopioLabel: string;
  attribution: string;
  zoomIn: string;
  zoomOut: string;
  closePopup: string;
};

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
  previa: { escritorio: string; movil: string };
  fincas: Ubicacion[];
  centro: { lat: number; lng: number };
  zoom: number;
  textos: Textos;
}) {
  const [estado, setEstado] = useState<Estado>("idle");
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<LeafletMap | null>(null);
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
      mapa.current?.remove();
      mapa.current = null;
    };
  }, []);

  async function cargarMapa() {
    setEstado("loading");
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
      L.tileLayer(TILES, {
        maxZoom: 19,
        attribution: textos.attribution,
      }).addTo(map);

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
            ? `${textos.acopioLabel} · ${finca.municipio}`
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
      if (montado.current) setEstado("error");
    }
  }

  return (
    // Altura reservada desde el primer render para no mover la página (CLS). En
    // escritorio toma la altura de la lista (celda de la grilla) con un mínimo.
    // En móvil: mapa ilustrado arriba y aviso en un panel abajo, sin taparlo.
    // isolate: los paneles de Leaflet no tapan la barra superior fija.
    <div
      role="region"
      aria-label={textos.title}
      className="relative isolate h-[33rem] w-full overflow-hidden rounded-card bg-hoja-claro shadow-suave md:h-full md:min-h-[28rem]"
    >
      <div ref={contenedor} className="size-full" />
      {estado !== "ready" && (
        <>
          {/* Mapa ilustrado de la zona (decorativo: la lista y el aviso llevan la
              información). Carga diferida; no cuenta en el peso inicial. En móvil,
              una versión recortada a las fincas con símbolos más grandes. */}
          <picture>
            <source media="(max-width: 767px)" srcSet={previa.movil} />
            <img
              src={previa.escritorio}
              alt=""
              width={1277}
              height={950}
              loading="lazy"
              decoding="async"
              className="absolute inset-x-0 top-0 h-[21rem] w-full object-cover md:inset-0 md:h-full md:object-[62%_50%]"
            />
          </picture>
          <p className="absolute top-[19.6rem] right-2 rounded bg-white/85 px-1.5 text-xs md:top-2">
            {textos.attribution}
          </p>

          {/* Aviso antes del botón (AC-19). En escritorio, tarjeta compacta abajo a la
              izquierda, como un control del mapa: el mapa es lo principal. */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 border-t border-hoja/10 bg-white p-4 md:inset-x-auto md:bottom-5 md:left-5 md:max-w-xs md:rounded-card md:border-0 md:bg-white/90 md:shadow-suave md:backdrop-blur-sm">
            {aviso}
            {estado === "idle" && (
              <button
                type="button"
                onClick={cargarMapa}
                aria-describedby={avisoId}
                className="inline-flex min-h-11 items-center justify-center rounded-control bg-hoja px-5 font-semibold text-white"
              >
                {textos.showButton}
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
