# 7. `owasp-security` (agamm)

**Encaje en el proyecto: alto** (más aún cuando el roadmap agregue entradas de usuario)

## Datos verificados (GitHub, 2026-10-24)

| Campo | Valor |
|---|---|
| Repositorio | [agamm/claude-code-owasp](https://github.com/agamm/claude-code-owasp), skill `.claude/skills/owasp-security` |
| Autor | agamm (comunidad) |
| Estrellas | ~395 |
| Licencia | MIT |
| Última actualización | 2026-09-25 (activo, no archivado) |
| Contenido | `SKILL.md` (206 líneas) y 4 referencias: `review-checklist.md`, `languages.md`, `config-and-supply-chain.md` y `owasp-report.md` (~1.100 líneas). Trae evals propias |
| Instalación (por verificar) | Como plugin: `/plugin marketplace add agamm/claude-code-owasp` y `/plugin install owasp-security@agamm`. Como skill simple: copiar la carpeta completa (`SKILL.md` + `reference/`) |

## Descripción

Revisión de seguridad y guía de implementación segura con estándares vigentes:
- **OWASP Top 10:2025** (A03 *Software Supply Chain Failures* y A10 *Mishandling of Exceptional Conditions* son nuevas);
- **ASVS 5.0** (niveles L1, L2 y L3);
- **OWASP Top 10 para aplicaciones LLM (2026)** y **para aplicaciones agénticas (2026)**.

Flujo de revisión en 5 pasos:
1. Mapear puntos de entrada y fronteras de confianza.
2. Cargar solo las referencias que el código necesita.
3. Barrer candidatos con la lista de verificación.
4. **Triar cada candidato:** ¿la entrada la controla un atacante?, ¿llega al punto vulnerable?, ¿qué alcance tiene?, ¿el atacante puede hacer cada paso?
5. Reportar con CWE, categoría OWASP, ruta, impacto, arreglo y confianza.

Pide explícitamente **no rellenar el informe** con hallazgos informativos si no hay nada explotable.

## Objetivo

Que el agente revise código y configuración como un auditor de seguridad, con severidad por explotabilidad y no por coincidencia de patrones.

## Finalidad en este proyecto

Hoy la superficie de ataque es pequeña (sitio estático, sin backend, sin formularios), así que el valor está en la configuración y la cadena de suministro:
1. **A02 y A03:** revisar `.github/workflows/pages.yml` (acciones fijadas por SHA, `persist-credentials`, permisos), Dependabot, `package-lock.json` y `allowScripts`.
2. **Cabeceras de seguridad (T-32, NFR-04, conflicto D-11):** preparar la CSP y las demás cabeceras cuando se elija el hosting (R-08). `config-and-supply-chain.md` las cubre.
3. **A08:** el mapa de fincas carga Leaflet y teselas de OpenStreetMap (D-13).
4. **Roadmap:** R-02 (WhatsApp), R-04 (pedidos) y R-06 (formulario) traen entradas de usuario; ahí la skill rinde de verdad (A05 inyección, validación, A06 diseño seguro).

## Solapamientos

- Con la skill integrada `/security-review`: revisa los cambios pendientes de la rama, pero sin metodología OWASP explícita. `owasp-security` sirve para revisiones completas y para diseñar.
- Con `npm run audit:deps` y Dependabot: cubren avisos conocidos; la skill revisa además configuración y CI.
- Con Trail of Bits (documento 8): `supply-chain-risk-auditor` profundiza en dependencias.

## Riesgos y cuidados

- **Repositorio de una persona** (~395 estrellas): menos revisión comunitaria. Se leyó el `SKILL.md` completo y no ejecuta scripts ni descarga contenido.
- Como plugin con auto-actualización, sus instrucciones pueden cambiar sin aviso. Conviene **no activar la auto-actualización** o fijar una copia.
- Gran parte del contenido (sesiones, contraseñas, ORM, LLM) no aplica hoy. Se carga bajo demanda, así que no recarga el contexto.

## Lista para evaluar

- [x] Leí `SKILL.md` (2026-10-24).
- [ ] Leí `reference/config-and-supply-chain.md` (cabeceras y CI).
- [ ] ¿La instalo ahora o al decidir el hosting (R-08)?

**Recomendación:** instalarla. Primera tarea: revisar CI y dependencias; después, la CSP de T-32.
