# Tareas: Landing Guineo Verde

**Versión:** 1.5 · **Fecha:** 2026-10-19 · **Alcance vigente:** `05-alcance-y-roadmap.md` v1.5

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
8. Fases 7 a 10: cambio v1.5 y auditorías
9. Resumen y estado de avance
10. Roadmap (fuera de la Fase 1)
11. Roadmap de producción (RP)

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
| T-32 | Cabeceras de seguridad y CSP según el hosting elegido (R-08); validar scripts de Next.js; verificación con escáner de cabeceras. **Mapa (FR-24, T-54):** `Referrer-Policy` debe ser `strict-origin-when-cross-origin` o más permisiva, nunca `no-referrer` (la política de teselas de OSM exige el Referer); la CSP debe permitir `img-src https://tile.openstreetmap.org` | NFR-04 | 2 | T-33, R-08 |
| T-37 | Pruebas e2e Playwright: botón Llamar en todos los puntos de contacto, acordeón, navegación por teclado | AC-01 a 03, 09 | 4 | T-33 |
| T-38 | Auditoría de accesibilidad (axe) y prueba con lector de pantalla | NFR-02, AC-09 | 3 | T-33 |
| T-39 | Revisión de copy contra P1 y P3, sin precios, sin imágenes sin licencia y la lista legal (spec §9) | AC-02, 07, 13 | 2 | T-33, T-27 |
| T-40 | `npm audit` en el script de validación local (T-11) y Dependabot (actualizaciones semanales y alertas y PR de seguridad), ya que el repositorio está en GitHub | NFR-04 | 1 | T-11 |
| T-49 | Eliminar las 5 vulnerabilidades altas de `braces` en dependencias de desarrollo (riesgo D-12). Opción preferida: reemplazar `eslint-config-next` por una configuración propia (typescript-eslint, eslint-plugin-react, react-hooks, jsx-a11y) sin `@next/eslint-plugin-next`, que es quien trae `fast-glob` → `micromatch` → `braces`; antes, verificar que ningún otro plugin traiga `braces`. Alternativas: `overrides` de npm (riesgoso, toda versión de `fast-glob` trae `braces`) o esperar el arreglo upstream. **Criterio de cierre:** `npm audit` completo sin altas ni críticas, el lint mantiene la cobertura de TypeScript, React, hooks y accesibilidad, y `validate` pasa a usar la auditoría completa | NFR-04 | 3 | T-40 |

## Fase 6: Lanzamiento

| ID | Tarea | Req. | Est. | Dep. |
|---|---|---|---|---|
| T-42 | Revisión jurídica final y aprobación del negocio (incluye RP-03) | Spec §9, Q14 | 2 | T-39, RP-02 a RP-05 |
| T-43 | Configurar dominio comprado (RP-01), HTTPS y redirecciones (www → raíz) | NFR-04, Q9 | 1 | RP-01, R-08 |
| T-44 | Despliegue a producción y prueba humo (llamada real a la línea de contacto) | DoD | 2 | T-42, T-43, R-08, R-10 |
| T-45 | Monitoreo: alertas de disponibilidad y revisión semanal de llamadas recibidas | Plan §8 | 2 | T-44 |

## Fase 7: Cambio v1.5 (navegación de retorno y mapa de fincas)

Origen: solicitud del usuario (2026-10-19). Requisitos: FR-19, FR-24, AC-14 a AC-20 (`01-spec.md` v1.5). Decisión D-13 (`05-alcance-y-roadmap.md` v1.5). Diseño: `03-plan.md` D6. `[P]` = en paralelo.

