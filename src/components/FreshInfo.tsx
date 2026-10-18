import { Lightbulb } from "lucide-react";
import { copy } from "@/lib/content";

// "Verde de verdad" (FR-05): para cocinar y no para madurar, vida útil y conservación.
export function FreshInfo() {
  const { freshInfo } = copy;
  return (
    <section
      id="verde-de-verdad"
      aria-labelledby="verde-de-verdad-titulo"
      className="contenedor py-12"
    >
      <div className="grid gap-6 md:grid-cols-[3fr_2fr] md:items-start">
        <div className="flex flex-col gap-4">
          <h2
            id="verde-de-verdad-titulo"
            className="text-2xl font-semibold text-hoja md:text-3xl"
          >
            {freshInfo.title}
          </h2>
          <p className="max-w-prose text-lg">{freshInfo.text}</p>
        </div>
        <aside className="flex gap-3 rounded-card bg-hoja-claro p-5">
          <Lightbulb aria-hidden="true" className="size-6 shrink-0 text-hoja" />
          <p>
            <strong className="text-hoja">{freshInfo.tipLabel}:</strong>{" "}
            {freshInfo.tip}
          </p>
        </aside>
      </div>
    </section>
  );
}
