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
    for (i = 0; i < cuantas; i++) {
      const n = preguntas[i];
      cuenta.textContent = (i + 1) + ' / ' + cuantas;
      dibujarNota(papel, n);
      const l = await new Promise(r => { esperando = r; });
      esperando = null;
      const ok = l === n.key[0];
      if (ok) { bien++; S.acierto(); S.nota(midiDe(n.key), .6); botones[l].classList.add('bien'); msj.className = 'mensaje bien'; msj.textContent = uno(o.rnd, ['¡Sí!', '¡Muy bien!', '¡Eso!', '¡Bravo!']); }
      else { S.error(); botones[l].classList.add('mal'); botones[n.key[0]].classList.add('bien'); msj.className = 'mensaje mal'; msj.textContent = 'Era ' + NOMBRE[n.key[0]]; }
      await espera(ok ? 650 : 1300);
      Object.values(botones).forEach(b => b.classList.remove('bien', 'mal')); msj.textContent = '';
    }
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
    for (let i = 0; i < cuantas; i++) {
      cuenta.textContent = (i + 1) + ' / ' + cuantas;
      actual = pregunta();
      const elegido = await new Promise(r => { pintar(actual, (ids, b) => r({ ids, b })); setTimeout(() => tocarCompas(actual.ids, p.compas, p.tempo), 300); });
      const ok = elegido.ids.join() === actual.ids.join();
      opciones.querySelectorAll('.puff').forEach(b => { b.disabled = true; });
      if (ok) { bien++; S.acierto(); elegido.b.classList.add('pista'); msj.className = 'mensaje bien'; msj.textContent = '¡Así sonó!'; }
      else { S.error(); opciones.querySelector('[data-ids="' + actual.ids.join() + '"]').classList.add('pista'); msj.className = 'mensaje mal'; msj.textContent = 'Sonó la marcada'; }
      await espera(ok ? 900 : 1700); msj.textContent = '';
    }
    return { aciertos: bien, intentos: cuantas };
  }

  /* ---------- 3. Marcar el pulso: toca el tambor justo con el clic ---------- */
  async function pulso(cont, o) {
    const golpes = 8;
    const luces = el('div', { class: 'pulso-luces' }, Array.from({ length: golpes }, () => el('i')));
    const msj = el('div', { class: 'mensaje', 'aria-live': 'polite' });
    let toques = [];
    const tambor = puff('🥁', 'madera redondo tambor', () => { toques.push(S.ahora()); S.tambor(S.ahora()); tambor.classList.add('golpe'); setTimeout(() => tambor.classList.remove('golpe'), 90); });
    cont.append(consigna('Toca el tambor con el pulso'), luces, tambor, msj);
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
        const t = t0 + (4 + b) * beat, cerca = toques.some(x => Math.abs(x - t) < .17);
        luces.children[b].className = cerca ? 'bien' : 'mal';
        if (cerca) bien++;
      }
      return bien;
    }
    await ejemplo(cont, async () => { await ronda(true, 72); luces.querySelectorAll('i').forEach(i => { i.className = 'bien'; }); });
    /* dos rondas: la segunda un poco más rápida */
    let total = 0;
    for (const tempo of [72, 88]) {
      const bien = await ronda(false, tempo);
      total += bien;
      msj.className = 'mensaje ' + (bien >= 6 ? 'bien' : 'mal');
      msj.textContent = bien >= 6 ? '¡Qué buen pulso!' : bien + ' de ' + golpes + ' a tiempo';
      bien >= 6 ? S.acierto() : S.error();
      await espera(1600); msj.textContent = '';
    }
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
    let bien = 0;
    for (let i = 0; i < cuantas; i++) {
      cuenta.textContent = (i + 1) + ' / ' + cuantas;
      actual = M.crear(opts); pintar(actual.opciones);
      setTimeout(() => S.tocar(actual.pasos), 250);
      const r = await new Promise(res => { esperando = res; }); esperando = null;
      const ok = r === actual.correcta;
      if (ok) { bien++; S.acierto(); botones[r].classList.add('bien'); msj.className = 'mensaje bien'; msj.textContent = '¡Sí!'; }
      else { S.error(); botones[r].classList.add('mal'); botones[actual.correcta].classList.add('bien'); msj.className = 'mensaje mal'; msj.textContent = 'Era ' + actual.correcta; }
      await espera(ok ? 800 : 1600); msj.textContent = '';
    }
    return { aciertos: bien, intentos: cuantas };
  }

  /* ---------- 5. La hoja de práctica de la lección, resuelta en la pantalla ---------- */
  async function hoja(cont, o) {
    const papel = el('div', { class: 'hoja-papel' });
    const scroll = el('div', { class: 'hoja-scroll' }, papel);
    const revisar = puff('✓ Revisar', 'grande');
    const acciones = el('div', { class: 'hoja-acciones' }, revisar);
    cont.append(consigna('Resuelve tu hoja'), scroll, acciones);
    window.Hoja.armar(papel, o.semana, o.ins, o.semillaNum);
    return new Promise(listo => {
      revisar.addEventListener('click', () => {
        const r = window.Hoja.revisar();
        window.Hoja.soluciones();
        r.bien === r.total ? S.festejo() : r.bien ? S.acierto() : S.error();
        revisar.remove();
        const seguir = puff((r.bien === r.total ? '¡Hoja perfecta! ' : r.bien + ' de ' + r.total + ' · ') + 'Seguir →', 'ocre grande', () => listo({ aciertos: r.bien, intentos: Math.max(1, r.total) }));
        acciones.append(seguir);
        scroll.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  /* ---------- 6. Lectura en voz alta: di el nombre de cada nota (la lectura hablada del sitio) ---------- */
  const hayVoz = () => !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  async function voz(cont, o) {
    const keys = poolNotas(o.semana, o.ins).filter(n => n.clave === 'treble').map(n => n.key);
    cont.append(consigna('Lee las notas en voz alta 🎤'), el('div', { class: 'tarjeta', html: '<p class="mano" style="margin:0;font-size:1.4rem">Toca 🎤 Micrófono, luego ▶ Empezar, y di cada nota sin parar.</p>' }));
    return new Promise(listo => {
      let terminado = false;
      window.SprinkloudLectura.abrir({ clave: 'treble', notas: keys, alTerminar: (ok, total) => { terminado = true; setTimeout(() => { const d = document.querySelector('dialog.lh'); if (d && d.open) d.close(); listo({ aciertos: ok, intentos: total }); }, 1800); } });
      const d = document.querySelector('dialog.lh');
      d.addEventListener('close', () => { if (!terminado) { terminado = true; listo(null); } }, { once: true });
    });
  }

  /* ---------- El plan de hoy: la actividad de la lección, la hoja, la voz y un repaso ---------- */
  const ICONOS = { notas: '🎼', ritmo: '🥁', oido: '👂', hoja: '📝', voz: '🎤', repaso: '🌰' };
  function tipoDe(app) { return /^oido/.test(app) ? 'oido' : app === 'notas' ? 'notas' : 'ritmo'; }
  function correr(tipo, cont, o) { return tipo === 'notas' ? notas(cont, o) : tipo === 'oido' ? oido(cont, o) : ritmo(cont, o); }
  function plan(estado) {
    const l = estado.leccion, ins = estado.instrumento;
    const semillaNum = semillaDe(estado.alumno + '|' + estado.hoy + '|' + l.semana);
    const rnd = azarCon(semillaNum);
    const base = { semana: l.semana, ins, rnd, semillaNum, app: l.app };
    const tipo = tipoDe(l.app);
    const lista = [{ tipo, icono: ICONOS[tipo], correr: cont => correr(tipo, cont, base) }];
    if (window.Hoja.tieneHoja(l.semana)) lista.push({ tipo: 'hoja', icono: ICONOS.hoja, correr: cont => hoja(cont, base) });
    if (l.semana >= 8 && hayVoz()) lista.push({ tipo: 'voz', icono: ICONOS.voz, correr: cont => voz(cont, base) });
    if (l.semana > 1) {
      const anteriores = estado.camino.filter(c => c.semana < l.semana).map(c => c.semana);
      const s = uno(rnd, anteriores);
      const appRepaso = (estado.camino.find(c => c.semana === s) || {}).app || 'ritmo';
      const t = tipoDe(appRepaso);
      lista.push({ tipo: 'repaso', icono: ICONOS.repaso, correr: cont => correr(t, cont, Object.assign({}, base, { semana: s, app: appRepaso, cuantas: 5 })) });
    }
    return lista;
  }
  return { plan, ICONOS, el, puff, espera, semillaDe, azarCon };
})();
