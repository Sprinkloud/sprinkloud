/* La prueba de nivel (pedido de la dueña, 30-oct; más justa desde el 4-nov): preguntas de lo fácil a lo difícil, tres por
   etapa (de la 1 a la 6). Un toque equivocado ya no decide el nivel (4-nov: la dueña tocó mal la primera y la mandó al
   principio):
   - una etapa se aprueba con 2 de sus 3 preguntas bien;
   - la prueba sigue hasta que una etapa ya no se puede aprobar (2 fallas en ella) o hasta 3 fallas en total;
   - empieza en la primera lección de la primera etapa que no aprobó; si aprueba las 6, en la etapa 7.
   «No lo sé todavía» cuenta como falla. Las opciones salen en otro orden en cada intento, para que no se aprendan de memoria.
   La hacen todos una vez al entrar, y se puede repetir desde la biblioteca para subir de nivel (lo decide el servidor:
   una vez por semana, y solo sube). La versión libre llega hasta la lección 27 (lo recorta el servidor o el celular). */
window.Encuesta = (function () {
  'use strict';
  /* primera lección de cada etapa (6, 8, 13, 10, 9, 6 y 8 lecciones: Registro_Sprinkloud/Guia.js versión 8) */
  const INICIO = [1, 7, 15, 28, 38, 47, 53];
  const POR_ETAPA = 3, PARA_APROBAR = 2, FALLAS_MAX = 3;
  /* sonido: dos notas (midi) que se tocan con «Escuchar»; pentagrama: la nota que se dibuja (como en VexFlow) */
  const PREGUNTAS = [
    { etapa: 1, texto: '¿Cuál sonó más agudo?', sonido: [60, 72], opciones: ['El primero', 'El segundo'], correcta: 'El segundo' },
    { etapa: 1, texto: '¿Cuántos sonidos hay en «ti-ti»?', opciones: ['1', '2', '4'], correcta: '2' },
    { etapa: 1, texto: 'En un silencio de la música…', opciones: ['Tocamos más fuerte', 'No suena nada', 'Repetimos la nota'], correcta: 'No suena nada' },
    { etapa: 2, texto: '¿Qué nota es?', pentagrama: 'g/4', opciones: ['Mi', 'Sol', 'Si', 'Re'], correcta: 'Sol' },
    { etapa: 2, texto: '¿Cuántos pulsos dura una blanca?', opciones: ['1', '2', '4'], correcta: '2' },
    { etapa: 2, texto: 'En un compás de 3/4, ¿cuántos pulsos hay?', opciones: ['2', '3', '4'], correcta: '3' },
    { etapa: 3, texto: '¿Cuántos pulsos dura una blanca con puntillo?', opciones: ['2', '3', '4'], correcta: '3' },
    { etapa: 3, texto: '¿Cuántas semicorcheas (ta-ka-di-mi) caben en un pulso?', opciones: ['2', '3', '4'], correcta: '4' },
    { etapa: 3, texto: 'Entre Mi y Fa hay…', opciones: ['Un tono', 'Un semitono'], correcta: 'Un semitono' },
    { etapa: 4, texto: 'Subiendo de Do a Sol, ¿qué intervalo hay?', opciones: ['Una 3.ª', 'Una 4.ª', 'Una 5.ª'], correcta: 'Una 5.ª' },
    { etapa: 4, texto: '¿Qué notas tiene el acorde de Do mayor?', opciones: ['Do, Mi y Sol', 'Do, Mi♭ y Sol', 'Do, Fa y La'], correcta: 'Do, Mi y Sol' },
    { etapa: 4, texto: '¿Qué armadura tiene Sol mayor?', opciones: ['Ningún sostenido', 'Fa♯', 'Fa♯ y Do♯'], correcta: 'Fa♯' },
    { etapa: 5, texto: '¿Cuál es la relativa menor de Do mayor?', opciones: ['Mi menor', 'La menor', 'Re menor'], correcta: 'La menor' },
    { etapa: 5, texto: '¿Cuántas notas tiene la escala pentatónica?', opciones: ['5', '6', '7'], correcta: '5' },
    { etapa: 5, texto: 'En el círculo de quintas, ¿qué tonalidad sigue después de Sol mayor?', opciones: ['Fa mayor', 'La mayor', 'Re mayor'], correcta: 'Re mayor' },
    { etapa: 6, texto: 'En una partitura, «p» (piano) quiere decir…', opciones: ['Suave', 'Fuerte', 'Rápido'], correcta: 'Suave' },
    { etapa: 6, texto: '«Allegro» quiere decir…', opciones: ['Lento', 'Rápido y alegre', 'Muy suave'], correcta: 'Rápido y alegre' },
    { etapa: 6, texto: '¿Cuál es el acorde de séptima de dominante en Do mayor?', opciones: ['Do7', 'Sol7', 'Fa7'], correcta: 'Sol7' }
  ];
  const NO_SE = 'No lo sé todavía';

  /* respuestas: [{etapa, bien}] en el orden de PREGUNTAS. Devuelve {sigue, etapa (donde empieza), bien, total}. */
  function evaluar(respuestas) {
    const fallas = respuestas.filter(r => !r.bien).length;
    const bienDe = e => respuestas.filter(r => r.etapa === e && r.bien).length;
    const fallasDe = e => respuestas.filter(r => r.etapa === e && !r.bien).length;
    const cerrada = [1, 2, 3, 4, 5, 6].some(e => fallasDe(e) > POR_ETAPA - PARA_APROBAR);   // esa etapa ya no se aprueba
    const sigue = !cerrada && fallas < FALLAS_MAX && respuestas.length < PREGUNTAS.length;
    let etapa = 7;
    for (let e = 1; e <= 6; e++) if (bienDe(e) < PARA_APROBAR) { etapa = e; break; }
    return { sigue, etapa, bien: respuestas.length - fallas, total: respuestas.length };
  }
  /* la lección donde empieza: la primera de esa etapa (7 = todo aprobado) */
  function semanaDe(etapa) { return INICIO[(etapa || 7) - 1]; }
  /* las opciones en otro orden en cada intento */
  function mezclar(lista) {
    const x = lista.slice();
    for (let i = x.length - 1; i > 0; i--) { const k = Math.floor(Math.random() * (i + 1)); [x[i], x[k]] = [x[k], x[i]]; }
    return x;
  }
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
  return { PREGUNTAS, NO_SE, evaluar, semanaDe, mezclar, pentagrama, INICIO };
})();
