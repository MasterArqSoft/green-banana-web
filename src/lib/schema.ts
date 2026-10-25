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

// Datos comunes a los dos idiomas (spec/03-plan.md D7): IDs, cifras y estado de
// confirmación viven una sola vez en src/content/; los textos, en cada catálogo de idioma.
// Un texto por idioma, con la clave = id del dato común (content.ts comprueba que coincidan).
const textosPorId = <T extends z.ZodType>(textos: T) => z.record(slug, textos);

export const productsSchema = z
  .array(
    z.strictObject({
      id: z.enum(["unit", "kg", "bag", "box"]),
      approxWeightG: approxWeightG.optional(),
      approxUnits: text.optional(),
      // Cifras aún sin confirmar con el proveedor (T-03): se muestran entre corchetes y
      // bloquean el build de producción. Se borra el campo al confirmarlas.
      pendingConfirmation: z
        .array(z.enum(["approxWeightG", "approxUnits"]))
        .optional(),
    }),
  )
  .min(1)
  .superRefine(uniqueIds);

export const productTextsSchema = textosPorId(
  z.strictObject({ label: text, callLabel: text, imageAlt: text }),
);

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
  .array(z.strictObject({ id: slug, time: text }))
  .min(1)
  .superRefine(uniqueIds);

export const recipeTextsSchema = textosPorId(
  z.strictObject({ name: text, description: text, imageAlt: text }),
);

// FR-12: solo testimonios reales y autorizados. Vacío (la sección no se publica, AC-11)
// o de 3 a 5 testimonios. Nombre, foto y autorización son comunes; el texto, por idioma.
export const testimonialsSchema = z
  .array(
    z.strictObject({
      id: slug,
      name: text,
      // Nombre de la foto en fotos-originales/testimonio-<photo>.png; npm run images la
      // publica optimizada (testimonialImage en src/lib/images.ts).
      photo: slug,
      // Constancia de que la persona autorizó publicar su testimonio y su foto.
      authorized: z.literal(true),
    }),
  )
  .superRefine(uniqueIds)
  .refine(
    (items) => items.length === 0 || (items.length >= 3 && items.length <= 5),
    {
      message: "Deben ser 0 testimonios (sección oculta) o entre 3 y 5",
    },
  );

export const testimonialTextsSchema = textosPorId(
  // context: negocio o barrio.
  z.strictObject({ context: text, text, photoAlt: text }),
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
    // Título de las páginas legales, p. ej. "Términos y condiciones | Marca".
    legalTitle: textWith("pagina").includes("{marca}", {
      message: "Debe incluir el marcador {marca}",
    }),
    description: text,
    ogImageAlt: text,
  }),
  // Franja visible fuera de producción (decisión D-11).
  demoNotice: text,
  callButton: z.strictObject({
    label: text,
    // Nombre para lectores de pantalla; debe empezar con {texto} (WCAG 2.5.3).
    accessibleName: textWith("texto").and(textWith("telefono")),
    // Con contexto (p. ej. la presentación), para que los botones se distingan en la
    // lista de enlaces del lector de pantalla (UX-02, T-59). También empieza con {texto}.
    accessibleNameWithContext: textWith("texto")
      .and(textWith("contexto"))
      .and(textWith("telefono")),
  }),
  topBar: z.strictObject({
    acopio: textWith("ciudad"),
    phone: textWith("telefono"),
  }),
  // FR-02.
  hero: z.strictObject({
    title: textWith("ciudad"),
    subtitle: text,
    primaryCta: text,
    secondaryCta: text,
    note: text,
    imageAlt: text,
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
    exampleValues: z.strictObject({
      producer: text,
      municipality: text,
      department: text,
    }),
    title: textWith("municipio").and(textWith("ciudad")),
    text: textWith("productor").and(textWith("municipio")),
    steps: z.array(text).length(3, "El esquema de origen tiene 3 pasos"),
    batch: textWith("codigo").and(textWith("fecha")),
    imageAlt: text,
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
    exampleValues: z.strictObject({
      razonSocial: text,
      direccion: textWith("ciudad"),
    }),
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
  // FR-19: retorno al inicio desde las páginas legales.
  // Página 404 propia (hallazgo del arquitecto, 2026-10-24): con el diseño del sitio y un
  // <main> como destino de "Saltar al contenido". El título de la pestaña usa seo.legalTitle.
  notFound: z.strictObject({ title: text, text }),
  // skipToContent: enlace "Saltar al contenido" (UX-08, T-58, WCAG 2.4.1).
  navigation: z.strictObject({ backHome: text, skipToContent: text }),
  // Selector de idioma (FR-26): cada idioma con su propio nombre («Español», «English»).
  language: z.strictObject({
    navLabel: text,
    names: z.strictObject({ "es-CO": text, en: text }),
  }),
  // FR-24. El aviso (consent) va antes del botón y es la base del consentimiento (AC-19).
  // zoomIn, zoomOut y closePopup reemplazan los textos en inglés de Leaflet.
  map: z.strictObject({
    title: text,
    text,
    showButton: text,
    consent: text,
    privacyUrl: z.url({ protocol: /^https$/ }),
    privacyLink: text,
    loading: text,
    error: text,
    // Botón tras un error: Leaflet no descargó o no cargó ninguna tesela (H-03, H-04, T-69).
    retry: text,
    // Aviso discreto si faltan teselas en la vista y el mapa sigue usable (H-03, T-79).
    partial: text,
    listTitle: text,
    // Detalle del acopio en la lista y en el popup del mapa.
    acopioDetail: textWith("municipio"),
    attribution: text,
    zoomIn: text,
    zoomOut: text,
    closePopup: text,
    // Nombres del mapa ilustrado (fondo antes de "Ver mapa"); una o dos líneas cada uno.
    previewLabels: z.strictObject({
      sea: z.array(text).min(1).max(2),
      lagoon: z.array(text).min(1).max(2),
      sierra: z.array(text).min(1).max(2),
    }),
  }),
});

