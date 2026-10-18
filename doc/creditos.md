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

## Íconos

| Recurso | Uso | Licencia |
|---|---|---|
| [Lucide](https://lucide.dev) (`lucide-react`) | Íconos de interfaz (teléfono, camión, escudo, etc.) | ISC |

## Fuentes

| Fuente | Uso | Licencia |
|---|---|---|
| Fraunces (Google Fonts, autoalojada con `next/font`) | Títulos | SIL Open Font License 1.1 |
| Inter (Google Fonts, autoalojada con `next/font`) | Texto | SIL Open Font License 1.1 |

## Historial

- 2026-10-18 (T-04): se publican las 12 fotos generadas con ChatGPT. La imagen para redes pasa de una tarjeta de texto generada a un recorte del hero.
- 2026-10-18 (T-39): se retiró el `favicon.ico` de la plantilla de Next.js, que no era propio, y se reemplazó por `src/app/icon.svg`.
