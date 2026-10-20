"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import type { Finca } from "@/lib/schema";

// Segundo componente cliente (spec/03-plan.md D6). Nunca importa @/lib/content: los
// datos y los textos llegan por props desde MapaFincas. Leaflet y su CSS se importan
// solo al pulsar "Ver mapa" (AC-15), así que no están en la carga inicial. Si la
// carga falla, la lista de fincas del componente de servidor sigue disponible.

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
  fincas,
  centro,
  zoom,
  textos,
}: {
  avisoId: string;
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
    // Altura reservada desde el primer render para no mover la página (CLS).
    // isolate: los paneles de Leaflet no tapan la barra superior fija.
    <div
      role="region"
      aria-label={textos.title}
      className="relative isolate h-80 w-full overflow-hidden rounded-card bg-hoja-claro md:h-[26rem]"
    >
      <div ref={contenedor} className="size-full" />
      {estado !== "ready" && (
        <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
          {estado === "idle" && (
            <button
              type="button"
              onClick={cargarMapa}
              aria-describedby={avisoId}
              className="inline-flex min-h-11 items-center rounded-control bg-hoja px-5 font-semibold text-white shadow-suave"
            >
              {textos.showButton}
            </button>
          )}
          <p role="status" className="font-semibold text-hoja">
            {estado === "loading" && textos.loading}
            {estado === "error" && textos.error}
          </p>
        </div>
      )}
    </div>
  );
}
