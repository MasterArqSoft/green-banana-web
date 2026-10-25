# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Landing Guineo Verde

## Qué es este repositorio
Landing informativa que da a conocer la empresa de venta de guineo verde. Acopio y distribución en Santa Marta (Magdalena). Fase 1 sin precios, sin pedidos y sin formularios; el contacto es por llamada telefónica. Reparto a personas naturales y puntos de venta.

El objetivo es dar visibilidad al negocio y apoyar el marketing. La Fase 1 es un POC/MVP: una demostración funcional con datos ficticios que se amplía de forma progresiva. La demo está publicada en GitHub Pages: https://masterarqsoft.github.io/green-banana-web/ (repositorio público `MasterArqSoft/green-banana-web`).

## Fuente de verdad
Lee antes de programar, en este orden:
1. `spec/05-alcance-y-roadmap.md`: alcance, roadmap (R-01 a R-10), pendientes de producción (RP-01 a RP-05) y riesgos o conflictos (D-01 a D-14). Specs en versión 1.5.
2. `spec/00-constitution.md`: principios no negociables.
3. `spec/01-spec.md`: requisitos funcionales (FR), no funcionales (NFR), criterios de aceptación (AC) y preguntas (Q1 a Q18).
4. `spec/02-content-spec.md`: copy, FAQ, recetas y dirección visual.
5. `spec/03-plan.md`: decisiones técnicas, arquitectura y estructura del repositorio.
6. `spec/04-tasks.md`: tareas por fase, con dependencias, estimaciones y **estado de avance**.

Si un spec contradice `05`, gana `05`, y el spec se corrige.

No son fuente de verdad:
- `spec/_v1.0/`: respaldo histórico de la versión 1.0. No lo uses.
- `doc/`: el informe de investigación (análisis de páginas de referencia) está solo en local, fuera de Git. Si contradice los specs, ganan los specs.
- `doc/bitacora.md`: registro de sesiones (decisiones, cambios y archivos tocados). **Léelo al empezar para retomar el contexto.**
- `doc/creditos.md`: origen y licencia de cada foto, ícono y fuente publicados.
- `doc/skills-candidatas/`: evaluación de skills externas (marketing/CRO, Vercel, accesibilidad, SEO, seguridad con OWASP, QA visual, Playwright). El 2026-10-24 el usuario instaló 8 en `.claude/skills/` (`copywriting`, `cro`, `web-design-guidelines`, `owasp-security`, `seo-local`, `seo-technical`, `visual-testing` y `exploratory-testing`; registro en `skills-lock.json`); el resto sigue como candidata. No instales skills sin su aprobación. **Si una skill contradice los specs o estas reglas (urgencia, cifras, testimonios, formularios, servicios de pago, APIs que no funcionan con `output: "export"`), ganan los specs.**

## Estado actual
Fases 1 y 2 completas; de las Fases 4 y 5, todo lo que no depende de datos o decisiones del usuario; Fase 8 (auditoría externa del 2026-10-24, T-58 a T-67) completa. El estado por tarea está en `spec/04-tasks.md` (sección "Estado de avance"). Lo que falta depende del usuario (ver "Pendientes").

Stack: Next.js 16.4 (App Router, Turbopack, exportación estática), React 19.3, TypeScript, Tailwind CSS 4, Zod 4, ESLint 9 + Prettier, Husky + lint-staged, Vitest 5, Playwright 1.64 + axe, sharp.

**ESLint sin `eslint-config-next` (T-49):** `eslint.config.mjs` arma la configuración con typescript-eslint, eslint-plugin-react, react-hooks, jsx-a11y (recommended completo) e import, todos en versión exacta. **No vuelvas a instalar `eslint-config-next` ni `@next/eslint-plugin-next`**: traen `braces` con vulnerabilidades altas sin arreglo (riesgo D-12).

