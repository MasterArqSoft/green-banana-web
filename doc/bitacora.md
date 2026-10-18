# Bitácora del proyecto

Registro de lo que se hace en cada sesión: decisiones, cambios y archivos tocados. La entrada más reciente va arriba.
No es fuente de verdad: si algo contradice los specs, ganan los specs (`spec/05-alcance-y-roadmap.md` primero). Los pendientes vigentes viven en `spec/05-alcance-y-roadmap.md` §5 y §7.

---

## 2026-10-18: T-26, pie legal

### Cambios
- `src/components/Footer.tsx` (FR-16, AC-05), en el layout para que aparezca en todas las páginas. Fondo carbón con texto crema (14,37:1). Incluye:
  - Marca y lista de definición con razón social, NIT y dirección de `site.json`.
  - Teléfono enlazado con `telHref` y correo con `mailto:`.
  - Enlaces legales con `next/link`: Términos (`/terminos`), Privacidad (`/privacidad`) y Garantía (`/#garantia`), más el enlace **visible** a la Superintendencia de Industria y Comercio (`site.sicUrl`).
  - La línea de PQR tal como está en el spec: "[POR CONFIRMAR, RP-05]".
  - Foco del teclado en crema (el verde hoja daría 2,26:1 sobre carbón).
- `copy.json` bloque `footer`: solo las etiquetas; los datos están en `site.json`.
- Pruebas `tests/unit/Footer.test.tsx`: identidad del vendedor, `tel:`, `mailto:`, SIC, PQR y enlaces legales.

### Verificado
- `npm run validate` pasa con 86 pruebas.
- Build con `basePath`: los enlaces salen como `/green-banana-web/terminos`, `/green-banana-web/privacidad` y `/green-banana-web#garantia`.

### Abierto
- `/terminos` y `/privacidad` dan 404 hasta T-27, que necesita el texto legal de T-05.
- RP-05: procedimiento de PQR con constancia.

---

## 2026-10-18: T-25 garantía y T-47 CTA final

### Cambios
- `src/components/Guarantee.tsx` (FR-14): sección `#garantia` en un recuadro con borde verde hoja y escudo. Incluye:
  - H2 "Si llega maltratado, lo reponemos".
  - Texto del reclamo en 24 horas con foto, copiado tal cual del spec, incluido "[POR CONFIRMAR política, RP-04]".
  - La aclaración legal: "no aplica el derecho de retracto" en perecederos (Ley 1480, art. 47) y que la garantía es adicional a los derechos del consumidor.
- `src/components/FinalCta.tsx` (FR-15): franja `hoja-claro` centrada con H2 "Llámanos y hablamos de tu pedido" y `CallButton`. Se eligió `hoja-claro` y no `sol` porque el botón verde sobre amarillo queda por debajo de 3:1 de contraste de borde.
- `copy.json` bloques `guarantee` y `finalCta`.
- Pruebas `tests/unit/Guarantee.test.tsx`: 24 horas, exclusión de retracto, y título con enlace `tel:` en el CTA final.

### Verificado
- `npm run validate` pasa con 82 pruebas.

### Abierto
- RP-04: política definitiva de garantía (reposición, devolución o ambas).

---

## 2026-10-18: T-23 testimonios y T-24 preguntas frecuentes

### Cambios
- **T-23** `src/components/Testimonials.tsx` (FR-12):
  - Si `testimonials.json` está vacío, no renderiza nada (AC-11). Hoy está vacío.
  - Con datos muestra cita, foto redonda, nombre y negocio o barrio.
  - `testimonialsSchema`: 0 testimonios (sección oculta) o entre 3 y 5, cada uno con `authorized: true` obligatorio como constancia de autorización.
- `src/lib/asset.ts`: `assetPath()` antepone `PAGES_BASE_PATH` a las rutas de `public/`. `next/image` no lo hace solo con un `src` de texto (docs de Next 16, basePath).
- **T-24** `src/components/Faq.tsx` (FR-13):
  - Acordeón con `<details>`/`<summary>` **nativos**: accesible por teclado y lector de pantalla y **sin JavaScript en el navegador**.
  - Las 9 preguntas de `faq.json`, con chevrón que gira al abrir.
  - JSON-LD `FAQPage`, con `<` escapado.
  - **Cambio respecto al plan:** el plan preveía un componente cliente para el acordeón. Se cambió por el nativo, que da menos peso y cumple AC-09. Actualizados `03-plan.md` (§2, §3 y §8) y `CLAUDE.md`.
