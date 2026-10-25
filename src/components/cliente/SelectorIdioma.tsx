"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { LOCALES, rutaEquivalente, type Locale } from "@/lib/i18n";

// Tercer componente cliente (spec/03-plan.md D7). Selector de idioma (FR-26, AC-23):
// enlaces a la página equivalente, ya presentes en el HTML, así que sin JavaScript
// también cambian de idioma. En el navegador solo agrega al destino la consulta y el
// ancla de la URL actual (?…#…), también para abrirlo en otra pestaña. Nunca traduce la
// página ni importa catálogos: los nombres de los idiomas llegan por props.

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
    <nav aria-label={etiqueta} className="border-b border-hoja/10">
      <ul className="contenedor flex justify-end gap-1 text-sm">
        {LOCALES.map((destino) => (
          <li key={destino}>
            {destino === locale ? (
              // El idioma activo no es un enlace: se marca con aria-current y negrita.
              <span
                aria-current="true"
                lang={destino}
                className="inline-flex min-h-11 items-center px-2 font-semibold text-hoja underline decoration-2 underline-offset-4"
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
                className="inline-flex min-h-11 items-center rounded-control px-2 underline-offset-4 hover:underline"
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
