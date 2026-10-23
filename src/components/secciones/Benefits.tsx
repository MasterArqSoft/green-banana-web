import { copy } from "@/lib/content";

// Beneficios nutricionales (FR-08, prioridad Could). Solo la formulación permitida por P3:
// "fuente de almidón resistente, un tipo de fibra". Sin promesas médicas.
export function Benefits() {
  return (
    <section
      id="beneficios"
      aria-labelledby="beneficios-titulo"
      className="contenedor py-12"
    >
      <h2
        id="beneficios-titulo"
        className="text-2xl font-semibold text-hoja md:text-3xl"
      >
        {copy.benefits.title}
      </h2>
      <p className="mt-4 max-w-prose text-lg">{copy.benefits.text}</p>
    </section>
  );
}
