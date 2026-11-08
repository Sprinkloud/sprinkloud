/* GENERADO por herramientas/copiar_motores.py desde página_Sprinkloud/practica/oido.html: no editar a mano. */
window.Oido = (function () {
'use strict';
const NOMBRES = ['Do', 'Do♯', 'Re', 'Mi♭', 'Mi', 'Fa', 'Fa♯', 'Sol', 'La♭', 'La', 'Si♭', 'Si'];
const nombre = m => NOMBRES[((m % 12) + 12) % 12];
let rnd = Math.random;
const azar = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const uno = arr => arr[Math.floor(rnd() * arr.length)];
const INTERVALOS = [
  { n: '2ª menor', st: 1 }, { n: '2ª mayor', st: 2 }, { n: '3ª menor', st: 3 }, { n: '3ª mayor', st: 4 },
  { n: '4ª justa', st: 5 }, { n: 'Tritono', st: 6 }, { n: '5ª justa', st: 7 }, { n: '6ª menor', st: 8 },
  { n: '6ª mayor', st: 9 }, { n: '7ª menor', st: 10 }, { n: '7ª mayor', st: 11 }, { n: '8ª justa', st: 12 }
];
const NIVELES_INT = {
  'segundas y terceras': [1, 2, 3, 4],
  'cuartas, quintas y octavas': [5, 6, 7, 12],
  'todos': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
};
const TRIADAS = { Mayor: [0, 4, 7], Menor: [0, 3, 7], Aumentada: [0, 4, 8], Disminuida: [0, 3, 6] };

const MODOS = {
  sube: {
    nombre: '¿Sube o baja?', guia: 'Etapa 1 · Lección 4 de la guía: agudo y grave.',
    pregunta: () => '¿La segunda nota sube o baja?',
    crear() {
      const a = azar(55, 72); let b; do { b = azar(55, 76); } while (Math.abs(b - a) < 2);
      return { pasos: [[[a], .8], [[b], 1.1]], notas: [a, b], correcta: b > a ? 'Sube' : 'Baja', opciones: ['Sube', 'Baja'] };
    }
  },
  intervalos: {
    nombre: 'Intervalos', guia: 'Etapa 3 · Lección 13 y Etapa 4 · Lecciones 1 y 2.',
    opciones: { nivel: Object.keys(NIVELES_INT), forma: ['Melódico (una y otra)', 'Armónico (juntas)'] },
    pregunta: () => '¿Qué intervalo sonó?',
    crear(o) {
      const lista = INTERVALOS.filter(i => NIVELES_INT[o.nivel].includes(i.st));
      const iv = uno(lista), a = azar(55, 67), b = a + iv.st;
      const pasos = /Arm/.test(o.forma) ? [[[a, b], 1.6]] : [[[a], .8], [[b], 1.2]];
      return { pasos, notas: [a, b], correcta: iv.n, opciones: lista.map(i => i.n), detalle: iv.st + (iv.st === 1 ? ' semitono' : ' semitonos') };
    }
  },
  mayorMenor: {
    nombre: '¿Mayor o menor?', guia: 'Etapa 4 · Lección 7 y Etapa 5 · Lección 3.',
    opciones: { forma: ['Acorde y luego arpegio', 'Solo el acorde', 'Solo el arpegio'] },
    pregunta: () => '¿El acorde es mayor o menor?',
    crear(o) { return acorde(['Mayor', 'Menor'], o.forma); }
  },
  triadas: {
    nombre: 'Las 4 triadas', guia: 'Etapa 4 · Lección 8 de la guía.',
    opciones: { forma: ['Acorde y luego arpegio', 'Solo el acorde', 'Solo el arpegio'] },
    pregunta: () => '¿Qué tipo de triada sonó?',
    crear(o) { return acorde(Object.keys(TRIADAS), o.forma); }
  },
  reposo: {
    nombre: '¿Tensión o reposo?', guia: 'Etapa 5 · Lección 1 y Etapa 6 · Lección 5.',
    pregunta: () => '¿El final suena a reposo (llegó a casa) o a tensión (pide seguir)?',
    crear() {
      const t = azar(55, 62), I = [t, t + 4, t + 7], IV = [t + 5, t + 9, t + 12], V = [t + 7, t + 11, t + 14], V7 = [t + 7, t + 11, t + 14, t + 17], vi = [t + 9, t + 12, t + 16];
      const reposo = rnd() < .5;
      const final = reposo ? I : uno([V, V7]);
      const pasos = [[I, .8], [uno([IV, vi]), .8], [V7, .8], [final, 1.6]].map(([n, d]) => [n.concat([n[0] - 12]), d]);
      return { pasos, notas: final, correcta: reposo ? 'Reposo' : 'Tensión', opciones: ['Reposo', 'Tensión'], detalle: reposo ? 'termina en el acorde I' : 'termina en el acorde V' };
    }
  },
  /* 7-nov-2026: las lecciones de progresiones y el dictado melódico abrían «¿mayor o menor?» y los intervalos, que no
     practican su tema. Estos tres ejercicios sí. */
  progresiones: {
    nombre: 'Progresiones: I, IV, V y vi', guia: 'Etapa 5 · Lección 2: los cuatro acordes que acompañan cientos de canciones.',
    pregunta: () => 'Primero suena la casa (I). ¿Qué acorde viene después?',
    crear() {
      const t = azar(55, 62), GRADOS = { I: [0, 4, 7], IV: [5, 9, 12], V: [7, 11, 14], vi: [9, 12, 16] };
      const g = uno(['IV', 'V', 'vi', 'IV', 'V', 'vi', 'I']), ac = GRADOS[g].map(x => t + x), I = GRADOS.I.map(x => t + x);
      const raiz = t + GRADOS[g][0];
      return { pasos: [[I.concat([t - 12]), 1.1], [ac.concat([raiz - 12]), 1.6]], notas: ac, correcta: g, opciones: ['I', 'IV', 'V', 'vi'],
        detalle: nombre(raiz) + (g === 'vi' ? ' menor' : ' mayor') + ' en ' + nombre(t) + ' mayor' };
    }
  },
  reposoMenor: {
    nombre: '¿Tensión o reposo? En menor', guia: 'Etapa 5 · Lección 4: la casa es un acorde menor.',
    pregunta: () => 'En menor: ¿el final llega a casa (reposo) o pide seguir (tensión)?',
    crear() {
      const t = azar(55, 62), i = [t, t + 3, t + 7], iv = [t + 5, t + 8, t + 12], V = [t + 7, t + 11, t + 14];
      const reposo = rnd() < .5, final = reposo ? i : V;
      const pasos = [[i, .8], [iv, .8], [V, .8], [final, 1.6]].map(([n, d]) => [n.concat([n[0] - 12]), d]);
      return { pasos, notas: final, correcta: reposo ? 'Reposo' : 'Tensión', opciones: ['Reposo', 'Tensión'],
        detalle: reposo ? 'termina en ' + nombre(t) + ' menor, la casa (i)' : 'termina en ' + nombre(t + 7) + ' mayor (V)' };
    }
  },
  dictado: {
    nombre: 'Dictado melódico', guia: 'Etapa 5 · Lección 9: escucha, canta y elige la melodía que sonó.',
    pregunta: () => 'Empieza en Do. ¿Qué melodía sonó?',
    crear() {
      // 4 notas de Do mayor, de Do a Sol, por pasos y saltos pequeños; las otras opciones cambian una sola nota
      const ESC = [60, 62, 64, 65, 67], N = ['Do', 'Re', 'Mi', 'Fa', 'Sol'];
      const mel = [0]; while (mel.length < 4) { const s = mel[mel.length - 1] + uno([-2, -1, 1, 1, 2]); if (s >= 0 && s <= 4 && s !== mel[mel.length - 1]) mel.push(s); }
      const texto = m => m.map(i => N[i]).join(' – '), correcta = texto(mel), ops = new Set([correcta]);
      let intentos = 0;
      while (ops.size < 4 && intentos++ < 50) { const o = mel.slice(), k = azar(1, 3); o[k] = uno([0, 1, 2, 3, 4].filter(x => x !== mel[k] && x !== o[k - 1])); ops.add(texto(o)); }
      const opciones = [...ops];   // mezcladas con azar() (el bosque lo siembra)
      for (let i = opciones.length - 1; i > 0; i--) { const j = azar(0, i); [opciones[i], opciones[j]] = [opciones[j], opciones[i]]; }
      return { pasos: mel.map(i => [[ESC[i]], .6]), notas: mel.map(i => ESC[i]), correcta, opciones };
    }
  }
};
function acorde(tipos, forma) {
  const tipo = uno(tipos), r = azar(55, 64), notas = TRIADAS[tipo].map(x => r + x);
  const pasos = forma === 'Solo el arpegio' ? notas.map(m => [[m], .55]) : forma === 'Solo el acorde' ? [[notas, 1.6]] : [[notas, 1.3]].concat(notas.map(m => [[m], .5]));
  return { pasos, notas, correcta: tipo, opciones: tipos, detalle: nombre(r) + ' ' + tipo.toLowerCase() };
}

return { MODOS, NIVELES_INT, nombre, sembrar(f) { rnd = f; } };
})();