| ID | Tarea | Req. | Est. | Dep. |
|---|---|---|---|---|
| T-50 | Escribir el cambio de alcance v1.5 en `05`, `01`, `02` y `03`; registrar A-07 y D-13; actualizar este plan | FR-19, FR-24, D-13 | 1 | – |
| T-51 | Enlace a inicio desde la marca de `TopBar` en todas las páginas, y "Volver al inicio" en `LegalPage` (claves `navigation.backHome` en `copy.json`, esquema Zod) [P] | FR-19, AC-14 | 1.5 | T-50 |
| T-52 | `content/fincas.json` (centro, zoom, fincas ficticias y acopio), esquema Zod estricto y validación en `content.ts`. Las fincas con "(FICTICIO)" entran en `findPendingMarkers` [P] | FR-24, AC-17 | 1.5 | T-50 |
| T-53 | `MapaFincas` (servidor: sección, lista accesible, aviso) y `MapaFincasInteractivo` (cliente: Leaflet importado solo al pulsar "Ver mapa", altura reservada, `isolate`, `divIcon` con tokens). Sección después de `Origin` en `page.tsx` | FR-24, AC-15, AC-16, AC-19 | 4 | T-52 |
| T-54 | Dependencias `leaflet` y `@types/leaflet` por npm (sin CDN). Verificar `npm run budget` ≤ 300 KB sin Leaflet en la carga inicial. Verificar que `Referrer-Policy` permite enviar el origen a OSM | AC-15, AC-20, NFR-04 | 1.5 | T-53 |
| T-55 | Pruebas. Unitarias: enlace de marca y de retorno, lista de fincas, bloqueo de ficticios, aviso antes del mapa. e2e: axe con la sección nueva, enlace de retorno en las tres legales, Leaflet no descargado antes del clic | AC-14 a AC-19 | 2.5 | T-51, T-53 |
| T-56 | Atribución "© OpenStreetMap contributors" visible y aviso de conexión con enlace a la política de privacidad de OSM. Revisión jurídica de D-13 junto con T-05. Si se rechaza, plan B (`03` D6) | AC-18, AC-19, D-13 | 1 | T-50 |
| T-57 | Cierre: entrada en `doc/bitacora.md`, estado en esta tabla, archivos tocados | CLAUDE.md | 0.5 | T-55, T-56 |

## Fase 8: Auditoría externa (2026-10-24)

Origen: auditoría pasiva de caja negra sobre la demo publicada el 2026-10-23 (45 hallazgos; informe entregado por el usuario, no versionado). Aprobada por el usuario el 2026-10-24.

Clasificación de los hallazgos:
- **Ya resueltos:** UX-01 (el build de producción falla con marcadores), SEO-01 (`robots` por `SITE_ENV`), SEC-08 (verificado con `owasp-security`), PERF-01 y PERF-02 en parte, SEO-08 y SEC-10.
- **Bloqueados por el usuario o el negocio:** RP-01, R-08 (T-32), T-36, RP-03, T-03, FR-12 y la protección de `main`.
- **Fuera de la Fase 1:** R-01, R-02, R-06 y R-07. Las páginas de recetas y la navegación interna requieren un cambio de alcance en `05`.
- **No adoptados:** JavaScript < 70 KB (el runtime de React y Next no baja; el presupuesto es P5), payload RSC, quitar el preload de Inter.

| ID | Tarea | Hallazgo / Req. | Est. | Dep. |
|---|---|---|---|---|
| T-58 | Enlace "Saltar al contenido" (texto en `copy.json`, esquema Zod) hacia `<main id>` en todas las páginas [P] | UX-08, NFR-02 | 1 | – |
| T-59 | El nombre accesible de cada "Llamar para precio" agrega la presentación después del texto visible ("Llamar para precio: Bolsa familiar, al …"), así la lista de enlaces del lector de pantalla los distingue sin romper WCAG 2.5.3 [P] | UX-02, NFR-02 | 1 | – |
| T-60 | Texto de la barra superior en 14 px también en móvil, sin desborde a 360 px [P] | UX-03, P4 | 0.5 | – |
| T-61 | Medir con Playwright la descarga repetida de la página; si viene del *prefetch*, `prefetch={false}` en la marca y en "Volver al inicio" [P] | PERF-05, P5 | 1 | – |
| T-62 | `Referrer-Policy: strict-origin-when-cross-origin` por `<meta>` (`metadata.referrer`); comprobar que OSM sigue recibiendo el origen (T-54) [P] | SEC-03 parcial, NFR-04 | 0.5 | – |
| T-63 | `favicon.ico` y `apple-icon.png` generados desde `icon.svg` [P] | SEO-05 | 1 | – |
| T-64 | Quitar `meta keywords` (`copy.seo.keywords` y su esquema) y el `hreflang` autorreferente [P] | SEO-06 | 0.5 | – |
| T-65 | JSON-LD `LocalBusiness` con `image` (og.jpg) y `geo` (acopio de `fincas.json`). Sin `priceRange` ni catálogo de ofertas (R-01) [P] | SEO-07 parcial, NFR-03 | 1 | – |
| T-66 | CSP por `<meta>` con hashes de los scripts en línea, calculados después del build; verificar sin violaciones en las 4 páginas y con el mapa. `frame-ancestors` no aplica por `<meta>` (queda para T-32) | SEC-01 parcial, D-11, P6 | 4 | T-62 |
| T-67 | `/.well-known/security.txt` (RFC 9116) generado desde `site.json`; verificar que GitHub Pages lo publique | SEC-07 | 1 | – |

