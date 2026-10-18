import { z } from "zod";

// Esquemas del contenido editable (spec/03-plan.md §5). Se validan en cada build
// desde src/lib/content.ts: un dato inválido o faltante rompe la compilación.
// Todos los objetos son estrictos: un campo no previsto (por ejemplo un precio) es un error.

const text = z.string().trim().min(1, "No puede estar vacío");

// Teléfono colombiano en formato E.164: +57 y 10 dígitos.
const phone = z
  .string()
  .regex(
    /^\+57\d{10}$/,
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
  // Franja visible fuera de producción (decisión D-11).
  demoNotice: text,
});

export const presentationSchema = z.strictObject({
  id: z.enum(["unit", "kg", "bag", "box"]),
  label: text,
  approxWeightG: approxWeightG.optional(),
  approxUnits: text.optional(),
  callLabel: text,
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

export const originSchema = z.strictObject({
  producer: text,
  municipality: text,
  department: text,
  batch: z.strictObject({ code: text, cutDate: z.iso.date() }),
});

export type Site = z.infer<typeof siteSchema>;
export type Presentation = z.infer<typeof presentationSchema>;
export type Zone = z.infer<typeof zonesSchema>[number];
export type FaqItem = z.infer<typeof faqSchema>[number];
export type Recipe = z.infer<typeof recipesSchema>[number];
export type Origin = z.infer<typeof originSchema>;
