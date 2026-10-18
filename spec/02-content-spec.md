# Spec de contenido y diseño: Landing Guineo Verde

**Versión:** 1.3 · **Fecha:** 2026-10-18 · **Estado:** Borrador · **Alcance vigente:** `05-alcance-y-roadmap.md` v1.3

Todo texto entre `[corchetes]` es un dato que debe confirmar el negocio. El copy es una propuesta editable. Los textos van en español de Colombia, tono cercano y regional, sin exageraciones. **La landing no publica precios ni pedidos en la Fase 1.** El copy de esta sección se implementa en `src/content/copy.json` (un bloque por sección); los datos del negocio siguen en `site.json` y los demás archivos de contenido.

## Índice
1. Voz y tono
2. Copy por sección
3. FAQ
4. Recetas (tarjetas)
5. Dirección visual
6. Guía de imágenes
7. SEO

---

## 1. Voz y tono
- Cercano, costeño sin caricatura, claro y directo.
- Frases cortas. Cifras concretas y con respaldo documentado.
- Prohibido: "el mejor", "100 % garantizado", "cupos limitados" falsos, promesas de salud, precios o cifras de ahorro.

## 2. Copy por sección

### FR-01 Barra superior
`[Nombre comercial] · Acopio en Santa Marta · Llámanos: [número (FICTICIO)]` + botón **Llamar**

### FR-02 Hero
- **H1:** Guineo verde recién cortado, acopiado en Santa Marta [origen ficticio, Q4; definitivo en RP-02]
- **Subtítulo:** Para sancocho, cayeye y patacón. Firme, seleccionado a mano.
- **CTA primario:** Llamar para pedir
- **CTA secundario:** Ver origen
- **Microcopy bajo el CTA:** Te damos el precio por teléfono. Garantía de frescura de 24 horas.
- **Imagen:** libre de derechos de autor o propia ficticia, hasta tener fotos reales (Q10; ver sección 6).

### FR-03 Franja de confianza
| Ícono | Título | Texto |
|---|---|---|
| Camión | Acopio en Santa Marta | Distribuimos a hogares y puntos de venta |
| Teléfono | Precio por teléfono | Te atendemos por llamada |
| Escudo | Garantía de frescura | Reclamas en 24 horas con una foto |
| Mano | Seleccionado a mano | Solo guineo firme y verde |

### FR-04 Presentaciones (sin precio)
| Presentación | Título | Detalle | Botón |
|---|---|---|---|
| Unidad | Guineo suelto | ~[220] g por unidad | Llamar para precio |
| Kilo | Kilo | ~[4–5] unidades | Llamar para precio |
| Bolsa | Bolsa familiar | 3 kg · ~[13–15] unidades | Llamar para precio |
| Caja | Caja para negocios | [18–20] kg | Llamar para precio |

Nota bajo la tabla: *El precio se informa por teléfono. El costo de envío también se informa antes de confirmar.* [POR CONFIRMAR validación jurídica en RP-03]

### FR-05 "Verde de verdad"
- **Título:** Para cocinar, no para madurar
- **Texto:** Cortamos el guineo en su punto verde para que aguante la cocción y no se deshaga en la olla. Si lo guardas en un lugar fresco y seco, dura entre [4 y 7] días [POR CONFIRMAR con el proveedor].
- **Consejo:** No lo refrigeres si no quieres que la cáscara se oscurezca.

### FR-06 Origen
- **Título:** De [municipio de origen] a Santa Marta
- **Texto:** Trabajamos con [finca / asociación] en [municipio, departamento]. Recibimos el guineo en nuestro acopio de Santa Marta y de allí lo distribuimos. Cada lote lleva su fecha de corte.
- **Esquema en tres pasos:** Finca → Acopio en Santa Marta → Tu casa o tu negocio
- **Dato del lote vigente:** Lote [código] · Cortado el [fecha]
- **Foto:** libre de derechos de autor o propia ficticia, hasta tener fotos reales de productor, finca o acopio (Q10).

### FR-07 Usos y recetas
Título: **¿Qué cocinar con guineo verde?** Ver sección 4.

