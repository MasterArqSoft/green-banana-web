import { Phone } from "lucide-react";
import { site } from "@/lib/content";
import { formatPhone, telHref } from "@/lib/tel";

type CallButtonProps = {
  /** Texto visible del botón, p. ej. "Llamar" o "Llamar para precio". */
  label?: string;
  size?: "sm" | "md";
  className?: string;
};

const sizes = {
  sm: "min-h-11 px-4 text-sm",
  md: "min-h-12 px-6 text-base",
};

// Botón de llamada reutilizable (FR-01, FR-02, FR-04, FR-11, FR-15). Siempre usa el
// número de site.json a través de telHref; nunca recibe el número por props.
export function CallButton({
  label = "Llamar",
  size = "md",
  className = "",
}: CallButtonProps) {
  return (
    <a
      href={telHref(site.phone)}
      // El nombre accesible empieza con el texto visible (WCAG 2.5.3).
      aria-label={`${label} al ${formatPhone(site.phone)}`}
      className={`inline-flex items-center justify-center gap-2 rounded-control bg-cta font-semibold whitespace-nowrap text-white shadow-suave transition-colors hover:bg-hoja ${sizes[size]} ${className}`}
    >
      <Phone aria-hidden="true" className="size-4 shrink-0" />
      {label}
    </a>
  );
}
