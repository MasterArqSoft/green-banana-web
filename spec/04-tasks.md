# Tareas: Landing Guineo Verde

**Versión:** 1.3 · **Fecha:** 2026-10-18 · **Alcance vigente:** `05-alcance-y-roadmap.md` v1.3

Estimaciones en horas efectivas, para una persona con perfil fullstack senior. `[P]` = se puede hacer en paralelo con otras tareas de la misma fase. Referencias: FR/NFR/AC de `01-spec.md` y secciones de `03-plan.md`.

Las tareas de precios, WhatsApp, formulario B2B, analítica, facturación y datos reales de producción salieron de la Fase 1. Están en "Roadmap" y "Roadmap de producción" al final. Sus IDs se conservan para trazabilidad.

## Índice
1. Fase 0: Decisiones y contenido
2. Fase 1: Fundaciones
3. Fase 2: Componentes de la página
4. Fase 3: Formulario B2B y backend (sin tareas en Fase 1)
5. Fase 4: Legal y SEO
6. Fase 5: Calidad y seguridad
7. Fase 6: Lanzamiento
8. Resumen y estado de avance
9. Roadmap (fuera de la Fase 1)
10. Roadmap de producción (RP)

---

## Fase 0: Decisiones y contenido

| ID | Tarea | Resuelve | Est. | Dep. |
|---|---|---|---|---|
| T-01 | Confirmar Q2 y Q5 (resueltos: Santa Marta y reparto propio) y Q13 (público objetivo); registrar Q1, Q4, Q6, Q7, Q9, Q10 y Q14 en roadmap de producción | Q2, Q5, Q13 | 2 | – |
| T-02 | ~~Definir precios por presentación y política de envío~~ → **Roadmap R-01** | – | 0 | – |
| T-03 | Confirmar vida útil y tolerancia de "pintón" con el proveedor (valores ficticios hasta confirmar) | FR-05, FAQ 3 y 5 | 2 | T-01 |
| T-04 | Obtener imágenes libres de derechos de autor o crear imágenes propias ficticias para producto, productor, acopio y recetas. Reemplazo por fotos reales en **RP-02** | Q10 | 8 | T-01 |
| T-05 | Redactar texto legal base (términos, privacidad, garantía) y enviar a revisión jurídica | Spec §9 | 4 | T-01 |
| T-06 | → **Roadmap de producción RP-01** (dominio, datos legales, número de contacto y horario) | Q6, Q7, Q9 | 0 | – |
| T-48 | → **Roadmap de producción RP-03** (validación jurídica del precio total por teléfono) | Q14 | 0 | – |

**Criterio de salida:** ningún `[POR CONFIRMAR]` pendiente en las secciones que se implementan en Fase 1. Los datos ficticios marcados como tales no bloquean Fase 1, ni los `[POR CONFIRMAR]` asignados a una tarea del roadmap de producción (RP).

## Fase 1: Fundaciones

| ID | Tarea | Req. | Est. | Dep. |
|---|---|---|---|---|
| T-07 | Inicializar repositorio git local y crear proyecto Next.js (exportación estática) + React + TypeScript + Tailwind, lint, formato y pre-commit. Repositorio remoto público en GitHub (decisión D-10) | Plan §2, §4, §10 | 2 | – |
| T-08 | Implementar `lib/tel.ts` (enlace `tel:` desde `site.json`) con pruebas unitarias | FR-01, FR-02, 4.1 | 2 | T-07 |
| T-09 | Esquemas Zod y archivos de contenido (`site`, `products` sin precios, `zones`, `faq`, `recipes`, `origin`) con validación en build; falla si `phoneIsPlaceholder` está en producción | NFR-07, Plan §5 | 3 | T-07 |
| T-10 | Tokens de diseño (colores, tipografía, espaciado), layout base y fuentes autoalojadas | Content §5 | 3 | T-07 |
| T-11 | Validación local: un script de npm que ejecuta lint, tipos, pruebas y build, y que la pipeline reutilizará en R-10. Sin pipeline ni despliegue hasta R-10 | Plan §10 | 3 | T-07 |

## Fase 2: Componentes de la página

