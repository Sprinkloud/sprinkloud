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
    try:
        return remove(im, session=_sesion, alpha_matting=True, alpha_matting_foreground_threshold=235, alpha_matting_background_threshold=20).convert('RGBA')
    except MemoryError:
        # el recorte fino (alpha matting) se queda sin memoria con objetos delgados, como los palitos (3-nov): recorte normal
        return remove(im, session=_sesion).convert('RGBA')


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


# ---------- 16-nov-2026: los mapas (páginas del álbum), sus stickers, los amigos y los regalos ----------
# Los stickers de los mapas ya vienen recortados de Libro_Sprinkloud/img/stickers (stickers.py); aquí solo se llevan a un
# cuadro de 360 px con su borde blanco, con el id «<mapa>-<nombre>». Al agregar un sticker a un mapa: ponerlo en MAPAS
# (el orden no importa), correr este archivo y sumarlo a la TIENDA del servidor y del modo de prueba (js/api.js).
LIBRO = RAIZ.parent / 'Libro_Sprinkloud' / 'img'
MAPAS = {
    'lago': ['canoa', 'peces', 'nenufares-rana', 'patitos', 'cana-pescar', 'cesta-pesca',
             'velero', 'salvavidas', 'libelulas', 'tortuga-tronco', 'cisne', 'garza', 'juncos', 'farol-muelle', 'cubeta-peces',
             'red-pesca', 'tienda-campana', 'fogatita-olla', 'toalla-sombrero', 'barquito-papel', 'ranitas',
             'balsa-troncos', 'bote-cisne', 'puente-arco', 'castor-presa', 'nutria', 'boya', 'hamaca', 'farolitos-flotantes', 'piedras-paso'],
    'picnic': ['cesta-picnic', 'manta-picnic', 'sandwiches-limonada', 'cometa', 'sombrilla', 'pastel-fresas', 'tarta-manzana', 'sandia', 'canasta-frutas', 'globos', 'banderines', 'columpio-rama', 'pelota', 'ukelele', 'mariposas', 'hormiguitas', 'ramo-frasco', 'cojines', 'bicicleta', 'rehilete', 'termo-tazas', 'caballete', 'burbujas', 'tabla-quesos', 'carrito-helados', 'gramofono', 'raquetas', 'pajaritos-migas', 'farolillos-papel', 'mesita-picnic'],
    'huerto': ['regadera', 'carretilla', 'pala-rastrillo', 'zanahorias', 'espantapajaros', 'coles', 'tomates', 'girasoles', 'fresas-mata', 'maiz', 'lechugas', 'calabaza-gigante', 'canasta-verduras', 'gallina-pollitos', 'casita-pajaros', 'colmena', 'costal-semillas', 'letreritos', 'botas-lluvia', 'canasta-manzanas', 'tendedero', 'invernadero', 'pozo', 'macetas-hierbas', 'cerca-flores', 'veleta', 'manzano', 'caracol', 'topo', 'barril-lluvia'],
}
REGALOS = {'galletas': 'tarro-galletas', 'cacao': 'taza-cacao'}   # lo que preparan la estufa y la olla mejoradas
AMIGOS = ['osito', 'zorro', 'conejo', 'ardilla', 'erizo', 'raton']


def cuadro(im, lado_final=360, aire=1.12):
    """La figura ya recortada, centrada en un cuadro con un poco de aire para el borde blanco."""
    caja = im.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox() or (0, 0, im.width, im.height)
    cx, cy = (caja[0] + caja[2]) / 2, (caja[1] + caja[3]) / 2
    lado = max(caja[2] - caja[0], caja[3] - caja[1]) * aire
    lienzo = Image.new('RGBA', (round(lado), round(lado)), (0, 0, 0, 0))
    lienzo.alpha_composite(im.crop(caja), (round(lado / 2 - (cx - caja[0])), round(lado / 2 - (cy - caja[1]))))
    return lienzo.resize((lado_final, lado_final), Image.LANCZOS), caja


