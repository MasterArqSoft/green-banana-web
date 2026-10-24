# 05 · Alcance Fase 1 y roadmap: Landing Guineo Verde

**Versión:** 1.5 · **Fecha:** 2026-10-19 · **Estado:** vigente

Fuente de verdad del alcance. Si un spec contradice este documento, gana este documento y el spec se corrige (ver `00-constitution.md` §5).

## 1. Modelo operativo de la Fase 1

- **Naturaleza:** landing informativa que da a conocer la empresa de venta de guineo verde. No publica precios ni pedidos.
- **Propósito:** dar a conocer el negocio, aumentar su visibilidad y apoyar las acciones de marketing.
- **Etapa:** la Fase 1 es una prueba de concepto (POC) y un producto mínimo viable (MVP): una demostración funcional con datos ficticios que se mejora y amplía de forma progresiva.
- **Acopio:** Santa Marta (Magdalena). Ahí llega el guineo verde, se almacena y se distribuye según la demanda.
- **Distribución:** solo en Santa Marta, con reparto propio de la empresa, a personas naturales y a puntos de venta.
- **Público objetivo:** personas naturales, tiendas, hoteles y otros puntos de venta.
- **Precio:** se informa por teléfono. No aparece en la landing.
- **Contacto:** llamada telefónica con número configurable en `site.json`.
- **Datos ficticios en Fase 1:** nombre comercial, razón social, NIT, dirección, correo, número de contacto, origen, fotos, fincas del mapa y sus coordenadas. Se reemplazan en el roadmap de producción (RP-01 y RP-02).

## 2. Dentro del alcance de la Fase 1

| ID | Elemento | Notas |
|---|---|---|
| A-01 | Landing informativa | Empresa, propuesta de valor, garantía de frescura, recetas. Sin precios. |
| A-02 | Cobertura | Acopio y distribución en Santa Marta. |
| A-03 | Información legal | Identidad del vendedor, PQR, enlace SIC, exclusión de retracto para perecederos, aviso de privacidad (Ley 1581). Datos configurables con valores ficticios. |
| A-04 | Contacto | Botón de llamada con número de `site.json`. Ficticio hasta RP-01. |
| A-05 | No funcionales | Mobile-first, LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms (p75 de usuarios reales, medido en campo), peso ≤ 300 KB, WCAG 2.2 AA, OWASP ASVS nivel 1. En laboratorio, `npm run lighthouse` (mediana de 3 corridas) bloquea con LCP > 3,4 s, CLS > 0,1 o TBT > 200 ms: guarda contra regresiones fijada en lo logrado con margen (decisiones del usuario del 2026-10-24, T-75 y T-76). |
| A-06 | Imágenes | Solo libres de derechos de autor o propias ficticias, hasta RP-02. |
| A-07 | Navegación de retorno y mapa de fincas de origen | Enlace de la marca y "Volver al inicio" en las páginas legales (FR-19). Mapa de fincas ficticias de la zona bananera del Magdalena, cargado solo al pulsar "Ver mapa" con aviso previo (FR-24, D-13). |

## 3. Fuera del alcance de la Fase 1

| ID | Elemento | Destino |
|---|---|---|
| F-01 | Precios por kilo y por unidad en la landing | R-01 |
| F-02 | Pedido por WhatsApp | R-02 |
| F-03 | Carrito, pasarela de pago y pedidos en línea | R-04 |
| F-04 | Harina y chips de guineo | R-05 |
| F-05 | Distribución fuera de Santa Marta | R-03 |
| F-06 | Formulario de pedido o captura de datos en la web | R-06 |
| F-07 | Analítica de eventos | R-07 |
| F-08 | Validación de latencia y límites del hosting | R-08 |
| F-09 | Facturación electrónica | R-09 |

## 4. Decisiones tomadas

