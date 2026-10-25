import { MapPin } from "lucide-react";
import { MapaFincasInteractivo } from "@/components/cliente/MapaFincasInteractivo";
import { assetPath } from "@/lib/asset";
import { getContent } from "@/lib/content";
import { recursoDe, type Locale } from "@/lib/i18n";
import { medidasMapa } from "@/lib/mapa-ilustrado";
import { fill } from "@/lib/template";

// Mapa de fincas de origen (FR-24), después de "Origen". Componente de servidor: el aviso
// y la lista se entregan en el HTML y funcionan sin JavaScript (AC-16). El mapa solo se
// carga cuando el visitante pulsa "Ver mapa", después de leer el aviso (AC-15, AC-19).
// Fincas y coordenadas ficticias hasta RP-02. La lista no muestra coordenadas (AC-16):
// solo las usa el mapa para ubicar los marcadores.
export function MapaFincas({ locale }: { locale: Locale }) {
  const { copy, fincas } = getContent(locale);
  const { map } = copy;
  return (
    <section
      id="mapa-fincas"
      aria-labelledby="mapa-fincas-titulo"
      className="scroll-mt-40 md:scroll-mt-20"
    >
      <div className="contenedor flex flex-col gap-8 py-12">
        <div className="flex max-w-prose flex-col gap-3">
          <h2
            id="mapa-fincas-titulo"
            className="text-2xl font-semibold text-hoja md:text-3xl"
          >
            {map.title}
          </h2>
          <p className="text-lg">{map.text}</p>
        </div>

        {/* En escritorio el mapa toma la altura de la lista (celdas estiradas). */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <MapaFincasInteractivo
            avisoId="mapa-fincas-aviso"
            previa={{
              // SVG con los rótulos en el idioma de la página (T-95).
              escritorio: assetPath(recursoDe("/mapa-fincas.svg", locale)),
              movil: assetPath(recursoDe("/mapa-fincas-movil.svg", locale)),
              ...medidasMapa("escritorio"),
            }}
            aviso={
              <div className="flex gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-hoja-claro">
                  <MapPin aria-hidden="true" className="size-5 text-hoja" />
                </span>
                <p id="mapa-fincas-aviso" className="min-w-0 text-sm">
                  {map.consent}{" "}
                  <a
                    href={map.privacyUrl}
                    rel="noopener"
                    className="inline-flex min-h-11 items-center font-semibold wrap-anywhere text-hoja underline underline-offset-4"
                  >
                    {map.privacyLink}
                  </a>
                </p>
              </div>
            }
            fincas={fincas.fincas.map(
              ({ id, tipo, nombre, municipio, lat, lng }) => ({
                id,
                tipo,
                nombre,
                municipio,
                lat,
                lng,
              }),
            )}
            centro={fincas.centro}
            zoom={fincas.zoom}
            textos={{
              title: map.title,
              showButton: map.showButton,
              loading: map.loading,
              error: map.error,
              retry: map.retry,
              partial: map.partial,
              acopioDetail: map.acopioDetail,
              attribution: map.attribution,
              zoomIn: map.zoomIn,
              zoomOut: map.zoomOut,
              closePopup: map.closePopup,
            }}
          />

          <div className="rounded-card bg-white shadow-suave">
            <h3 className="border-b border-hoja/10 px-5 py-4 text-xl font-semibold text-hoja">
              {map.listTitle}
            </h3>
            <ul className="divide-y divide-hoja/10">
              {fincas.fincas.map((finca) => (
                <li key={finca.id} className="flex gap-3 px-5 py-3">
                  <span
                    aria-hidden="true"
                    className={`mt-1 shrink-0 ${
                      finca.tipo === "acopio"
                        ? "marcador-acopio"
                        : "marcador-finca"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="font-semibold">{finca.nombre}</p>
                    <p className="text-sm">
                      {finca.tipo === "acopio"
                        ? fill(map.acopioDetail, { municipio: finca.municipio })
                        : finca.municipio}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
