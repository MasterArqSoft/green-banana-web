import { ShieldCheck } from "lucide-react";
import { getContent } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

// Garantía (FR-14): reclamo en 24 horas con foto y aclaración de que el derecho
// de retracto no aplica a perecederos (Ley 1480, art. 47). Política definitiva: RP-04.
export function Guarantee({ locale }: { locale: Locale }) {
  const { copy } = getContent(locale);
  const { guarantee } = copy;
  return (
    <section
      id="garantia"
      aria-labelledby="garantia-titulo"
      className="contenedor py-12"
    >
      <div className="flex flex-col gap-4 rounded-card border-2 border-hoja p-6 md:flex-row md:gap-6">
        <ShieldCheck
          aria-hidden="true"
          className="size-12 shrink-0 text-hoja"
        />
        <div className="flex flex-col gap-3">
          <h2
            id="garantia-titulo"
            className="text-2xl font-semibold text-hoja md:text-3xl"
          >
            {guarantee.title}
          </h2>
          <p className="max-w-prose text-lg">{guarantee.text}</p>
          <p className="max-w-prose text-sm">{guarantee.legalNote}</p>
        </div>
      </div>
    </section>
  );
}