## Comandos
```bash
npm run dev            # servidor de desarrollo en http://localhost:3000
npm run build          # exportación estática en out/ y, después, la CSP por <meta> en cada HTML (scripts/csp.mjs)
npm run lint           # ESLint
npm run typecheck      # next typegen && tsc --noEmit (genera los tipos de rutas como LayoutProps)
npm run format         # Prettier (escribe); format:check solo verifica
npm run validate       # TODO junto: format:check, lint, typecheck, test, build:prefijo, build, budget, playwright test, test:prefijo y audit:deps. Córrelo antes de cada commit importante; la pipeline de R-10 lo reutilizará
npm run audit:deps     # npm audit completo (producción y desarrollo), falla con altas o críticas
npm run budget         # peso inicial por página (gzip) ≤ 300 KB; requiere out/ construido. budget:prefijo mide out-pages/ (lo publicado)
npm run lighthouse     # Lighthouse móvil, mediana de 3 corridas (LH_RUNS): 4 categorías ≥ 90 (AC-08) y presupuesto de métricas de scripts/lighthouse-presupuesto.mjs (LCP ≤ 3,4 s, CLS ≤ 0,1, TBT ≤ 200 ms, medidos con el método simulado; T-75 y T-76). Informa las subpartes del LCP y el elemento LCP (T-80). LH_THROTTLING=devtools mide con throttling aplicado, solo como diagnóstico (no evalúa el presupuesto; hoy ~2,7 s de LCP); LH_SALIDA=archivo.json guarda el resumen para comparar variantes. Ningún método es el dato de campo; compara siempre con el mismo método y el mismo elemento LCP. Requiere out/; no está en validate (lento). Fuera de producción omite is-crawlable (la demo es noindex)
npm run images         # genera public/images/ desde fotos-originales/ (originales fuera de Git)
npm run icons          # regenera src/app/favicon.ico y apple-icon.png desde icon.svg (solo si cambia el ícono)
npm test               # pruebas unitarias (Vitest, tests/unit/**/*.test.{ts,tsx}); test:watch en modo vigilancia
npx vitest run tests/unit/lib/tel.test.ts        # un solo archivo
npx vitest run tests/unit/lib/tel.test.ts -t "formatPhone"   # una sola prueba por nombre
npm run test:e2e       # build + Playwright (tests/e2e/*.spec.ts) en móvil 360×640 y escritorio 1280×800
npm run build:prefijo  # build de la demo con /green-banana-web en out-pages/ (lo que publica GitHub Pages); deja out/ libre
npm run test:prefijo   # prueba de humo sobre out-pages/, servido solo bajo el prefijo (playwright.prefijo.config.ts)
npx playwright test tests/e2e/layout.spec.ts --project=movil-360   # un archivo y un proyecto (requiere out/ ya construido)
```
Pruebas e2e: `layout.spec.ts` (orden, 360 px, botón flotante, ninguna descarga de otras páginas al cargar), `calls.spec.ts` (enlaces `tel:`, sin precios, teclado y "Saltar al contenido"), `csp.spec.ts` (CSP sin violaciones en las 4 páginas, la 404, el mapa y la navegación), `a11y.spec.ts` (axe con etiquetas WCAG 2.2 AA en las 4 páginas; cualquier infracción falla) `mapa-fincas.spec.ts` (Leaflet y teselas no se piden antes de "Ver mapa", atribución, axe con el mapa cargado, errores de teselas, espera de 15 s y "Reintentar", salud por vista con fallo parcial y caída tras desplazar o acercar (T-78), y "Volver al inicio"; las teselas se interceptan con `page.route`, nunca se piden a OSM desde las pruebas) y `prefijo.spec.ts` (prueba de humo del artefacto publicado, `out-pages/` bajo `/green-banana-web/` en el puerto 4174, con `playwright.prefijo.config.ts`). **Todas importan `test` y `expect` de `tests/e2e/fixtures.ts`, no de `@playwright/test`:** cualquier error de JavaScript sin capturar en la página (`pageerror`) hace fallar la prueba. Playwright sirve `out/` con `tests/e2e/server.mjs` (puerto 4173, gzip, sin dependencias) y necesita Chromium (`npx playwright install chromium`).

