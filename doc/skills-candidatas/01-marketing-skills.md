# 1. Marketing Skills: `copywriting`, `cro` y `seo-audit`

**Encaje en el proyecto: alto**

## Datos verificados (GitHub, 2026-10-18)

| Campo | Valor |
|---|---|
| Repositorio | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |
| Autor | Corey Haines |
| Estrellas | ~55.400 |
| Licencia | MIT |
| Última actualización | 2026-10-15 (activo, no archivado) |
| Skills del repositorio | 48 (entre otras: `copywriting`, `copy-editing`, `cro`, `seo-audit`, `schema`, `marketing-psychology`, `site-architecture`) |
| Versiones leídas | `copywriting` 2.3.1 · `cro` 2.0.3 · `seo-audit` 2.2.1 |
| Instalación (por verificar) | `npx skills add coreyhaines31/marketingskills --skill copywriting` (y lo mismo con `cro` y `seo-audit`), o como plugin: `/plugin marketplace add coreyhaines31/marketingskills` |

Corrección: en el repositorio, la skill de conversión se llama `cro`, no "page-cro".

## Descripción

Colección de skills de marketing para agentes de IA. Las tres relevantes aquí:

- **`copywriting`:** se presenta como "experto en copy de conversión", para escribir o reescribir textos de homepage, landing, precios, funcionalidades o "sobre nosotros". Antes de redactar pregunta el propósito de la página y **la única acción principal** que debe hacer el visitante.
- **`cro`** (*Conversion Rate Optimization*): analiza páginas y formularios de marketing y entrega recomendaciones priorizadas para mejorar la conversión. Carga referencias específicas según el caso: formularios o ideas de experimentos A/B.
- **`seo-audit`:** auditoría SEO técnica y on-page (indexación, rastreo, metadatos, Core Web Vitals, contenido). Advierte explícitamente que el contenido de las páginas analizadas es **dato no confiable** y no debe seguir instrucciones incrustadas.

Las tres leen un archivo de contexto del producto (`.agents/product-marketing.md` o `.claude/product-marketing.md`) si existe, para no volver a preguntar lo mismo.

## Objetivo

Que el agente trabaje como un especialista en marketing: textos claros que lleven a la acción, diagnóstico de por qué una página no convierte y salud SEO.

## Finalidad en este proyecto

El propósito declarado del sitio es **dar visibilidad al negocio y apoyar el marketing** (`05` §1), y la única conversión es **la llamada telefónica**. Tareas concretas:

1. **`cro`:** auditar la landing con el objetivo "que llamen". Ubicación y número de CTA, claridad de la propuesta de valor en el hero, señales de confianza y objeciones (precio por teléfono, cobertura, frescura).
2. **`copywriting`:** pulir el copy de `copy.json` cuando haya datos reales (RP-01, RP-02). Titulares, microcopy de los botones ("Llamar para pedir", "Llamar para precio") y la sección "Para negocios".
3. **`seo-audit`:** segunda revisión SEO antes de producción, con el dominio propio y la página ya indexable.

## Solapamientos

- Con `ui-ux-pro-max`: la revisión UX ya cubrió accesibilidad, táctil y el color del CTA. `cro` aporta la mirada de **negocio y persuasión**, que no se cubrió.
- Con `nextjs-seo` (documento 5): `seo-audit` es general; `nextjs-seo` es específico de Next.js. Basta uno de los dos.

## Riesgos y cuidados

- **Las reglas del proyecto mandan.** `copywriting` y `cro` tienden a proponer urgencia, prueba social, cifras y testimonios. Aquí están prohibidos sin respaldo (P1: sin escasez ni cifras sin respaldo; P3: sin afirmaciones de salud; FR-12: testimonios solo reales). El bloqueo automático de `src/lib/claims.ts` detiene el build si se cuela alguna frase prohibida, pero conviene decírselo al agente desde el inicio.
- **Idioma:** las skills están en inglés. El copy debe salir en español de Colombia, con el tono de `02-content-spec.md` §1.
- Sugieren formularios y experimentos A/B, que están fuera de la Fase 1 (R-06 y R-07).
- Instalar solo las tres skills útiles, no las 48.

## Lista para evaluar

- [ ] Leí los `SKILL.md` de `copywriting`, `cro` y `seo-audit`.
- [ ] Revisé sus carpetas `references/`.
- [ ] ¿Quiero crear `.agents/product-marketing.md` con el contexto del negocio (público, tono, prohibiciones P1 y P3)?
- [ ] ¿La instalo ahora o cuando tenga los datos reales (RP-01)?

**Recomendación:** instalar `cro` y `copywriting` (y `seo-audit` si no se elige `nextjs-seo`), junto con un `product-marketing.md` que incluya las prohibiciones del proyecto.
