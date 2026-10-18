# Bitácora del proyecto

Registro de lo que se hace en cada sesión: decisiones, cambios y archivos tocados. La entrada más reciente va arriba.
No es fuente de verdad: si algo contradice los specs, ganan los specs (`spec/05-alcance-y-roadmap.md` primero). Los pendientes vigentes viven en `spec/05-alcance-y-roadmap.md` §5 y §7, y el estado de cada tarea en `spec/04-tasks.md` ("Estado de avance").

---

## 2026-10-18: resumen de la sesión y alineación de la documentación

Primera sesión del proyecto: de los specs sin código a la demo publicada.

### Qué se hizo, en orden
1. **`CLAUDE.md` y specs alineados con el alcance** (`05`): incoherencias corregidas, POC/MVP, reparto a hogares y puntos de venta (Q15), nuevas RP-04 y RP-05 y preguntas Q16 a Q18.
2. **Bitácora en el repositorio:** el contexto vive en Git, no en la memoria local de Claude.
3. **T-07 a T-11 (Fase 1):** Next.js 16 con exportación estática, repositorio público en GitHub, demo en GitHub Pages, Zod, `tel.ts`, Vitest, tokens de diseño y `npm run validate`.
4. **Fase 2 completa:** las 14 secciones, el pie, el botón flotante y la composición revisada a 360 px. Decisiones del camino:
   - copy en `copy.json` con marcadores;
   - botón Llamar `#0F7A41` por contraste;
   - acordeón nativo sin JavaScript;
   - botón flotante compacto.
5. **Legal y SEO:** pie legal, páginas legales en borrador, metadatos, `sitemap.xml` y `robots.txt` (la demo no se indexa) y JSON-LD.
6. **Calidad:**
   - presupuesto de peso automático;
   - Lighthouse local;
   - Playwright con 32 pruebas e2e;
   - axe sin infracciones;
   - revisión de textos con bloqueo de frases prohibidas y de datos ficticios en producción;
   - Dependabot.
7. **Fotos:** 12 generadas con ChatGPT, 3 recortadas por plátano hartón; AVIF, WebP y `srcset`.
8. **Historial sin atribución a Claude:** reescrito por el usuario.

### Estado al cierre
- `npm run validate` pasa: 160 pruebas unitarias, 32 e2e, presupuesto de 267 KB de 300 y 0 vulnerabilidades en producción.
- Lighthouse móvil: Rendimiento 90-96, Accesibilidad 100, Buenas prácticas 100 y SEO 100.
- Estado por tarea: `spec/04-tasks.md` → "Estado de avance".
- Build de producción bloqueado por **31 datos ficticios o por confirmar**: es el checklist para publicar.

### Pendientes del usuario
- RP-01 a RP-05.
- T-03: confirmaciones del proveedor.
- T-05: texto legal.
- R-08: hosting de producción, que bloquea T-32 y T-43.
- T-36: Google Business Profile.
- T-38 manual: lector de pantalla.
- Confirmar si se acepta el riesgo de `braces` (T-40).
- Conflicto D-11: sin cabeceras de seguridad en la demo.

### Alineación de la documentación (esta entrada)
- `CLAUDE.md` reorganizado:
  - se quitó lo obsoleto (demo "por publicar", RP-01 a RP-03, ruta `og.png`, hero con "espacio reservado", 265 KB, riesgo de `braces` como "aceptado" sin confirmación, "Empieza por la Fase 1");
  - el estado larguísimo se reemplazó por un resumen y la referencia a `04-tasks.md`;
  - se agregaron el stack con versiones y la regla de no descartar cambios sin commit.
- `README.md`: demo, stack, todos los comandos, edición de contenido y despliegue.
- `spec/04-tasks.md`: nueva sección "Estado de avance" (hechas, provisionales, parciales y pendientes).
- Las versiones de los specs siguen en 1.3, aunque tuvieron muchos ajustes en esta sesión. [POR CONFIRMAR] si se sube la versión (p. ej. a 1.4) en `05` §8.

---

## 2026-10-18: historial sin atribución a Claude

