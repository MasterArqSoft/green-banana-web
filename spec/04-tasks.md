# Tareas: Landing Guineo Verde

**Versión:** 1.7 · **Fecha:** 2026-10-24 · **Alcance vigente:** `05-alcance-y-roadmap.md` v1.7

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
8. Fases 7 a 13: cambio v1.5, auditorías, internacionalización y remediación
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
| T-32 | Cabeceras de seguridad y CSP según el hosting elegido (R-08); validar scripts de Next.js; verificación con escáner de cabeceras. **Mapa (FR-24, T-54):** `Referrer-Policy` debe ser `strict-origin-when-cross-origin` o más permisiva, nunca `no-referrer` (la política de teselas de OSM exige el Referer); la CSP debe permitir `img-src https://tile.openstreetmap.org`. **Preparado por T-115 (2026-10-25):** archivos de cabeceras generados en el build y verificador remoto; queda aplicarlos en el hosting de R-08 y verificar el dominio final | NFR-04 | 2 | T-33, R-08 |
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
- **Bloqueados por el usuario o el negocio:** RP-01, R-08 (T-32), T-36, RP-03, T-03 y FR-12. La protección de `main` quedó configurada el 2026-10-25 (B11, ruleset 25829447).
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
- **CI-01:** Lighthouse corre en GitHub Actions como paso informativo; no bloquea la publicación (desde la revisión de la Fase 11, en un job aparte que tampoco la retrasa).

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

## Fase 12: Español predeterminado e inglés opcional

**Revisión UX del selector (2026-10-24, T-93/T-98):** control con globo y nombres completos integrado en la cabecera; una fila en escritorio y segunda fila en móvil. Conserva enlaces sin JS y query/hash con JS. Ajustados los márgenes de Origen y Mapa y las expectativas de teclado. Evidencia y validación en la entrada más reciente de `doc/bitacora.md`.

Origen: solicitud del usuario de analizar el proyecto local, consultar buenas prácticas y preparar tareas para implementación por Claude Code (2026-10-24). Alcance A-08 (`05` v1.6); requisitos FR-25 a FR-28 y AC-21 a AC-29 (`01` v1.6); contenido `02` §1 y decisión D7 (`03` v1.9).

**Estado:** implementada el 2026-10-24 por orden del usuario (T-87 a T-99), sin dependencias nuevas. Integrada después en `main` con los commits `2bf312d` y `10cd67b` y publicada en la demo (ver «Estados de entrega»). Evidencia por tarea en `doc/bitacora.md` (entrada «Fase 12, implementación»).

Objetivo: conservar español colombiano en las URL actuales y añadir inglés bajo `/en`, con selector y HTML estático por idioma. La URL conserva el idioma al navegar y recargar; `/` sigue siendo española sin detección del navegador ni persistencia por cookies. No cambia la cobertura comercial ni cierra pendientes del negocio.

