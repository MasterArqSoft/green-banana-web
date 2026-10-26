"""Variante C del efecto de profundidad: producto y fondo en capas (generar.py --variante c).

Con un solo mapa (variantes A y B) el fondo que el racimo destapa al moverse se rellena
estirando lo que hay junto a la silueta: el corte del tallo dejaba vetas hacia el fondo.
Aquí la foto se separa en dos capas y el fondo oculto se reconstruye:

- producto (racimo y tallo): su opacidad (matte) con BiRefNet; se mueve casi entero, con
  el volumen de conjunto de la variante B;
- mesa y fondo: una placa con lo que hay detrás del producto reconstruido con LaMa, con
  su propio mapa de profundidad, suave (sin el escalón del producto ni bordes duros entre
  objetos del fondo, que se veían como escalones).

La sombra y el contacto no necesitan capa propia: la sombra está pintada en la mesa y la
mesa bajo el racimo tiene la profundidad de su base (se ajusta abajo), así que se mueven
juntas. Tampoco hace falta separar la mesa del fondo: no se tapan entre sí de forma que
el movimiento descubra algo, y un mapa suave las desplaza a distinta velocidad.

El shader (profundidad.worker.ts) compone con la ecuación del matte:
    color = foto(pf) + (1 − α(pf)) · (fondo(pb) − fondo(pf))
con pf y pb las posiciones de origen del producto y del fondo. En reposo pf = pb y el
resultado es la foto exacta; al moverse, el borde del producto pierde el fondo original
que tenía mezclado (fondo(pf)) y gana el nuevo (fondo(pb)), sin arrastrar color.

Archivos por foto, junto a ella en public/images/hero/:
- <foto>-fondo.webp: la placa (RGB). Solo se usa donde el producto la tapa; fuera de ahí
  va desenfocada para que pese poco.
- <foto>-alfa.webp (sin pérdida): R = opacidad del producto; G = dónde se usa la placa
  (la opacidad ensanchada con una rampa de ANILLO px: cubre el resplandor del borde).
- <foto>-profundidad.webp (sin pérdida, mitad de resolución): R = fondo, G = producto,
  con la misma convención que src/lib/parallax.ts (FOCO = plano que no se mueve).

Modelos (CPU, en tools/profundidad/modelos/, fuera de Git; nada se ejecuta en el
navegador ni se sube a terceros):
- BiRefNet (MIT), exportación ONNX de onnx-community, para el matte;
- LaMa big-lama (Apache-2.0), exportación ONNX de Carve, para reconstruir el fondo.
"""

from pathlib import Path

import numpy as np
import onnxruntime as ort
from PIL import Image, ImageFilter

MODELOS = Path(__file__).resolve().parent / "modelos"
BIREFNET = (
    MODELOS / "birefnet.onnx",
    "https://huggingface.co/onnx-community/BiRefNet-ONNX/resolve/"
    "534d3c82d3bb8b2f0867db6dfbc3a525b8e42f67/onnx/model.onnx",
    "58f621f00f5d756097615970a88a791584600dcf7c45b18a0a6267535a1ebd3c",
)
LAMA = (
    MODELOS / "lama_fp32.onnx",
    "https://huggingface.co/Carve/LaMa-ONNX/resolve/"
    "c3c0c9e468934d62e79c329e35d82dd09ff8c444/lama_fp32.onnx",
    "1faef5301d78db7dda502fe59966957ec4b79dd64e16f03ed96913c7a4eb68d6",
)

MEDIA = np.array([0.485, 0.456, 0.406], dtype=np.float32)
DESVIACION = np.array([0.229, 0.224, 0.225], dtype=np.float32)

# En píxeles de la foto publicada:
# - MASCARA_LAMA: la zona que LaMa reconstruye es el producto ensanchado esto (el borde
#   del racimo y su resplandor no deben contaminar la placa).
# - ANILLO: rampa de la zona en que se usa la placa, por fuera del matte.
# - FRANJA: ancho, por dentro del producto, de la reconstrucción a resolución completa
#   (lo que el movimiento puede destapar: ~45 px de la foto con la amplitud actual); más
#   adentro basta la pasada global, a 512 px.
MASCARA_LAMA = 6
ANILLO = 4
FRANJA = 96
LAMA_LADO = 512
LAMA_PASO = 320

# En píxeles del mapa (mitad de resolución):
# - SUAVIZADO_FONDO: el mapa del fondo es suave: los bordes entre objetos del fondo (el
#   cántaro, la tela) ya no son escalones de desplazamiento.
# - RELIEVE y RELIEVE_RADIO: volumen de conjunto del producto, como en la variante B.
SUAVIZADO_FONDO = 14.0
RELIEVE = 0.5
RELIEVE_RADIO = 28.0
PLANO_PRODUCTO = 0.88
BANDA = 0.2


