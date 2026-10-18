import { isProduction, site } from "@/lib/content";

// Franja de aviso de datos ficticios (decisión D-11). Nunca se muestra en producción.
export function DemoBanner() {
  if (isProduction) return null;
  return (
    <p role="note" className="bg-sol px-4 py-2 text-center text-sm text-carbon">
      {site.demoNotice}
    </p>
  );
}