### FR-08 Beneficios (opcional)
- **Título:** Lo que aporta
- **Texto:** El guineo verde es fuente de almidón resistente, un tipo de fibra. Es un alimento de cocina tradicional y no sustituye la orientación de un profesional de la salud.
- **Prohibido:** mencionar diabetes, cáncer o pérdida de peso.

### FR-09 Cómo funciona
1. **Llama** y cuéntanos qué necesitas.
2. **Confirmamos** la presentación, el precio y la zona por teléfono.
3. **Recibes** y pagas según lo acordado.

### FR-10 Cobertura
- **Acopio:** Santa Marta, Magdalena.
- **Distribución:** solo Santa Marta, con reparto propio de la empresa, a hogares y puntos de venta (Q2, Q5, Q15).
- Texto: *¿Tu barrio o tu negocio no aparece? Llámanos y te decimos si llegamos.*
- No se publican horarios de entrega ni costos de envío en la Fase 1. Se informan por teléfono.

### FR-11 Negocios
- **Título:** ¿Tienes tienda, hotel o punto de venta?
- **Texto:** Distribuimos en Santa Marta desde nuestro acopio. Llámanos y te contamos las condiciones.
- **Botón:** Llamar

### FR-12 Testimonios
Solo con testimonios reales y autorizados. Formato: foto, nombre, negocio o barrio, texto de 1–2 frases. Mientras no existan, la sección se omite.

### FR-14 Garantía
- **Título:** Si llega maltratado, lo reponemos
- **Texto:** Tienes 24 horas desde la entrega para llamarnos o escribirnos al correo de contacto con una foto del producto y del recibo. Lo reponemos en el siguiente despacho o te devolvemos el dinero [POR CONFIRMAR política, RP-04].
- **Aclaración legal:** Por tratarse de un producto perecedero, no aplica el derecho de retracto. Esta garantía es adicional a tus derechos como consumidor.

### FR-15 CTA final
- **Título:** Llámanos y hablamos de tu pedido
- **Botón:** Llamar

### Aviso de demostración (D-11)
Franja fina arriba de la página, solo fuera de producción: *Demostración: los datos de empresa y contacto son ficticios.* El texto vive en `copy.json` (`demoNotice`).

### FR-16 Pie
Razón social: [FICTICIA, Q6] · NIT: [FICTICIO, Q6] · Dirección: [FICTICIA, Q6] · Teléfono: [número de contacto, Q7] · Correo: [FICTICIO, Q6]
*Todos estos datos se leen de `site.json`. No se escriben en la página.*
Enlaces: Términos · Privacidad · Garantía · PQR · **Superintendencia de Industria y Comercio** (enlace visible)
PQR: canal y forma de entregar la constancia [POR CONFIRMAR, RP-05].

## 3. FAQ (FR-13)

| # | Pregunta | Respuesta propuesta |
|---|---|---|
| 1 | ¿Cuál es la diferencia entre guineo verde, banano y plátano verde? | El guineo verde es el banano cortado verde para cocinar. El plátano verde (hartón) es otra variedad, más grande y de sabor distinto. |
| 2 | ¿Cuántas unidades trae un kilo? | Entre [4 y 5], según el tamaño. |
| 3 | ¿Cuánto dura y cómo lo conservo? | Entre [4 y 7] días en un lugar fresco y seco. Sin refrigerar. |
| 4 | ¿Cómo lo pelo sin mancharme? | Haz un corte a lo largo de la cáscara y pélalo con las manos húmedas, o hiérvelo con cáscara. |
| 5 | ¿Puede llegar pintón? | Puede haber piezas con un tono amarillo suave. Si más de [X] por ciento llega pintón, lo reponemos. |
| 6 | ¿A qué zonas llegan? | Acopiamos en Santa Marta y distribuimos a hogares y puntos de venta de la ciudad. Consulta por teléfono si llegamos a tu zona. |
| 7 | ¿Cuánto cuesta? | El precio se informa por teléfono. [POR CONFIRMAR validación jurídica en RP-03] |
| 8 | ¿Qué pasa si llega maltratado? | Garantía de 24 horas con reposición. |
| 9 | ¿Venden para tiendas, hoteles o restaurantes? ¿Y a personas naturales? | Sí, a todos. Llámanos y te contamos las condiciones según tu caso. |

