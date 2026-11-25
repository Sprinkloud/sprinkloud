/* La prueba de nivel (pedido de la dueña, 30-oct; más justa desde el 4-nov; más exigente desde el 25-nov).
   25-nov-2026: una alumna subió de la etapa 3 a la 5 sin saber esos temas (pudo adivinar o tener ayuda). Antes eran 3
   preguntas por etapa, de 2 o 3 opciones, y se aprobaba con 2: adivinando, una etapa se pasaba 1 de cada 2 a 4 veces.
   Ahora:
   - cada etapa (1 a 6) tiene 6 preguntas; en cada prueba salen 4 al azar, casi todas con 4 opciones;
   - una etapa se aprueba con 3 de esas 4 bien: adivinando, eso sale más o menos 1 vez de cada 20, y pasar dos etapas
     seguidas adivinando, menos de 1 de cada 400;
   - la prueba se corta en la primera etapa que ya no se puede aprobar (2 fallas en ella), y empieza en la primera lección
     de esa etapa; si aprueba las 6, en la etapa 7;
   - «Subir de nivel» (repetir la prueba desde la biblioteca) pregunta SOLO por la etapa en la que está: si la aprueba,
     pasa al comienzo de la siguiente. Se sube una etapa por vez (el servidor tampoco deja subir más de una).
   «No lo sé todavía» cuenta como falla. Las preguntas y las opciones salen en otro orden en cada intento.
   La hacen todos una vez al entrar; repetirla se puede una vez por semana y solo sube (lo decide el servidor). La versión
   libre llega hasta la lección 27 (lo recorta el servidor o el celular). */
