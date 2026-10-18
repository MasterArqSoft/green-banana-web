import { Leaf } from "lucide-react";
import { CallButton } from "@/components/CallButton";
import { copy, site } from "@/lib/content";
import { fill } from "@/lib/template";

// Hero (FR-02): H1 con propuesta de valor y acopio, usos, CTA Llamar, CTA "Ver origen"
// y microcopy. Sin precio. En móvil el texto va primero para que el H1 y el botón
// se vean sin hacer scroll (AC-01).
export function Hero() {
  const { hero } = copy;
  return (
    <section
      aria-labelledby="hero-titulo"
      className="contenedor grid gap-8 py-8 md:grid-cols-2 md:items-center md:py-16"
    >
      <div className="flex flex-col gap-4">
        <h1
          id="hero-titulo"
          className="text-3xl leading-tight font-semibold text-hoja md:text-5xl"
        >
          {fill(hero.title, { ciudad: site.acopio.city })}
        </h1>
        <p className="text-lg">{hero.subtitle}</p>
        <div className="flex flex-wrap gap-3">
          <CallButton label={hero.primaryCta} />
          {/* La sección de origen llega con T-17. */}
          <a
            href="#origen"
            className="inline-flex min-h-12 items-center justify-center rounded-control border-2 border-hoja px-6 font-semibold text-hoja transition-colors hover:bg-hoja-claro"
          >
            {hero.secondaryCta}
          </a>
        </div>
        <p className="text-sm">{hero.note}</p>
      </div>

      {/* Espacio reservado con la proporción de la foto (móvil 4:5, escritorio 16:10)
          para que no haya saltos de diseño al agregarla (CLS). */}
      <div className="flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-card bg-hoja-claro text-hoja md:aspect-[16/10]">
        <Leaf aria-hidden="true" className="size-12" />
        <p className="text-sm font-semibold">{hero.imagePending}</p>
      </div>
    </section>
  );
}
