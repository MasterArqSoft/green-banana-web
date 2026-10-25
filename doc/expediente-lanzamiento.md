# Expediente de lanzamiento

Lista de lo que falta para publicar el sitio en producción con datos reales (T-117, hallazgo `AUD-2026-10-24-FORENSE/F-01`). **Completar este expediente no aprueba el lanzamiento:** lo aprueba el usuario con la evidencia de cada fila. La demo de GitHub Pages sigue siendo una demostración con datos ficticios y `noindex`.

No es fuente de verdad: si contradice los specs, ganan los specs (`spec/05-alcance-y-roadmap.md` primero). Los pendientes de producción viven en `05` §5 y §7.

## 1. Pendientes de contenido (generados, nunca a mano)

La lista sale del mismo código que bloquea el build de producción (`SITE_ENV=production` falla mientras quede uno). Para verla al día:

```bash
npm run pendientes            # Markdown agrupado por la decisión que lo cierra
npm run pendientes -- --json  # para otras herramientas
```

`scripts/pendientes.mjs` lee `pendingMarkerEntries()` de `src/lib/content.ts` (las mismas entradas que `pendingMarkers()`, con el texto completo) y las agrupa con `scripts/pendientes-grupos.mjs`: primero por la etiqueta del texto (`RP-04`, `T-05`…) y, si no la tiene, por la ruta del dato. Una entrada con varias dependencias se lista en la de su etiqueta (p. ej. la FAQ del pintón está en RP-04, pero su `[X]` también lo confirma el proveedor, T-03). Lo que no encaje sale como «Sin clasificar».

**Nunca se borra una marca `(FICTICIO)` o `[…]` para pasar la guarda**: se reemplaza por el dato aprobado.

Instantánea del 2026-10-25 (solo orientativa; el número vigente es el del comando):

| Grupo | Responsable | Evidencia para cerrar | Entradas |
|---|---|---|---:|
| RP-01 Datos reales y dominio | Usuario | `site.json` verificado y dominio registrado | 6 |
| RP-02 Origen, fincas, productores y fotos | Usuario y productores | Datos reales, autorización escrita de cada productor, fotos propias | 21 |
| RP-03 Precio por teléfono, pagos y entrega | Usuario con asesor jurídico | Concepto jurídico escrito | 4 |
| RP-04 Política de garantía | Usuario con asesor jurídico | Política aprobada; después T-116 | 8 |
| RP-05 PQR con constancia | Usuario con asesor jurídico | Canal y constancia definidos y probados | 4 |
| T-03 Datos del proveedor | Proveedor | Confirmación escrita | 10 |
| T-05 Textos legales | Asesor jurídico | Textos aprobados por escrito | 6 |
| Contenido editorial | Usuario | Valor revisado | 5 |
| **Total** | | | **64** |

## 2. Decisiones y verificaciones fuera del contenido

