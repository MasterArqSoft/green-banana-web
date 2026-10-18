# Tareas: Landing Guineo Verde

**Versión:** 1.0 · **Fecha:** 2026-10-18

Estimaciones en horas efectivas, para una persona con perfil fullstack senior. `[P]` = se puede hacer en paralelo con otras tareas de la misma fase. Referencias: FR/NFR/AC de `01-spec.md` y secciones de `03-plan.md`.

## Índice
1. Fase 0: Decisiones y contenido
2. Fase 1: Fundaciones
3. Fase 2: Componentes de la página
4. Fase 3: Formulario B2B y backend
5. Fase 4: Legal, analítica y SEO
6. Fase 5: Calidad y seguridad
7. Fase 6: Lanzamiento
8. Resumen

---

## Fase 0: Decisiones y contenido (bloquea el resto)

| ID | Tarea | Resuelve | Est. | Dep. |
|---|---|---|---|---|
| T-01 | Responder las preguntas abiertas Q1–Q12 de la spec | Q1–Q12 | 2 | – |
| T-02 | Definir precios por presentación y política de envío gratis | Q3, Q11 | 2 | T-01 |
| T-03 | Confirmar origen, finca y vida útil del producto con el proveedor | Q4 | 2 | T-01 |
| T-04 | Producir fotos reales: producto, productor, recetas | Q10 | 8 | T-01 |
| T-05 | Redactar texto legal base (términos, privacidad, garantía) y enviar a revisión jurídica | Spec §9 | 4 | T-01 |
| T-06 | Elegir y registrar dominio; configurar WhatsApp Business | Q7, Q9 | 2 | T-01 |

**Criterio de salida:** ningún `[POR CONFIRMAR]` pendiente en las secciones que se van a implementar.

## Fase 1: Fundaciones

| ID | Tarea | Req. | Est. | Dep. |
|---|---|---|---|---|
| T-07 | Crear repositorio, proyecto Astro + TypeScript + Tailwind, lint, formato y pre-commit | Plan §4 | 2 | – |
| T-08 | Implementar `lib/whatsapp.ts` (URL, plantillas, codificación, UTM) con pruebas unitarias | FR-04, §4.1 | 3 | T-07 |
| T-09 | Esquemas Zod y archivos de contenido (`site`, `products`, `zones`, `faq`, `recipes`, `origin`) con validación en build | NFR-07, Plan §5 | 3 | T-07 |
| T-10 | Tokens de diseño (colores, tipografía, espaciado), layout base y fuentes autoalojadas | Content §5 | 3 | T-07 |
| T-11 | Pipeline CI inicial: lint, tipos, pruebas, build, despliegue a preview | Plan §10 | 3 | T-07 |

## Fase 2: Componentes de la página

| ID | Tarea | Req. | Est. | Dep. |
|---|---|---|---|---|
| T-12 | `TopBar` con zonas, corte horario, mínimo y WhatsApp [P] | FR-01 | 2 | T-09, T-10 |
| T-13 | `Hero` con precio "desde", CTA y imagen optimizada [P] | FR-02 | 3 | T-09, T-10 |
| T-14 | `TrustBar` de cuatro íconos [P] | FR-03 | 1 | T-10 |
| T-15 | `ProductCards` con precio por kg, peso y unidades; botón por tarjeta [P] | FR-04 | 4 | T-08, T-09 |
| T-16 | `FreshInfo` ("Verde de verdad") [P] | FR-05 | 1 | T-10 |
| T-17 | `Origin` con esquema de tres pasos y lote vigente [P] | FR-06 | 3 | T-09 |
| T-18 | `Recipes` con tarjetas [P] | FR-07 | 2 | T-09 |
| T-19 | `HowItWorks` de tres pasos [P] | FR-09 | 1 | T-10 |
| T-20 | `Coverage` con tabla de zonas y costos visibles por separado [P] | FR-10 | 2 | T-09 |
| T-23 | `Testimonials` renderizada solo si hay datos reales [P] | FR-12 | 2 | T-09 |
| T-24 | `Faq` en acordeón accesible, con JSON-LD FAQPage [P] | FR-13 | 3 | T-09 |
| T-25 | `Guarantee` con aclaración de perecedero [P] | FR-14 | 1 | T-10 |
| T-28 | `FloatingWhatsApp` visible tras el hero, sin tapar el pie [P] | FR-17 | 2 | T-08 |
| T-46 | `Benefits` con texto cauteloso, sin promesas médicas [P] | FR-08 | 1 | T-10 |
| T-47 | `FinalCta` de cierre [P] | FR-15 | 1 | T-08 |
| T-33 | Composición de `index.astro` en el orden de la spec y revisión móvil a 360 px | FR-01 a 17 | 3 | T-12 a T-28, T-46, T-47 |

