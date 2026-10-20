"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Map as LeafletMap } from "leaflet";
import type { Finca } from "@/lib/schema";

// Segundo componente cliente (spec/03-plan.md D6). Nunca importa @/lib/content: los
// datos y los textos llegan por props desde MapaFincas. Leaflet y su CSS se importan
// solo al pulsar "Ver mapa" (AC-15), así que no están en la carga inicial. Si la
// carga falla, la lista de fincas del componente de servidor sigue disponible.
// Antes del clic se ve una vista previa dibujada con CSS (sin teselas ni terceros) y
// una tarjeta con el aviso (`aviso`, renderizado en el servidor) y el botón (AC-19).

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

// Posición relativa (0 a 1) de cada ubicación para la vista previa decorativa.
// Es un esquema: norte arriba y este a la derecha, sin escala real.
function posicionesPrevia(fincas: Ubicacion[]) {
  const lats = fincas.map((finca) => finca.lat);
  const lngs = fincas.map((finca) => finca.lng);
  const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)];
  const [minLng, maxLng] = [Math.min(...lngs), Math.max(...lngs)];
  const rango = (min: number, max: number) => max - min || 1;
  return fincas.map((finca) => ({
    id: finca.id,
    tipo: finca.tipo,
    x: (finca.lng - minLng) / rango(minLng, maxLng),
    y: (maxLat - finca.lat) / rango(minLat, maxLat),
  }));
}

export function MapaFincasInteractivo({
  avisoId,
  aviso,
  fincas,
  centro,
  zoom,
  textos,
}: {
  avisoId: string;
  aviso: ReactNode;
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
    // isolate: los paneles de Leaflet no tapan la barra superior fija.
    <div
      role="region"
      aria-label={textos.title}
      className="relative isolate h-[28rem] w-full overflow-hidden rounded-card bg-hoja-claro shadow-suave md:h-full md:min-h-[28rem]"
    >
      <div ref={contenedor} className="size-full" />
      {estado !== "ready" && (
        <>
          {/* Vista previa decorativa: cuadrícula, curvas y marcadores en su posición relativa.
              En móvil, marcadores arriba y tarjeta abajo; en escritorio, lado a lado. */}
          <div aria-hidden="true" className="mapa-previa absolute inset-0">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 size-full text-hoja/15"
            >
              <path
                d="M-5 30 C 20 18, 35 42, 60 30 S 95 18, 105 26"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.6"
              />
              <path
                d="M-5 62 C 18 52, 40 74, 62 60 S 92 50, 105 58"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.6"
              />
              <path
                d="M-5 86 C 25 78, 45 96, 70 84 S 95 80, 105 88"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.6"
              />
            </svg>
            <div className="absolute inset-x-[15%] top-[7%] h-[26%] md:inset-x-auto md:inset-y-[10%] md:right-[10%] md:h-auto md:w-[38%]">
              {posicionesPrevia(fincas).map((punto) => (
                <span
                  key={punto.id}
                  className={`absolute -translate-1/2 ${
                    punto.tipo === "acopio"
                      ? "marcador-acopio"
                      : "marcador-finca"
                  }`}
                  style={{
                    left: `${punto.x * 100}%`,
                    top: `${punto.y * 100}%`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Tarjeta: aviso antes del botón (AC-19). */}
          <div className="absolute inset-x-4 bottom-4 flex flex-col gap-3 rounded-card bg-white p-5 shadow-suave md:inset-x-auto md:top-1/2 md:bottom-auto md:left-8 md:max-w-sm md:-translate-y-1/2">
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