window.Encuesta = (function () {
  'use strict';
  /* primera lección de cada etapa (6, 8, 13, 10, 9, 6 y 8 lecciones: Registro_Sprinkloud/Guia.js versión 9) */
  const INICIO = [1, 7, 15, 28, 38, 47, 53];
  const POR_ETAPA = 4, PARA_APROBAR = 3;
  /* sonido: dos notas (midi) que se tocan con «Escuchar»; pentagrama: la nota que se dibuja (como en VexFlow).
     La primera opción de cada lista es la correcta (en pantalla salen mezcladas). */
  const BANCO = [
    { etapa: 1, texto: '¿Cuál sonó más agudo?', sonido: [60, 72], opciones: ['El segundo', 'El primero', 'Sonaron igual'] },
    { etapa: 1, texto: '¿Cuántos sonidos hay en «ti-ti»?', opciones: ['2', '1', '3', '4'] },
    { etapa: 1, texto: '¿Cuántos sonidos hay en «ta ta ti-ti ta»?', opciones: ['5', '4', '6', '3'] },
    { etapa: 1, texto: 'En un silencio de la música…', opciones: ['No suena nada', 'Tocamos más fuerte', 'Repetimos la nota', 'Cantamos la nota'] },
    { etapa: 1, texto: 'El pulso de una canción es…', opciones: ['Un latido parejo que no se detiene', 'La nota más aguda', 'El volumen de la música', 'La letra de la canción'] },
    { etapa: 1, texto: 'Un ostinato es…', opciones: ['Un ritmo corto que se repite una y otra vez', 'Una nota muy larga', 'Un silencio al final', 'Un ritmo distinto en cada compás'] },

    { etapa: 2, texto: '¿Qué nota es?', pentagrama: 'g/4', opciones: ['Sol', 'Mi', 'Si', 'Re'] },
    { etapa: 2, texto: '¿Qué nota es?', pentagrama: 'e/4', opciones: ['Mi', 'Sol', 'Fa', 'Do'] },
    { etapa: 2, texto: '¿Qué nota es?', pentagrama: 'a/4', opciones: ['La', 'Sol', 'Si', 'Fa'] },
    { etapa: 2, texto: '¿Cuántos pulsos dura una blanca?', opciones: ['2', '1', '3', '4'] },
    { etapa: 2, texto: 'En un compás de 3/4, ¿cuántos pulsos hay?', opciones: ['3', '2', '4', '6'] },
    { etapa: 2, texto: '¿Cuántas corcheas caben en una negra?', opciones: ['2', '1', '3', '4'] },

    { etapa: 3, texto: '¿Cuántos pulsos dura una blanca con puntillo?', opciones: ['3', '2', '4', '1'] },
    { etapa: 3, texto: '¿Cuántas semicorcheas (ta-ka-di-mi) caben en un pulso?', opciones: ['4', '2', '3', '8'] },
    { etapa: 3, texto: 'Entre Mi y Fa hay…', opciones: ['Un semitono', 'Un tono', 'Dos tonos', 'Una tercera'] },
    { etapa: 3, texto: '¿Cuánto dura una negra con puntillo?', opciones: ['Un pulso y medio', 'Dos pulsos', 'Medio pulso', 'Tres pulsos'] },
    { etapa: 3, texto: 'Un sostenido (♯) delante de una nota…', opciones: ['La sube un semitono', 'La baja un semitono', 'La hace más larga', 'La hace más fuerte'] },
    { etapa: 3, texto: 'Una ligadura que une dos notas iguales…', opciones: ['Las vuelve un solo sonido más largo', 'Hace que se toquen separadas', 'Hace que suenen más fuerte', 'Cambia la segunda nota'] },

    { etapa: 4, texto: 'Subiendo de Do a Sol, ¿qué intervalo hay?', opciones: ['Una 5.ª', 'Una 3.ª', 'Una 4.ª', 'Una 6.ª'] },
    { etapa: 4, texto: '¿Qué notas tiene el acorde de Do mayor?', opciones: ['Do, Mi y Sol', 'Do, Mi♭ y Sol', 'Do, Fa y La', 'Do, Re y Mi'] },
    { etapa: 4, texto: '¿Qué notas tiene el acorde de La menor?', opciones: ['La, Do y Mi', 'La, Do♯ y Mi', 'La, Re y Mi', 'La, Do y Fa'] },
    { etapa: 4, texto: '¿Qué armadura tiene Sol mayor?', opciones: ['Fa♯', 'Ninguna alteración', 'Fa♯ y Do♯', 'Si♭'] },
    { etapa: 4, texto: '¿Qué armadura tiene Fa mayor?', opciones: ['Si♭', 'Fa♯', 'Si♭ y Mi♭', 'Ninguna alteración'] },
    { etapa: 4, texto: '¿Cuál es el primer sostenido de una armadura?', opciones: ['Fa♯', 'Do♯', 'Sol♯', 'Si♯'] },

    { etapa: 5, texto: '¿Cuál es la relativa menor de Do mayor?', opciones: ['La menor', 'Mi menor', 'Re menor', 'Do menor'] },
    { etapa: 5, texto: '¿Cuántas notas tiene la escala pentatónica?', opciones: ['5', '6', '7', '4'] },
    { etapa: 5, texto: 'En el círculo de quintas, ¿qué tonalidad sigue después de Sol mayor?', opciones: ['Re mayor', 'Fa mayor', 'La mayor', 'Do mayor'] },
    { etapa: 5, texto: 'En Do mayor, ¿cuáles son los acordes I, IV y V?', opciones: ['Do, Fa y Sol', 'Do, Mi y Sol', 'Do, Re y Mi', 'Do, Sol y La'] },
    { etapa: 5, texto: 'En un compás de 6/8, ¿cuántas corcheas hay?', opciones: ['6', '3', '8', '4'] },
    { etapa: 5, texto: 'La escala menor armónica sube un semitono…', opciones: ['El séptimo grado', 'El tercer grado', 'El quinto grado', 'El segundo grado'] },

    { etapa: 6, texto: 'En una partitura, «p» (piano) quiere decir…', opciones: ['Suave', 'Fuerte', 'Rápido', 'Lento'] },
    { etapa: 6, texto: '«ff» (fortissimo) quiere decir…', opciones: ['Muy fuerte', 'Muy suave', 'Muy rápido', 'Muy lento'] },
    { etapa: 6, texto: '«Allegro» quiere decir…', opciones: ['Rápido y alegre', 'Lento', 'Muy suave', 'Volver al principio'] },
    { etapa: 6, texto: '¿Cuál es el acorde de séptima de dominante en Do mayor?', opciones: ['Sol7', 'Do7', 'Fa7', 'Re7'] },
    { etapa: 6, texto: 'Una canción con forma ABA…', opciones: ['Tiene una parte, otra distinta y vuelve la primera', 'Tiene tres partes distintas', 'Repite la misma parte tres veces', 'Alterna dos partes sin terminar'] },
    { etapa: 6, texto: 'Una anacrusa es…', opciones: ['Una o más notas antes del primer pulso fuerte', 'La última nota de la canción', 'Un silencio largo al comenzar', 'Un acorde al final'] }
  ];
  const NO_SE = 'No lo sé todavía';

  /* las opciones en otro orden en cada intento */
  function mezclar(lista) {
    const x = lista.slice();
    for (let i = x.length - 1; i > 0; i--) { const k = Math.floor(Math.random() * (i + 1)); [x[i], x[k]] = [x[k], x[i]]; }
    return x;
  }
  /* las preguntas de esta prueba: 4 al azar de cada etapa, de la 1 a la 6 (o solo de `soloEtapa`, para subir de nivel) */
  function armar(soloEtapa) {
    const etapas = soloEtapa ? [soloEtapa] : [1, 2, 3, 4, 5, 6];
    return [].concat.apply([], etapas.map(e => mezclar(BANCO.filter(q => q.etapa === e)).slice(0, POR_ETAPA)
      .map(q => Object.assign({}, q, { correcta: q.opciones[0] }))));
  }
  /* preguntas: las de esta prueba; respuestas: [{etapa, bien}] en orden. Devuelve {siguiente (índice de la próxima
     pregunta o -1 si terminó), etapa (la primera que no aprobó; 7 si aprobó todas las que se preguntaron), bien, total}.
     Una etapa queda aprobada con 3 bien y cerrada con 2 fallas: lo que falta de ella ya no se pregunta. */
  function evaluar(preguntas, respuestas) {
    const bienDe = e => respuestas.filter(r => r.etapa === e && r.bien).length;
    const fallasDe = e => respuestas.filter(r => r.etapa === e && !r.bien).length;
    const etapas = preguntas.map(q => q.etapa).filter((e, i, a) => a.indexOf(e) === i);
    let etapa = null;
    for (const e of etapas) {
      if (bienDe(e) >= PARA_APROBAR) continue;
      etapa = e; break;
    }
    const total = respuestas.length, bien = respuestas.filter(r => r.bien).length;
    if (etapa === null) return { siguiente: -1, etapa: Math.max.apply(null, etapas) + 1, bien, total };   // aprobó todas
    if (fallasDe(etapa) > POR_ETAPA - PARA_APROBAR) return { siguiente: -1, etapa, bien, total };          // esa etapa ya no se aprueba
    const hechas = respuestas.length, siguiente = preguntas.findIndex((q, i) => i >= hechas && q.etapa === etapa);
    return { siguiente, etapa, bien, total };
  }
  /* la lección donde empieza: la primera de esa etapa (7 = todo aprobado) */
  function semanaDe(etapa) { return INICIO[Math.min(etapa || 7, 7) - 1]; }
  /* la nota en un pentagrama con clave de sol (VexFlow, como en la lectura de notas de actividades.js) */
  function pentagrama(div, key) {
    const VF = Vex.Flow, r = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    r.resize(240, 150);
    const ctx = r.getContext(); ctx.setFillStyle('#2B241C'); ctx.setStrokeStyle('#2B241C');
    const st = new VF.Stave(10, 20, 220); st.addClef('treble').setContext(ctx).draw();
    VF.Formatter.FormatAndDraw(ctx, st, [new VF.StaveNote({ keys: [key], duration: 'w', clef: 'treble' })]);
    const svg = div.querySelector('svg'); svg.setAttribute('viewBox', '0 0 240 150'); svg.style.width = ''; svg.style.height = '';
    svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Una nota en el pentagrama con clave de sol');
  }
  return { BANCO, NO_SE, armar, evaluar, semanaDe, mezclar, pentagrama, INICIO, POR_ETAPA, PARA_APROBAR };
})();
