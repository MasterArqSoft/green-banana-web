import type { Metadata } from "next";
import { DemoBanner } from "@/components/DemoBanner";
import { site } from "@/lib/content";
import "./globals.css";

// Importar el contenido aquí hace que cada build lo valide (T-09). El SEO completo es T-31.
export const metadata: Metadata = {
  title: `Guineo verde en Santa Marta | ${site.brand}`,
  description:
    "Landing informativa de guineo verde. Acopio y distribución en Santa Marta.",
};

// Las fuentes autoalojadas y los tokens de diseño se definen en T-10.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CO" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <DemoBanner />
        {children}
      </body>
    </html>
  );
}
