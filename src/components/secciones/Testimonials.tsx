import { Picture } from "@/components/ui/Picture";
import { copy, testimonials } from "@/lib/content";
import { testimonialImage } from "@/lib/images";
import type { Testimonial } from "@/lib/schema";

// Testimonios (FR-12). Solo reales y autorizados (P1). Sin testimonios, la sección
// no se renderiza (AC-11). `items` existe para poder probar el caso con datos.
export function Testimonials({
  items = testimonials,
}: {
  items?: Testimonial[];
}) {
  if (items.length === 0) return null;
  return (
    <section
      id="testimonios"
      aria-labelledby="testimonios-titulo"
      className="contenedor py-12"
    >
      <h2
        id="testimonios-titulo"
        className="text-2xl font-semibold text-hoja md:text-3xl"
      >
        {copy.testimonials.title}
      </h2>
      <ul className="mt-6 grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <li
            key={item.name}
            className="flex flex-col gap-4 rounded-card bg-white p-5 shadow-suave"
          >
            <blockquote className="text-lg">“{item.text}”</blockquote>
            <div className="flex items-center gap-3">
              <Picture
                spec={testimonialImage(item.photo)}
                alt={item.photoAlt}
                className="size-12 rounded-full object-cover"
              />
              <p>
                <span className="block font-semibold text-hoja">
                  {item.name}
                </span>
                <span className="text-sm">{item.context}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