| ID | Tarea | Req. | Est. | Dep. |
|---|---|---|---|---|
| T-12 | `TopBar` con empresa, acopio y botón Llamar [P] | FR-01 | 2 | T-08, T-09, T-10 |
| T-13 | `Hero` con H1, CTA Llamar e imagen optimizada, sin precio [P] | FR-02 | 3 | T-08, T-09, T-10 |
| T-14 | `TrustBar` de cuatro íconos [P] | FR-03 | 1 | T-10 |
| T-15 | `ProductCards` sin precio, con peso aproximado, unidades y botón "Llamar para precio" [P] | FR-04 | 3 | T-08, T-09 |
| T-16 | `FreshInfo` ("Verde de verdad") [P] | FR-05 | 1 | T-10 |
| T-17 | `Origin` con esquema acopio Santa Marta y lote vigente (datos ficticios) [P] | FR-06 | 3 | T-09 |
| T-18 | `Recipes` con tarjetas [P] | FR-07 | 2 | T-09 |
| T-19 | `HowItWorks` de tres pasos [P] | FR-09 | 1 | T-10 |
| T-20 | `Coverage` con acopio y distribución en Santa Marta, sin costos de envío [P] | FR-10 | 2 | T-09 |
| T-21 | `Negocios` con texto dirigido a tiendas, hoteles y puntos de venta, con botón Llamar, sin formulario [P] | FR-11 | 1 | T-08, T-10 |
| T-23 | `Testimonials` renderizada solo si hay datos reales [P] | FR-12 | 2 | T-09 |
| T-24 | `Faq` en acordeón accesible, con JSON-LD FAQPage [P] | FR-13 | 3 | T-09 |
| T-25 | `Guarantee` con aclaración de perecedero [P] | FR-14 | 1 | T-10 |
| T-28 | `FloatingCall` visible tras el hero, sin tapar el pie [P] | FR-17 | 2 | T-08 |
| T-46 | `Benefits` con texto cauteloso, sin promesas médicas [P] | FR-08 | 1 | T-10 |
| T-47 | `FinalCta` de cierre con botón Llamar [P] | FR-15 | 1 | T-08 |
| T-33 | Composición de `src/app/page.tsx` en el orden de la spec y revisión móvil a 360 px | FR-01 a 17 | 3 | T-12 a T-28, T-46, T-47 |

## Fase 3: Formulario B2B y backend

**Sin tareas en la Fase 1.** T-22, T-34 y T-35 pasan al roadmap R-06.

## Fase 4: Legal y SEO

| ID | Tarea | Req. | Est. | Dep. |
|---|---|---|---|---|
| T-26 | `Footer` con datos legales (ficticios configurables), PQR y enlace visible a la SIC | FR-16 | 2 | T-09 |
| T-27 | Páginas de términos, privacidad y garantía con el texto revisado por jurídico | FR-18, NFR-09 | 3 | T-05 |
| T-31 | SEO: metadatos, Open Graph, JSON-LD (LocalBusiness, FAQPage), sitemap, robots, canónica | NFR-03 | 3 | T-33 |
| T-36 | Alta y vinculación de Google Business Profile | NFR-03 | 1 | RP-01 |

## Fase 5: Calidad y seguridad

| ID | Tarea | Req. | Est. | Dep. |
|---|---|---|---|---|
| T-30 | Optimización de rendimiento: imágenes, fuentes, JS, CSS crítico; Lighthouse en local con umbrales (móvil ≥ 90). Lighthouse CI en la pipeline con R-10 | NFR-01, AC-08 | 4 | T-33 |
| T-32 | Cabeceras de seguridad y CSP según el hosting elegido (R-08); validar scripts de Next.js; verificación con escáner de cabeceras | NFR-04 | 2 | T-33, R-08 |
| T-37 | Pruebas e2e Playwright: botón Llamar en todos los puntos de contacto, acordeón, navegación por teclado | AC-01 a 03, 09 | 4 | T-33 |
| T-38 | Auditoría de accesibilidad (axe) y prueba con lector de pantalla | NFR-02, AC-09 | 3 | T-33 |
| T-39 | Revisión de copy contra P1 y P3, sin precios, sin imágenes sin licencia y la lista legal (spec §9) | AC-02, 07, 13 | 2 | T-33, T-27 |
| T-40 | `npm audit` en el script de validación local (T-11) y Dependabot (actualizaciones semanales y alertas y PR de seguridad), ya que el repositorio está en GitHub | NFR-04 | 1 | T-11 |

## Fase 6: Lanzamiento

| ID | Tarea | Req. | Est. | Dep. |
|---|---|---|---|---|
| T-42 | Revisión jurídica final y aprobación del negocio (incluye RP-03) | Spec §9, Q14 | 2 | T-39, RP-02 a RP-05 |
| T-43 | Configurar dominio comprado (RP-01), HTTPS y redirecciones (www → raíz) | NFR-04, Q9 | 1 | RP-01, R-08 |
| T-44 | Despliegue a producción y prueba humo (llamada real a la línea de contacto) | DoD | 2 | T-42, T-43, R-08, R-10 |
| T-45 | Monitoreo: alertas de disponibilidad y revisión semanal de llamadas recibidas | Plan §8 | 2 | T-44 |

## Resumen

| Fase | Horas estimadas |
|---|---|
| 0. Decisiones y contenido | 16 |
| 1. Fundaciones | 13 |
| 2. Componentes | 32 |
| 3. Formulario y backend | 0 (en roadmap) |
| 4. Legal y SEO | 9 |
| 5. Calidad y seguridad | 16 |
| 6. Lanzamiento | 7 |
| **Total** | **~93 h** |

