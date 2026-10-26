"""Mapas de profundidad del hero (efecto 2.5D, rama feature/hero-depth-parallax).

Lee las fotos publicadas del hero (public/images/hero/hero-*.jpg, la misma rejilla de
píxeles que muestra el navegador en AVIF, WebP o JPG) y escribe a su lado
hero-*-profundidad.webp: escala de grises, blanco = cerca, negro = lejos, con la misma
proporción y el mismo encuadre que la foto.

Modelo: Depth Anything V2 Small (Apache-2.0), exportado a ONNX por onnx-community,
revisión fijada en MODELO_REVISION. Corre en CPU con onnxruntime; nada se ejecuta en el
navegador del visitante. Entorno aislado (no toca el runtime de la web):

    python -m venv tools/profundidad/.venv
    tools/profundidad/.venv/Scripts/python -m pip install -r tools/profundidad/requirements.txt
    tools/profundidad/.venv/Scripts/python tools/profundidad/generar.py

El modelo (~99 MB) se descarga a tools/profundidad/modelos/ (fuera de Git) y se
comprueba su SHA-256. Volver a correr el script después de `npm run images` si cambian
las fotos del hero.

Variantes (`--variante`):
- c (predeterminada, la publicada): producto y fondo en capas, con lo que el producto
  tapa reconstruido (tools/profundidad/capas.py; escribe también -fondo.webp y
  -alfa.webp). Es la única que usa el código actual (profundidad.worker.ts lee los dos
  canales del mapa y las dos capas).
- b (para comparar; el código actual ya no la lee): el producto participa del movimiento. Su plano queda
  por delante del foco del shader (0,88 frente a 0,75), así que se mueve un poco en
  sentido contrario al fondo, entero y con su volumen de baja frecuencia (sin el relieve
  de cada dedo); la mesa en contacto está a su misma profundidad y se mueve con él.
- a (para comparar; tampoco la lee el código actual): el racimo y todo lo que está a su profundidad, mesa
  incluida, quedan en el foco y no se mueven; solo se desliza el fondo.
`--salida <carpeta>` escribe los archivos en otra carpeta (por defecto, junto a las fotos).
Sin argumentos se regeneran exactamente las capas publicadas.
"""

import argparse
import hashlib
import sys
import urllib.request
from pathlib import Path

import numpy as np
import onnxruntime as ort
from PIL import Image, ImageFilter

import capas

RAIZ = Path(__file__).resolve().parents[2]
HERO = RAIZ / "public" / "images" / "hero"
MODELOS = Path(__file__).resolve().parent / "modelos"

MODELO_REVISION = "4472b7362082ad9968fee890ca0f1e5aca36b93d"
MODELO_URL = (
    "https://huggingface.co/onnx-community/depth-anything-v2-small/resolve/"
    f"{MODELO_REVISION}/onnx/model.onnx"
)
MODELO_SHA256 = "afb6a5c28f3b6bf1618c6e43f02073ef9dfdc70e937502d51603e57b0a1df10c"
MODELO = MODELOS / "depth-anything-v2-small.onnx"

# preprocessor_config.json del modelo: lado corto 518, múltiplos de 14, ImageNet.
LADO_CORTO = 518
MULTIPLO = 14
MEDIA = np.array([0.485, 0.456, 0.406], dtype=np.float32)
DESVIACION = np.array([0.229, 0.224, 0.225], dtype=np.float32)

# Foto publicada → tamaño del mapa (la mitad: la profundidad es suave y el shader la
# interpola; así pesa poco) y caja aproximada del racimo (fracciones x0, y0, x1, y1), solo
# para medir a qué profundidad está el producto.
FOTOS = {
    "hero-escritorio": ((800, 500), (0.18, 0.18, 0.89, 0.87)),
    "hero-movil": ((400, 500), (0.08, 0.38, 0.96, 0.86)),
}