Cierre de la fase: `npm run validate`, `budget` y `lighthouse`; entrada en `doc/bitacora.md` y estado en esta tabla.

## Fase 9: Auditoría independiente (2026-10-24)

Origen: auditoría independiente de código y navegador sobre `59543dc` (11 hallazgos, H-01 a H-11; informe y capturas entregados por el usuario, no versionados). Se verificó que siguen vigentes en `f5638ef`. Aprobada por el usuario el 2026-10-24.

Decisiones del usuario:
- **H-02:** la foto del hero se cuenta aparte (≤ 120 KB) y se alinea P5 de la constitución con `03` §8.
- **H-08:** `npm audit` pasa a bloquear la publicación (cambia la decisión de confiar solo en Dependabot).
- **H-07:** el número ficticio de la demo se mantiene hasta RP-01.

Sin tareas: H-05 (RP-01), H-06 (R-07) y H-09 (T-32, R-08), ya registrados.

| ID | Tarea | Hallazgo / Req. | Est. | Dep. |
|---|---|---|---|---|
| T-68 | `FloatingCallVisibility` vuelve a buscar `#hero` y `#pie` en cada cambio de ruta. Sin hero en la página, el botón no se muestra. e2e: landing → Privacidad → "Volver al inicio" con el botón oculto, y visible después del scroll | H-11, FR-17 | 2 | – |
| T-69 | Mapa: si no carga ninguna tesela (evento `load` de la capa sin ningún `tileload`, o 15 s sin respuesta), pasa a error, destruye la instancia y vuelve el mapa ilustrado con "Reintentar" (texto en `copy.json`). Cada intento limpia la instancia anterior. e2e con teselas HTTP 500 y recuperación | H-03, H-04, FR-24 | 4 | – |
| T-70 | La política de privacidad (borrador) describe la conexión opcional con OpenStreetMap: cuándo, a quién, qué dato y la alternativa. Prueba de coherencia con `copy.map.consent`. Revisión jurídica con T-05 y D-13 | H-10, NFR-09 | 1 | – |
| T-71 | Publicar el artefacto verificado: `verificar` construye también con el prefijo, `server.mjs` lo sirve bajo `/green-banana-web/`, corre una prueba de humo, y ese mismo `out-pages/` se sube a Pages (el job `build` deja de reconstruir) | H-01, R-10 | 4 | – |
| T-72 | `npm run audit:deps` bloqueante en `verificar`; política de excepciones en `05` (como D-12) | H-08, NFR-04 | 1 | – |
| T-73 | `npm run budget` informa también el total con la imagen LCP de cada viewport; P5 de `00` alineado con `03` §8 | H-02, P5 | 1 | – |
| T-74 | Cierre: `validate`, `lighthouse`, revisión de `arquitecto-software`, bitácora y estado | CLAUDE.md | 1 | T-68 a T-73 |

## Fase 10: Reauditoría de cierre (2026-10-24)

Origen: reauditoría independiente sobre `e7b686d` (informe y evidencias entregados por el usuario, no versionados). Dictamen: H-01, H-02, H-04, H-08, H-10 y H-11 cerrados; H-03 mitigado (un fallo parcial de teselas no avisa); H-05, H-06, H-07 y H-09 diferidos o aceptados. Hallazgo nuevo **R-01**: `npm run lighthouse` solo evalúa las cuatro categorías y pasa con un LCP de laboratorio de 3,2 s, por encima de los 2,5 s de NFR-01. Aprobada por el usuario el 2026-10-24.

Diagnóstico previo: el elemento LCP es la foto del hero móvil (antes era el H1). Su descubrimiento está bien resuelto (`fetchpriority="high"`, sin `lazy`); lo observado es un retraso de pintado de ~500 ms, y los 3,2 s salen de la simulación de 4G lenta (CPU ×4).

Decisiones del usuario:
- **R-01:** investigar y fijar. El control bloquea desde ya con LCP > 3,5 s en laboratorio; después de T-76 el presupuesto se ajusta a lo logrado con un margen pequeño. Los 2,5 s quedan como meta p75 de campo.
- **H-03:** el fallo parcial de teselas (huecos sin aviso) se acepta; la lista de fincas siempre está visible.