- `copy.json` bloques `testimonials` y `faq`. `content.ts` carga `testimonials.json` y también le aplica la búsqueda de frases prohibidas.
- Pruebas: `tests/unit/Testimonials.test.tsx` (oculto sin datos, visible con 3, esquema y `assetPath`) y `tests/unit/Faq.test.tsx` (9 `<details>`, preguntas y respuestas, JSON-LD válido y sin la FAQ de facturación).

### Verificado
- `npm run validate` pasa con 79 pruebas.

### Abierto
- Títulos "Testimonios" y "Preguntas frecuentes": nombres de sección del spec, sin copy propio definido.

---

## 2026-10-18: T-21, para negocios

### Cambios
- `src/components/Business.tsx` (FR-11): sección `#negocios` sobre fondo verde hoja con texto blanco (6,39:1).
  - Ícono de tienda, H2 "¿Tienes tienda, hotel o punto de venta?" y "Distribuimos en {ciudad} desde nuestro acopio. Llámanos y te contamos las condiciones."
  - `CallButton` con borde blanco, para que se distinga del fondo (WCAG 1.4.11).
  - El foco del teclado se dibuja en blanco en esta sección; el verde hoja por defecto no se vería.
  - Sin formulario (R-06).
- `copy.json` bloque `business`, con `{ciudad}` obligatorio.
- Pruebas `tests/unit/Business.test.tsx`: textos, enlace `tel:` y ningún `<form>` ni campo de entrada.

### Verificado
- `npm run validate` pasa con 70 pruebas.

---

## 2026-10-18: T-20, cobertura

### Cambios
- `src/components/Coverage.tsx` (FR-10): sección `#cobertura` con H2 "Cobertura".
  - Dos tarjetas en una lista de definición: **Acopio** "Santa Marta, Magdalena" (de `site.json`) y **Distribución** "Solo en {zonas}, con reparto propio de la empresa, a hogares y puntos de venta". Las zonas salen de `zones.json`.
  - Debajo, "¿Tu barrio o tu negocio no aparece? Llámanos y te decimos si llegamos." con `CallButton`.
  - Sin horarios ni costos de envío (AC-04).
- `src/lib/format.ts`: `formatList` ("A, B y C", es-CO). Al agregar zonas en R-03, la frase se ajusta sola.
- `copy.json` bloque `coverage`; `copySchema` exige `{ciudad}` y `{zonas}`. El título "Cobertura" es el nombre de la sección en el spec.
- Pruebas `tests/unit/Coverage.test.tsx` y `formatList` en `format.test.ts`.

### Verificado
- `npm run validate` pasa con 67 pruebas.

---

## 2026-10-18: T-19, cómo funciona

### Cambios
- `src/components/HowItWorks.tsx` (FR-09): sección `#como-funciona` sobre fondo `hoja-claro`, con H2 "Cómo funciona" y una lista ordenada de 3 tarjetas.
  - Cada paso lleva un número en un círculo verde hoja (decorativo; el orden lo da `<ol>`) y la primera palabra en negrita: **Llama**, **Confirmamos**, **Recibes**.
  - 1 columna en móvil y 3 en escritorio.
- `copy.json` bloque `howItWorks` (`highlight` + `text` por paso) y `copySchema` con exactamente 3 pasos. El título "Cómo funciona" es el nombre de la sección en el spec.
- Pruebas `tests/unit/HowItWorks.test.tsx`: título, 3 pasos en `<ol>` y orden.

### Verificado
- `npm run validate` pasa con 62 pruebas.

---

## 2026-10-18: T-46, beneficios y bloqueo de frases prohibidas

### Cambios
- `src/components/Benefits.tsx` (FR-08): sección `#beneficios` con H2 "Lo que aporta" y la formulación permitida por P3: "fuente de almidón resistente, un tipo de fibra...", con la aclaración de que no sustituye la orientación de un profesional de la salud.
- `src/lib/claims.ts`: lista de frases prohibidas.
  - P3: diabetes, cáncer, pérdida de peso, perder peso, bajar de peso, adelgazar.
  - P1 y voz y tono: "el mejor", "100 % garantizado", "cupos limitados".
  - Se buscan sin tildes ni mayúsculas.
- `src/lib/content.ts`: busca esas frases en **todo** el contenido (site, products, zones, faq, recipes, origin y copy) durante el build, y falla si encuentra alguna.
- `copy.json` bloque `benefits`.
- Pruebas: `tests/unit/Benefits.test.tsx` (sección, detección de frases y formulación permitida) y la carga del contenido en `content.test.ts`.

