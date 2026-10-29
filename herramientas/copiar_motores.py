"""Copia los motores de ejercicios del sitio público (página_Sprinkloud/practica) a js/motores/.

El sitio no deja abrirse en iframes ni avisa los resultados, así que la app trae su propia copia de la lógica:
la hoja de práctica, la lectura hablada, las células de ritmo, el oído y las tablas de cada lección.
Se vuelve a correr cuando cambia el sitio:  python herramientas/copiar_motores.py
"""
import pathlib, re

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SITIO = RAIZ.parent / 'página_Sprinkloud' / 'practica'
DESTINO = RAIZ / 'js' / 'motores'
AVISO = '/* GENERADO por herramientas/copiar_motores.py desde página_Sprinkloud/practica/{0}: no editar a mano. */\n'


def lineas(archivo):
    return (SITIO / archivo).read_text(encoding='utf-8').split('\n')


def entre(ls, desde, hasta, incluir_hasta=False):
    """Las líneas desde la primera que empieza con `desde` hasta la que empieza con `hasta`."""
    i = next(k for k, l in enumerate(ls) if l.startswith(desde))
    j = next(k for k, l in enumerate(ls) if k > i and l.startswith(hasta))
    return '\n'.join(ls[i:j + 1 if incluir_hasta else j])


def escribir(nombre, texto):
    (DESTINO / nombre).write_text(texto, encoding='utf-8', newline='\n')
    print('listo', nombre, len(texto), 'caracteres')


DESTINO.mkdir(parents=True, exist_ok=True)

# 1. Hoja de práctica: de la guía hasta tieneHoja (sin la página que la arma e imprime)
h = lineas('hojas.html')
codigo = entre(h, '/* ---------- La guía (semana', 'const tieneHoja', incluir_hasta=True)
escribir('hoja.js', AVISO.format('hojas.html') + """window.Hoja = (function () {
'use strict';
""" + codigo + """

/* La hoja de una lección dentro de la app: las mismas preguntas, con la semilla del día */
function armar(contenedor, s, ins, semillaDelDia) {
  campos = []; idCampo = 0; semilla = semillaDelDia;
  contenedor.replaceChildren(...ejerciciosDe(s, ins));
  return campos.length;
}
/* Marca cada respuesta bien o mal; las vacías cuentan como no logradas */
function revisar() {
  let bien = 0, total = 0;
  campos.forEach(c => {
    const v = c.dibujo ? null : c.el.value;
    total++;
    if (!c.dibujo && v === '') { c.el.classList.remove('ok'); c.el.classList.add('mal'); return; }
    const ok = c.ok(v);
    if (ok) bien++;
    c.el.classList.toggle('ok', ok); c.el.classList.toggle('mal', !ok);
  });
  return { bien, total };
}
function soluciones() {
  document.querySelectorAll('.solucion').forEach(x => x.remove());
  campos.forEach(c => { if (!c.el.classList.contains('ok')) c.el.closest('.respuestas, .item').append(el('div', { class: 'solucion', text: c.solucion })); });
}
return { GUIA, armar, revisar, soluciones, tieneHoja, SIN_HOJA };
})();
""")

# 2. Lectura hablada: el archivo entero, con un aviso al terminar (para sumar los aciertos)
lec = (SITIO / 'lectura.js').read_text(encoding='utf-8')
reemplazos = [
    ("    est.resultado = alinear(esperadas, sils).bien;\n    var ok = est.resultado.filter(Boolean).length;\n",
     "    est.resultado = alinear(esperadas, sils).bien;\n    var ok = est.resultado.filter(Boolean).length;\n"
     "    if (est.alTerminar) est.alTerminar(ok, 8);   /* la app del bosque suma los aciertos */\n"),
    ("      est.clave = o.clave || 'treble'; est.pool = o.notas.slice(); est.nombres = false;\n",
     "      est.clave = o.clave || 'treble'; est.pool = o.notas.slice(); est.nombres = false; est.alTerminar = o.alTerminar || null;\n"),
]
for a, b in reemplazos:
    assert a in lec, a[:60]
    lec = lec.replace(a, b, 1)
escribir('lectura.js', AVISO.format('lectura.js') + lec)

# 3. Células de ritmo y su dibujo en SVG (sílabas ta, ti-ti de la guía)
r = lineas('ritmo.html')
codigo = entre(r, 'const CELLS = [', '/* nombre de las figuras')
escribir('ritmo.js', AVISO.format('ritmo.html') + """window.Ritmo = (function () {
'use strict';
""" + codigo + """
return { CELLS, SILABAS, COMPASES, byId, cellDur, noteDur, cellSVG };
})();
""")

# 4. Oído: intervalos, triadas, mayor o menor, tensión o reposo (con azar que se puede sembrar)
o = lineas('oido.html')
codigo = entre(o, 'const INTERVALOS = [', '/* ---------- Teclado que muestra')
codigo = codigo.replace('Math.random() < .5', 'rnd() < .5')
escribir('oido.js', AVISO.format('oido.html') + """window.Oido = (function () {
'use strict';
const NOMBRES = ['Do', 'Do♯', 'Re', 'Mi♭', 'Mi', 'Fa', 'Fa♯', 'Sol', 'La♭', 'La', 'Si♭', 'Si'];
const nombre = m => NOMBRES[((m % 12) + 12) % 12];
let rnd = Math.random;
const azar = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const uno = arr => arr[Math.floor(rnd() * arr.length)];
""" + codigo + """
return { MODOS, NIVELES_INT, nombre, sembrar(f) { rnd = f; } };
})();
""")

# 5. Lección: tema y meta, notas aprendidas y ritmo de cada semana
le = lineas('leccion.js')
codigo = entre(le, '  /* [tema, meta] de cada semana */', '  function ritmoDe(s)', incluir_hasta=True)
escribir('leccion.js', AVISO.format('leccion.js') + """window.Leccion = (function () {
'use strict';
""" + codigo + """
  return { GUIA, notasPiano, notasViolin, ritmoDe, NOMBRE };
})();
""")