def sesion(modelo: tuple[Path, str, str], sha256, descargar) -> ort.InferenceSession:
    ruta, url, suma = modelo
    if not ruta.exists():
        descargar(url, ruta)
    if sha256(ruta) != suma:
        raise SystemExit(f"SHA-256 inesperado en {ruta}; bórralo y vuelve a correr.")
    return ort.InferenceSession(str(ruta), providers=["CPUExecutionProvider"])


# --- Utilidades sobre matrices float (sin dependencias nuevas) ---


def caja(a: np.ndarray, r: int) -> np.ndarray:
    """Media en una ventana (2r+1)², con los bordes replicados."""
    if r <= 0:
        return a
    p = np.pad(a, r, mode="edge")
    c = p.cumsum(0).cumsum(1)
    c = np.pad(c, ((1, 0), (1, 0)))
    n = 2 * r + 1
    return (c[n:, n:] - c[:-n, n:] - c[n:, :-n] + c[:-n, :-n]) / (n * n)


def gauss(a: np.ndarray, sigma: float) -> np.ndarray:
    """Aproximación gaussiana con tres medias en caja."""
    r = max(1, int(round(np.sqrt(12 * sigma * sigma / 3 + 1) / 2)))
    for _ in range(3):
        a = caja(a, r)
    return a


def dilatar(m: np.ndarray, px: int) -> np.ndarray:
    img = Image.fromarray((m * 255).astype(np.uint8))
    while px > 0:
        paso = min(px, 6)
        img = img.filter(ImageFilter.MaxFilter(2 * paso + 1))
        px -= paso
    return np.asarray(img) > 127


def erosionar(m: np.ndarray, px: int) -> np.ndarray:
    return ~dilatar(~m, px)


def rellenar(v: np.ndarray, conocido: np.ndarray) -> np.ndarray:
    """Extiende v desde `conocido` al resto, de cerca a lejos (convolución normalizada)."""
    f = np.where(conocido, v, 0.0).astype(np.float64)
    k = conocido.astype(np.float64)
    for sigma in (2, 4, 8, 16, 32, 64, 128):
        num, den = gauss(f * k, sigma), gauss(k, sigma)
        nuevo = (k < 0.5) & (den > 1e-4)
        f[nuevo] = num[nuevo] / den[nuevo]
        k[nuevo] = 1.0
    return f.astype(np.float32)


# --- Matte del producto ---


def matte(red: ort.InferenceSession, foto: Image.Image) -> np.ndarray:
    x = (np.asarray(foto.resize((1024, 1024), Image.BICUBIC), dtype=np.float32) / 255 - MEDIA) / DESVIACION
    y = red.run(None, {red.get_inputs()[0].name: x.transpose(2, 0, 1)[None]})[0][0, 0]
    a = Image.fromarray((255 / (1 + np.exp(-y))).round().astype(np.uint8))
    return np.asarray(a.resize(foto.size, Image.BICUBIC), dtype=np.float32) / 255


# --- Reconstrucción del fondo ---


def lama(red: ort.InferenceSession, img: np.ndarray, mascara: np.ndarray) -> np.ndarray:
    """img 512×512×3 en 0..1, máscara 512×512 (1 = reconstruir); devuelve 0..1."""
    y = red.run(
        None,
        {
            "image": img.transpose(2, 0, 1)[None].astype(np.float32),
            "mask": mascara[None, None].astype(np.float32),
        },
    )[0][0].transpose(1, 2, 0)
    return np.clip(y / 255, 0, 1)


