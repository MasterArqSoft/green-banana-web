import { z } from "zod";
import { PHONE_E164_CO } from "@/lib/tel";

// Esquemas del contenido editable (spec/03-plan.md §5). Se validan en cada build
// desde src/lib/content.ts: un dato inválido o faltante rompe la compilación.
// Todos los objetos son estrictos: un campo no previsto (por ejemplo un precio) es un error.

const text = z.string().trim().min(1, "No puede estar vacío");

// Teléfono colombiano en formato E.164: +57 y 10 dígitos (misma regla que src/lib/tel.ts).
const phone = z
  .string()
  .regex(
    PHONE_E164_CO,
    "Debe tener formato E.164 colombiano: +57 y 10 dígitos",
  );

const slug = z
  .string()
  .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones");

// Peso en gramos: un valor aproximado o un rango [mínimo, máximo].
const grams = z.number().int().positive();
const approxWeightG = z.union([grams, z.tuple([grams, grams])]);

function uniqueIds<T extends { id: string }>(items: T[], ctx: z.RefinementCtx) {
  const seen = new Set<string>();
  items.forEach((item, index) => {
    if (seen.has(item.id)) {
      ctx.addIssue({
        code: "custom",
        message: `id repetido: ${item.id}`,
        path: [index, "id"],
      });
    }
    seen.add(item.id);
  });
}

export const siteSchema = z.strictObject({
  brand: text,
  // URL pública del sitio, sin "/" final (canónica, sitemap, Open Graph). Hoy, la demo
  // en GitHub Pages; el dominio propio llega con RP-01.
  url: z
    .url({ protocol: /^https$/ })
    .refine((value) => !value.endsWith("/"), "Sin / al final"),
  phone,
  // true mientras el número sea ficticio. Bloquea el build de producción (riesgo R5).
  phoneIsPlaceholder: z.boolean(),
  schedule: text,
  legal: z.strictObject({
    razonSocial: text,
    nit: text,
    direccion: text,
    correo: z.email("Debe ser un correo válido"),
  }),
  sicUrl: z.url({ protocol: /^https$/ }),
  acopio: z.strictObject({ city: text, department: text }),
});

export const presentationSchema = z.strictObject({
  id: z.enum(["unit", "kg", "bag", "box"]),
  label: text,
  approxWeightG: approxWeightG.optional(),
  approxUnits: text.optional(),
  callLabel: text,
  // Cifras aún sin confirmar con el proveedor (T-03): se muestran entre corchetes y
  // bloquean el build de producción. Se borra el campo al confirmarlas.
  pendingConfirmation: z
    .array(z.enum(["approxWeightG", "approxUnits"]))
    .optional(),
});

export const productsSchema = z
  .array(presentationSchema)
  .min(1)
  .superRefine(uniqueIds);

export const zonesSchema = z
  .array(
    z.strictObject({
      name: text,
      type: z.enum(["punto_de_venta", "municipio"]),
    }),
  )
  .min(1);

export const faqSchema = z
  .array(z.strictObject({ id: slug, question: text, answer: text }))
  .min(1)
  .superRefine(uniqueIds);

export const recipesSchema = z
  .array(
    z.strictObject({ id: slug, name: text, time: text, description: text }),
  )
  .min(1)
  .superRefine(uniqueIds);

// FR-12: solo testimonios reales y autorizados. Vacío (la sección no se publica, AC-11)
// o de 3 a 5 testimonios.
export const testimonialsSchema = z
  .array(
    z.strictObject({
      name: text,
      // Negocio o barrio.
      context: text,
      text,
      // Ruta en public/, p. ej. "/images/testimonios/ana.webp".
      photo: z.string().startsWith("/"),
      photoAlt: text,
      // Constancia de que la persona autorizó publicar su testimonio y su foto.
      authorized: z.literal(true),
    }),
  )
  .refine(
    (items) => items.length === 0 || (items.length >= 3 && items.length <= 5),
    {
      message: "Deben ser 0 testimonios (sección oculta) o entre 3 y 5",
    },
  );

export const originSchema = z.strictObject({
  producer: text,
  municipality: text,
  department: text,
  batch: z.strictObject({ code: text, cutDate: z.iso.date() }),
});

// Texto con un marcador obligatorio, p. ej. "Acopio en {ciudad}" (se rellena con src/lib/template.ts).
const textWith = (placeholder: string) =>
  text.includes(`{${placeholder}}`, {
    message: `Debe incluir el marcador {${placeholder}}`,
  });