| ID | Tarea | Req. | Est. | Dep. |
|---|---|---|---|---|
| T-87 | Al iniciar implementación, releer `05`, constitución, `01` a `04`, `CLAUDE.md`, bitácora y guías de Next instaladas. Confirmar HEAD y estado sin descartar cambios. Inventariar cada cadena visible/accesible y cada consumidor de contenido, rutas, formatos, mapa, SEO y pruebas; registrar cobertura por archivo y la línea base de validación. **Cierre:** inventario completo y baseline real; ningún resultado previo se da por ejecutado en esta fase | FR-25 a FR-28, D7 | 2 | — |
| T-88 | Prueba técnica mínima de D7 antes de migrar: tabla tipada de equivalencias, layouts raíz por idioma y 404 global. Exportar español/inglés con `lang` correcto y recursos especiales sin colisiones, con y sin prefijo. Verificar recarga directa y 404 real. Si se necesita `global-not-found`, leer guía local, documentar su carácter experimental y demostrar que exporta `404.html`; si falla, registrar el ajuste y detener tareas dependientes sin retirar export estático. **Cierre:** evidencia de ambos builds y decisión de composición fijada | FR-25, FR-26, FR-28, AC-21, AC-22, AC-28, D-15 | 4 | T-87 |
| T-89 | Diseñar e implementar contenido por idioma en `src/lib/content.ts` y Zod: datos comunes únicos, catálogos español/inglés por dominio, tipo cerrado y `getContent(locale)` sin estado mutable global. Validación de ambos catálogos, paridad de claves/IDs/referencias/variables y campos estrictos. Adaptar restricciones de imports para JSON anidados sin abrir acceso cliente. **Cierre:** mismo contrato para los dos idiomas, fallo por falta de traducción y ninguna copia editable del teléfono ni cifras | FR-27, AC-24, AC-26, NFR-07, P9 | 6 | T-88 |
| T-90 | Migrar contenido español y preparar inglés completo: secciones, productos, recetas, FAQ, origen, cobertura, fincas, testimonios condicionales, legales, avisos demo/borrador, CTA, alternativas de imagen, `aria-label`, metadatos y mapa. Aplicar reglas editoriales de `02` §1. **Cierre:** inventario T-87 cubierto en ambos idiomas, nombres propios y datos comunes conservados; legales siguen en borrador y sin inventar datos pendientes | FR-27, AC-24, AC-26, P1, P3 | 8 | T-89 |
| T-91 | Guardas bilingües de publicación y formatos: frases prohibidas inglesas, ficticios y pendientes en todos los catálogos; fechas/listas/decimales por idioma con UTC para fecha sin hora y unidades métricas. **Cierre:** pruebas negativas independientes de guardas, ausencia de traducción y variables inconsistentes; probar producción con contenido controlado válido y luego cada fallo aislado, sin tocar los datos reales del repositorio | FR-27, AC-24, AC-26, D-16 | 4 | T-89, T-90 |
| T-92 | Componer ocho páginas estáticas según tabla D7 y layouts validados en T-88. Compartir shell, landing y legales; pasar idioma/contenido explícitos a secciones y props mínimos a clientes. Marca, pie, anclas y retorno usan rutas del idioma. 404 global con ayuda inglesa. **Cierre:** HTML y texto correctos sin JS, sin duplicar lógica ni mutación de `lang` tras hidratación | FR-25 a FR-28, AC-21, AC-22, AC-26, AC-28 | 8 | T-88, T-90, T-91 |
| T-93 | Selector «Español / English» en las ocho páginas: enlaces a equivalentes, estado activo, `lang`/`hreflang`, foco y 44 px; sin banderas como único identificador. Mejora cliente mínima para query/hash si hace falta, sin importar catálogos; sin JS cambia a la página equivalente. **Cierre:** cambio en ambos sentidos, recarga, apertura en pestaña y navegación manteniendo idioma; sin prefetch ni activación del mapa | FR-26, AC-23, NFR-02 | 4 | T-92 |
| T-94 | SEO por idioma en cada página: canonical propio, alternates recíprocos `es-CO`/`en`/`x-default`, sitemap de ocho páginas, títulos/descripciones/OG/Twitter/JSON-LD y alt de OG. Revisar si la imagen OG contiene texto. Mantener noindex/robots de demo y una sola identidad de negocio. **Cierre:** URLs absolutas sin prefijo duplicado, rutas legales inglesas correctas y metadata contrastada contra HTML exportado | FR-28, AC-25, NFR-03 | 4 | T-92 |
| T-95 | Localizar mapa ilustrado e interactivo: SVG por idioma desktop/móvil, etiquetas, alternativas, controles Leaflet y mensajes de todos los estados; conservar geometría común, carga por clic, atribución y salud por vista. Verificar cobertura de fuentes con ambos catálogos; regenerar solo si faltan caracteres y registrar licencia. **Cierre:** SVG ingleses exportados, estados bilingües y ninguna petición nueva a terceros ni carga anticipada | FR-27, AC-27, AC-15 a AC-20, D-16 | 5 | T-92 |
| T-96 | Ampliar controles de artefactos: budget de las ocho páginas y hero en ambas landings, Lighthouse de `/` y `/en`, CSP en todas las páginas y 404. Revisar resolución de rutas del servidor de pruebas, smoke con prefijo, workflow y coherencia de artifacts. **Cierre:** medición por idioma y builds completos, sin debilitar límites ni el audit; el deploy sigue usando el artefacto verificado y Lighthouse en CI informativo | FR-28, AC-29, NFR-01, NFR-04 | 5 | T-94, T-95 |
| T-97 | Pruebas unitarias de módulos nuevos/modificados, según espejo exigido por `estructura.test.ts`: rutas/basePath, paridad, variables, datos comunes, guardas, formatos, componentes, metadata, sitemap y SVG. Actualizar pruebas españolas sin perder sus aserciones. **Cierre:** regresiones negativas reproducibles y todas las FR nuevas en la matriz de `03` §12; no agregar excepciones al espejo sin justificar | FR-25 a FR-28, AC-21 a AC-26 | 6 | T-91, T-93, T-94, T-95 |
| T-98 | E2E y revisión visual bilingüe: ocho páginas con fixtures existentes, axe, teclado y 360 px/escritorio; navegador inglés abre español en `/`, selector/persistencia por URL/query/hash, sin JS, recarga directa, legales/retorno/CTA, 404 y build con prefijo. Mapa: carga por clic, éxito, parcial, error, reintento y navegación; teselas interceptadas, sin OSM real. **Cierre:** sin `pageerror`, violaciones CSP, desbordes ni descargas iniciales de catálogos completos, otras páginas o Leaflet | FR-25 a FR-28, AC-21 a AC-29 | 6 | T-93, T-96, T-97 |
| T-99 | Cierre de implementación: ejecutar `npm run validate` completo y `npm run lighthouse` con cobertura bilingüe; revisión de arquitectura según práctica del proyecto. Registrar comandos/resultados y riesgos, actualizar este estado, `CLAUDE.md`, README, D7 y bitácora con archivos tocados. **Cierre:** criterios AC-21 a AC-29 acreditados o pendientes explícitos; no confundir cierre de la fase con aprobación legal/producción. Commit/push solo si el usuario los solicita | FR-25 a FR-28, AC-21 a AC-29, CLAUDE.md | 2 | T-87 a T-98 |

