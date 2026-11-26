"""El vestidor del osito (26-nov-2026): pasa a la app el osito sin ropa y cada prenda.

Toma lo que arma Libro_Sprinkloud/herramientas/vestidor.py (img/vestidor/base.png y prendas/<id>.png, todas del mismo
lienzo, así se apilan sin acomodarlas) y deja:
  assets/vestidor/base.webp          el osito sin ropa (700 px de ancho)
  assets/vestidor/<id>.webp          cada prenda en el lienzo entero (casi todo transparente: pesa poco)
  assets/vestidor/<id>-mini.webp     la prenda sola, recortada, para su botón (200 px)
  js/ropa.js                         la lista de prendas que ya tienen dibujo (window.BOSQUE_ROPA_ARTE)

Uso: python herramientas/vestidor_app.py
"""
import json
import sys
from pathlib import Path

from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ.parent / 'Libro_Sprinkloud' / 'img' / 'vestidor'
SALIDA = RAIZ / 'assets' / 'vestidor'
ANCHO = 700


def achicar(im):
    return im.resize((ANCHO, round(im.height * ANCHO / im.width)), Image.LANCZOS)


def mini(im, lado=200):
    caja = im.getchannel('A').point(lambda a: 255 if a > 40 else 0).getbbox()
    p = im.crop(caja) if caja else im
    p.thumbnail((lado, lado), Image.LANCZOS)
    c = Image.new('RGBA', (lado, lado), (0, 0, 0, 0)); c.paste(p, ((lado - p.width) // 2, (lado - p.height) // 2), p)
    return c


def main():
    SALIDA.mkdir(parents=True, exist_ok=True)
    base = Image.open(ORIGEN / 'base.png').convert('RGBA')
    achicar(base).save(SALIDA / 'base.webp', quality=86, method=6)
    ids = []
    for p in sorted((ORIGEN / 'prendas').glob('*.png')):
        im = Image.open(p).convert('RGBA')
        if im.size != base.size:
            print('OJO: otro tamaño, no se usa:', p.name); continue
        achicar(im).save(SALIDA / (p.stem + '.webp'), quality=86, method=6)
        mini(im).save(SALIDA / (p.stem + '-mini.webp'), quality=86, method=6)
        ids.append(p.stem)
        print('prenda lista:', p.stem, round((SALIDA / (p.stem + '.webp')).stat().st_size / 1024), 'KB')
    (RAIZ / 'js' / 'ropa.js').write_text(
        '/* Las prendas del vestidor que ya tienen dibujo en assets/vestidor/ (las demás no se venden todavía).\n'
        '   GENERADO por herramientas/vestidor_app.py. */\n'
        'window.BOSQUE_ROPA_ARTE = ' + json.dumps(ids, ensure_ascii=False) + ';\n', encoding='utf-8')
    print(len(ids), 'prendas · base', round((SALIDA / 'base.webp').stat().st_size / 1024), 'KB')


if __name__ == '__main__':
    main()
