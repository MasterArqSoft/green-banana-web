import { getContent, isProduction } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

// Franja de aviso de datos ficticios (decisión D-11). Nunca se muestra en producción.
export function DemoBanner({ locale }: { locale: Locale }) {
  const { copy } = getContent(locale);
  if (isProduction) return null;
  return (
    <p
      role="note"
      className="bg-carbon px-4 py-2 text-center text-sm text-crema"
    >
      {copy.demoNotice}
    </p>
  );
}
