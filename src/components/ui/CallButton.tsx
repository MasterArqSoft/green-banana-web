import { Phone } from "lucide-react";
import { getContent } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { formatPhone, telHref } from "@/lib/tel";
import { fill } from "@/lib/template";

type CallButtonProps = {
  /** Idioma de los textos; el número es el mismo en todos (site.json). */
  locale: Locale;
  /** Texto visible; por defecto copy.callButton.label del idioma. P. ej. callLabel de products.json. */
  label?: string;
  /** "icon": botón redondo solo con ícono (botón flotante); el texto queda para lectores de pantalla. */
  size?: "sm" | "md" | "icon";
  /** Lo que distingue este botón de otros con el mismo texto (p. ej. la presentación). Solo va al nombre accesible. */
  context?: string;
  className?: string;
};

// Con texto, el botón puede partirse en dos líneas solo si no cabe (320 px, texto al 200 %
// o espaciado de WCAG 1.4.12; T-103, F-02): con espacio, se ve en una sola línea.
const sizes = {
  sm: "min-h-11 max-w-full px-4 py-1 text-sm text-center rounded-control",
  md: "min-h-12 max-w-full px-6 py-1 text-base text-center rounded-control",
  // En px: solo lleva ícono, así que no crece con el texto. En rem medía 112 px con la
  // fuente al 200 % y tapaba el contenido (revisión visual de F-02); 56 px > 44 px táctiles.
  icon: "size-[56px] whitespace-nowrap rounded-full",
};

// Botón de llamada reutilizable (FR-01, FR-02, FR-04, FR-11, FR-15). Siempre usa el
// número de site.json a través de telHref; nunca recibe el número por props.
export function CallButton({
  locale,
  label,
  size = "md",
  context,
  className = "",
}: CallButtonProps) {
  const { copy, site } = getContent(locale);
  label ??= copy.callButton.label;
  const telefono = formatPhone(site.phone);
  return (
    <a
      href={telHref(site.phone)}
      // El nombre accesible empieza con el texto visible (WCAG 2.5.3).
      aria-label={
        context
          ? fill(copy.callButton.accessibleNameWithContext, {
              texto: label,
              contexto: context,
              telefono,
            })
          : fill(copy.callButton.accessibleName, { texto: label, telefono })
      }
      className={`inline-flex items-center justify-center gap-2 bg-cta font-semibold text-carbon shadow-suave transition-colors hover:bg-cta-hover ${sizes[size]} ${className}`}
    >
      <Phone
        aria-hidden="true"
        className={`shrink-0 ${size === "icon" ? "size-[24px]" : "size-4"}`}
      />
      {size === "icon" ? <span className="sr-only">{label}</span> : label}
    </a>
  );
}
