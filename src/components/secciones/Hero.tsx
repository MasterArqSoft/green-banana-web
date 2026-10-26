import type { CSSProperties } from "react";
import { HeroProfundidad } from "@/components/cliente/HeroProfundidad";
import { CallButton } from "@/components/ui/CallButton";
import { assetPath, imageSrc } from "@/lib/asset";
import { getContent } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { HERO_PROFUNDIDAD, IMAGES } from "@/lib/images";
import { ESCALA } from "@/lib/parallax";
import { fill } from "@/lib/template";

// Rutas públicas (con el prefijo de la demo) de las capas de una foto del hero.
const rutasCapas = (
  capas: Record<"profundidad" | "fondo" | "alfa", string>,
) => ({
  profundidad: assetPath(`/images/${capas.profundidad}`),
  fondo: assetPath(`/images/${capas.fondo}`),
  alfa: assetPath(`/images/${capas.alfa}`),
});

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
      className="contenedor grid grid-cols-1 gap-6 py-6 md:grid-cols-2 md:items-center md:gap-8 md:py-16"
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

      {/* Foto cuadrada en móvil, con el punto focal en el racimo (la foto vertical tiene
          fondo arriba que no aporta), y horizontal 16:10 desde md. Es la única con
          prioridad alta: es el LCP. HeroProfundidad le agrega, después de cargar, el
          efecto de profundidad; sin él, la foto queda igual. Va ampliada por ESCALA (el
          margen del desplazamiento: 4,5 % en móvil, 5,4 % en escritorio para que el eje
          vertical tenga recorrido), también sin el efecto, para que el lienzo
          coincida con ella al aparecer. Se amplía con su tamaño de layout y no con
          transform: escalada por el compositor se veía más blanda (revisión de nitidez). */}
      <HeroProfundidad
        className="aspect-square md:aspect-[16/10]"
        capas={{
          escritorio: rutasCapas(HERO_PROFUNDIDAD.escritorio),
          movil: rutasCapas(HERO_PROFUNDIDAD.movil),
        }}
      >
        <picture className="block">
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
            style={
              {
                "--escala-movil": ESCALA.movil,
                "--escala-escritorio": ESCALA.escritorio,
              } as CSSProperties
            }
            className="absolute top-[calc((1-var(--escala))*50%)] left-[calc((1-var(--escala))*50%)] h-[calc(var(--escala)*100%)] w-[calc(var(--escala)*100%)] max-w-none object-cover object-[50%_80%] [--escala:var(--escala-movil)] md:object-center md:[--escala:var(--escala-escritorio)]"
          />
        </picture>
      </HeroProfundidad>
    </section>
  );
}