### Cambios
- El usuario ejecutó en su terminal `git filter-branch` sobre `main` para borrar la línea `Co-Authored-By: Claude` de todos los commits; luego `git push --force-with-lease` y borró el respaldo `refs/original`. El modo automático de Claude Code bloquea esos comandos, así que los corre el usuario.
- Cambiaron los hash de todos los commits (el último pasó de `e3a47c1` a `6bfd67f`).

### Verificado
- 0 commits con la línea, tanto en local como en `origin/main`.
- La API de colaboradores de GitHub solo muestra `MasterArqSoft`.
- El despliegue de la demo para `6bfd67f` terminó bien. `/`, `/terminos`, el hero móvil y `og.jpg` responden 200.

---

## 2026-10-18: T-40, dependencias

### Cambios
- `.github/dependabot.yml`:
  - npm semanal (lunes, hora de Bogotá), con menores y parches agrupados en un solo PR, mayores por separado y máximo 5 PR abiertos;
  - GitHub Actions, mensual.
- En GitHub, con `gh api`: **alertas de seguridad de Dependabot** y **PR automáticos de seguridad** activados.
- React y React DOM 19.3.0 → **19.3.1** (parche), con versión exacta.
- `allowScripts`: `unrs-resolver: false`. Su script de instalación (`napi-postinstall`) solo verifica o descarga el binario nativo, que ya viene incluido (el lint funciona). Así desaparece el aviso de npm en cada instalación.
- Plan §7 y T-40 actualizados: Dependabot ya no espera a R-10, porque el repositorio está en GitHub desde T-07.

### Vulnerabilidades: riesgo aceptado
- `npm audit` completo: **5 altas**, todas por `braces` (GHSA-vfj7-8cjw-p6xm, DoS por patrones muy anidados), vía `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces` 3.0.3.
- **No hay versión corregida:** 3.0.3 es la última publicada, y `npm audit fix --force` bajaría a `eslint-config-next@14`, incompatible con Next 16.
- **Impacto:** solo en el lint durante el desarrollo, con patrones fijos del proyecto. No llega al sitio publicado (`npm audit --omit=dev`: 0).
- **Decisión:** la validación sigue usando `audit:prod`. Dependabot avisará cuando haya arreglo. [POR CONFIRMAR con el usuario: aceptación del riesgo]
- Versiones mayores pendientes, sin aplicar: ESLint 10, TypeScript 7, @types/node 26. Dependabot las propondrá una por una para evaluarlas.

### Verificado
- `npm run validate` pasa: 160 pruebas unitarias, 32 e2e y presupuesto de 266,8 KB.
- API de GitHub: `vulnerability-alerts` 204 y `automated-security-fixes.enabled: true`.

---

## 2026-10-18: T-04, fotos (generadas con IA) en la página

### Decisiones del usuario
- Mientras consigue fotos reales (RP-02), las 12 imágenes se generan con **ChatGPT** a partir de los prompts del proyecto, con nombres fijos en `fotos-originales/`.

### Revisión de las imágenes
- 9 sin problemas: guineo verde, sin texto, logos, caras ni lugares.
- **Cayeye, patacón y chips** tenían plátano hartón o guineos dudosos al fondo. Se **recortaron** para dejarlos fuera, sin regenerarlas (configurado en `crop` de `images.ts`).

### Cambios
- `fotos-originales/` en `.gitignore`: los originales (~2,3 MB cada uno) no se suben.
- `sharp` 0.35.5. `src/lib/images.ts` es la configuración única de cada foto (origen, recorte, tamaño, formatos, peso máximo y versiones menores). `scripts/images.mjs` y `npm run images` generan `public/images/` y bajan la calidad hasta cumplir el peso; fallan si alguna no cabe.
- Formatos y pesos:
  - Hero: AVIF, WebP y JPG; escritorio 1600 × 1000 (81 KB en AVIF), móvil 800 × 1000 (45 KB en AVIF).
  - Tarjetas 600 × 600 ≤ 40 KB, origen 1200 × 800 ≤ 90 KB y recetas 600 × 400 ≤ 40 KB, en AVIF y WebP.
  - Imagen para redes: `og.jpg` de 1200 × 630 (74 KB), recorte del hero. Se eliminó la ruta `src/app/og.png`, que generaba la tarjeta de texto.
