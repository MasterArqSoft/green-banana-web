import { ChevronDown } from "lucide-react";
import { getContent } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import type { FaqItem } from "@/lib/schema";
import { jsonLd } from "@/lib/seo";

// Datos estructurados FAQPage (FR-13, NFR-03), escapados con jsonLd(), en el idioma
// de la página (inLanguage, FR-28).
function faqJsonLd(faq: FaqItem[], locale: Locale): string {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  });
}

// Preguntas frecuentes (FR-13). Acordeón con <details>/<summary> nativos: accesible
// por teclado y lector de pantalla sin JavaScript en el navegador (AC-09).
export function Faq({ locale }: { locale: Locale }) {
  const { copy, faq } = getContent(locale);
  return (
    <section
      id="preguntas-frecuentes"
      aria-labelledby="faq-titulo"
      className="contenedor py-12"
    >
      <h2
        id="faq-titulo"
        className="text-2xl font-semibold text-hoja md:text-3xl"
      >
        {copy.faq.title}
      </h2>
      <div className="mt-6 flex flex-col gap-3">
        {faq.map((item) => (
          <details
            key={item.id}
            id={`faq-${item.id}`}
            className="group rounded-card bg-white shadow-suave"
          >
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-card p-4 font-semibold text-hoja [&::-webkit-details-marker]:hidden">
              {item.question}
              <ChevronDown
                aria-hidden="true"
                className="size-5 shrink-0 transition-transform group-open:rotate-180"
              />
            </summary>
            <p className="px-4 pb-4">{item.answer}</p>
          </details>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqJsonLd(faq, locale) }}
      />
    </section>
  );
}
