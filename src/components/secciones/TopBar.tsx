import Link from "next/link";
import type { ReactNode } from "react";
import { CallButton } from "@/components/ui/CallButton";
import { getContent } from "@/lib/content";
import { rutaDe, type Locale } from "@/lib/i18n";
import { formatPhoneUnido } from "@/lib/tel";
import { fill } from "@/lib/template";

// Barra superior (FR-01): empresa, zona de acopio, número y botón Llamar.
// Fija arriba en móvil; en escritorio se desplaza con la página. También se desplaza si
// fija taparía el contenido (revisión independiente, R-01; WCAG 1.4.4 y 2.4.11): con el
// texto aumentado (la página, contenedor "pagina" de documento.tsx, mide menos de 20rem;
// con el texto al 200 % medía 653 px de alto en una pantalla de 640) o en ventanas de
// menos de 32rem de alto (zoom fuerte, móvil apaisado).
// La marca lleva al inicio desde cualquier página (FR-19, AC-14).
// Consulta de contenedor: si la barra mide menos de 20rem (texto al 200 % en un móvil de
// 320 px, T-103), marca, Llamar y selector van en una columna y el texto puede partirse.
export function TopBar({
  locale,
  selector,
}: {
  locale: Locale;
  selector?: ReactNode;
}) {
  const { copy, site } = getContent(locale);
  return (
    <header className="@container sticky top-0 z-20 border-b border-hoja/15 bg-crema/95 backdrop-blur md:static @max-xs/pagina:static [@media(max-height:32rem)]:static">
      <div className="contenedor grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 py-2 @max-xs:grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
        <div className="min-w-0">
          {/* Sin prefetch (PERF-05, T-61): en la landing descargaba otra vez la página completa.
              La marca se parte en dos líneas si no cabe, en vez de cortarse con «…»
              (revisión del hero en móvil, 2026-10-25). */}
          <Link
            href={rutaDe("inicio", locale)}
            prefetch={false}
            className="block rounded-control font-display text-base leading-snug font-semibold text-balance text-hoja sm:text-lg"
          >
            {site.brand}
          </Link>
          <p className="text-sm">
            {fill(copy.topBar.acopio, { ciudad: site.acopio.city })}
            <span aria-hidden="true"> · </span>
            {/* La frase se parte si no cabe (a 320 px no cabía en su columna, T-103),
                pero el número va unido: espacios no separables entre sus grupos. */}
            <span>
              {fill(copy.topBar.phone, {
                telefono: formatPhoneUnido(site.phone),
              })}
            </span>
          </p>
        </div>
        {selector && (
          <div className="col-span-2 row-start-2 flex justify-end @max-xs:col-span-1 @max-xs:row-start-3 @max-xs:justify-start lg:col-span-1 lg:col-start-2 lg:row-start-1">
            {selector}
          </div>
        )}
        <div className="col-start-2 row-start-1 @max-xs:col-start-1 @max-xs:row-start-2 lg:col-start-3">
          <CallButton locale={locale} size="sm" />
        </div>
      </div>
    </header>
  );
}