**Total Fase 12: 64 h efectivas** (estimación orientativa, no compromiso de duración de Claude Code; excluye esperas de revisión editorial/jurídica y ampliaciones por incompatibilidad de T-88). Ruta de dependencia principal: T-87 → T-88 → T-89 → T-90 → T-91 → T-92 → T-93/T-94/T-95 → T-96/T-97 → T-98 → T-99. No delega trabajo en subagentes automáticamente.

### Ejecución posterior por Claude Code

1. Leer primero `CLAUDE.md` y las fuentes en su orden; esta solicitud autoriza preparar el plan, no significa que la implementación ya empezó. Cuando el usuario ordene ejecutar Fase 12, trabajar sobre T-87 a T-99 y conservar los IDs históricos.
2. Confirmar estado real del checkout y volver a leer guías locales de Next antes de usar APIs. D7 contiene la investigación y la tabla de rutas. No instalar `next-intl`, Proxy, backend ni traductor remoto como atajo.
3. Resolver T-88 antes de migrar los catálogos/componentes. Registrar decisiones de implementación y evidencia. No pedir al usuario de nuevo decisiones ya fijadas por su orden de ejecución; escalar únicamente cambios materiales de alcance o una incompatibilidad real.
4. Actualizar bitácora y estado por tarea, con pruebas reales. Las dependencias son obligatorias aunque no se hagan commits intermedios. Los pendientes RP/T-05 permanecen abiertos.
5. Entregar resumen de archivos, validaciones y limitaciones. La implementación local no implica permiso para publicar ni hacer push.