| Pendiente | Responsable | Evidencia para cerrar | Estado (2026-10-25) |
|---|---|---|---|
| R-08 Hosting de producción (Azure Static Web Apps o Cloudflare) | Usuario | Decisión registrada en `05` | Abierto |
| F-11 Cabeceras de seguridad del dominio final (y N-6 d) | Claude Code tras R-08 y RP-01 | Build con `SITE_ENV=production HOSTING_PROVEEDOR=<cloudflare o azure> npm run build` (solo el archivo de ese proveedor) y, desplegado, `npm run cabeceras:verificar -- https://<dominio>` con salida 0: las 8 páginas, un recurso y dos rutas inexistentes (ES y EN) con estado 404 y `frame-ancestors 'none'` por cabecera. Comprobar también que el proveedor sirve `/en/terms` sin `.html` y que su 404 recibe las cabeceras globales | Preparado y probado en local (las dos variantes); abierto hasta el dominio |
| HSTS `includeSubDomains` | Usuario, con RP-01 | Inventario de subdominios del dominio elegido, todos con HTTPS. Hasta entonces HSTS va sin `includeSubDomains` ni `preload` (`src/lib/cabeceras.ts`) | Abierto |
| R-10 Pipeline de producción con `SITE_ENV=production` | Usuario + Claude Code | Build de producción que pasa la guarda (sin pendientes) | Abierto |
| D-13 Revisión jurídica del envío de la IP a OpenStreetMap | Asesor jurídico (con T-05) | Concepto; si se rechaza, plan B (`03` D6) | Abierto |
| T-36 Google Business Profile | Usuario | Ficha verificada con los datos de RP-01 | Abierto |
| Prueba de llamada real | Usuario | Llamada al número publicado desde un móvil en ES y en EN, atendida; idioma de la atención telefónica decidido [POR CONFIRMAR] | Abierto |
| JSON-LD del build de producción | Claude Code + usuario | Validador de Schema.org y Rich Results Test sobre el HTML de producción (`LocalBusiness`, `FAQPage`) sin errores; datos representativos del negocio real | Abierto |
| Search Console | Usuario | Propiedad verificada y sitemap enviado, solo tras autorizar la indexación | Abierto |
| T-38 / F-09 Aceptación humana de accesibilidad | Usuario o especialista | Protocolo de `doc/protocolo-accesibilidad.md` ejecutado en ES y EN, con resultados (sesión guiada en su §5) | Abierto: ninguna sesión ejecutada |
| Medición (F-13) | Usuario | Plan aprobado el 2026-10-25 (`doc/plan-medicion.md`); registro manual de §2 en uso con llamadas reales | Plan aprobado; medición real no acreditada; analítica en R-07 |
| Gobierno del repositorio (B11) | Usuario (autorizó) y Claude Code | Ruleset de `main` con el check `verificar` obligatorio; evidencia con `gh api repos/MasterArqSoft/green-banana-web/rules/branches/main` | **Cerrado el 2026-10-25:** ruleset 25829447 activo y efectivo en `main` (§4) |
| Lighthouse del sitio de producción | Claude Code | `npm run lighthouse` sobre el build de producción (laboratorio). Los Core Web Vitals de campo se miden después del lanzamiento | Abierto |
| Revisión editorial del inglés | Usuario | Textos `en/` revisados y aprobados | Comparación técnica ES/EN hecha el 2026-10-25 (bitácora): sin divergencias de estructura ni maquetación. El usuario aprobó y se aplicaron 3 propuestas de redacción (`benefits.text`, `map.text` y la nota de retracto, también en `en/legal.json`); el aviso de demo con «(marked “FICTICIO”)» se mantiene. Falta la aprobación editorial del conjunto |

## 3. Orden sugerido

1. RP-01 a RP-05, T-03 y T-05 (datos y aprobaciones), y R-08.
2. Con los datos: reemplazar contenido, `npm run pendientes` en cero y build con `SITE_ENV=production`.
3. Desplegar en el hosting elegido; verificar cabeceras (F-11), JSON-LD, llamada real y Lighthouse.
4. Protocolo de accesibilidad (T-109) sobre el sitio de producción.
5. Indexación y Search Console solo con autorización del usuario.

## 4. Protección de `main` (B11)

**Configurada el 2026-10-25** por Claude Code con la cuenta conectada (`MasterArqSoft`, administradora del repositorio), con autorización expresa del usuario. Antes no había ninguna regla (`rulesets` = `[]`, `rules/branches/main` = `[]`, rama sin protección); no había configuración que conservar.

Ruleset aplicado (`gh api -X POST repos/MasterArqSoft/green-banana-web/rulesets`), id **25829447**:

```json
{
  "name": "main: verificar obligatorio",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["refs/heads/main"], "exclude": [] } },
  "bypass_actors": [],
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "do_not_enforce_on_create": false,
        "required_status_checks": [{ "context": "verificar", "integration_id": 15368 }]
      }
    }
  ]
}
```

- `verificar` es el nombre del job de `.github/workflows/pages.yml`; `15368` es la app GitHub Actions (la que emitió `verificar` en `10cd67b`). Si se renombra el job, hay que actualizar el ruleset o nada podrá integrarse.
- No exige Lighthouse, revisiones de terceros, firma ni rama al día (`strict` en falso). No cambia visibilidad, colaboradores ni permisos.
- Sin *bypass*: la API devuelve `current_user_can_bypass: "never"`; tampoco el administrador se lo salta.

**Comprobado (solo lectura, 2026-10-25):** `gh api repos/MasterArqSoft/green-banana-web/rulesets` lista el ruleset `active`; `gh api repos/MasterArqSoft/green-banana-web/rules/branches/main` devuelve las reglas **efectivas** `deletion`, `non_fast_forward` y `required_status_checks` (`verificar`, 15368) del ruleset 25829447; una rama cualquiera (`rules/branches/no-main`) no recibe ninguna. No se hizo ningún push de prueba.

**Cómo se trabaja ahora:** el workflow corre `verificar` en los pull requests a `main` y en los push a `main`. Un push directo de commits que no pasaron `verificar` se rechaza, así que el camino es: rama → `git push` de la rama → pull request a `main` → esperar `verificar` en verde → fusionar. Para cambiarlo o desactivarlo: Settings → Rules → Rulesets → «main: verificar obligatorio».
