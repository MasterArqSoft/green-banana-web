# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Landing Guineo Verde

## Qué es este repositorio
Landing informativa que da a conocer la empresa de venta de guineo verde. Acopio y distribución en Santa Marta (Magdalena). Fase 1 sin precios, sin pedidos y sin formularios; el contacto es por llamada telefónica. Reparto a personas naturales y puntos de venta.

El objetivo es dar visibilidad al negocio y apoyar el marketing. La Fase 1 es un POC/MVP: una demostración funcional con datos ficticios que se amplía de forma progresiva. El usuario quiere publicar la demo en GitHub (ver conflictos abiertos abajo).

## Fuente de verdad
Lee antes de programar, en este orden:
1. `spec/05-alcance-y-roadmap.md`: alcance, roadmap (R-01 a R-10) y pendientes de producción (RP-01 a RP-03).
2. `spec/00-constitution.md`: principios no negociables.
3. `spec/01-spec.md`: requisitos funcionales (FR), no funcionales (NFR) y criterios de aceptación (AC).
4. `spec/02-content-spec.md`: copy, FAQ, recetas y dirección visual.
5. `spec/03-plan.md`: decisiones técnicas, arquitectura y estructura del repositorio.
6. `spec/04-tasks.md`: tareas por fase, con dependencias y estimaciones.

Si un spec contradice `05`, gana `05`, y el spec se corrige.

No son fuente de verdad:
- `spec/_v1.0/`: respaldo histórico de la versión 1.0. No lo uses.
- `doc/`: informe de investigación (análisis de páginas de referencia). Si contradice los specs, ganan los specs.
- `doc/bitacora.md`: registro de sesiones (decisiones, cambios y archivos tocados). Léelo al empezar para retomar el contexto.

## Estado actual y comandos
T-07 hecho: proyecto Next.js 16.4 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4, ESLint + Prettier, pre-commit con Husky + lint-staged. Repositorio público en GitHub (`MasterArqSoft/green-banana-web`). En Git Bash de Windows, para probar el build con prefijo usa `MSYS_NO_PATHCONV=1 PAGES_BASE_PATH=/green-banana-web npm run build`. T-09 hecho: contenido en `src/content/*.json` validado con Zod. T-08 hecho: `src/lib/tel.ts` con pruebas unitarias (Vitest). T-10 hecho: tokens de diseño en `src/app/globals.css` y fuentes en `src/app/fonts.ts`. T-11 hecho: `npm run validate`. Playwright instalado en T-33 (base de T-37). Fase 2 en curso: T-12 hecho (`TopBar` y `CallButton` en el layout); T-13 hecho (`Hero` en `page.tsx`, con espacio reservado hasta tener la foto de T-04); T-14 hecho (`TrustBar`); T-15 hecho (`ProductCards`, con `formatWeight` en `src/lib/format.ts`); T-16 hecho (`FreshInfo`); T-17 hecho (`Origin`, ancla `#origen`, con `formatDate`); T-18 hecho (`Recipes`); T-46 hecho (`Benefits`); T-19 hecho (`HowItWorks`); T-20 hecho (`Coverage`, con `formatList`); T-21 hecho (`Business`); T-23 hecho (`Testimonials`, oculto mientras `testimonials.json` esté vacío); T-24 hecho (`Faq` con JSON-LD FAQPage); T-25 hecho (`Guarantee`); T-47 hecho (`FinalCta`); T-26 hecho (`Footer` en el layout); T-28 hecho (`FloatingCall`); T-33 hecho (orden FR-01 a FR-17 verificado y revisión a 360 px con Playwright); T-30 hecho (presupuesto 265/300 KB, Lighthouse ≥ 93); T-27 hecho con texto borrador (`/terminos`, `/privacidad`, `/garantia` desde `legal.json`, pendiente de T-05).

```bash
npm run dev            # servidor de desarrollo en http://localhost:3000
npm run build          # exportación estática en out/
npm run lint           # ESLint
npm run typecheck      # next typegen && tsc --noEmit (genera los tipos de rutas como LayoutProps)
npm run format         # Prettier (escribe); format:check solo verifica
npm run validate       # TODO junto: format:check, lint, typecheck, test, build, budget, playwright test y audit:prod. Córrelo antes de cada commit importante; la pipeline de R-10 lo reutilizará
npm run audit:prod     # npm audit solo de dependencias de producción, falla con altas o críticas
npm run budget         # peso inicial por página (gzip) ≤ 300 KB; requiere out/ construido
npm run lighthouse     # Lighthouse móvil, 4 categorías ≥ 90 (AC-08); requiere out/; no está en validate (lento)
npm test               # pruebas unitarias (Vitest, tests/unit/**/*.test.ts); test:watch en modo vigilancia
npx vitest run tests/unit/tel.test.ts            # un solo archivo
npx vitest run tests/unit/tel.test.ts -t "formatPhone"   # una sola prueba por nombre
npm run test:e2e       # build + Playwright (tests/e2e/*.spec.ts) en móvil 360×640 y escritorio 1280×800
npx playwright test tests/e2e/layout.spec.ts --project=movil-360   # un archivo y un proyecto (requiere out/ ya construido)
```
Playwright sirve `out/` con `tests/e2e/server.mjs` (puerto 4173, sin dependencias) y necesita Chromium (`npx playwright install chromium`).

