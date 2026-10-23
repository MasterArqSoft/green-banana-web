import type { Metadata } from "next";
import { DemoBanner } from "@/components/ui/DemoBanner";
import { FloatingCall } from "@/components/ui/FloatingCall";
import { Footer } from "@/components/secciones/Footer";
import { TopBar } from "@/components/secciones/TopBar";
import { copy, isProduction, site } from "@/lib/content";
import { absoluteUrl, ogImage, seoDescription, seoTitle } from "@/lib/seo";
import { fraunces, inter } from "./fonts";
import "./globals.css";

// Importar el contenido aquí hace que cada build lo valide (T-09).
// SEO (T-31, NFR-03): textos de copy.json; URL de site.json. La demo no se indexa (D-11).
export const metadata: Metadata = {
  // Todas las URL se arman absolutas con absoluteUrl(), que ya incluye el prefijo de la demo.
  metadataBase: new URL(site.url),
  title: seoTitle(),
  description: seoDescription(),
  keywords: copy.seo.keywords,
  alternates: {
    canonical: absoluteUrl("/"),
    languages: { "es-CO": absoluteUrl("/") },
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: site.brand,
    title: seoTitle(),
    description: seoDescription(),
    url: absoluteUrl("/"),
    images: [ogImage()],
  },
  twitter: {
    card: "summary_large_image",
    title: seoTitle(),
    description: seoDescription(),
    images: [ogImage()],
  },
  robots: isProduction
    ? { index: true, follow: true }
    : { index: false, follow: false },
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
        <Footer />
        <FloatingCall />
      </body>
    </html>
  );
}
