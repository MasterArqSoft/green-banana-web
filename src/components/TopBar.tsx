import { CallButton } from "@/components/CallButton";
import { copy, site } from "@/lib/content";
import { formatPhone } from "@/lib/tel";
import { fill } from "@/lib/template";

// Barra superior (FR-01): empresa, zona de acopio, número y botón Llamar.
// Fija arriba en móvil; en escritorio se desplaza con la página.
export function TopBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-hoja/15 bg-crema/95 backdrop-blur md:static">
      <div className="contenedor flex items-center justify-between gap-3 py-2">
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold text-hoja">
            {site.brand}
          </p>
          <p className="text-xs md:text-sm">
            {fill(copy.topBar.acopio, { ciudad: site.acopio.city })}
            <span aria-hidden="true"> · </span>
            <span className="whitespace-nowrap">
              {fill(copy.topBar.phone, { telefono: formatPhone(site.phone) })}
            </span>
          </p>
        </div>
        <CallButton size="sm" />
      </div>
    </header>
  );
}