Para probar el build con el prefijo de la demo: `npm run build:prefijo && npm run test:prefijo`. Con prefijo, `next.config.ts` activa `trailingSlash` (URL `/green-banana-web/terminos/`): sin él, Next pedía el payload de inicio en `/green-banana-web.txt`, fuera del sitio. Producción no lleva barra final. Con prefijo, Next no enlaza `favicon.ico` (sí `icon.svg` y `apple-icon.png`).

**Next.js 16 cambia APIs respecto a versiones anteriores** (ver `AGENTS.md`). Antes de usar una API de Next, consulta la guía en `node_modules/next/dist/docs/`. Con `output: "export"` no se pueden usar `cacheComponents`/PPR, `headers`, `redirects`, `rewrites`, Server Actions, Route Handlers con Request ni el optimizador de imágenes por defecto (`images.unoptimized: true`). `experimental.inlineCss` se probó y se descartó (duplica el CSS en el HTML).

Prettier no formatea `spec/`, `doc/`, `CLAUDE.md`, `AGENTS.md` ni `README.md` (`.prettierignore`).

## Arquitectura (resumen de `spec/03-plan.md`)
- **Capas y carpetas:** `src/app/` (rutas) → `src/components/` → `src/lib/` (lógica sin React) → `src/content/` (JSON), en un solo sentido. Los componentes se agrupan en `secciones/` (una por sección de la página), `ui/` (piezas reutilizables), `cliente/` (los únicos con `'use client'`) y `seo/` (JSON-LD). Una sección nueva va en `secciones/`. ESLint (`eslint.config.mjs`) hace fallar el lint si se rompe una capa: JSON importado fuera de `lib/content.ts`, `lib/` que importa componentes, un componente que importa `app/`, `@/lib/content` en `cliente/` (ni los módulos de `lib/` que lo cargan: un componente cliente solo importa `schema`, `template`, `format` y `tel`), `'use client'` fuera de `cliente/`, `'use server'` en cualquier parte o un `<Link>` sin `prefetch`.
- **Contenido separado del código:** los datos viven en `src/content/*.json` (`site`, `products`, `zones`, `faq`, `recipes`, `origin`, `copy`, `testimonials`, `legal`, `fincas`). Zod los valida en el build (`src/lib/schema.ts`, objetos estrictos); un dato faltante o un campo no previsto (por ejemplo, un precio) rompe la compilación.
- **Acceso al contenido:** importa siempre desde `@/lib/content` (`site`, `products`, `zones`, `faq`, `recipes`, `origin`, `copy`, `testimonials`, `legal`, `fincas`, `isProduction`), nunca los JSON directamente; ahí se validan. Solo desde componentes de servidor.
- **Textos de interfaz:** todo texto visible (títulos, botones, microcopy, `aria-label`, textos alternativos) vive en el contenido; la mayoría en `src/content/copy.json`, con un bloque por sección validado por `copySchema`. Ningún componente escribe texto propio. Si un texto combina datos, usa marcadores (`"Acopio en {ciudad}"`) y rellénalos con `fill()` de `src/lib/template.ts`. Al construir una sección, agrega su bloque a `copy.json` y a `copySchema`.
- **Modo demo y producción:** solo la pipeline de producción define `SITE_ENV=production`. Fuera de producción (local y demo) se muestra `DemoBanner` (`copy.demoNotice`), la página lleva `noindex` y `robots.txt` bloquea el rastreo.
- **Nada ficticio en producción:** con `SITE_ENV=production`, `src/lib/content.ts` falla si `site.phoneIsPlaceholder` es `true` (riesgo R5) o si queda algún `(FICTICIO)`, `[…]` (p. ej. `[POR CONFIRMAR]`, `[4 y 7]`), la URL `github.io` de la demo o un `pendingConfirmation` en `products.json` (`findPendingMarkers` en `claims.ts`). **Hoy hay 43** (10 son las fincas de `fincas.json`): esa lista es el checklist para publicar. El aviso de borrador legal (`legal.draftNotice`) es opcional y se borra cuando el texto esté revisado.
- **Frases prohibidas (P1, P3):** `src/lib/claims.ts` tiene la lista (diabetes, cáncer, pérdida de peso, "el mejor", "cupos limitados", "últimas unidades"...). `content.ts` busca esas frases en todo el contenido durante el build, sin importar tildes ni mayúsculas, y si aparece una, la compilación falla.
- **Enlace de llamada:** el `tel:` solo se genera con `telHref(site.phone)` de `src/lib/tel.ts`, y el número visible con `formatPhone(site.phone)` ("+57 300 000 0000"). La regla E.164 (`PHONE_E164_CO`) vive ahí y la reutiliza el esquema. Todos los botones Llamar usan `src/components/ui/CallButton.tsx` (props `label`, `size` y `context`. `size` es `sm`, `md` o `icon`, este último redondo solo con ícono y el texto en `sr-only`. `context` agrega al nombre accesible lo que distingue botones con el mismo texto, p. ej. la presentación, después del texto visible (WCAG 2.5.3). El número nunca se pasa por props).
- **Diseño:** usa solo los tokens de `globals.css`: colores `hoja`, `hoja-claro`, `sol`, `carbon`, `crema`, `cta` (botón Llamar: amarillo `#F2B705` con texto carbón; `cta-hover` `#E0A800`); `font-display` (Fraunces 600, ya aplicada a h1-h3) y `font-sans` (Inter); `rounded-control` (12 px), `rounded-card` (16 px), `shadow-suave`; utilidad `contenedor` para el ancho de página. `sol` nunca como color de texto, y **el amarillo se reserva para el CTA**: no lo uses como fondo de otros elementos. Nada de colores hex sueltos en componentes. Íconos: `lucide-react` con `aria-hidden="true"` si son decorativos. En secciones con fondo `hoja` o `carbon`, agrega `[&_:focus-visible]:outline-white` (o `outline-crema`), porque el foco por defecto es verde hoja y no se vería. Enlaces de texto en zonas táctiles (p. ej. el pie): `inline-flex min-h-11 items-center` (44 px).
- **JavaScript mínimo:** hay dos componentes cliente (`'use client'`, en `src/components/cliente/`):
  - `FloatingCallVisibility` (T-28): solo decide cuándo mostrar el botón flotante compacto, usando `IntersectionObserver` sobre `#hero` y `#pie`, y recibe el `CallButton` ya renderizado como `children`;
  - `MapaFincasInteractivo` (T-53, FR-24): recibe fincas y textos por props desde `MapaFincas` (servidor, que entrega el aviso y la lista accesible en HTML). Importa `leaflet` y su CSS con `import()` **solo al pulsar "Ver mapa"**: Leaflet no está en la carga inicial (AC-15) y las teselas de OpenStreetMap no se piden antes del clic (AC-19, D-13). La salud del mapa se evalúa **por vista**, no por sesión (T-79, MAP-02): registra cada tesela con los eventos públicos de Leaflet (`tileloadstart`, `tileload`, `tileerror`, `tileunload`) y, al terminar cada lote (`load`) o a los 15 s de empezarlo, cuenta solo las teselas del zoom y la vista actuales. Sin ninguna válida (al cargar, al desplazar o al acercar), destruye la instancia y vuelve al mapa ilustrado con "Reintentar" (`copy.map.retry`, T-69); el contenedor lleva `key={intento}` porque `remove()` de Leaflet deja sus clases. Con algunas, el mapa sigue usable con un aviso discreto abajo a la izquierda (`copy.map.partial`) y "Reintentar", que llama a `redraw()` (H-03, reabierto por el usuario el 2026-10-24). Nunca reintenta solo. `ready` llega con la primera evaluación, no al crear el mapa, y la evaluación se aplaza mientras el mapa se mueve: destruirlo durante la animación de zoom lanzaba un TypeError (`_leaflet_pos`). No agregues otra conexión a terceros (AC-12).

  **Mapa ilustrado (fondo antes de "Ver mapa"):** `src/lib/mapa-ilustrado.ts` genera el SVG en el build desde `src/lib/mapa-base.json` (geometría derivada de OSM, ODbL; no se formatea con Prettier), `fincas.json` y `copy.map.previewLabels`. Hay dos rutas estáticas, `src/app/mapa-fincas.svg/` y `mapa-fincas-movil.svg/`, que se cargan con `<picture>` y `loading="lazy"`. Sus colores replican los tokens (`COLORES`, verificado por una prueba). La geometría se regeneró una sola vez con Overpass y shapely; el procedimiento está en la bitácora.

  **Nunca importes `@/lib/content` en un componente cliente**: todo el contenido viajaría en el JavaScript del navegador. El acordeón de FAQ usa `<details>`/`<summary>` nativos, sin JavaScript.