**Ruta crítica:** T-01 → T-05 → T-42 → T-44, con RP-01 a RP-05 antes de T-42 y T-43. En paralelo: T-09 → componentes → T-33 → T-30/T-37/T-39.
**Hito sugerido:** MVP publicable al completar Fase 2 + T-26, T-27 y T-44. Publicar exige cerrar antes el roadmap de producción: RP-01 (datos reales y dominio), RP-02 (origen y fotos reales) y RP-03 (validación jurídica del precio por teléfono, medios de pago y tiempo de entrega), RP-04 (política de garantía) y RP-05 (procedimiento de PQR), además de decidir hosting (R-08) y CI/CD (R-10). La Fase 1 se construye con datos ficticios.
**Estimaciones:** orientativas, sin considerar tiempo de espera de terceros (revisión jurídica, producción de fotos).

## Estado de avance

Actualizado: 2026-10-18. Detalle de cada tarea en `doc/bitacora.md`.

| Estado | Tareas |
|---|---|
| **Hecha** | T-01; T-07, T-08, T-09, T-10, T-11; T-12 a T-21, T-23, T-24, T-25, T-28, T-33, T-46, T-47; T-26, T-31; T-30, T-37, T-39, T-40 |
| **Hecha con contenido provisional** | T-04: fotos generadas con IA, se reemplazan en RP-02. T-27: páginas legales en borrador, esperan T-05 |
| **Parcial** | T-38: auditoría automática con axe sin infracciones; falta la prueba manual con lector de pantalla |
| **Pendiente del usuario o de terceros** | T-03 (confirmaciones del proveedor), T-05 (texto legal), T-36 (necesita RP-01), T-32 (necesita R-08; en la demo, conflicto D-11) |
| **Pendiente, Fase 6** | T-42, T-43, T-44, T-45 (necesitan RP-01 a RP-05, R-08 y R-10) |

Demo publicada: https://masterarqsoft.github.io/green-banana-web/ (GitHub Pages, datos ficticios, sin indexar).

---

## 9. Roadmap (fuera de la Fase 1)

| ID | Tarea original | Motivo | Hito |
|---|---|---|---|
| R-01 | T-02 Definir precios; precios en `products.json`; `Offer` en JSON-LD | Precios fuera de alcance | Roadmap R-01 |
| R-02 | Botón de WhatsApp y `lib/whatsapp.ts` | Pedido por WhatsApp fuera de alcance | Roadmap R-02 |
| R-06 | T-21 original (formulario B2B; en Fase 2 el T-21 es la versión sin formulario); T-22 `/api/b2b`; T-34 secretos y SPF/DKIM/DMARC; T-35 pruebas del endpoint | Formulario fuera de alcance | Roadmap R-06 |
| R-03 | Ampliación de cobertura fuera de Santa Marta | Cobertura fuera de alcance | Roadmap R-03 |
| R-04 | Carrito, pasarela de pago y pedidos en línea | Fuera de Fase 1 | Roadmap R-04 |
| R-05 | Harina y chips (registro INVIMA) | Fuera de Fase 1 | Roadmap R-05 |
| R-07 | T-29 `analytics.ts` (eventos FR-20, UTM, Plausible o Umami); verificación de eventos | Analítica fuera de Fase 1 | Roadmap R-07 |
| R-08 | Decidir hosting (Azure Static Web Apps o Cloudflare Pages): medir latencia desde Colombia y límites del plan gratuito en preproducción | Decisión antes del primer despliegue | Roadmap R-08 |
| R-09 | Facturación electrónica: proveedor, datos de factura, FAQ 10 | Q8 sin decidir | Roadmap R-09 |
| R-10 | CI/CD y despliegue en varios entornos con GitHub Actions (mismo proveedor que el repositorio); la pipeline reutiliza el script de validación de T-11; configurar preview y producción | Decisión de proveedor antes de desplegar en distintos entornos | Roadmap R-10 |

## 10. Roadmap de producción (RP)

Pendientes que deben quedar resueltos antes de publicar en producción. No bloquean la construcción de la Fase 1.

| ID | Tarea | Preguntas | Dep. |
|---|---|---|---|
| RP-01 | Reemplazar datos ficticios por reales en `site.json`: nombre comercial, razón social, NIT, dirección, correo, número de contacto y horario; registrar dominio comprado | Q1, Q6, Q7, Q9 (T-06) | – |
| RP-02 | Reemplazar origen ficticio (finca, asociación, municipio) y las imágenes libres o ficticias por fotos reales de producto, productor y acopio | Q4, Q10 | T-04 |
| RP-03 | Definir y validar con asesor jurídico cómo se informa el precio total por teléfono sin incumplir la Ley 1480. Evaluar también si los medios de pago y el tiempo de entrega deben publicarse en la página [POR CONFIRMAR] | Q14 (T-48), Q18 | T-05 |
| RP-04 | Definir la política de garantía: reposición del producto, devolución del dinero o ambas | Q16 | T-05 |
| RP-05 | Definir el procedimiento de PQR con constancia: correo electrónico o teléfono con número de radicado | Q17 | T-05 |
