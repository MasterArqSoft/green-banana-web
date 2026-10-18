# Constitución del proyecto: Landing Guineo Verde

**Versión:** 1.3 · **Fecha:** 2026-10-18 · **Estado:** Borrador para aprobación

## Índice
1. Propósito
2. Principios no negociables
3. Restricciones
4. Definición de "terminado"
5. Gobierno de las specs

## 1. Propósito
Una landing page informativa que da a conocer la empresa de venta de guineo (banana) verde en Colombia. Acopio en Santa Marta (Magdalena), distribución a personas naturales y puntos de venta, origen trazable, garantía de frescura y contenido de uso (recetas). La landing no publica precios; el precio se informa por teléfono. El pedido por WhatsApp y los precios publicados quedan en el roadmap (ver `05-alcance-y-roadmap.md`).

El objetivo es dar a conocer el negocio, aumentar su visibilidad y apoyar las acciones de marketing. La Fase 1 es una prueba de concepto (POC) y un producto mínimo viable (MVP): una demostración funcional que se mejora y amplía de forma progresiva.

## 2. Principios no negociables

| # | Principio | Implicación verificable |
|---|---|---|
| P1 | **Honestidad comercial** | Sin contadores falsos, escasez artificial ni ahorros sin fuente. Toda cifra publicada tiene respaldo documentado. |
| P2 | **Cumplimiento primero** | Ley 1480 (identidad del vendedor, precio total, envío separado, PQR, enlace SIC, peso/origen/usos del producto). Exclusión de retracto para perecederos informada de forma expresa. Precio total informado por teléfono: validación jurídica pendiente antes de producción (D-01). |
| P3 | **Sin afirmaciones de salud sin respaldo** | Solo formulaciones como "fuente de almidón resistente". Nada de "controla la diabetes" o similares. |
| P4 | **Mobile-first** | La mayoría del tráfico llegará desde redes y móvil. Se diseña y prueba primero a 360 px. |
| P5 | **Rendimiento medible** | LCP ≤ 2,5 s, CLS ≤ 0,1, INP ≤ 200 ms en móvil 4G (p75). Peso inicial ≤ 300 KB sin imágenes diferidas. |
| P6 | **Seguridad desde el diseño** | OWASP ASVS nivel 1 como mínimo: cabeceras, CSP, validación de entradas, sin secretos en el cliente, dependencias auditadas. |
| P7 | **Accesibilidad** | WCAG 2.2 AA: contraste, foco visible, navegación por teclado, textos alternativos. |
| P8 | **Datos personales** | Ley 1581 de 2012: aviso de privacidad, consentimiento explícito en formularios, mínimo de datos. |
| P9 | **Contenido separado del código** | Copy, datos de contacto y zonas viven en archivos de datos editables sin tocar componentes. El número de contacto nunca va en el código. |
| P10 | **Trazabilidad** | Cada tarea referencia un requisito (FR/NFR) y cada requisito referencia su origen (hallazgo del informe). |

## 3. Restricciones
- El guineo fresco no se envía por paquetería estándar: la distribución sale del acopio en Santa Marta con reparto propio o de última milla local, a personas naturales y puntos de venta.
- Presupuesto de infraestructura objetivo: costo cercano a cero en la fase 1 (hosting estático + servicios gratuitos).
- Fase 1 sin carrito, sin pasarela de pagos, sin pedido por WhatsApp y sin precios publicados. El contacto es por llamada telefónica.
- Si se vende harina o chips: exige notificación o registro sanitario previo (INVIMA). Queda **fuera de alcance de la fase 1**.

## 4. Definición de "terminado"
- Todos los criterios de aceptación de la spec cumplidos.
- Lighthouse móvil ≥ 90 en Rendimiento, Accesibilidad, Buenas prácticas y SEO.
- Cumplimiento de la lista legal (spec, sección 9) revisado por la persona responsable del negocio.
- Datos legales y de contacto configurables y sin valores ficticios al publicar (Q6, Q7).
- Despliegue con HTTPS y cabeceras de seguridad confirmadas.

## 5. Gobierno de las specs
- Cambios en alcance: se modifican primero `05-alcance-y-roadmap.md` (fuente de verdad), luego `01-spec.md`, el plan y las tareas.
- Dudas abiertas se marcan `[POR CONFIRMAR]` y se resuelven antes de implementar la sección afectada.
- Toda decisión técnica relevante se registra en el plan (sección de decisiones).