**Fuera de la Fase 1:** la FAQ 10 ("¿Facturan?") se agrega con el roadmap R-09 (facturación electrónica). No se publica ni se renderiza en la Fase 1.

## 4. Recetas (FR-07)

| Receta | Tiempo | Descripción corta |
|---|---|---|
| Sancocho | [60–90] min | El guineo espesa el caldo y le da cuerpo. |
| Cayeye | [30] min | Puré de guineo verde con queso costeño y mantequilla, típico del Magdalena. |
| Guineítos hervidos o en escabeche | [15–20] min | Se hierven hasta que un tenedor entre fácil. Acompañan pescado o carnes. |
| Patacón de guineo | [20] min | Más pequeño y suave que el de plátano hartón. |
| Chips horneados | [25] min | Láminas finas, aceite y sal al horno. |

Cada tarjeta: foto, nombre, tiempo, 2 líneas. Las recetas completas, si se publican, viven en la propia página, no en enlaces externos.

## 5. Dirección visual

| Elemento | Propuesta |
|---|---|
| Paleta | Verde hoja `#2F6B3A` (primario), verde claro `#E8F3E6` (fondos), amarillo sol `#F2B705` (acento), carbón `#1F2A24` (texto), blanco cálido `#FFFBF2` (fondo base). El amarillo sol nunca se usa como color de texto (contraste 1,76:1 sobre el fondo base); sí como fondo con texto carbón (8,16:1) |
| CTA primario | Botón de llamada en verde oscuro `#0F7A41` con texto blanco (contraste 5,41:1). El `#128C4A` original daba 4,31:1 y no cumplía WCAG AA; se cambió el 2026-10-18. Verde WhatsApp `#25D366` queda reservado para el roadmap R-02 |
| Tipografía | Títulos: una serif o display con carácter (p. ej. Fraunces). Cuerpo: sans legible (p. ej. Inter). Autoalojadas, con `font-display: swap`. |
| Forma | Esquinas redondeadas 12–16 px, sombras suaves, mucho espacio en blanco |
| Iconos | Línea simple, un solo set (p. ej. Lucide) |
| Estilo fotográfico | Luz natural, fondo cálido, manos y cocinas reales. Evitar stock genérico. |
| Movimiento | Mínimo. Respetar `prefers-reduced-motion`. |

**Referencias estructurales (del informe):** hero y franja de confianza al estilo Fruver Home, origen al estilo Latido, usos al estilo Basket La Canasta.

## 6. Guía de imágenes

| Uso | Formato | Tamaño objetivo | Peso máximo |
|---|---|---|---|
| Hero | AVIF/WebP + JPG | 1600×1000 (móvil 800×1000) | 120 KB |
| Tarjetas de presentación | AVIF/WebP | 600×600 | 40 KB |
| Origen y productor | AVIF/WebP | 1200×800 | 90 KB |
| Recetas | AVIF/WebP | 600×400 | 40 KB |
| Open Graph | JPG | 1200×630 | 150 KB |

Todas con texto alternativo descriptivo.

## 7. SEO

| Elemento | Propuesta |
|---|---|
| Title | Guineo verde en Santa Marta \| [Marca ficticia, Q1] |
| Meta description | Guineo verde seleccionado a mano, acopiado en Santa Marta. Llámanos para precio y distribución a hogares y negocios. |
| Palabras clave | guineo verde, guineo verde Santa Marta, banano verde para sancocho, distribuidor guineo verde Magdalena |
| Datos estructurados | LocalBusiness, FAQPage. Product con Offer solo cuando entren precios (roadmap R-01). |
| Otros | URL canónica, `hreflang="es-CO"`, `sitemap.xml`, `robots.txt`, ficha de Google Business Profile enlazada |
