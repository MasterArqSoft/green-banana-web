import { Hero } from "@/components/Hero";
import { ProductCards } from "@/components/ProductCards";
import { TrustBar } from "@/components/TrustBar";

// Composición de la landing. El orden final de las secciones es T-33.
export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <TrustBar />
      <ProductCards />
    </main>
  );
}
