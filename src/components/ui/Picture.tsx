import { assetPath } from "@/lib/asset";
import type { ImageFormat, ImageSpec } from "@/lib/images";

const MIME: Record<ImageFormat, string> = {
  avif: "image/avif",
  webp: "image/webp",
  jpg: "image/jpeg",
};

export const imageSrc = (
  spec: ImageSpec,
  format: ImageFormat,
  width = spec.width,
) =>
  assetPath(
    `/images/${spec.output}${width === spec.width ? "" : `-${width}`}.${format}`,
  );

// "a-200.avif 200w, a.avif 600w" con las versiones menores y la principal.
const srcSetFor = (spec: ImageSpec, format: ImageFormat) =>
  [...(spec.variants ?? []), spec.width]
    .map((width) => `${imageSrc(spec, format, width)} ${width}w`)
    .join(", ");

type PictureProps = {
  spec: ImageSpec;
  alt: string;
  className?: string;
  /** Ancho en pantalla para elegir la versión del srcset, p. ej. "(min-width: 1024px) 280px, 96px". */
  sizes?: string;
};

// Foto optimizada (NFR-08): <picture> con AVIF y WebP, ancho y alto explícitos (CLS 0)
// y carga diferida. Se usa <img> directo porque con exportación estática el optimizador
// de next/image está desactivado. Excepción: el hero arma su propio <picture>, porque
// cambia de foto entre móvil y escritorio (media) y es el único con prioridad alta (LCP).
export function Picture({ spec, alt, className, sizes }: PictureProps) {
  const fallback = spec.formats[spec.formats.length - 1];
  const responsive = Boolean(spec.variants?.length);
  return (
    <picture>
      {spec.formats.slice(0, -1).map((format) => (
        <source
          key={format}
          type={MIME[format]}
          srcSet={responsive ? srcSetFor(spec, format) : imageSrc(spec, format)}
          sizes={responsive ? sizes : undefined}
        />
      ))}
      <img
        src={imageSrc(spec, fallback)}
        srcSet={responsive ? srcSetFor(spec, fallback) : undefined}
        sizes={responsive ? sizes : undefined}
        alt={alt}
        width={spec.width}
        height={spec.height}
        loading="lazy"
        decoding="async"
        className={className}
      />
    </picture>
  );
}
