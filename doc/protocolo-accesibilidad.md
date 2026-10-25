# Protocolo de aceptación manual de accesibilidad (WCAG 2.2 A/AA)

Protocolo para la prueba humana pendiente de T-38 (T-109, hallazgo `AUD-2026-10-24-FORENSE/F-09`). Lo ejecuta el usuario o un especialista; **Claude Code no lo ejecuta ni simula sus resultados**. F-09 y T-38 solo cierran con este protocolo completado y sus evidencias.

No es fuente de verdad: si contradice los specs, ganan los specs (NFR-02: WCAG 2.2 AA).

## 1. Qué cubre ya la automatización (y qué no)

Cubierto en cada `npm run validate` (Playwright, `tests/e2e/`): axe con etiquetas WCAG 2.2 A/AA en las 8 páginas, la 404 y los estados del mapa; teclado (salto al contenido, orden, acordeón, controles del mapa por estado); foco visible; reflow a 320 px con espaciado de texto y fuente al 200 %; controles con foco no tapados por la barra superior (R-01); ninguna palabra partida a tamaño normal (N-1); fotos de las tarjetas a la medida de 320 a 1280 px y con la fuente al 200 % (N-5); áreas táctiles de 44 px; `lang` y selector de idioma; WebKit y Firefox en el subconjunto `@smoke`.

**No cubierto y objeto de este protocolo:** cómo lo anuncia un lector de pantalla real; comprensión de nombres, estados y mensajes; **zoom real del navegador** al 200 % y al 400 %; ampliación de texto del sistema operativo o del navegador; dispositivos reales.

### Cuatro maneras de «agrandar» o «escuchar» que no son lo mismo

| Modo | Qué cambia | Dónde se prueba | Qué no demuestra |
|---|---|---|---|
| Viewport reducido (320 px) | Solo el ancho de la ventana | Automático (`movil-320`) | Densidad de píxeles, elementos fijos con zoom, texto del sistema |
| Fuente aumentada por CSS (`html { font-size: 200% }`) | El tamaño de la fuente raíz; las media queries siguen viendo el ancho real | Automático (reflow, R-01, N-5) | Cómo amplía el navegador o el sistema: no es la opción que usa una persona |
| Zoom real del navegador (Ctrl + o pellizco) | Ancho en px CSS, media queries, densidad, elementos fijos | Manual: E4 (Windows) y E5 (Android) | Lo que oye una persona ciega |
| Lector de pantalla real (NVDA, TalkBack) | Nada visual: anuncios, nombres, estados, orden | Manual: E1, E2 y E3 | Lo visual |

La ampliación de texto del sistema o del navegador (Windows: Configuración → Accesibilidad → Tamaño del texto; Chrome: Configuración → Apariencia → Tamaño de fuente; Android: Tamaño de fuente) se parece a la fuente aumentada por CSS, pero también cambia las media queries en `rem`: se prueba a mano (E4, E5).

### Qué versión probar

