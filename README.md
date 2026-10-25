# Landing Guineo Verde

Landing informativa de una empresa de venta de guineo verde, con acopio y distribución en Santa Marta (Magdalena). Fase 1: POC/MVP con **datos ficticios**, sin precios, sin pedidos y sin formularios; el contacto es por llamada telefónica.

**Demo:** https://masterarqsoft.github.io/green-banana-web/

> Todos los datos de empresa, contacto y origen son ficticios, y las fotos fueron generadas con IA, hasta el roadmap de producción (RP-01 y RP-02). La demo no se indexa en buscadores.

## Stack
Next.js 16 (exportación estática), React 19, TypeScript, Tailwind CSS 4 y Zod. Pruebas con Vitest y Playwright (axe para accesibilidad). Fotos optimizadas con sharp.

## Requisitos
Node.js 24.15 o superior dentro de la 24 (`.nvmrc`; `engines` y `devEngines` en `package.json`: con otra versión, `npm` se detiene antes de instalar) y npm 11 o superior. CI usa la misma versión desde `.nvmrc`.

## Comandos
```bash
npm ci
npx playwright install chromium webkit firefox   # una vez: Chromium para todo; WebKit y Firefox para las pruebas @smoke
npm run lighthouse:instalar                       # una vez: Lighthouse desde su propio lock (tools/lighthouse/)

npm run dev          # desarrollo en http://localhost:3000
npm run build        # sitio estático en out/
npm run validate     # formato, lint, tipos, pruebas, build, presupuesto de peso, e2e y auditoría
npm test             # pruebas unitarias
npm run test:coverage  # cobertura informativa de src/lib/ (sin umbral)
npm run test:e2e     # build + pruebas en navegador (Chromium a 320, 360 y 1280 px; WebKit y Firefox @smoke)
npm run lighthouse   # Lighthouse móvil sobre / y /en (requiere out/ y lighthouse:instalar)
npm run audit:tooling  # npm audit del lock de Lighthouse
npm run pendientes   # pendientes de producción agrupados por decisión (desde el contenido)
npm run cabeceras:verificar -- https://dominio   # cabeceras de seguridad de un sitio publicado
npm run images       # regenera public/images/ desde fotos-originales/ (carpeta local, fuera de Git)
```

## Contenido
Los textos, datos de contacto, productos, preguntas, recetas y textos legales se editan en `src/content/`, sin tocar componentes. Los datos comunes (identidad, teléfono, cifras, IDs, coordenadas) van una sola vez en `src/content/*.json`; los textos, en un catálogo por idioma: `src/content/es-CO/` (español, predeterminado) y `src/content/en/` (inglés). El build valida todo con Zod y falla si falta un dato o una traducción, si los dos idiomas no tienen las mismas claves, IDs y marcadores, si aparece un precio o si hay una afirmación de salud prohibida en cualquier idioma.

## Idiomas
Español de Colombia en las URL de siempre (`/`, `/terminos`, `/privacidad`, `/garantia`) e inglés bajo `/en` (`/en`, `/en/terms`, `/en/privacy`, `/en/guarantee`). La URL decide el idioma: `/` siempre abre en español, sin detección del navegador ni cookies. El selector «Español / English» enlaza la página equivalente. Detalle en `spec/03-plan.md` D7.

## Despliegue
- **Demo:** cada push a `main` se publica en GitHub Pages (`.github/workflows/pages.yml`) si pasa el job `verificar`, que incluye los smoke de WebKit y Firefox. `main` está protegida: `verificar` es obligatorio y no se permiten force push ni borrado, así que los cambios entran por pull request.
- **Producción:** pendiente de elegir hosting (R-08). El build de producción (`SITE_ENV=production`) se bloquea mientras quede algún dato ficticio o por confirmar. `npm run build` genera además las cabeceras de seguridad (`src/lib/cabeceras.ts`): con `HOSTING_PROVEEDOR=cloudflare` o `azure`, solo `out/_headers` (Cloudflare) o `out/staticwebapp.config.json` (Azure); sin elegir, los dos, solo para probar en local. El build de producción exige elegir. La demo de GitHub Pages no admite cabeceras propias y no los lleva.

## Documentación
- `spec/`: specs del proyecto. La fuente de verdad del alcance es `spec/05-alcance-y-roadmap.md`; el estado de cada tarea está en `spec/04-tasks.md`.
- `doc/bitacora.md`: registro de decisiones y cambios por sesión.
- `doc/creditos.md`: origen y licencia de fotos, íconos y fuentes.
- `doc/registro-hallazgos.md`: hallazgos de auditoría y su cierre.
- `doc/expediente-lanzamiento.md`: lo que falta para publicar en producción.
- `doc/protocolo-accesibilidad.md`: prueba manual con lector de pantalla y zoom.
- `doc/plan-medicion.md`: medición sin analítica (R-07 sigue fuera de la Fase 1).
- `CLAUDE.md`: instrucciones para Claude Code.
