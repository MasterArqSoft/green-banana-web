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
          <li
            key={product.id}
            className="flex gap-4 rounded-card bg-white p-4 shadow-suave lg:flex-col"
          >
            <div className="w-24 shrink-0 lg:w-full">
              <Picture
                spec={IMAGES.products[product.id]}
                alt={product.imageAlt}
                sizes="(min-width: 1024px) 280px, 96px"
                className="aspect-square w-full rounded-control object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
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
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm">{copy.products.note}</p>
    </section>
  );
}