# Variante A. Convención compartida con src/lib/parallax.ts (FOCO): el plano del producto
# queda en 0,75 en los dos mapas. Ese plano no se desplaza, así que el racimo se ve rígido
# y nítido y lo que se mueve es el fondo (más lejos) y el borde de la mesa (más cerca).
PLANO_PRODUCTO = 0.75
# El relieve interno del racimo (±BANDA alrededor de su profundidad) se comprime a
# COMPRESION: con el relieve completo cada dedo se desplazaba distinto y el racimo se
# deformaba (revisión del 2026-10-25).
BANDA = 0.2
COMPRESION = 0.1

# Posprocesado, en píxeles del mapa de salida:
# - CIERRE: rellena los huecos entre los dedos (se ve la mesa o el fondo detrás), que se
#   desplazaban y arrastraban el borde del guineo; el racimo queda como un solo plano.
# - DILATACION y SUAVIZADO: el plano del producto crece sobre el fondo y la transición
#   es una rampa ancha. Junto al racimo el desplazamiento del fondo debe crecer más
#   despacio que la distancia al contorno; si no, el fondo toma color del guineo y su
#   borde parece arrastrarse (con 7 y 5 se veía en el escritorio, ~12 px de
#   desplazamiento en una rampa de ~9 px).
DILATACION = 13  # tamaño del filtro máximo (impar)
SUAVIZADO = 9.0  # radio gaussiano
CIERRE = 15  # tamaño del filtro (impar): máximo y luego mínimo


def sha256(ruta: Path) -> str:
    h = hashlib.sha256()
    with ruta.open("rb") as f:
        for bloque in iter(lambda: f.read(1 << 20), b""):
            h.update(bloque)
    return h.hexdigest()


def asegurar_modelo() -> None:
    if not MODELO.exists():
        MODELOS.mkdir(parents=True, exist_ok=True)
        print(f"Descargando {MODELO_URL}")
        urllib.request.urlretrieve(MODELO_URL, MODELO)
    if sha256(MODELO) != MODELO_SHA256:
        sys.exit(f"SHA-256 inesperado en {MODELO}; bórralo y vuelve a correr.")


def a_multiplo(valor: float) -> int:
    return max(MULTIPLO, int(round(valor / MULTIPLO)) * MULTIPLO)


def profundidad(sesion: ort.InferenceSession, foto: Image.Image) -> np.ndarray:
    ancho, alto = foto.size
    escala = LADO_CORTO / min(ancho, alto)
    entrada = foto.resize(
        (a_multiplo(ancho * escala), a_multiplo(alto * escala)), Image.BICUBIC
    )
    x = (np.asarray(entrada, dtype=np.float32) / 255.0 - MEDIA) / DESVIACION
    x = x.transpose(2, 0, 1)[None]
    nombre = sesion.get_inputs()[0].name
    salida = sesion.run(None, {nombre: x})[0]
    # Profundidad relativa inversa: mayor = más cerca.
    return np.squeeze(salida).astype(np.float32)


def normalizar(d: np.ndarray) -> np.ndarray:
    bajo, alto = np.percentile(d, [1, 99])
    return np.clip((d - bajo) / max(alto - bajo, 1e-6), 0.0, 1.0)


def profundidad_producto(d: np.ndarray, caja: tuple[float, ...]) -> float:
    """Mediana de la mitad más cercana dentro de la caja: el racimo, no la mesa del fondo."""
    alto, ancho = d.shape
    x0, y0, x1, y1 = caja
    zona = d[int(y0 * alto) : int(y1 * alto), int(x0 * ancho) : int(x1 * ancho)]
    return float(np.median(zona[zona >= np.median(zona)]))


def aplanar_producto(d: np.ndarray, foco: float) -> np.ndarray:
    """Lleva el racimo a PLANO_PRODUCTO con su relieve comprimido; el resto, lineal."""
    lejos, cerca = foco - BANDA, foco + BANDA
    p = PLANO_PRODUCTO
    b = BANDA * COMPRESION
    return np.interp(d, [0.0, lejos, cerca, 1.0], [0.0, p - b, p + b, 1.0])


