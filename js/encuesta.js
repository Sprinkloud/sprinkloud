/* La prueba de nivel (pedido de la dueña, 30-oct): al entrar por primera vez, preguntas de lo fácil a lo difícil, dos por
   etapa. Donde se equivoca (o toca «No lo sé todavía»), ahí empieza: en la primera lección de esa etapa. Si contesta todo
   bien, empieza en la etapa 7. La hacen todos una vez (también los alumnos que ya iban avanzando); la versión libre llega
   hasta la lección 27 (lo recorta el servidor o el celular). */
window.Encuesta = (function () {
  'use strict';
  /* primera lección de cada etapa (6, 8, 13, 10, 9, 6 y 8 lecciones: Registro_Sprinkloud/Guia.js versión 8) */
  const INICIO = [1, 7, 15, 28, 38, 47, 53];
  /* sonido: dos notas (midi) que se tocan con «Escuchar»; pentagrama: la nota que se dibuja (como en VexFlow) */
  const PREGUNTAS = [
    { etapa: 1, texto: '¿Cuál sonó más agudo?', sonido: [60, 72], opciones: ['El primero', 'El segundo'], correcta: 'El segundo' },
    { etapa: 1, texto: '¿Cuántos sonidos hay en «ti-ti»?', opciones: ['1', '2', '4'], correcta: '2' },
    { etapa: 2, texto: '¿Qué nota es?', pentagrama: 'g/4', opciones: ['Mi', 'Sol', 'Si', 'Re'], correcta: 'Sol' },
    { etapa: 2, texto: '¿Cuántos pulsos dura una blanca?', opciones: ['1', '2', '4'], correcta: '2' },
    { etapa: 3, texto: '¿Cuántos pulsos dura una blanca con puntillo?', opciones: ['2', '3', '4'], correcta: '3' },
    { etapa: 3, texto: 'Entre Mi y Fa hay…', opciones: ['Un tono', 'Un semitono'], correcta: 'Un semitono' },
    { etapa: 4, texto: 'Subiendo de Do a Sol, ¿qué intervalo hay?', opciones: ['Una 3.ª', 'Una 4.ª', 'Una 5.ª'], correcta: 'Una 5.ª' },
    { etapa: 4, texto: '¿Qué armadura tiene Sol mayor?', opciones: ['Ningún sostenido', 'Fa♯', 'Fa♯ y Do♯'], correcta: 'Fa♯' },
    { etapa: 5, texto: '¿Cuál es la relativa menor de Do mayor?', opciones: ['Mi menor', 'La menor', 'Re menor'], correcta: 'La menor' },
    { etapa: 5, texto: 'En el círculo de quintas, ¿qué tonalidad sigue después de Sol mayor?', opciones: ['Fa mayor', 'La mayor', 'Re mayor'], correcta: 'Re mayor' },
    { etapa: 6, texto: 'En una partitura, «p» (piano) quiere decir…', opciones: ['Suave', 'Fuerte', 'Rápido'], correcta: 'Suave' },
    { etapa: 6, texto: '¿Cuál es el acorde de séptima de dominante en Do mayor?', opciones: ['Do7', 'Sol7', 'Fa7'], correcta: 'Sol7' }
  ];
  const NO_SE = 'No lo sé todavía';
  /* la lección donde empieza: la primera de la etapa en la que falló; todo bien, la etapa 7 */
  function semanaDe(etapaFallo) { return INICIO[(etapaFallo || 7) - 1]; }
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
  return { PREGUNTAS, NO_SE, semanaDe, pentagrama, INICIO };
})();
