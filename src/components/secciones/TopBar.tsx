import Link from "next/link";
import type { ReactNode } from "react";
import { CallButton } from "@/components/ui/CallButton";
import { getContent } from "@/lib/content";
import { rutaDe, type Locale } from "@/lib/i18n";
import { formatPhone } from "@/lib/tel";
import { fill } from "@/lib/template";

// Barra superior (FR-01): empresa, zona de acopio, número y botón Llamar.
// Fija arriba en móvil; en escritorio se desplaza con la página.
// La marca lleva al inicio desde cualquier página (FR-19, AC-14).
export function TopBar({
  locale,
  selector,
}: {
  locale: Locale;
  selector?: ReactNode;
}) {
  const { copy, site } = getContent(locale);
  return (
    <header className="sticky top-0 z-20 border-b border-hoja/15 bg-crema/95 backdrop-blur md:static">
      <div className="contenedor grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 py-2 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
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
        {selector && (
          <div className="col-span-2 row-start-2 flex justify-end lg:col-span-1 lg:col-start-2 lg:row-start-1">
            {selector}
          </div>
        )}
        <div className="col-start-2 row-start-1 lg:col-start-3">
          <CallButton locale={locale} size="sm" />
        </div>
      </div>
    </header>
  );
}
