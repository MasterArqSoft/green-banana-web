# Spec funcional: Landing Guineo Verde

**Versión:** 1.0 · **Fecha:** 2026-10-18 · **Estado:** Borrador

## Índice
1. Contexto y objetivo
2. Usuarios y escenarios
3. Alcance
4. Estructura de la página (requisitos funcionales)
5. Requisitos de conversión y analítica
6. Requisitos no funcionales
7. Criterios de aceptación
8. Preguntas abiertas
9. Lista de cumplimiento legal
10. Origen de requisitos (trazabilidad con la investigación)

---

## 1. Contexto y objetivo
**Funcional:** vender guineo verde a hogares y a negocios (restaurantes, fondas) con pedido por WhatsApp.
**Hallazgo base:** ninguna página competidora combina precio por kilo y unidad, origen concreto, garantía de frescura y recetas.

**Objetivo medible (a validar):**

| Métrica | Meta inicial |
|---|---|
| Tasa de clic al CTA de WhatsApp sobre visitas | ≥ 8 % [POR CONFIRMAR] |
| Solicitudes de cotización B2B por mes | ≥ 5 [POR CONFIRMAR] |
| Lighthouse móvil | ≥ 90 en las 4 categorías |

## 2. Usuarios y escenarios

| ID | Usuario | Necesidad | Escenario |
|---|---|---|---|
| U1 | Hogar costeño o con arraigo costeño | Guineo firme para sancocho, cayeye, patacón | Entra desde WhatsApp o redes, ve precio por kilo, elige presentación, pide por WhatsApp |
| U2 | Dueño de restaurante o fonda | Volumen, factura y frecuencia | Ve la caja de 18–20 kg, llena el formulario de cotización |
| U3 | Persona atenta a la salud | Información clara sin promesas médicas | Lee beneficios y recetas, pide |

**Historias de usuario**
- **HU1:** Como cliente de hogar quiero ver cuántas unidades trae un kilo para decidir cuánto pedir.
- **HU2:** Como cliente quiero saber de dónde viene el guineo y cuándo se cortó para confiar en su frescura.
- **HU3:** Como cliente quiero pedir por WhatsApp con el mensaje ya armado para no escribir todo.
- **HU4:** Como cliente quiero conocer la garantía si llega maltratado.
- **HU5:** Como dueño de negocio quiero pedir una cotización por caja con factura electrónica.
- **HU6:** Como cliente quiero saber si llegan a mi zona y cuándo.

## 3. Alcance

**Dentro (fase 1):** landing de una página, pedido por WhatsApp, formulario B2B, página legal (términos, privacidad, garantía), analítica de eventos, SEO local.
**Fuera (fase 1):** carrito, pasarela de pago, cuentas de usuario, blog completo, venta de harina o chips, envíos nacionales.
**Fase 2 (candidato):** pedido en línea con pasarela, blog de recetas, reseñas verificadas en Google.

## 4. Estructura de la página (requisitos funcionales)

| ID | Sección | Requisito | Prioridad |
|---|---|---|---|
| FR-01 | Barra superior | Muestra zonas de entrega, corte horario ("pide antes de las X, recibe mañana"), pedido mínimo y botón de WhatsApp. Fija en móvil. | Must |
| FR-02 | Hero | H1 con propuesta de valor y origen; subtítulo con usos; precio "desde $X/kg"; CTA primario "Pedir por WhatsApp"; CTA secundario "Ver presentaciones" (ancla). Foto real. | Must |
| FR-03 | Franja de confianza | Cuatro íconos: entrega en 24 h, pago contra entrega, garantía de frescura, selección a mano. | Must |
| FR-04 | Presentaciones y precios | Tarjetas: unidad, kilo, bolsa familiar de 3 kg, caja de 18–20 kg. Cada una muestra precio por kg, peso aproximado y unidades aproximadas. Botón por tarjeta que abre WhatsApp con el mensaje de esa presentación. | Must |
| FR-05 | "Verde de verdad" | Explica que es para cocinar y no para madurar, vida útil y conservación. | Must |
| FR-06 | Origen y trazabilidad | Finca o asociación, municipio, foto del productor, fecha de corte del lote vigente, esquema finca → acopio → cliente. | Must |
| FR-07 | Usos y recetas | Tarjetas con tiempo de cocción: sancocho, cayeye, guineítos, patacón de guineo, chips horneados. | Should |
| FR-08 | Beneficios nutricionales | Texto cauteloso ("fuente de almidón resistente, un tipo de fibra"). Sin promesas médicas. | Could |
| FR-09 | Cómo funciona | Tres pasos: elige, confirma por WhatsApp, recibe y paga. | Must |
| FR-10 | Cobertura | Lista de zonas y horarios de entrega, costo de envío visible y por separado. | Must |
| FR-11 | Para negocios | Precio por caja, frecuencia semanal, factura electrónica; formulario de cotización. | Must |
| FR-12 | Testimonios | De 3 a 5 testimonios reales con nombre, negocio o barrio y foto. Si no existen aún, la sección **no se publica**. | Should |
| FR-13 | FAQ | Acordeón accesible con las preguntas definidas en `02-content-spec.md`. Con datos estructurados FAQPage. | Must |
| FR-14 | Garantía | Reclamo en 24 h con foto por WhatsApp y reposición o devolución. | Must |
| FR-15 | CTA final | Cierre con WhatsApp y resumen de la promesa. | Must |
| FR-16 | Pie legal | Razón social, NIT, dirección, teléfono, correo, términos, privacidad, PQR con constancia, enlace visible a la SIC. | Must |
| FR-17 | Botón flotante de WhatsApp | Visible en móvil después del hero, sin tapar el contenido ni el pie. | Should |
| FR-18 | Página legal | Términos (incluye exclusión de retracto en perecederos), política de datos, política de garantía. | Must |