### Verificado
- `npm run validate` pasa con 60 pruebas.
- Prueba manual: con "controla la diabetes" en `copy.json`, el build falla con "Contenido con frases prohibidas (P1, P3): diabetes". El archivo se restauró.

---

## 2026-10-18: T-18, recetas

### Cambios
- `src/components/Recipes.tsx` (FR-07): sección `#recetas` con H2 "¿Qué cocinar con guineo verde?".
  - Una tarjeta por receta de `recipes.json`: espacio reservado 3:2 para la foto (T-04), nombre, tiempo con ícono de reloj y descripción.
  - Grilla de 1 columna en móvil, 2 en `sm` y 3 en `lg`.
  - El texto "Tiempo de preparación:" solo lo leen los lectores de pantalla (`sr-only`).
  - Sin enlaces externos, como pide el spec.
- `copy.json` bloque `recipes` (título y `timeLabel`).
- Pruebas `tests/unit/Recipes.test.tsx`.

### Verificado
- `npm run validate` pasa con 55 pruebas.

### Abierto
- Los tiempos entre corchetes ("[60–90] min", etc.) se muestran tal cual hasta confirmarlos.
- Fotos de las 5 recetas (T-04).

---

## 2026-10-18: T-17, origen y trazabilidad

### Cambios
- `src/components/Origin.tsx` (FR-06): sección `#origen`, destino del botón "Ver origen" del hero, sobre fondo `hoja-claro`. Incluye:
  - H2 "De {municipio} a {ciudad}" y texto con productor, municipio y departamento de `origin.json`, más la ciudad de acopio de `site.json`.
  - Esquema en 3 pasos (Finca → Acopio en Santa Marta → Tu casa o tu negocio), en vertical en móvil y horizontal desde `sm`.
  - Lote vigente con fecha de corte ("Lote LOTE-0000 (FICTICIO) · Cortado el 15 de octubre de 2026").
  - Espacio reservado 3:2 para la foto del productor o del acopio (T-04).
  - `scroll-mt-20`, para que al saltar al ancla la barra fija no tape el título.
- `src/lib/format.ts`: `formatDate` en español de Colombia, con UTC para que la fecha no se corra un día.
- `copy.json` bloque `origin` y `copySchema`: marcadores obligatorios y exactamente 3 pasos.
- Pruebas `tests/unit/Origin.test.tsx` y `formatDate` en `format.test.ts`.

### Verificado
- `npm run validate` pasa con 51 pruebas.

### Abierto
- Origen real (finca, municipio, lote) y foto: RP-02. No mencionar Urabá ni Zona Bananera hasta confirmarlo (Q4).

---

## 2026-10-18: T-16, "Verde de verdad"

### Decisiones del usuario
- Se mantiene "Presentaciones" como título de la sección FR-04.

### Cambios
- `src/components/FreshInfo.tsx` (FR-05): sección `#verde-de-verdad` con H2 "Para cocinar, no para madurar", texto de vida útil y conservación, y un recuadro "Consejo" con ícono de bombillo. En escritorio van en dos columnas.
- `copy.json` bloque `freshInfo`, con el texto de `02-content-spec.md` copiado tal cual, incluidos "[4 y 7]" y "[POR CONFIRMAR con el proveedor]". Quedan pendientes de T-03, igual que en la FAQ.
- Pruebas `tests/unit/FreshInfo.test.tsx`.

### Verificado
- `npm run validate` pasa con 46 pruebas.

### Abierto
- T-03: confirmar la vida útil con el proveedor. Al resolverlo, actualizar `freshInfo.text` y la FAQ 3.

---

## 2026-10-18: T-15, presentaciones

### Cambios
- `src/components/ProductCards.tsx` (FR-04):
  - Sección `#presentaciones` con una tarjeta por presentación de `products.json`: nombre, detalle de peso y unidades, y `CallButton` con su `callLabel` ("Llamar para precio"). Sin precio.
  - Debajo, la nota de precio y envío por teléfono.
  - En móvil la tarjeta es horizontal, con una miniatura cuadrada a la izquierda; en escritorio son 4 columnas con la imagen arriba.
  - Espacio reservado 1:1 para la foto (T-04), decorativo (`aria-hidden`).