- `src/components/Picture.tsx`: `<picture>` con AVIF y WebP, `srcset`/`sizes`, ancho y alto explícitos y `loading="lazy"`. El hero usa dirección de arte (4:5 en móvil y 16:10 desde `md`) y `fetchPriority="high"`.
- Textos alternativos en el contenido: `imageAlt` en `products.json`, `recipes.json`, `copy.hero` y `copy.origin`. Se quitaron los `imagePending`.
- **Rendimiento:** con las fotos, el LCP de laboratorio subió a 3,5 s. Causa: Chrome descargaba en paralelo las fotos "diferidas" cercanas a la pantalla, y las tarjetas bajaban 600 px para mostrarse a 96 px. Solución: **versiones menores en `srcset`** (tarjetas 200 px, de ~5 a 9 KB; recetas 400 px; origen 600 px). Se probaron sin efecto un hero móvil de 640 × 800 y la precarga del hero; ambos se descartaron.
- `scripts/lighthouse.mjs`: fuera de producción omite `is-crawlable`, porque la demo lleva `noindex` a propósito. Con eso, el SEO vuelve a 100.
- `doc/creditos.md`: las 12 fotos como "propias ficticias, generadas con ChatGPT", con los recortes anotados.
- Pruebas `tests/unit/images.test.tsx`: cada archivo y versión existe y cumple su peso; `Picture`; prioridad del hero; textos alternativos y carga diferida en tarjetas y recetas.

### Verificado
- `npm run validate` pasa: 160 pruebas unitarias, 32 e2e y presupuesto de 266,8 KB. axe sigue sin infracciones.
- Lighthouse móvil (4 corridas): Rendimiento 90-96, Accesibilidad 100, Buenas prácticas 100 y SEO 100. LCP de laboratorio 2,4-3,3 s; LCP observado ~0,3 s.
- Capturas a 360 px y en escritorio revisadas; ninguna imagen rota.

### Abierto
- El rendimiento está apenas sobre 90 en algunas corridas: hay poco margen para agregar peso.
- RP-02: reemplazar por fotos reales y actualizar `doc/creditos.md`.
- En móvil, el botón flotante tapa por un momento el borde derecho del botón "Llamar para precio" de la última tarjeta mientras se hace scroll. Es menor.

---

## 2026-10-18: cifras de presentaciones marcadas como pendientes

### Decisiones del usuario
- **Opción A:** mientras el proveedor no las confirme (T-03), las cifras de las presentaciones se muestran entre corchetes, igual que el resto de los valores pendientes.

### Cambios
- `products.json`: cada presentación tiene `pendingConfirmation` con los campos sin confirmar (unidad y caja: peso; kilo y bolsa: unidades). Los 3 kg de la bolsa no se marcan, porque el spec no los marca.
- `formatWeight(gramos, pendiente)` y `markPending()` en `format.ts`; `ProductCards` muestra exactamente lo del spec: "~[220] g por unidad", "~[4–5] unidades", "3 kg · ~[13–15] unidades" y "[18–20] kg".
- `findPendingMarkers` cuenta un `pendingConfirmation` no vacío: el build de producción falla hasta confirmarlas y borrar el campo. **Ahora hay 31 pendientes.**
- Pruebas actualizadas y nuevas: detalle con corchetes, `formatWeight` pendiente y conteo de pendientes de productos.

### Verificado
- `npm run validate` pasa: 107 pruebas unitarias y 32 e2e.

---

## 2026-10-18: T-39, revisión de textos, imágenes y lista legal

### Resultado de la revisión

| Criterio | Resultado |
|---|---|
| **P1, honestidad:** sin contadores, escasez ni ahorros | ✓ No hay. Se agregaron al bloqueo automático "últimas unidades", "quedan pocos", "solo hoy" y "por tiempo limitado". |
| **P1, cifras con respaldo** | ⚠ Todas las cifras son del spec y están pendientes de confirmar con el negocio (T-03): pesos y unidades, vida útil, tiempos de receta y porcentaje de pintón. Las de FAQ, recetas y "Verde de verdad" se ven entre corchetes. **Las de presentaciones (220 g, 4–5, 13–15, 18–20 kg) se ven sin corchetes** (ver Abierto). |
| **P3, salud** | ✓ Solo "fuente de almidón resistente, un tipo de fibra". Bloqueo automático activo desde T-46. |
| **AC-02, sin precios** | ✓ Pruebas unitarias en cada sección y prueba e2e en las 4 páginas. |
| **AC-07, sin contadores** | ✓ |
| **AC-13, imágenes con licencia** | ✓ No hay fotos. El `favicon.ico` de la plantilla de Next.js **no era propio**: se reemplazó por `src/app/icon.svg`, dibujado para el proyecto. Íconos Lucide (ISC) y fuentes OFL registrados en `doc/creditos.md` (nuevo). |