- **Fotos:** se configuran en `src/lib/images.ts` (origen, recorte, tamaño, formatos, peso máximo y `variants` para srcset). `npm run images` las genera desde `fotos-originales/` (fuera de Git) en `public/images/` y falla si alguna supera su peso. En componentes usa `<Picture spec={IMAGES…} alt sizes>` (AVIF + WebP, srcset, ancho y alto explícitos, `loading="lazy"`); para recetas, `recipeImage(id)`, y para testimonios, `testimonialImage(photo)` (`photo` es el nombre de `fotos-originales/testimonio-<photo>.png` y debe ser un slug, que `testimonialImage` vuelve a comprobar porque `npm run images` lee `testimonials.json` sin pasar por Zod). Única excepción: el hero arma su propio `<picture>` (foto distinta en móvil y escritorio) y es el único con `fetchPriority="high"`. Los textos alternativos viven en el contenido (`imageAlt` en `products.json`, `recipes.json` y `copy.json`). Hoy son imágenes generadas con IA; se reemplazan en RP-02.
- **CSP (T-66):** `src/lib/csp.ts` define la política y `scripts/csp.mjs` la inserta por `<meta>` en cada HTML de `out/` con el hash de cada script en línea. **Un origen externo nuevo (script, imagen, fetch) exige actualizar `cspPolicy()`**, o `csp.spec.ts` falla. No uses `'unsafe-inline'` ni `'unsafe-eval'` en `script-src`. `npm run dev` no lleva CSP: pruébala con el build.
- **Recursos de terceros:** registra toda foto, ícono o fuente nueva en `doc/creditos.md` (origen, autor y licencia) antes de publicarla (AC-13).
- **SEO:** `src/lib/seo.ts` arma URL absolutas desde `site.url` (sin `/` final; demo hoy, dominio en RP-01). Metadatos en `layout.tsx` (textos en `copy.seo`), `robots.ts`, `sitemap.ts`, imagen para redes `public/images/og.jpg` (recorte del hero, generado por `npm run images`) y JSON-LD `LocalBusiness` (con `image` y `geo` del acopio de `fincas.json`) y `FAQPage`. Íconos: `icon.svg`, `favicon.ico` y `apple-icon.png` en `src/app/`. `/.well-known/security.txt` sale de `site.json` (`src/lib/security-txt.ts`); `pages.yml` publica carpetas ocultas (`include-hidden-files`). Sin `meta keywords`. Las rutas especiales necesitan `export const dynamic = "force-static"` con `output: "export"`.
- **Enlaces y rutas de `public/`:** usa `next/link` para enlaces internos (agrega solo el prefijo de la demo), **con `prefetch={false}`**: con exportación estática, Next descargaba completas la landing y las páginas legales al cargar, sin clic (T-61; lo vigilan ESLint y `layout.spec.ts`). Toda página tiene un `<main id={MAIN_ID}>` (`ui/SkipLink.tsx`), destino de "Saltar al contenido", también la 404 (`src/app/not-found.tsx` → `ui/NotFoundPage.tsx`, textos en `copy.notFound`); `layout.spec.ts` lo exige en las 5 rutas. Para `src` de imágenes u otros `<a>` a archivos de `public/`, usa `assetPath()` de `src/lib/asset.ts`; para la ruta de una foto de `images.ts`, `imageSrc(spec, formato, ancho?)` del mismo archivo (`images.ts` no puede tener imports: lo carga `scripts/images.mjs` con Node).
- **Rutas (App Router):** `src/app/page.tsx` (landing), las páginas legales `terminos/`, `privacidad/` y `garantia/` (desde `legal.json`) y `not-found.tsx` (404 propia). No hay carpeta `api/` en Fase 1 (R-06).
- **Sin precios en el modelo de datos:** `products.json` no tiene campos de precio; `pricePerKg` y `priceTotal` llegan con R-01.
- **Presupuesto de rendimiento:** peso inicial ≤ 300 KB transferido con gzip (HTML + JS + CSS + fuentes precargadas; lo mide `npm run budget`), imagen del hero ≤ 120 KB por archivo (también la verifica `budget`, que informa el total con el hero: hoy 311,5 KB en móvil y 347,3 KB en escritorio; P5 y T-73), ningún script de terceros. Hoy: 266 KB en la landing (con la sección del mapa; Leaflet va en un chunk aparte), de los que ~176 KB son JavaScript, casi todo el runtime de React y Next.js, que no baja. Lighthouse móvil: Rendimiento 90-96 según la corrida (92-93 el 2026-10-24, LCP de laboratorio 3,2 s), el resto 100. Hay poco margen: cada sección nueva, foto sin `srcset` o `"use client"` lo reduce.
- **Pruebas:** unitarias con Vitest en `tests/unit/` (la lógica pura de los scripts se prueba en `tests/unit/scripts/`, p. ej. el presupuesto de Lighthouse: es opcional, pero si existe debe tener su `.mjs` en `scripts/`, y `estructura.test.ts` lo verifica), que refleja `src/` (`components/secciones/`, `components/ui/`, `components/seo/` y `lib/`; la prueba de `X.tsx` es `X.test.tsx` en la carpeta equivalente, y cada módulo tiene la suya). `tests/unit/estructura.test.ts` falla si un módulo nuevo no tiene prueba, si una prueba no corresponde a ningún módulo o si un FR de `01-spec.md` falta en la matriz de `03-plan.md` §12; `components/cliente/` queda exento porque necesita navegador (lo cubren las e2e) (`.test.ts` y `.test.tsx`; los componentes se prueban con `renderToStaticMarkup` de `react-dom/server`, sin DOM; alias `@/` resuelto por `vitest.config.mts`); e2e con Playwright en `tests/e2e/`. Para probar producción se usa `vi.stubEnv("SITE_ENV", "production")` + `vi.resetModules()` y se reimporta `@/lib/content`.
- **Dependencias:** Dependabot (`.github/dependabot.yml`) abre PR semanales (menores y parches agrupados, mayores por separado) y PR de seguridad automáticos. Antes de fusionar un PR de Dependabot, revisa que pase el check `verificar` de GitHub Actions (cubre todo `validate`, incluido `npm audit`, bloqueante desde T-72). Las mayores pendientes (ESLint 10, TypeScript 7, @types/node 26) se evalúan una por una: pueden romper los plugins de ESLint. Hoy el único paquete con script de instalación es `fsevents` (opcional, solo macOS); si `npm install` avisa de uno nuevo, revísalo antes de permitirlo.