- `src/lib/format.ts`: `formatWeight` da "220 g", "3 kg", "1,5 kg" o "18–20 kg" (formato es-CO).
- `copy.json` bloque `products`: título, plantillas "~{peso} por unidad" y "~{unidades} unidades", y la nota.
- `products.json`: se quitó `approxWeightG: 1000` del kilo. El spec solo muestra "~4–5 unidades", y el peso repetía el nombre "Kilo".
- Pruebas `tests/unit/format.test.ts` y `tests/unit/ProductCards.test.tsx`: los 4 detalles exactos del spec, un enlace `tel:` por tarjeta, la nota y ningún precio.

### Verificado
- `npm run validate` pasa con 43 pruebas.

### Abierto
- Título de la sección: el spec no define un H2 para FR-04. Se usó "Presentaciones" y el usuario lo confirmó.
- Fotos de las 4 tarjetas (T-04).

---

## 2026-10-18: T-14, franja de confianza

### Cambios
- `src/components/TrustBar.tsx` (FR-03): cuatro elementos en una franja `hoja-claro`, 2 columnas en móvil y 4 en escritorio, con íconos Lucide (camión, teléfono, escudo y mano) en verde hoja.
- `copy.json` bloque `trustBar`: textos de `02-content-spec.md` §2, con "Acopio en {ciudad}". `copy.json` solo elige el ícono por nombre; el mapa nombre → ícono está en el componente.
- `copySchema`: exactamente 4 elementos e íconos válidos.
- `page.tsx`: `TrustBar` debajo del `Hero`.
- Pruebas `tests/unit/TrustBar.test.tsx`: 4 elementos, ciudad rellenada, ningún precio y esquema que rechaza 3 elementos.

### Verificado
- `npm run validate` pasa con 32 pruebas.

---

## 2026-10-18: T-13, hero

### Decisiones del usuario
- Construir el hero ya, con un espacio reservado hasta tener una foto con licencia (T-04).

### Cambios
- `src/components/Hero.tsx` (FR-02):
  - H1 "Guineo verde recién cortado, acopiado en {ciudad}" y subtítulo con usos.
  - CTA "Llamar para pedir" con `CallButton` y CTA secundario "Ver origen" hacia `#origen`. Ese ancla llega con T-17.
  - Microcopy de precio por teléfono y garantía. Sin precio.
  - En móvil el texto va primero (AC-01).
- Espacio reservado de la foto: panel `hoja-claro` con ícono de hoja y el texto "Foto de guineo verde pendiente". Tiene la proporción final (4:5 en móvil, 16:10 en escritorio) para que agregar la foto no cause saltos de diseño (CLS).
- `copy.json` y `copySchema`: bloque `hero`. El título exige el marcador `{ciudad}`.
- `page.tsx`: la página provisional se reemplazó por `<main>` con `Hero`. El orden final es T-33.
- Pruebas `tests/unit/Hero.test.tsx`: H1 con la ciudad, enlace `tel:`, CTA secundario y ningún precio.

### Verificado
- `npm run validate` pasa con 28 pruebas.

### Abierto
- Foto del hero (T-04): al llegar, agregar la imagen y su texto alternativo, y registrar la licencia.
- Revisión visual a 360 px, pendiente (sin extensión de Chrome).

---

## 2026-10-18: textos de interfaz en `copy.json` (principio P9)

### Decisiones del usuario
- **Opción A:** todo el copy de la interfaz vive en un archivo de contenido, no en los componentes, para que el negocio cambie textos sin tocar código.

### Cambios
- `src/content/copy.json`: un bloque por sección. Por ahora `demoNotice` (movido desde `site.json`), `callButton` (`label` y `accessibleName`) y `topBar` (`acopio` y `phone`).
- `src/lib/template.ts`: `fill()` reemplaza marcadores como `{ciudad}` o `{telefono}` con datos de `site.json`, y falla si falta un valor.
- `src/lib/schema.ts`: `copySchema`, estricto. Exige que cada texto con datos incluya su marcador; por ejemplo, rechaza "Acopio en Santa Marta" escrito a mano.
- `CallButton`, `TopBar` y `DemoBanner` toman sus textos de `copy`. Ya no queda texto escrito en los componentes, tampoco en el `aria-label`.
- Pruebas `tests/unit/template.test.ts`: `fill` y el esquema de `copy.json`.
- Specs: `03-plan.md` §3, §4 y §5 (archivo `copy.json` y regla de marcadores); `02-content-spec.md` indica dónde se implementa el copy. `CLAUDE.md`: regla "ningún componente escribe texto propio".

### Verificado
- `npm run validate` pasa con 24 pruebas.

---

## 2026-10-18: T-12, barra superior y botón de llamada