| Pregunta | Decisión |
|---|---|
| Q2 Distribución | Solo Santa Marta en la primera fase |
| Q5 Reparto | Reparto propio de la empresa |
| Q13 Público objetivo | Personas naturales, tiendas, hoteles y otros puntos de venta |
| Canal de contacto | Llamada telefónica |
| Precio | Se informa por teléfono, no se publica en la landing |
| Framework | Next.js (exportación estática) + React + TypeScript |
| Q15 Destinatarios del reparto | Personas naturales y puntos de venta |
| Demostración del POC/MVP | Publicación pública en GitHub Pages (https://masterarqsoft.github.io/green-banana-web/) con datos ficticios, desplegada por GitHub Actions en cada push a `main`. Conflicto abierto: D-11 |
| Repositorio | GitHub, público (cuenta MasterArqSoft, `green-banana-web`), desde T-07 |
| Mapa de fincas (FR-24) | Leaflet con teselas de OpenStreetMap, carga solo al pulsar "Ver mapa", con aviso. Aprobado el 2026-10-19 (D-13); revisión jurídica pendiente. Plan B: mapa estático sin terceros. Si falla la descarga de Leaflet, no carga ninguna tesela o no hay respuesta en 15 s, vuelve al mapa ilustrado con "Reintentar" (T-69). Un fallo parcial de teselas deja huecos sin aviso: aceptado por el usuario el 2026-10-24 (H-03), porque la lista de fincas siempre está visible |
| Proveedor de CI/CD (R-10) | GitHub Actions, por la regla "repositorio y pipeline en el mismo proveedor". Se configura cuando haya varios entornos |

## 5. Riesgos y pendientes

| # | Riesgo / pendiente | Acción |
|---|---|---|
| D-01 | Ley 1480 exige precio total cuando hay oferta. El precio se da por teléfono | RP-03, antes de producción |
| D-02 | Número de contacto ficticio | RP-01. El build de producción no debe salir con el número ficticio |
| D-03 | Origen ficticio | No mencionar origen real hasta RP-02 |
| D-04 | Imágenes sin licencia verificada | Solo imágenes libres o propias hasta RP-02 |
| D-05 | Precios de referencia SIPSA y Corabastos son de Bogotá | Se necesita referencia de Santa Marta para R-01 |
| D-06 | Política de garantía sin definir (reposición, devolución del dinero o ambas) | RP-04, antes de producción |
| D-07 | Procedimiento de PQR con constancia sin definir (correo o teléfono con número de radicado) | RP-05, antes de producción |
| D-08 | Ley 1480 pide medios de pago y tiempo de entrega en la publicación; el copy dice que se informan por teléfono | Evaluar dentro de RP-03 [POR CONFIRMAR] |
| D-09 | La demo pública en GitHub no encaja con las opciones de hosting de R-08 (Azure Static Web Apps o Cloudflare Pages) | **Resuelto (2026-10-18):** GitHub Pages solo para la demo del POC/MVP. El hosting de producción sigue en R-08 |
| D-10 | Publicar el repositorio en GitHub adelanta R-10 | **Resuelto (2026-10-18):** repositorio público en GitHub desde T-07; CI/CD con GitHub Actions |
| D-12 | `npm audit` completo: 5 vulnerabilidades altas de `braces` (GHSA-vfj7-8cjw-p6xm) en dependencias de desarrollo, vía `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces` 3.0.3. No hay versión corregida | **Resuelto (2026-10-18, T-49):** el usuario no aceptó el riesgo; se reemplazó `eslint-config-next` por una configuración propia sin `@next/eslint-plugin-next`. `npm audit` completo: 0 vulnerabilidades; `validate` usa la auditoría completa |
| D-11 | Demo pública con datos ficticios: el build de producción falla con `phoneIsPlaceholder: true` (hace falta un modo demo), el número y los datos legales ficticios quedan visibles, y GitHub Pages no permite cabeceras propias (CSP, NFR-04) | **Parcialmente resuelto (2026-10-18):** el bloqueo solo actúa con `SITE_ENV=production`, que define únicamente la pipeline de producción; fuera de producción se muestra una franja de aviso de datos ficticios (`demoNotice`). **Mitigado en parte (2026-10-24, T-62 y T-66):** la CSP (con hashes de los scripts en línea) y `Referrer-Policy` van por `<meta>`. Sigue abierto lo que solo puede ir por cabecera: `frame-ancestors`, HSTS, `X-Content-Type-Options` y `Permissions-Policy` (T-32, con el hosting de R-08) |
| D-13 | El mapa de fincas (Leaflet con teselas de OpenStreetMap) envía la dirección IP del visitante a OpenStreetMap Foundation al cargarse. OSMF registra esa IP y la usa para estimar la ubicación del visitante. Choca con AC-12 y NFR-09 en la versión 1.4 | **Aprobado por el usuario (2026-10-19):** carga solo tras la acción del visitante ("Ver mapa") con aviso previo (AC-19), y AC-12 enmendado en la 1.5. Pendiente: revisión jurídica dentro de T-56 y T-05. Si el asesor la rechaza, se usa el plan B: mapa estático sin terceros (`03-plan.md` D6) |
| D-14 | `npm audit` bloquea la publicación desde T-72 (H-08, decisión del usuario del 2026-10-24): una vulnerabilidad alta o crítica, en producción o desarrollo, frena `verificar` aunque no venga del cambio en curso. `npm audit` no permite ignorar avisos concretos | **Política de excepciones:** 1) actualizar la dependencia o forzar una versión corregida del paquete transitivo con `overrides` en `package.json`; 2) si no hay versión corregida, evaluar si el código vulnerable llega a ejecutarse (en build o en el navegador) y quitar la dependencia si es posible; 3) solo si nada de eso es viable, registrar aquí una excepción con el aviso (GHSA), la justificación y una fecha de revisión, y la decide el usuario. Si `npm audit` falla por una caída del servicio, se vuelve a correr el job |