## Fase 13: Remediación de la auditoría forense (2026-10-24)

Origen: auditoría forense integral sobre `10cd67b` (informe y paquete locales en `doc/auditorias/2026-10-24/`, fuera de Git; SHA-256 del informe `6a8c78ff…02cac`, del paquete `f645e8c5…09f32`). Dictamen: demo funcional, lanzamiento comercial no aprobado; 17 hallazgos (F-01 a F-17: 1 alto de lanzamiento, 12 medios, 4 bajos), sin crítico ni alto explotable demostrado. Se añade INC-01 (traducción automática de Chrome sobre `/en/`, reportada por el usuario y diagnosticada como comportamiento del navegador).

**Plan detallado:** `spec/06-plan-remediacion-auditoria-forense.md` (trazabilidad hallazgo → tarea → control, decisiones con opciones, criterio de cierre de cada tarea, riesgos y fuentes). Ese plan no es fuente de verdad: si contradice `05`, la constitución o `CLAUDE.md`, ganan ellos. **El criterio de cierre de cada tarea está en la columna "Cierre" del plan; sin esa evidencia la tarea no se marca hecha.**

Decisiones del usuario (2026-10-24), detalle en el plan §4:
- **DR-01:** tarjetas de producto con consulta de contenedor (se apilan cuando la tarjeta es estrecha); `whitespace-nowrap` solo se relaja en el CTA `sm`.
- **DR-02:** plazo de 15 s para la carga del módulo del mapa, constante compartida con las teselas; id de intento para descartar resoluciones tardías.
- **DR-03:** garantía alineada ya al estado pendiente (T-106) y fuente estructurada única tras RP-04 (T-116).
- **DR-04:** registro de hallazgos versionado con hashes. Sustituida el 2026-10-25: el usuario prescinde del almacenamiento adicional de paquetes y F-08 queda aceptado por su decisión.
- **F-05 (2026-10-25):** titulares de garantía aprobados: «¿Tu pedido llegó con algún problema?» y «Is there a problem with your order?».
- **DR-05:** WebKit y Firefox en Playwright (`@smoke`), proyecto `movil-320` y `@vitest/coverage-v8` solo informativa. **Confirmado por el usuario el 2026-10-25: los smoke de WebKit y Firefox son bloqueantes dentro de `verificar`; su fallo impide publicar la demo.**
- **DR-06:** fuente única de cabeceras de seguridad para Cloudflare y Azure antes de R-08; F-11 cierra solo al verificar el dominio final.
- **DR-07:** Fraunces autoalojada desde `google/fonts` (OFL), recortada con fontTools.
- **DR-08:** Lighthouse con lock propio en `tools/lighthouse/`.
- **DR-09:** refactor del adaptador del mapa diferido (T-119, opcional, después de la Ola 1).
- **DR-10 a DR-12:** runtime (`engines`, `devEngines`, `.nvmrc`), timeouts de CI medidos y `/output/` en `.gitignore`, con la recomendación del plan.
- **DR-13:** `translate="no"` solo en los nombres de idioma del selector; la página sigue siendo traducible.
- Dependencias de desarrollo autorizadas: `@vitest/coverage-v8`, motores WebKit y Firefox de Playwright y `lighthouse` en su lock dedicado. Ninguna de runtime.

