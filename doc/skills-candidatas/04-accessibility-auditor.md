# 4. `accessibility-auditor` (OneWave AI)

**Encaje en el proyecto: medio**

## Datos verificados (GitHub, 2026-10-18)

| Campo | Valor |
|---|---|
| Repositorio | [OneWave-AI/claude-skills](https://github.com/OneWave-AI/claude-skills), carpeta `accessibility-auditor` |
| Autor | OneWave AI |
| Estrellas | ~350 (todo el repositorio, que tiene más de 200 skills) |
| Licencia | MIT |
| Última actualización | 2026-10-02 (activo) |
| Instalación (por verificar) | `npx skills add OneWave-AI/claude-skills --skill accessibility-auditor` |

## Descripción

Audita sitios web para encontrar defectos de accesibilidad y llevarlos a cumplir **WCAG 2.1 AA**. Trae cuatro referencias:
- pruebas automáticas (CLI, jest-axe, Playwright);
- lista de criterios WCAG A/AA y de teclado;
- arreglos para los 7 defectos más comunes;
- patrones ARIA (pestañas, acordeón, menú, alertas, progreso).

Flujo en 5 pasos:
1. Chequeos automáticos.
2. Prueba de teclado.
3. **Prueba con lector de pantalla** (NVDA o VoiceOver).
4. Revisión de cada criterio WCAG A/AA.
5. Correcciones y nueva verificación.

## Objetivo

Llevar un sitio a cumplimiento WCAG AA con un proceso completo, automático y manual.

## Finalidad en este proyecto

1. **Cerrar la parte manual de T-38:** la prueba con lector de pantalla. Su paso 3 y su lista de criterios darían un guion ordenado. La bitácora ya tiene una lista de 5 puntos.
2. **Revisar criterio por criterio** (paso 4) lo que axe no puede detectar automáticamente.

## Solapamientos

- Con lo que ya hay: axe en Playwright (`a11y.spec.ts`, 0 infracciones), pruebas de teclado (`calls.spec.ts`), `ui-ux-pro-max` y jsx-a11y en ESLint (31 reglas). Los pasos 1, 2 y 5 ya están cubiertos.
- Con `web-design-guidelines` (documento 2), que también revisa accesibilidad.

## Riesgos y cuidados

- **Apunta a WCAG 2.1 AA**, y el proyecto exige **2.2 AA** (NFR-02). Le faltan criterios nuevos de 2.2, como foco no tapado (2.4.11) y tamaño mínimo de área táctil (2.5.8), que ya verificamos a mano.
- Usa jest-axe en sus ejemplos; aquí usamos Vitest y `@axe-core/playwright`.
- Repositorio con más de 200 skills y pocas estrellas: menos revisión comunitaria. Hay que leer la skill completa antes de instalarla.

## Lista para evaluar

- [ ] Leí `accessibility-auditor/SKILL.md` y sus 4 referencias.
- [ ] ¿Su guion de lector de pantalla sirve para T-38?
- [ ] ¿Me importa que sea WCAG 2.1 y no 2.2?

**Recomendación:** opcional. Su valor real es el guion de la prueba manual (T-38); lo demás ya está cubierto.
