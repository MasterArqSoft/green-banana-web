import { MapPin, Truck } from "lucide-react";
import { CallButton } from "@/components/CallButton";
import { copy, site, zones } from "@/lib/content";
import { formatList } from "@/lib/format";
import { fill } from "@/lib/template";

// Cobertura (FR-10): acopio y distribución en Santa Marta con reparto propio.
// No publica horarios ni costos de envío; se informan por teléfono (AC-04).
export function Coverage() {
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
        zonas: formatList(zones.map((zone) => zone.name)),
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
          <div
            key={label}
            className="flex gap-4 rounded-card bg-white p-5 shadow-suave"
          >
            <Icon aria-hidden="true" className="size-8 shrink-0 text-hoja" />
            <div>
              <dt className="font-semibold text-hoja">{label}</dt>
              <dd>{value}</dd>
            </div>
          </div>
        ))}
      </dl>
      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <p>{coverage.notListed}</p>
        <CallButton />
      </div>
    </section>
  );
}
