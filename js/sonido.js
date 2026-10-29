/* Sonidos del bosque: los efectos se sintetizan con Web Audio (toques, aciertos, campanita de la tienda, caja registradora,
   la fogata que crepita) y la música de cada escena suena con Howler (archivos CC0 en assets/musica, ver CREDITOS.md). Los aciertos seguidos suben de tono, como una escalera que festeja. */
window.Sonido = (function () {
  'use strict';
  let ctx = null, bus = null, musicaBus = null;
  const pref = { sonido: leer('bosque-sonido', true), musica: leer('bosque-musica', true) };
  function leer(k, def) { try { const v = localStorage.getItem(k); return v === null ? def : v === '1'; } catch (e) { return def; } }
  function guardar(k, v) { try { localStorage.setItem(k, v ? '1' : '0'); } catch (e) { } }

  function audio() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16; comp.ratio.value = 4;
      bus = ctx.createGain(); bus.gain.value = .9;
      musicaBus = ctx.createGain(); musicaBus.gain.value = .22;
      bus.connect(comp); musicaBus.connect(comp); comp.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  /* Voz de piano: parciales armónicos con ataque rápido y caída natural (la misma del sitio) */
  function piano(t, midi, dur, gain, destino) {
    const out = ctx.createGain(), lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 3200;
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(gain, t + .006);
    out.gain.setTargetAtTime(gain * .35, t + .006, .25);
    out.gain.setTargetAtTime(0.0001, t + Math.max(dur - .05, .08), .06);
    [[1, 1], [2, .42], [3, .2], [4, .1], [5, .05]].forEach(([h, a], k) => {
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

  let escalera = 0;   // aciertos seguidos: cada uno suena un poco más agudo
  const ESCALA = [72, 74, 76, 79, 81, 84, 86, 88, 91, 93];
  const api = {
    get pref() { return pref; },
    despertar() { audio(); },
    /* toque de botón: una gotita de madera */
    toque() {
      if (!ok()) return;
      const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(880, t); o.frequency.exponentialRampToValueAtTime(420, t + .07);
      g.gain.setValueAtTime(.25, t); g.gain.exponentialRampToValueAtTime(.0001, t + .09);
      o.connect(g); g.connect(bus); o.start(t); o.stop(t + .1);
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
      if (window.BOSQUE_JINGLE && window.Howl) {
        // el jingle CC0 (la música de fondo se baja mientras suena) y unas chispitas encima
        musica.bajar(5600);   // la música de la escena se baja mientras suena el jingle
        new Howl({ src: [window.BOSQUE_JINGLE], volume: .7 }).play();
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
      for (let i = 0; i < 4; i++) ruido(t + i * .045, .04, 3000 + i * 400, .25);   // las teclas
      ruido(t + .2, .18, 700, .35);                                                // el cajón
      campana(t + .26, 96, .3); campana(t + .26, 103, .12);                        // ¡ding!
      for (let i = 0; i < 6; i++) marimba(t + .45 + i * .055 + Math.random() * .02, 91 + (i % 3) * 2, .12);   // monedas
    },
    /* casita: una calcomanía que se pega */
    pegar() {
      if (!ok()) return;
      const t = ctx.currentTime;
      ruido(t, .07, 1800, .25);
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(320, t + .03); o.frequency.exponentialRampToValueAtTime(160, t + .12);
      g.gain.setValueAtTime(.0001, t + .03); g.gain.exponentialRampToValueAtTime(.3, t + .04); g.gain.exponentialRampToValueAtTime(.0001, t + .16);
      o.connect(g); g.connect(bus); o.start(t + .03); o.stop(t + .18);
    },
    /* la fogata se aviva */
    fuego() { if (!ok()) return; ruido(ctx.currentTime, .7, 900, .5); ruido(ctx.currentTime + .1, .5, 400, .35); },
    /* pasar de página */
    pagina() { if (!ok()) return; ruido(ctx.currentTime, .18, 2400, .18); },
    /* pasar la hoja de un libro: el papel roza (un soplo que sube y baja) y al final cae la hoja */
    hojaLibro() {
      if (!ok()) return;
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
    nota(midi, dur) { if (!ok()) return; piano(ctx.currentTime + .02, midi, dur || .9, .32); },
    /* una nota en un momento exacto del reloj de audio (los ejemplos que suenan de la biblioteca) */
    notaEn(t, midi, dur, gain) { if (!ok()) return; piano(t, midi, dur || .9, gain || .32); },
    /* pasos: [[midis juntos], segundos] (oído) */
    tocar(pasos) {
      audio();
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
    /* tambor (para marcar el pulso) */
    tambor(t) {
      audio();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(60, t + .18);
      g.gain.setValueAtTime(.6, t); g.gain.exponentialRampToValueAtTime(.0001, t + .25);
      o.connect(g); g.connect(bus); o.start(t); o.stop(t + .26);
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
  function campana(t, midi, gain) {
    [[1, 1], [2.76, .35], [5.4, .12]].forEach(([k, a]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(hz(midi) * k, t);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(gain * a, t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + 1.4);
      o.connect(g); g.connect(bus); o.start(t); o.stop(t + 1.5);
    });
  }
  api.musica = musica;
  /* al ir a otra app o bloquear el celular, la música se calla */
  document.addEventListener('visibilitychange', () => { if (document.hidden) musica.parar(true); else if (pref.musica && ctx && musica.actual) musica.escena(musica.actual, true); });
  return api;
})();
