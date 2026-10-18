import { CallButton } from "@/components/CallButton";
import { FloatingCallVisibility } from "@/components/FloatingCallVisibility";

// Botón flotante de llamada (FR-17). El botón se renderiza en el servidor; el
// componente cliente solo decide cuándo mostrarlo, así el contenido de site.json
// no viaja en el JavaScript del navegador.
export function FloatingCall() {
  return (
    <FloatingCallVisibility>
      <CallButton className="w-full" />
    </FloatingCallVisibility>
  );
}
