"""Modo Navidad (25-nov-2026, pedido de la dueña): prepara su dibujo «osito navidad» para la app.

  assets/ilustraciones/osito navidad.jpeg  (el original de la dueña, 1024 x 1024)
    -> assets/ilustraciones/osito-navidad.webp       la escena completa (entrada y la ilustración de arriba del mapa)
    -> assets/ilustraciones/osito-navidad-cara.webp  la cara con el gorro, para el circulito de la lección de hoy

Uso:  python herramientas/navidad.py
"""
from pathlib import Path
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ / 'assets' / 'ilustraciones' / 'osito navidad.jpeg'
CARA = (345, 215, 655, 525)   # cuadrado alrededor de la cara y el gorro, en píxeles del original

img = Image.open(ORIGEN).convert('RGB')
img.save(RAIZ / 'assets' / 'ilustraciones' / 'osito-navidad.webp', 'WEBP', quality=80, method=6)
img.crop(CARA).resize((160, 160), Image.LANCZOS).save(RAIZ / 'assets' / 'ilustraciones' / 'osito-navidad-cara.webp', 'WEBP', quality=85, method=6)
for n in ('osito-navidad.webp', 'osito-navidad-cara.webp'):
    p = RAIZ / 'assets' / 'ilustraciones' / n
    print(n, round(p.stat().st_size / 1024), 'KB')
