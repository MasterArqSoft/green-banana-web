# 6. `playwright-skill` (TestDino)

**Encaje en el proyecto: bajo**

## Datos verificados (GitHub, 2026-10-18)

| Campo | Valor |
|---|---|
| Repositorio | [testdino-hq/playwright-skill](https://github.com/testdino-hq/playwright-skill) |
| Autor | TestDino (testdino.com) |
| Estrellas | ~400 |
| Licencia | MIT |
| Última actualización | 2026-10-12 (activo) |
| Versión | 2.8.0, verificada contra **Playwright 1.64** (la misma del proyecto) |
| Instalación (por verificar) | `npx skills add testdino-hq/playwright-skill` |

## Descripción

Guía de Playwright con **79 referencias**: selectores, aserciones, fixtures, page objects, mocks de red, autenticación, **regresión visual**, accesibilidad, API, CI/CD y depuración. Marca las APIs nuevas con la versión que las introdujo y pide revisar la guía del tema antes de responder, porque Playwright cambia APIs en cada versión.

## Objetivo

Escribir, depurar y escalar suites de Playwright con patrones actuales y probados.

## Finalidad en este proyecto

1. **Regresión visual:** capturas de referencia por sección, para detectar cambios de diseño no deseados (por ejemplo, al reemplazar las fotos en RP-02 o al cambiar el copy).
2. **CI con GitHub Actions (R-10):** su sección de CI ayudaría a llevar las 32 pruebas e2e a la pipeline.
3. Depurar pruebas inestables, si aparecen.

## Solapamientos

- Con lo que ya existe: 32 pruebas e2e funcionando (`layout`, `calls` y `a11y`), proyectos móvil y escritorio, servidor propio con gzip y axe. Lo básico está resuelto.

## Riesgos y cuidados

- **Es de una empresa con producto comercial** (testdino.com). Puede orientar hacia sus servicios, así que hay que revisar si las guías lo hacen.
- Es extensa (79 guías). Activarla para tareas simples puede recargar el contexto sin necesidad.

## Lista para evaluar

- [ ] Leí `SKILL.md` y las guías de regresión visual y CI.
- [ ] ¿Quiero regresión visual (capturas de referencia versionadas)?
- [ ] ¿La instalo al empezar R-10?

**Recomendación:** no ahora. Reconsiderarla al configurar la pipeline (R-10) o si se decide agregar regresión visual.
