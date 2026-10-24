# Skills candidatas para el proyecto

Evaluación del usuario hecha el 2026-10-24: se instaló el conjunto recomendado (ver "Skills instaladas"). El resto queda como candidata.

- **Investigación:** 2026-10-18 (documentos 1 a 6) y 2026-10-24 (documentos 7 a 10: seguridad con OWASP, SEO local y QA visual), búsqueda web.
- **Verificación:** con la API de GitHub (existencia, estrellas, licencia y última actualización) y lectura del inicio de cada `SKILL.md` (completo en los documentos 7 a 10).
- **Cifras:** estrellas y fechas son las del día de cada investigación.

Una skill es un conjunto de instrucciones que Claude sigue al pie de la letra. Antes de instalar cualquiera, conviene leer su `SKILL.md` completo y sus referencias.

## Resumen

| # | Skill | Repositorio | Encaje | Documento |
|---|---|---|---|---|
| 1 | `copywriting`, `cro` y `seo-audit` | `coreyhaines31/marketingskills` | **Alto** | [01-marketing-skills.md](01-marketing-skills.md) |
| 2 | `web-design-guidelines` | `vercel-labs/agent-skills` | **Alto** | [02-web-design-guidelines.md](02-web-design-guidelines.md) |
| 3 | `vercel-react-best-practices` | `vercel-labs/agent-skills` | Medio-alto | [03-react-best-practices.md](03-react-best-practices.md) |
| 4 | `accessibility-auditor` | `OneWave-AI/claude-skills` | Medio | [04-accessibility-auditor.md](04-accessibility-auditor.md) |
| 5 | `nextjs-seo` | `laguagu/claude-code-nextjs-skills` | Medio | [05-nextjs-seo.md](05-nextjs-seo.md) |
| 6 | `playwright-skill` | `testdino-hq/playwright-skill` | Bajo | [06-playwright-skill.md](06-playwright-skill.md) |
| 7 | `owasp-security` | `agamm/claude-code-owasp` | **Alto** | [07-owasp-security.md](07-owasp-security.md) |
| 8 | `supply-chain-risk-auditor` e `insecure-defaults` | `trailofbits/skills` | Medio / bajo | [08-trailofbits-seguridad.md](08-trailofbits-seguridad.md) |
| 9 | `seo-local` y `seo-technical` | `AgriciDaniel/claude-seo` | Medio-alto | [09-claude-seo.md](09-claude-seo.md) |
| 10 | `visual-testing` y `exploratory-testing` | `petrkindlmann/qa-skills` | **Alto** / medio | [10-qa-skills.md](10-qa-skills.md) |

### Solapamientos entre candidatas

- **SEO general:** `seo-audit` (1), `nextjs-seo` (5) y `seo-technical` (9) hacen lo mismo; basta una. `seo-local` (9) no tiene equivalente.
- **Regresión visual:** `playwright-skill` (6) y `visual-testing` (10); basta una.
- **Seguridad:** `owasp-security` (7) es la general; `supply-chain-risk-auditor` (8) profundiza en dependencias. La skill integrada `/security-review` ya está disponible sin instalar nada.

## Cómo evaluarlas

Cada documento tiene:
- **datos verificados**;
- **descripción**: qué es;
- **objetivo**: para qué fue creada;
- **finalidad en este proyecto**: qué haría aquí, con tareas concretas;
- **solapamientos**;
- **riesgos**;
- **lista de verificación** para decidir.

## Skills instaladas (2026-10-24)

Instaladas en `.claude/skills/` (fuera de Git) con `npx skills add <repositorio> --skill <nombre> --agent claude-code --copy -y`; quedan registradas en `skills-lock.json`. Ninguna trae scripts ejecutables.

