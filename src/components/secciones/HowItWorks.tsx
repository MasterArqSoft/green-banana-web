import { getContent } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

// Cómo funciona (FR-09): tres pasos numerados. El número lo da la lista ordenada.
export function HowItWorks({ locale }: { locale: Locale }) {
  const { copy } = getContent(locale);
  const { howItWorks } = copy;
  return (
    <section
      id="como-funciona"
      aria-labelledby="como-funciona-titulo"
      className="bg-hoja-claro"
    >
      <div className="contenedor py-12">
        <h2
          id="como-funciona-titulo"
          className="text-2xl font-semibold text-hoja md:text-3xl"
        >
          {howItWorks.title}
        </h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {howItWorks.steps.map((step, index) => (
            <li
              key={step.highlight}
              className="flex items-start gap-4 rounded-card bg-white p-5 shadow-suave"
            >
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-hoja font-display text-lg font-semibold text-white"
              >
                {index + 1}
              </span>
              <p className="pt-1.5">
                <strong className="text-hoja">{step.highlight}</strong>{" "}
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
