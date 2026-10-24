# 10. QA: `visual-testing` y `exploratory-testing` (qa-skills)

**Encaje en el proyecto: alto** (`visual-testing`) **y medio** (`exploratory-testing`)

## Datos verificados (GitHub, 2026-10-24)

| Campo | Valor |
|---|---|
| Repositorio | [petrkindlmann/qa-skills](https://github.com/petrkindlmann/qa-skills), carpeta `skills/` |
| Autor | Petr Kindlmann (comunidad) |
| Estrellas | ~210 |
| Licencia | MIT |
| Última actualización | 2026-10-22 (activo) |
| Versiones leídas | `visual-testing` 2.0 (327 líneas, referencia `recipes.md`) · `exploratory-testing` 2.0 (313 líneas, referencias `heuristics-and-automation.md` y `session-templates.md`) |
| Skills del repositorio | 50 (entre otras: `playwright-automation`, `accessibility-testing`, `release-readiness`, `cross-browser-testing`, `security-testing`) |
| Instalación (por verificar) | `npx skills add petrkindlmann/qa-skills --skill visual-testing` (y lo mismo con `exploratory-testing`) |

## Descripción

- **`visual-testing`:** regresión visual con `toHaveScreenshot` de Playwright (gratis, capturas de referencia en el repositorio) o con servicios (Chromatic, Percy, Argos). Cubre:
  - gestión de capturas de referencia y umbral de diferencia;
  - ocultar contenido dinámico (`stylePath`, `page.clock.setFixedTime`, `page.route`);
  - pruebas por tamaño de pantalla y flujo de revisión y aprobación.
- **`exploratory-testing`:** sesiones de prueba exploratoria estructuradas (SBTM). Incluye:
  - "charters" (misión de la sesión) y heurísticas (HICCUPS);
  - plantillas de notas;
  - conversión de cada bug hallado en una prueba automática.

Las dos leen un archivo de contexto `.agents/qa-project-context.md` si existe.

## Objetivo

Encontrar lo que las pruebas funcionales no ven: un botón que funciona pero se ve mal, o un camino que nadie escribió en un script.

## Finalidad en este proyecto

1. **Regresión visual con `toHaveScreenshot`** en los proyectos `movil-360` y `escritorio` que ya existen. Sirve para detectar cambios no deseados:
   - al reemplazar las fotos (RP-02);
   - al cambiar el copy con datos reales (RP-01);
   - al actualizar Tailwind o Next.
   
   Las teselas de OSM ya se interceptan con `page.route`, lo que encaja con su receta de capturas deterministas.
2. **Prueba exploratoria antes de producción:** sesiones con charter sobre los 9 puntos de llamada, el mapa, las páginas legales y el banner de demo. Puede servir de base para la parte manual de T-38 (lector de pantalla).

## Solapamientos

- Con `playwright-skill` de TestDino (documento 6), que también trae una guía de regresión visual. **Basta una para lo visual:** `visual-testing` es más enfocada y no viene de una empresa con producto comercial.
- Con las 32 pruebas e2e y axe que ya existen: `visual-testing` agrega la capa visual, que hoy no existe.

## Riesgos y cuidados

- **Capturas en Git:** las imágenes de referencia pesan y se generan distinto en Windows y en Linux (CI). Hay que decidir dónde se generan (por ejemplo, solo en CI o en Docker; la skill trae la receta).
- Ofrece servicios de pago (Chromatic, Percy, Argos): **no aplican**. Usar solo `toHaveScreenshot`.
- Repositorio pequeño (~210 estrellas) y de una persona. Instalar solo las dos skills, no las 50.

## Lista para evaluar

- [x] Leí `SKILL.md` de las dos (2026-10-24).
- [ ] Leí `visual-testing/references/recipes.md` (capturas deterministas y CI con Docker).
- [ ] ¿Dónde se generan las capturas de referencia: local o CI?
- [ ] ¿Reemplaza a `playwright-skill` (documento 6)?

**Recomendación:** `visual-testing` sí, en lugar de `playwright-skill`. `exploratory-testing`, opcional, para la revisión antes de producción.
