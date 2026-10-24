# 8. `supply-chain-risk-auditor` e `insecure-defaults` (Trail of Bits)

**Encaje en el proyecto: medio** (`supply-chain-risk-auditor`) **y bajo** (`insecure-defaults`)

## Datos verificados (GitHub, 2026-10-24)

| Campo | Valor |
|---|---|
| Repositorio | [trailofbits/skills](https://github.com/trailofbits/skills), carpetas `plugins/supply-chain-risk-auditor` y `plugins/insecure-defaults` |
| Autor | Trail of Bits (empresa de auditoría de seguridad) |
| Estrellas | ~7.800 (todo el repositorio, con más de 40 plugins) |
| Licencia | CC-BY-SA-4.0 (licencia de contenido, no de software) |
| Última actualización | 2026-10-24 (muy activo) |
| Instalación (por verificar) | Son **plugins**: `/plugin marketplace add trailofbits/skills` y `/plugin install supply-chain-risk-auditor` (lo mismo con `insecure-defaults`) |

## Descripción

- **`supply-chain-risk-auditor`:** informe de riesgo de las dependencias directas (npm, PyPI, Go) y barrido de avisos de todo el lockfile: avisos por versión exacta, repositorios abandonados o archivados, concentración de publicadores en npm y scripts de instalación. **Las cifras las miden scripts de Python** (`collect.py`, `render.py`, ejecutados con `uv`), no el agente; si no pudo medir algo, lo dice en vez de darlo por limpio. No instala ni ejecuta las dependencias.
- **`insecure-defaults`:** comando `/insecure-defaults:audit [ruta]`. Busca valores inseguros por defecto en 6 categorías (secretos de respaldo, credenciales por defecto, interruptores que fallan abiertos, criptografía débil, accesos permisivos, fugas de depuración). Corre como flujo de varios agentes: 6 barridos en paralelo con Sonnet y un verificador con Opus que intenta refutar cada hallazgo.

## Objetivo

Auditorías de seguridad con el método de una empresa especializada: medir antes de afirmar y refutar antes de reportar.

## Finalidad en este proyecto

1. **`supply-chain-risk-auditor`:** auditar las dependencias de desarrollo (ESLint, Playwright, Vitest, sharp…), donde está casi todo el riesgo de este proyecto (D-12, `braces`). Complementa `npm run audit:deps`: además de avisos, mide abandono, publicador único y scripts de instalación (relevante para `allowScripts` y `unrs-resolver`). Útil antes de cada versión mayor pendiente (ESLint 10, TypeScript 7).
2. **`insecure-defaults`:** casi no aplica. El sitio no tiene secretos, credenciales ni backend. Tendría sentido con R-04 o R-06.

## Solapamientos

- Con `npm run audit:deps` y Dependabot (avisos conocidos).
- Con `owasp-security` (documento 7), categoría A03.

## Riesgos y cuidados

- **`supply-chain-risk-auditor` necesita `uv`**, que hoy **no está instalado** en este equipo (sí hay Python 3.12). También conviene `gh` autenticado: sin él, GitHub limita a 60 consultas por hora.
- **`insecure-defaults` es pesado:** lanza muchos agentes, incluido Opus, en cada auditoría. Costo alto para un sitio estático.
- El repositorio trae más de 40 plugins (Solidity, C, Rust, YARA…): instalar solo los que se usen.

## Lista para evaluar

- [x] Leí `SKILL.md` de `supply-chain-risk-auditor` y el README y el comando de `insecure-defaults` (2026-10-24).
- [ ] ¿Instalo `uv` para usar `supply-chain-risk-auditor`?
- [ ] ¿Dejo `insecure-defaults` para R-04 o R-06?

**Recomendación:** `supply-chain-risk-auditor` sí, si se instala `uv`. `insecure-defaults`, no por ahora.
