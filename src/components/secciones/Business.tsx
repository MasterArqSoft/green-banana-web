import { Store } from "lucide-react";
import { CallButton } from "@/components/ui/CallButton";
import { getContent } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { fill } from "@/lib/template";

// Para negocios (FR-11): tiendas, hoteles y puntos de venta. Solo llamada;
// el formulario B2B queda para el roadmap R-06.
export function Business({ locale }: { locale: Locale }) {
  const { copy, site } = getContent(locale);
  return (
    <section
      id="negocios"
      aria-labelledby="negocios-titulo"
      // Sobre fondo verde, el foco del teclado se dibuja en blanco (WCAG 2.4.7).
      className="bg-hoja text-white [&_:focus-visible]:outline-white"
    >
      <div className="contenedor flex flex-col items-start gap-4 py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-4">
          <Store aria-hidden="true" className="size-10 shrink-0" />
          <div className="flex flex-col gap-2">
            <h2
              id="negocios-titulo"
              className="text-2xl font-semibold md:text-3xl"
            >
              {copy.business.title}
            </h2>
            <p className="text-lg">
              {fill(copy.business.text, { ciudad: site.acopio.city })}
            </p>
          </div>
        </div>
        <CallButton locale={locale} className="shrink-0" />
      </div>
    </section>
  );
}
