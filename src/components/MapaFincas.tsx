import { MapaFincasInteractivo } from "@/components/MapaFincasInteractivo";
import { copy, fincas } from "@/lib/content";
import { fill } from "@/lib/template";

// Mapa de fincas de origen (FR-24), después de "Origen". Componente de servidor: el aviso
// y la lista se entregan en el HTML y funcionan sin JavaScript (AC-16). El mapa solo se
// carga cuando el visitante pulsa "Ver mapa", después de leer el aviso (AC-15, AC-19).
// Fincas y coordenadas ficticias hasta RP-02.
export function MapaFincas() {
  const { map } = copy;
  const coordenadas = (lat: number, lng: number) =>
    fill(map.coordinates, { lat: lat.toFixed(4), lng: lng.toFixed(4) });
  return (
    <section
      id="mapa-fincas"
      aria-labelledby="mapa-fincas-titulo"
      className="scroll-mt-20"
    >
      <div className="contenedor flex flex-col gap-6 py-12">
        <div className="flex max-w-prose flex-col gap-3">
          <h2
            id="mapa-fincas-titulo"
            className="text-2xl font-semibold text-hoja md:text-3xl"
          >
            {map.title}
          </h2>
          <p className="text-lg">{map.text}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
          <div className="flex min-w-0 flex-col gap-3">
            <p id="mapa-fincas-aviso" className="text-sm">
              {map.consent}{" "}
              <a
                href={map.privacyUrl}
                rel="noopener"
                className="inline-flex min-h-11 items-center font-semibold text-hoja underline underline-offset-4"
              >
                {map.privacyLink}
              </a>
            </p>
            <MapaFincasInteractivo
              avisoId="mapa-fincas-aviso"
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
                acopioLabel: map.acopioLabel,
                attribution: map.attribution,
                zoomIn: map.zoomIn,
                zoomOut: map.zoomOut,
                closePopup: map.closePopup,
              }}
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-hoja">{map.listTitle}</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {fincas.fincas.map((finca) => (
                <li
                  key={finca.id}
                  className="flex gap-3 rounded-card bg-white p-4 shadow-suave"
                >
                  <span
                    aria-hidden="true"
                    className={`mt-1 shrink-0 ${
                      finca.tipo === "acopio"
                        ? "marcador-acopio"
                        : "marcador-finca"
                    }`}
                  />
                  <div>
                    <p className="font-semibold">{finca.nombre}</p>
                    <p className="text-sm">
                      {finca.tipo === "acopio" && (
                        <>
                          {map.acopioLabel}
                          <span aria-hidden="true"> · </span>
                        </>
                      )}
                      {finca.municipio}
                    </p>
                    <p className="text-sm">
                      {coordenadas(finca.lat, finca.lng)}
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