| ID | Tarea | Hallazgo / Req. | Est. | Dep. |
|---|---|---|---|---|
| T-75 | `lighthouse.mjs` evalúa también métricas individuales contra un presupuesto de laboratorio (LCP ≤ 3,5 s, CLS ≤ 0,1, TBT) y falla si alguna lo supera; prueba negativa. NFR-01 distingue presupuesto de laboratorio (bloquea) y p75 de campo | R-01, NFR-01, AC-08 | 3 | – |
| T-76 | Experimentos medidos para bajar el LCP (uno por vez, varias corridas): precarga de Inter, decodificación y peso del hero, tareas largas de JS. Se conserva solo lo que mejora sin empeorar lo demás; presupuesto de T-75 ajustado al resultado | R-01, NFR-01 | 6 | T-75 |
| T-77 | Cierre: decisión sobre H-03 registrada, `validate`, revisión de `arquitecto-software`, bitácora, estado y push | CLAUDE.md | 1 | T-75, T-76 |

## Fase 11: Auditoría de causa raíz (2026-10-24)

Origen: auditoría integral sobre `d9ca4fb` (informe y evidencias entregados por el usuario, no versionados). Dictamen: el control de Lighthouse está corregido, pero cumplir 3,4 s no prueba LCP ≤ 2,5 s; H-03 sigue presente, y hay un hallazgo nuevo **MAP-02**: si el mapa carga bien y después falla el proveedor, al moverlo queda gris sin aviso ni "Reintentar". Causa: el contador de teselas es acumulado en la sesión (un éxito inicial desactiva la detección), no se observa `tileerror` y `ready` llega antes de que haya cartografía. Medido con throttling de DevTools: base 2710 ms; sin JavaScript 2415 ms; sin fuentes 2456 ms; hero más comprimido 2584 ms (efectos no sumables). Aprobada por el usuario el 2026-10-24.

Decisiones del usuario:
- **H-03 se reabre:** un fallo parcial de teselas muestra un aviso discreto con "Reintentar"; el mapa sigue usable.
- **Fuentes:** Inter recortada a los caracteres del español y a los pesos usados, servida desde el sitio; mismo diseño.
- **CI-01:** Lighthouse corre en `verificar` como paso informativo; no bloquea la publicación.

| ID | Tarea | Hallazgo / Req. | Est. | Dep. |
|---|---|---|---|---|
| T-78 | Regresiones e2e del mapa, escritas antes de la corrección: parcial (una correcta y el resto 500), todo 500 al inicio, éxito y luego fallo tras zoom o desplazamiento, una correcta y el resto pendiente > 15 s, "Reintentar" sin doble instancia ni error JS, desmontar durante la carga; axe y teclado en cada estado | MAP-01, MAP-02, H-03 | 8 | – |
| T-79 | Salud del mapa por vista: registro de teselas con `tileloadstart`/`tileload`/`tileerror`/`tileunload`, evaluación en cada `load`, espera por lote, estados parcial y sin cartografía con aviso y "Reintentar" (`redraw()`, nunca automático); `ready` no retira el estado hasta que hay cartografía | MAP-01, MAP-02, H-03 | 12 | T-78 |
| T-80 | `npm run lighthouse` con método de throttling configurable (simulado o DevTools), subpartes del LCP y verificación del elemento LCP; línea base con ambos métodos | PERF-01, PERF-02 | 4 | – |
| T-81 | Hero: 2 o 3 calidades AVIF con las mismas dimensiones, comparación visual aprobada por el usuario y medición | PERF-02 | 4 | T-80 |
| T-82 | Inter recortada (español, pesos usados) con `next/font/local`; menos bytes verificados en la red, CLS 0, sin regresión visual; licencia en `doc/creditos.md` | PERF-02 | 12 | T-80 |
| T-83 | Análisis del JavaScript inicial con el analizador de Next; solo cambios pequeños y seguros, o justificación documentada | PERF-02 | 6 | T-80 |
| T-84 | Documentación: modos de Lighthouse sin "el simulado infla"; robots.txt solo en la raíz del host; FAQ sin resultado enriquecido; CI-01; H-03 reabierto en `05` | PERF-01, SEO-OBS, CI-01 | 4 | T-79 a T-83 |
| T-85 | Lighthouse informativo en `verificar` (no bloquea) | CI-01 | 4 | T-80 |
| T-86 | Cierre: `validate`, revisión de `arquitecto-software`, bitácora, estado y push | CLAUDE.md | 2 | T-78 a T-85 |

## Resumen

| Fase | Horas estimadas |
|---|---|
| 0. Decisiones y contenido | 16 |
| 1. Fundaciones | 13 |
| 2. Componentes | 32 |
| 3. Formulario y backend | 0 (en roadmap) |
| 4. Legal y SEO | 9 |
| 5. Calidad y seguridad | 19 |
| 6. Lanzamiento | 7 |
| 7. Cambio v1.5 (navegación y mapa) | 13,5 |
| 8. Auditoría externa | 11,5 |
| 9. Auditoría independiente | 14 |
| 10. Reauditoría de cierre | 10 |
| 11. Auditoría de causa raíz | 56 |
| **Total** | **~202 h** |

