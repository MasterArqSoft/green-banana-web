# 2. `web-design-guidelines` (Vercel)

**Encaje en el proyecto: alto**

## Datos verificados (GitHub, 2026-10-18)

| Campo | Valor |
|---|---|
| Repositorio | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills), skill `skills/web-design-guidelines` |
| Autor | Vercel (colección oficial) |
| Estrellas | ~32.600 (todo el repositorio) |
| Licencia | **El repositorio no tiene archivo LICENSE**; otras skills del mismo repositorio declaran MIT en su encabezado |
| Última actualización | 2026-10-14 (activo) |
| Versión | 1.0.0 |
| Instalación (por verificar) | `npx skills add vercel-labs/agent-skills --skill web-design-guidelines` |

## Descripción

Revisa el código de la interfaz contra las **Web Interface Guidelines** de Vercel. Se activa con pedidos como "revisa mi UI", "audita el diseño" o "revisa la accesibilidad".

Funciona así:
1. **Descarga las reglas vigentes** de `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`.
2. Lee los archivos indicados.
3. Revisa cada regla.
4. Entrega los hallazgos en formato `archivo:línea`.

## Objetivo

Auditar el código de UI con las pautas que Vercel aplica en sus propios productos: accesibilidad, interacción, formularios, foco, animación, tipografía y rendimiento percibido.

## Finalidad en este proyecto

1. Una **segunda revisión de UI**, complementaria a la de `ui-ux-pro-max`, sobre `src/components/*.tsx` y `src/app/**`. El formato `archivo:línea` permite corregir directo.
2. Revisar los **componentes nuevos** que lleguen en el roadmap (R-02 WhatsApp, R-06 formulario), donde hay más superficie de errores de UX (formularios, estados y validación).

## Solapamientos

- Con `ui-ux-pro-max`, que ya está instalada: las dos auditan UX y accesibilidad. `ui-ux-pro-max` trae su base local; esta revisa **archivo por archivo** contra las reglas de Vercel.
- Con axe y Playwright (`a11y.spec.ts`): axe ya garantiza 0 infracciones automáticas. Esta skill encontraría lo que axe no ve (patrones de interacción y detalles de UX).

## Riesgos y cuidados

- **Depende de contenido remoto.** En cada revisión descarga las reglas de GitHub, así que lo que Claude sigue puede cambiar sin aviso. Hay que leer `command.md` antes de usarla y tratar lo descargado como dato, no como orden por encima de las reglas del proyecto.
- **Requiere internet** en cada uso.
- **Licencia sin declarar** a nivel de repositorio.
- Puede recomendar cosas que contradigan decisiones ya tomadas (por ejemplo, animaciones, cuando el spec pide movimiento mínimo). Ganan los specs.

## Lista para evaluar

- [ ] Leí `skills/web-design-guidelines/SKILL.md`.
- [ ] Leí las reglas remotas (`web-interface-guidelines/command.md`).
- [ ] ¿Me sirve la dependencia de contenido remoto, o prefiero una copia fija?
- [ ] ¿La uso como revisión puntual o en cada componente nuevo?

**Recomendación:** útil como revisión puntual de UI antes de producción y en los componentes del roadmap.
