"""El vestidor del osito: copia la lista de ropa (prendas.json) a todos lados (26-nov-2026).

prendas.json es la ÚNICA lista de prendas. Este script:
  1. escribe ROPA (entre /* ROPA:INICIO */ y /* ROPA:FIN */) en el servidor (Registro_Sprinkloud/maestros/Código.js)
     y en el motor de la prueba (js/api.js): los dos quedan iguales;
  2. escribe los pedidos de Gemini (Libro_Sprinkloud/herramientas/ilustraciones/etapa24.txt): la base y una línea
     `vestidor-<id>|@editar <pedido>` por prenda; la tarea diaria pide solo las que faltan;
  3. dice qué prendas ya tienen dibujo en la app (assets/vestidor/<id>.webp) y cuáles faltan.

Revisa antes de escribir: ids únicos y simples, ranuras que existen, precios enteros, pedido para cada una.
Uso: python herramientas/prendas.py           (escribe)
     python herramientas/prendas.py --revisar (solo revisa y cuenta, no escribe)
"""
import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
RAIZ = Path(__file__).resolve().parent.parent
SERVIDOR = RAIZ.parent / 'Registro_Sprinkloud' / 'maestros' / 'Código.js'
API = RAIZ / 'js' / 'api.js'
ETAPA = RAIZ.parent / 'Libro_Sprinkloud' / 'herramientas' / 'ilustraciones' / 'etapa24.txt'
RANURAS = ['medias', 'piernas', 'pies', 'torso', 'abrigo', 'cuello', 'muneca', 'cabeza']
BASE = ('vestidor-base|@editar Quítale la bufanda de cuadros: el cuello y el pecho quedan con su pelaje café y su pancita '
        'color crema, igual que el resto del cuerpo, como si nunca hubiera tenido bufanda.')


def leer():
    datos = json.loads((RAIZ / 'prendas.json').read_text(encoding='utf-8'))
    ps, vistos, errores = datos['prendas'], set(), []
    for p in ps:
        i = p.get('id', '')
        if not re.fullmatch(r'[a-z0-9]+(-[a-z0-9]+)*', i): errores.append(f'id raro: {i!r} (minúsculas, números y guiones)')
        if i in vistos: errores.append(f'id repetido: {i}')
        vistos.add(i)
        if p.get('ranura') not in RANURAS: errores.append(f'{i}: ranura {p.get("ranura")!r} no existe ({", ".join(RANURAS)})')
        if not isinstance(p.get('precio'), int) or p['precio'] < 0: errores.append(f'{i}: precio tiene que ser un número entero')
        if not (p.get('nombre') or '').strip(): errores.append(f'{i}: falta el nombre')
        if p.get('gemini', True) and len((p.get('pedido') or '').strip()) < 20: errores.append(f'{i}: falta el pedido para Gemini')
        if '|' in (p.get('pedido') or ''): errores.append(f'{i}: el pedido no puede tener «|»')
    if not any(p['id'] == 'bufanda' and p['precio'] == 0 for p in ps): errores.append('falta la bufanda gratis (id bufanda, precio 0)')
    if errores:
        print('NO SE ESCRIBIÓ NADA. Arregla prendas.json:'); [print(' -', e) for e in errores]; sys.exit(1)
    return ps


def js(texto):
    return "'" + texto.replace('\\', '\\\\').replace("'", "\\'") + "'"


def bloque(ps, ind):
    filas = [f"{ind}  {{ id: {js(p['id'])}, nombre: {js(p['nombre'])}, ranura: {js(p['ranura'])}, precio: {p['precio']} }}" for p in ps]
    return f"{ind}const ROPA = [\n" + ',\n'.join(filas) + f"\n{ind}];\n"


def poner(ruta, ps, ind):
    s = ruta.read_text(encoding='utf-8')
    m = re.search(r'(/\* ROPA:INICIO[^*]*\*/\n)(.*?)(\s*/\* ROPA:FIN \*/)', s, re.S)
    if not m: print('No encontré las marcas ROPA:INICIO / ROPA:FIN en', ruta); sys.exit(1)
    nuevo = s[:m.start(2)] + bloque(ps, ind).rstrip('\n') + s[m.end(2):]
    if nuevo != s:
        ruta.write_text(nuevo, encoding='utf-8', newline='')
        print('ROPA al día en', ruta.name)


def main():
    ps = leer()
    con_dibujo = [p['id'] for p in ps if (RAIZ / 'assets' / 'vestidor' / f"{p['id']}.webp").exists()]
    faltan = [p['id'] for p in ps if p['id'] not in con_dibujo]
    por_ranura = {r: sum(1 for p in ps if p['ranura'] == r) for r in RANURAS}
    print(f"{len(ps)} prendas · " + ' · '.join(f'{r} {n}' for r, n in por_ranura.items()))
    print(f'con dibujo en la app ({len(con_dibujo)}):', ', '.join(con_dibujo) or '—')
    print(f'faltan ({len(faltan)}):', ', '.join(faltan) or '—')
    if '--revisar' in sys.argv:
        return
    poner(SERVIDOR, ps, '')
    poner(API, ps, '  ')
    cab = ('# Etapa 24: el vestidor del osito. GENERADO por App_Bosque/herramientas/prendas.py desde App_Bosque/prendas.json:\n'
           '# no se edita a mano (ver la skill /prendas-osito). «@editar» edita el dibujo del osito (ilustraciones.ps1): primero la\n'
           '# base sin bufanda, después cada prenda sobre la base. vestidor.py recorta solo la prenda (img/vestidor/prendas/).\n')
    lineas = [BASE] + [f"vestidor-{p['id']}|@editar {p['pedido'].strip()}" for p in ps if p.get('gemini', True)]
    ETAPA.write_text(cab + '\n'.join(lineas) + '\n', encoding='utf-8', newline='\n')
    print('pedidos de Gemini al día:', ETAPA.name, f'({len(lineas)} líneas)')


if __name__ == '__main__':
    main()
