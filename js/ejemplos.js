/* Ejemplos que suenan en los libros de la biblioteca (pedido de la dueña, 29-oct-2026: «que los libros muestren los
   ejemplos de lo que van enseñando, así no es solo una lectura»). Debajo del dibujo de cada lección aparecen botones 🔊
   que tocan lo mismo que muestra el dibujo (salen de Libro_Sprinkloud/plantilla/diagramas.html).
   EJEMPLOS[semana] = [[etiqueta, partitura], …], o { piano: […], violin: […] } si cambia según el instrumento.
   La partitura se escribe así (la lee Ejemplos.tocar):
     c4 e4 g4   notas (♯ con #, ♭ con b: f#4, bb3)          c4+e4+g4   acorde
     :2  :0.5   duración en pulsos (sin nada, 1 pulso)       r          silencio
     x  X       clic del pulso (X, el fuerte)                 o          golpe de tambor (el ritmo)
     @80        tempo (pulsos por minuto)
     !p !mf !f  volumen                                       &          otra voz a la vez (melodía & acompañamiento) */
window.Ejemplos = (function () {
  'use strict';
  const MODO = (raiz, st) => st.concat([12]).map(s => raiz + s).map(m => NOMBRE_MIDI(m)).join(' ') + ':2';
  function NOMBRE_MIDI(m) { const n = ['c', 'c#', 'd', 'eb', 'e', 'f', 'f#', 'g', 'ab', 'a', 'bb', 'b'][m % 12]; return n + (Math.floor(m / 12) - 1); }
  const MODOS = { jonico: [0, 2, 4, 5, 7, 9, 11], dorico: [0, 2, 3, 5, 7, 9, 10], frigio: [0, 1, 3, 5, 7, 8, 10], lidio: [0, 2, 4, 6, 7, 9, 11],
    mixolidio: [0, 2, 4, 5, 7, 9, 10], eolico: [0, 2, 3, 5, 7, 8, 10], locrio: [0, 1, 3, 5, 6, 8, 10] };
  const E = {
    1: [['El pulso', '@80 X x x x X x x x']],
    2: [['ta', '@70 o'], ['ti-ti', '@70 o:0.5 o:0.5'], ['El ritmo', '@70 o o o:0.5 o:0.5 o']],
    3: [['El ritmo con silencio', '@70 o o:0.5 o:0.5 r o']],
    4: { piano: [['Grave', 'c2:2'], ['Agudo', 'c6:2'], ['De grave a agudo', '@160 c2 g2 c3 g3 c4 g4 c5 g5 c6:2']], violin: [['Cuerda Sol (grave)', 'g3:2'], ['Cuerda Mi (aguda)', 'e5:2'], ['Las 4 cuerdas', '@60 g3 d4 a4 e5:2']] },
    5: [['Sol-mi', '@80 g4 e4 g4 e4'], ['Cu-cú', '@80 g4 e4:2']],
    6: [['Melodía + ostinato', '@90 c4 c4 g4 g4 a4 a4 g4:2 & o o:0.5 o:0.5 o r o o:0.5 o:0.5 o r']],
    7: { piano: [['En la línea 3 (Si)', 'b4:2'], ['En el espacio 1 (Fa)', 'f4:2']], violin: [['Las cuerdas al aire', '@60 g3 d4 a4 e5:2']] },
    8: [['Mi, sol y la', '@80 e4 g4 a4:2'], ['Una melodía', '@90 g4 e4 g4 a4 g4 e4:2']],
    9: { piano: [['Do-re-mi', '@80 c4 d4 e4:2'], ['Mi-re-do', '@80 e4 d4 c4:2']], violin: [['Do-re-mi en la cuerda Re', '@80 d4 e4 f#4:2'], ['Mi-re-do', '@80 f#4 e4 d4:2']] },
    10: { piano: [['La escala de Do', '@100 c4 d4 e4 f4 g4 a4 b4 c5:2'], ['Bajando', '@100 c5 b4 a4 g4 f4 e4 d4 c4:2']], violin: [['La escala de Re', '@100 d4 e4 f#4 g4 a4 b4 c#5 d5:2'], ['Bajando', '@100 d5 c#5 b4 a4 g4 f#4 e4 d4:2']] },
    11: [['Redonda (4 pulsos)', '@80 g4:4 & X x x x'], ['Blanca (2 pulsos)', '@80 g4:2 g4:2 & X x x x'], ['Negra (1 pulso)', '@80 g4 g4 g4 g4 & X x x x'], ['Corcheas (½ pulso)', '@80 g4:0.5 g4:0.5 g4:0.5 g4:0.5 g4:0.5 g4:0.5 g4:0.5 g4:0.5 & X x x x']],
    12: [['2/4', '@90 X x X x'], ['3/4', '@90 X x x X x x'], ['4/4', '@90 X x x x X x x x']],
    13: { piano: [['La melodía', '@90 c4 c4 g4 g4 a4 a4 g4:2 f4 f4 e4 e4 d4 d4 c4:2']], violin: [['La melodía', '@90 d4 d4 a4 a4 b4 b4 a4:2 g4 g4 f#4 f#4 e4 e4 d4:2']] },
    14: [['Negra', '@70 o'], ['Corcheas', '@70 o:0.5 o:0.5'], ['Silencio (ta – sh – ta)', '@70 o r o'], ['Blanca', '@70 g4:2']],
    15: [['Blanca', '@80 g4:2'], ['Blanca con puntillo', '@80 g4:3'], ['Negra con puntillo + corchea', '@80 g4:1.5 g4:0.5'], ['El ritmo en 3/4', '@80 g4:3 g4 g4 g4 g4:1.5 g4:0.5 g4 g4:3']],
    16: [['1 sonido (ta)', '@60 o'], ['2 sonidos (ti-ti)', '@60 o:0.5 o:0.5'], ['4 sonidos (ta-ka-di-mi)', '@60 o:0.25 o:0.25 o:0.25 o:0.25']],
    17: [['ta di-mi', '@60 o:0.5 o:0.25 o:0.25'], ['ta-ka di', '@60 o:0.25 o:0.25 o:0.5'], ['El ritmo', '@60 o o:0.5 o:0.25 o:0.25 o:0.25 o:0.25 o:0.5 o o:0.25 o:0.25 o:0.5 o:0.5 o:0.25 o:0.25 g4:2']],
    18: [['Con ligadura', '@80 g4 g4:2 g4'], ['La síncopa', '@80 g4:0.5 g4 g4:0.5 g4 g4 g4:0.5 g4 g4:0.5 g4:2']],
    19: [['Ritmo y pulso a la vez', '@80 g4 g4:0.5 g4:0.5 g4:2 g4:0.5 g4:0.5 g4 r g4 & X x x x X x x x']],
    20: { piano: [['Las líneas de la clave de fa', '@70 g2 b2 d3 f3 a3:2']], violin: [['La cuerda Sol', '@70 g3 a3 b3 c4:2']] },
    21: { piano: [['Los espacios de la clave de fa', '@70 a2 c3 e3 g3:2'], ['Líneas y espacios', '@100 g2 a2 b2 c3 d3 e3 f3 g3 a3:2']], violin: [['La cuerda Mi', '@70 e5 f#5 g5 a5:2']] },
    22: { piano: [['Líneas adicionales en clave de sol', '@70 a3 b3 c4 a5 b5:2']], violin: [['Líneas adicionales abajo', '@70 c4 b3 a3 g3:2']] },
    23: { piano: [['Líneas adicionales en clave de fa', '@70 f2 b3 c4 d4 e4:2']], violin: [['Líneas adicionales arriba', '@70 g5 a5 b5:2']] },
    24: { piano: [['Las dos manos', '@90 e4 e4 f4 g4 g4 f4 e4 d4 c4 c4 d4 e4 e4:1.5 d4:0.5 d4:2 & c3:4 g2:4 c3:4 g2:4']], violin: [['La melodía', '@90 f#4 f#4 g4 a4 a4 g4 f#4 e4 d4 d4 e4 f#4 f#4:1.5 e4:0.5 e4:2']] },
    25: [['Las 12 notas', '@140 c4 c#4 d4 eb4 e4 f4 f#4 g4 ab4 a4 bb4 b4 c5:2']],
    26: [['Tono (Do-Re)', '@70 c4 d4 c4+d4:2'], ['Semitono (Mi-Fa)', '@70 e4 f4 e4+f4:2']],
    27: [['2ª menor', '@70 e4 f4 e4+f4:2'], ['2ª mayor', '@70 c4 d4 c4+d4:2'], ['3ª menor', '@70 e4 g4 e4+g4:2'], ['3ª mayor', '@70 c4 e4 c4+e4:2']],
    28: [['4ª justa', '@70 c4 f4 c4+f4:2'], ['Tritono', '@70 f4 b4 f4+b4:2'], ['5ª justa', '@70 c4 g4 c4+g4:2'], ['Octava', '@70 c4 c5 c4+c5:2']],
    29: [['6ª menor', '@70 c4 ab4 c4+ab4:2'], ['6ª mayor', '@70 c4 a4 c4+a4:2'], ['7ª menor', '@70 c4 bb4 c4+bb4:2'], ['7ª mayor', '@70 c4 b4 c4+b4:2']],
    30: { piano: [['Sol mayor (T-T-S-T-T-T-S)', '@100 g3 a3 b3 c4 d4 e4 f#4 g4:2']], violin: [['Sol mayor (T-T-S-T-T-T-S)', '@100 g3 a3 b3 c4 d4 e4 f#4 g4:2']] },
    31: [['Sol mayor (Fa♯)', '@100 g4 a4 b4 c5 d5 e5 f#5 g5:2'], ['Fa mayor (Si♭)', '@100 f4 g4 a4 bb4 c5 d5 e5 f5:2']],
    32: [['Re mayor (Fa♯ y Do♯)', '@100 d4 e4 f#4 g4 a4 b4 c#5 d5:2']],
    33: [['Mi♭ mayor (Si♭, Mi♭ y La♭)', '@100 eb4 f4 g4 ab4 bb4 c5 d5 eb5:2']],
    34: { piano: [['Do mayor (4 + 3)', '@80 c4 e4 g4 c4+e4+g4:2'], ['La menor (3 + 4)', '@80 a4 c5 e5 a4+c5+e5:2']], violin: [['Re mayor', '@90 d4 f#4 a4 d5:2'], ['La menor', '@90 a4 c5 e5 a5:2']] },
    35: { piano: [['Mayor', '@80 c4+e4+g4:2'], ['Menor', '@80 c4+eb4+g4:2'], ['Aumentada', '@80 c4+e4+g#4:2'], ['Disminuida', '@80 c4+eb4+gb4:2']], violin: [['Mayor', '@90 d4 f#4 a4:2'], ['Menor', '@90 d4 f4 a4:2'], ['Aumentada', '@90 d4 f#4 a#4:2'], ['Disminuida', '@90 d4 f4 ab4:2']] },
    36: [['Fundamental (Do)', '@80 c4+e4+g4:2'], ['1ª inversión (Do/Mi)', '@80 e4+g4+c5:2'], ['2ª inversión (Do/Sol)', '@80 g4+c5+e5:2'], ['Do – Fa/Do – Sol/Si – Do', '@70 c4+e4+g4:2 c4+f4+a4:2 b3+d4+g4:2 c4+e4+g4:2']],
    37: { piano: [['Los 7 acordes de Do mayor', '@70 c4+e4+g4 d4+f4+a4 e4+g4+b4 f4+a4+c5 g4+b4+d5 a4+c5+e5 b4+d5+f5 c5+e5+g5:2']], violin: [['Los 7 acordes de Re mayor', '@70 d4+f#4+a4 e4+g4+b4 f#4+a4+c#5 g4+b4+d5 a4+c#5+e5 b4+d5+f#5 c#5+e5+g5 d5+f#5+a5:2']] },
    38: [['I – IV – V – I (llega a casa)', '@70 c4+e4+g4:2 c4+f4+a4:2 b3+d4+g4:2 c4+e4+g4:4'], ['Sin llegar a casa', '@70 c4+e4+g4:2 c4+f4+a4:2 b3+d4+g4:4']],
    39: [['I – V – vi – IV', '@70 c4+e4+g4:2 b3+d4+g4:2 a3+c4+e4:2 a3+c4+f4:2 c4+e4+g4:4']],
    40: { piano: [['La menor natural', '@100 a3 b3 c4 d4 e4 f4 g4 a4:2'], ['Do mayor, su relativa', '@100 c4 d4 e4 f4 g4 a4 b4 c5:2']], violin: [['La menor natural', '@100 a3 b3 c4 d4 e4 f4 g4 a4:2'], ['Mi menor', '@100 e4 f#4 g4 a4 b4 c5 d5 e5:2']] },
    41: [['i – iv – V – i en La menor', '@70 a3+c4+e4:2 a3+d4+f4:2 g#3+b3+e4:2 a3+c4+e4:4']],
    42: [['Los acordes de Do mayor: I – IV – V – I', '@70 c4+e4+g4:2 c4+f4+a4:2 b3+d4+g4:2 c4+e4+g4:4'], ['Girando por el círculo: Rem → Sol → Do', '@70 d4+f4+a4:2 b3+d4+g4:2 c4+e4+g4:4'], ['Lam → Rem → Sol → Do', '@70 a3+c4+e4:2 d4+f4+a4:2 b3+d4+g4:2 c4+e4+g4:4']],
    43: { piano: [['Pentatónica de Do', '@100 c4 d4 e4 g4 a4 c5:2']], violin: [['Pentatónica de Re', '@100 d4 e4 f#4 a4 b4 d5:2'], ['Pentatónica de La menor', '@100 a3 c4 d4 e4 g4 a4:2']] },
    44: [['Pregunta y respuesta', '@90 c4 d4 e4 g4 a4 g4 e4:2 g4 e4 d4 e4 d4 d4 c4:2']],
    45: [['6/8: dos pulsos grandes', '@180 X x x X x x X x x X x x'], ['El ritmo', '@180 g4 g4 g4 g4 g4 g4 g4:3 g4:2 g4']],
    46: [['Una melodía para escribir', '@80 c4 d4 e4 c4 g4:2 e4 d4 c4:4']],
    47: [['Suave (p)', '@100 !p c5 d5 e5 f5 g5:2'], ['Medio fuerte (mf)', '@100 !mf c5 d5 e5 f5 g5:2'], ['Fuerte (f)', '@100 !f c5 d5 e5 f5 g5:2'], ['Staccato', '@100 c5:0.25 r:0.75 d5:0.25 r:0.75 e5:0.25 r:0.75 f5:0.25 r:0.75']],
    48: [['Lento', '@60 c4 e4 g4 c5:2'], ['Andante', '@90 c4 e4 g4 c5:2'], ['Allegro', '@130 c4 e4 g4 c5:2'], ['Presto', '@170 c4 e4 g4 c5:2']],
    49: [['A', '@100 c4 e4 g4 e4 c4:2'], ['B', '@100 a4 g4 f4 d4 g4:2'], ['A – B – A', '@100 c4 e4 g4 e4 c4:2 a4 g4 f4 d4 g4:2 c4 e4 g4 e4 c4:2']],
    50: { piano: [['La melodía', '@90 g4 a4 b4 d5:1.5 c5:0.5 b4 a4 f#4 a4 g4:3']], violin: [['La melodía', '@90 d4 e4 f#4 a4:1.5 g4:0.5 f#4 e4 c#5 e4 d4:3']] },
    51: [['Sol7 → Do', '@70 g3+b3+d4+f4:3 c4+e4+g4:4'], ['Sol7 solo (sin resolver)', '@70 g3+b3+d4+f4:4']],
    52: [['Un ejemplo de 8 compases', '@100 c4 e4 g4 e4 f4 a4 g4:2 e4 g4 c5 b4 a4 g4 g4:2 & c3+e3+g3:4 c3+f3+a3:4 c3+e3+g3:4 b2+d3+g3:4']],
    53: [['Do jónico', MODO(60, MODOS.jonico)], ['Re dórico', MODO(62, MODOS.dorico)], ['Mi frigio', MODO(64, MODOS.frigio)], ['Fa lidio', MODO(65, MODOS.lidio)], ['Sol mixolidio', MODO(67, MODOS.mixolidio)], ['La eólico', MODO(69, MODOS.eolico)], ['Si locrio', MODO(71, MODOS.locrio)]],
    54: [['La eólico', MODO(69, MODOS.eolico)], ['Do jónico', MODO(60, MODOS.jonico)]],
    55: [['Sol mixolidio', MODO(67, MODOS.mixolidio)], ['Sol mayor', MODO(67, MODOS.jonico)]],
    56: [['Re dórico', MODO(62, MODOS.dorico)], ['Re menor', MODO(62, MODOS.eolico)]],
    57: [['Fa lidio', MODO(65, MODOS.lidio)], ['Fa mayor', MODO(65, MODOS.jonico)]],
    58: [['Mi frigio', MODO(64, MODOS.frigio)], ['Mi menor', MODO(64, MODOS.eolico)]],
    59: [['Si locrio', MODO(71, MODOS.locrio)], ['Su acorde casa (disminuido)', '@80 b3+d4+f4:3']],
    60: [['Lidio', MODO(60, MODOS.lidio)], ['Jónico', MODO(60, MODOS.jonico)], ['Mixolidio', MODO(60, MODOS.mixolidio)], ['Dórico', MODO(60, MODOS.dorico)], ['Eólico', MODO(60, MODOS.eolico)], ['Frigio', MODO(60, MODOS.frigio)], ['Locrio', MODO(60, MODOS.locrio)]]
  };
  // los modos que no traen tempo van a 100
  Object.keys(E).filter(k => k >= 53).forEach(k => E[k].forEach(x => { if (!/^@/.test(x[1])) x[1] = '@100 ' + x[1]; }));

  const LETRA = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  function midi(nota) {
    const m = nota.match(/^([a-g])(#|b)?(-?\d)$/);
    return m ? 12 * (Number(m[3]) + 1) + LETRA[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) : null;
  }
  /* una voz → eventos { t (en pulsos), d, notas[], clic } */
  function leerVoz(texto, estado) {
    let t = 0; const ev = [];
    texto.trim().split(/\s+/).forEach(tok => {
      if (/^@\d+/.test(tok)) { estado.tempo = Number(tok.slice(1)); return; }
      if (/^!(p|mf|f)$/.test(tok)) { estado.vol = { p: .18, mf: .34, f: .55 }[tok.slice(1)]; return; }
      const [cuerpo, dur] = tok.split(':'); const d = dur ? Number(dur) : 1;
      if (cuerpo === 'r') { t += d; return; }
      if (cuerpo === 'x' || cuerpo === 'X') ev.push({ t, d, clic: cuerpo === 'X' ? 'fuerte' : 'suave' });
      else if (cuerpo === 'o') ev.push({ t, d, tambor: true });
      else ev.push({ t, d, notas: cuerpo.split('+').map(midi).filter(n => n !== null), vol: estado.vol });
      t += d;
    });
    return { ev, largo: t };
  }
  /* toca una partitura con el sonido de la app; devuelve cuántos segundos dura. Calla el ejemplo anterior y la música
     mientras suena (antes la música tapaba los ejemplos, 29-oct) */
  function tocar(partitura, S) {
    S.callar();
    const estado = { tempo: 90, vol: .42 };
    const voces = partitura.split('&').map(v => leerVoz(v, estado));
    const pulso = 60 / estado.tempo, t0 = S.ahora() + .08;
    voces.forEach(v => v.ev.forEach(e => {
      const t = t0 + e.t * pulso;
      if (e.clic) S.clic(t, e.clic === 'fuerte');
      else if (e.tambor) S.tambor(t);
      else e.notas.forEach(n => S.notaEn(t, n, Math.max(.12, e.d * pulso * .95), e.vol / Math.sqrt(e.notas.length)));
    }));
    const seg = Math.max(...voces.map(v => v.largo)) * pulso + .4;
    if (S.musica) S.musica.silenciar(seg * 1000 + 600);
    return seg;
  }
  function de(semana, ins) { const x = E[semana]; return !x ? [] : Array.isArray(x) ? x : (x[ins] || x.piano || []); }
  return { de, tocar };
})();
