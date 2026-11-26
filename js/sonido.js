/* Sonidos del bosque: los efectos se sintetizan con Web Audio (toques, aciertos, campanita de la tienda, caja registradora,
   la fogata que crepita) y la música de cada escena suena con Howler (archivos CC0 en assets/musica, ver CREDITOS.md). Los aciertos seguidos suben de tono, como una escalera que festeja. */
window.Sonido = (function () {
  'use strict';
  /* bus: los efectos y las notas pasan por aquí; salida: el volumen general. Para callar todo de golpe (callar) se cambia
     el bus por uno nuevo y el viejo se apaga: así se cortan también las notas que estaban programadas para después */
  let ctx = null, bus = null, salida = null, musicaBus = null, turno = 0;
  const pref = { sonido: leer('bosque-sonido', true), musica: leer('bosque-musica', true) };
  function leer(k, def) { try { const v = localStorage.getItem(k); return v === null ? def : v === '1'; } catch (e) { return def; } }
  function guardar(k, v) { try { localStorage.setItem(k, v ? '1' : '0'); } catch (e) { } }

  function audio() {
    if (!ctx) {
      /* 10-nov-2026 (la dueña: las notas sonaban con retraso): latencia de juego, y el audio se despierta con el primer toque */
      const C = window.AudioContext || window.webkitAudioContext;
      try { ctx = new C({ latencyHint: 'interactive' }); } catch (e) { ctx = new C(); }
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16; comp.ratio.value = 4;
      salida = ctx.createGain(); salida.gain.value = .9;
      bus = ctx.createGain(); bus.connect(salida);
      musicaBus = ctx.createGain(); musicaBus.gain.value = .22;
      salida.connect(comp); musicaBus.connect(comp); comp.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  /* el primer toque en cualquier parte despierta el audio, así la primera nota no espera a que arranque (10-nov-2026) */
  ['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => { if (ctx && ctx.state === 'suspended') ctx.resume(); }, { capture: true, passive: true }));

  /* Voz de piano: parciales armónicos con ataque rápido y caída natural. Lleva armónicos fuertes y el filtro abierto
     (5200 Hz): los parlantes del celular casi no dan los graves y la nota se reconoce por sus armónicos (antes sonaba
     «grave y bajito», 29-oct) */
  function piano(t, midi, dur, gain, destino) {
    const out = ctx.createGain(), lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 5200;
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(gain, t + .006);
    out.gain.setTargetAtTime(gain * .35, t + .006, .25);
    out.gain.setTargetAtTime(0.0001, t + Math.max(dur - .05, .08), .06);
    [[1, 1], [2, .62], [3, .36], [4, .2], [5, .1], [6, .05]].forEach(([h, a], k) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(hz(midi) * h * (1 + (k ? .0009 * k : 0)), t);
      g.gain.value = a; o.connect(g); g.connect(lp); o.start(t); o.stop(t + dur + .4);
    });
    lp.connect(out); out.connect(destino || bus);
  }
  /* Campanita de madera (marimba): cuerpo corto y redondo */
  function marimba(t, midi, gain) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o2.type = 'sine';
    o.frequency.setValueAtTime(hz(midi), t); o2.frequency.setValueAtTime(hz(midi) * 4, t);
    const g2 = ctx.createGain(); g2.gain.value = .18;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + .005); g.gain.exponentialRampToValueAtTime(0.0001, t + .55);
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(bus);
    o.start(t); o2.start(t); o.stop(t + .6); o2.stop(t + .6);
  }
  function ruido(t, dur, frecuencia, gain) {
    const n = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate), d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = n; f.type = 'bandpass'; f.frequency.value = frecuencia; f.Q.value = .8; g.gain.value = gain;
    s.connect(f); f.connect(g); g.connect(bus); s.start(t);
  }
  const ok = () => pref.sonido && audio();
  /* Navidad (25-nov-2026, pedido de la dueña): los toques, la calcomanía que se pega, la hoja del libro y la caja de la
     tienda suenan a cascabeles y campanitas, sin el «golpe» ni el «viento» (ruido) que no le gustan. */
  /* En la práctica no cambia nada (la dueña: los ejercicios y los ejemplos tienen que oírse fuertes, claros y limpios):
     ahí suenan los mismos sonidos de siempre. */
  const navidad = () => document.documentElement.dataset.temporada === 'navidad' && document.documentElement.dataset.pantalla !== 'practica';
  /* cascabeles: campanitas de metal muy agudas, cortas y algo desafinadas entre sí (no forman una nota, así no se mezclan
     con las notas de los ejercicios). n: cuántas suenan; reparto: en cuántos segundos se reparten */
  function cascabeles(t, n, reparto, gain) {
    for (let i = 0; i < n; i++) {
      const t0 = t + (n > 1 ? (i / (n - 1)) * reparto : 0) + Math.random() * .012, base = 3200 + Math.random() * 1800, dur = .07 + Math.random() * .07;
      [[1, 1], [2.71, .35], [4.13, .15]].forEach(([k, a]) => {
        if (base * k > 14000) return;   // más arriba ya no se oye (y el navegador avisa)
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(base * k, t0);
        g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(gain * a, t0 + .002); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
        o.connect(g); g.connect(bus); o.start(t0); o.stop(t0 + dur + .02);
      });
    }
  }

  let jingle = null;
  let escalera = 0;   // aciertos seguidos: cada uno suena un poco más agudo
  const ESCALA = [72, 74, 76, 79, 81, 84, 86, 88, 91, 93];
  const api = {
    get pref() { return pref; },
    despertar() { audio(); },
    /* calla todo lo que está sonando o programado (notas, clics, tambor, jingle) al cambiar de pantalla, de actividad, de
       tarjeta o de hoja del libro, para que no se mezcle con lo siguiente (pedido de la dueña, 29-oct). La música de la
       escena no se toca: la maneja Sonido.escena */
    callar() {
      turno++;
      if (jingle) { jingle.stop(); jingle.unload(); jingle = null; }
      if (!ctx || !bus) return;
      const viejo = bus, t = ctx.currentTime;
      viejo.gain.cancelScheduledValues(t); viejo.gain.setValueAtTime(viejo.gain.value, t); viejo.gain.linearRampToValueAtTime(0, t + .03);
      setTimeout(() => viejo.disconnect(), 80);
      bus = ctx.createGain(); bus.connect(salida);
    },
    /* como setTimeout, pero no pasa nada si antes se llamó a callar (notas que se tocan con un poco de espera) */
    luego(ms, fn) { const mio = turno; return setTimeout(() => { if (mio === turno) fn(); }, ms); },
    /* toque de botón: un «tic» corto y suave, sin nota musical (4-nov, pedido de la dueña). La nota aguda de piano del 3-nov
       se mezclaba con las notas de los ejercicios (pentagrama, teclado). Tampoco es el «posh» (un soplo largo) que no le
       gustaba: dura unos 40 ms. Es un clic de ruido filtrado en agudo y un golpecito que baja rápido, para que se sienta
       como un botón y no como una nota. */
    toque() {
      if (!ok()) return;
      if (navidad()) { cascabeles(ctx.currentTime + .003, 3, .035, .045); return; }   // Navidad: un «tilín» de cascabel
      const t = ctx.currentTime + .003;
      const n = ctx.createBuffer(1, Math.floor(ctx.sampleRate * .018), ctx.sampleRate), d = n.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = n; f.type = 'bandpass'; f.frequency.value = 3800; f.Q.value = 1.4; g.gain.value = .32;
      s.connect(f); f.connect(g); g.connect(bus); s.start(t);
      const o = ctx.createOscillator(), go = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(1500, t); o.frequency.exponentialRampToValueAtTime(700, t + .035);
      go.gain.setValueAtTime(.0001, t); go.gain.exponentialRampToValueAtTime(.09, t + .003); go.gain.exponentialRampToValueAtTime(.0001, t + .04);
      o.connect(go); go.connect(bus); o.start(t); o.stop(t + .05);
    },
    acierto() {
      if (!ok()) return;
      const t = ctx.currentTime, m = ESCALA[Math.min(escalera, ESCALA.length - 1)];
      marimba(t, m, .42); marimba(t + .07, m + 7, .3);
      if (escalera >= 3) marimba(t + .14, m + 12, .22);   // racha de aciertos: campanita extra
      escalera++;
    },
    error() {
      escalera = 0;
      if (!ok()) return;
      const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(150, t + .22);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.22, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + .3);
      o.connect(g); g.connect(bus); o.start(t); o.stop(t + .32);
    },
    reiniciarEscalera() { escalera = 0; },
    /* malvavisco ganado: chispitas que suben */
    moneda(n) {
      if (!ok()) return;
      const t = ctx.currentTime;
      for (let i = 0; i < Math.min(n || 3, 8); i++) marimba(t + i * .06, 84 + (i % 4) * 3, .2);
    },
    /* festejo de fin de práctica: arpegio y acorde */
    festejo() {
      if (!ok()) return;
      if (navidad()) {
        /* Navidad: «Jingle bells, jingle bells, jingle all the way» (melodía tradicional, de dominio público) en campanitas,
           con cascabeles en cada tiempo. Dura unos 2,8 s; la música de la escena se baja mientras suena */
        musica.bajar(3400);
        const t = ctx.currentTime + .08, q = .2;
        const notas = [[76, 1], [76, 1], [76, 2], [76, 1], [76, 1], [76, 2], [76, 1], [79, 1], [72, 1.5], [74, .5], [76, 4]];
        let k = t;
        notas.forEach(([m, d]) => { campana(k, m, .26, .9); campana(k, m + 12, .06, .5); k += d * q; });
        for (let i = 0; i < 8; i++) cascabeles(t + i * 2 * q, 4, .05, .03);
        [84, 88, 91, 96].forEach((m, i) => marimba(k + .05 + i * .08, m, .14));
        return;
      }
      if (window.BOSQUE_JINGLE && window.Howl) {
        // el jingle CC0 (la música de fondo se baja mientras suena) y unas chispitas encima
        musica.bajar(5600);   // la música de la escena se baja mientras suena el jingle
        jingle = new Howl({ src: [window.BOSQUE_JINGLE], volume: .7 }); jingle.play();
        [84, 88, 91, 96].forEach((m, i) => marimba(ctx.currentTime + .2 + i * .08, m, .12));
        return;
      }
      const t = ctx.currentTime + .05;
      [60, 64, 67, 72, 76, 79].forEach((m, i) => piano(t + i * .09, m, .5, .28));
      [60, 64, 67, 72].forEach(m => piano(t + .6, m, 1.6, .2));
      [84, 88, 91, 96].forEach((m, i) => marimba(t + .62 + i * .08, m, .16));
    },
    /* tienda: campanita de la puerta al entrar */
    campanaPuerta() {
      if (!ok()) return;
      const t = ctx.currentTime;
      [[88, 0], [84, .16], [88, .32]].forEach(([m, d]) => campana(t + d, m, .22));
    },
    /* tienda: caja registradora (el cajón que se abre y el «ding») y monedas que caen */
    caja() {
      if (!ok()) return;
      const t = ctx.currentTime;
      if (navidad()) {   // Navidad: cascabeles que se sacuden, el «¡ding!» y las monedas (sin el ruido de las teclas y el cajón)
        cascabeles(t, 7, .22, .05);
        campana(t + .26, 96, .3); campana(t + .26, 103, .12);
        for (let i = 0; i < 6; i++) marimba(t + .45 + i * .055 + Math.random() * .02, 91 + (i % 3) * 2, .12);
        return;
      }
      for (let i = 0; i < 4; i++) ruido(t + i * .045, .04, 3000 + i * 400, .25);   // las teclas
      ruido(t + .2, .18, 700, .35);                                                // el cajón
      campana(t + .26, 96, .3); campana(t + .26, 103, .12);                        // ¡ding!
      for (let i = 0; i < 6; i++) marimba(t + .45 + i * .055 + Math.random() * .02, 91 + (i % 3) * 2, .12);   // monedas
    },
    /* casita: una calcomanía que se pega */
    pegar() {
      if (!ok()) return;
      const t = ctx.currentTime;
      if (navidad()) { campana(t, 91, .16, .45); cascabeles(t + .02, 2, .03, .03); return; }   // Navidad: una campanita

      ruido(t, .07, 1800, .25);
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(320, t + .03); o.frequency.exponentialRampToValueAtTime(160, t + .12);
      g.gain.setValueAtTime(.0001, t + .03); g.gain.exponentialRampToValueAtTime(.3, t + .04); g.gain.exponentialRampToValueAtTime(.0001, t + .16);
      o.connect(g); g.connect(bus); o.start(t + .03); o.stop(t + .18);
    },
    /* Los stickers mejorados hacen algo al tocarlos (16-nov-2026): cada acción tiene su sonido corto, sintetizado.
       Devuelve cuánto dura, en segundos, para que el dibujo se mueva ese mismo tiempo. */
    juguete(tipo) {
      if (!ok()) return 0;
      const t = ctx.currentTime + .02;
      /* un «pío» que resbala de una nota a otra (pato, rana, cucú) */
      const voz = (t0, de, a, dur, gain, forma) => {
        const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
        o.type = forma || 'triangle'; o.frequency.setValueAtTime(hz(de), t0); o.frequency.exponentialRampToValueAtTime(hz(a), t0 + dur);
        f.type = 'lowpass'; f.frequency.value = 2600;
        g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t0 + .015); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur + .05);
        o.connect(f); f.connect(g); g.connect(bus); o.start(t0); o.stop(t0 + dur + .1);
      };
      const tonada = (notas, paso, dur, gain) => { notas.forEach((m, i) => { if (m) piano(t + i * paso, m, dur, gain); }); return notas.length * paso + dur; };
      switch (tipo) {
        case 'cancion': return tonada([[60, 60, 67, 67, 69, 69, 67], [64, 64, 65, 67, 67, 65, 64, 62], [60, 62, 64, 60, 60, 62, 64, 60]][Math.floor(Math.random() * 3)], .3, .5, .3);   // Estrellita, Himno a la alegría, Fray Santiago
        case 'melodia': return tonada([[76, 74, 72, 74, 76, 76, 76], [67, 72, 76, 79, 76, 72], [72, 76, 79, 84, 79, 76, 72]][Math.floor(Math.random() * 3)], .34, .7, .24);
        case 'cucu': [0, .7].forEach(d => { voz(t + d, 79, 79, .16, .26, 'sine'); voz(t + d + .24, 75, 75, .22, .26, 'sine'); }); return 1.3;
        case 'dormir': return tonada([67, 64, 67, 64, 60], .5, 1.1, .16);
        case 'mecer': [0, .6, 1.2].forEach((d, i) => voz(t + d, i % 2 ? 62 : 57, i % 2 ? 57 : 62, .3, .07, 'sine')); return 1.8;
        case 'pulso': [0, 1, 2, 3].forEach(i => api.clic(t + i * .5, i === 0)); return 2;
        case 'luz': marimba(t, 91, .14); return .3;
        case 'navegar': [0, .9, 1.8].forEach(d => ruido(t + d, .5, 520, .22)); return 2.4;
        case 'nadar': [0, .28, .9, 1.18].forEach(d => voz(t + d, 70, 65, .12, .2, 'sawtooth')); ruido(t + .1, .5, 600, .12); return 1.8;
        case 'saltar': [0, .8].forEach(d => { voz(t + d, 72, 84, .18, .12, 'sine'); ruido(t + d + .42, .25, 900, .3); }); return 1.5;
        case 'croar': [0, .5].forEach(d => { voz(t + d, 50, 46, .09, .22, 'sawtooth'); voz(t + d + .12, 52, 47, .14, .22, 'sawtooth'); }); return 1.1;
        case 'hornear': ruido(t, .9, 2400, .1); campana(t + .95, 96, .26, .9); return 1.4;
        case 'servir': ruido(t, .7, 1400, .12); [72, 76, 79].forEach((m, i) => marimba(t + .7 + i * .07, m, .18)); return 1.2;
        case 'pescar': voz(t, 84, 60, .3, .08, 'sine'); ruido(t + .35, .25, 800, .28); [79, 84].forEach((m, i) => marimba(t + .9 + i * .09, m, .2)); return 1.4;
        /* 20-nov-2026, los del lago */
        case 'revolotear': [0, .45, .9, 1.35].forEach(d => ruido(t + d, .22, 3200, .06)); return 1.8;
        case 'esconder': voz(t, 62, 55, .16, .12, 'sine'); voz(t + .95, 57, 66, .16, .12, 'sine'); return 1.5;
        case 'aletear': [0, .3, .6, .9].forEach(d => ruido(t + d, .16, 1100, .16)); return 1.2;
        case 'viento': ruido(t, 1.1, 1500, .07); ruido(t + .7, .9, 2100, .05); return 1.8;
        case 'roer': [0, .3, .6].forEach(d => ruido(t + d, .07, 2600, .22)); return 1;
        case 'campana': [0, .9].forEach(d => campana(t + d, 81, .22, .9)); return 1.8;
        case 'regalo': [76, 79, 84, 88].forEach((m, i) => marimba(t + i * .09, m, .24)); return .8;
        default: return 0;
      }
    },
    /* la fogata se aviva */
    fuego() { if (!ok()) return; ruido(ctx.currentTime, .7, 900, .5); ruido(ctx.currentTime + .1, .5, 400, .35); },
    /* pasar de página: ya no suena (3-nov): el soplido se oía como un «posh» en cada botón; basta la nota del toque */
    pagina() { },
    /* pasar la hoja de un libro: el papel roza (un soplo que sube y baja) y al final cae la hoja */
    hojaLibro() {
      if (!ok()) return;
      if (navidad()) { cascabeles(ctx.currentTime, 2, .06, .025); return; }   // Navidad: sin el soplo del papel, un cascabel muy suave
      const t = ctx.currentTime, dur = .34;
      const n = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate), d = n.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      src.buffer = n; f.type = 'bandpass'; f.Q.value = .7;
      f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(3400, t + .14); f.frequency.exponentialRampToValueAtTime(1300, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.2, t + .07); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f); f.connect(g); g.connect(bus); src.start(t);
      ruido(t + .26, .06, 520, .22);   // la hoja cae
    },
    nota(midi, dur) { if (!ok()) return; piano(ctx.currentTime, midi, dur || .9, .32); },   // al instante (antes +20 ms)
    /* una nota en un momento exacto del reloj de audio (los ejemplos que suenan de la biblioteca) */
    notaEn(t, midi, dur, gain) { if (!ok()) return; piano(t, midi, dur || .9, gain || .32); },
    /* pasos: [[midis juntos], segundos] (oído). Lo que sonaba antes se calla */
    tocar(pasos) {
      audio(); api.callar();
      let t = ctx.currentTime + .08;
      pasos.forEach(([notas, dur]) => { notas.forEach(m => piano(t, m, dur, .32 / Math.sqrt(notas.length))); t += dur; });
      return t - ctx.currentTime;
    },
    /* clic del metrónomo */
    clic(t, fuerte) {
      audio();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'square'; o.frequency.value = fuerte ? 1560 : 1040;
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(fuerte ? .22 : .14, t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + .04);
      o.connect(g); g.connect(bus); o.start(t); o.stop(t + .05);
    },
    /* el pulso del ritmo: una campana clara (3-nov, pedido de la dueña: el tambor sonaba muy grave y casi no se oía en el
       celular). Se llama tambor porque así lo usan las actividades y los ejemplos. */
    tambor(t) {
      audio();
      campana(t, 88, .34, .4);   // corta, para que no se mezcle con el pulso siguiente
    },
    notaRitmo(t, enPulso, dur) { audio(); piano(t, enPulso ? 72 : 67, Math.max(dur * .95, .09), enPulso ? .3 : .24); },
    ahora() { return audio().currentTime; },
    retraso() { const c = audio(); return c.outputLatency || c.baseLatency || 0; },   // lo que tarda en oírse por el parlante
    alternarSonido() { pref.sonido = !pref.sonido; guardar('bosque-sonido', pref.sonido); return pref.sonido; },
    alternarMusica() { pref.musica = !pref.musica; guardar('bosque-musica', pref.musica); pref.musica ? musica.escena(musica.actual || 'mapa', true) : musica.parar(); return pref.musica; },
    /* cada pantalla tiene su canción y su ambiente (ver ESCENAS) */
    escena(nombre) { musica.escena(nombre); },
    musica: null
  };

  /* ---------- Música y ambiente por escena (pedido de la dueña: «se cambia de canción por cada botón») ----------
     mapa: canciones del bosque + pájaros (de día) + la fogata crepitando · tienda: bossa nova + campanita al entrar ·
     casita: guitarra suave + la chimenea · práctica: silencio (los ejercicios de oído y ritmo necesitan escuchar).
     Las canciones cambian con un fundido. Archivos CC0 en assets/musica (CREDITOS.md). */
  const M = 'assets/musica/';
  const ESCENAS = {
    mapa: { pistas: (window.BOSQUE_MUSICA || []), ambiente: 'pajaros', fuego: .5 },
    tienda: { pistas: [M + 'tienda.mp3'] },
    casita: { pistas: [M + 'casita.mp3'], fuego: .35 },
    logros: { pistas: [M + 'biblioteca-1.mp3', M + 'biblioteca-2.mp3'] },   // la biblioteca: piano tranquilo (Holizna, CC0)
    practica: { pistas: [] },
    silencio: { pistas: [] }
  };
  /* Navidad: la música de cada escena sale de BOSQUE_NAVIDAD.musica (js/config.js) y en el mapa no cantan los pájaros */
  if (navidad() && window.BOSQUE_NAVIDAD && window.BOSQUE_NAVIDAD.musica) {
    Object.entries(window.BOSQUE_NAVIDAD.musica).forEach(([k, pistas]) => { if (ESCENAS[k] && pistas && pistas.length) ESCENAS[k].pistas = pistas; });
    delete ESCENAS.mapa.ambiente;
  }
  const musica = {
    actual: null, howl: null, amb: null, crepita: null, sonando: false, vol: .3,
    escena(nombre, forzar) {
      const e = ESCENAS[nombre] || ESCENAS.silencio, antes = ESCENAS[this.actual] || ESCENAS.silencio;
      const misma = !forzar && this.actual && antes.pistas.join() === e.pistas.join();
      this.actual = nombre;
      if (!pref.musica || !window.Howl) { this.parar(true); return; }
      this.sonando = true;
      if (!misma) {
        this.soltar(this.howl);
        this.howl = null;
        if (e.pistas.length) {
          let k = Math.floor(Math.random() * e.pistas.length);
          const sonar = () => {
            const h = new Howl({ src: [e.pistas[k]], volume: 0, html5: true, loop: e.pistas.length === 1,
              onend: () => { if (e.pistas.length > 1 && this.howl === h) { k = (k + 1) % e.pistas.length; h.unload(); sonar(); } } });
            this.howl = h; h.play(); h.fade(0, this.vol, 900);
          };
          sonar();
        }
      } else if (this.howl && !this.howl.playing()) { this.howl.play(); this.howl.fade(0, this.vol, 600); }
      // ambiente: pájaros de día en el mapa
      const pajaros = e.ambiente === 'pajaros' && document.documentElement.dataset.hora !== 'noche';
      if (pajaros && !this.amb) { this.amb = new Howl({ src: [M + 'pajaros.mp3'], loop: true, volume: 0 }); this.amb.play(); this.amb.fade(0, .22, 1200); }
      if (!pajaros && this.amb) { this.soltar(this.amb); this.amb = null; }
      // la fogata crepita (más fuerte de noche)
      this.fuego(e.fuego ? e.fuego * (document.documentElement.dataset.hora === 'noche' ? 1.4 : 1) : 0);
    },
    soltar(h) { if (!h) return; const v = h.volume(); h.fade(v, 0, 600); setTimeout(() => h.unload(), 650); },
    /* los ejemplos del libro: la música se calla del todo mientras suenan y vuelve despacio */
    silenciar(ms) {
      const h = this.howl; if (!h) return;
      clearTimeout(this.vuelve); h.fade(h.volume(), 0, 150);
      this.vuelve = setTimeout(() => { if (this.howl === h) h.fade(0, this.vol, 1500); }, ms);
    },
    bajar(ms) { if (!this.howl) return; const h = this.howl; h.fade(this.vol, .05, 300); setTimeout(() => { if (this.howl === h) h.fade(.05, this.vol, 1200); }, ms); },
    parar(dejarEscena) {
      this.sonando = false;
      this.soltar(this.howl); this.howl = null;
      this.soltar(this.amb); this.amb = null;
      this.fuego(0);
      if (!dejarEscena) this.actual = this.actual;
    },
    /* crepitar de fogata sintetizado: chasquidos al azar sobre un rumor suave */
    fuego(vol) {
      clearInterval(this.crepita); this.crepita = null;
      if (!vol || !pref.musica || !ctx) return;
      this.crepita = setInterval(() => {
        const t = ctx.currentTime;
        ruidoA(t, .5, 300, vol * .05, musicaBus);
        for (let i = 0; i < 3; i++) if (Math.random() < .55) ruidoA(t + Math.random() * .45, .012 + Math.random() * .02, 1500 + Math.random() * 3000, vol * (.25 + Math.random() * .5), musicaBus);
      }, 480);
    },
    empezar() { this.escena(this.actual || 'mapa', true); }
  };
  function ruidoA(t, dur, frecuencia, gain, destino) {
    const n = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate), d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = n; f.type = 'bandpass'; f.frequency.value = frecuencia; f.Q.value = 1.2; g.gain.value = gain;
    s.connect(f); f.connect(g); g.connect(destino || bus); s.start(t);
  }
  function campana(t, midi, gain, dur) {
    dur = dur || 1.4;
    [[1, 1], [2.76, .35], [5.4, .12]].forEach(([k, a]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(hz(midi) * k, t);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(gain * a, t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + .1);
    });
  }
  api.musica = musica;
  /* al ir a otra app o bloquear el celular, la música se calla */
  document.addEventListener('visibilitychange', () => { if (document.hidden) musica.parar(true); else if (pref.musica && ctx && musica.actual) musica.escena(musica.actual, true); });
  return api;
})();