### 4.1 Comportamiento del enlace de WhatsApp
- URL con formato `https://wa.me/<número>?text=<mensaje codificado>`.
- El mensaje cambia según la presentación elegida y la fuente (hero, tarjeta, flotante, B2B).
- Ejemplo de mensaje: "Hola, quiero pedir [presentación] de guineo verde. Mi barrio es: ___"
- El número se configura en un solo archivo de datos (no en componentes).

### 4.2 Formulario B2B
| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| Nombre | texto | Sí | 2–80 caracteres |
| Negocio | texto | Sí | 2–100 caracteres |
| Teléfono o WhatsApp | teléfono | Sí | Formato colombiano |
| Ciudad o barrio | texto | Sí | 2–80 caracteres |
| Volumen semanal (kg) | número | No | 1–5000 |
| Consentimiento de datos | casilla | Sí | Debe estar marcada |
| Campo trampa anti-spam | oculto | No | Debe estar vacío |

Resultado: el envío llega al correo o a una hoja de cálculo del negocio y el visitante ve confirmación en pantalla.

## 5. Requisitos de conversión y analítica

| ID | Requisito |
|---|---|
| FR-20 | Eventos: `view_hero`, `click_whatsapp` (con `source` y `presentation`), `view_presentations`, `submit_b2b`, `scroll_75`, `open_faq`. |
| FR-21 | Parámetros UTM se conservan y se agregan al mensaje de WhatsApp como referencia interna. |
| FR-22 | Consentimiento de cookies si se usan cookies de analítica o publicidad. Preferir analítica sin cookies. |
| FR-23 | Variantes A/B del H1 y del CTA se pueden activar por configuración (fase 2). |

## 6. Requisitos no funcionales