**Lista legal (`01-spec.md` §9):**

| Ítem | Estado en el sitio |
|---|---|
| Identidad del vendedor | ✓ Pie y términos desde `site.json` (ficticios, RP-01) |
| Precio total y envío por separado | ⚠ Por teléfono: se valida en RP-03 |
| Medios de pago y tiempo de entrega | ⚠ No publicados: se evalúa en RP-03 (Q18) |
| Peso, origen y usos | ✓ Presentaciones, origen y recetas (valores por confirmar, T-03 y RP-02) |
| PQR con constancia | ⚠ Procedimiento pendiente: RP-05 |
| Enlace visible a la SIC | ✓ Pie |
| Exclusión de retracto en perecederos | ✓ Garantía y términos (AC-06) |
| Garantía de calidad | ⚠ Política pendiente: RP-04 |
| Datos personales (Ley 1581) | ⚠ Página en borrador: T-05 |
| Sin afirmaciones de salud | ✓ Bloqueo automático |
| Transporte de alimentos | — Proceso operativo, no aplica a la web |
| Facturación electrónica | — R-09, fuera de Fase 1 |

### Cambios
- **Bloqueo de producción ampliado:** con `SITE_ENV=production`, el build falla si queda cualquier `(FICTICIO)`, `[…]` o la URL `github.io` en el contenido, y lista cada uno con su ruta (`findPendingMarkers`). Cumple `00-constitution.md` §4 ("sin valores ficticios al publicar"). **Hoy hay 27:** site 6, faq 4, recipes 5, origin 4, copy 3 y legal 5. La lista sirve como checklist de RP-01 a RP-05, T-03 y T-05.
- `legal.draftNotice` ahora es opcional: se borra del JSON cuando el texto legal esté revisado.
- `src/app/favicon.ico` (plantilla) → `src/app/icon.svg` (propio).
- `doc/creditos.md`: registro de recursos y licencias; se versiona (excepción en `.gitignore`).
- Pruebas: bloqueo de producción con datos pendientes y `findPendingMarkers`. La prueba de robots en producción simula el contenido resuelto.

### Verificado
- `npm run validate` pasa: 105 pruebas unitarias y 32 e2e.

### Abierto
- Cifras de presentaciones sin corchetes: resuelto en la entrada siguiente.
- Prueba con lector de pantalla (T-38, manual).

---

## 2026-10-18: T-37 pruebas e2e y T-38 accesibilidad

### Cambios
- `@axe-core/playwright` 4.14.0.
- `tests/e2e/calls.spec.ts` (T-37):
  - todos los `tel:` de la página usan el número de `site.json` (AC-03);
  - hay un botón de llamada en la barra superior, el hero, las 4 presentaciones, la cobertura, los negocios, el CTA final y el pie;
  - ninguna de las 4 páginas muestra precios (AC-02);
  - en escritorio, con teclado (AC-09): el primer Tab llega a "Llamar" con contorno de foco visible; el acordeón se abre con Enter y se cierra con Espacio; **todos** los enlaces y preguntas visibles se alcanzan con Tab.
- `tests/e2e/a11y.spec.ts` (T-38): axe con etiquetas WCAG 2.0/2.1/2.2 A y AA en `/`, `/terminos`, `/privacidad` y `/garantia`, en móvil y escritorio. Un caso extra con todas las preguntas abiertas y el botón flotante visible.

### Verificado
- `npm run validate` pasa: 102 pruebas unitarias y 32 e2e (6 omitidas: las de móvil en escritorio y las de teclado en móvil).
- **axe: 0 infracciones** en las 4 páginas y en los dos tamaños, contraste de color incluido.

