import { ArrowRight } from "lucide-react";
import { Picture } from "@/components/ui/Picture";
import { getContent } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { formatDate } from "@/lib/format";
import { IMAGES } from "@/lib/images";
import { fill } from "@/lib/template";

// Origen y trazabilidad (FR-06). Destino del botón "Ver origen" del hero (#origen).
// Productor, municipio y lote son ficticios hasta RP-02.
export function Origin({ locale }: { locale: Locale }) {
  const { copy, origin, site } = getContent(locale);
  // Las descripciones del ejemplo no son nombres propios: se traducen al mostrarlas.
  // Solo se sustituye el valor exacto de la demo; un nombre real o personalizado y el
  // identificador del lote se conservan. La marca técnica (FICTICIO) sigue siendo la
  // misma en ambos idiomas, igual que en los demás datos de demostración (D7).
  const ejemplos = getContent("es-CO").copy.origin.exampleValues;
  const nombre = (campo: keyof typeof ejemplos) =>
    origin[campo] === `${ejemplos[campo]} (FICTICIO)`
      ? `${copy.origin.exampleValues[campo]} (FICTICIO)`
      : origin[campo];
  const values = {
    ciudad: site.acopio.city,
    productor: nombre("producer"),
    municipio: nombre("municipality"),
    departamento: nombre("department"),
  };
  return (
    <section
      id="origen"
      aria-labelledby="origen-titulo"
      className="scroll-mt-40 bg-hoja-claro md:scroll-mt-20"
    >
      <div className="contenedor grid grid-cols-1 gap-8 py-12 md:grid-cols-2 md:items-center">
        <div className="flex min-w-0 flex-col gap-5">
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
              fecha: formatDate(origin.batch.cutDate, locale),
            })}
          </p>
        </div>

        <Picture
          spec={IMAGES.origin}
          alt={copy.origin.imageAlt}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="aspect-[3/2] w-full rounded-card object-cover"
        />
      </div>
    </section>
  );
}
