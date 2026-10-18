import { FreshInfo } from "@/components/FreshInfo";
import { Hero } from "@/components/Hero";
import { Origin } from "@/components/Origin";
import { ProductCards } from "@/components/ProductCards";
import { Recipes } from "@/components/Recipes";
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
      <Recipes />
    </main>
  );
}
