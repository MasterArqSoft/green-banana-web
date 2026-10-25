# Spec funcional: Landing Guineo Verde

**Versión:** 1.7 · **Fecha:** 2026-10-24 · **Estado:** Borrador; ampliación bilingüe implementada (Fase 12) · **Alcance vigente:** `05-alcance-y-roadmap.md` v1.7

## Índice
1. Contexto y objetivo
2. Usuarios y escenarios
3. Alcance
4. Estructura de la página (requisitos funcionales)
5. Requisitos de conversión y analítica
6. Requisitos no funcionales
7. Criterios de aceptación
8. Preguntas y decisiones
9. Lista de cumplimiento legal
10. Origen de requisitos (trazabilidad con la investigación)

---

## 1. Contexto y objetivo
**Funcional:** dar a conocer la empresa de venta de guineo verde. Acopio y distribución en Santa Marta (Magdalena), con reparto propio de la empresa. La landing es informativa: no publica precios ni pedidos. El precio se informa por teléfono.
**Hallazgo base:** ninguna página competidora combina precio por kilo y unidad, origen concreto, garantía de frescura y recetas. Esa combinación pasa al roadmap (R-01) y no entra en la Fase 1.

**Objetivo medible (a validar):**

| Métrica | Meta inicial |
|---|---|
| Clics en el número de llamada sobre visitas | [POR CONFIRMAR; requiere analítica, roadmap R-07] |
| Lighthouse móvil | ≥ 90 en las 4 categorías |

## 2. Usuarios y escenarios

| ID | Usuario | Necesidad | Escenario |
|---|---|---|---|
| U1 | Persona natural, tienda, hotel u otro punto de venta | Conocer la empresa, su origen y su cobertura en Santa Marta | Llega a la landing, revisa origen y zona de cobertura, llama para consultar precio |
| U2 | Hogar costeño o con arraigo costeño | Conocer el producto y la empresa | Llega desde redes o búsqueda, lee usos y origen, llama si quiere comprar |
| U3 | Persona atenta a la salud | Información clara sin promesas médicas | Lee beneficios y recetas |

**Historias de usuario (Fase 1)**
- **HU1:** Como visitante quiero saber de dónde viene el guineo y dónde se acopia para confiar en su origen.
- **HU2:** Como visitante quiero llamar a la empresa con un solo toque desde el móvil.
- **HU3:** Como comprador quiero saber si la empresa llega a mi zona dentro de Santa Marta.
- **HU4:** Como visitante quiero conocer la garantía si el producto llega maltratado.
- **HU5:** Como visitante quiero saber cómo usar el guineo verde (usos y recetas).

**Fuera de la Fase 1 (roadmap):** HU de pedido por WhatsApp, precios publicados, pedido en línea, formulario B2B.

## 3. Alcance

**Dentro (fase 1):** landing informativa de una página, contacto por llamada telefónica con número configurable, información de acopio y distribución en Santa Marta, página legal (términos, privacidad, garantía), datos de identidad del vendedor configurables, SEO local. Ampliación A-08: español predeterminado e inglés opcional (Fase 12, implementada el 2026-10-24).
**Fuera (fase 1):** precios publicados, pedido por WhatsApp, formulario B2B o de captura de datos, analítica de eventos, facturación electrónica, carrito, pasarela de pago, cuentas de usuario, blog completo, venta de harina o chips, envíos nacionales, distribución fuera de Santa Marta.
**Roadmap:** R-01 precios, R-02 WhatsApp, R-03 cobertura, R-04 pedido en línea, R-05 harina y chips, R-06 formulario web, R-07 analítica, R-08 decisión de hosting (latencia desde Colombia y límites del plan gratuito), R-09 facturación electrónica, R-10 CI/CD y despliegue en varios entornos. Pendientes de producción: RP-01 a RP-05 (ver `05-alcance-y-roadmap.md`).
**Datos ficticios en Fase 1:** nombre comercial, razón social, NIT, dirección, correo, número de contacto, origen y fotos se cargan con valores ficticios marcados como tales y se editan desde `site.json` y los archivos de contenido.

## 4. Estructura de la página (requisitos funcionales)

