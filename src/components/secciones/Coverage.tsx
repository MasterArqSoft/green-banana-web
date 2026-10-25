import { MapPin, Truck } from "lucide-react";
import { CallButton } from "@/components/ui/CallButton";
import { getContent } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { formatList } from "@/lib/format";
import { fill } from "@/lib/template";

// Cobertura (FR-10): acopio y distribución en Santa Marta con reparto propio.
// No publica horarios ni costos de envío; se informan por teléfono (AC-04).
export function Coverage({ locale }: { locale: Locale }) {
  const { copy, site, zones } = getContent(locale);
  const { coverage } = copy;
  const items = [
    {
      icon: MapPin,
      label: coverage.acopioLabel,
      value: fill(coverage.acopio, {
        ciudad: site.acopio.city,
        departamento: site.acopio.department,
      }),
    },
    {
      icon: Truck,
      label: coverage.distributionLabel,
      value: fill(coverage.distribution, {
        zonas: formatList(
          zones.map((zone) => zone.name),
          locale,
        ),
      }),
    },
  ];
  return (
    <section
      id="cobertura"
      aria-labelledby="cobertura-titulo"
      className="contenedor py-12"
    >
      <h2
        id="cobertura-titulo"
        className="text-2xl font-semibold text-hoja md:text-3xl"
      >
        {coverage.title}
      </h2>
      <dl className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map(({ icon: Icon, label, value }) => (
          // Dentro de <dl>, cada grupo solo puede contener <dt> y <dd>: el ícono va en el <dt>.
          <div
            key={label}
            className="flex flex-col gap-1 rounded-card bg-white p-5 shadow-suave"
          >
            <dt className="flex items-center gap-3 font-semibold text-hoja">
              <Icon aria-hidden="true" className="size-8 shrink-0" />
              {label}
            </dt>
            <dd className="pl-11">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <p>{coverage.notListed}</p>
        <CallButton locale={locale} />
      </div>
    </section>
  );
}
