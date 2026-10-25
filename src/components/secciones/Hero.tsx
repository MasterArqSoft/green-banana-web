import { CallButton } from "@/components/ui/CallButton";
import { imageSrc } from "@/lib/asset";
import { getContent } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { IMAGES } from "@/lib/images";
import { fill } from "@/lib/template";

// Hero (FR-02): H1 con propuesta de valor y acopio, usos, CTA Llamar, CTA "Ver origen"
// y microcopy. Sin precio. En móvil el texto va primero para que el H1 y el botón
// se vean sin hacer scroll (AC-01).
export function Hero({ locale }: { locale: Locale }) {
  const { copy, site } = getContent(locale);
  const { hero } = copy;
  return (
    <section
      id="hero"
      aria-labelledby="hero-titulo"
      className="contenedor grid grid-cols-1 gap-8 py-8 md:grid-cols-2 md:items-center md:py-16"
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
          <CallButton locale={locale} label={hero.primaryCta} />
          <a
            href="#origen"
            className="inline-flex min-h-12 items-center justify-center rounded-control border-2 border-hoja px-6 font-semibold text-hoja transition-colors hover:bg-hoja-claro"
          >
            {hero.secondaryCta}
          </a>
        </div>
        <p className="text-sm">{hero.note}</p>
      </div>

      {/* Foto vertical 4:5 en móvil y horizontal 16:10 desde md. Es la única con
          prioridad alta: es el LCP. */}
      <picture>
        <source
          media="(min-width: 768px)"
          type="image/avif"
          srcSet={imageSrc(IMAGES.heroDesktop, "avif")}
        />
        <source
          media="(min-width: 768px)"
          type="image/webp"
          srcSet={imageSrc(IMAGES.heroDesktop, "webp")}
        />
        <source
          media="(min-width: 768px)"
          srcSet={imageSrc(IMAGES.heroDesktop, "jpg")}
        />
        <source
          type="image/avif"
          srcSet={imageSrc(IMAGES.heroMobile, "avif")}
        />
        <source
          type="image/webp"
          srcSet={imageSrc(IMAGES.heroMobile, "webp")}
        />
        <img
          src={imageSrc(IMAGES.heroMobile, "jpg")}
          alt={hero.imageAlt}
          width={IMAGES.heroMobile.width}
          height={IMAGES.heroMobile.height}
          fetchPriority="high"
          decoding="async"
          className="aspect-[4/5] w-full rounded-card object-cover md:aspect-[16/10]"
        />
      </picture>
    </section>
  );
}