| ID | Sección | Requisito | Prioridad |
|---|---|---|---|
| FR-01 | Barra superior | Muestra la empresa, la zona de acopio y el número de llamada. Fija en móvil. | Must |
| FR-02 | Hero | H1 con propuesta de valor y origen; subtítulo con usos; CTA primario "Llamar" con el número configurado; CTA secundario "Ver origen" (ancla). Imagen libre de derechos o propia ficticia. Sin precio. | Must |
| FR-03 | Franja de confianza | Cuatro íconos: acopio en Santa Marta, precio por teléfono, garantía de frescura, selección a mano. | Must |
| FR-04 | Presentaciones | Tarjetas de presentación con nombre, peso aproximado y unidades aproximadas. Sin precio. Botón "Llamar para precio" con el número configurado. | Must |
| FR-05 | "Verde de verdad" | Explica que es para cocinar y no para madurar, vida útil y conservación. | Must |
| FR-06 | Origen y trazabilidad | Finca o asociación, municipio (ficticios hasta confirmar, Q4), imagen del productor, esquema acopio Santa Marta → clientes (hogares y puntos de venta). Fecha de corte del lote vigente. | Must |
| FR-07 | Usos y recetas | Tarjetas con tiempo de cocción: sancocho, cayeye, guineítos, patacón de guineo, chips horneados. | Should |
| FR-08 | Beneficios nutricionales | Texto cauteloso ("fuente de almidón resistente, un tipo de fibra"). Sin promesas médicas. | Could |
| FR-09 | Cómo funciona | Tres pasos: llama, confirma la presentación y la zona, recibe y paga. | Must |
| FR-10 | Cobertura | Acopio y distribución en Santa Marta. Reparto propio de la empresa. El costo de envío se informa por teléfono y por separado del precio del producto. | Must |
| FR-11 | Para negocios | Texto dirigido a tiendas, hoteles y otros puntos de venta, con botón Llamar. Sin formulario. | Must |
| FR-12 | Testimonios | De 3 a 5 testimonios reales con nombre, negocio o barrio y foto. Si no existen aún, la sección **no se publica**. | Should |
| FR-13 | FAQ | Acordeón accesible con las preguntas definidas en `02-content-spec.md`. Con datos estructurados FAQPage (se conservan por su valor semántico; Google dejó de mostrar el resultado enriquecido de FAQ en 2026, así que no se promete esa apariencia en la búsqueda). | Must |
| FR-14 | Garantía | Reclamo en 24 h con foto por llamada o correo, y reposición o devolución. Política definitiva en RP-04; hasta entonces, texto provisional marcado. | Must |
| FR-15 | CTA final | Cierre con el botón de llamada y resumen de la promesa. | Must |
| FR-16 | Pie legal | Razón social, NIT, dirección, teléfono, correo, términos, privacidad, PQR con constancia (procedimiento en RP-05), enlace visible a la SIC. Todos los datos legales son configurables desde `site.json`; en Fase 1 van con valores ficticios marcados como tales. | Must |
| FR-17 | Botón flotante de llamada | Visible en móvil después del hero, sin tapar el contenido ni el pie. | Should |
| FR-18 | Página legal | Términos (incluye exclusión de retracto en perecederos), política de datos, política de garantía. | Must |
| FR-19 | Navegación de retorno | En todas las páginas, la marca de la barra superior lleva al inicio. Las páginas legales muestran además un enlace visible "← Volver al inicio" antes del título, con foco visible y área táctil de 44 px. | Must |
| FR-24 | Mapa de fincas de origen | Sección propia después de "Origen" (FR-06), con fincas ficticias y el acopio de Santa Marta en un mapa de la zona bananera del Magdalena (Zona Bananera, Ciénaga, Aracataca, Fundación). El mapa no se carga hasta que el visitante pulsa "Ver mapa", que aparece junto al aviso de conexión con OpenStreetMap (AC-19). Siempre hay una lista accesible con las mismas fincas. Datos en `fincas.json`; ubicaciones aproximadas [POR CONFIRMAR]. Numerado al final de la sección por ser posterior a la v1.4. | Should |

Ampliación A-08 (Fase 12, implementada el 2026-10-24):

