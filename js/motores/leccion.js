/* GENERADO por herramientas/copiar_motores.py desde página_Sprinkloud/practica/leccion.js: no editar a mano. */
window.Leccion = (function () {
'use strict';
  /* [tema, meta] de cada semana */
  var GUIA = [null,
    ['El pulso', 'Mantener el pulso 30 segundos con el metrónomo a 80, con palmas y en el pecho.'],
    ['Largo y corto: ta y ti-ti', 'Decir y palmear ritmos de 4 pulsos con ta (negra) y ti-ti (corcheas).'],
    ['El silencio', 'Respetar el silencio de negra (sh) dentro de un ritmo de 4 pulsos.'],
    ['Agudo y grave', 'Distinguir si un sonido sube o baja.'],
    ['Sol-mi: primeras notas cantadas', 'Cantar sol-mi y encontrarlas en tu instrumento.'],
    ['Ostinato y conjunto', 'Mantener un ritmo repetido mientras otro suena distinto.'],
    ['El pentagrama', 'Saber si una nota está en una línea o en un espacio.'],
    ['Clave de sol: sol, mi, la', 'Leer sol, mi y la en clave de sol.'],
    ['Do-re-mi', 'Ubicar Do, Re y Mi en el pentagrama y en tu instrumento.'],
    ['La escala de Do', 'Leer y tocar las notas de la escala de Do, subiendo y bajando.'],   // 7-nov-2026: también en el violín (do fijo; antes, la escala de Re)
    ['Figuras: redonda, blanca, negra, corchea', 'Saber cuánto dura cada figura.'],
    ['Compás: 2/4, 3/4 y 4/4', 'Marcar el pulso fuerte de cada compás.'],
    ['Primera lectura de 4 compases', 'Leer una melodía de 4 compases sin parar.'],
    ['Dictado rítmico', 'Escuchar un ritmo y escribirlo.'],
    ['El puntillo', 'Leer la blanca con puntillo y la negra con puntillo.'],
    ['Semicorcheas: ta-ka-di-mi', 'Tocar 4 semicorcheas parejas en un pulso.'],
    ['Combinaciones: ta-di-mi y ta-ka-di', 'Leer corchea con dos semicorcheas y al revés.'],
    ['Ligadura y síncopa', 'Tocar una síncopa sin acelerar.'],
    ['Coordinación: pulso y ritmo a la vez', 'Marcar el pulso con una mano y decir el ritmo con la voz.'],
    ['Clave de fa: líneas / Cuerda Sol', 'Leer y tocar las 5 líneas de la clave de fa: sol, si, re, fa, la. / Leer y tocar Sol, La, Si y Do en la cuerda Sol.'],
    ['Clave de fa: espacios / Cuerda Mi', 'Leer y tocar los 4 espacios de la clave de fa: la, do, mi, sol. / Leer y tocar Mi, Fa♯, Sol y La en la cuerda Mi.'],
    ['Líneas adicionales: clave de sol / Líneas adicionales abajo', 'Leer de un vistazo las notas con rayitas en clave de sol. / Leer de un vistazo las notas con rayitas debajo del pentagrama.'],
    ['Líneas adicionales: clave de fa / Líneas adicionales arriba', 'Leer de un vistazo las notas con rayitas en clave de fa. / Leer de un vistazo las notas con rayitas arriba del pentagrama.'],
    ['Lectura con todas las notas', 'Leer una melodía de 8 compases.'],
    ['Las 12 notas: sostenidos, bemoles y becuadro', 'Nombrar las 12 notas y saber qué hace el becuadro.'],
    ['Tono y semitono', 'Distinguir tono y semitono.'],
    ['Intervalos 1: segundas y terceras', 'Reconocer segundas y terceras de oído.'],
    ['Intervalos 2: cuarta, quinta, tritono y octava', 'Reconocer de oído la 4ª, la 5ª, el tritono y la 8ª.'],
    ['Intervalos 3: sextas, séptimas, aumentados y disminuidos', 'Nombrar los intervalos con sus semitonos y reconocer de oído al menos 6.'],
    ['La escala mayor: fórmula e intervalos', 'Construir una escala mayor con T-T-S-T-T-T-S.'],
    ['Escalas de Sol y Fa mayor y su armadura', 'Tocar Sol y Fa mayor y leer la armadura.'],
    ['Orden de los sostenidos: ¿en qué tonalidad estoy?', 'Decir el orden de los sostenidos y descubrir la tonalidad mayor de una armadura.'],
    ['Orden de los bemoles', 'Decir el orden de los bemoles y descubrir la tonalidad mayor de una armadura con bemoles.'],
    ['Triadas mayor y menor', 'Distinguir de oído un acorde mayor de uno menor.'],
    ['Triadas aumentada y disminuida', 'Reconocer las 4 triadas.'],
    ['Inversiones de acordes', 'Reconocer un acorde invertido, su nombre y la nota del bajo (Do/Mi).'],
    ['Armonizar la escala mayor', 'Conocer los 7 acordes de Do mayor.'],
    ['Centro tonal y reposo', 'Reconocer cuándo una canción llega a casa.'],
    ['Progresiones mayores: I, IV, V y vi', 'Acompañar una canción con I, IV, V y vi.'],
    ['Escala menor natural y su relativa', 'Distinguir mayor y menor de oído.'],
    ['Progresiones menores y escala menor armónica', 'Sentir el reposo en un acorde menor: i – iv – V – i (el V es mayor por la 7.ª subida).'],
    ['Círculo de quintas: mayores, menores y sus acordes', 'Ubicar cada tonalidad con su relativa menor y decir sus acordes.'],
    ['Escala pentatónica', 'Tocar la pentatónica mayor y menor.'],
    ['Improvisar con la pentatónica', 'Improvisar 8 compases y terminar en la nota casa.'],
    ['Compás de 6/8', 'Sentir el 6/8 en dos pulsos grandes.'],
    ['Dictado melódico', 'Escribir una melodía corta de oído.'],
    ['Dinámicas (pp a ff), articulaciones y ligaduras', 'Conocer de pp a ff, ligado, staccato y las dos ligaduras.'],
    ['Tempo y términos', 'Tocar en Lento, Andante y Allegro.'],
    ['La forma y las repeticiones (AB, ABA, casillas y calderón)', 'Reconocer las partes de una canción y leer las repeticiones.'],
    ['Lectura a primera vista y anacrusa', 'Leer 8 compases nuevos sin parar.'],
    ['Acorde de séptima de dominante', 'Sentir cómo el V7 pide volver al I.'],
    ['Proyecto: mi primera composición', 'Componer y tocar 8 compases.'],
    ['¿Qué es un modo?', 'Saber qué es un modo y nombrar los 7 con su tecla blanca.'],
    ['El modo eólico: la menor natural', 'Tocar el eólico y compararlo con el jónico.'],
    ['El modo mixolidio', 'Tocar el mixolidio y encontrar su nota característica.'],
    ['El modo dórico', 'Tocar el dórico y encontrar su nota característica.'],
    ['El modo lidio', 'Tocar el lidio y encontrar su nota característica.'],
    ['El modo frigio', 'Tocar el frigio y encontrar su nota característica.'],
    ['El modo locrio', 'Tocar el locrio y entender por qué suena inestable.'],
    ['Los 7 modos, del más brillante al más oscuro', 'Ordenar los 7 modos por su brillo y reconocerlos de oído.']
  ];

  /* ---------- Notas del juego (piano y violín): solo las que ya se vieron ---------- */
  var NOMBRE = { c: 'Do', d: 'Re', e: 'Mi', f: 'Fa', g: 'Sol', a: 'La', b: 'Si' };
  function notasPiano(s) {
    var sol = function (ks) { return ks.map(function (k) { return [k, 'treble']; }); };
    var fa = function (ks) { return ks.map(function (k) { return [k, 'bass']; }); };
    if (s <= 7) return sol(['e/4', 'g/4']);
    if (s === 8) return sol(['e/4', 'g/4', 'a/4']);
    if (s === 9) return sol(['c/4', 'd/4', 'e/4', 'g/4', 'a/4']);
    if (s <= 19) return sol(['c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5']);
    /* 20 a 23: solo las notas nuevas de cada lección, para aprenderlas de a poco (pedido de la dueña, 29-oct) */
    if (s === 20) return fa(['g/2', 'b/2', 'd/3', 'f/3', 'a/3']);                                 // clave de fa: líneas
    if (s === 21) return fa(['g/2', 'a/2', 'b/2', 'c/3', 'd/3', 'e/3', 'f/3', 'g/3', 'a/3']);       // + los espacios
    if (s === 22) return sol(['a/3', 'b/3', 'c/4', 'a/5', 'b/5']);                                // clave de sol: líneas adicionales
    if (s === 23) return fa(['f/2', 'b/3', 'c/4', 'd/4', 'e/4']);                                 // clave de fa: líneas adicionales
    /* 25 (Las 12 notas): las teclas negras con sus dos nombres y las blancas de la octava central (7-nov-2026) */
    if (s === 25) return [['c/4'], ['c/4', '#'], ['d/4', 'b'], ['d/4'], ['d/4', '#'], ['e/4', 'b'], ['e/4'], ['f/4'], ['f/4', '#'], ['g/4', 'b'], ['g/4'],
      ['g/4', '#'], ['a/4', 'b'], ['a/4'], ['a/4', '#'], ['b/4', 'b'], ['b/4']].map(function (n) { return [n[0], 'treble', n[1]]; });
    return null;   // desde la semana 24: todas (el modo normal de la app)
  }
  function notasViolin(s) {
    if (s <= 7) return ['e/4', 'g/4'];
    if (s === 8) return ['e/4', 'g/4', 'a/4'];
    if (s === 9) return ['c/4', 'd/4', 'e/4', 'g/4', 'a/4'];   // 7-nov-2026: do fijo, como el piano (Do es el dedo 3 de la cuerda Sol)
    if (s <= 19) return ['c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5'];   // la escala de Do (7-nov-2026: el libro pasó a do fijo; antes, la de Re con Fa♯ y Do♯)
    if (s === 20) return ['g/3', 'a/3', 'b/3', 'c/4'];                 // cuerda Sol
    if (s === 21) return ['e/5', 'g/5', 'a/5'];                        // cuerda Mi (sin Fa♯: el juego usa naturales)
    if (s === 22) return ['g/3', 'a/3', 'b/3', 'c/4', 'd/4', 'e/4'];   // líneas adicionales abajo, con las vecinas
    if (s === 23) return ['e/5', 'f/5', 'g/5', 'a/5', 'b/5'];          // líneas adicionales arriba
    /* 25 (Las 12 notas): primera posición, con sostenidos y bemoles («dedos bajos y altos») */
    if (s === 25) return ['d/4', 'd/4:#', 'e/4:b', 'e/4', 'f/4', 'f/4:#', 'g/4:b', 'g/4', 'g/4:#', 'a/4:b', 'a/4', 'a/4:#', 'b/4:b', 'b/4', 'c/5', 'c/5:#', 'd/5:b', 'd/5', 'd/5:#', 'e/5:b', 'e/5'];
    return null;
  }

  /* ---------- Intervalos en el piano (29-oct): las lecciones de intervalos se practican en el teclado ---------- */
  var INTERVALOS = { 26: [1, 2], 27: [1, 2, 3, 4], 28: [5, 6, 7, 12], 29: [8, 9, 10, 11] };   // 26: tono y semitono (7-nov)

  /* ---------- Lecciones del piano y del violín que no son «lee esta nota» (7-nov-2026) ----------
     Antes todas abrían el juego de leer notas, y desde la lección 24 con todas las notas: la de la pentatónica decía
     «toca la pentatónica» y pedía una nota suelta (reporte de la dueña). Ahora cada una abre su ejercicio:
     escala: tocar la escala nota por nota (practica/escalas.js); lineaEspacio: ¿línea o espacio?; tono: tono o semitono
     (en el piano es el juego de intervalos con 1 y 2 semitonos); lectura: la lectura hablada (decir las notas en ritmo,
     sin parar), que es lo que piden las lecciones de lectura de melodías. */
  var ESPECIAL = {
    piano: {
      7: { tipo: 'lineaEspacio' },
      13: { tipo: 'lectura' }, 24: { tipo: 'lectura' }, 50: { tipo: 'lectura' },
      30: { tipo: 'escala', escalas: ['mayor:Sol4', 'mayor:Sol4', 'mayor:Re4', 'mayor:Do4', 'mayor:Mi4'] },
      31: { tipo: 'escala', escalas: ['mayor:Sol4', 'mayor:Fa4'] },
      43: { tipo: 'escala', escalas: ['pentaMayor:Do4', 'pentaMayor:Fa♯4', 'pentaMayor:Sol4', 'pentaMenor:La4', 'pentaMenor:Mi4'] }
    },
    violin: {
      7: { tipo: 'lineaEspacio' }, 26: { tipo: 'tono' },
      13: { tipo: 'lectura' }, 24: { tipo: 'lectura' }, 50: { tipo: 'lectura' },
      30: { tipo: 'escala', escalas: ['mayor:Sol3', 'mayor:Sol3', 'mayor:Re4', 'mayor:La4', 'mayor:Do4'] },
      31: { tipo: 'escala', escalas: ['mayor:Sol3', 'mayor:Fa4'] },
      43: { tipo: 'escala', escalas: ['pentaMayor:Re4', 'pentaMenor:La4', 'pentaMayor:Sol3', 'pentaMenor:Mi4'] }
    }
  };
  /* modos: el ejercicio que pide el libro en cada lección (etapa 7) */
  var MODOS_LECCION = { 53: 'ver', 54: 'oido', 55: 'caracteristica', 56: 'oido', 57: 'oido', 58: 'caracteristica', 59: 'oido', 60: 'oido' };

  /* ---------- Ritmo: compás, tarjetas permitidas y un ritmo de ejemplo ---------- */
  var R = {
    1: { compas: '4/4', celdas: ['pan'], ejemplo: ['pan', 'pan', 'pan', 'pan', 'pan', 'pan', 'pan', 'pan'], tempo: 80, repetir: true },
    2: { compas: '4/4', celdas: ['pan', 'luna'], ejemplo: ['pan', 'luna', 'pan', 'pan', 'luna', 'luna', 'pan', 'pan'], tempo: 70 },
    3: { compas: '4/4', celdas: ['pan', 'luna', 's4'], ejemplo: ['pan', 'luna', 's4', 'pan', 'luna', 'pan', 's4', 'pan'], tempo: 70 },
    6: { compas: '4/4', celdas: ['pan', 'luna', 's4'], ejemplo: ['pan', 'luna', 'pan', 's4', 'pan', 'luna', 'pan', 's4'], tempo: 70, repetir: true },
    11: { compas: '4/4', celdas: ['pan', 'luna', 's4', 'bla2', 'red'], ejemplo: ['red', 'bla2', 'bla2', 'pan', 'pan', 'pan', 'pan', 'luna', 'luna', 'luna', 'luna'], tempo: 70 },
    12: { compas: '3/4', celdas: ['pan', 'luna', 's4', 'bla2'], ejemplo: ['pan', 'pan', 'pan', 'bla2', 'pan', 'pan', 'luna', 'pan', 'bla2', 's4'], tempo: 80 },
    14: { compas: '4/4', celdas: ['pan', 'luna', 's4', 'bla2'], ejemplo: [], tempo: 70 },
    15: { compas: '3/4', celdas: ['pan', 'luna', 's4', 'bla2', 'bla3', 'lee', 'y'], ejemplo: ['lee', 'y', 'pan', 'pan', 'luna', 'luna', 'bla3'], tempo: 70 },
    16: { compas: '4/4', celdas: ['pan', 'luna', 'choco', 's4', 'bla2'], ejemplo: ['luna', 'choco', 'luna', 'pan', 'choco', 'luna', 'choco', 'pan'], tempo: 60 },
    17: { compas: '4/4', celdas: ['pan', 'luna', 'choco', 'gran', 'cama', 's4', 'bla2'], ejemplo: ['pan', 'gran', 'cama', 'pan', 'cama', 'gran', 'bla2'], tempo: 60 },
    18: { latino: 'Cumbia', tempo: 90, repetir: true },
    19: { compas: '4/4', celdas: ['pan', 'luna', 'choco', 'gran', 'cama', 's4', 'bla2'], ejemplo: ['pan', 'luna', 'gran', 'bla2', 'cama', 'pan', 's4', 'pan'], tempo: 60 },
    44: { compas: '4/4', ejemplo: ['pan', 'pan', 'pan', 'pan', 'pan', 'pan', 'pan', 'pan'], tempo: 80, repetir: true },
    /* 7-nov-2026: dinámicas, tempo y forma tienen su propio ritmo de ejemplo y sus pasos */
    47: { compas: '4/4', ejemplo: ['pan', 'pan', 'luna', 'pan', 'pan', 'luna', 'pan', 'bla2'], tempo: 70, repetir: true },
    48: { compas: '4/4', ejemplo: ['pan', 'pan', 'pan', 'pan', 'pan', 'pan', 'pan', 'pan'], tempo: 60, repetir: true },
    49: { compas: '4/4', ejemplo: ['pan', 'luna', 'pan', 'pan', 'luna', 'luna', 'bla2', 'bla2', 'pan', 'pan', 'luna', 'pan', 'bla2', 'pan', 'luna', 'pan', 'pan', 'luna', 'luna', 'bla2'], tempo: 80 },
    45: { compas: '6/8', ejemplo: ['negp6', 'negp6', 'tres8', 'negp6', 'neg8', 'neg8', 'blap6'], tempo: 50 }
  };
  [4, 5, 7, 8, 9, 10].forEach(function (s) { R[s] = R[3]; });
  R[13] = R[11];
  /* desde la semana 20 (salvo las de arriba): todas las tarjetas, con el ejemplo de corcheas y semicorcheas */
  function ritmoDe(s) { return R[s] || { compas: '4/4', ejemplo: ['luna', 'choco', 'luna', 'pan', 'choco', 'luna', 'choco', 'pan'], tempo: 70 }; }
  return { GUIA, notasPiano, notasViolin, ritmoDe, NOMBRE };
})();
