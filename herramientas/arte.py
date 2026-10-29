"""Pasa las ilustraciones de Gemini del bosque (Libro_Sprinkloud/img/gemini/bosque-<id>.jpg) a assets/arte/<id>.webp
y actualiza js/arte.js con la lista de las que ya existen (las demás se siguen viendo como emoji).

Se generan con:  cd ..\\Libro_Sprinkloud\\herramientas ; .\\ilustraciones.ps1 7
(etapa7.txt tiene los pedidos: muebles de la tienda e insignias, sobre fondo blanco liso).
El fondo se quita con rembg (IA libre, github.com/danielgatis/rembg, modelo isnet-general-use): el objeto queda con todos
sus colores, opaco, como una calcomanía. Si rembg no está instalado se usa sin_papel (más transparente).
Uso:  python herramientas/arte.py
"""
import json, pathlib
from PIL import Image

RAIZ = pathlib.Path(__file__).resolve().parent.parent
ORIGEN = RAIZ.parent / 'Libro_Sprinkloud' / 'img' / 'gemini'
DESTINO = RAIZ / 'assets' / 'arte'
DESTINO.mkdir(parents=True, exist_ok=True)

def sin_papel(im):
    """El papel blanco del dibujo pasa a ser transparente (como «color a alfa» de GIMP): primero se lleva el tono del papel
    (la mediana de los bordes) a blanco puro y después cada píxel guarda solo lo que tiene de pintura."""
    import numpy as np
    a = np.asarray(im).astype(np.float32)
    borde = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    papel = np.median(borde, axis=0)
    a = np.clip(a / papel * 255.0, 0, 255)
    alfa = (255.0 - a.min(axis=2)) / 255.0
    alfa = np.clip((alfa - .03) / .97, 0, 1)            # el grano del papel no deja manchas
    seguro = np.maximum(alfa, 1e-3)[..., None]
    rgb = np.clip((a - 255.0 * (1 - seguro)) / seguro, 0, 255)
    # más cuerpo: la pintura se vuelve casi opaca (con sus colores reales) y el papel sigue invisible
    out = np.dstack([rgb, np.clip(alfa * 2.2, 0, 1) * 255.0]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def con_borde(im, grosor=7):
    """Borde blanco de calcomanía alrededor del dibujo (antes eran 4 sombras de CSS que se redibujaban en cada zoom)."""
    from PIL import ImageFilter
    alfa = im.getchannel('A').point(lambda v: 255 if v > 24 else 0)
    contorno = alfa.filter(ImageFilter.MaxFilter(grosor * 2 + 1)).filter(ImageFilter.GaussianBlur(1))
    fondo = Image.new('RGBA', im.size, (255, 253, 248, 0)); fondo.putalpha(contorno)
    fondo.alpha_composite(im)
    return fondo


_sesion = None
def recortar(im):
    """Calcomanía: el objeto con todos sus colores y el fondo transparente."""
    global _sesion
    try:
        from rembg import remove, new_session
    except ImportError:
        return sin_papel(im)
    if _sesion is None:
        _sesion = new_session('isnet-general-use')
    return remove(im, session=_sesion, alpha_matting=True, alpha_matting_foreground_threshold=235, alpha_matting_background_threshold=20).convert('RGBA')


for jpg in sorted(ORIGEN.glob('bosque-*.jpg')):
    if jpg.stem in ('bosque-casa-vacia', 'bosque-enlace'):   # la casa es el lienzo y el enlace es la vista previa: no son calcomanías
        continue
    id_ = jpg.stem[len('bosque-'):]
    salida = DESTINO / (id_ + '.webp')
    if salida.exists() and salida.stat().st_mtime >= jpg.stat().st_mtime:
        continue
    im = recortar(Image.open(jpg).convert('RGB'))
    # recorte al objeto (sin el margen de papel vacío), cuadrado y con un poco de aire
    caja = im.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox() or (0, 0, im.width, im.height)
    cx, cy = (caja[0] + caja[2]) / 2, (caja[1] + caja[3]) / 2
    lado = max(caja[2] - caja[0], caja[3] - caja[1]) * 1.12   # aire para el borde blanco
    im = im.crop((int(cx - lado / 2), int(cy - lado / 2), int(cx + lado / 2), int(cy + lado / 2))).resize((360, 360), Image.LANCZOS)
    con_borde(im).save(salida, 'WEBP', quality=86, method=6)
    print('listo', salida.name)

ids = sorted(p.stem for p in DESTINO.glob('*.webp'))
(RAIZ / 'js' / 'arte.js').write_text(
    '/* Dibujos de la tienda y las insignias que ya existen en assets/arte/<id>.webp (los demás se ven como emoji).\n'
    '   GENERADO por herramientas/arte.py. */\nwindow.BOSQUE_ARTE = ' + json.dumps(ids) + ';\n', encoding='utf-8', newline='\n')
print(len(ids), 'dibujos en la app')