def al_dia(salida, origen):
    return salida.exists() and salida.stat().st_mtime >= max(origen.stat().st_mtime, pathlib.Path(__file__).stat().st_mtime)


for mapa, nombres in MAPAS.items():
    fondo = LIBRO / 'gemini' / f'escenario-{mapa}.jpg'
    if fondo.exists():
        salida = RAIZ / 'assets' / 'ilustraciones' / f'escenario-{mapa}.webp'
        if not al_dia(salida, fondo):
            Image.open(fondo).convert('RGB').resize((1024, 1024), Image.LANCZOS).save(salida, 'WEBP', quality=84, method=6)
            print('listo el mapa', salida.name)
    for n in nombres:
        png = LIBRO / 'stickers' / f'sticker-{n}.png'
        salida = DESTINO / f'{mapa}-{n}.webp'
        if not png.exists() or al_dia(salida, png):
            continue
        con_borde(cuadro(Image.open(png).convert('RGBA'))[0]).save(salida, 'WEBP', quality=86, method=6)
        print('listo', salida.name)
for id_, n in REGALOS.items():
    png, salida = LIBRO / 'stickers' / f'sticker-{n}.png', DESTINO / f'regalo-{id_}.webp'
    if png.exists() and not al_dia(salida, png):
        con_borde(cuadro(Image.open(png).convert('RGBA'), 240)[0]).save(salida, 'WEBP', quality=86, method=6)
        print('listo', salida.name)
# Los amigos: salen de personajes-limpios (ya a escala entre ellos). Cada uno llena su cuadro, y su alto relativo al del
# osito (con orejas y todo) va a js/arte.js para que la app los dibuje con su tamaño.
altos = {}
for n in AMIGOS:
    png, salida = LIBRO / 'personajes-limpios' / f'{n}.png', DESTINO / f'amigo-{n}.webp'
    if not png.exists():
        continue
    im = Image.open(png).convert('RGBA')
    figura, caja = cuadro(im, 420, 1.08)
    altos[n] = max(caja[2] - caja[0], caja[3] - caja[1])
    if not al_dia(salida, png):
        con_borde(figura, 6).save(salida, 'WEBP', quality=88, method=6)
        print('listo', salida.name)
amigos = {n: round(a / altos['osito'], 3) for n, a in altos.items()} if 'osito' in altos else {}

# Miniaturas de las páginas del álbum (16-nov-2026, «la carga tiene que ser mínima»): el selector de páginas muestra un
# circulito de 40 px; con la miniatura no hace falta bajar el paisaje entero de un mapa que el alumno todavía no tiene.
for fondo in [RAIZ / 'assets' / 'ilustraciones' / 'casa-vacia.webp'] + sorted((RAIZ / 'assets' / 'ilustraciones').glob('escenario-*.webp')):
    if fondo.stem.endswith('-mini') or not fondo.exists():
        continue
    mini = fondo.with_name(fondo.stem + '-mini.webp')
    if not al_dia(mini, fondo):
        Image.open(fondo).convert('RGB').resize((120, 120), Image.LANCZOS).save(mini, 'WEBP', quality=80, method=6)
        print('lista la miniatura', mini.name)

ids = sorted(p.stem for p in DESTINO.glob('*.webp'))
(RAIZ / 'js' / 'arte.js').write_text(
    '/* Dibujos de la tienda y las insignias que ya existen en assets/arte/<id>.webp (los demás se ven como emoji).\n'
    '   BOSQUE_AMIGOS: el tamaño de cada amigo comparado con el osito. GENERADO por herramientas/arte.py. */\n'
    'window.BOSQUE_ARTE = ' + json.dumps(ids) + ';\nwindow.BOSQUE_AMIGOS = ' + json.dumps(amigos) + ';\n', encoding='utf-8', newline='\n')
print(len(ids), 'dibujos en la app')
