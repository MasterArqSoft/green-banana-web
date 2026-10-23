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

// Composición de la landing. El orden final de las secciones es T-33.
export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <TrustBar />
      <ProductCards />
      <FreshInfo />
      <Origin />
      <MapaFincas />
      <Recipes />
      <Benefits />
      <HowItWorks />
      <Coverage />
      <Business />
      <Testimonials />
      <Faq />
      <Guarantee />
      <FinalCta />
      <LocalBusinessJsonLd />
    </main>
  );
}
