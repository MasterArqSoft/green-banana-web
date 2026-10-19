# 5. `nextjs-seo` (laguagu)

**Encaje en el proyecto: medio**

## Datos verificados (GitHub, 2026-10-18)

| Campo | Valor |
|---|---|
| Repositorio | [laguagu/claude-code-nextjs-skills](https://github.com/laguagu/claude-code-nextjs-skills), carpeta `skills/nextjs-seo` |
| Autor | laguagu (comunidad) |
| Estrellas | ~70 |
| Licencia | MIT |
| Última actualización | 2026-10-18 (muy activo) |
| Instalación (por verificar) | `npx skills add https://github.com/laguagu/claude-code-nextjs-skills --skill nextjs-seo` |

## Descripción

Implementación y auditoría de SEO para Next.js App Router:
- metadatos e imágenes para redes;
- `sitemap` y `robots`;
- URL canónicas e idioma;
- datos estructurados;
- evidencia de Core Web Vitals;
- política para rastreadores de IA;
- diagnóstico de indexación.

Pide leer la versión instalada de Next y su documentación en `node_modules/next/dist/docs/` (la misma práctica que ya sigue este proyecto). Insiste en contenido útil por encima de extenso, y en verificar autoría y afirmaciones.

## Objetivo

Hacer o auditar el SEO de una app Next.js con las APIs actuales del framework (Next 16).

## Finalidad en este proyecto

1. **Revisión SEO antes de producción (T-31 + RP-01):** cuando haya dominio propio y la página deje de ser `noindex`, verificar canónicas, `sitemap`, `robots`, la imagen para redes, LocalBusiness y FAQPage, y los códigos de estado.
2. **Política para rastreadores de IA:** decidir si se permite a GPTBot, ClaudeBot u otros. Hoy no está definido en los specs.
3. Apoyo para **Google Business Profile** (T-36) y el SEO local de Santa Marta.

## Solapamientos

- Con lo hecho en T-31, que ya cubre todo lo básico (metadatos, Open Graph, LocalBusiness, FAQPage, sitemap, robots y canónicas).
- Con `seo-audit` (documento 1), que es general y no específica de Next.

## Riesgos y cuidados

- **Repositorio pequeño** (~70 estrellas) y de una sola persona: menos revisión comunitaria.
- El repositorio trae muchas otras skills (chatbots, IA, Postgres) que no aplican. Hay que instalar solo `nextjs-seo`.
- Puede proponer funciones que no sirven con `output: "export"` (redirecciones o cabeceras en `next.config`).

## Lista para evaluar

- [ ] Leí `skills/nextjs-seo/SKILL.md`.
- [ ] ¿La elijo en lugar de `seo-audit`, o junto con ella?
- [ ] ¿La instalo ahora o cuando tenga el dominio (RP-01)?

**Recomendación:** instalarla **cerca de producción**, con el dominio real. Hoy el SEO de la demo está apagado a propósito (`noindex`).
