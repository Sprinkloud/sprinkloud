/* El oído del osito: reconoce las 7 sílabas (do, re, mi, fa, sol, la, si) con Vosk en el navegador.
   El reconocimiento de voz del navegador está hecho para frases y se pierde con sílabas sueltas; Vosk, con una lista
   cerrada de palabras, las entiende (prueba del 29-oct: 9 de 9, contra 4 de 9 del navegador).
   - Librería: vosk-browser 0.0.8 (Apache-2.0, github.com/ccoreilly/vosk-browser), copiada en assets/voz/vosk.js.
   - Modelo: vosk-model-small-es-0.42 (Apache-2.0, alphacephei.com/vosk/models), en assets/voz/modelo-es.tar.gz (40 MB).
     Se baja contando el avance (eso lo deja en la caché del navegador) y Vosk lo abre desde su dirección; las siguientes
     veces el navegador solo pregunta si cambió (304) y no lo vuelve a bajar.
   Se presenta como SpeechRecognition (window.BosqueReconocedor): la lectura hablada (motores/lectura.js) lo usa sin cambios. */
window.Voz = (function () {
  'use strict';
  const LIB = 'assets/voz/vosk.js', MODELO = new URL('assets/voz/modelo-es.tar.gz', location.href).href;
  const PALABRAS = ['do', 're', 'mi', 'fa', 'sol', 'la', 'si', '[unk]'];
  let modelo = null, cargando = null, avance = 0;
  const avisos = new Set();

  const soportado = () => !!(window.WebAssembly && (window.AudioContext || window.webkitAudioContext) && window.Worker && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  function cargarScript() {
    if (window.Vosk) return Promise.resolve();
    return new Promise((ok, mal) => { const s = document.createElement('script'); s.src = LIB; s.onload = ok; s.onerror = () => mal(new Error('No se pudo cargar el oído del osito.')); document.head.append(s); });
  }
  function avisar(x) { avance = x; avisos.forEach(f => { try { f(x); } catch (e) { } }); }
  /* el modelo se baja contando el avance (para la barra); así queda en la caché del navegador para Vosk */
  async function bajarModelo() {
    const r = await fetch(MODELO);
    if (!r.ok) throw new Error('No se pudo bajar el oído del osito.');
    const total = Number(r.headers.get('content-length')) || 39816595, lector = r.body.getReader(), partes = [];
    let llevo = 0;
    for (;;) { const { done, value } = await lector.read(); if (done) break; partes.push(value); llevo += value.length; avisar(Math.min(.99, llevo / total)); }
    avisar(1);
  }
  const conLimite = (promesa, ms) => Promise.race([promesa, new Promise((_, mal) => setTimeout(() => mal(new Error('El oído del osito tardó demasiado.')), ms))]);
  /* prepara el modelo una sola vez; progreso(0..1) avisa cuánto falta */
  function preparar(progreso) {
    if (progreso) { avisos.add(progreso); progreso(modelo ? 1 : avance); }
    if (modelo) return Promise.resolve(modelo);
    if (!cargando) {
      cargando = (async () => {
        if (!soportado()) throw new Error('Este celular no puede usar el oído del osito.');
        await conLimite(cargarScript(), 60000);
        await conLimite(bajarModelo(), 240000);
        // nunca queda trabado: si Vosk no abre el modelo a tiempo, la actividad de voz se salta y la práctica sigue
        modelo = await conLimite(window.Vosk.createModel(MODELO), 90000);
        return modelo;
      })().catch(e => { cargando = null; throw e; });
    }
    return cargando;
  }

  /* resultado con la forma de SpeechRecognition: results[i][0].transcript e isFinal */
  const resultado = (texto, final) => { const r = [{ transcript: texto, confidence: 1 }]; r.isFinal = final; return r; };
  const limpio = t => String(t || '').replace(/\[unk\]/g, ' ').replace(/\s+/g, ' ').trim();

  class Reconocedor {
    constructor() { this.lang = 'es'; this.continuous = true; this.interimResults = true; this.maxAlternatives = 1; this._finales = []; this._parcial = ''; }
    async start() {
      if (!modelo) { this._fallo('network'); return; }
      try { this._stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } }); }
      catch (e) { this._fallo('not-allowed'); return; }
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this._ctx.state === 'suspended') await this._ctx.resume();
      const tasa = this._ctx.sampleRate;
      this._rec = new modelo.KaldiRecognizer(tasa, JSON.stringify(PALABRAS));   // solo las 7 sílabas
      this._rec.on('result', m => { const t = limpio(m.result && m.result.text); if (t) { this._finales.push(t); this._parcial = ''; this._emitir(); } });
      this._rec.on('partialresult', m => { this._parcial = limpio(m.result && m.result.partial); this._emitir(); });
      const fuente = this._ctx.createMediaStreamSource(this._stream);
      this._proc = this._ctx.createScriptProcessor(4096, 1, 1);
      this._proc.onaudioprocess = e => { try { this._rec.acceptWaveformFloat(e.inputBuffer.getChannelData(0), tasa); } catch (x) { } };
      fuente.connect(this._proc); this._proc.connect(this._ctx.destination);   // la salida queda en silencio
      if (this.onstart) this.onstart();
    }
    _emitir() {
      const res = this._finales.map(t => resultado(t, true));
      if (this._parcial) res.push(resultado(this._parcial, false));
      if (this.onresult) this.onresult({ results: res, resultIndex: 0 });
    }
    stop() { this._cerrar(700); }    // un respiro para que llegue la última sílaba
    abort() { this._cerrar(0); }
    _cerrar(espera) {
      if (this._cerrado) return; this._cerrado = true;
      try { if (this._rec) this._rec.retrieveFinalResult(); } catch (e) { }
      setTimeout(() => {
        try { if (this._proc) this._proc.disconnect(); } catch (e) { }
        try { if (this._stream) this._stream.getTracks().forEach(t => t.stop()); } catch (e) { }
        try { if (this._ctx) this._ctx.close(); } catch (e) { }
        try { if (this._rec) this._rec.remove(); } catch (e) { }
        if (this.onend) this.onend();
      }, espera);
    }
    _fallo(codigo) { if (this.onerror) this.onerror({ error: codigo }); if (this.onend) this.onend(); }
  }
  if (soportado()) window.BosqueReconocedor = Reconocedor;
  return { preparar, soportado, listo: () => !!modelo };
})();
