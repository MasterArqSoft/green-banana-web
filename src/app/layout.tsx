import type { Metadata } from "next";
import { DemoBanner } from "@/components/DemoBanner";
import { TopBar } from "@/components/TopBar";
import { site } from "@/lib/content";
import { fraunces, inter } from "./fonts";
import "./globals.css";

// Importar el contenido aquí hace que cada build lo valide (T-09). El SEO completo es T-31.
export const metadata: Metadata = {
  title: `Guineo verde en Santa Marta | ${site.brand}`,
  description:
    "Landing informativa de guineo verde. Acopio y distribución en Santa Marta.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-CO"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <DemoBanner />
        <TopBar />
        {children}
      </body>
    </html>
  );
}
