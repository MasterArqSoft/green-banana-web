import { CallButton } from "@/components/ui/CallButton";
import { FloatingCallVisibility } from "@/components/cliente/FloatingCallVisibility";
import type { Locale } from "@/lib/i18n";

// Botón flotante de llamada (FR-17): redondo y compacto, abajo a la derecha, para
// tapar lo mínimo del contenido (la barra superior fija ya tiene su botón Llamar). El botón se renderiza en el servidor; el
// componente cliente solo decide cuándo mostrarlo, así el contenido de site.json
// no viaja en el JavaScript del navegador.
export function FloatingCall({ locale }: { locale: Locale }) {
  return (
    <FloatingCallVisibility>
      <CallButton locale={locale} size="icon" />
    </FloatingCallVisibility>
  );
}