| ID | Sección | Requisito | Prioridad |
|---|---|---|---|
| FR-25 | Idioma predeterminado | Las URL existentes sirven HTML en español de Colombia. `/` abre español incluso con navegador configurado en inglés. | Must |
| FR-26 | Selector y navegación | Selector visible «Español / English», usable con teclado y sin JavaScript, en landing y legales. Cambia a la página equivalente; con mejora JS mínima conserva además parámetros y ancla cuando existan (AC-23). Marca el idioma activo. Marca, pie y retorno mantienen el idioma actual. | Must |
| FR-27 | Contenido bilingüe | Inglés completo en `/en`, `/en/terms`, `/en/privacy`, `/en/guarantee`: secciones, datos descriptivos, FAQ, recetas, legales, avisos, etiquetas accesibles, alternativas de imagen, mapa ilustrado e interactivo y formatos. Mismos datos comerciales, teléfono, IDs, coordenadas y restricciones. | Must |
| FR-28 | HTML y descubrimiento por idioma | Idioma correcto desde HTML inicial, metadatos y datos estructurados localizados, canonical propio, alternates recíprocos y sitemap de ocho páginas; exportación estática con y sin `basePath`. Demo noindex en ambos idiomas. 404 global accesible según AC-28. | Must |

### 4.1 Comportamiento del enlace de llamada
- URL con formato `tel:+<número>`, leído desde `site.json`.
- Número de Fase 1: ficticio `+57 300 000 0000` marcado como `(FICTICIO)`. El real se configura en `site.json` (RP-01).
- El número se configura en un solo archivo de datos (no en componentes).

### 4.2 Formulario B2B
**Fuera de la Fase 1** (roadmap R-06). Se retoma solo con consentimiento de datos (Ley 1581) y decisión de canal.

## 5. Requisitos de conversión y analítica

**Fuera de la Fase 1 (roadmap R-07).** La analítica no se implementa ni se verifica en esta fase. Los requisitos se conservan como referencia para R-07.

| ID | Requisito | Estado |
|---|---|---|
| FR-20 | Eventos: `view_hero`, `click_call` (con `source`), `view_presentations`, `view_origin`, `scroll_75`, `open_faq`. | Roadmap R-07 |
| FR-21 | Parámetros UTM se conservan para medir el origen de visitas. No se envían al contacto. | Roadmap R-07 |
| FR-22 | Consentimiento de cookies si se usan cookies de analítica o publicidad. Preferir analítica sin cookies. | Roadmap R-07 |
| FR-23 | Variantes A/B del H1 y del CTA se pueden activar por configuración. | Roadmap R-07 |

## 6. Requisitos no funcionales