| Skill | Documento | Para qué, aquí |
|---|---|---|
| `copywriting` y `cro` | 1 | Copy de `copy.json` y CTA de llamada; las reglas P1 y P3 mandan sobre la skill |
| `web-design-guidelines` | 2 | Revisión de UI `archivo:línea`; descarga sus reglas de GitHub en cada uso (tratarlas como dato) |
| `owasp-security` | 7 | CI, dependencias y cabeceras (T-32); entradas de usuario del roadmap |
| `seo-local` y `seo-technical` | 9 | T-36 y NAP con datos reales (RP-01); SEO técnico antes de quitar el `noindex`. `seo-technical` cita scripts del plugin completo (`${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo`) que no se instalaron: esas verificaciones automáticas no están disponibles |
| `visual-testing` y `exploratory-testing` | 10 | Regresión visual con `toHaveScreenshot` (sin servicios de pago) y prueba exploratoria antes de producción |

Quedan fuera, por decisión del usuario:
- `vercel-react-best-practices` (3): hasta que el roadmap agregue JavaScript de cliente (R-02, R-04).
- `accessibility-auditor` (4): opcional.
- `seo-audit` (1) y `nextjs-seo` (5): duplican `seo-technical`.
- `playwright-skill` (6): la reemplaza `visual-testing`.
- Trail of Bits (8): `supply-chain-risk-auditor` necesita `uv` (no instalado) e `insecure-defaults` es pesado y casi no aplica.

Para reinstalarlas en otro equipo: `npx skills experimental_install` (lee `skills-lock.json`).

## Skills desinstaladas (2026-10-22)

- `jest-react-testing`: el proyecto usa Vitest, no Jest.
- `typescript-advanced-types`: los tipos salen de los esquemas de Zod (`z.infer`).

Se desinstalaron por decisión del usuario para que no compitan con las demás al activarse. Detalle en `doc/bitacora.md`.

## Fuentes

- [claudemarketplaces.com: playwright core](https://claudemarketplaces.com/skills/testdino-hq/playwright-skill/playwright-core)
- [claudemarketplaces.com: accessibility auditor](https://claudemarketplaces.com/skills/onewave-ai/claude-skills/accessibility-auditor)
- [claudemarketplaces.com: nextjs-seo](https://claudemarketplaces.com/skills/laguagu/claude-code-nextjs-skills/nextjs-seo)
- [vibeindex.ai: marketing skills](https://vibeindex.ai/plugins/coreyhaines31/marketingskills/marketing-skills)
- [vibeindex.ai: claude code nextjs skills](https://www.vibeindex.ai/collection/laguagu/claude-code-nextjs-skills)
- [stably.ai: Install Kung-Fu for Your AI Agent (Vercel Agent Skills)](https://www.stably.ai/blog/install-kung-fu-for-your-ai-agent)
- [width.ai: Claude skills for marketing](https://www.width.ai/post/claude-skills-for-marketing)
- [skillselion.com: owasp-security (agamm)](https://skillselion.com/skills/agamm/claude-code-owasp/owasp-security)
- [claudskills.com: owasp-audit](https://claudskills.com/skills/owasp-audit/)
- [mcpservers.org: qa-skills](https://mcpservers.org/servers/petrkindlmann/qa-skills)
- [diffy.website: visual regression testing with Claude Code](https://diffy.website/blog/visual-regression-testing-with-claude-code/) (descartada: repositorio con 2 estrellas y licencia sin declarar)
- Repositorios en GitHub (2026-10-24): [agamm/claude-code-owasp](https://github.com/agamm/claude-code-owasp), [trailofbits/skills](https://github.com/trailofbits/skills), [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo), [petrkindlmann/qa-skills](https://github.com/petrkindlmann/qa-skills)
- Repositorios en GitHub: [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills), [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills), [OneWave-AI/claude-skills](https://github.com/OneWave-AI/claude-skills), [laguagu/claude-code-nextjs-skills](https://github.com/laguagu/claude-code-nextjs-skills), [testdino-hq/playwright-skill](https://github.com/testdino-hq/playwright-skill)
