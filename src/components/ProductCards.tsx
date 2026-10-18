import { Leaf } from "lucide-react";
import { CallButton } from "@/components/CallButton";
import { copy, products } from "@/lib/content";
import { formatWeight } from "@/lib/format";
import type { Presentation } from "@/lib/schema";
import { fill } from "@/lib/template";

// Detalle de cada presentación según 02-content-spec.md §2 (FR-04):
// "~220 g por unidad", "~4–5 unidades", "3 kg · ~13–15 unidades", "18–20 kg".
function detail(product: Presentation): string {
  const parts: string[] = [];
  if (product.approxWeightG !== undefined) {
    const weight = formatWeight(product.approxWeightG);
    parts.push(
      product.id === "unit"
        ? fill(copy.products.unitWeight, { peso: weight })
        : weight,
    );
  }
  if (product.approxUnits) {
    parts.push(fill(copy.products.units, { unidades: product.approxUnits }));
  }
  return parts.join(" · ");
}

// Presentaciones (FR-04): tarjetas sin precio con botón "Llamar para precio".
export function ProductCards() {
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
            {/* Espacio reservado de la foto 1:1 (T-04); decorativo hasta tenerla. */}
            <div
              aria-hidden="true"
              className="flex aspect-square w-24 shrink-0 items-center justify-center rounded-control bg-hoja-claro text-hoja lg:w-full"
            >
              <Leaf className="size-8" />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <h3 className="text-lg font-semibold text-hoja">
                {product.label}
              </h3>
              <p className="text-sm">{detail(product)}</p>
              <CallButton
                label={product.callLabel}
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