def reconstruir(red: ort.InferenceSession, foto: np.ndarray, mascara: np.ndarray) -> np.ndarray:
    alto, ancho = mascara.shape
    # Pasada global, reducida a 512 px en el lado largo (relleno por reflexión): la
    # estructura de lo oculto (la mesa, la pared, el cántaro) con todo el contexto.
    esc = LAMA_LADO / max(alto, ancho)
    a2, w2 = round(alto * esc), round(ancho * esc)
    chica = np.asarray(Image.fromarray((foto * 255).astype(np.uint8)).resize((w2, a2), Image.LANCZOS), dtype=np.float32) / 255
    m2 = np.asarray(Image.fromarray((mascara * 255).astype(np.uint8)).resize((w2, a2), Image.BILINEAR)) > 2
    relleno = ((0, LAMA_LADO - a2), (0, LAMA_LADO - w2))
    g = lama(red, np.pad(chica, relleno + ((0, 0),), mode="reflect"), np.pad(m2, relleno).astype(np.float32))[:a2, :w2]
    g = np.asarray(Image.fromarray((g * 255).round().astype(np.uint8)).resize((ancho, alto), Image.BICUBIC), dtype=np.float32) / 255
    placa = np.where(mascara[..., None], g, foto)
    # Pasada a resolución completa en la franja que el movimiento puede destapar: el
    # interior ya reconstruido sirve de contexto, así que franja y global casan.
    franja = mascara & ~erosionar(mascara, FRANJA)
    suma = np.zeros_like(foto)
    peso = np.zeros((alto, ancho), dtype=np.float32)
    v = np.minimum(np.arange(LAMA_LADO) + 1, LAMA_LADO - np.arange(LAMA_LADO)).astype(np.float32)
    ventana = np.outer(v, v) / (LAMA_LADO / 2) ** 2
    ys, xs = np.nonzero(franja)
    for y0 in range(max(0, ys.min() - 64), ys.max() + 1, LAMA_PASO):
        for x0 in range(max(0, xs.min() - 64), xs.max() + 1, LAMA_PASO):
            y0c, x0c = min(y0, alto - LAMA_LADO), min(x0, ancho - LAMA_LADO)
            sl = (slice(y0c, y0c + LAMA_LADO), slice(x0c, x0c + LAMA_LADO))
            mt = franja[sl]
            if not mt.any():
                continue
            r = lama(red, placa[sl], mt.astype(np.float32))
            suma[sl] += r * ventana[..., None]
            peso[sl] += ventana
    hay = franja & (peso > 0)
    placa[hay] = suma[hay] / peso[hay][:, None]
    return placa


# --- Mapas de profundidad de las dos capas ---


def remapear(d: np.ndarray, foco: float) -> np.ndarray:
    """La profundidad del racimo pasa a PLANO_PRODUCTO; lo demás conserva su orden."""
    p = PLANO_PRODUCTO
    return np.where(d < foco, d * p / foco, p + (d - foco) * (1 - p) / (1 - foco))


def mapas(
    d: np.ndarray, d_placa: np.ndarray, foco: float, producto: np.ndarray
) -> tuple[np.ndarray, np.ndarray]:
    """d: profundidad de la foto y d_placa la de la placa (sin producto), normalizadas y a
    mitad de resolución; producto: máscara a esa escala."""
    fuera = ~dilatar(producto, 3)
    # Fondo: la profundidad de la placa (la escena sin el racimo: debajo hay mesa, no un
    # relleno con la forma de la silueta), llevada a la escala de la foto con un ajuste
    # lineal fuera del producto, y suave.
    a, b = np.polyfit(d_placa[fuera], d[fuera], 1)
    fondo = gauss(remapear(np.clip(a * d_placa + b, 0, 1), foco), SUAVIZADO_FONDO)
    # Producto: plano por delante del foco con su volumen de conjunto (variante B),
    # extendido fuera de la silueta sin saltos (el shader lo lee junto al borde).
    volumen = gauss(d.astype(np.float64), RELIEVE_RADIO).astype(np.float32)
    prod = PLANO_PRODUCTO + np.clip(volumen - foco, -BANDA, BANDA) * RELIEVE
    dentro = erosionar(producto, 2)
    prod = gauss(rellenar(prod, dentro), 2.0)
    # Apoyo: en el borde inferior del racimo, la mesa (fondo justo debajo) y la base del
    # producto deben moverse igual. Se ajusta el plano del producto a la mesa.
    alto = producto.shape[0]
    debajo = np.zeros_like(producto)
    debajo[:-4] = producto[:-4] & ~producto[4:]
    debajo[: int(alto * 0.55)] = False
    if debajo.any():
        ys, xs = np.nonzero(debajo)
        mesa = fondo[np.minimum(ys + 6, alto - 1), xs]
        prod = prod + float(np.median(mesa - prod[ys, xs]))
    fondo, prod = np.clip(fondo, 0, 1), np.clip(prod, 0, 1)
    # La misma curva monótona en los dos mapas (lineal a tramos, como remapear()) lleva
    # el producto a PLANO_PRODUCTO, por delante del foco: acompaña el gesto al revés que
    # el fondo, como en la variante B. No cambia el orden de profundidades, el fondo
    # lejano (cerca de 0) ni el apoyo: la mesa en contacto sigue a la profundidad de la
    # base.
    m = float(np.median(prod[producto]))
    return remapear(fondo, m), remapear(prod, m)
