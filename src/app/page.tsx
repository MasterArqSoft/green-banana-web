import { Benefits } from "@/components/Benefits";
import { Business } from "@/components/Business";
import { Coverage } from "@/components/Coverage";
import { Faq } from "@/components/Faq";
import { FinalCta } from "@/components/FinalCta";
import { FreshInfo } from "@/components/FreshInfo";
import { Guarantee } from "@/components/Guarantee";
import { Hero } from "@/components/Hero";
import { LocalBusinessJsonLd } from "@/components/LocalBusinessJsonLd";
import { HowItWorks } from "@/components/HowItWorks";
import { MapaFincas } from "@/components/MapaFincas";
import { Origin } from "@/components/Origin";
import { ProductCards } from "@/components/ProductCards";
import { Recipes } from "@/components/Recipes";
import { Testimonials } from "@/components/Testimonials";
import { TrustBar } from "@/components/TrustBar";

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