## Fase 3: Formulario B2B y backend

| ID | Tarea | Req. | Est. | Dep. |
|---|---|---|---|---|
| T-21 | Componente `B2BForm`: validación en cliente, consentimiento, estados de carga, error y éxito, accesible | FR-11, §4.2 | 4 | T-10 |
| T-22 | Función `/api/b2b`: validación en servidor, Turnstile, honeypot, límite de frecuencia, envío de correo, registro del lead | §4.2, Plan §6 | 6 | T-07 |
| T-34 | Configurar variables de entorno y secretos en el hosting; SPF, DKIM y DMARC del dominio de correo | NFR-04 | 2 | T-06, T-22 |
| T-35 | Pruebas del endpoint: casos válidos, inválidos, spam, exceso de solicitudes | AC-07 | 3 | T-22 |

## Fase 4: Legal, analítica y SEO

| ID | Tarea | Req. | Est. | Dep. |
|---|---|---|---|---|
| T-26 | `Footer` con datos legales, PQR y enlace visible a la SIC | FR-16 | 2 | T-09 |
| T-27 | Páginas de términos, privacidad y garantía con el texto revisado por jurídico | FR-18, NFR-09 | 3 | T-05 |
| T-29 | `analytics.ts`: eventos FR-20, UTM, sin datos personales; herramienta elegida | FR-20 a 22 | 3 | T-11 |
| T-31 | SEO: metadatos, Open Graph, JSON-LD (LocalBusiness, Product), sitemap, robots, canónica | NFR-03 | 3 | T-33 |
| T-36 | Alta y vinculación de Google Business Profile | NFR-03 | 1 | T-06 |

## Fase 5: Calidad y seguridad

| ID | Tarea | Req. | Est. | Dep. |
|---|---|---|---|---|
| T-30 | Optimización de rendimiento: imágenes, fuentes, JS, CSS crítico; Lighthouse CI con umbrales | NFR-01, AC-09 | 4 | T-33 |
| T-32 | Cabeceras de seguridad y CSP en `staticwebapp.config.json`; verificación con escáner de cabeceras | NFR-04 | 2 | T-33 |
| T-37 | Pruebas e2e Playwright: CTA de WhatsApp, formulario, acordeón, navegación por teclado | AC-01 a 03, 07, 10 | 5 | T-33, T-21 |
| T-38 | Auditoría de accesibilidad (axe) y prueba con lector de pantalla | NFR-02, AC-10 | 3 | T-33 |
| T-39 | Revisión de copy contra los principios P1 y P3 y la lista legal (spec §9) | AC-05, 06, 08 | 2 | T-33, T-27 |
| T-40 | `npm audit` y Dependabot configurados | NFR-04 | 1 | T-11 |
| T-41 | Verificación de eventos de analítica en preproducción | AC-11 | 2 | T-29, T-33 |

## Fase 6: Lanzamiento

| ID | Tarea | Req. | Est. | Dep. |
|---|---|---|---|---|
| T-42 | Revisión jurídica final y aprobación del negocio | Spec §9 | 2 | T-39 |
| T-43 | Configurar dominio, HTTPS y redirecciones (www → raíz) | NFR-04 | 1 | T-06 |
| T-44 | Despliegue a producción y prueba humo (pedido real de prueba por WhatsApp, envío real de formulario) | DoD | 2 | T-42, T-43 |
| T-45 | Monitoreo: alertas de disponibilidad y revisión semanal de métricas, precios y mensajes recibidos | Plan §9, R2 | 2 | T-44 |

## Resumen

| Fase | Horas estimadas |
|---|---|
| 0. Decisiones y contenido | 20 |
| 1. Fundaciones | 14 |
| 2. Componentes | 32 |
| 3. Formulario y backend | 15 |
| 4. Legal, analítica y SEO | 12 |
| 5. Calidad y seguridad | 19 |
| 6. Lanzamiento | 7 |
| **Total** | **~119 h** |

**Ruta crítica:** T-01 → T-02/T-03/T-04 → T-09 → componentes (T-12 a T-28) → T-33 → T-30/T-37/T-39 → T-42 → T-44.
**Hito sugerido:** MVP publicable al completar Fase 2 + T-26, T-27 y T-44 (sin formulario B2B ni analítica avanzada) si se necesita salir antes.
**Estimaciones:** orientativas, sin considerar tiempo de espera de terceros (revisión jurídica, producción de fotos).