**Ruta crítica:** T-01 → T-05 → T-42 → T-44, con RP-01 a RP-05 antes de T-42 y T-43. En paralelo: T-09 → componentes → T-33 → T-30/T-37/T-39.
**Hito sugerido:** MVP publicable al completar Fase 2 + T-26, T-27 y T-44. Publicar exige cerrar antes el roadmap de producción: RP-01 (datos reales y dominio), RP-02 (origen y fotos reales) y RP-03 (validación jurídica del precio por teléfono, medios de pago y tiempo de entrega), RP-04 (política de garantía) y RP-05 (procedimiento de PQR), además de decidir hosting (R-08) y CI/CD (R-10). La Fase 1 se construye con datos ficticios.
**Estimaciones:** orientativas, sin considerar tiempo de espera de terceros (revisión jurídica, producción de fotos).

## Estado de avance

Actualizado: 2026-10-24. Detalle de cada tarea en `doc/bitacora.md`.

| Estado | Tareas |
|---|---|
| **Hecha** | T-01; T-07, T-08, T-09, T-10, T-11; T-12 a T-21, T-23, T-24, T-25, T-28, T-33, T-46, T-47; T-26, T-31; T-30, T-37, T-39, T-40, T-49 |
| **Hecha con contenido provisional** | T-04: fotos generadas con IA, se reemplazan en RP-02. T-27: páginas legales en borrador, esperan T-05 |
| **Parcial** | T-38: auditoría automática con axe sin infracciones; falta la prueba manual con lector de pantalla |
| **Pendiente del usuario o de terceros** | T-03 (confirmaciones del proveedor), T-05 (texto legal), T-36 (necesita RP-01), T-32 (necesita R-08; en la demo, conflicto D-11) |
| **Pendiente, Fase 6** | T-42, T-43, T-44, T-45 (necesitan RP-01 a RP-05, R-08 y R-10) |
| **Fase 11 (auditoría de causa raíz)** | En curso (2026-10-24): T-78 a T-84 hechas; T-85 y T-86 pendientes |
| **Fase 10 (reauditoría de cierre)** | Completa (2026-10-24): T-75 a T-77 |
| **Fase 9 (auditoría independiente)** | Completa (2026-10-24): T-68 a T-74 |
| **Hecha, Fase 8 (auditoría externa)** | T-58 a T-67 (2026-10-24). T-61 quitó 13 descargas sin clic (prefetch). T-66: CSP por `<meta>` con hashes; `frame-ancestors` y las demás cabeceras siguen en T-32. T-67 solo tiene efecto con dominio propio (RP-01) |
| **Hecha, cambio v1.5** | T-50 (specs v1.5); T-51 a T-55 y T-57 (2026-10-19). T-56 hecha en código (atribución y aviso); su revisión jurídica de D-13 sigue pendiente junto con T-05 |

Demo publicada: https://masterarqsoft.github.io/green-banana-web/ (GitHub Pages, datos ficticios, sin indexar).

---

## 10. Roadmap (fuera de la Fase 1)

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

## 11. Roadmap de producción (RP)

Pendientes que deben quedar resueltos antes de publicar en producción. No bloquean la construcción de la Fase 1.

| ID | Tarea | Preguntas | Dep. |
|---|---|---|---|
| RP-01 | Reemplazar datos ficticios por reales en `site.json`: nombre comercial, razón social, NIT, dirección, correo, número de contacto y horario; registrar dominio comprado | Q1, Q6, Q7, Q9 (T-06) | – |
| RP-02 | Reemplazar origen ficticio (finca, asociación, municipio) y las imágenes libres o ficticias por fotos reales de producto, productor y acopio | Q4, Q10 | T-04 |
| RP-03 | Definir y validar con asesor jurídico cómo se informa el precio total por teléfono sin incumplir la Ley 1480. Evaluar también si los medios de pago y el tiempo de entrega deben publicarse en la página [POR CONFIRMAR] | Q14 (T-48), Q18 | T-05 |
| RP-04 | Definir la política de garantía: reposición del producto, devolución del dinero o ambas | Q16 | T-05 |
| RP-05 | Definir el procedimiento de PQR con constancia: correo electrónico o teléfono con número de radicado | Q17 | T-05 |