// Mapa de fincas de origen (FR-24, spec/03-plan.md §5). Ficticias hasta RP-02.
// El nombre se traduce (p. ej. el del acopio): va en el catálogo de cada idioma.
const finca = z.strictObject({
  id: slug,
  tipo: z.enum(["finca", "acopio"]),
  municipio: text,
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  productor: text,
});

export const fincasSchema = z.strictObject({
  // Vista inicial solo si no hay ubicaciones; con ubicaciones el mapa se ajusta a ellas.
  centro: z.strictObject({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  zoom: z.number().int().min(5).max(15),
  fincas: z.array(finca).superRefine(uniqueIds),
});

export const fincaNamesSchema = textosPorId(text);

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
export type Zone = z.infer<typeof zonesSchema>[number];
export type FaqItem = z.infer<typeof faqSchema>[number];
export type Origin = z.infer<typeof originSchema>;
export type Copy = z.infer<typeof copySchema>;
export type Legal = z.infer<typeof legalSchema>;
// Tipos compuestos: dato común + texto del idioma (content.ts los arma).
export type Presentation = z.infer<typeof productsSchema>[number] &
  z.infer<typeof productTextsSchema>[string];
export type Recipe = z.infer<typeof recipesSchema>[number] &
  z.infer<typeof recipeTextsSchema>[string];
export type Testimonial = z.infer<typeof testimonialsSchema>[number] &
  z.infer<typeof testimonialTextsSchema>[string];
export type Finca = z.infer<typeof fincasSchema>["fincas"][number] & {
  nombre: z.infer<typeof fincaNamesSchema>[string];
};
export type Fincas = Omit<z.infer<typeof fincasSchema>, "fincas"> & {
  fincas: Finca[];
};
/** Finca sin el productor: lo que dibujan el mapa interactivo y el ilustrado. */
export type Ubicacion = Omit<Finca, "productor">;
/** Textos del mapa que recibe el componente cliente (solo los que usa). */
export type MapaTextos = Pick<
  Copy["map"],
  | "title"
  | "showButton"
  | "loading"
  | "error"
  | "retry"
  | "partial"
  | "acopioDetail"
  | "attribution"
  | "zoomIn"
  | "zoomOut"
  | "closePopup"
>;
export type LegalPageKey = Exclude<keyof Legal, "draftNotice">;