### Decisiones del usuario
- Avanzar con la Fase 2 mientras consigue las imágenes. Se necesitan 11 fotos: hero 1, presentaciones 4, origen 1 y recetas 5. La de Open Graph sale del hero.

### Cambios
- `lucide-react` (íconos, licencia ISC), como sugiere `02-content-spec.md` §5.
- `src/components/CallButton.tsx`, botón reutilizable para todos los "Llamar":
  - `href` desde `telHref(site.phone)`.
  - Nombre accesible "Llamar al +57 300 000 0000", que empieza con el texto visible (WCAG 2.5.3).
  - Alto mínimo de 44-48 px, fondo `cta` y `hoja` al pasar el mouse.
- `src/components/TopBar.tsx` (FR-01): marca, "Acopio en Santa Marta" y "Llámanos: +57 300 000 0000" (desde `site.json`), más el botón Llamar. Fija arriba en móvil (`sticky`) y estática desde `md`. La marca se recorta con puntos suspensivos si no cabe.
- `layout.tsx`: la barra va en el layout para que también aparezca en las páginas legales.
- Pruebas `tests/unit/TopBar.test.tsx`:
  - `CallButton` usa el número de `site.json` y el texto recibido.
  - `TopBar` muestra empresa, acopio y número, tiene el enlace `tel:` y no muestra precios.
  - `vitest.config.mts` ahora incluye `.test.tsx`.

### Verificado
- `npm run validate` pasa con 19 pruebas. Desplegado en la demo.
- **Sin revisión visual a 360 px:** la extensión de Chrome no estaba conectada. Queda para revisión del usuario o para T-33.

### Abierto
- Los textos cortos de interfaz ("Llamar", "Acopio en", "Llámanos:") estaban en los componentes. Resuelto en la entrada siguiente (`copy.json`).

---

## 2026-10-18: T-11, script único de validación

### Cambios
- `package.json`:
  - `npm run validate` ejecuta en orden `format:check`, `lint`, `typecheck`, `test`, `build` y `audit:prod`, y se detiene en el primer fallo. Es el comando que reutilizará la pipeline de R-10.
  - `audit:prod` = `npm audit --omit=dev --audit-level=high`: falla con vulnerabilidades altas o críticas en dependencias de producción. Las de desarrollo (5 altas conocidas, ver T-07) quedan para T-40; si se incluyeran, `validate` fallaría siempre.
  - lint-staged ahora también revisa archivos `.mts` (antes `vitest.config.mts` quedaba fuera del pre-commit).
- `CLAUDE.md`: comandos `validate` y `audit:prod`. `spec/03-plan.md` §7: alcance de `npm audit`.

### Verificado
- `npm run validate` pasa en unos 20 s.
- Con un `pricePerKg` agregado a `products.json` falla en las pruebas con "Unrecognized key: pricePerKg". El archivo se restauró.
- ESLint ya revisaba `.mts`; solo faltaba en lint-staged.

### Abierto
- El workflow de la demo (`pages.yml`) solo ejecuta `build`. Podría ejecutar `validate` para no desplegar una demo con pruebas rotas: sugerencia pendiente de aprobación.
- Decidir en T-40 qué hacer con las vulnerabilidades de dependencias de desarrollo.

---

## 2026-10-18: T-10, tokens de diseño, fuentes y layout base

### Decisiones del usuario
- **Color del botón Llamar: `#0F7A41`.** El `#128C4A` del spec daba 4,31:1 con texto blanco y no cumplía WCAG AA (4,5:1); el nuevo da 5,41:1.

### Cambios
- `src/app/globals.css`:
  - Tokens de Tailwind 4: colores `hoja`, `hoja-claro`, `sol`, `carbon`, `crema` y `cta`; radios `control` (12 px) y `card` (16 px); `shadow-suave`.
  - Fuentes `display` y `sans`.
  - Utilidad `contenedor` (máximo 72rem, margen lateral de 16 px).
  - Base: fondo crema, texto carbón, Fraunces en h1-h3, foco visible y `prefers-reduced-motion`.
- `src/app/fonts.ts`: Fraunces e Inter con `next/font/google`, subconjunto latino y `display: swap`. Se autoalojan en `_next/static/media`, sin llamadas a Google desde el navegador.
- `layout.tsx` aplica las fuentes; `DemoBanner` usa `bg-sol` y `text-carbon` (8,16:1); la página provisional usa los tokens.
- `spec/02-content-spec.md` §5: nuevo color del CTA y regla "el amarillo sol nunca es color de texto". `CLAUDE.md`: guía de tokens.

