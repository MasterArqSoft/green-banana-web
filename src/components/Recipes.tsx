import { Clock, CookingPot } from "lucide-react";
import { copy, recipes } from "@/lib/content";

// Usos y recetas (FR-07): tarjetas con foto, nombre, tiempo y descripción corta.
// Si algún día se publican recetas completas, van en la propia página, sin enlaces externos.
export function Recipes() {
  return (
    <section
      id="recetas"
      aria-labelledby="recetas-titulo"
      className="contenedor py-12"
    >
      <h2
        id="recetas-titulo"
        className="text-2xl font-semibold text-hoja md:text-3xl"
      >
        {copy.recipes.title}
      </h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <li
            key={recipe.id}
            className="flex flex-col overflow-hidden rounded-card bg-white shadow-suave"
          >
            {/* Espacio reservado de la foto 3:2 (600 × 400, T-04); decorativo hasta tenerla. */}
            <div
              aria-hidden="true"
              className="flex aspect-[3/2] items-center justify-center bg-hoja-claro text-hoja"
            >
              <CookingPot className="size-10" />
            </div>
            <div className="flex flex-col gap-2 p-4">
              <h3 className="text-lg font-semibold text-hoja">{recipe.name}</h3>
              <p className="flex items-center gap-1 text-sm font-semibold">
                <Clock aria-hidden="true" className="size-4 text-hoja" />
                <span className="sr-only">{copy.recipes.timeLabel}</span>
                {recipe.time}
              </p>
              <p className="text-sm">{recipe.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