## Decisiones técnicas (cerradas)
- Next.js con exportación estática (`output: 'export'`), React, TypeScript y Tailwind CSS.
- Sin backend en Fase 1. Sin rutas de servidor, sin formularios, sin base de datos.
- Repositorio público en GitHub; CI/CD con GitHub Actions (la pipeline completa se configura en R-10).
- Demo del POC/MVP en GitHub Pages: `.github/workflows/pages.yml` la despliega en cada push a `main`, solo si antes pasa el job `verificar` (lo mismo que `validate`; `npm audit` va primero y bloquea con altas o críticas, T-72; excepciones según D-14). `verificar` construye la demo con prefijo en `out-pages/`, le pasa la prueba de humo y **sube ese mismo artefacto** a Pages; `deploy` lo publica sin reconstruir (T-71). Las e2e completas corren sobre el build sin prefijo (`out/`). En los pull requests a `main`, incluidos los de Dependabot, corre solo `verificar`, sin publicar. Las acciones van fijadas por SHA con la versión en un comentario (`@<sha> # v7.0.1`); una acción nueva se agrega igual. Los `checkout` llevan `persist-credentials: false` (ningún paso hace push).

## Pendientes (no decidir por tu cuenta)
Recuérdaselos al usuario cuando pregunte por pendientes. Detalle en `spec/05-alcance-y-roadmap.md` §5 y §7.
- **Roadmap de producción, antes de publicar:**
  - datos reales y dominio (RP-01);
  - origen y fotos reales (RP-02);
  - validación jurídica del precio por teléfono, medios de pago y tiempo de entrega (RP-03);
  - política de garantía (RP-04);
  - procedimiento de PQR con constancia (RP-05).
  
  Hasta entonces usa valores ficticios marcados como `(FICTICIO)` o `[POR CONFIRMAR]`.