| ID | Tarea | Hallazgo / Req. | Est. | Dep. |
|---|---|---|---|---|
| T-100 | Línea base: releer fuentes, confirmar HEAD, `validate` completo fuera del sandbox (aislar el cierre colgado de `test:prefijo` si se repite), `audit:deps` y `lighthouse` con red | E05, E12, E13 | 2 | – |
| T-101 | Registro durable de hallazgos (DR-04): ID `AUD-2026-10-24-FORENSE/F-xx`, hashes, ubicación del original, estado, prueba de cierre y residual | F-08 | 3 | T-100 |
| T-102 | Regresiones e2e rojas antes de corregir (ES/EN): reflow a 320 px con espaciado 1.4.12 y texto al 200 %; import del mapa retenido con `page.clock`; foco dentro/fuera de la región ante error diferido | F-02, F-03, F-04 | 5 | T-100 |
| T-103 | Reflow de tarjetas con consulta de contenedor (DR-01) en `ProductCards.tsx` y `CallButton.tsx` (`sm`) | F-02 | 4 | T-102 |
| T-104 | Foco a "Reintentar" solo si el foco está en la región del mapa o se perdió; si no, solo anuncio `role=status` | F-04 | 2 | T-102 |
| T-105 | Plazo de 15 s desde el inicio de `cargarMapa()` con id de intento (DR-02); lógica pura en `src/lib/` con prueba y en la lista permitida de ESLint | F-03 | 6 | T-102, T-104 |
| T-106 | Alinear la garantía de la FAQ ES/EN con `copy.json` y `legal.json` (pendiente RP-04) y prueba de coherencia | F-05 | 2 | T-100 |
| T-122 | `translate="no"` en los nombres de idioma del selector y aserción e2e (DR-13) | INC-01 | 1 | T-100 |
| T-107 | Canon: `02` sin "Sin hreflang"; `CLAUDE.md` y este archivo sin "sin commit" obsoleto; tabla de estados de entrega con SHA | F-06, F-07 | 1,5 | T-100 |
| T-108 | Matriz QA (DR-05): `movil-320`, `webkit-movil`, `firefox-escritorio` `@smoke`; recorrido de teclado renombrado y por estado del mapa; cobertura informativa; soporte declarado en `01` | F-10 | 8 | T-103, T-105 |
| T-109 | Protocolo de aceptación manual WCAG 2.2 A/AA con NVDA y TalkBack para que lo ejecute el usuario (parte manual de T-38) | F-09 | 3 | T-108 |
| T-110 | Contrato de runtime (DR-10) y `node-version-file` en `pages.yml` | F-14 | 1 | T-100 |
| T-111 | `timeout-minutes` por job y en `test:prefijo` con duración medida (DR-11) | F-15 | 1 | T-110, T-108 |
| T-112 | Fraunces local (DR-07), prueba de cobertura de caracteres, `doc/creditos.md`; build sin red a Google Fonts | F-12 | 5 | T-100 |
| T-113 | Lighthouse con lock dedicado (DR-08), job con `npm ci --prefix` y su audit, Dependabot | F-16 | 4 | T-110 |
| T-114 | `/output/` en `.gitignore` (DR-12), sin borrar nada | Informe §10 | 0,5 | T-100 |
| T-115 | Fuente única de cabeceras (DR-06): generación para Cloudflare y Azure, emisión en el servidor de pruebas, e2e y script de verificación remota | F-11 | 8 | T-100 |
| T-116 | Garantía como dato común estructurado tras RP-04 | F-05 | 4 | T-106, RP-04 |
| T-117 | Expediente de lanzamiento con los pendientes de producción agrupados por RP y listado reproducible desde `pendingMarkers()` | F-01 | 4 | T-101 |
| T-118 | Plan de medición solo documental (R-07 sigue fuera de Fase 1). **Aprobado por el usuario el 2026-10-25** (documento y procedimiento manual; sin analítica) | F-13 | 3 | T-100 |
| T-120 | Evidencia remota de ruleset y ejecuciones con `gh api` de solo lectura. **Ampliada el 2026-10-25 por autorización del usuario:** ruleset de `main` configurado (id 25829447) y verificado como efectivo | B11 | 1 | T-111 |
| T-119 | Refactor del adaptador del mapa sin cambio de comportamiento (opcional, DR-09) | F-17 | 8–16 | T-105, T-108 |
| T-121 | Cierre: `validate`, `lighthouse`, sondas del informe, revisión independiente, registro, bitácora, estado y `CLAUDE.md`. Commit/push solo con orden del usuario | Todos | 3 | T-100 a T-118, T-120, T-122 |

