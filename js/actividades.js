/* Las actividades de la práctica diaria. Cada una recibe un contenedor y devuelve una promesa con
   {aciertos, intentos} (o null si se saltó). Primero el osito muestra un ejemplo («Mira»), después «¡Ahora tú!».
   Las preguntas salen de un azar con semilla: el mismo día dan lo mismo y a medianoche cambian. */
window.Actividades = (function () {
  'use strict';
  const S = window.Sonido, L = window.Leccion;
  const NOMBRE = { c: 'Do', d: 'Re', e: 'Mi', f: 'Fa', g: 'Sol', a: 'La', b: 'Si' };
  const ORDEN = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
  const SEMI = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  const OSITO = 'assets/ilustraciones/osito-bosque.webp';

  /* ---------- utilidades ---------- */
  function el(tag, attrs, ...hijos) {
    const e = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v == null || v === false) return;
      if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : v);
    });
    hijos.flat(Infinity).forEach(h => { if (h != null && h !== false) e.append(h); });
    return e;
  }
  function puff(texto, clase, onclick) {
    return el('button', { class: 'puff ' + (clase || 'papel'), type: 'button', onclick: e => { S.toque(); onclick && onclick(e); } },
      el('span', { class: 'borde' }), el('span', { class: 'cara', html: texto }));
  }
  const espera = ms => new Promise(r => setTimeout(r, ms));
  function semillaDe(texto) { let h = 2166136261; for (const c of texto) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function azarCon(semilla) {   // mulberry32
    let a = semilla >>> 0;
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  const uno = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
  const mezclar = (rnd, arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* La consigna: el osito y una frase corta (sin textos largos) */
  function consigna(texto, contador) {
    return el('div', { class: 'tarjeta consigna' }, el('span', { class: 'cara-osito' }, el('img', { src: OSITO, alt: '' })), el('p', { text: texto }), contador || null);
  }
  /* Cada actividad empieza con un ejemplo: el osito responde una pregunta y aparece «¡Ahora tú!» */
  async function ejemplo(cont, mostrar) {
    cont.classList.add('ejemplo');
    await mostrar();
    await espera(400);
    return new Promise(listo => {
      const b = puff('¡Ahora tú! ✨', 'ocre grande respira', () => { cont.classList.remove('ejemplo'); b.remove(); listo(); });
      cont.append(b);
    });
  }

  /* Una ronda de preguntas y, si hubo errores, la corrección (pedido de la dueña): vuelven a salir solo las que se
     equivocó, hasta acertarlas (como máximo 3 vueltas, para no frustrar). Los aciertos que cuentan son los del primer intento. */
  async function conCorreccion(items, preguntar, cuenta, msj) {
    let bien = 0, pendientes = [];
    for (let i = 0; i < items.length; i++) {
      cuenta.textContent = (i + 1) + ' / ' + items.length;
      if (await preguntar(items[i])) bien++; else pendientes.push(items[i]);
    }
    for (let vuelta = 0; pendientes.length && vuelta < 3; vuelta++) {
      msj.className = 'mensaje'; msj.textContent = '¡Corrijamos! ✏️ ' + (pendientes.length === 1 ? 'Una más' : pendientes.length + ' más');
      S.pagina(); await espera(1600); msj.textContent = '';
      const otra = [];
      for (let k = 0; k < pendientes.length; k++) {
        cuenta.textContent = '✏️ ' + (k + 1) + ' / ' + pendientes.length;
        if (!await preguntar(pendientes[k])) otra.push(pendientes[k]);
      }
      pendientes = otra;
    }
    return bien;
  }

  /* ---------- 1. Leer notas en el pentagrama ---------- */
  function poolNotas(semana, ins) {
    let lista = ins === 'piano' ? L.notasPiano(semana) : L.notasViolin(semana);
    if (!lista) lista = ins === 'piano'
      ? ['c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'd/5', 'e/5', 'f/5', 'g/5'].map(k => [k, 'treble']).concat(['f/2', 'g/2', 'a/2', 'b/2', 'c/3', 'd/3', 'e/3', 'f/3', 'g/3', 'a/3'].map(k => [k, 'bass']))
      : ['g/3', 'a/3', 'b/3', 'c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'd/5', 'e/5', 'f/5', 'g/5', 'a/5', 'b/5'];
    return lista.map(x => typeof x === 'string' ? { key: x, clave: 'treble' } : { key: x[0], clave: x[1] });
  }
  const midiDe = key => { const [l, o] = key.split('/'); return 12 * (Number(o) + 1) + SEMI[l]; };
  function dibujarNota(div, n) {
    div.replaceChildren();
    const VF = Vex.Flow, r = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    r.resize(240, 150);
    const ctx = r.getContext(); ctx.setFillStyle('#2B241C'); ctx.setStrokeStyle('#2B241C');
    const st = new VF.Stave(10, 20, 220); st.addClef(n.clave).setContext(ctx).draw();
    const nota = new VF.StaveNote({ keys: [n.key], duration: 'w', clef: n.clave });
    VF.Formatter.FormatAndDraw(ctx, st, [nota]);
    const svg = div.querySelector('svg'); svg.setAttribute('viewBox', '0 0 240 150'); svg.style.width = ''; svg.style.height = '';
  }
  async function notas(cont, o) {
    const pool = poolNotas(o.semana, o.ins), cuantas = o.cuantas || 10;
    const letras = ORDEN.filter(l => pool.some(n => n.key[0] === l));
    const preguntas = []; let ant = null;
    for (let i = 0; i < cuantas; i++) { let n; do { n = uno(o.rnd, pool); } while (pool.length > 1 && ant && n.key === ant.key); preguntas.push(n); ant = n; }
    const cuenta = el('span', { class: 'contador' });
    const papel = el('div', { class: 'pentagrama tarjeta' });
    const msj = el('div', { class: 'mensaje', 'aria-live': 'polite' });
    const botones = {};
    const fila = el('div', { class: 'respuestas-juego' }, letras.map(l => (botones[l] = puff(NOMBRE[l], 'papel', () => responder(l)))));
    cont.append(consigna('¿Qué nota es?', cuenta), papel, msj, fila);
    let i = 0, bien = 0, esperando = null;
    function responder(l) { if (esperando) esperando(l); }

    await ejemplo(cont, async () => {
      const n = preguntas[0]; dibujarNota(papel, n); await espera(900);
      botones[n.key[0]].classList.add('pista', 'bien'); S.nota(midiDe(n.key)); msj.textContent = 'Esta es ' + NOMBRE[n.key[0]];
      await espera(1300); botones[n.key[0]].classList.remove('pista', 'bien'); msj.textContent = '';
    });
    S.reiniciarEscalera();
    bien = await conCorreccion(preguntas, async n => {
      dibujarNota(papel, n);
      const l = await new Promise(r => { esperando = r; });
      esperando = null;
      const ok = l === n.key[0];
      if (ok) { S.acierto(); S.nota(midiDe(n.key), .6); botones[l].classList.add('bien'); msj.className = 'mensaje bien'; msj.textContent = uno(o.rnd, ['¡Sí!', '¡Muy bien!', '¡Eso!', '¡Bravo!']); }
      else { S.error(); botones[l].classList.add('mal'); botones[n.key[0]].classList.add('bien'); msj.className = 'mensaje mal'; msj.textContent = 'Era ' + NOMBRE[n.key[0]]; }
      await espera(ok ? 650 : 1300);
      Object.values(botones).forEach(b => b.classList.remove('bien', 'mal')); msj.textContent = '';
      return ok;
    }, cuenta, msj);
    return { aciertos: bien, intentos: cuantas };
  }

  /* ---------- 2. Dictado de ritmo: escucha un compás y elige cuál sonó (sílabas ta, ti-ti) ---------- */
  const R = window.Ritmo;
  const CELDAS_TODAS = ['pan', 'luna', 'choco', 'gran', 'cama', 's4', 'bla2'];
  function poolRitmo(semana) {
    const r = L.ritmoDe(semana) || {};
    const compas = r.compas || (r.latino ? '4/4' : '4/4');
    let celdas = r.celdas || (compas === '6/8' ? ['tres8', 'negp6', 'neg8'] : CELDAS_TODAS);
    if (compas === '6/8' && !r.celdas) celdas = ['tres8', 'negp6', 'neg8'];
    return { compas, celdas, tempo: Math.max(60, Math.min(r.tempo || 70, 90)) };
  }
  function compasAlAzar(rnd, celdas, largo) {
    for (let intento = 0; intento < 60; intento++) {
      const out = []; let falta = largo;
      while (falta > 0.001) {
        const caben = celdas.filter(id => R.cellDur(R.byId(id)) <= falta + .001);
        if (!caben.length) break;
        const c = uno(rnd, caben); out.push(c); falta = Math.round((falta - R.cellDur(R.byId(c))) * 1000) / 1000;
      }
      if (falta < .001 && out.some(id => R.byId(id).notes.some(n => !n.rest))) return out;
    }
    return null;
  }
  function tocarCompas(ids, compas, tempo) {
    const cm = R.COMPASES[compas], beat = 60 / tempo / cm.pulso, t0 = S.ahora() + .15;
    const largo = Math.round(cm.bar / cm.pulso);
    for (let b = 0; b < largo * 2; b++) S.clic(t0 + b * cm.pulso * beat, b % largo === 0);
    let t = largo * cm.pulso;
    ids.forEach(id => R.byId(id).notes.forEach(n => {
      const d = R.noteDur(n);
      if (!n.rest) S.notaRitmo(t0 + t * beat, Math.abs((t % cm.pulso)) < .01, d * beat);
      t += d;
    }));
    return (largo * 2 * cm.pulso * beat + .3) * 1000;
  }
  function dibujoCompas(ids) {
    return el('span', { class: 'celdas' }, ids.map(id => el('span', { class: 'celda', html: R.cellSVG(R.byId(id)) + '<span class="sil">' + (R.SILABAS[id] || '') + '</span>' })));
  }
  async function ritmo(cont, o) {
    const p = poolRitmo(o.semana), largo = R.COMPASES[p.compas].bar, cuantas = o.cuantas || 5;
    const conSonido = p.celdas.filter(id => R.byId(id).notes.some(n => !n.rest));
    if (conSonido.length < 2) return pulso(cont, o);   // con una sola figura no hay qué elegir: se marca el pulso
    const cuenta = el('span', { class: 'contador' });
    const msj = el('div', { class: 'mensaje', 'aria-live': 'polite' });
    const escuchar = puff('🔊 Escuchar', 'cielo escuchar', () => actual && tocarCompas(actual.ids, p.compas, p.tempo));
    const opciones = el('div', { class: 'respuestas-juego ritmos' });
    cont.append(consigna('¿Cuál sonó?', cuenta), escuchar, msj, opciones);
    let actual = null, bien = 0;
    function pregunta() {
      const objetivo = compasAlAzar(o.rnd, p.celdas, largo);
      const vistas = new Set([objetivo.join()]), ops = [objetivo];
      for (let k = 0; k < 40 && ops.length < 3; k++) { const x = compasAlAzar(o.rnd, p.celdas, largo); if (x && !vistas.has(x.join())) { vistas.add(x.join()); ops.push(x); } }
      return { ids: objetivo, opciones: mezclar(o.rnd, ops) };
    }
    function pintar(pr, alElegir) {
      opciones.replaceChildren();
      pr.opciones.forEach(ids => {
        const b = puff('', 'papel opcion-ritmo', () => alElegir(ids, b));
        b.querySelector('.cara').append(dibujoCompas(ids));
        b.dataset.ids = ids.join();
        opciones.append(b);
      });
    }
    await ejemplo(cont, async () => {
      actual = pregunta(); pintar(actual, () => { });
      await espera(tocarCompas(actual.ids, p.compas, p.tempo));
      const b = opciones.querySelector('[data-ids="' + actual.ids.join() + '"]');
      b.classList.add('pista'); msj.textContent = '¡Esta!'; await espera(1400); b.classList.remove('pista'); msj.textContent = '';
    });
    S.reiniciarEscalera();
    const lista = Array.from({ length: cuantas }, pregunta);
    bien = await conCorreccion(lista, async pr => {
      actual = { ids: pr.ids, opciones: mezclar(o.rnd, pr.opciones) };   // al corregir, las opciones cambian de lugar
      const elegido = await new Promise(r => { pintar(actual, (ids, b) => r({ ids, b })); setTimeout(() => tocarCompas(actual.ids, p.compas, p.tempo), 300); });
      const ok = elegido.ids.join() === actual.ids.join();
      opciones.querySelectorAll('.puff').forEach(b => { b.disabled = true; });
      if (ok) { S.acierto(); elegido.b.classList.add('pista'); msj.className = 'mensaje bien'; msj.textContent = '¡Así sonó!'; }
      else { S.error(); opciones.querySelector('[data-ids="' + actual.ids.join() + '"]').classList.add('pista'); msj.className = 'mensaje mal'; msj.textContent = 'Sonó la marcada'; }
      await espera(ok ? 900 : 1700); msj.textContent = '';
      return ok;
    }, cuenta, msj);
    return { aciertos: bien, intentos: cuantas };
  }

  /* ---------- 3. Marcar el pulso: toca el tambor justo con el clic ---------- */
  async function pulso(cont, o) {
    const golpes = 8;
    const luces = el('div', { class: 'pulso-luces' }, Array.from({ length: golpes }, () => el('i')));
    const msj = el('div', { class: 'mensaje', 'aria-live': 'polite' });
    let toques = [];
    /* el golpe cuenta al presionar (no al soltar), y vale tocar el tambor, hacer clic o tocar en cualquier parte del ejercicio,
       o apretar cualquier tecla: así es fácil y el sonido sale al instante (pedido de la dueña) */
    const golpe = () => { const t = S.ahora(); toques.push(t); S.tambor(t); tambor.classList.add('golpe'); setTimeout(() => tambor.classList.remove('golpe'), 90); };
    const tambor = el('button', { class: 'puff madera redondo tambor', type: 'button', 'aria-label': 'Tambor: toca con el pulso (o cualquier tecla)' },
      el('span', { class: 'borde' }), el('span', { class: 'cara', text: '🥁' }));
    const alTocar = e => { if (e.button > 0 || e.target.closest('.puff:not(.tambor)')) return; e.preventDefault(); golpe(); };
    const alTeclear = e => {
      if (!cont.closest('.pantalla.activa')) { soltarTeclas(); return; }   // salió del ejercicio (✕): ya no escucha el teclado
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || e.key === 'Tab' || e.key === 'Escape') return;
      const enBoton = document.activeElement && document.activeElement.closest && document.activeElement.closest('.puff:not(.tambor), .btn-icono');
      if (enBoton && (e.key === 'Enter' || e.key === ' ')) return;   // Enter sigue sirviendo para «¡Ahora tú!»
      e.preventDefault(); golpe();
    };
    cont.addEventListener('pointerdown', alTocar);
    document.addEventListener('keydown', alTeclear);
    const soltarTeclas = () => { cont.removeEventListener('pointerdown', alTocar); document.removeEventListener('keydown', alTeclear); };
    cont.append(consigna('Toca el tambor con el pulso'), luces, tambor, el('p', { class: 'mano pista-tambor', text: 'Vale tocar, hacer clic o apretar cualquier tecla 🥁' }), msj);
    async function ronda(automatico, tempo) {
      const beat = 60 / tempo;
      toques = [];
      luces.querySelectorAll('i').forEach(i => { i.className = ''; });
      const t0 = S.ahora() + .3;
      for (let b = 0; b < 4 + golpes; b++) S.clic(t0 + b * beat, b % 4 === 0);
      for (let b = 0; b < 4; b++) setTimeout(() => { msj.textContent = String(b + 1); }, (t0 - S.ahora() + b * beat) * 1000);
      for (let b = 0; b < golpes; b++) {
        setTimeout(() => {
          msj.textContent = '';
          luces.children[b].classList.add('ya');
          if (automatico) { S.tambor(S.ahora()); tambor.classList.add('golpe'); setTimeout(() => tambor.classList.remove('golpe'), 90); }
        }, (t0 - S.ahora() + (4 + b) * beat) * 1000);
      }
      await espera((t0 - S.ahora() + (4 + golpes) * beat) * 1000 + 300);
      let bien = 0;
      for (let b = 0; b < golpes; b++) {
        // margen flexible (±220 ms) y contando el retraso del parlante: el alumno toca cuando OYE el clic (pedido de la dueña)
        const t = t0 + (4 + b) * beat + S.retraso(), cerca = toques.some(x => Math.abs(x - t) < .22);
        luces.children[b].className = cerca ? 'bien' : 'mal';
        if (cerca) bien++;
      }
      return bien;
    }
    await ejemplo(cont, async () => { await ronda(true, 72); luces.querySelectorAll('i').forEach(i => { i.className = 'bien'; }); });
    /* dos rondas: la segunda un poco más rápida */
    let total = 0;
    for (const tempo of [72, 88]) {
      let bien = await ronda(false, tempo);
      total += bien;   // cuenta el primer intento
      for (let otra = 0; bien < 6 && otra < 2; otra++) {
        msj.className = 'mensaje'; msj.textContent = bien + ' de ' + golpes + ' · ¡Otra vez! ✏️'; S.error(); await espera(1600); msj.textContent = '';
        bien = await ronda(false, tempo);
      }
      msj.className = 'mensaje ' + (bien >= 6 ? 'bien' : 'mal');
      msj.textContent = bien >= 6 ? '¡Qué buen pulso!' : bien + ' de ' + golpes + ' a tiempo';
      bien >= 6 ? S.acierto() : S.error();
      await espera(1600); msj.textContent = '';
    }
    soltarTeclas();
    return { aciertos: total, intentos: golpes * 2 };
  }

  /* ---------- 4. Oído: escucha y elige (sube o baja, intervalos, mayor o menor, triadas, reposo) ---------- */
  async function oido(cont, o) {
    const [, modo, nivel] = (o.app || 'oido:sube').split(':');
    const M = window.Oido.MODOS[modo] || window.Oido.MODOS.sube;
    window.Oido.sembrar(o.rnd);
    const opts = { nivel: nivel || 'segundas y terceras', forma: M.opciones && M.opciones.forma ? M.opciones.forma[0] : '' };
    const cuantas = o.cuantas || 6;
    const cuenta = el('span', { class: 'contador' });
    const msj = el('div', { class: 'mensaje', 'aria-live': 'polite' });
    let actual = null, esperando = null;
    const escuchar = puff('🔊 Escuchar', 'cielo escuchar', () => actual && S.tocar(actual.pasos));
    const fila = el('div', { class: 'respuestas-juego' });
    cont.append(consigna(M.pregunta(), cuenta), escuchar, msj, fila);
    const botones = {};
    function pintar(ops) {
      fila.replaceChildren();
      ops.forEach(op => fila.append(botones[op] = puff(op, 'papel', () => esperando && esperando(op))));
    }
    await ejemplo(cont, async () => {
      actual = M.crear(opts); pintar(actual.opciones);
      await espera(S.tocar(actual.pasos) * 1000 + 200);
      botones[actual.correcta].classList.add('pista', 'bien'); msj.textContent = actual.correcta + '!';
      await espera(1500); botones[actual.correcta].classList.remove('pista', 'bien'); msj.textContent = '';
    });
    S.reiniciarEscalera();
    const lista = Array.from({ length: cuantas }, () => M.crear(opts));
    const bien = await conCorreccion(lista, async pr => {
      actual = pr; pintar(actual.opciones);
      setTimeout(() => S.tocar(actual.pasos), 250);
      const r = await new Promise(res => { esperando = res; }); esperando = null;
      const ok = r === actual.correcta;
      if (ok) { S.acierto(); botones[r].classList.add('bien'); msj.className = 'mensaje bien'; msj.textContent = '¡Sí!'; }
      else { S.error(); botones[r].classList.add('mal'); botones[actual.correcta].classList.add('bien'); msj.className = 'mensaje mal'; msj.textContent = 'Era ' + actual.correcta; }
      await espera(ok ? 800 : 1600); msj.textContent = '';
      return ok;
    }, cuenta, msj);
    return { aciertos: bien, intentos: cuantas };
  }

  /* ---------- 4b. Intervalos en el teclado (piano; pedido de la dueña, 29-oct: que se vean y se practiquen) ----------
     Se marca una tecla y se pide un intervalo hacia arriba; al tocar, cada tecla avanzada (blanca o negra) muestra su
     número: así se cuentan los semitonos. El mismo juego que el modo «Intervalos» del piano virtual del sitio. */
  const INTERVALOS_TECLADO = { 27: [1, 2, 3, 4], 28: [5, 6, 7, 12], 29: [8, 9, 10, 11] };
  const NOMBRE_INT = { 1: '2ª menor', 2: '2ª mayor', 3: '3ª menor', 4: '3ª mayor', 5: '4ª justa', 6: 'tritono', 7: '5ª justa',
    8: '6ª menor', 9: '6ª mayor', 10: '7ª menor', 11: '7ª mayor', 12: 'octava' };
  const unaInt = st => (st === 6 ? 'un ' : 'una ') + NOMBRE_INT[st];
  const semis = n => n + (n === 1 ? ' semitono' : ' semitonos');
  const NOMBRE_ST = ['Do', 'Do♯', 'Re', 'Re♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'];
  const BLANCA = [0, 2, 4, 5, 7, 9, 11];
  async function teclado(cont, o) {
    const cuales = INTERVALOS_TECLADO[o.semana] || [1, 2, 3, 4];
    const cuantas = o.cuantas || 6, HASTA = 19;   // de Do4 (0) a Sol5 (19)
    const cuenta = el('span', { class: 'contador' });
    const msj = el('div', { class: 'mensaje', 'aria-live': 'polite' });
    const pedido = el('p', { class: 'pedido-intervalo' });
    const teclas = {};
    const tec = el('div', { class: 'teclado-juego', role: 'group', 'aria-label': 'Teclado' });
    let blancas = 0;
    for (let st = 0; st <= HASTA; st++) {
      const negra = BLANCA.indexOf(st % 12) < 0;
      const b = el('button', { type: 'button', class: 'tecla-j ' + (negra ? 'negra' : 'blanca'), 'aria-label': NOMBRE_ST[st % 12] + (st >= 12 ? ' de arriba' : '') });
      if (negra) b.style.left = 'calc(' + blancas + ' * var(--ancho-blanca) - var(--ancho-negra) / 2)';
      else blancas++;
      b.addEventListener('pointerdown', e => { e.preventDefault(); if (esperando) esperando(st); });
      b.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && esperando) { e.preventDefault(); esperando(st); } });
      teclas[st] = b; tec.append(b);
    }
    tec.style.setProperty('--blancas', blancas);
    cont.append(consigna('Cuenta los semitonos', cuenta), pedido, tec, msj);
    let esperando = null;
    const limpiar = () => Object.values(teclas).forEach(t => { t.classList.remove('desde', 'llega', 'mal'); t.replaceChildren(); });
    const contar = (desde, hasta, mal) => { for (let k = 1; k <= hasta - desde; k++) teclas[desde + k].append(el('span', { class: 'cuenta-st' + (mal ? ' mal' : ''), text: String(k) })); };
    function pregunta() {
      const st = uno(o.rnd, cuales);
      const ops = []; for (let d = 0; d + st <= HASTA; d++) if (BLANCA.indexOf(d % 12) >= 0) ops.push(d);
      return { desde: uno(o.rnd, ops), st };
    }
    function mostrar(pr) {
      limpiar(); teclas[pr.desde].classList.add('desde');
      pedido.textContent = 'Desde ' + NOMBRE_ST[pr.desde % 12] + ', toca ' + unaInt(pr.st);
    }
    await ejemplo(cont, async () => {
      const pr = { desde: 0, st: cuales[cuales.length - 1] };
      mostrar(pr);
      for (let k = 1; k <= pr.st; k++) { teclas[pr.desde + k].append(el('span', { class: 'cuenta-st', text: String(k) })); S.toque(); await espera(260); }
      teclas[pr.desde + pr.st].classList.add('llega');
      S.nota(60 + pr.desde); await espera(380); S.nota(60 + pr.desde + pr.st);
      msj.textContent = '¡' + NOMBRE_INT[pr.st].charAt(0).toUpperCase() + NOMBRE_INT[pr.st].slice(1) + ': ' + semis(pr.st) + '!';
      await espera(1800); msj.textContent = ''; limpiar(); pedido.textContent = '';
    });
    S.reiniciarEscalera();
    const lista = Array.from({ length: cuantas }, pregunta);
    const bien = await conCorreccion(lista, async pr => {
      mostrar(pr);
      const toco = await new Promise(res => { esperando = res; }); esperando = null;
      const d = toco - pr.desde, ok = d === pr.st;
      if (ok) {
        contar(pr.desde, toco); teclas[toco].classList.add('llega');
        S.nota(60 + pr.desde); setTimeout(() => S.nota(60 + toco), 380); S.acierto();
        msj.className = 'mensaje bien'; msj.textContent = '¡Sí! ' + semis(pr.st);
      } else {
        S.error();
        if (d > 0 && NOMBRE_INT[d]) { contar(pr.desde, toco, true); teclas[toco].classList.add('mal'); }
        msj.className = 'mensaje mal';
        msj.textContent = d > 0 && NOMBRE_INT[d] ? 'Esa es ' + unaInt(d) + ' (' + semis(d) + '). Busca ' + semis(pr.st) + '.' : 'Sube desde la tecla marcada.';
      }
      await espera(ok ? 1300 : 2200); msj.textContent = '';
      return ok;
    }, cuenta, msj);
    limpiar(); pedido.textContent = '';
    return { aciertos: bien, intentos: cuantas };
  }

  /* ---------- 4c. Armaduras (29-oct, pedido de la dueña): el orden de los sostenidos y los bemoles, la tonalidad de una
     armadura y su relativa menor, de varias maneras en la misma práctica para interiorizarlo (como la app «Armaduras»
     del sitio, que comparte sus datos: motores/armaduras.js). ---------- */
  function dibujarArmadura(div, vfKey) {
    div.replaceChildren();
    const VF = Vex.Flow, r = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    r.resize(300, 110);
    const ctx = r.getContext(); ctx.setFillStyle('#2B241C'); ctx.setStrokeStyle('#2B241C');
    const st = new VF.Stave(8, 8, 284); st.addClef('treble'); if (vfKey && vfKey !== 'C') st.addKeySignature(vfKey);
    st.setContext(ctx).draw();
    const svg = div.querySelector('svg'); svg.setAttribute('viewBox', '0 0 300 110'); svg.style.width = ''; svg.style.height = '';
  }
  async function armadura(cont, o) {
    const A = window.Armaduras, modo = (o.app || '').split(':')[1] || 'sostenidos';
    const fams = modo === 'sostenidos' ? ['s'] : modo === 'bemoles' ? ['b'] : ['s', 'b'];
    const datos = f => f === 's' ? { orden: A.SOSTENIDOS, signo: '♯', mayores: A.MAYORES_S, menores: A.MENORES_S, vf: A.VF_S }
      : { orden: A.BEMOLES, signo: '♭', mayores: A.MAYORES_B, menores: A.MENORES_B, vf: A.VF_B };
    const cuenta = el('span', { class: 'contador' });
    const msj = el('div', { class: 'mensaje', 'aria-live': 'polite' });
    const pedido = el('p', { class: 'pedido-intervalo' });
    const pent = el('div', { class: 'pentagrama-armadura' });
    const regla = el('p', { class: 'regla-armadura', 'aria-live': 'polite' });
    const fila = el('div', { class: 'respuestas-juego armaduras' });
    cont.append(consigna('Armaduras', cuenta), pedido, pent, fila, msj, regla);
    const botones = (ops, alElegir) => { fila.replaceChildren(); return ops.map(op => { const b = puff(op, 'papel', () => alElegir(op, b)); b.dataset.op = op; fila.append(b); return b; }); };
    /* las preguntas: primero ordenar, después descubrir la tonalidad, contar las alteraciones y (en el círculo) la relativa */
    function hacer(tipo) {
      const f = uno(o.rnd, fams), d = datos(f), n = 1 + Math.floor(o.rnd() * (tipo === 'relativa' ? 5 : 7));
      return { tipo, f, n, d };
    }
    const tipos = modo === 'relativas' ? ['orden', 'relativa', 'relativa', 'tonalidad', 'relativa', 'cuantas'] : ['orden', 'tonalidad', 'tonalidad', 'cuantas', 'tonalidad', 'cuantas'];
    async function preguntar(pr) {
      const { d, n, f } = pr;
      regla.textContent = ''; msj.textContent = '';
      if (pr.tipo === 'orden') {
        pedido.textContent = 'Toca los ' + (f === 's' ? 'sostenidos' : 'bemoles') + ' en orden';
        dibujarArmadura(pent, 'C');
        let k = 0, errores = 0;
        await new Promise(listo => {
          const bs = botones(mezclar(o.rnd, d.orden.map(x => x + d.signo)), (op, b) => {
            if (b.disabled) return;
            if (op === d.orden[k] + d.signo) { k++; b.disabled = true; b.classList.add('bien'); dibujarArmadura(pent, d.vf[k]); S.toque(); if (k === 7) listo(); }
            else { errores++; S.error(); b.classList.add('mal'); setTimeout(() => b.classList.remove('mal'), 500); }
          });
          if (!bs.length) listo();
        });
        regla.textContent = d.orden.map(x => x + d.signo).join(' · ');
        const ok = errores === 0;
        ok ? S.acierto() : null; msj.className = 'mensaje ' + (ok ? 'bien' : 'mal'); msj.textContent = ok ? '¡Perfecto!' : '¡Completo! Otra vez sin errores';
        await espera(1800);
        return ok;
      }
      let ops, correcta, texto;
      if (pr.tipo === 'tonalidad') {
        pedido.textContent = '¿En qué tonalidad mayor estás?'; dibujarArmadura(pent, d.vf[n]);
        correcta = d.mayores[n] + ' mayor';
        ops = mezclar(o.rnd, mezclar(o.rnd, d.mayores.slice(1).map(m => m + ' mayor').filter(m => m !== correcta)).slice(0, 3).concat([correcta]));
        texto = A.reglaDe(f, n);
      } else if (pr.tipo === 'cuantas') {
        pedido.textContent = '¿Cuántos ' + (f === 's' ? 'sostenidos' : 'bemoles') + ' tiene ' + d.mayores[n] + ' mayor?'; dibujarArmadura(pent, 'C');
        correcta = n + ' ' + d.signo; ops = [1, 2, 3, 4, 5, 6, 7].map(k => k + ' ' + d.signo);
        texto = A.reglaDe(f, n);
      } else {
        pedido.textContent = d.mayores[n] + ' mayor: ¿su relativa menor?'; dibujarArmadura(pent, d.vf[n]);
        correcta = d.menores[n] + ' menor';
        ops = mezclar(o.rnd, mezclar(o.rnd, d.menores.slice(0, 7).map(m => m + ' menor').filter(m => m !== correcta)).slice(0, 3).concat([correcta]));
        texto = 'Misma armadura, 3 semitonos abajo: ' + d.mayores[n] + ' → ' + d.menores[n];
      }
      const r = await new Promise(res => botones(ops, op => res(op)));
      const ok = r === correcta;
      fila.querySelectorAll('.puff').forEach(b => { b.disabled = true; if (b.dataset.op === correcta) b.classList.add('bien'); else if (b.dataset.op === r) b.classList.add('mal'); });
      if (pr.tipo === 'cuantas') dibujarArmadura(pent, d.vf[n]);
      ok ? S.acierto() : S.error();
      msj.className = 'mensaje ' + (ok ? 'bien' : 'mal'); msj.textContent = ok ? '¡Sí!' : 'Era ' + correcta;
      regla.textContent = texto;
      await espera(ok ? 1500 : 2600);
      return ok;
    }
    await ejemplo(cont, async () => {
      const d = datos(fams[0]);
      pedido.textContent = 'Mira el orden de los ' + (fams[0] === 's' ? 'sostenidos' : 'bemoles');
      for (let k = 0; k <= 7; k++) { dibujarArmadura(pent, d.vf[k]); regla.textContent = d.orden.slice(0, k).map(x => x + d.signo).join(' · '); if (k) S.toque(); await espera(420); }
      regla.textContent = A.reglaDe(fams[0], 2); await espera(2000);
      regla.textContent = ''; pedido.textContent = ''; dibujarArmadura(pent, 'C');
    });
    S.reiniciarEscalera();
    const lista = tipos.map(hacer);
    const bien = await conCorreccion(lista, preguntar, cuenta, msj);
    return { aciertos: bien, intentos: lista.length };
  }

  /* ---------- 4d. Rondas de elegir (29-oct): el círculo de quintas, acordes e inversiones, modos griegos y palabras de
     música. Todas igual: un ejemplo resuelto, después las preguntas con botones esponjosos, la regla debajo de cada
     respuesta y la vuelta de corrección. crear(rnd) devuelve { texto, ops, correcta, regla, dibujar(div), sonar() }. ---------- */
  async function rondaElegir(cont, o, titulo, crear, cuantas) {
    const cuenta = el('span', { class: 'contador' });
    const msj = el('div', { class: 'mensaje', 'aria-live': 'polite' });
    const pedido = el('p', { class: 'pedido-intervalo' });
    const visual = el('div', { class: 'visual-elegir' });
    const otraVez = puff('🔊', 'cielo escuchar-chico', () => actual && actual.sonar && actual.sonar());
    otraVez.setAttribute('aria-label', 'Escuchar otra vez'); otraVez.hidden = true;
    const fila = el('div', { class: 'respuestas-juego elegir' });
    const regla = el('p', { class: 'regla-armadura', 'aria-live': 'polite' });
    cont.append(consigna(titulo, cuenta), pedido, visual, otraVez, fila, msj, regla);
    let actual = null;
    function mostrar(pr) {
      actual = pr; pedido.textContent = pr.texto; regla.textContent = ''; msj.textContent = '';
      visual.replaceChildren(); if (pr.dibujar) pr.dibujar(visual);
      otraVez.hidden = !pr.sonar; if (pr.sonar) pr.sonar();
    }
    const botones = (pr, alElegir) => { fila.replaceChildren(); pr.ops.forEach(op => { const b = puff(op, 'papel', () => alElegir(op)); b.dataset.op = op; fila.append(b); }); };
    await ejemplo(cont, async () => {
      const pr = crear(o.rnd); mostrar(pr); botones(pr, () => { });
      await espera(1600);
      const b = fila.querySelector('[data-op="' + CSS.escape(pr.correcta) + '"]'); if (b) b.classList.add('pista');
      msj.textContent = '¡' + pr.correcta + '!'; regla.textContent = pr.regla;
      await espera(2600); if (b) b.classList.remove('pista'); msj.textContent = ''; regla.textContent = '';
    });
    S.reiniciarEscalera();
    const lista = Array.from({ length: cuantas }, () => crear(o.rnd));
    const bien = await conCorreccion(lista, async pr => {
      mostrar(pr);
      const r = await new Promise(res => botones(pr, op => res(op)));
      const ok = r === pr.correcta;
      fila.querySelectorAll('.puff').forEach(b => { b.disabled = true; if (b.dataset.op === pr.correcta) b.classList.add('bien'); else if (b.dataset.op === r) b.classList.add('mal'); });
      ok ? S.acierto() : S.error();
      msj.className = 'mensaje ' + (ok ? 'bien' : 'mal'); msj.textContent = ok ? '¡Sí!' : 'Era ' + pr.correcta;
      regla.textContent = pr.regla;
      if (pr.alResponder) pr.alResponder(visual);
      await espera(ok ? 1600 : 2700);
      return ok;
    }, cuenta, msj);
    return { aciertos: bien, intentos: lista.length };
  }
  const tres = (rnd, todas, correcta) => mezclar(rnd, mezclar(rnd, todas.filter(x => x !== correcta)).slice(0, 3).concat([correcta]));
  /* un pentagrama con notas (acorde o escala); resaltar: índice de la nota en ocre */
  function pentagramaNotas(div, claves, juntas, resaltar) {
    const VF = Vex.Flow, r = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    r.resize(320, 120);
    const ctx = r.getContext(); ctx.setFillStyle('#2B241C'); ctx.setStrokeStyle('#2B241C');
    const st = new VF.Stave(6, 8, 308); st.addClef('treble').setContext(ctx).draw();
    if (juntas) VF.Formatter.FormatAndDraw(ctx, st, [new VF.StaveNote({ keys: claves, duration: 'w' })]);
    else {
      const ns = claves.map((k, i) => { const n = new VF.StaveNote({ keys: [k], duration: 'q' }); if (i === resaltar) n.setStyle({ fillStyle: '#B07A2A', strokeStyle: '#B07A2A' }); return n; });
      const v = new VF.Voice({ num_beats: claves.length, beat_value: 4 }).setMode(VF.Voice.Mode.SOFT).addTickables(ns);
      new VF.Formatter().joinVoices([v]).format([v], 250); v.draw(ctx, st);
    }
    const svg = div.querySelector('svg'); svg.setAttribute('viewBox', '0 0 320 120'); svg.style.width = ''; svg.style.height = '';
    div.classList.add('papel-pentagrama');
  }
  const MIDI_LETRA = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  const midiDeClave = k => { const [l, oct] = k.split('/'); return 12 * (Number(oct) + 1) + MIDI_LETRA[l]; };

  /* el círculo de quintas en chiquito, con una tonalidad marcada */
  function circuloMini(div, marcada) {
    const C = window.Circulo, NS = 'http:/' + '/www.w3.org/2000/svg';
    const n = (t, a, x) => { const e = document.createElementNS(NS, t); Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v)); if (x != null) e.textContent = x; return e; };
    const s = n('svg', { viewBox: '0 0 300 300', class: 'circulo-mini', role: 'img', 'aria-label': 'Círculo de quintas' });
    for (let i = 0; i < 12; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 6;
      [[118, C.C_MAYORES[i], 22, 17], [72, C.C_MENORES[i], 17, 12]].forEach(([R, t, rad, f], k) => {
        const x = 150 + R * Math.cos(a), y = 150 + R * Math.sin(a), es = i === marcada && k === 0;
        s.append(n('circle', { cx: x, cy: y, r: rad, fill: es ? '#F1E0BC' : k ? '#E1E6CF' : '#FFFDF8', stroke: es ? '#B07A2A' : '#CDBF9F', 'stroke-width': es ? 3 : 1.5 }));
        s.append(n('text', { x, y: y + f / 3, 'text-anchor': 'middle', 'font-size': f, 'font-family': 'Caveat, cursive', fill: '#48592F' }, t));
      });
    }
    div.append(s); div.classList.add('papel-pentagrama');
  }
  /* ---------- el círculo de quintas (lección 42) ---------- */
  function circulo(cont, o) {
    const C = window.Circulo;
    return rondaElegir(cont, o, 'Círculo de quintas', rnd => {
      const i = uno(rnd, C.PREGUNTABLES), tipo = uno(rnd, ['v', 'iv', 'relativa', 'alt', 'acordes']), M = C.C_MAYORES, m = C.C_MENORES;
      const base = { dibujar: d => circuloMini(d, i) };
      if (tipo === 'v') return Object.assign(base, { texto: '¿Cuál es el V de ' + M[i] + ' mayor? (su vecina de la derecha)', correcta: M[C.vecina(i, 1)], ops: tres(rnd, M, M[C.vecina(i, 1)]), regla: C.reglaAcordes(i) });
      if (tipo === 'iv') return Object.assign(base, { texto: '¿Cuál es el IV de ' + M[i] + ' mayor? (su vecina de la izquierda)', correcta: M[C.vecina(i, -1)], ops: tres(rnd, M, M[C.vecina(i, -1)]), regla: C.reglaAcordes(i) });
      if (tipo === 'relativa') return Object.assign(base, { texto: '¿Cuál es la relativa menor de ' + M[i] + ' mayor?', correcta: m[i], ops: tres(rnd, m, m[i]), regla: 'Justo adentro, con la misma armadura: ' + M[i] + ' → ' + m[i] });
      if (tipo === 'alt') { const t = C.altTexto(i); return Object.assign(base, { texto: '¿Cuántas alteraciones tiene ' + M[i] + ' mayor?', correcta: t, ops: tres(rnd, C.PREGUNTABLES.map(C.altTexto), t), regla: 'Cada paso hacia la derecha suma un sostenido; hacia la izquierda, un bemol.' }); }
      const fuera = C.PREGUNTABLES.map(k => M[k]).filter(x => ![M[i], M[C.vecina(i, -1)], M[C.vecina(i, 1)]].includes(x));
      const intrusa = uno(rnd, fuera);
      return Object.assign(base, { texto: '¿Qué acorde NO es de ' + M[i] + ' mayor?', correcta: intrusa, ops: mezclar(rnd, [M[i], M[C.vecina(i, -1)], M[C.vecina(i, 1)], intrusa]), regla: C.reglaAcordes(i) });
    }, o.cuantas || 6);
  }
  /* ---------- acordes e inversiones (lección 36) ---------- */
  function acordes(cont, o) {
    const A = window.Acordes;
    return rondaElegir(cont, o, 'Acordes e inversiones', rnd => {
      const a = uno(rnd, A.ACORDES), inv = Math.floor(rnd() * 3), claves = A.clavesDe(a, inv), tipo = uno(rnd, ['inversion', 'nombre', 'barra']);
      const base = { dibujar: d => pentagramaNotas(d, claves, true), sonar: () => claves.forEach((k, j) => setTimeout(() => S.nota(midiDeClave(k), 1.4), j * 110)) };
      if (tipo === 'inversion') return Object.assign(base, { texto: '¿Qué inversión es?', ops: A.INVERSIONES.slice(), correcta: A.INVERSIONES[inv], regla: A.reglaDe(a, inv) });
      if (tipo === 'nombre') { const c = A.nombreAcorde(a); return Object.assign(base, { texto: '¿Qué acorde es?', correcta: c, ops: tres(rnd, A.ACORDES.map(A.nombreAcorde), c), regla: 'En terceras: ' + A.notasDe(a, 0).map(l => A.NOTAS_ES[l]).join('-') + ' → ' + c }); }
      const c = A.conBarra(a, inv);
      return Object.assign(base, { texto: '¿Cómo se escribe con barra?', correcta: c, ops: mezclar(rnd, [...new Set([c, A.conBarra(a, 0), A.conBarra(a, 1), A.conBarra(a, 2)])]), regla: 'Después de la barra va la nota del bajo. ' + A.reglaDe(a, inv) });
    }, o.cuantas || 6);
  }
  /* ---------- modos griegos (lecciones 53 a 60; modos:N = los N primeros) ---------- */
  function modos(cont, o) {
    const Mo = window.Modos, n = Math.max(1, Math.min(7, Number((o.app || '').split(':')[1]) || 7)), conocidos = Mo.MODOS_G.slice(0, n);
    const tipos = n === 1 ? ['ver'] : n === 2 ? ['ver', 'oido'] : ['ver', 'car', 'oido'];
    return rondaElegir(cont, o, 'Modos griegos', rnd => {
      const tipo = uno(rnd, tipos);
      if (tipo === 'ver') {
        const m = n === 1 ? uno(rnd, Mo.MODOS_G) : uno(rnd, conocidos), e = Mo.escalaBlanca(m);
        return { texto: 'Desde ' + e.nombres[0] + ', con las teclas blancas: ¿qué modo es?', ops: mezclar(rnd, Mo.MODOS_G.map(x => x.n)).slice(0, 7), correcta: m.n,
          regla: e.nombres[0] + ' → ' + m.n.toLowerCase() + ': ' + m.que, dibujar: d => pentagramaNotas(d, e.claves, false) };
      }
      if (tipo === 'car') {
        const m = uno(rnd, conocidos.filter(x => x.car !== null)), e = Mo.escalaBlanca(m), c = e.nombres[m.car];
        return { texto: '¿Cuál es la nota característica de ' + e.nombres[0] + ' ' + m.n.toLowerCase() + '?', ops: tres(rnd, e.nombres.slice(1, 7), c), correcta: c,
          regla: m.n + ': ' + m.que + ' → ' + c + ' (' + Mo.ORDINAL[m.car] + ')', dibujar: d => pentagramaNotas(d, e.claves, false), alResponder: d => { d.replaceChildren(); pentagramaNotas(d, e.claves, false, m.car); } };
      }
      const m = uno(rnd, conocidos);
      return { texto: 'Escucha: ¿qué modo es? (todos empiezan en Do)', ops: conocidos.map(x => x.n), correcta: m.n,
        regla: 'Primero: ¿mayor o menor? Después, la nota característica. ' + m.n + ': ' + m.que + '.',
        sonar: () => m.st.concat([12]).forEach((st, j) => setTimeout(() => S.nota(60 + st, .45), j * 300)) };
    }, o.cuantas || 6);
  }
  /* ---------- palabras de música (en cualquier lección, hasta la etapa del alumno) ---------- */
  function palabras(cont, o) {
    const todas = (window.PALABRAS_MUSICA || []).filter(x => x.e <= (o.etapa || 7));
    return rondaElegir(cont, o, 'Palabras de música', rnd => {
      const w = uno(rnd, todas);
      return { texto: w.d, correcta: w.p, ops: tres(rnd, todas.map(x => x.p), w.p), regla: '«' + w.p + '»' };
    }, o.cuantas || 5);
  }

  /* ---------- 5. La hoja de práctica de la lección, resuelta en la pantalla ---------- */
  async function hoja(cont, o) {
    const papel = el('div', { class: 'hoja-papel' });
    const scroll = el('div', { class: 'hoja-scroll' }, papel);
    const revisar = puff('✓ Revisar', 'grande');
    const acciones = el('div', { class: 'hoja-acciones' }, revisar);
    cont.append(consigna('Resuelve tu hoja'), scroll, acciones);
    window.Hoja.armar(papel, o.semana, o.ins, o.semillaNum);
    /* Al revisar, lo que está bien queda fijo y solo se corrige lo que salió en rojo. Si vuelve a equivocarse,
       aparecen las respuestas de lo que falta. Cuenta lo que estuvo bien la primera vez. */
    return new Promise(listo => {
      let primera = null, vueltas = 0;
      revisar.addEventListener('click', () => {
        const r = window.Hoja.revisar();
        window.Hoja.fijarBien();
        if (!primera) primera = r;
        vueltas++;
        scroll.scrollTo({ top: 0, behavior: 'smooth' });
        if (r.bien < r.total && vueltas < 3) {
          r.bien ? S.acierto() : S.error();
          if (vueltas === 2) window.Hoja.soluciones();
          revisar.querySelector('.cara').textContent = '✏️ Revisar otra vez (' + (r.total - r.bien) + ')';
          const rojo = papel.querySelector('.mal'); if (rojo) rojo.scrollIntoView({ block: 'center', behavior: 'smooth' });
          return;
        }
        r.bien === r.total ? S.festejo() : S.acierto();
        if (r.bien < r.total) window.Hoja.soluciones();
        revisar.remove();
        acciones.append(puff((r.bien === r.total ? '¡Hoja perfecta! ' : '') + 'Seguir →', 'ocre grande', () => listo({ aciertos: primera.bien, intentos: Math.max(1, primera.total) })));
      });
    });
  }

  /* ---------- 6. Lectura en voz alta: di el nombre de cada nota (la lectura hablada del sitio) ---------- */
  const hayVoz = () => !!((window.Voz && window.Voz.soportado()) || window.SpeechRecognition || window.webkitSpeechRecognition);
  async function voz(cont, o) {
    const keys = poolNotas(o.semana, o.ins).filter(n => n.clave === 'treble').map(n => n.key);
    cont.append(consigna('Lee las notas en voz alta 🎤'));
    /* el oído del osito (Vosk): la primera vez se baja (40 MB) y queda guardado en el celular */
    if (window.Voz && window.Voz.soportado() && !window.Voz.listo()) {
      const barra = el('i'), pct = el('span', { text: '0 %' });
      const carga = el('div', { class: 'tarjeta preparando' }, el('p', { class: 'mano', text: 'Preparando el oído del osito… 👂' }), el('div', { class: 'barra-carga' }, barra), pct);
      cont.append(carga);
      try {
        await window.Voz.preparar(x => { barra.style.transform = 'scaleX(' + x + ')'; pct.textContent = Math.round(x * 100) + ' %'; });
      } catch (e) {
        carga.replaceChildren(el('p', { class: 'mano', text: 'Hoy no se pudo preparar el oído del osito. ¡Seguimos con lo demás! 🌲' }));
        await espera(2200);
        return null;   // se salta: no cuenta en contra
      }
      carga.remove();
    }
    cont.append(el('div', { class: 'tarjeta', html: '<p class="mano" style="margin:0;font-size:1.4rem">Permite el micrófono, toca ▶ Empezar y di cada nota sin parar.</p>' }));
    return new Promise(listo => {
      let terminado = false;
      window.SprinkloudLectura.abrir({ clave: 'treble', notas: keys, microfono: true, alTerminar: (ok, total) => { terminado = true; setTimeout(() => { const d = document.querySelector('dialog.lh'); if (d && d.open) d.close(); listo({ aciertos: ok, intentos: total }); }, 1800); } });
      const d = document.querySelector('dialog.lh');
      d.addEventListener('close', () => { if (!terminado) { terminado = true; listo(null); } }, { once: true });
    });
  }

  /* ---------- El plan de hoy: la actividad de la lección, la hoja, la voz y un repaso ---------- */
  const ICONOS = { notas: '🎼', ritmo: '🥁', oido: '👂', teclado: '🎹', armadura: '♯', circulo: '🧭', acordes: '🎶', modos: '🌈', palabras: '📖', hoja: '📝', voz: '🎤', repaso: '🌰' };
  function tipoDe(app) { return /^oido/.test(app) ? 'oido' : /^armaduras/.test(app) ? 'armadura' : /^circulo/.test(app) ? 'circulo' : /^acordes/.test(app) ? 'acordes' : /^modos/.test(app) ? 'modos' : app === 'notas' ? 'notas' : 'ritmo'; }
  function correr(tipo, cont, o) { return ({ notas, oido, armadura, circulo, acordes, modos, palabras })[tipo] ? ({ notas, oido, armadura, circulo, acordes, modos, palabras })[tipo](cont, o) : ritmo(cont, o); }
  function plan(estado) {
    const l = estado.leccion, ins = estado.instrumento;
    const semillaNum = semillaDe(estado.alumno + '|' + estado.hoy + '|' + l.semana);
    const rnd = azarCon(semillaNum);
    const base = { semana: l.semana, ins, rnd, semillaNum, app: l.app, etapa: l.etapa };
    const tipo = tipoDe(l.app);
    const lista = [{ tipo, icono: ICONOS[tipo], correr: cont => correr(tipo, cont, base) }];
    // piano, lecciones de intervalos: primero en el teclado (se ven los semitonos) y después de oído
    if (ins === 'piano' && INTERVALOS_TECLADO[l.semana]) lista.unshift({ tipo: 'teclado', icono: ICONOS.teclado, correr: cont => teclado(cont, base) });
    if (window.Hoja.tieneHoja(l.semana)) lista.push({ tipo: 'hoja', icono: ICONOS.hoja, correr: cont => hoja(cont, base) });
    // palabras de música, un día sí y otro no, con las palabras hasta su etapa (pedido de la dueña, 29-oct)
    if (l.semana > 6 && rnd() < .5) lista.push({ tipo: 'palabras', icono: ICONOS.palabras, correr: cont => palabras(cont, base) });
    if (l.semana >= 8 && hayVoz()) {
      lista.push({ tipo: 'voz', icono: ICONOS.voz, correr: cont => voz(cont, base) });
      if (window.Voz && window.Voz.soportado()) window.Voz.preparar().catch(() => { });   // se va bajando mientras hace las otras actividades
    }
    if (l.semana > 1) {
      /* los temas complejos (intervalos, armaduras, relativas y el círculo) se repasan más: valen 3 veces (pedido de la dueña) */
      const COMPLEJOS = /^(oido:intervalos|armaduras|circulo|acordes|modos|oido:mayorMenor|oido:triadas)/;
      const anteriores = [].concat(...estado.camino.filter(c => c.semana < l.semana).map(c => COMPLEJOS.test(c.app || '') ? [c.semana, c.semana, c.semana] : [c.semana]));
      const s = uno(rnd, anteriores);
      const appRepaso = (estado.camino.find(c => c.semana === s) || {}).app || 'ritmo';
      const t = tipoDe(appRepaso);
      lista.push({ tipo: 'repaso', icono: ICONOS.repaso, correr: cont => correr(t, cont, Object.assign({}, base, { semana: s, app: appRepaso, cuantas: 5 })) });
    }
    return lista;
  }
  return { plan, ICONOS, el, puff, espera, semillaDe, azarCon };
})();