### Verificado
- Contrastes medidos: carbón/crema 14,37; blanco/cta 5,41; blanco/hoja 6,39; hoja/crema 6,19; carbón/sol 8,16; sol/crema 1,76 (no apto para texto).
- Build con `basePath`: las fuentes se precargan desde `/green-banana-web/_next/static/media/` (2 archivos latinos, ~85 KB).
- Peso inicial medido: JS+CSS 578 KB sin comprimir (178 KB con gzip), HTML 2,4 KB con gzip y fuentes 85 KB. En total, unos 265 KB transferidos frente al presupuesto de 300 KB. Casi todo es el runtime de React/Next. Revisar en T-30, porque las secciones de la Fase 2 sumarán peso.
- Pruebas, lint, typecheck y formato pasan.

---

## 2026-10-18: T-08, enlace de llamada y pruebas unitarias

### Decisiones del usuario
- Herramienta de pruebas unitarias: **Vitest**.

### Cambios
- `src/lib/tel.ts`:
  - `telHref(phone)` devuelve `"tel:+573000000000"`.
  - `formatPhone(phone)` devuelve `"+57 300 000 0000"`.
  - Ambas lanzan un error si el número no es E.164 colombiano.
  - La regla `PHONE_E164_CO` vive aquí y `schema.ts` la reutiliza, así no hay dos expresiones regulares distintas.
- `vitest` 5.0.5 y `vitest.config.mts` (alias `@/` con `resolve.tsconfigPaths`; extensión `.mts` para evitar el aviso de configuración CommonJS de Vite 8).
- `@types/node` de `^20` a `^24`, igual al Node que se usa en local y en GitHub Actions. Vitest 5 no instala con los tipos de Node 20.
- Scripts `test` (`vitest run`) y `test:watch`.
- Pruebas:
  - `tests/unit/tel.test.ts`: enlace, formato y 6 números inválidos.
  - `tests/unit/content.test.ts`: rechazo de precio (AC-02), de teléfono sin E.164 y de dato legal vacío; carga válida fuera de producción; bloqueo con `SITE_ENV=production` (riesgo R5). Cubre el pendiente de T-09.
- `spec/03-plan.md` §4: `tests/unit` (Vitest) y `tests/e2e` (Playwright). `CLAUDE.md`: comandos de pruebas y uso de `tel.ts`.

### Verificado
- `npm test`: 14 pruebas pasan. También funcionan las ejecuciones de un solo archivo y de una sola prueba por nombre.
- `lint`, `typecheck`, `build` y `format:check` pasan.

### Abierto
- `npm audit` sigue con las vulnerabilidades altas de dependencias de desarrollo (ver T-07).

---

## 2026-10-18: T-09, esquemas Zod y contenido

### Decisiones del usuario
- **Producción = `SITE_ENV=production`.** Solo la pipeline de producción la define; el build local y el de la demo pasan con datos ficticios.
- **Aviso visible de datos ficticios** fuera de producción: "Demostración: los datos de empresa y contacto son ficticios."
- Con esto, D-11 queda parcialmente resuelto; solo sigue abierto que GitHub Pages no permite cabeceras propias (CSP).

### Cambios
- Dependencia `zod` 4.6.7.
- `src/lib/schema.ts`: esquemas estrictos de `site`, `products` (sin precios), `zones`, `faq`, `recipes` y `origin`. Teléfono E.164 +57, correo y URL https validados, ids únicos y fecha de corte ISO.
- `src/lib/content.ts`: carga y valida los JSON (error legible con `z.prettifyError`), expone `isProduction` y bloquea el build de producción si `phoneIsPlaceholder` es `true`.
- `src/content/*.json`: contenido de `02-content-spec.md` con datos ficticios marcados (FAQ 1 a 9, 5 recetas, 4 presentaciones). Los valores entre corchetes se copiaron tal cual del spec (pendientes de T-03).
- `src/components/DemoBanner.tsx` y `layout.tsx`: franja de aviso y título desde `site.brand`. Así cada build valida el contenido.
- `package.json`: `typecheck` ahora ejecuta `next typegen` antes de `tsc` (sin `.next/` fallaba con `LayoutProps`).
- Specs: `05` D-11 parcial; `03` §5 con `demoNotice`, rango de peso, objetos estrictos y `SITE_ENV`; `02` con el texto del aviso. `CLAUDE.md` actualizado.