- **T-03:** el proveedor debe confirmar pesos, unidades, vida útil y porcentaje de pintón.
- **T-05:** texto legal revisado por un asesor jurídico. Las páginas legales actuales son un borrador.
- **Hosting de producción (R-08):** Azure Static Web Apps o Cloudflare Pages. Bloquea T-32 (cabeceras de seguridad) y T-43.
- **T-36:** Google Business Profile, con datos reales (RP-01).
- **T-38, parte manual:** prueba con lector de pantalla (NVDA o TalkBack); la lista está en la bitácora.
- **D-13, mapa de fincas:** revisión jurídica del envío de la IP a OpenStreetMap (con T-05); si se rechaza, plan B (`03-plan.md` D6). Coordenadas de las fincas [POR CONFIRMAR] y autorización de cada productor (RP-02).
- **Conflicto D-11 (parcial):** la demo en GitHub Pages no permite cabeceras propias (NFR-04). Desde T-66 la CSP va por `<meta>` con hashes y `Referrer-Policy` también por `<meta>`; faltan `frame-ancestors`, HSTS, `X-Content-Type-Options` y `Permissions-Policy`, que solo van por cabecera (T-32, R-08).
- **Protección de `main` en GitHub:** la configura el usuario en Settings → Rules → Rulesets, con el check `verificar` obligatorio. Recomendación: exigir solo el check, sin obligar a usar PR. Hasta entonces, `verificar` avisa pero no bloquea la fusión: revisa que pase antes de fusionar.