| ID | Requisito | Meta |
|---|---|---|
| NFR-01 | Rendimiento | LCP ≤ 2,5 s, CLS ≤ 0,1, INP ≤ 200 ms (móvil 4G, p75 de usuarios reales: se mide en campo al lanzar). En laboratorio, `npm run lighthouse` (mediana de 3 corridas, móvil simulado) bloquea con LCP > 3,4 s, CLS > 0,1 o TBT > 200 ms (T-75 y T-76, 2026-10-24). Los métodos de throttling simulado y DevTools dan valores distintos y ninguno es el dato de campo: el presupuesto se mide con el simulado y `LH_THROTTLING=devtools` sirve de diagnóstico, siempre comparando con el mismo método y el mismo elemento LCP (T-80) |
| NFR-02 | Accesibilidad | WCAG 2.2 AA |
| NFR-03 | SEO | Título, descripción, Open Graph, datos estructurados (LocalBusiness, FAQPage), `sitemap.xml`, `robots.txt` |
| NFR-04 | Seguridad | HTTPS, HSTS, CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`; sin secretos en el cliente. `Referrer-Policy` no puede ser `no-referrer` (OSM lo prohíbe para el mapa, FR-24); el valor recomendado es `strict-origin-when-cross-origin` |
| NFR-05 | Compatibilidad | Últimas dos versiones de Chrome, Safari, Firefox y Edge; Android 10+ e iOS 15+. Anchos de 320 a 1440 px. **Matriz probada en cada `validate` (T-108, DR-05):** Chromium completo a 360 y 1280 px; Chromium a 320 px para reflow (con espaciado WCAG 1.4.12 y fuente al 200 %), controles con foco no tapados, composición, axe y teclado; WebKit (perfil iPhone 13) y Firefox de escritorio con el subconjunto `@smoke` (8 páginas sin violaciones de CSP, enlaces `tel:`, selector de idioma y mapa por clic en ES y EN). Los motores de Playwright aproximan Safari y Firefox; no sustituyen dispositivos reales ni Edge, que se cubre como Chromium. Lo no probado automáticamente se revisa en el protocolo manual de T-109 |
| NFR-06 | Disponibilidad | ≥ 99,9 % (hosting estático con CDN) |
| NFR-07 | Mantenibilidad | Contenido y datos de contacto en archivos de datos; cambiar el número no requiere tocar componentes |
| NFR-08 | Imágenes | AVIF o WebP con respaldo, `srcset`, carga diferida fuera del primer viewport. Solo imágenes libres de derechos o propias |
| NFR-09 | Privacidad | Sin formularios en Fase 1; sin datos personales en analítica; aviso conforme a Ley 1581 |

## 7. Criterios de aceptación (muestra verificable)

| ID | Criterio | Verifica |
|---|---|---|
| AC-01 | Dado un visitante móvil, cuando llega a la página, entonces ve H1 y botón "Llamar" sin hacer scroll | FR-02 |
| AC-02 | La página no muestra ningún precio de producto | FR-02, FR-04, alcance F-01 |
| AC-03 | Al tocar el botón de llamada se abre el marcador con el número de `site.json` | FR-02, FR-04, 4.1 |
| AC-04 | Si se informa el costo de envío en la página, aparece separado del producto | FR-10, Ley 1480 |
| AC-05 | El pie incluye razón social, NIT, dirección, PQR y enlace a la SIC | FR-16 |
| AC-06 | Los términos informan que el retracto no aplica a perecederos | FR-18 |
| AC-07 | No existe ningún contador, cupo ni cifra de escasez sin respaldo | P1 |
| AC-08 | Lighthouse móvil ≥ 90 en las cuatro categorías | NFR-01 a 03 |
| AC-09 | Navegación completa por teclado y lector de pantalla en el menú, el acordeón y los botones de llamada | NFR-02 |
| AC-10 | La página no envía eventos ni datos a herramientas de analítica en Fase 1 | FR-20, roadmap R-07 |
| AC-11 | Si no hay testimonios reales, la sección FR-12 no se renderiza | FR-12 |
| AC-12 | Ninguna página envía datos personales a terceros ni a analítica, salvo la conexión a OpenStreetMap que el visitante inicia al pulsar "Ver mapa" (AC-19) | NFR-09, FR-24, D-13 |
| AC-13 | Ninguna imagen usada tiene derechos de autor sin licencia verificada | NFR-08, Q10 |
| AC-14 | Desde cualquier página legal se llega al inicio con un enlace visible y con foco; la marca de la barra superior también lleva al inicio | FR-19 |
| AC-15 | Leaflet y las teselas no se descargan hasta pulsar "Ver mapa". En la carga inicial, la página se mantiene dentro de 300 KB (gzip) | FR-24, NFR-01 |
| AC-16 | La lista de fincas muestra el mismo nombre y municipio que el mapa, y funciona sin JavaScript. No muestra coordenadas (enmienda del 2026-10-19: no aportan al visitante, aparentan una precisión que no tienen y, con fincas reales, exponen la ubicación del productor) | FR-24, NFR-02 |
| AC-17 | Cambiar una finca o el centro del mapa se hace solo en `fincas.json`. Una finca con "(FICTICIO)" bloquea el build de producción | NFR-07, P9 |
| AC-18 | El mapa muestra "© OpenStreetMap contributors" visible, sin esconderlo tras un control | FR-24, política de teselas de OSM |
| AC-19 | Antes de cargar el mapa se muestra un aviso: el navegador se conectará a OpenStreetMap, que recibe la dirección IP, con enlace a su política de privacidad. El botón "Ver mapa" es la acción de consentimiento | FR-24, D-13, Ley 1581 |
| AC-20 | El mapa no precarga teselas fuera de la vista y respeta las cabeceras de caché del servidor | FR-24, política de teselas de OSM |

Criterios de cierre de la Fase 12 (acreditados el 2026-10-24; evidencia en `doc/bitacora.md`):

| ID | Criterio | Verifica |
|---|---|---|
| AC-21 | Con contexto nuevo y `Accept-Language: en`, `/` y las tres legales existentes muestran español desde el HTML inicial; no redirigen a inglés | FR-25 |
| AC-22 | Las cuatro rutas inglesas se abren y recargan directamente; el HTML inicial tiene `lang="en"`, contenido y metadatos ingleses. Español conserva `lang="es-CO"`. Sin parpadeo de traducción ni errores de hidratación | FR-27, FR-28 |
| AC-23 | Selector en las ocho páginas, sin banderas como único identificador; funciona sin JS, con teclado, foco visible y área táctil de 44 px. Sin JS cambia a la página equivalente; con JS conserva además query/hash mediante mejora mínima. El idioma activo es identificable. Marca y retorno no abandonan el idioma | FR-26, NFR-02 |
| AC-24 | Build falla si falta una traducción, difieren IDs/claves o marcadores de plantilla, hay una afirmación prohibida en cualquier idioma o se intenta producción con ficticios. Pruebas negativas aisladas de cada causa. No hay fallback silencioso de inglés a español | FR-27, P1, P3, P9 |
| AC-25 | Cada página tiene canonical propio, alternates `es-CO`, `en` y `x-default` hacia la pareja española; las ocho entradas del sitemap coinciden. Títulos, descripciones, OG, Twitter y JSON-LD usan el idioma y la URL correctos. Demo sigue noindex | FR-28, NFR-03 |
| AC-26 | Inglés no cambia cobertura, teléfonos `tel:`, identidad, pesos, coordenadas ni condiciones del negocio. Avisos de ficticio/borrador siguen visibles y detectables. Listas, decimales y fechas se formatean según idioma; fechas ISO sin desplazamiento de día | FR-27 |
| AC-27 | Ambos idiomas pasan axe WCAG 2.2 AA y revisión visual a 360 px y escritorio, sin desbordes ni pérdida de CTA. Mapa en inglés conserva carga por clic, atribución y estados de salud/reintento; ninguna conexión adicional a terceros | FR-26, FR-27, NFR-02, AC-12, AC-15 a AC-20 |
| AC-28 | Una URL inexistente devuelve 404 real, también `/en/no-existe`. GitHub Pages solo garantiza una 404 global estática: español principal con ayuda en inglés marcada `lang="en"` y enlaces a ambos inicios. No se promete inferir el idioma del path desconocido. Noindex, `<main>`, salto al contenido y CSP conservados | FR-28 |
| AC-29 | `validate` completo pasa para ocho páginas y 404 con y sin prefijo. Presupuesto ≤ 300 KB por página, hero ≤ 120 KB y Lighthouse local sobre ambas landings con umbrales existentes; ningún catálogo completo en el JS cliente ni prefetch nuevo. CI mantiene artefacto único verificado y Lighthouse informativo | FR-28, NFR-01, NFR-04 |

## 8. Preguntas y decisiones

| # | Pregunta | Estado | Impacta |
|---|---|---|---|
| Q1 | ¿Nombre comercial y logotipo? | Ficticio configurable en `site.json`. Definitivo en RP-01 | Diseño, FR-01, FR-16 |
| Q2 | ¿Municipios o puntos de venta de distribución? | **Resuelto:** solo Santa Marta en Fase 1 | FR-10 |
| Q3 | ¿Precio por kilo y por presentación? | Movido a roadmap R-01 | Roadmap |
| Q4 | ¿Origen real: finca, asociación y municipio? | Ficticio configurable. Definitivo en RP-02. No indicar "Urabá" ni "Zona Bananera" hasta confirmarlo | FR-06, FR-02, SEO |
| Q5 | ¿Quién lleva el producto del acopio a cada punto de venta? | **Resuelto:** reparto propio de la empresa | FR-10 |
| Q6 | Razón social, NIT, dirección y correo | Ficticio configurable en `site.json`. Definitivo en RP-01 | FR-16, FR-18 |
| Q7 | Número de contacto y horario | Ficticio configurable en `site.json`. Definitivo en RP-01 | FR-01, FR-02, 4.1 |
| Q8 | ¿Se factura electrónicamente? | Movido a roadmap R-09 | Roadmap |
| Q9 | ¿Dominio comprado? | Requisito de RP-01 antes de producción | Despliegue, T-43 |
| Q10 | ¿Fotos reales de producto, productores y acopio? | Imágenes libres de derechos o propias ficticias hasta tener fotos reales (RP-02) | FR-02, FR-06 |
| Q11 | ¿Pedido mínimo y umbral de envío? | Movido a roadmap R-01 | Roadmap |
| Q12 | ¿Harina o chips en alguna fase? | Fuera de Fase 1; roadmap R-05 | Alcance, INVIMA |
| Q13 | ¿Público objetivo de la Fase 1? | **Resuelto:** personas naturales, tiendas, hoteles y otros puntos de venta | Copy, FR-11, PQR, tratamiento de datos |
| Q14 | ¿Cómo informar el precio total por teléfono sin incumplir la Ley 1480? | Se define en RP-03, antes de producción. Revisión de asesor jurídico (D-01) | FR-02, FR-04 |
| Q15 | ¿El reparto llega a personas naturales, a puntos de venta o a ambos? | **Resuelto:** a ambos | FR-06, FR-10, copy |
| Q16 | ¿Política de garantía: reposición, devolución del dinero o ambas? | Pendiente. Se define en RP-04, antes de producción | FR-14 |
| Q17 | ¿Cómo se radica una PQR con constancia sin formulario: correo o teléfono con número de radicado? | Pendiente. Se define en RP-05, antes de producción | FR-16 |
| Q18 | ¿Medios de pago y tiempo de entrega se publican en la página o se informan por teléfono? | Pendiente. Se evalúa en RP-03 (Ley 1480) | FR-09, FR-10 |

## 9. Lista de cumplimiento legal (a validar con asesor jurídico)

| Ítem | Fuente indicada en el informe | Cubierto por |
|---|---|---|
| Identidad del vendedor (razón social, NIT, dirección, teléfono, correo) | Ley 1480, art. 50 | FR-16 |
| Precio total con impuestos y envío por separado (precio informado por teléfono) | Ley 1480, art. 50 | FR-04, FR-10, Q14 (RP-03) |
| Medios de pago, tiempo de entrega | Ley 1480, art. 50 | FR-09, FR-10; si se publican, se decide en RP-03 (Q18) |
| Peso, origen y usos del producto en la publicación | Ley 1480, art. 50, modificado por Ley 2439 de 2024 | FR-04, FR-06, FR-07 |
| Mecanismo de PQR con constancia | Ley 1480, art. 50 | FR-16; procedimiento en RP-05 (Q17) |
| Enlace visible a la SIC | Ley 1480, art. 50 | FR-16 |
| Exclusión de retracto en perecederos informada de forma expresa | Ley 1480, art. 47 | FR-18 |
| Garantía de calidad e idoneidad | Ley 1480 | FR-14; política en RP-04 (Q16) |
| Tratamiento de datos personales | Ley 1581 de 2012 | FR-18, NFR-09 |
| Sin afirmaciones de salud sin respaldo | Res. 810 de 2021 | FR-08 |
| Transporte de alimentos (canastillas, sin contacto con el piso, leyenda "Transporte de Alimentos") | Res. 2674 de 2013, art. 29 | Proceso operativo, no la web |
| Facturación electrónica (no aplica en Fase 1) | Roadmap R-09 | Q8 |

> Nota: las referencias normativas provienen del informe de investigación. Deben ser confirmadas por un asesor jurídico antes del lanzamiento.

## 10. Origen de requisitos (hallazgos → requisitos)

| Hallazgo del informe | Requisito |
|---|---|
| Rappi y Solofruver resuelven la duda de cantidad con unidades aproximadas | FR-04 (precio en roadmap R-01) |
| Solofruver: garantía de 24 h con foto y reposición | FR-14 |
| Fruver Home: hero y franja de confianza limpios | FR-01, FR-03 |
| Latido: origen por municipio, "cómo funciona" | FR-06, FR-09 |
| Basket La Canasta: usos y consejo para pelar | FR-07 |
| Amazon: aclarar que es para cocinar y no para madurar | FR-05 |
| Ninguna página nombra Urabá ni Zona Bananera | FR-06 (ficticio hasta Q4) |
| Solicitud del usuario: español predeterminado e inglés opcional (2026-10-24); plan local para implementación posterior por Claude Code | FR-25, FR-26, FR-27, FR-28 (A-08) |
| Prueba social vacía o inflada en todas | FR-12, P1 |
| Servientrega, Coordinadora y Envía no transportan perecederos | FR-10, Restricciones |