### Verificado
- Build normal: pasa, con el título y el aviso en `out/index.html`.
- `SITE_ENV=production npm run build`: falla con "Build de producción bloqueado: site.json tiene phoneIsPlaceholder: true".
- Prueba manual del esquema: agregar `pricePerKg` a un producto, un teléfono sin +57 o un NIT vacío son rechazados con mensajes claros.
- `lint` y `typecheck` pasan.

### Abierto
- Pruebas automáticas del esquema: no se pidieron en T-09; se pueden agregar con T-08, cuando exista el runner de pruebas.

---

## 2026-10-18: demo en GitHub Pages

### Decisiones del usuario
- La demo del POC/MVP se publica en **GitHub Pages**: https://masterarqsoft.github.io/green-banana-web/. Resuelve D-09. El hosting de producción sigue pendiente (R-08).

### Cambios
- `.github/workflows/pages.yml`: en cada push a `main` (o a mano) instala, construye con `basePath` y despliega `out/` en Pages. Primer workflow de GitHub Actions; la pipeline completa sigue en R-10.
- `next.config.ts`: `basePath` desde `PAGES_BASE_PATH` (vacío en local).
- GitHub Pages activado con origen "GitHub Actions" (`gh api`).
- `spec/05-alcance-y-roadmap.md`: D-09 resuelto y URL de la demo en §4. `CLAUDE.md`: demo y nota sobre el prefijo en rutas de `public/`.

### Verificado
- El build con `PAGES_BASE_PATH=/green-banana-web` genera rutas `/green-banana-web/_next/...`.

### Abierto
- D-11: modo demo, datos ficticios visibles y GitHub Pages sin cabeceras propias (CSP).
- Commits con `Co-Authored-By: Claude` todavía en el historial (pendiente de reescritura por el usuario).

---

## 2026-10-18: T-07, proyecto base y repositorio en GitHub

### Decisiones del usuario
- Repositorio **local y en GitHub**, **público** (`MasterArqSoft/green-banana-web`). Resuelve D-10.
- CI/CD (R-10) con **GitHub Actions**, por la regla "repositorio y pipeline en el mismo proveedor". La pipeline se configura más adelante.

### Cambios
- **Proyecto:** creado con `create-next-app` (Next.js 16.4.2, React 19.3, Tailwind CSS 4, ESLint 9, TypeScript, `src/`, App Router).
  - `next.config.ts`: `output: "export"` e `images.unoptimized: true`. Se quitaron `cacheComponents` y `partialPrefetching` de la plantilla porque el build falla con "PPR cannot be enabled in export mode".
  - `src/app/page.tsx` y `layout.tsx`: página provisional, `lang="es-CO"`, sin las fuentes Geist ni los enlaces a Vercel de la plantilla. Las fuentes son T-10 y la composición T-33.
  - Se borraron los SVG de ejemplo de `public/`.
  - Prettier + `eslint-config-prettier`; Husky + lint-staged en pre-commit; scripts `typecheck`, `format` y `format:check`. Se quitó `start` (no aplica a exportación estática).
  - `.prettierignore` deja fuera la documentación escrita a mano; `.gitignore` excluye `.claude/settings.local.json`.
  - `README.md` en español.
  - `.gitattributes` con finales de línea LF: tu git usa `autocrlf`, y sin esto `format:check` y el hook fallarían en un clon nuevo.
  - No se versionan `.claude/skills/` (skills de terceros; se reinstalan desde `skills-lock.json`) ni el informe de investigación de `doc/` (solo local). `doc/bitacora.md` sí se versiona.
  - Commits con el correo personal del usuario (decisión suya, queda público).
  - El usuario no quiere que Claude aparezca como colaborador: regla en `CLAUDE.md`, sin línea `Co-Authored-By`. Los commits `T-07` y `Bitácora: detalle de T-07` aún la tienen; quitarla exige reescribir el historial y hacer push forzado (pendiente de que el usuario lo autorice o lo ejecute).
- **Specs:** D-10 resuelto y nuevas decisiones en `05` §4; R-10 con proveedor GitHub Actions en `05`, `03` §6 y §10, y `04`; T-07 incluye el repositorio remoto.
- **`CLAUDE.md`:** comandos, restricciones de Next.js 16 con exportación estática; CI/CD decidido.

### Verificado
- `npm run build` genera `out/index.html`; `lint`, `typecheck` y `format:check` pasan.

