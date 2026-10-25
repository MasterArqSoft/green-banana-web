import { Benefits } from "@/components/secciones/Benefits";
import { Business } from "@/components/secciones/Business";
import { Coverage } from "@/components/secciones/Coverage";
import { Faq } from "@/components/secciones/Faq";
import { FinalCta } from "@/components/secciones/FinalCta";
import { FreshInfo } from "@/components/secciones/FreshInfo";
import { Guarantee } from "@/components/secciones/Guarantee";
import { Hero } from "@/components/secciones/Hero";
import { LocalBusinessJsonLd } from "@/components/seo/LocalBusinessJsonLd";
import { HowItWorks } from "@/components/secciones/HowItWorks";
import { MapaFincas } from "@/components/secciones/MapaFincas";
import { Origin } from "@/components/secciones/Origin";
import { ProductCards } from "@/components/secciones/ProductCards";
import { Recipes } from "@/components/secciones/Recipes";
import { Testimonials } from "@/components/secciones/Testimonials";
import { TrustBar } from "@/components/secciones/TrustBar";
import { MAIN_ID } from "@/components/ui/SkipLink";
import type { Locale } from "@/lib/i18n";

// Composición de la landing, la misma en los dos idiomas (/ y /en). El orden final de
// las secciones es T-33; los IDs de las anclas no cambian entre idiomas (D7).
export function Landing({ locale }: { locale: Locale }) {
  return (
    <main id={MAIN_ID} className="flex-1">
      <Hero locale={locale} />
      <TrustBar locale={locale} />
      <ProductCards locale={locale} />
      <FreshInfo locale={locale} />
      <Origin locale={locale} />
      <MapaFincas locale={locale} />
      <Recipes locale={locale} />
      <Benefits locale={locale} />
      <HowItWorks locale={locale} />
      <Coverage locale={locale} />
      <Business locale={locale} />
      <Testimonials locale={locale} />
      <Faq locale={locale} />
      <Guarantee locale={locale} />
      <FinalCta locale={locale} />
      <LocalBusinessJsonLd locale={locale} />
    </main>
  );
}
