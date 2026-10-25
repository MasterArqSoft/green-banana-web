# Landing Guineo Verde

Landing informativa de una empresa de venta de guineo verde, con acopio y distribución en Santa Marta (Magdalena). Fase 1: POC/MVP con **datos ficticios**, sin precios, sin pedidos y sin formularios; el contacto es por llamada telefónica.

**Demo:** https://masterarqsoft.github.io/green-banana-web/

> Todos los datos de empresa, contacto y origen son ficticios, y las fotos fueron generadas con IA, hasta el roadmap de producción (RP-01 y RP-02). La demo no se indexa en buscadores.

## Stack
Next.js 16 (exportación estática), React 19, TypeScript, Tailwind CSS 4 y Zod. Pruebas con Vitest y Playwright (axe para accesibilidad). Fotos optimizadas con sharp.

## Comandos
```bash
npm install
npx playwright install chromium   # una vez, para las pruebas en navegador

npm run dev          # desarrollo en http://localhost:3000
npm run build        # sitio estático en out/
npm run validate     # formato, lint, tipos, pruebas, build, presupuesto de peso, e2e y auditoría
npm test             # pruebas unitarias
npm run test:e2e     # build + pruebas en navegador (móvil 360 px y escritorio)
npm run lighthouse   # Lighthouse móvil (requiere out/)
npm run images       # regenera public/images/ desde fotos-originales/ (carpeta local, fuera de Git)
```

## Contenido
Los textos, datos de contacto, productos, preguntas, recetas y textos legales se editan en `src/content/`, sin tocar componentes. Los datos comunes (identidad, teléfono, cifras, IDs, coordenadas) van una sola vez en `src/content/*.json`; los textos, en un catálogo por idioma: `src/content/es-CO/` (español, predeterminado) y `src/content/en/` (inglés). El build valida todo con Zod y falla si falta un dato o una traducción, si los dos idiomas no tienen las mismas claves, IDs y marcadores, si aparece un precio o si hay una afirmación de salud prohibida en cualquier idioma.

## Idiomas
Español de Colombia en las URL de siempre (`/`, `/terminos`, `/privacidad`, `/garantia`) e inglés bajo `/en` (`/en`, `/en/terms`, `/en/privacy`, `/en/guarantee`). La URL decide el idioma: `/` siempre abre en español, sin detección del navegador ni cookies. El selector «Español / English» enlaza la página equivalente. Detalle en `spec/03-plan.md` D7.

## Despliegue
- **Demo:** cada push a `main` se publica en GitHub Pages (`.github/workflows/pages.yml`).
- **Producción:** pendiente de elegir hosting (R-08). El build de producción (`SITE_ENV=production`) se bloquea mientras quede algún dato ficticio o por confirmar.

## Documentación
- `spec/`: specs del proyecto. La fuente de verdad del alcance es `spec/05-alcance-y-roadmap.md`; el estado de cada tarea está en `spec/04-tasks.md`.
- `doc/bitacora.md`: registro de decisiones y cambios por sesión.
- `doc/creditos.md`: origen y licencia de fotos, íconos y fuentes.
- `CLAUDE.md`: instrucciones para Claude Code.
