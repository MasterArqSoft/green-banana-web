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
T-07 hecho: proyecto Next.js 16.4 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4, ESLint + Prettier, pre-commit con Husky + lint-staged. Repositorio público en GitHub (`MasterArqSoft/green-banana-web`). En Git Bash de Windows, para probar el build con prefijo usa `MSYS_NO_PATHCONV=1 PAGES_BASE_PATH=/green-banana-web npm run build`. Todavía no hay pruebas (llegan con T-08) ni script único de validación (T-11).

```bash
npm run dev            # servidor de desarrollo en http://localhost:3000
npm run build          # exportación estática en out/
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm run format         # Prettier (escribe); format:check solo verifica
```
Cuando existan, documenta aquí `test`, cómo correr una sola prueba unitaria, Playwright y el script de T-11.

**Next.js 16 cambia APIs respecto a versiones anteriores** (ver `AGENTS.md`). Antes de usar una API de Next, consulta la guía en `node_modules/next/dist/docs/`. Con `output: "export"` no se pueden usar `cacheComponents`/PPR, `headers`, `redirects`, `rewrites`, Server Actions, Route Handlers con Request ni el optimizador de imágenes por defecto (`images.unoptimized: true`).

Prettier no formatea `spec/`, `doc/`, `CLAUDE.md`, `AGENTS.md` ni `README.md` (`.prettierignore`).

## Arquitectura (resumen de `spec/03-plan.md`)
- **Contenido separado del código:** los datos viven en `src/content/*.json` (`site`, `products`, `zones`, `faq`, `recipes`, `origin`). Zod los valida en el build (`src/lib/schema.ts`); un dato legal faltante rompe la compilación.
- **Salvaguarda del número ficticio:** `site.json` tiene `phoneIsPlaceholder`. Si es `true` en el build de producción, el build debe fallar (riesgo R5, D-02).
- **Enlace de llamada:** el `tel:` solo se genera en `src/lib/tel.ts`, a partir de `site.phone` (E.164). Todos los botones Llamar (`CallButton`, `FloatingCall`, etc.) lo usan; ningún componente arma el número por su cuenta.
- **JavaScript mínimo:** solo dos componentes cliente (`'use client'`): el acordeón de FAQ y el botón flotante de llamar. Todo lo demás se renderiza en el build.
- **Rutas (App Router):** `src/app/page.tsx` (landing) y las páginas legales `terminos/`, `privacidad/` y `garantia/`. No hay carpeta `api/` en Fase 1 (R-06).
- **Sin precios en el modelo de datos:** `products.json` no tiene campos de precio; `pricePerKg` y `priceTotal` llegan con R-01.
- **Presupuesto de rendimiento:** HTML+CSS+JS inicial ≤ 300 KB, imagen del hero ≤ 120 KB, fuentes autoalojadas (máximo 2 familias, `font-display: swap`), ningún script de terceros.
- **Pruebas:** unitarias y e2e (Playwright) en `tests/`.

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
- **D-11:** demo pública con datos ficticios. El build de producción falla con `phoneIsPlaceholder: true` (hace falta un modo demo), los datos ficticios quedan visibles y GitHub Pages no permite cabeceras propias (CSP, NFR-04).

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
