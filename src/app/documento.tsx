import type { ReactNode } from "react";
import { SelectorIdioma } from "@/components/cliente/SelectorIdioma";
import { DemoBanner } from "@/components/ui/DemoBanner";
import { FloatingCall } from "@/components/ui/FloatingCall";
import { SkipLink } from "@/components/ui/SkipLink";
import { Footer } from "@/components/secciones/Footer";
import { TopBar } from "@/components/secciones/TopBar";
import { getContent } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { fraunces, inter } from "./fonts";
import "./globals.css";

// Documento HTML compartido por los layouts raíz de cada idioma, (es) y (en), y por la
// 404 global (spec/03-plan.md D7, T-88). Cada uno fija su idioma: el HTML inicial ya trae
// el lang correcto y nada lo cambia después de hidratar (AC-22). Importar el contenido
// aquí hace que cada build lo valide (T-09).
export function Documento({
  locale,
  selector = true,
  children,
}: {
  locale: Locale;
  /** Selector de idioma (FR-26). La 404 no lo lleva: tiene su propia ayuda en inglés. */
  selector?: boolean;
  children: ReactNode;
}) {
  const { copy } = getContent(locale);
  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <SkipLink locale={locale} />
        <DemoBanner locale={locale} />
        <TopBar
          locale={locale}
          selector={
            selector && (
              <SelectorIdioma
                locale={locale}
                etiqueta={copy.language.navLabel}
                nombres={copy.language.names}
              />
            )
          }
        />
        {children}
        <Footer locale={locale} />
        <FloatingCall locale={locale} />
      </body>
    </html>
  );
}