### Abierto
- **Prueba con lector de pantalla (manual, parte de T-38).** Pendiente de hacer por una persona. Sugerencia: NVDA (gratis, Windows) con Chrome, y TalkBack en Android. Revisar:
  1. Al entrar se lee el H1 y "Llamar para pedir al +57 300 000 0000".
  2. La navegación por encabezados (tecla H en NVDA) recorre todas las secciones en orden.
  3. Las preguntas frecuentes anuncian "contraído/expandido".
  4. El botón flotante redondo se anuncia como "Llamar al +57…".
  5. La franja de demo y el aviso de borrador legal se leen.

---

## 2026-10-18: T-31, SEO

### Cambios
- `site.json`: nuevo `url` (hoy `https://masterarqsoft.github.io/green-banana-web`), validado como https y sin `/` final. El dominio propio llega con RP-01, que ahora lo menciona en `05`.
- `copy.json` bloque `seo`, con los textos de `02-content-spec.md` §7: título "Guineo verde en {ciudad} | {marca}", descripción, palabras clave y texto alternativo de la imagen para redes.
- `src/lib/seo.ts`: `absoluteUrl`, `seoTitle`, `seoDescription` y `ogImage`.
- `layout.tsx` (metadatos): canónica, `hreflang="es-CO"`, Open Graph (`es_CO`, `website`), Twitter `summary_large_image` y robots. Cada página legal tiene su propia canónica.
- `src/app/og.png/route.tsx`: imagen para redes de 1200 × 630 generada en el build (fondo verde hoja, marca en amarillo y el H1). Es provisional hasta tener la foto del hero. **Se descartó la convención `opengraph-image`**: exportaba un archivo sin extensión y una URL sin el prefijo de la demo.
- `src/app/robots.ts` y `src/app/sitemap.ts`, con `dynamic = "force-static"` (obligatorio con `output: "export"`).
- `LocalBusinessJsonLd` en la página principal: nombre, URL, teléfono, correo, dirección y zonas, sin precios. Junto con `FAQPage` (T-24) cubre los datos estructurados de NFR-03.
- **Decisión: la demo no se indexa.** Fuera de producción, `<meta name="robots" content="noindex, nofollow">` y `robots.txt` con `Disallow: /`, para que Google no publique la empresa ficticia (D-11). Con `SITE_ENV=production` se permite el rastreo y se enlaza el sitemap. Plan §8 actualizado.
- Pruebas `tests/unit/seo.test.tsx`: URL absolutas, título, LocalBusiness sin precios, sitemap, y robots fuera y dentro de producción.

### Verificado
- `npm run validate` pasa: 102 pruebas unitarias, 13 e2e y presupuesto de 266,4 KB.
- Build con `basePath`: `og:image` = `https://masterarqsoft.github.io/green-banana-web/og.png` (PNG 1200 × 630, 54 KB, revisado a ojo) y canónicas correctas.

### Abierto
- Ficha de Google Business Profile (T-36), cuando haya datos reales (RP-01).
- Cambiar la imagen para redes por un recorte de la foto del hero (T-04).

---

## 2026-10-18: T-30, rendimiento y presupuesto de peso

### Cambios
- **Fuentes:** Fraunces con peso fijo 600 (el único que usan los títulos): 18 KB frente a 36,5 KB del variable. Inter sigue variable: Google entrega el mismo archivo de 48 KB aunque se pidan solo 400 y 600. Total precargado: 85 → 65 KB.
- **Accesibilidad:** en `Coverage`, el ícono estaba dentro del `<div>` de la `<dl>`, fuera de `<dt>`/`<dd>` (Lighthouse: `definition-list`, `dlitem`). Ahora va dentro del `<dt>`.
- `scripts/budget.mjs` y `npm run budget`: suma por página, con gzip como el hosting, el HTML y los JS, CSS y fuentes que referencia. Falla si supera 300 KB. Se agregó a `validate`.
- `scripts/lighthouse.mjs` y `npm run lighthouse`: Lighthouse 13.5.0 (npx) con el Chromium de Playwright y umbral ≥ 90 en las cuatro categorías (AC-08). No está en `validate` porque es lento y descarga Lighthouse.
- `tests/e2e/server.mjs` ahora comprime con gzip, como GitHub Pages. Sin eso, Lighthouse medía 668 KB y un LCP de 4,8 s irreales.
- Plan §8: el presupuesto se mide transferido con gzip, incluidas las fuentes precargadas.