# Variante B: plano del producto por delante del foco del shader (0,75), así que el racimo
# se mueve un poco en sentido contrario al fondo. El producto se aísla por su silueta (su
# banda de profundidad dentro de la caja, sin huecos), no por una banda global: con la
# banda global la mesa también quedaba inmóvil. Conserva su volumen de baja frecuencia
# (la forma del racimo entero, desenfocada RELIEVE_RADIO px), no el de cada dedo. El resto
# de la escena mantiene su degradado, con la profundidad del racimo llevada al plano del
# producto: la mesa en contacto queda a su altura (no flota) y la delantera, más cerca.
PLANO_PRODUCTO_B = 0.88
BANDA_SILUETA = 0.12
RELIEVE = 0.5
RELIEVE_RADIO = 28.0


def desenfocar(d: np.ndarray, radio: float) -> np.ndarray:
    img = Image.fromarray((d * 255).round().astype(np.uint8), mode="L")
    return np.asarray(img.filter(ImageFilter.GaussianBlur(radio)), dtype=np.float32) / 255


def producto_participa(
    d: np.ndarray, foco: float, caja: tuple[float, ...]
) -> np.ndarray:
    p = PLANO_PRODUCTO_B
    resto = np.where(d < foco, d * p / foco, p + (d - foco) * (1 - p) / (1 - foco))
    alto, ancho = d.shape
    x0, y0, x1, y1 = caja
    zona = (slice(int(y0 * alto), int(y1 * alto)), slice(int(x0 * ancho), int(x1 * ancho)))
    silueta = np.zeros_like(d)
    silueta[zona] = np.abs(d[zona] - foco) <= BANDA_SILUETA
    mascara = Image.fromarray((silueta * 255).astype(np.uint8), mode="L")
    mascara = mascara.filter(ImageFilter.MaxFilter(CIERRE)).filter(ImageFilter.MinFilter(CIERRE))
    peso = np.asarray(mascara.filter(ImageFilter.GaussianBlur(3)), dtype=np.float32) / 255
    producto = p + np.clip(desenfocar(d, RELIEVE_RADIO) - foco, -BANDA, BANDA) * RELIEVE
    return np.clip(peso * producto + (1 - peso) * resto, 0.0, 1.0)


def descargar(url: str, ruta: Path) -> None:
    ruta.parent.mkdir(parents=True, exist_ok=True)
    print(f"Descargando {url}")
    urllib.request.urlretrieve(url, ruta)