**Next.js 16 cambia APIs respecto a versiones anteriores** (ver `AGENTS.md`). Antes de usar una API de Next, consulta la guía en `node_modules/next/dist/docs/`. Con `output: "export"` no se pueden usar `cacheComponents`/PPR, `headers`, `redirects`, `rewrites`, Server Actions, Route Handlers con Request ni el optimizador de imágenes por defecto (`images.unoptimized: true`).

Prettier no formatea `spec/`, `doc/`, `CLAUDE.md`, `AGENTS.md` ni `README.md` (`.prettierignore`).

## Arquitectura (resumen de `spec/03-plan.md`)
- **Contenido separado del código:** los datos viven en `src/content/*.json` (`site`, `products`, `zones`, `faq`, `recipes`, `origin`). Zod los valida en el build (`src/lib/schema.ts`); un dato legal faltante rompe la compilación.
- **Salvaguarda del número ficticio:** `site.json` tiene `phoneIsPlaceholder`. Si es `true` y el build tiene `SITE_ENV=production`, el build falla (riesgo R5, D-02). Sin esa variable (local y demo) se muestra `DemoBanner` con `copy.demoNotice`.
- **Textos de interfaz:** todo texto visible (títulos, botones, microcopy, `aria-label`) vive en `src/content/copy.json`, con un bloque por sección validado por `copySchema`. Ningún componente escribe texto propio. Si un texto combina datos, usa marcadores (`"Acopio en {ciudad}"`) y rellénalos con `fill()` de `src/lib/template.ts`. Al construir una sección, agrega su bloque a `copy.json` y a `copySchema`.
- **Frases prohibidas (P1, P3):** `src/lib/claims.ts` tiene la lista (diabetes, cáncer, pérdida de peso, "el mejor", "cupos limitados"...). `content.ts` busca esas frases en todo el contenido durante el build, sin importar tildes ni mayúsculas, y si aparece una, la compilación falla. Si el negocio pide una frase nueva prohibida, agrégala ahí.
- **Acceso al contenido:** importa siempre desde `@/lib/content` (`site`, `products`, `zones`, `faq`, `recipes`, `origin`, `copy`, `testimonials`, `legal`, `isProduction`), nunca los JSON directamente; ahí se validan. Solo desde componentes de servidor.
- **Enlace de llamada:** el `tel:` solo se genera con `telHref(site.phone)` de `src/lib/tel.ts`, y el número visible con `formatPhone(site.phone)` ("+57 300 000 0000"). La regla E.164 (`PHONE_E164_CO`) vive ahí y la reutiliza el esquema. Todos los botones Llamar usan `src/components/CallButton.tsx` (props `label` y `size`: `sm`, `md` o `icon`, este último redondo solo con ícono y el texto en `sr-only`; el número nunca se pasa por props); ningún componente arma el número por su cuenta.
- **Diseño:** usa solo los tokens de `globals.css`: colores `hoja`, `hoja-claro`, `sol`, `carbon`, `crema`, `cta` (botón Llamar); `font-display` (Fraunces, ya aplicada a h1-h3) y `font-sans` (Inter); `rounded-control` (12 px), `rounded-card` (16 px), `shadow-suave`; utilidad `contenedor` para el ancho de página. `sol` nunca como color de texto. Nada de colores hex sueltos en componentes. Íconos: `lucide-react` con `aria-hidden="true"` si son decorativos. En secciones con fondo `hoja` o `carbon`, agrega `[&_:focus-visible]:outline-white` (o `outline-crema`) (el foco por defecto es verde hoja y no se vería) y `ring-2 ring-white` al `CallButton`.
- **JavaScript mínimo:** el único componente cliente (`'use client'`) es `FloatingCallVisibility` (T-28). Solo decide cuándo mostrar el botón, usando `IntersectionObserver` sobre `#hero` y `#pie`, y recibe el `CallButton` ya renderizado como `children`. **Nunca importes `@/lib/content` en un componente cliente**: todo el contenido viajaría en el JavaScript del navegador. El acordeón de FAQ usa `<details>`/`<summary>` nativos, sin JavaScript. Todo lo demás se renderiza en el build.
- **Enlaces internos:** usa `next/link` (agrega solo el prefijo de la demo). Para `<a>` simples a rutas propias, usa `assetPath`.
- **Imágenes de `public/`:** usa `assetPath(src)` de `src/lib/asset.ts` en el `src`, para que funcionen con el prefijo de la demo.
- **Rutas (App Router):** `src/app/page.tsx` (landing) y las páginas legales `terminos/`, `privacidad/` y `garantia/`. No hay carpeta `api/` en Fase 1 (R-06).
- **Sin precios en el modelo de datos:** `products.json` no tiene campos de precio; `pricePerKg` y `priceTotal` llegan con R-01.
- **Presupuesto de rendimiento:** peso inicial ≤ 300 KB transferido con gzip (HTML + JS + CSS + fuentes precargadas; lo mide `npm run budget`), imagen del hero ≤ 120 KB, fuentes autoalojadas (máximo 2 familias, `font-display: swap`), ningún script de terceros. Hoy: 265 KB, de los que ~180 KB son el runtime de React y Next.js, que no baja. Cada sección nueva o cada `"use client"` resta margen.
- **Pruebas:** unitarias con Vitest en `tests/unit/` (`.test.ts` y `.test.tsx`; los componentes se prueban con `renderToStaticMarkup` de `react-dom/server`, sin DOM) (alias `@/` resuelto por `vitest.config.mts`); e2e con Playwright en `tests/e2e/` (T-37). Para probar el bloqueo de producción se usa `vi.stubEnv("SITE_ENV", "production")` + `vi.resetModules()` y se reimporta `@/lib/content`.