### Probado y descartado
- **Webpack en lugar de Turbopack:** 191 KB frente a 190 KB de JS+CSS. Sin ganancia.
- **`experimental.inlineCss`:** el LCP solo bajaba de 2,7 a 2,6 s y el HTML pasaba de 14,5 a 29,2 KB gzip (el CSS queda duplicado en la carga de React). Revertido, con nota en `next.config.ts`.

### Verificado
- Presupuesto: inicio 265,0 KB (HTML 14,5 · JS 180,3 · CSS 5,2 · fuentes 65,0); páginas legales unos 250 KB.
- Lighthouse móvil (Moto G simulado, 4G lenta): Rendimiento 93-96, Accesibilidad 100, Buenas prácticas 100, SEO 100. LCP de laboratorio 2,6-2,8 s, CLS 0 y TBT 80-180 ms. El LCP es el H1 (texto); el tiempo de pintado observado es de solo ~0,25 s, y el resto es la simulación de red con la descarga de la fuente.
- `npm run validate` pasa.

### Abierto
- La meta LCP ≤ 2,5 s (NFR-01) es de campo (p75 de usuarios reales). Se mide tras el lanzamiento. Si en campo no se cumple, la opción es `font-display: optional` para Fraunces, que el plan hoy fija en `swap` [POR CONFIRMAR].
- El runtime de React y Next.js (~180 KB) deja ~35 KB de margen para el resto de la Fase 1. Las fotos de las secciones inferiores deben cargarse en diferido (`loading="lazy"`) para no contar.
- Cuando lleguen las fotos (T-04): convertirlas a AVIF/WebP, hero ≤ 120 KB con `fetchpriority="high"` y el resto en diferido.

---

## 2026-10-18: botón flotante compacto

### Decisiones del usuario
- En móvil, la barra superior fija (FR-01) y el botón flotante de ancho completo (FR-17) mostraban dos "Llamar" a la vez, y el flotante tapaba una franja del contenido. El usuario eligió un **flotante compacto**: botón redondo de 56 px abajo a la derecha. La barra superior no cambia.

### Cambios
- `CallButton`: nuevo `size="icon"`, redondo, con ícono de 24 px y el texto en `sr-only`. El `aria-label` se mantiene ("Llamar al +57…").
- `FloatingCall` usa `size="icon"`; `FloatingCallVisibility` se ancla a la derecha (`right-4`) en lugar de ocupar todo el ancho.
- Prueba unitaria nueva: redondo, con texto para lectores de pantalla.

### Verificado
- `npm run validate` pasa: 96 pruebas unitarias y 13 e2e. Captura a 360 px revisada: el botón no tapa el texto.

---

## 2026-10-18: T-33, composición y revisión a 360 px (con Playwright)

### Decisiones del usuario
- Instalar Playwright (y Chromium, ~118 MB) para la revisión visual, porque la extensión de Chrome no conecta. Adelanta la base de T-37.

### Cambios
- `@playwright/test` 1.64.1 y Chromium headless.
- `playwright.config.ts`: proyectos `movil-360` (360×640, táctil) y `escritorio` (1280×800). `webServer` sirve `out/` con `tests/e2e/server.mjs`, un servidor estático sin dependencias que resuelve `/terminos` → `terminos.html`, como GitHub Pages.
- `tests/e2e/layout.spec.ts` (16 casos):
  - orden de secciones FR-01 a FR-17;
  - sin desborde horizontal en las 4 páginas;
  - AC-01: H1 y "Llamar para pedir" visibles sin scroll a 360×640;
  - FR-17: el botón flotante aparece tras el hero y se esconde en el pie;
  - "Ver origen" no queda tapado por la barra fija.
- Scripts: `test:e2e` (build + Playwright). `validate` ahora incluye `playwright test`. `.gitignore`: `test-results/` y `playwright-report/`.

### Verificado
- `npm run validate` pasa: 95 pruebas unitarias y 13 e2e (3 omitidas: las de móvil en escritorio).
- Capturas a 360 px revisadas: sin desbordes; tipografía, tarjetas y contrastes correctos. La página mide unos 9.400 px de alto en móvil, sobre todo por los espacios reservados de fotos.