**Total Fase 13: ~72 h efectivas** sin T-119 (80–88 h con T-119). Excluye esperas de terceros (RP-01 a RP-05, R-08) y la sesión humana con lector de pantalla. Ruta crítica: T-100 → T-102 → T-104 → T-105 → T-108 → T-111 → T-121.

### Ejecución por Claude Code

1. Leer `CLAUDE.md` y las fuentes en su orden, después `spec/06-plan-remediacion-auditoria-forense.md`. Ejecutar por olas (plan §5): Ola 0 (T-100, T-101), Ola 1 (T-102 a T-106 y T-122), Ola 2 (T-107), Ola 3 (T-108, T-109), Ola 4 (T-110 a T-114), Ola 5 (T-115 a T-118, T-120) y cierre (T-121).
2. En la Ola 1, la regresión roja de T-102 va antes de cada corrección y se registra su salida fallida.
3. No tocar datos de negocio (`site.json`, marcadores `(FICTICIO)`/`[POR CONFIRMAR]`), no añadir analítica, formularios, WhatsApp ni precios, no borrar archivos y no hacer commit ni push sin orden expresa.
4. Al terminar cada tarea: bitácora, estado en este archivo y fila del registro de hallazgos (T-101).
5. T-116 espera a RP-04; F-09 y F-11 solo cierran con la sesión humana (T-109) y la verificación del dominio final tras R-08.

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
| 12. Español predeterminado e inglés opcional | 64 |
| 13. Remediación de la auditoría forense | 72 (80–88 con T-119) |
| **Total** | **~338 h** |

**Ruta crítica:** T-01 → T-05 → T-42 → T-44, con RP-01 a RP-05 antes de T-42 y T-43. En paralelo: T-09 → componentes → T-33 → T-30/T-37/T-39.
**Hito sugerido:** MVP publicable al completar Fase 2 + T-26, T-27 y T-44. Publicar exige cerrar antes el roadmap de producción: RP-01 (datos reales y dominio), RP-02 (origen y fotos reales) y RP-03 (validación jurídica del precio por teléfono, medios de pago y tiempo de entrega), RP-04 (política de garantía) y RP-05 (procedimiento de PQR), además de decidir hosting (R-08) y CI/CD (R-10). La Fase 1 se construye con datos ficticios.
**Estimaciones:** orientativas, sin considerar tiempo de espera de terceros (revisión jurídica, producción de fotos).

## Estado de avance

Actualizado: 2026-10-25. Detalle de cada tarea en `doc/bitacora.md`.