La Fase 13 ya está integrada en `main` mediante `b128a67`, y T-123 mediante `f3026a5` (merge `64dba55`, PR #9). **Al 2026-10-25 la demo publica `64dba55`** (despliegue `github-pages` de ese commit, run 40229133764). Antes de aceptar la demo publicada (`https://masterarqsoft.github.io/green-banana-web/`), comprobar qué commit está desplegado. También se puede evaluar un build local: `npm run build` y `node tests/e2e/server.mjs`, que sirve `out/` en `http://localhost:4173` (desde Android en la misma red: `http://<IP del equipo>:4173`, si el firewall lo permite). Anotar siempre URL, commit y si existen cambios sin commit; una prueba local no acredita la versión publicada.

**Revisión asistida 2026-10-25 (T-123):** navegador Chromium visible sobre una exportación local con prefijo de `9a27d11` y, después, sobre los cambios de traducción aún sin commit. Se comprobaron teclado, salto al contenido, FAQ, axe en las cuatro páginas inglesas y la 404, y layout a 320 px con fuente aumentada por CSS. Esto no ejecuta ni cierra E1-E5: no se operó NVDA/TalkBack. Los atajos enviados al navegador no cambiaron el zoom real (DPR y viewport permanecieron iguales), por lo que el zoom real tampoco queda acreditado. El acceso a la demo desde este entorno fue denegado por red; los resultados corresponden únicamente al build local. F-09 permanece abierto.

**Teclado y estados del mapa, evidencia automática (2026-10-25, working tree sobre `64dba55`):** Playwright en los cinco proyectos (`calls.spec.ts` y `mapa-fincas.spec.ts`: 120 aprobadas y 30 omitidas por proyecto; las de teclado físico no corren en los perfiles móviles). Cubre en ES y EN: primer Tab al enlace de salto y Enter al `<main>`; marca, selector y Llamar con foco visible; FAQ con Enter y con Espacio; Shift+Tab desanda el recorrido completo; términos, privacidad y garantía ida y vuelta con el teclado sin cambiar de idioma; el mapa cargado se deja con Tab y se recupera con Shift+Tab. Estados del mapa con red y carga interceptadas: carga por clic, marcadores y popup, error total, fallo parcial, «Reintentar», llegada tardía a los 15 s y foco diferido. Ningún enlace `tel:` ni `mailto:` se activa. **La observación visible y humana de estos escenarios se registra aparte** (§6); esto no la sustituye.

## 2. Entornos

**Revalidación automática local sobre `64dba55` (2026-10-25):** build aprobado; 174 pruebas aprobadas y 13 omitidas en las selecciones detalladas en `doc/bitacora.md`. Incluye axe a 320 px y pruebas de reflow, composición, teclado, idiomas y mapa. No es una sesión humana E1-E5 y no cierra F-02 ni F-09. Antes de repetir sobre un nuevo build, detener el servidor y volverlo a iniciar: las cabeceras se leen al arrancar y deben corresponder al HTML evaluado.

Hacer cada entorno en **español (`/`) y en inglés (`/en`)**, sobre el sitio que se vaya a aceptar (demo o producción) y anotando la URL y el commit.

| ID | Sistema | Navegador | Tecnología de apoyo |
|---|---|---|---|
| E1 | Windows 10/11 | Chrome (última) | NVDA (última), voz en español; para `/en`, voz en inglés o cambio automático de idioma activado |
| E2 | Windows 10/11 | Firefox (última) | NVDA |
| E3 | Android 10 o superior | Chrome (última) | TalkBack |
| E4 | Windows | Chrome y Firefox | Sin lector: teclado, zoom del navegador 200 % y 400 % (ventana de 1280 px de ancho) y tamaño del texto de Windows al 200 % |
| E5 | Android | Chrome | Sin lector: tamaño de fuente del sistema al máximo y zoom de página de Chrome (Ajustes → Accesibilidad) |

## 3. Guion paso a paso

Para cada paso: resultado **OK / Falla / N/A** y, si falla, captura o grabación y descripción breve.

1. **Inicio.** Cargar la página. ¿El lector anuncia el título y el idioma correcto? (E1–E3)
2. **Saltar al contenido.** Primer Tab: aparece «Saltar al contenido»; Enter lleva al contenido principal. (E1, E2, E4)
3. **Cabecera.** Recorrer marca, selector de idioma y «Llamar». ¿Los nombres se entienden y el de «Llamar» incluye el número? ¿El idioma activo se anuncia como actual? (E1–E3)
4. **Selector de idioma.** Cambiar a la otra lengua y volver. ¿Se conserva la página equivalente? ¿El lector cambia de voz con `lang`? Con la traducción automática del navegador activa, ¿«Español / English» siguen legibles? (E1, E3)
5. **Botones Llamar de las presentaciones.** ¿Cada uno se distingue por su presentación («Llamar para precio, Kilo…»)? (E1–E3)
6. **Preguntas frecuentes.** Abrir y cerrar con Enter/Espacio (o doble toque). ¿Se anuncia abierto/cerrado? (E1–E3)
7. **Mapa, estado inicial.** ¿Se lee el aviso de privacidad antes del botón «Ver mapa»? ¿La lista de fincas es accesible sin abrir el mapa? (E1–E3)
8. **Mapa, cargando y listo.** Pulsar «Ver mapa». ¿Se anuncia «Cargando mapa…»? Al cargar, ¿el foco queda en el mapa? ¿Se alcanzan con Tab los botones de zoom y los marcadores, y Enter abre el nombre de la finca? ¿Se puede salir del mapa con Tab (sin trampa de teclado)? (E1, E2, E4)
9. **Mapa, error y parcial** (si se puede provocar sin red o con la red lenta; si no, N/A con motivo). ¿Se anuncia el mensaje? ¿«Reintentar» funciona con teclado? Con el foco fuera del mapa cuando ocurre el error, ¿el foco **no** salta (F-04)? (E1, E4)
10. **Pie.** Teléfono, correo, enlaces legales y SIC: ¿nombres claros y alcanzables? (E1–E3)
11. **Páginas legales y «Volver al inicio».** ¿Se mantiene el idioma al volver? (E1, E3)
12. **404.** Abrir `/no-existe` y `/en/no-existe`: ¿se entiende en los dos idiomas (la ayuda en inglés se anuncia en inglés)? (E1)
13. **Zoom real 200 % y 400 %** (E4, ventana de 1280 px): ¿hay desplazamiento horizontal o contenido cortado? ¿La barra superior tapa el contenido o el elemento con foco al recorrer con Tab (R-01)? ¿Las tarjetas y botones se leen completos (F-02)?
14. **Fuente del sistema al máximo y zoom de Chrome en Android** (E5): ¿se lee todo sin desplazamiento horizontal? ¿El botón flotante tapa algo importante?
15. **Contraste en estados**: foco, hover, aviso del mapa, botón activo del selector. Revisar con el inspector de contraste del navegador donde haya duda.
16. **Tarjetas de presentaciones a 320 px (residual de F-02).** En un teléfono de 320 px de ancho, o en Chrome de escritorio con DevTools → modo dispositivo a 320 × 640: ¿cada tarjeta muestra la foto arriba y el texto debajo, completos, sin cortes ni solapes? ¿El botón «Llamar para precio» se lee completo (puede ir en dos líneas)? ¿La foto se ve nítida? Repetir con el texto de Windows o Android aumentado. Es una revisión visual: OK si te parece aceptable; Falla, con captura, si no. (E4, E5)

## 4. Matriz WCAG 2.2 A/AA

«Aplica» se decidió con el alcance actual (sin formularios, audio ni video). Los pasos remiten a §3. Resultado y evidencia los completa quien ejecuta el protocolo.

| Criterio | Nivel | Aplica | Qué revisar en este sitio | Método | Resultado | Evidencia |
|---|---|---|---|---|---|---|
| 1.1.1 Contenido no textual | A | Sí | Textos alternativos de fotos; íconos decorativos ocultos; mapa ilustrado decorativo | Lector (1, 5, 7) + axe | | |
| 1.2.1–1.2.5 Multimedia | A/AA | N/A | No hay audio ni video | — | N/A | |
| 1.3.1 Información y relaciones | A | Sí | Títulos, listas, regiones, FAQ `<details>`, `dl` del pie | Lector (todos) | | |
| 1.3.2 Secuencia significativa | A | Sí | Orden de lectura igual al visual, también a 320 px | Lector, zoom (13) | | |
| 1.3.3 Características sensoriales | A | Sí | Instrucciones que no dependan solo de forma o posición | Revisión de textos | | |
| 1.3.4 Orientación | AA | Sí | Funciona en vertical y horizontal | E3, E5 | | |
| 1.3.5 Propósito de los campos | AA | N/A | Sin formularios | — | N/A | |
| 1.4.1 Uso del color | A | Sí | Idioma activo (fondo, negrita y subrayado), enlaces | Visual | | |
| 1.4.2 Control del audio | A | N/A | Sin audio | — | N/A | |
| 1.4.3 Contraste mínimo | AA | Sí | Texto sobre crema, hoja, carbón; CTA amarillo con texto carbón | axe + inspector (15) | | |
| 1.4.4 Cambio de tamaño del texto | AA | Sí | Zoom real 200 % sin pérdida | E4 (13), E5 (14) | | |
| 1.4.5 Imágenes de texto | AA | Sí | Ningún texto dentro de imágenes (`og.jpg` sin texto) | Visual | | |
| 1.4.10 Reflow | AA | Sí | 400 % en 1280 px (equivale a 320 px) sin desplazamiento horizontal, salvo el mapa | E4 (13) | | |
| 1.4.11 Contraste no textual | AA | Sí | Bordes de botones, foco, marcadores del mapa | Inspector (15) | | |
| 1.4.12 Espaciado del texto | AA | Sí | Con un marcador de espaciado (bookmarklet) sin pérdida | E4 | | |
| 1.4.13 Contenido al pasar el cursor o con foco | AA | Sí | Popups del mapa: se cierran y no tapan sin control | E1, E4 (8) | | |
| 2.1.1 Teclado | A | Sí | Todo operable con teclado, incluido el mapa | E1, E2, E4 (2–11) | | |
| 2.1.2 Sin trampas de teclado | A | Sí | Entrar y salir del mapa con Tab | E4 (8) | | |
| 2.1.4 Atajos de una tecla | A | Sí | Teclas de Leaflet (+, −, flechas) solo con el foco en el mapa | E4 (8) | | |
| 2.2.1 Tiempo ajustable | A | N/A | Sin límites de tiempo para el usuario (el plazo de 15 s del mapa es de carga, no del usuario) | — | N/A | |
| 2.2.2 Pausar, detener, ocultar | A | N/A | Sin contenido en movimiento automático | Visual | | |
| 2.3.1 Tres destellos | A | Sí | Ningún destello | Visual | | |
| 2.4.1 Evitar bloques | A | Sí | «Saltar al contenido» | (2) | | |
| 2.4.2 Título de página | A | Sí | Título propio por página e idioma | (1) | | |
| 2.4.3 Orden del foco | A | Sí | Orden lógico; tras errores del mapa | (3, 8, 9) | | |
| 2.4.4 Propósito de los enlaces | A | Sí | Enlaces y botones Llamar con contexto | (5, 10) | | |
| 2.4.5 Múltiples vías | AA | Sí | Inicio, pie y retorno desde legales | (10, 11) | | |
| 2.4.6 Encabezados y etiquetas | AA | Sí | Títulos descriptivos en los dos idiomas | Lector | | |
| 2.4.7 Foco visible | AA | Sí | Contorno visible también sobre fondo hoja y carbón | E4 | | |
| 2.4.11 Foco no oculto (mínimo) | AA | Sí | La barra superior y el botón flotante no tapan del todo el foco, también con zoom | E4 (13), E5 (14) | | |
| 2.5.1 Gestos con el puntero | A | Sí | El mapa se usa sin pellizcar (botones de zoom y lista) | E3, E5 | | |
| 2.5.2 Cancelación del puntero | A | Sí | Acciones al soltar, no al presionar | E3 | | |
| 2.5.3 Etiqueta en el nombre | A | Sí | El nombre accesible empieza con el texto visible | Lector (3, 5) | | |
| 2.5.4 Activación por movimiento | A | N/A | Sin funciones por movimiento | — | N/A | |
| 2.5.7 Movimientos de arrastre | AA | Sí | Desplazar el mapa tiene alternativa (teclado, zoom, lista) | E3, E4 | | |
| 2.5.8 Tamaño del objetivo (mínimo) | AA | Sí | 24 px como mínimo (el sitio usa 44 px); marcadores del mapa | E3, axe | | |
| 3.1.1 Idioma de la página | A | Sí | `lang="es-CO"` y `lang="en"` | Lector (1) | | |
| 3.1.2 Idioma de las partes | AA | Sí | Nombres del selector y ayuda inglesa de la 404 | Lector (4, 12) | | |
| 3.2.1 Al recibir el foco | A | Sí | El foco no cambia de página ni abre nada | E4 | | |
| 3.2.2 Al introducir datos | A | N/A | Sin campos | — | N/A | |
| 3.2.3 Navegación coherente | AA | Sí | Cabecera y pie iguales en todas las páginas | Visual | | |
| 3.2.4 Identificación coherente | AA | Sí | «Llamar» y el selector se identifican igual en todas | Lector | | |
| 3.2.6 Ayuda coherente | A | Sí | Teléfono en el mismo lugar relativo en todas las páginas | Visual | | |
| 3.3.1–3.3.4, 3.3.7, 3.3.8 Formularios y autenticación | A/AA | N/A | Sin formularios ni inicio de sesión | — | N/A | |
| 4.1.2 Nombre, función y valor | A | Sí | Botones del mapa, FAQ, selector (`aria-current`) | Lector (3, 6, 8) | | |
| 4.1.3 Mensajes de estado | AA | Sí | «Cargando mapa…», error y aviso parcial se anuncian sin mover el foco | Lector (8, 9) | | |

## 5. Sesión guiada (orden recomendado)

Una sesión de unos 90 minutos cubre lo esencial; lo demás puede ir en otra. En cada bloque, anota el resultado de cada paso en la tabla de §6 (OK / Falla / N/A) y guarda capturas o grabaciones de las fallas en una carpeta local (no se versionan; F-08). Si algo falla, no lo corrijas: descríbelo y sigue.

| Bloque | Entorno | Pasos de §3 | Qué observar en concreto | Tiempo |
|---|---|---|---|---|
| A. Visual a 320 px (F-02) | E4 (DevTools a 320 × 640), `/` y `/en` | 16 | Tarjetas completas, foto arriba y nítida, botón legible | 10 min |
| B. Zoom real | E4, Chrome, ventana de 1280 px: Ctrl + hasta 200 % y luego 400 %; `/` y `/en` | 13, 2, 3 | Sin desplazamiento horizontal (salvo el mapa); con Tab, el control con foco nunca queda tapado por la barra superior ni por el botón flotante | 15 min |
| C. NVDA + Chrome | E1, `/` | 1–12 | Qué dice NVDA al llegar a cada elemento: anótalo literal en «Evidencia» cuando sea dudoso | 30 min |
| D. NVDA + Chrome | E1, `/en` | 1, 3, 4, 6, 8, 12 | Que la voz cambie a inglés; nombres y estados en inglés | 15 min |
| E. TalkBack + Chrome | E3, `/` y `/en` | 1, 3, 5, 6, 7, 8 | Deslizar a la derecha para avanzar, doble toque para activar | 20 min |

NVDA con Firefox (E2), el tamaño del texto del sistema (E4 y E5) y el resto de la matriz de §4 van en una segunda sesión. Atajos de NVDA: Insert + Flecha abajo lee todo; H salta por títulos; Tab, por controles; Insert + F7, lista de enlaces; Insert + Q sale.

## 6. Registro de resultados

Copiar esta tabla por sesión y añadir el resumen al registro de hallazgos (`doc/registro-hallazgos.md`, fila F-09). «Versiones» lleva sistema, navegador y lector con su versión (por ejemplo, «Windows 11 23H2, Chrome 131, NVDA 2025.3»):

| Fecha | Persona (evaluador) | Entorno (E1–E5) | Versiones | Idioma | URL y commit | Pasos OK | Pasos con falla | Criterios afectados | Limitaciones | Evidencia (ruta o enlace) |
|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | |

**Estado al 2026-10-25:** ninguna sesión con resultados registrados en esta tabla. La automatización de §1 pasa (bitácora de ese día); eso no sustituye a este protocolo. **Actualización del mismo día:** el usuario declaró aprobadas la accesibilidad y el zoom real, sin aportar los datos de esta tabla (ver «Aprobaciones del usuario» abajo).

### Hoja de registro de lectores de pantalla (E1–E3, F-09 / T-38)

Estados permitidos: **Aprobada**, **Fallida** (con captura o grabación y lo que dijo el lector), **No ejecutada** (con motivo) y **No aplicable** (con motivo). F-09 solo cierra con E1, E2 y E3 hechos en ES y EN; los resultados parciales válidos se conservan.

Entorno de desarrollo consultado el 2026-10-25: Chrome 155.0.8059.85 y Firefox 158.0.1 instalados; NVDA no instalado. Claude Code no opera lectores de pantalla ni simula sus resultados. **Actualización del 2026-10-25:** el usuario declaró aprobada la accesibilidad (F-09 / T-38) y el zoom real (ver «Aprobaciones del usuario» abajo), sin aportar resultados por comprobación: las celdas pasan de «No ejecutada» a **«Sin datos»** (no se sabe si se ejecutaron ni con qué resultado). No equivale a «Aprobada». Versión a evaluar: la que esté publicada o el build local, anotando el commit (§1).

| ID | Comprobación | Pasos de §3 | E1 NVDA + Chrome · ES | E1 · EN | E2 NVDA + Firefox · ES | E2 · EN | E3 TalkBack + Chrome Android · ES | E3 · EN | Evidencia y notas |
|---|---|---|---|---|---|---|---|---|---|
| L1 | Título de la página e idioma anunciado (`lang`) | 1 | Sin datos | Sin datos | Sin datos | Sin datos | Sin datos | Sin datos | |
| L2 | «Saltar al contenido» y enlaces: nombre claro y destino | 2, 10 | Sin datos | Sin datos | Sin datos | Sin datos | Sin datos | Sin datos | |
| L3 | Selector de idioma: «Español / English», idioma actual anunciado, cambio de voz | 3, 4 | Sin datos | Sin datos | Sin datos | Sin datos | Sin datos | Sin datos | |
| L4 | Botones Llamar: el nombre incluye el texto visible, el número y, en tarjetas, la presentación | 3, 5 | Sin datos | Sin datos | Sin datos | Sin datos | Sin datos | Sin datos | |
| L5 | FAQ: pregunta, estado abierto/cerrado y respuesta | 6 | Sin datos | Sin datos | Sin datos | Sin datos | Sin datos | Sin datos | |
| L6 | Mapa inicial: aviso de privacidad antes de «Ver mapa» y lista de fincas sin abrir el mapa | 7 | Sin datos | Sin datos | Sin datos | Sin datos | Sin datos | Sin datos | |
| L7 | Mapa: «Cargando mapa…», mapa listo, zoom, marcadores y popup | 8 | Sin datos | Sin datos | Sin datos | Sin datos | Sin datos | Sin datos | |
| L8 | Mapa: error, fallo parcial y «Reintentar» anunciados sin mover el foco (si no se puede provocar: No aplicable con motivo) | 9 | Sin datos | Sin datos | Sin datos | Sin datos | Sin datos | Sin datos | |
| L9 | Pie: teléfono, correo, legales y SIC | 10 | Sin datos | Sin datos | Sin datos | Sin datos | Sin datos | Sin datos | |
| L10 | Páginas legales y «Volver al inicio» en el mismo idioma | 11 | Sin datos | Sin datos | Sin datos | Sin datos | Sin datos | Sin datos | |
| L11 | 404 (`/no-existe` y `/en/no-existe`): mensaje entendible y ayuda inglesa anunciada en inglés | 12 | Sin datos | Sin datos | Sin datos | Sin datos | Sin datos | Sin datos | |

Datos de cada entorno (completar al ejecutar): fecha, evaluador, sistema y versión, navegador y versión, lector y versión, voz e idioma, URL y commit, limitaciones.

| Entorno | Fecha | Evaluador | Sistema | Navegador | Lector | URL y commit | Limitaciones |
|---|---|---|---|---|---|---|---|
| E1 | | | | | | | |
| E2 | | | | | | | |
| E3 | | | | | | | |


### Aprobaciones del usuario (2026-10-25)

Declaraciones del usuario, registradas como tales (no son pruebas ejecutadas por Claude Code). Detalle y procedencia: bitácora del 2026-10-25, «Aprobaciones del usuario: revisión visual, accesibilidad, zoom real e inglés».

| Aprobación | Procedencia | Qué no se aportó | Estado |
|---|---|---|---|
| Aceptación visual de las tarjetas (F-02, paso 16) | Declaración del usuario | Versión o URL, navegador, ajuste de texto | Aceptado por el usuario |
| Accesibilidad (F-09 / T-38) | Declaración del usuario | Entornos E1–E3 usados, versiones, lector, anuncios, resultados por celda de la hoja, versión evaluada | Aprobado por el usuario; evidencia detallada pendiente |
| Zoom real del navegador (E4, paso 13) | Declaración del usuario | Porcentajes (200 % / 400 %), navegador, ancho de ventana, versión evaluada | Aprobado por el usuario; porcentajes sin confirmar |
| Ampliación real del texto (E4 y E5, paso 14) | — (no incluida en las aprobaciones) | Todo | Pendiente; la aprobación del zoom no la acredita. Existe solo evidencia automática de Claude Code (ajuste de fuente del navegador a 32 px en Chromium, bitácora del 2026-10-25), que no sustituye la prueba humana |

Cada falla se convierte en un hallazgo nuevo (`AUD-<fecha>-A11Y/<id>`) con prueba automática cuando sea posible. F-09 cierra cuando E1 a E5 estén hechos en los dos idiomas sin fallas abiertas de nivel A o AA, o con las restantes aceptadas por el usuario con su motivo.
