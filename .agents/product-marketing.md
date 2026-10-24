# Contexto de producto y marketing: Landing Guineo Verde

Lo leen las skills `copywriting` y `cro`. **No es fuente de verdad:** si algo aquí contradice `spec/` o `CLAUDE.md`, ganan esos (primero `spec/05-alcance-y-roadmap.md`). Las reglas de la sección "Prohibido" están por encima de cualquier recomendación de la skill.

## Negocio
- Venta de **guineo (banana) verde** para cocinar: sancocho, cayeye, patacón.
- Acopio y distribución en **Santa Marta (Magdalena, Colombia)**, con origen en fincas de la zona bananera del Magdalena.
- Clientes: **personas naturales** (hogares) y **puntos de venta** (tiendas, hoteles, restaurantes).
- Fase 1 (POC/MVP): landing informativa con **datos ficticios** marcados `(FICTICIO)` o `[POR CONFIRMAR]`. Los datos reales llegan en RP-01 y RP-02.

## Objetivo de la página
- Dar visibilidad al negocio y apoyar el marketing.
- **Única conversión: la llamada telefónica.** Todos los CTA son "Llamar" (`CallButton`, enlace `tel:`).
- Propuesta de valor: guineo firme, verde de verdad, seleccionado a mano, con origen trazable (fecha de corte por lote) y garantía de frescura de 24 horas.

## Público
- Hogares de Santa Marta que cocinan comida costeña, que llegan sobre todo **desde redes sociales y en móvil** (diseño a 360 px primero).
- Negocios que compran por caja (18–20 kg, [POR CONFIRMAR]).

## Voz y tono (`spec/02-content-spec.md` §1)
- Español de Colombia, **cercano, costeño sin caricatura**, claro y directo. Tuteo.
- Frases cortas. Cifras solo concretas y con respaldo documentado.

## Objeciones que la página debe resolver
- "¿Cuánto cuesta?" → el precio se informa **por teléfono** (no se publica en Fase 1).
- "¿Llega a mi zona?" → sección de cobertura.
- "¿Y si llega maltratado?" → garantía: 24 horas con foto ([POR CONFIRMAR], RP-04).
- "¿De dónde viene?" → sección de origen y mapa de fincas.

## Prohibido (no proponer nunca)
- **Precios, WhatsApp, formularios, carrito, analítica, pruebas A/B o pop-ups** en Fase 1: están en el roadmap (R-01 a R-07).
- **Urgencia o escasez artificial** (P1): "cupos limitados", "últimas unidades", contadores, temporizadores.
- **Cifras sin respaldo** (P1): ahorros, número de clientes, porcentajes, estadísticas.
- **Superlativos**: "el mejor", "100 % garantizado".
- **Afirmaciones de salud** (P3): solo "fuente de almidón resistente, un tipo de fibra". Nada de diabetes, cáncer, pérdida de peso ni similares.
- **Testimonios inventados** (FR-12): solo reales y autorizados.
- **Datos de contacto o legales en el copy:** viven en `site.json` y se insertan con marcadores (`{ciudad}`) y `fill()`.

El build falla si aparece una frase prohibida (`src/lib/claims.ts`).

## Dónde vive el copy
- `src/content/copy.json` (un bloque por sección, validado por `copySchema` en `src/lib/schema.ts`), más `products.json`, `faq.json`, `recipes.json`, `origin.json` y `legal.json`.
- Propuesta de copy por sección: `spec/02-content-spec.md` §2.

## Learnings
- (Sin pruebas de copy todavía.)