// Copy de la interfaz por sección (principio P9). Cada sección agrega su bloque al construirse.
export const copySchema = z.strictObject({
  // NFR-03 y 02-content-spec.md §7.
  seo: z.strictObject({
    title: textWith("marca"),
    description: text,
    keywords: z.array(text).min(1),
    ogImageAlt: text,
  }),
  // Franja visible fuera de producción (decisión D-11).
  demoNotice: text,
  callButton: z.strictObject({
    label: text,
    // Nombre para lectores de pantalla; debe empezar con {texto} (WCAG 2.5.3).
    accessibleName: textWith("texto").and(textWith("telefono")),
  }),
  topBar: z.strictObject({
    acopio: textWith("ciudad"),
    phone: textWith("telefono"),
  }),
  // FR-02. imagePending se muestra mientras no haya foto con licencia (T-04).
  hero: z.strictObject({
    title: textWith("ciudad"),
    subtitle: text,
    primaryCta: text,
    secondaryCta: text,
    note: text,
    imagePending: text,
  }),
  // FR-03: exactamente cuatro elementos. El título puede usar {ciudad}.
  trustBar: z
    .array(
      z.strictObject({
        icon: z.enum(["camion", "telefono", "escudo", "mano"]),
        title: text,
        text,
      }),
    )
    .length(4, "La franja de confianza lleva exactamente 4 elementos"),
  // FR-04. El nombre, el peso y el texto del botón de cada tarjeta vienen de products.json.
  products: z.strictObject({
    title: text,
    unitWeight: textWith("peso"),
    units: textWith("unidades"),
    note: text,
  }),
  // FR-05 "Verde de verdad".
  freshInfo: z.strictObject({
    title: text,
    text,
    tipLabel: text,
    tip: text,
  }),
  // FR-06. Los datos del productor y del lote vienen de origin.json (ficticios hasta RP-02).
  origin: z.strictObject({
    title: textWith("municipio").and(textWith("ciudad")),
    text: textWith("productor").and(textWith("municipio")),
    steps: z.array(text).length(3, "El esquema de origen tiene 3 pasos"),
    batch: textWith("codigo").and(textWith("fecha")),
    imagePending: text,
  }),
  // FR-07. Las tarjetas vienen de recipes.json; timeLabel solo lo leen los lectores de pantalla.
  recipes: z.strictObject({ title: text, timeLabel: text }),
  // FR-08. Texto cauteloso; las frases prohibidas las bloquea src/lib/claims.ts.
  benefits: z.strictObject({ title: text, text }),
  // FR-09: tres pasos; "highlight" es la palabra que va en negrita.
  howItWorks: z.strictObject({
    title: text,
    steps: z
      .array(z.strictObject({ highlight: text, text }))
      .length(3, "Cómo funciona tiene 3 pasos"),
  }),
  // FR-10. Sin horarios ni costos de envío: se informan por teléfono (AC-04).
  coverage: z.strictObject({
    title: text,
    acopioLabel: text,
    acopio: textWith("ciudad"),
    distributionLabel: text,
    distribution: textWith("zonas"),
    notListed: text,
  }),
  // FR-11. Sin formulario: el formulario B2B es el roadmap R-06.
  business: z.strictObject({ title: text, text: textWith("ciudad") }),
  // FR-12. Solo se usa si testimonials.json tiene testimonios reales.
  testimonials: z.strictObject({ title: text }),
  // FR-13. Las preguntas y respuestas vienen de faq.json.
  faq: z.strictObject({ title: text }),
  // FR-14. La política definitiva es RP-04; legalNote es la exclusión de retracto (Ley 1480).
  guarantee: z.strictObject({ title: text, text, legalNote: text }),
  // FR-15.
  finalCta: z.strictObject({ title: text }),
  // FR-16. Los datos legales vienen de site.json; aquí solo las etiquetas.
  footer: z.strictObject({
    labels: z.strictObject({
      razonSocial: text,
      nit: text,
      direccion: text,
      telefono: text,
      correo: text,
    }),
    navLabel: text,
    links: z.strictObject({
      terminos: text,
      privacidad: text,
      garantia: text,
    }),
    pqr: text,
    sic: text,
  }),
});

// Páginas legales (FR-18). Los párrafos pueden usar {razonSocial}, {nit}, {direccion},
// {correo}, {telefono} y {ciudad}, que se rellenan con site.json. Borrador hasta T-05.
const legalPageSchema = z.strictObject({
  title: text,
  description: text,
  sections: z
    .array(z.strictObject({ heading: text, paragraphs: z.array(text).min(1) }))
    .min(1),
});

export const legalSchema = z.strictObject({
  // Aviso visible mientras el texto no tenga revisión jurídica (T-05, T-42).
  draftNotice: text.optional(),
  terminos: legalPageSchema,
  privacidad: legalPageSchema,
  garantia: legalPageSchema,
});

export type Site = z.infer<typeof siteSchema>;
export type Presentation = z.infer<typeof presentationSchema>;
export type Zone = z.infer<typeof zonesSchema>[number];
export type FaqItem = z.infer<typeof faqSchema>[number];
export type Recipe = z.infer<typeof recipesSchema>[number];
export type Origin = z.infer<typeof originSchema>;
export type Testimonial = z.infer<typeof testimonialsSchema>[number];
export type Copy = z.infer<typeof copySchema>;
export type LegalPageKey = Exclude<
  keyof z.infer<typeof legalSchema>,
  "draftNotice"
>;