### Abierto
- `npm audit`: 5 vulnerabilidades **altas** en dependencias de desarrollo (`braces` vía `eslint-config-next` → `fast-glob`). Sin arreglo compatible: `npm audit fix --force` bajaría a `eslint-config-next@14`. Las dependencias de producción tienen 0 (`npm audit --omit=dev`). Revisar en T-40: el umbral del plan §10 bloquea altas o críticas.
- `npm install` bloqueó el script de instalación de `unrs-resolver` (lo usa ESLint para resolver imports). El lint funciona; revisar si hace falta aprobarlo.
- Conflictos D-09 y D-11 siguen abiertos.

---

## 2026-10-18: alineación de specs con el alcance de la Fase 1

### Decisiones del usuario
- El reparto llega a **personas naturales y puntos de venta** (Q15, resuelto).
- La Fase 1 es un **POC/MVP**: demostración funcional con datos ficticios para dar visibilidad al negocio y apoyar el marketing. Se amplía de forma progresiva.
- La demo se publicará en **GitHub** de forma pública. Choca con algunas reglas de los specs (D-09 a D-11). Se dejan abiertos y **hay que recordárselos al usuario cuando pregunte por pendientes**.
- Política de garantía, procedimiento de PQR y publicación de medios de pago y tiempo de entrega: **sin definir**. Pasan al roadmap de producción (RP-04, RP-05 y RP-03).
- Los specs se ajustan uno a uno, con confirmación del usuario.

### Cambios
- **`CLAUDE.md`:** encabezado estándar, arquitectura resumida, estado y comandos, qué no es fuente de verdad, conflictos abiertos y uso de esta bitácora.
- **`doc/bitacora.md`:** creada. El contexto del proyecto vive en el repositorio; se eliminó la memoria local de Claude que duplicaba el recordatorio de pendientes.
- **`spec/00-constitution.md`:** propósito POC/MVP; distribución a personas naturales y puntos de venta (§1 y §3).
- **`spec/01-spec.md`:**
  - R-10 y la nueva descripción de R-08 en §3.
  - FR-06: esquema hacia hogares y puntos de venta.
  - FR-14 remite a RP-04 y FR-16 a RP-05.
  - Preguntas Q15 a Q18.
  - Lista legal §9 enlazada a RP-03, RP-04 y RP-05.
- **`spec/02-content-spec.md`:**
  - FAQ 10 (facturación) fuera de la Fase 1, va con R-09.
  - Marcadores D-01 cambiados a RP-03.
  - Copy ajustado a "hogares y puntos de venta": franja de confianza, origen, cobertura, FAQ 6 y meta description.
  - Marcadores RP-04 (garantía) y RP-05 (PQR).
- **`spec/03-plan.md`:**
  - Analítica eliminada del diagrama del botón Llamar.
  - Flecha de CI/CD marcada como R-08/R-10.
  - Quitado `src/layouts/`.
  - Cabeceras según el hosting de R-08 (con exportación estática, `next.config` no aplica cabeceras).
  - `npm audit` local y Dependabot o equivalente con R-10.
  - Riesgo R1 actualizado.
  - Roadmap técnico completo (R-03, R-04, R-05, R-10).
- **`spec/04-tasks.md`:**
  - T-07 crea solo el git local; el repositorio remoto se crea en R-10.
  - T-11 es un script local de validación, no una pipeline.
  - T-30 usa Lighthouse local.
  - T-40 queda alineada con R-10.
  - Dependencias: R-08 en T-32 y T-43; R-08 y R-10 en T-44; RP-02 a RP-05 en T-42.
  - T-33 apunta a `src/app/page.tsx`.
  - Hito del MVP y ruta crítica exigen RP-01 a RP-05.
  - Criterio de salida de la Fase 0 ajustado.
  - Nuevas RP-04 y RP-05.
- **`spec/05-alcance-y-roadmap.md`:**
  - Propósito y etapa POC/MVP.
  - Decisiones Q15 y demo en GitHub.
  - Riesgos D-06 a D-11.
  - RP-03 ampliada; nuevas RP-04 y RP-05.

### Abierto
- **Conflictos D-09 a D-11** (demo en GitHub frente al hosting de R-08, el CI/CD de R-10 y el bloqueo de `phoneIsPlaceholder`).
- **Pendientes de producción:** RP-01 a RP-05.
- **Estimaciones:** la de T-11 quizá baje (ya no incluye pipeline). Mover T-36 a la Fase 6 está sin decidir.
- **Siguiente paso:** T-07. Antes conviene decidir si el repositorio va a GitHub desde el inicio (D-10).
