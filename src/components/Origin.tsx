import { ArrowRight, Sprout } from "lucide-react";
import { copy, origin, site } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { fill } from "@/lib/template";

// Origen y trazabilidad (FR-06). Destino del botón "Ver origen" del hero (#origen).
// Productor, municipio y lote son ficticios hasta RP-02.
export function Origin() {
  const values = {
    ciudad: site.acopio.city,
    productor: origin.producer,
    municipio: origin.municipality,
    departamento: origin.department,
  };
  return (
    <section
      id="origen"
      aria-labelledby="origen-titulo"
      className="scroll-mt-20 bg-hoja-claro"
    >
      <div className="contenedor grid gap-8 py-12 md:grid-cols-2 md:items-center">
        <div className="flex flex-col gap-5">
          <h2
            id="origen-titulo"
            className="text-2xl font-semibold text-hoja md:text-3xl"
          >
            {fill(copy.origin.title, values)}
          </h2>
          <p className="text-lg">{fill(copy.origin.text, values)}</p>
          <ol className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {copy.origin.steps.map((step, index) => (
              <li key={step} className="flex items-center gap-2">
                {index > 0 && (
                  <ArrowRight
                    aria-hidden="true"
                    className="size-5 rotate-90 text-hoja sm:rotate-0"
                  />
                )}
                <span className="rounded-control bg-white px-3 py-2 font-semibold text-hoja shadow-suave">
                  {fill(step, values)}
                </span>
              </li>
            ))}
          </ol>
          <p className="text-sm font-semibold">
            {fill(copy.origin.batch, {
              codigo: origin.batch.code,
              fecha: formatDate(origin.batch.cutDate),
            })}
          </p>
        </div>

        {/* Espacio reservado de la foto 3:2 (1200 × 800, T-04). */}
        <div className="flex aspect-[3/2] flex-col items-center justify-center gap-3 rounded-card bg-white/70 text-hoja">
          <Sprout aria-hidden="true" className="size-12" />
          <p className="text-sm font-semibold">{copy.origin.imagePending}</p>
        </div>
      </div>
    </section>
  );
}
