import { Hand, Phone, ShieldCheck, Truck } from "lucide-react";
import { copy, site } from "@/lib/content";
import { fill } from "@/lib/template";

// El ícono es una decisión de diseño, no de copy: copy.json solo elige cuál.
const icons = {
  camion: Truck,
  telefono: Phone,
  escudo: ShieldCheck,
  mano: Hand,
};

// Franja de confianza (FR-03): cuatro íconos con título y texto corto.
export function TrustBar() {
  return (
    <div className="bg-hoja-claro">
      <ul className="contenedor grid grid-cols-2 gap-x-4 gap-y-6 py-8 md:grid-cols-4">
        {copy.trustBar.map((item) => {
          const Icon = icons[item.icon];
          return (
            <li key={item.icon} className="flex flex-col gap-2">
              <Icon aria-hidden="true" className="size-8 text-hoja" />
              <p className="font-semibold text-hoja">
                {fill(item.title, { ciudad: site.acopio.city })}
              </p>
              <p className="text-sm">{item.text}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