| ID | Requisito | Meta |
|---|---|---|
| NFR-01 | Rendimiento | LCP ≤ 2,5 s, CLS ≤ 0,1, INP ≤ 200 ms (móvil 4G, p75) |
| NFR-02 | Accesibilidad | WCAG 2.2 AA |
| NFR-03 | SEO | Título, descripción, Open Graph, datos estructurados (LocalBusiness, Product, FAQPage), `sitemap.xml`, `robots.txt` |
| NFR-04 | Seguridad | HTTPS, HSTS, CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`; sin secretos en el cliente |
| NFR-05 | Compatibilidad | Últimas dos versiones de Chrome, Safari, Firefox y Edge; Android 10+ e iOS 15+ |
| NFR-06 | Disponibilidad | ≥ 99,9 % (hosting estático con CDN) |
| NFR-07 | Mantenibilidad | Contenido y precios en archivos de datos; actualizar un precio no requiere tocar componentes |
| NFR-08 | Imágenes | AVIF o WebP con respaldo, `srcset`, carga diferida fuera del primer viewport |
| NFR-09 | Privacidad | Mínimo de datos, consentimiento explícito, aviso conforme a Ley 1581 |

## 7. Criterios de aceptación (muestra verificable)

| ID | Criterio | Verifica |
|---|---|---|
| AC-01 | Dado un visitante móvil, cuando llega a la página, entonces ve H1, precio "desde" y botón de WhatsApp sin hacer scroll | FR-02 |
| AC-02 | Cada tarjeta de presentación muestra precio por kg, peso aproximado y unidades aproximadas | FR-04 |
| AC-03 | Al tocar un botón de presentación se abre WhatsApp con el mensaje correspondiente ya escrito | FR-04, 4.1 |
| AC-04 | El costo de envío aparece separado del precio del producto | FR-10, Ley 1480 |
| AC-05 | El pie incluye razón social, NIT, dirección, PQR y enlace a la SIC | FR-16 |
| AC-06 | Los términos informan que el retracto no aplica a perecederos | FR-18 |
| AC-07 | El formulario B2B no se envía sin consentimiento y rechaza datos inválidos | 4.2 |
| AC-08 | No existe ningún contador, cupo ni cifra de escasez sin respaldo | P1 |
| AC-09 | Lighthouse móvil ≥ 90 en las cuatro categorías | NFR-01 a 03 |
| AC-10 | Navegación completa por teclado y lector de pantalla en el menú, el acordeón y el formulario | NFR-02 |
| AC-11 | Cada evento de FR-20 llega a la herramienta de analítica en preproducción | FR-20 |
| AC-12 | Si no hay testimonios reales, la sección FR-12 no se renderiza | FR-12 |

## 8. Preguntas abiertas

| # | Pregunta | Impacta |
|---|---|---|
| Q1 | ¿Nombre comercial y logotipo? | Todo el diseño |
| Q2 | ¿Ciudad(es) y zonas de entrega iniciales? | FR-01, FR-10 |
| Q3 | ¿Precio por kilo y por presentación definitivos? (el informe da solo referencias) | FR-04 |
| Q4 | ¿Origen real: finca, asociación y municipio? | FR-06 |
| Q5 | ¿Reparto propio o última milla de un tercero? | FR-10, FR-14 |
| Q6 | ¿Razón social, NIT y datos legales? | FR-16, FR-18 |
| Q7 | ¿Número de WhatsApp Business? | FR-04 |
| Q8 | ¿Se factura electrónicamente? ¿Con qué proveedor? | FR-11 |
| Q9 | ¿Dominio ya adquirido? | Plan de despliegue |
| Q10 | ¿Hay fotos reales de producto y productor? | FR-02, FR-06 |
| Q11 | ¿Habrá pedido mínimo y umbral de envío gratis? | FR-01, FR-10 |
| Q12 | ¿Se venderá harina o chips en alguna fase? | Alcance, trámite INVIMA |

## 9. Lista de cumplimiento legal (a validar con asesor jurídico)

| Ítem | Fuente indicada en el informe | Cubierto por |
|---|---|---|
| Identidad del vendedor (razón social, NIT, dirección, teléfono, correo) | Ley 1480, art. 50 | FR-16 |
| Precio total con impuestos y envío por separado | Ley 1480, art. 50 | FR-04, FR-10 |
| Medios de pago, tiempo de entrega | Ley 1480, art. 50 | FR-01, FR-10 |
| Peso, origen y usos del producto en la publicación | Ley 1480, art. 50, modificado por Ley 2439 de 2024 | FR-04, FR-06, FR-07 |
| Mecanismo de PQR con constancia | Ley 1480, art. 50 | FR-16 |
| Enlace visible a la SIC | Ley 1480, art. 50 | FR-16 |
| Exclusión de retracto en perecederos informada de forma expresa | Ley 1480, art. 47 | FR-18 |
| Garantía de calidad e idoneidad | Ley 1480 | FR-14 |
| Tratamiento de datos personales | Ley 1581 de 2012 | FR-18, 4.2 |
| Sin afirmaciones de salud sin respaldo | Res. 810 de 2021 | FR-08 |
| Transporte de alimentos (canastillas, sin contacto con el piso, leyenda "Transporte de Alimentos") | Res. 2674 de 2013, art. 29 | Proceso operativo, no la web |

> Nota: las referencias normativas provienen del informe de investigación. Deben ser confirmadas por un asesor jurídico antes del lanzamiento.

## 10. Origen de requisitos (hallazgos → requisitos)

| Hallazgo del informe | Requisito |
|---|---|
| Rappi y Solofruver resuelven la duda de cantidad con precio por kg y unidades aproximadas | FR-04 |
| Solofruver: garantía de 24 h con foto y reposición | FR-14 |
| Fruver Home: corte horario, pedido mínimo, hero y franja de confianza limpios | FR-01, FR-03 |
| Latido: origen por municipio, tabla comparativa, "cómo funciona" | FR-06, FR-09 |
| Basket La Canasta: usos y consejo para pelar | FR-07 |
| Amazon: aclarar que es para cocinar y no para madurar; cajas escalonadas | FR-05, FR-04 |
| Ninguna página nombra Urabá ni Zona Bananera | FR-06 |
| Prueba social vacía o inflada en todas | FR-12, P1 |
| Servientrega, Coordinadora y Envía no transportan perecederos | FR-10, Restricciones |
