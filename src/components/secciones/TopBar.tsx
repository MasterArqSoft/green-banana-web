import Link from "next/link";
import { CallButton } from "@/components/ui/CallButton";
import { getContent } from "@/lib/content";
import { rutaDe, type Locale } from "@/lib/i18n";
import { formatPhone } from "@/lib/tel";
import { fill } from "@/lib/template";

// Barra superior (FR-01): empresa, zona de acopio, número y botón Llamar.
// Fija arriba en móvil; en escritorio se desplaza con la página.
// La marca lleva al inicio desde cualquier página (FR-19, AC-14).
export function TopBar({ locale }: { locale: Locale }) {
  const { copy, site } = getContent(locale);
  return (
    <header className="sticky top-0 z-20 border-b border-hoja/15 bg-crema/95 backdrop-blur md:static">
      <div className="contenedor flex items-center justify-between gap-3 py-2">
        <div className="min-w-0">
          {/* Sin prefetch (PERF-05, T-61): en la landing descargaba otra vez la página completa. */}
          <Link
            href={rutaDe("inicio", locale)}
            prefetch={false}
            className="block truncate rounded-control font-display text-lg font-semibold text-hoja"
          >
            {site.brand}
          </Link>
          <p className="text-sm">
            {fill(copy.topBar.acopio, { ciudad: site.acopio.city })}
            <span aria-hidden="true"> · </span>
            <span className="whitespace-nowrap">
              {fill(copy.topBar.phone, { telefono: formatPhone(site.phone) })}
            </span>
          </p>
        </div>
        <CallButton locale={locale} size="sm" />
      </div>
    </header>
  );
}
