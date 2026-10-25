import { CallButton } from "@/components/ui/CallButton";
import { getContent } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

// CTA final (FR-15): cierre con el botón de llamada.
export function FinalCta({ locale }: { locale: Locale }) {
  const { copy } = getContent(locale);
  return (
    <section aria-labelledby="cta-final-titulo" className="bg-hoja-claro">
      <div className="contenedor flex flex-col items-center gap-5 py-14 text-center">
        <h2
          id="cta-final-titulo"
          className="text-2xl font-semibold text-hoja md:text-4xl"
        >
          {copy.finalCta.title}
        </h2>
        <CallButton locale={locale} />
      </div>
    </section>
  );
}
