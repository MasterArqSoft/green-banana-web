import { CallButton } from "@/components/ui/CallButton";
import { Picture } from "@/components/ui/Picture";
import { getContent } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { formatWeight, markPending } from "@/lib/format";
import { IMAGES } from "@/lib/images";
import type { Copy, Presentation } from "@/lib/schema";
import { fill } from "@/lib/template";

// Detalle de cada presentación según 02-content-spec.md §2 (FR-04):
// "~220 g por unidad", "~4–5 unidades", "3 kg · ~13–15 unidades", "18–20 kg".
// Las cifras sin confirmar van entre corchetes, como en el spec: "~[220] g por unidad".
function detail(product: Presentation, copy: Copy, locale: Locale): string {
  const pending = product.pendingConfirmation ?? [];
  const parts: string[] = [];
  if (product.approxWeightG !== undefined) {
    const weight = formatWeight(
      product.approxWeightG,
      locale,
      pending.includes("approxWeightG"),
    );
    parts.push(
      product.id === "unit"
        ? fill(copy.products.unitWeight, { peso: weight })
        : weight,
    );
  }
  if (product.approxUnits) {
    parts.push(
      fill(copy.products.units, {
        unidades: markPending(
          product.approxUnits,
          pending.includes("approxUnits"),
        ),
      }),
    );
  }
  return parts.join(" · ");
}

// Presentaciones (FR-04): tarjetas sin precio con botón "Llamar para precio".
export function ProductCards({ locale }: { locale: Locale }) {
  const { copy, products } = getContent(locale);
  return (
    <section
      id="presentaciones"
      aria-labelledby="presentaciones-titulo"
      className="contenedor py-12"
    >
      <h2
        id="presentaciones-titulo"
        className="text-2xl font-semibold text-hoja md:text-3xl"
      >
        {copy.products.title}
      </h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          // Consulta de contenedor (DR-01, F-02): foto al lado solo si la tarjeta mide al
          // menos 18rem por dentro; más estrecha (320 px, texto aumentado, cuatro
          // columnas), foto arriba y texto debajo. Responde al ancho de la tarjeta, no al
          // de la pantalla. Con 18rem (sin aumentar el texto), la foto va arriba por debajo
          // de 22rem (352 px) de pantalla, entre 40rem y 43rem (640 a 687 px, dos columnas)
          // y desde 64rem (1024 px, cuatro columnas).
          // `sizes` (N-5): Picture antepone `auto`, que sigue el ancho real de la foto
          // (con el texto al 200 % la consulta de contenedor la sube arriba en cualquier
          // pantalla). El respaldo, para navegadores sin `auto`, repite esos cortes en rem,
          // como los media de Tailwind, de mayor a menor y sin huecos; solo decide entre
          // las versiones de 200 y 600 px. «fotos de las tarjetas a la medida» en
          // layout.spec.ts lo compara con la maqueta en cada corte, en ES y EN.
          <li
            key={product.id}
            className="@container rounded-card bg-white p-4 shadow-suave"
          >
            <div className="flex h-full flex-col gap-4 @2xs:flex-row">
              <div className="w-full shrink-0 @2xs:w-24">
                <Picture
                  spec={IMAGES.products[product.id]}
                  alt={product.imageAlt}
                  sizes="(min-width: 64rem) 17.5rem, (min-width: 43rem) 6rem, (min-width: 40rem) 18rem, (min-width: 22rem) 6rem, 18rem"
                  className="aspect-square w-full rounded-control object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <h3 className="text-lg font-semibold text-hoja">
                  {product.label}
                </h3>
                <p className="text-sm">{detail(product, copy, locale)}</p>
                <CallButton
                  locale={locale}
                  label={product.callLabel}
                  context={product.label}
                  size="sm"
                  className="mt-auto self-start"
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm">{copy.products.note}</p>
    </section>
  );
}