def variante_c(
    salida: Path,
    nombre: str,
    foto: Image.Image,
    d: np.ndarray,
    foco: float,
    sesion: ort.InferenceSession,
    redes,
) -> None:
    """Capas de la variante C (tools/profundidad/capas.py)."""
    red_matte, red_lama = redes
    alfa = capas.matte(red_matte, foto)
    f = np.asarray(foto, dtype=np.float32) / 255
    producto = alfa > 0.01
    placa = capas.reconstruir(red_lama, f, capas.dilatar(producto, capas.MASCARA_LAMA))
    placa_completa = placa.copy()
    # Dónde se usa la placa: el matte ensanchado ANILLO px con una rampa.
    uso = capas.caja(capas.dilatar(producto, capas.ANILLO).astype(np.float32), capas.ANILLO // 2)
    uso = np.maximum(uso, (alfa > 0.01).astype(np.float32))
    # Fuera de esa zona la placa no se lee: desenfocada, pesa poco.
    lejos = ~capas.dilatar(producto, capas.MASCARA_LAMA + 4)
    borrosa = np.stack([capas.gauss(placa[..., c], 12) for c in range(3)], -1)
    placa = np.where(lejos[..., None], borrosa, placa)
    Image.fromarray((placa * 255).round().astype(np.uint8)).save(
        salida / f"{nombre}-fondo.webp", "WEBP", quality=88, method=6
    )
    canales = np.stack([alfa, uso, np.zeros_like(alfa)], -1)
    Image.fromarray((canales * 255).round().astype(np.uint8)).save(
        salida / f"{nombre}-alfa.webp", "WEBP", lossless=True, method=6
    )
    alto, ancho = d.shape
    prod_mapa = np.asarray(Image.fromarray((alfa * 255).astype(np.uint8)).resize((ancho, alto), Image.BILINEAR)) > 127
    prod_mapa = capas.erosionar(capas.dilatar(prod_mapa, CIERRE // 2), CIERRE // 2)
    sin_producto = Image.fromarray((placa_completa * 255).round().astype(np.uint8))
    d_placa = normalizar(profundidad(sesion, sin_producto))
    d_placa = np.asarray(
        Image.fromarray((d_placa * 255).round().astype(np.uint8)).resize((ancho, alto), Image.BICUBIC),
        dtype=np.float32,
    ) / 255
    fondo, prod = capas.mapas(d, d_placa, foco, prod_mapa)
    # Sin pérdida (WebP con pérdida mezcla los canales al submuestrear el color) y a un
    # cuarto de la resolución de la foto: los dos mapas son suaves.
    canales = np.stack([fondo, prod, np.zeros_like(fondo)], -1)
    Image.fromarray((canales * 255).round().astype(np.uint8)).resize(
        (ancho // 2, alto // 2), Image.BILINEAR
    ).save(salida / f"{nombre}-profundidad.webp", "WEBP", lossless=True, method=6)


def main() -> None:
    argumentos = argparse.ArgumentParser(description=__doc__)
    argumentos.add_argument("--variante", choices=["a", "b", "c"], default="c")
    argumentos.add_argument("--salida", type=Path, default=HERO)
    opciones = argumentos.parse_args()
    opciones.salida.mkdir(parents=True, exist_ok=True)
    asegurar_modelo()
    sesion = ort.InferenceSession(str(MODELO), providers=["CPUExecutionProvider"])
    redes = None
    if opciones.variante == "c":
        redes = (
            capas.sesion(capas.BIREFNET, sha256, descargar),
            capas.sesion(capas.LAMA, sha256, descargar),
        )
    for nombre, ((ancho, alto), caja) in FOTOS.items():
        origen = HERO / f"{nombre}.jpg"
        foto = Image.open(origen).convert("RGB")
        if foto.width * alto != foto.height * ancho:
            sys.exit(f"{origen}: la proporción no coincide con el mapa {ancho}×{alto}")
        d = normalizar(profundidad(sesion, foto))
        mapa = Image.fromarray((d * 255).round().astype(np.uint8), mode="L")
        d = np.asarray(mapa.resize((ancho, alto), Image.BICUBIC), dtype=np.float32) / 255
        foco = profundidad_producto(d, caja)
        if opciones.variante == "c":
            variante_c(opciones.salida, nombre, foto, d, foco, sesion, redes)
            for sufijo in ("fondo", "alfa", "profundidad"):
                destino = opciones.salida / f"{nombre}-{sufijo}.webp"
                print(f"OK {destino} ({destino.stat().st_size / 1024:.1f} KB)")
            continue
        if opciones.variante == "b":
            d = producto_participa(d, foco, caja)
        else:
            d = aplanar_producto(d, foco)
        mapa = Image.fromarray((d * 255).round().astype(np.uint8), mode="L")
        mapa = mapa.filter(ImageFilter.MaxFilter(CIERRE))
        mapa = mapa.filter(ImageFilter.MinFilter(CIERRE))
        mapa = mapa.filter(ImageFilter.MaxFilter(DILATACION))
        mapa = mapa.filter(ImageFilter.GaussianBlur(SUAVIZADO))
        destino = opciones.salida / f"{nombre}-profundidad.webp"
        # Calidad 90: frente a guardarlo sin pérdida (23 KB) el error máximo es de 6 o 7
        # niveles de 255, ~0,01 px de desplazamiento.
        mapa.convert("RGB").save(destino, "WEBP", quality=90, method=6)
        print(
            f"OK {destino} ({destino.stat().st_size / 1024:.1f} KB)"
            f" racimo a {foco:.2f}, variante {opciones.variante}"
        )


if __name__ == "__main__":
    main()
