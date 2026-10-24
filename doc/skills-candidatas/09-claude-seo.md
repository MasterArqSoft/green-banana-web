# 9. `seo-local` y `seo-technical` (claude-seo)

**Encaje en el proyecto: medio-alto** (cerca de producción)

## Datos verificados (GitHub, 2026-10-24)

| Campo | Valor |
|---|---|
| Repositorio | [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo), carpeta `skills/` |
| Autor | AgriciDaniel (comunidad) |
| Estrellas | ~20.000 |
| Licencia | MIT |
| Última actualización | 2026-10-22 (activo) |
| Versión leída | `seo-local` 2.5.0 (323 líneas) |
| Sub-skills | 26 (`seo-audit`, `seo-technical`, `seo-local`, `seo-schema`, `seo-geo`, `seo-sitemap`, `seo-images`…) y 19 sub-agentes |
| Instalación (por verificar) | Copiar solo las carpetas `skills/seo-local` y `skills/seo-technical`; el repositorio completo también se instala como plugin |

## Descripción

- **`seo-local`:** auditoría de SEO local. Cubre:
  - Google Business Profile;
  - consistencia de nombre, dirección y teléfono (NAP);
  - citas en directorios, reseñas y schema local;
  - páginas por ubicación.
  
  Antes de analizar, detecta el tipo de negocio (local con dirección, a domicilio o híbrido), y eso decide qué verificaciones aplican. Trata el contenido descargado como dato no confiable.
- **`seo-technical`:** SEO técnico (rastreo, indexación, canónicas, rendimiento).

## Objetivo

Auditar y mejorar la visibilidad en búsquedas locales y en el "map pack" de Google, además de la salud técnica.

## Finalidad en este proyecto

El negocio es local (acopio y reparto en Santa Marta), así que el SEO local pesa más que el general:
1. **T-36 (Google Business Profile)** con los datos reales de RP-01.
2. **NAP consistente** entre `site.json`, el JSON-LD `LocalBusiness`, el perfil de Google y los directorios.
3. Tipo de negocio "a domicilio" (reparto sin local de atención): la skill tiene reglas específicas para ese caso.
4. `seo-technical`: revisión antes de quitar el `noindex`.

## Solapamientos

- Con `seo-audit` de marketingskills (documento 1) y `nextjs-seo` (documento 5). **Basta una skill general de SEO**: elegir entre `seo-audit`, `nextjs-seo` o `seo-technical`. `seo-local` no tiene equivalente en la lista.

## Riesgos y cuidados

- **Es muy grande:** instalar las 26 sub-skills compite con las demás al activarse. Instalar solo `seo-local` (y quizá `seo-technical`).
- Sus estadísticas (pesos de ranking, tasas de conversión) citan estudios de terceros que no verifiqué. No usarlas como cifras en el copy (regla del proyecto: sin cifras sin respaldo).
- Puede sugerir páginas por barrio o ubicación; eso es contenido nuevo y lo deciden los specs.
- Menciona `/seo flow`, que solo existe con el paquete completo.

## Lista para evaluar

- [x] Leí `skills/seo-local/SKILL.md` (2026-10-24).
- [ ] ¿`seo-technical` reemplaza a `nextjs-seo` y a `seo-audit`?
- [ ] ¿La instalo ahora o con los datos reales (RP-01)?

**Recomendación:** `seo-local` sí, enfocada en T-36 y RP-01. Para SEO general, elegir una sola entre las tres opciones.
