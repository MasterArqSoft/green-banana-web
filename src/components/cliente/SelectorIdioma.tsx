"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { LOCALES, rutaEquivalente, type Locale } from "@/lib/i18n";

// Tercer componente cliente (spec/03-plan.md D7). Selector de idioma (FR-26, AC-23):
// enlaces a la página equivalente, ya presentes en el HTML, así que sin JavaScript
// también cambian de idioma. En el navegador solo agrega al destino la consulta y el
// ancla de la URL actual (?…#…), también para abrirlo en otra pestaña. Nunca traduce la
// página ni importa catálogos: los nombres de los idiomas llegan por props. Los nombres
// llevan translate="no": si el navegador traduce la página, el visitante sigue viendo
// "Español / English" y encuentra el selector; el resto de la página sigue siendo
// traducible (T-122, INC-01, DR-13).

function suscribir(avisar: () => void) {
  window.addEventListener("hashchange", avisar);
  return () => window.removeEventListener("hashchange", avisar);
}
const sufijoActual = () => `${window.location.search}${window.location.hash}`;
// En el HTML del servidor, el destino sin consulta ni ancla.
const sinSufijo = () => "";

export function SelectorIdioma({
  locale,
  etiqueta,
  nombres,
}: {
  locale: Locale;
  etiqueta: string;
  nombres: Record<Locale, string>;
}) {
  const ruta = usePathname();
  const sufijo = useSyncExternalStore(suscribir, sufijoActual, sinSufijo);
  return (
    <nav
      aria-label={etiqueta}
      className="inline-flex max-w-full shrink-0 flex-wrap items-center gap-1 rounded-control border border-hoja/20 bg-crema p-1 text-sm"
    >
      <Globe aria-hidden="true" size={18} className="mx-2 shrink-0 text-hoja" />
      <ul className="flex flex-wrap items-center gap-1">
        {LOCALES.map((destino) => (
          <li key={destino}>
            {destino === locale ? (
              // El idioma activo no es un enlace: se marca con aria-current y negrita.
              <span
                aria-current="true"
                lang={destino}
                translate="no"
                className="inline-flex min-h-11 items-center rounded-control bg-hoja-claro px-3 font-semibold text-hoja underline decoration-2 underline-offset-4"
              >
                {nombres[destino]}
              </span>
            ) : (
              // Sin prefetch (T-61). Entre idiomas cambia el layout raíz: Next recarga la página.
              <Link
                href={`${rutaEquivalente(ruta, destino)}${sufijo}`}
                prefetch={false}
                hrefLang={destino}
                lang={destino}
                translate="no"
                rel="alternate"
                className="inline-flex min-h-11 items-center rounded-control px-3 underline-offset-4 hover:bg-hoja-claro hover:underline"
              >
                {nombres[destino]}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