| Estado | Tareas |
|---|---|
| **Fase 13 (remediación de la auditoría forense)** | Ejecutada el 2026-10-25; integrada en `main` con `b128a67` (PR #7) y desplegada en la demo (ver «Estados de entrega»). **Hechas:** T-100 a T-115, T-117, T-118, T-120, T-122 y T-121 (cierre con `validate`, Lighthouse, sondas y revisión independiente; detalle en la bitácora). **Bloqueada:** T-116 (espera RP-04). **Diferida:** T-119 (DR-09). Hallazgos (`doc/registro-hallazgos.md`): cerrados F-03, F-04, F-06, F-07, F-10, F-12, F-14, F-15, F-16, R-01 e INC-01; condicionados F-02 (revisión visual del usuario) y F-05 (RP-04); aceptado F-08 (decisión del usuario); abiertos F-01, F-09, F-11, F-13 (con su preparación hecha), F-17 (diferido), B11 y el cierre colgado de `test:prefijo` (no reproducido). Revisión independiente de T-121: aprobado con observaciones; N-1 (palabras partidas por `overflow-wrap: anywhere`), N-3, N-4 y N-5 corregidos con prueba roja previa donde aplica; `validate` y Lighthouse repetidos sobre el estado final. **Segundo cierre (2026-10-25):** DR-05 confirmada (smoke de WebKit y Firefox bloqueantes en `verificar`), plan de medición aprobado (F-13 condicionado: medición real no acreditada, analítica en R-07), 404 con `frame-ancestors` por cabecera y proveedor explícito (N-6 b y c), cargador portable (N-6 a), `sizes` verificado (N-5 cerrado) y ruleset de `main` configurado (B11 cerrado); `validate` y Lighthouse repetidos sobre el estado final. Siguen abiertos F-01, F-09, F-11 (dominio), N-6 d y F-17. **El cierre técnico de la remediación no aprueba producción** |
| **Fase 12 (español predeterminado e inglés opcional)** | Completa (2026-10-24): T-87 a T-99. AC-21 a AC-29 acreditados con `validate` y Lighthouse (bitácora). En `main` (`2bf312d`, `10cd67b`) y desplegada en la demo (ver «Estados de entrega»). Pendientes que no cierra: revisión editorial del inglés, revisión jurídica de los legales en los dos idiomas (T-05), idioma de la atención telefónica [POR CONFIRMAR] y prueba manual con lector de pantalla también en inglés (T-38) |
| **Hecha** | T-01; T-07, T-08, T-09, T-10, T-11; T-12 a T-21, T-23, T-24, T-25, T-28, T-33, T-46, T-47; T-26, T-31; T-30, T-37, T-39, T-40, T-49 |
| **Hecha con contenido provisional** | T-04: fotos generadas con IA, se reemplazan en RP-02. T-27: páginas legales en borrador, esperan T-05 |
| **Parcial** | T-38: auditoría automática con axe sin infracciones; falta la prueba manual con lector de pantalla |
| **Pendiente del usuario o de terceros** | T-03 (confirmaciones del proveedor), T-05 (texto legal), T-36 (necesita RP-01), T-32 (necesita R-08; en la demo, conflicto D-11) |
| **Pendiente, Fase 6** | T-42, T-43, T-44, T-45 (necesitan RP-01 a RP-05, R-08 y R-10) |
| **Fase 11 (auditoría de causa raíz)** | Completa (2026-10-24): T-78 a T-86 |
| **Fase 10 (reauditoría de cierre)** | Completa (2026-10-24): T-75 a T-77 |
| **Fase 9 (auditoría independiente)** | Completa (2026-10-24): T-68 a T-74 |
| **Hecha, Fase 8 (auditoría externa)** | T-58 a T-67 (2026-10-24). T-61 quitó 13 descargas sin clic (prefetch). T-66: CSP por `<meta>` con hashes; `frame-ancestors` y las demás cabeceras siguen en T-32. T-67 solo tiene efecto con dominio propio (RP-01) |
| **Hecha, cambio v1.5** | T-50 (specs v1.5); T-51 a T-55 y T-57 (2026-10-19). T-56 hecha en código (atribución y aviso); su revisión jurídica de D-13 sigue pendiente junto con T-05 |

Demo publicada: https://masterarqsoft.github.io/green-banana-web/ (GitHub Pages, datos ficticios, sin indexar).

### Estados de entrega (T-107, F-07)

Cuatro estados distintos: **implementado** (en el working tree), **commit** (en el historial local), **push** (en `origin/main`) y **desplegado** (publicado por `pages.yml` en la demo). Cada fila nombra la evidencia; un estado sin evidencia se marca ND. Desplegar la demo no es publicar en producción (RP-01 a RP-05, R-08).

| Trabajo | Implementado | Commit | Push | Desplegado | Evidencia |
|---|---|---|---|---|---|
| Fase 12 (T-87 a T-99) | 2026-10-24 | `2bf312d` | Sí | Sí | `gh run` 40153585845 (push, `verificar` y `deploy` correctos, 2026-10-25 02:12 UTC) |
| Ajuste del selector (T-93/T-98) | 2026-10-24 | `10cd67b` | Sí (`origin/main` = `10cd67b` según `gh api`, 2026-10-25) | Sí | `gh run` 40154926939 (push, `verificar`, `lighthouse` y `deploy` correctos, 2026-10-25 02:33 UTC); `/en/` responde 200 |
| Fase 13 (T-100 a T-122) | 2026-10-25 | `b128a67` (original `af27959`, PR #7 fusionado con rebase) | Sí | Sí | `gh run` 40221231762 (push, `verificar`, `lighthouse` y `deploy` correctos, 2026-10-25 18:33 UTC); despliegue `github-pages` de `b128a67` (`gh api deployments`) |
| Dependencias (Dependabot: lucide-react 1.61.0) | 2026-10-25 | `9a27d11` | Sí | Sí | `gh run` 40225394271 (push, todo correcto, 19:25 UTC) |
| T-123 (textos de ejemplo en inglés y revisión asistida) | 2026-10-25 | `f3026a5`, fusionado con el merge `64dba55` (PR #9) | Sí | Sí | `gh run` 40228682526 (PR) y 40229133764 (push, `verificar`, `lighthouse` y `deploy` correctos, 20:12 UTC); despliegue `github-pages` de `64dba55`; `/en/` de la demo responde 200 (consulta del 2026-10-25) |
| Límite de 3 min para instalar navegadores en CI | 2026-10-25 | ND | No | No | Cambio local en `.github/workflows/pages.yml`, sintaxis validada con el parser `yaml`; pendiente de commit |
| Corrección visual de F-02 (botón en tarjetas y flotante con texto aumentado) y teclado ES/EN | 2026-10-25 | ND | No | No | Working tree; `validate` con salida 0 tras la corrección; pruebas de teclado nuevas verdes en los cinco proyectos; pendiente de commit y de la aceptación visual del usuario |

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

### Seguimiento T-123 — textos de ejemplo y revisión asistida (2026-10-25)

Implementación local: descripciones ficticias localizadas en origen, pie y páginas legales, sin traducir nombres personalizados ni alterar los datos comunes. 563 unitarias, lint y ambos builds aprobados. 66 casos E2E de idioma/reflow aprobados, con error posterior de teardown (comando completo no aprobado). Ver `doc/bitacora.md` y `spec/02-content-spec.md`.

F-09 permanece abierto: teclado y axe en navegador visible no sustituyen NVDA/TalkBack ni zoom real; límites en `doc/protocolo-accesibilidad.md`. Cambios T-123 sin commit ni despliegue.

**Actualización (2026-10-25):** T-123 quedó integrada en `main` con `f3026a5` y el merge `64dba55` (PR #9) y desplegada en la demo (run 40229133764). Después, revalidación automática local sobre `64dba55`: 174 e2e aprobadas y 13 omitidas en `movil-320` y `escritorio` (no la matriz completa ni `validate`; detalle en la bitácora). F-09 y F-02 siguen igual.

## 11. Roadmap de producción (RP)

Pendientes que deben quedar resueltos antes de publicar en producción. No bloquean la construcción de la Fase 1.

| ID | Tarea | Preguntas | Dep. |
|---|---|---|---|
| RP-01 | Reemplazar datos ficticios por reales en `site.json`: nombre comercial, razón social, NIT, dirección, correo, número de contacto y horario; registrar dominio comprado | Q1, Q6, Q7, Q9 (T-06) | – |
| RP-02 | Reemplazar origen ficticio (finca, asociación, municipio) y las imágenes libres o ficticias por fotos reales de producto, productor y acopio | Q4, Q10 | T-04 |
| RP-03 | Definir y validar con asesor jurídico cómo se informa el precio total por teléfono sin incumplir la Ley 1480. Evaluar también si los medios de pago y el tiempo de entrega deben publicarse en la página [POR CONFIRMAR] | Q14 (T-48), Q18 | T-05 |
| RP-04 | Definir la política de garantía: reposición del producto, devolución del dinero o ambas | Q16 | T-05 |
| RP-05 | Definir el procedimiento de PQR con constancia: correo electrónico o teléfono con número de radicado | Q17 | T-05 |
