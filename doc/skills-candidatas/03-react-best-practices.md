# 3. `vercel-react-best-practices` (Vercel)

**Encaje en el proyecto: medio-alto**

## Datos verificados (GitHub, 2026-10-18)

| Campo | Valor |
|---|---|
| Repositorio | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills), carpeta `skills/react-best-practices` (la skill se llama `vercel-react-best-practices`) |
| Autor | Vercel Engineering |
| Estrellas | ~32.600 (todo el repositorio) |
| Licencia | MIT (según el encabezado del `SKILL.md`; el repositorio no tiene archivo LICENSE) |
| Última actualización | 2026-10-14 (activo) |
| Versión | 1.0.0 |
| Instalación (por verificar) | `npx skills add vercel-labs/agent-skills --skill react-best-practices` |

## Descripción

Guía de optimización de rendimiento para React y Next.js, mantenida por Vercel: **70 reglas en 8 categorías**, ordenadas por impacto. Las dos primeras son críticas: eliminar cascadas de carga (`async-`) y reducir el tamaño del bundle (`bundle-`). Se activa al escribir, revisar o refactorizar componentes, páginas, carga de datos u optimización del bundle.

## Objetivo

Que el código React y Next.js siga los patrones de rendimiento que recomienda Vercel, y servir de guía para refactorizaciones automáticas.

## Finalidad en este proyecto

El rendimiento quedó con **poco margen**: Lighthouse móvil entre 90 y 96, y un peso inicial de 267 de 300 KB, del que unos 180 KB son el runtime de React y Next.js.

1. Revisar si algo del código aumenta el bundle del cliente o genera trabajo innecesario en el navegador.
2. Guía para el roadmap: R-02 (WhatsApp) y R-04 (pedidos) agregarán JavaScript de cliente, justo donde estas reglas son críticas.

## Solapamientos

- Con lo ya hecho en T-30: presupuesto automático (`npm run budget`), un solo componente cliente, acordeón nativo e imágenes con `srcset`. Muchas reglas ya se cumplen.
- Gran parte de las reglas (carga de datos en servidor, `Suspense`, streaming) **no aplica a un sitio estático** sin backend.

## Riesgos y cuidados

- **Licencia** declarada solo en el encabezado, no en un archivo LICENSE.
- **Puede no estar alineada con Next 16:** puede proponer patrones (como `cacheComponents` o PPR) que **no funcionan con `output: "export"`**. `CLAUDE.md` ya lista esas restricciones.
- El beneficio real es acotado mientras el sitio siga estático y casi sin JavaScript propio.

## Lista para evaluar

- [ ] Leí el `SKILL.md` y la lista de las 70 reglas.
- [ ] ¿Cuántas reglas aplican a exportación estática?
- [ ] ¿La instalo ahora o cuando empiece el roadmap con JavaScript de cliente (R-02, R-04)?

**Recomendación:** más útil cuando el roadmap agregue interactividad. Hoy aportaría poco más allá de lo ya medido.
