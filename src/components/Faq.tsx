import { ChevronDown } from "lucide-react";
import { copy, faq } from "@/lib/content";

// Datos estructurados FAQPage (FR-13, NFR-03). "<" se escapa para que ningún
// texto pueda cerrar la etiqueta <script>.
function faqJsonLd(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  }).replace(/</g, "\u003c");
}

// Preguntas frecuentes (FR-13). Acordeón con <details>/<summary> nativos: accesible
// por teclado y lector de pantalla sin JavaScript en el navegador (AC-09).
export function Faq() {
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
        dangerouslySetInnerHTML={{ __html: faqJsonLd() }}
      />
    </section>
  );
}
