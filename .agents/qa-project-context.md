# Contexto de QA: Landing Guineo Verde

Lo leen las skills `visual-testing` y `exploratory-testing`. **No es fuente de verdad:** si algo aquí contradice `spec/` o `CLAUDE.md`, ganan esos.

## Aplicación
- Sitio **estático** (Next.js 16, `output: "export"`), sin backend, sin formularios, sin inicio de sesión.
- 4 páginas: landing (`/`) y las páginas legales `terminos/`, `privacidad/` y `garantia/`.
- Única interacción de negocio: **enlaces `tel:`** (9 puntos de llamada y un botón flotante).
- Dos componentes cliente: `FloatingCallVisibility` (muestra el botón flotante según `#hero` y `#pie`) y `MapaFincasInteractivo` (carga Leaflet solo al pulsar "Ver mapa").
- Demo pública: https://masterarqsoft.github.io/green-banana-web/ (`basePath` `/green-banana-web`, `noindex`, banner de demostración).

## Pruebas que ya existen
- **Unitarias:** Vitest (`tests/unit/`), componentes con `renderToStaticMarkup`, sin DOM.
- **e2e:** Playwright 1.64 (`tests/e2e/`): `layout`, `calls`, `a11y` (axe WCAG 2.2 AA) y `mapa-fincas`.
- **Proyectos:** `movil-360` (360×640, Galaxy S9+) y `escritorio` (1280×800, Desktop Chrome). Solo Chromium.
- **Servidor:** `tests/e2e/server.mjs` sirve `out/` en el puerto 4173 con gzip.
- **Comandos:** `npm run test:e2e` (build + Playwright) y `npm run validate` (todo junto).
- **CI:** job `verificar` en `.github/workflows/pages.yml` (Ubuntu), en cada PR y push a `main`.

## Visualmente críticas
- **Hero:** foto distinta en móvil y escritorio, `fetchPriority="high"`, CTA amarillo (`cta`).
- **Barra superior** y **botón flotante** compacto (no deben tapar el foco).
- **Tarjetas de presentaciones**, **recetas** y **mapa ilustrado** (SVG antes de "Ver mapa").
- **Pie** con enlaces de 44 px de alto.
- El amarillo se reserva para el CTA; tokens de color en `src/app/globals.css`.

## Contenido dinámico (enmascarar o fijar en capturas)
- **Teselas de OpenStreetMap:** nunca se piden a OSM desde las pruebas; se interceptan con `page.route` (ver `mapa-fincas.spec.ts`).
- **Imágenes con `loading="lazy"`** (fotos y mapa ilustrado): esperar a que carguen antes de capturar.
- Fuentes: Fraunces e Inter, autoalojadas (sin terceros).
- No hay fechas en vivo, contadores ni datos de API.

## Cambios previstos que deberían detectarse
- Fotos reales en lugar de las generadas con IA (RP-02).
- Copy con datos reales (RP-01).
- Actualizaciones de Tailwind, Next o React (Dependabot, semanal).

## Restricciones
- Sin servicios de pago ni de terceros (Chromatic, Percy, Argos): solo `toHaveScreenshot` de Playwright.
- Las capturas de referencia: **[POR CONFIRMAR]** dónde se generan (Windows local o Linux en CI).
- Presupuesto: peso inicial ≤ 300 KB (`npm run budget`); Lighthouse móvil ≥ 90.

## Pendiente manual
- T-38: prueba con lector de pantalla (NVDA o TalkBack); la lista está en `doc/bitacora.md`.
