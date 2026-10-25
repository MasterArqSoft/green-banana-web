# Plan de medición (solo documental)

Plan para saber qué ventas vienen del sitio sin instalar analítica (T-118, hallazgo `AUD-2026-10-24-FORENSE/F-13`). **En la Fase 1 no se añade ningún código de seguimiento**: la analítica es R-07 y está fuera de alcance (`spec/05-alcance-y-roadmap.md`).

| | |
|---|---|
| **Estado** | Aprobado por el usuario |
| **Fecha** | 2026-10-25 |
| **Alcance de la aprobación** | Este documento y el procedimiento manual de §2. No incluye instalar analítica, añadir eventos ni conexiones de seguimiento (eso es R-07, §4) |
| **Qué no acredita** | Ni instrumentación implementada ni resultados comerciales: la medición real empieza cuando se ejecute §2 con llamadas reales (§5) |

No es fuente de verdad: si contradice los specs, ganan los specs.

## 1. Embudo y qué se puede medir hoy

| Etapa | Definición | Cómo se mide en Fase 1 | Responsable |
|---|---|---|---|
| Visita | Alguien abre una página del sitio | No se mide (sin analítica). Con R-07: visitas por página e idioma | — |
| Clic en llamar | Toca un enlace `tel:` | No se mide en el sitio. El clic no prueba que la llamada ocurra | — |
| Llamada atendida | La llamada entra y se atiende | Registro manual de cada llamada (ver §2) | Quien atiende el teléfono |
| Cotización | Se informa precio total y envío por teléfono (RP-03) | Registro manual, en la fila de la misma llamada | Quien atiende |
| Venta | Pedido confirmado y entregado | Registro manual, en la fila de la llamada que la originó | Quien atiende anota; el usuario la concilia con la facturación (R-09) |

Cada etapa solo cuenta lo que se observó en ella. **Un clic en llamar nunca se cuenta como llamada, ni una llamada como venta**: la venta exige el pedido entregado, y la cotización, el precio informado.

Indicadores con denominador explícito (mensuales, desde el registro manual; los calcula el usuario):

- **Proporción de llamadas atribuidas al sitio** = llamadas atendidas con origen «sitio web» / llamadas atendidas.
- **Tasa de cotización** = cotizaciones / llamadas atendidas (por origen).
- **Tasa de venta** = ventas / cotizaciones (por origen y por tipo de cliente: persona o punto de venta).

Límites: el origen lo declara quien llama (puede no recordarlo; se anota «no sabe» antes que adivinar) y las llamadas perdidas o no atendidas no entran en ningún denominador. Los indicadores no se comparan con cifras de otros negocios ni se publican en el sitio (regla de cifras sin respaldo).

## 2. Registro manual de origen

En cada llamada atendida, quien atiende anota en una hoja (papel o planilla) una fila con solo lo necesario para atender el pedido y medir el origen: fecha, «¿cómo nos conoció?» (sitio web, Google Maps, recomendación, volante, redes, otro, no sabe), tipo de cliente, si hubo cotización y, al entregar, si hubo venta. **No se anotan datos personales para medir**; los del pedido se tratan según la política de privacidad (Ley 1581) y no van a esta hoja.

## 3. Convención para enlaces de campañas (UTM)

Para cuando se usen enlaces en redes, volantes con QR o Google Business Profile, todos en minúsculas y sin tildes:

| Parámetro | Valores | Ejemplo |
|---|---|---|
| `utm_source` | `google-business`, `facebook`, `instagram`, `volante`, `whatsapp-estado` | `volante` |
| `utm_medium` | `perfil`, `social`, `qr`, `referido` | `qr` |
| `utm_campaign` | `<aaaa-mm>-<tema>` | `2026-11-lanzamiento` |

Ejemplo: `https://<dominio>/?utm_source=volante&utm_medium=qr&utm_campaign=2026-11-lanzamiento`. Sin analítica, los parámetros no se registran; se definen ahora para que los enlaces impresos sirvan cuando se active R-07. El selector de idioma ya conserva la consulta al cambiar de idioma.

## 4. Criterios para activar R-07 (decisión del usuario)

1. Datos reales publicados (RP-01) y dominio propio.
2. Herramienta sin cookies ni identificadores persistentes (p. ej. Plausible o Umami autoalojado), con datos agregados.
3. Aviso de privacidad actualizado (Ley 1581) y revisado por el asesor jurídico (T-05).
4. Origen nuevo declarado en la CSP (`src/lib/csp.ts`) y en las cabeceras (`src/lib/cabeceras.ts`), con pruebas.
5. Presupuesto de peso respetado (≤ 300 KB) y sin afectar el LCP.
6. Eventos mínimos: vista de página e idioma, clic en `tel:` por ubicación (cabecera, hero, tarjeta, flotante) y apertura del mapa. Nada que identifique a la persona.

Hasta cumplirlos, la medición es el registro manual de §2.

## 5. Estado de F-13 (2026-10-25)

| Parte | Estado |
|---|---|
| Preparación y aprobación de este plan | Completadas: aprobado por el usuario el 2026-10-25 |
| Implementación de analítica | Pendiente de R-07 y fuera del alcance actual: no hay código de seguimiento en el sitio |
| Medición operativa real | No acreditada: no hay registros de §2, porque el número publicado es ficticio hasta RP-01. Empieza cuando se atiendan llamadas reales |