### Abierto
- Botón Llamar duplicado en móvil: resuelto en la entrada siguiente (flotante compacto).
- La marca se recorta en móvil ("Guineo Verde Santa M…"), así que no se ve "(FICTICIO)"; la franja de demo sí lo aclara.

---

## 2026-10-18: T-27, páginas legales (borrador)

### Cambios
- Rutas `src/app/terminos`, `src/app/privacidad` y `src/app/garantia` (FR-18). Cada una tiene su `metadata` y usa `src/components/LegalPage.tsx`: H1, aviso de borrador visible y secciones con H2.
- `src/content/legal.json` con el texto de las tres páginas y el aviso "Borrador pendiente de revisión jurídica [POR CONFIRMAR, T-05]". Los párrafos usan marcadores (`{razonSocial}`, `{nit}`, `{direccion}`, `{correo}`, `{telefono}`, `{ciudad}`) que se rellenan con `site.json`. `legalSchema` lo valida y la búsqueda de frases prohibidas también lo revisa.
- **Texto redactado como borrador por Claude**, no tomado del spec. Hay que revisarlo con el asesor jurídico (T-05, T-42). Cubre:
  - Términos: identidad del vendedor, precio por teléfono (RP-03), exclusión de retracto según la Ley 1480, art. 47 (AC-06), garantía y PQR (RP-05).
  - Privacidad: responsable, sitio sin formularios ni cookies, datos de la llamada [POR CONFIRMAR] y derechos según la Ley 1581.
  - Garantía: 24 horas con foto (RP-04) y perecedero.
- El enlace "Garantía" del pie ahora va a `/garantia` (antes `/#garantia`).
- Pruebas `tests/unit/LegalPage.test.tsx`: las tres páginas con título, aviso y sin marcadores sin rellenar ni formularios; términos con identidad y retracto; privacidad con la Ley 1581; esquema.

### Verificado
- `npm run validate` pasa con 95 pruebas. El build genera `/terminos`, `/privacidad` y `/garantia`.

### Abierto
- Revisión jurídica del texto (T-05). Puntos que debe revisar el asesor:
  - "No recoge datos personales": el hosting puede registrar direcciones IP.
  - El uso de los datos de la llamada.
- En las páginas legales el botón flotante no aparece, porque no tienen `#hero`.

---

## 2026-10-18: T-28, botón flotante de llamada

### Cambios
- `src/components/FloatingCall.tsx` (servidor) renderiza `CallButton` dentro de `FloatingCallVisibility.tsx` (`"use client"`, el único componente cliente).
  - El componente cliente observa `#hero` (id nuevo en `Hero`) y `#pie` (id nuevo en `Footer`) con `IntersectionObserver`.
  - El botón aparece cuando el hero sale de la pantalla y se esconde cuando entra el pie (FR-17).
  - Solo en móvil (`md:hidden`), fijo abajo con margen de 16 px y respeto al área segura del teléfono (`env(safe-area-inset-bottom)`).
  - Oculto, queda fuera de la pantalla y `inert` (sin foco ni lectura).
  - Sin JavaScript queda oculto; los demás botones Llamar siguen disponibles.
- En el layout, para todas las páginas.
- Pruebas `tests/unit/FloatingCall.test.tsx`: enlace `tel:`, estado inicial oculto e inerte, y solo móvil. El comportamiento al hacer scroll queda para Playwright (T-37).

### Verificado
- `npm run validate` pasa con 89 pruebas.
- Ningún archivo JS del navegador contiene datos de `site.json`; el contenido no viaja en el JavaScript del cliente.
- **Peso inicial: JS+CSS 190 KB con gzip, HTML 15 KB y fuentes 85 KB, unos 290 KB de los 300 KB del presupuesto.** Margen muy justo: T-30 debe revisarlo antes de agregar las fotos (el hero tiene 120 KB propios, aunque las imágenes diferidas no cuentan en P5).

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
- Commits con `Co-Authored-By: Claude` en el historial: resuelto (ver entrada "historial sin atribución a Claude").

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
  - El usuario no quiere que Claude aparezca como colaborador: regla en `CLAUDE.md`, sin línea `Co-Authored-By`. Los commits `T-07` y `Bitácora: detalle de T-07` la tenían; el usuario reescribió el historial más adelante (ver entrada "historial sin atribución a Claude").
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