## Reglas de trabajo
- Responde siempre en español.
- En commits y pull requests no agregues `Co-Authored-By: Claude` ni ninguna otra atribución a Claude: el usuario no quiere que Claude aparezca como colaborador en GitHub.
- Antes de modificar, mover o eliminar archivos, pide confirmación.
- No uses `git checkout` ni otros comandos que descarten cambios sobre archivos sin commit. Reescribir el historial (`filter-branch`, push forzado) lo ejecuta el usuario: el modo automático lo bloquea.
- No publiques precios, WhatsApp, analítica ni formularios en Fase 1: están en el roadmap.
- Los datos legales, el número de contacto, el nombre comercial y el origen viven en archivos de contenido (`site.json`, etc.), nunca en componentes ni en código.
- Ningún número real de contacto ni dato legal real en el repositorio hasta RP-01.
- No uses afirmaciones de salud fuera de "fuente de almidón resistente, un tipo de fibra".
- Ningún contador, cupo, escasez o cifra de ahorro sin respaldo documentado.
- Solo imágenes libres de derechos de autor o propias ficticias hasta RP-02.
- Si una duda no está en los specs, márcala como `[POR CONFIRMAR]` y pregúntame; no la asumas.
- Al terminar una tarea:
  - documenta qué hiciste, qué se decidió y qué archivos tocaste en `doc/bitacora.md` (entrada con fecha, la más reciente arriba);
  - actualiza el estado en `spec/04-tasks.md`.
  
  El contexto del proyecto vive en el repositorio, no en la memoria local de Claude.
