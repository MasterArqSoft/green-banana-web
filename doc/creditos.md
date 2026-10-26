# Créditos y licencias de recursos

Registro de todo recurso de terceros o propio que se publica en el sitio (AC-13, regla de imágenes hasta RP-02). Toda foto o ícono nuevo se agrega aquí **antes** de publicarlo, con su origen y licencia.

## Fotos

Todas son **propias ficticias**: generadas con ChatGPT (OpenAI) por el usuario el 2026-10-18 a partir de los prompts del proyecto. Según los términos de OpenAI, el usuario es dueño de las imágenes generadas y puede usarlas comercialmente. **Se reemplazan por fotos reales del producto, el productor y el acopio en RP-02.**

Los originales están en `fotos-originales/` (fuera de Git). Las versiones publicadas las genera `npm run images` en `public/images/` según `src/lib/images.ts`.

| Original | Publicada en | Uso | Notas |
|---|---|---|---|
| `hero-escritorio.png` | `hero/hero-escritorio.*`, `og.jpg` | Hero (escritorio) e imagen para redes | |
| `hero-movil.png` | `hero/hero-movil.*` | Hero (móvil) | |
| `presentacion-unidad.png` | `presentaciones/unit*` | Guineo suelto | |
| `presentacion-kilo.png` | `presentaciones/kg*` | Kilo | Pesa sin números ni marca |
| `presentacion-bolsa.png` | `presentaciones/bag*` | Bolsa familiar | |
| `presentacion-caja.png` | `presentaciones/box*` | Caja para negocios | |
| `origen-acopio.png` | `origen/origen*` | Origen | Solo manos, sin cara ni lugar identificable |
| `receta-sancocho.png` | `recetas/sancocho*` | Receta | |
| `receta-cayeye.png` | `recetas/cayeye*` | Receta | **Recortada**: el original tenía plátano hartón pintón al fondo |
| `receta-guineitos.png` | `recetas/guineitos*` | Receta | |
| `receta-patacon.png` | `recetas/patacon*` | Receta | **Recortada**: el original tenía plátano hartón al fondo |
| `receta-chips.png` | `recetas/chips-horneados*` | Receta | **Recortada**: los guineos del fondo parecían plátano |

## Otros recursos propios