## Decisiones técnicas (cerradas)
- Next.js con exportación estática (`output: 'export'`), React, TypeScript y Tailwind CSS.
- Sin backend en Fase 1. Sin rutas de servidor, sin formularios, sin base de datos.

## Pendientes (no decidir por tu cuenta)
- **Hosting de producción:** pendiente de definir antes del primer despliegue a producción (R-08). Opciones: Azure Static Web Apps o Cloudflare Pages.
- **Demo del POC/MVP:** GitHub Pages en https://masterarqsoft.github.io/green-banana-web/. `.github/workflows/pages.yml` la despliega en cada push a `main` con `PAGES_BASE_PATH` como `basePath`. Las rutas a `public/` escritas a mano (p. ej. `src` de imágenes) deben incluir ese prefijo, porque Next no lo agrega solo.
- **CI/CD:** proveedor decidido: GitHub Actions (el repositorio es público en GitHub). La pipeline y los entornos se configuran en R-10.
- **Roadmap de producción, antes de publicar:** datos reales (RP-01); origen y fotos reales (RP-02); validación jurídica del precio por teléfono, medios de pago y tiempo de entrega (RP-03); política de garantía (RP-04); procedimiento de PQR con constancia (RP-05). Hasta entonces usa valores ficticios marcados como `(FICTICIO)` o `[POR CONFIRMAR]`.

### Conflictos abiertos (recuérdaselos al usuario cuando pregunte por pendientes)
Detalle en `spec/05-alcance-y-roadmap.md` §5. No los resuelvas por tu cuenta.
- **D-11 (parcial):** la demo en GitHub Pages no permite cabeceras propias (CSP, NFR-04). El modo demo y el aviso de datos ficticios ya están resueltos.

## Reglas de trabajo
- Responde siempre en español.
- En commits y pull requests no agregues `Co-Authored-By: Claude` ni ninguna otra atribución a Claude: el usuario no quiere que Claude aparezca como colaborador en GitHub.
- Antes de modificar, mover o eliminar archivos, pide confirmación.
- No publiques precios, WhatsApp, analítica ni formularios en Fase 1: están en el roadmap.
- Los datos legales, el número de contacto, el nombre comercial y el origen viven en archivos de contenido (`site.json`, etc.), nunca en componentes ni en código.
- Ningún número real de contacto ni dato legal real en el repositorio hasta RP-01.
- No uses afirmaciones de salud fuera de "fuente de almidón resistente, un tipo de fibra".
- Ningún contador, cupo, escasez o cifra de ahorro sin respaldo documentado.
- Solo imágenes libres de derechos de autor o propias ficticias hasta RP-02.
- Si una duda no está en los specs, márcala como `[POR CONFIRMAR]` y pregúntame; no la asumas.
- Al terminar una tarea, documenta qué hiciste, qué se decidió y qué archivos tocaste en `doc/bitacora.md`. Agrega una entrada con fecha, la más reciente arriba. El contexto del proyecto vive en el repositorio, no en la memoria local de Claude.

## Tareas
Empieza por la Fase 1 de `spec/04-tasks.md`: T-07, luego T-09 y T-08, después T-10 y T-11 (sin despliegue hasta R-08 y R-10).