## 6. Roadmap

| ID | Hito | Prerrequisito | Estado |
|---|---|---|---|
| R-01 | Precios por kilo y unidad, con precio total y envío separado | Referencia de Santa Marta (D-05) y RP-03 | Pendiente |
| R-02 | Pedido por WhatsApp como flujo principal | Cuenta WhatsApp Business | Pendiente |
| R-03 | Distribución fuera de Santa Marta | Capacidad de reparto validada | Pendiente |
| R-04 | Carrito, pasarela de pago y pedidos en línea | Operación de pedidos estable | Pendiente |
| R-05 | Harina y chips | Registro INVIMA | Pendiente |
| R-06 | Formulario de pedido o contacto en la web | Consentimiento (Ley 1581) y decisión de canal | Pendiente |
| R-07 | Analítica sin cookies (Plausible o Umami) | Decisión de herramienta | Pendiente |
| R-08 | Decidir hosting (Azure Static Web Apps o Cloudflare Pages) con medición de latencia desde Colombia y límites del plan gratuito | Medición en preproducción; decisión antes del primer despliegue | Pendiente |
| R-09 | Facturación electrónica | Proveedor | Pendiente |
| R-10 | CI/CD y despliegue en varios entornos | Proveedor decidido: GitHub Actions (mismo proveedor que el repositorio). Falta configurar la pipeline y los entornos | Pendiente |

## 7. Roadmap de producción (antes de publicar)

| ID | Tarea | Preguntas | Estado |
|---|---|---|---|
| RP-01 | Reemplazar datos ficticios por reales en `site.json`: nombre comercial, razón social, NIT, dirección, correo, número de contacto y horario. Registrar y configurar dominio, y actualizar `url` en `site.json` (canónica, sitemap y Open Graph) | Q1, Q6, Q7, Q9 | Pendiente |
| RP-02 | Reemplazar origen ficticio (finca, asociación, municipio) y las imágenes por fotos reales de producto, productor y acopio. Las fincas reales del mapa (FR-24) solo se publican con autorización escrita de cada productor y coordenadas verificadas | Q4, Q10 | Pendiente |
| RP-03 | Definir y validar con asesor jurídico cómo se informa el precio total por teléfono (Ley 1480). Evaluar también si los medios de pago y el tiempo de entrega deben publicarse en la página [POR CONFIRMAR] | Q14, Q18 | Pendiente |
| RP-04 | Definir la política de garantía: reposición del producto, devolución del dinero o ambas | Q16 | Pendiente |
| RP-05 | Definir el procedimiento de PQR con constancia: correo electrónico o teléfono con número de radicado | Q17 | Pendiente |

## 8. Trazabilidad con los specs

| Documento | Versión | Ubicación |
|---|---|---|
| `00-constitution.md` | 1.4 | `spec/` |
| `01-spec.md` | 1.5 | `spec/` |
| `02-content-spec.md` | 1.5 | `spec/` |
| `03-plan.md` | 1.5 | `spec/` |
| `04-tasks.md` | 1.5 | `spec/` |
| `05-alcance-y-roadmap.md` | 1.5 | `spec/` |
| Versión original (respaldo) | 1.0 | `spec/_v1.0/` |

**Cambios de la versión 1.5 (2026-10-19):**
- Navegación de retorno (FR-19) y mapa de fincas de origen (FR-24, A-07).
- AC-12 enmendado: la única conexión a terceros es la del mapa, iniciada por el visitante (AC-19). Nuevos AC-14 a AC-20.
- D-13: IP del visitante hacia OpenStreetMap, pendiente de revisión jurídica.
- `03-plan.md`: decisión D6 (mapa) y modelo de `fincas.json`. `04-tasks.md`: Fase 7 (T-50 a T-57).

**Cambios de la versión 1.4 (2026-10-18):**
- Alcance alineado: POC/MVP y reparto a personas naturales y puntos de venta (Q15).
- Nuevas RP-04 (garantía) y RP-05 (PQR); RP-03 ampliada con medios de pago y tiempo de entrega.
- Preguntas Q15 a Q18 y riesgos D-06 a D-12.
- Decisiones: demo en GitHub Pages, repositorio en GitHub y CI/CD con GitHub Actions.
- `04-tasks.md`: sección de estado de avance y nueva T-49.
- Ajustes técnicos en el plan: copy en `copy.json`, acordeón nativo, `srcset`, SEO y presupuesto medido con gzip.

El detalle de cada cambio está en `doc/bitacora.md`.