| Archivo | Uso | Origen |
|---|---|---|
| `src/app/icon.svg` | Favicon | Dibujo propio del proyecto (T-39) |
| `src/app/favicon.ico` y `src/app/apple-icon.png` | Favicon para navegadores sin SVG e ícono de pantalla de inicio en iOS | Generados desde `icon.svg` con `npm run icons` (T-63, 2026-10-24) |
| `public/images/hero/hero-{escritorio,movil}-fondo.webp` y `-alfa.webp` | Capas del efecto 2.5D del hero, variante C (rama `feature/hero-depth-capas`): la mesa y el fondo reconstruidos detrás del racimo y el matte (opacidad) del producto | Derivados de las fotos propias ficticias del hero con `tools/profundidad/generar.py` (variante c, `tools/profundidad/capas.py`), en local y en CPU (nunca en el navegador ni en servicios de terceros): el matte con [BiRefNet](https://github.com/ZhengPeng7/BiRefNet) en la exportación ONNX de [onnx-community](https://huggingface.co/onnx-community/BiRefNet-ONNX) (revisión `534d3c8`, SHA-256 `58f621f0…5a1ebd3c`), licencia **MIT**; la reconstrucción con [LaMa](https://github.com/advimman/lama) (big-lama) en la exportación ONNX de [Carve](https://huggingface.co/Carve/LaMa-ONNX) (revisión `c3c0c9e`, SHA-256 `1faef530…a4eb68d6`), licencia **Apache-2.0**. Los modelos no se publican ni se versionan. Lo reconstruido es una estimación de lo que hay detrás del racimo (mesa, pared, cántaro y planta), no una foto: solo se ve en la franja que el movimiento destapa. Se regeneran en RP-02 con las fotos reales |
| `public/images/hero/hero-escritorio-profundidad.webp` y `hero-movil-profundidad.webp` | Mapas de profundidad del efecto 2.5D del hero (variante C, rama `feature/hero-depth-capas`: dos canales, fondo y producto) | Derivados de las fotos propias ficticias del hero con `tools/profundidad/generar.py`, que ejecuta en local (CPU, nunca en el navegador) el modelo [Depth Anything V2 Small](https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf) en la exportación ONNX de [onnx-community](https://huggingface.co/onnx-community/depth-anything-v2-small) (revisión `4472b73`, SHA-256 `afb6a5c2…a1df10c`), licencia **Apache-2.0** (solo la variante Small; Base y Large tienen otra licencia y no se usan). El modelo no se publica ni se versiona; los mapas son resultado de su uso, posprocesados por el mismo script (variante C, la predeterminada en esta rama: profundidad del fondo estimada sobre la placa reconstruida, sin el racimo, y del producto con solo su volumen de conjunto y apoyado en la mesa). Se regeneran en RP-02 con las fotos reales |

## Íconos

| Recurso | Uso | Licencia |
|---|---|---|
| [Lucide](https://lucide.dev) (`lucide-react`) | Íconos de interfaz (teléfono, camión, escudo, etc.) | ISC |

## Mapa de fincas (FR-24)

| Recurso | Uso | Licencia |
|---|---|---|
| [Leaflet](https://leafletjs.com) 1.9.4 (`leaflet`, por npm, sin CDN) | Mapa interactivo, cargado solo al pulsar "Ver mapa" | BSD-2-Clause |
| Teselas de [OpenStreetMap](https://www.openstreetmap.org/copyright) (`tile.openstreetmap.org`) | Fondo del mapa | Datos © OpenStreetMap contributors, ODbL 1.0. Atribución visible "© OpenStreetMap contributors" (AC-18), según la política de uso de teselas de OSMF |

| Mapa ilustrado de la zona (`/mapa-fincas.svg` y `/mapa-fincas-movil.svg`, y sus versiones inglesas `/en/mapa-fincas.svg` y `/en/mapa-fincas-movil.svg` desde la Fase 12, generados en el build desde `src/lib/mapa-base.json`; solo cambian los rótulos) | Fondo de la sección del mapa antes de pulsar "Ver mapa" | Ilustración propia. La geometría (costa, ciénagas, ríos y Troncal del Caribe) se deriva de datos de OpenStreetMap, © OpenStreetMap contributors, ODbL 1.0: es una "obra producida" que solo exige atribución, que va visible sobre el mapa. Extracto de Overpass del 2026-10-20, simplificado una sola vez. El relieve de la Sierra es un dibujo esquemático propio |

Los marcadores son CSS propio (`.marcador-finca`, `.marcador-acopio` en `globals.css`); no se usan las imágenes de marcador de Leaflet.

## Fuentes

| Fuente | Uso | Licencia |
|---|---|---|
| Fraunces 1.000 (The Fraunces Project Authors), versión modificada: instancia estática propia en `src/app/fonts/fraunces-es.woff2` (wght 600, opsz 14, SOFT 0, WONK 1; caracteres del español y del inglés, mismos rangos que Inter), derivada de `ofl/fraunces/Fraunces[SOFT,WONK,opsz,wght].ttf` del repositorio oficial [google/fonts](https://github.com/google/fonts/tree/4024282d9b0cffcdb8e3024560862746178d741f/ofl/fraunces) (commit `4024282`, blob git `8210f94`, SHA-256 `177ff6c0…958abbb`); se sirve con `next/font/local`. SHA-256 del archivo publicado: `24cadecb2f85ed979e4996f11c188716e73d34be3c878095403c8a70791d3d5b` | Títulos | SIL Open Font License 1.1 (`OFL.txt` del mismo commit, SHA-256 `bdf4c228…eced833b`). Fraunces no tiene nombre reservado; el copyright y la URL de la licencia van dentro del archivo (tabla `name`, IDs 0, 13 y 14) |
| Inter 4.001 (The Inter Project Authors), versión modificada: subconjunto propio en `src/app/fonts/inter-es.woff2` (pesos 400 a 700, caracteres del español), derivado del archivo latino que distribuye Google Fonts; se sirve con `next/font/local` | Texto | SIL Open Font License 1.1. La OFL permite modificar y redistribuir; Inter no tiene nombre reservado (Reserved Font Name), así que la versión recortada conserva el nombre. El copyright y la URL de la licencia van dentro del archivo (tabla `name`, IDs 0 y 14) |

## Historial

- 2026-10-24 (Fase 12, T-95): versiones inglesas del mapa ilustrado, con la misma geometría derivada de OSM y la misma atribución. Sin fotos, íconos ni fuentes nuevas: la foto para redes (`og.jpg`) no tiene texto y la comparten los dos idiomas, e Inter recortada ya cubre los caracteres de los textos ingleses (verificado por `tests/unit/lib/fuentes.test.ts`).
- 2026-10-18 (T-04): se publican las 12 fotos generadas con ChatGPT. La imagen para redes pasa de una tarjeta de texto generada a un recorte del hero.
- 2026-10-19: mapa ilustrado de la zona como fondo antes de "Ver mapa" (geometría derivada de OSM, ODbL).
- 2026-10-25 (T-112, F-12): Fraunces deja de descargarse de Google Fonts al compilar; instancia y subconjunto propios generados con fontTools desde el archivo variable de `google/fonts` (16,8 KB frente a 18,1 KB). Procedimiento en `doc/bitacora.md`. Inter: SHA-256 `292426673183cbdefaa2081737f8c649f0694195e7b4e4eadf2fb4430562c45d`. Los dos hashes los verifica `tests/unit/lib/fuentes.test.ts`.
- 2026-10-24 (T-82): Inter pasa a un subconjunto propio (23,9 KB frente a 48,4 KB) generado con fontTools; procedimiento en `doc/bitacora.md`.
- 2026-10-19 (T-54): Leaflet y teselas de OpenStreetMap para el mapa de fincas. Sin fotos nuevas.
- 2026-10-18 (T-39): se retiró el `favicon.ico` de la plantilla de Next.js, que no era propio, y se reemplazó por `src/app/icon.svg`.
