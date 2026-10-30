/* Conversación con el sistema (Registro_Sprinkloud/maestros, sección 9). El alumno entra con ?k=<clave>, que se guarda
   en el celular. Con ?demo=1 todo pasa en el navegador con las mismas reglas del servidor (para probar sin tocar datos):
   ?demo=1&semana=9&dia=2026-11-03&ins=piano cambian la lección, el día y el instrumento de la prueba. */
window.Api = (function () {
  'use strict';
  const q = new URLSearchParams(location.search);
  const DEMO = q.has('demo');
  let clave = q.get('k');
  try {
    if (clave) localStorage.setItem('bosque-clave', clave);
    else clave = localStorage.getItem('bosque-clave');
  } catch (e) { }
  /* la clave se queda en la dirección: al fijar la app en la pantalla (agregar a inicio / instalar), el ícono abre esta
     misma dirección (manifest.json no tiene start_url a propósito). En el iPhone, la app fijada no comparte lo guardado
     con Safari: sin la clave en la dirección, pediría el enlace otra vez (29-oct) */
  if (clave && !DEMO && q.get('k') !== clave) history.replaceState(null, '', location.pathname + '?k=' + encodeURIComponent(clave));
  /* Versión libre (pedido de la dueña, 30-oct): quien entra sin el enlace del maestro juega gratis, guardado en su celular,
     con energía diaria y hasta el final de la etapa 3; los libros quedan en Amazon y los planes del club dan acceso total.
     ?demo=1&libre=1 la prueba con su propio guardado. */
  const LIBRE = q.has('libre') || (!DEMO && !clave);
  const LOCAL = DEMO || LIBRE;   // todo pasa en el navegador, con las mismas reglas del servidor
  /* cada actividad gasta 2 y cada error 2 más; se recarga a medianoche. Una práctica del día trae de 18 a 30 preguntas
     (4 actividades): sin errores gasta 8 y alcanza; con muchos errores se acaba antes (pedido de la dueña, 30-oct) */
  const ENERGIA_DIA = 20, COSTO_ACTIVIDAD = 2, COSTO_ERROR = 2;
  const ULTIMA_LIBRE = 27;   // la versión libre llega hasta el final de la etapa 3 (6 + 8 + 13 lecciones)
  const PARA_PASAR = .8;   // con el 80 % de aciertos en la práctica del día, al día siguiente se abre la lección siguiente
  const gasto = (aciertos, intentos) => intentos ? COSTO_ACTIVIDAD + COSTO_ERROR * (intentos - aciertos) : 0;

  /* Las lecciones 20 a 23 son distintas en piano y en violín: el tema viene como «piano / violín» y el objetivo como
     «Piano: … Violín: …». Cada alumno ve solo lo de su instrumento. */
  function parte(t, ins) {
    const x = String(t || ''), m = x.match(/^Piano: (.*?) Violín: (.*)$/);
    if (m) return ins === 'violin' ? m[2] : m[1];
    const p = x.split(' / ');
    return p.length === 2 ? p[ins === 'violin' ? 1 : 0] : x;
  }
  function porInstrumento(d) {
    const e = d && (d.camino ? d : d.estado);
    if (!e || !e.instrumento) return d;
    if (e.leccion) { e.leccion.tema = parte(e.leccion.tema, e.instrumento); e.leccion.objetivo = parte(e.leccion.objetivo, e.instrumento); }
    (e.camino || []).forEach(c => { c.tema = parte(c.tema, e.instrumento); });
    return d;
  }
  async function get() {
    const r = await fetch(window.BOSQUE_API + '?api=juego&k=' + encodeURIComponent(clave));
    const d = await r.json();
    if (d.error) throw new Error(d.error);
    return porInstrumento(d);
  }
  async function post(cuerpo) {
    const r = await fetch(window.BOSQUE_API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ k: clave }, cuerpo)) });
    const d = await r.json();
    if (d.error) throw new Error(d.error);
    return porInstrumento(d);
  }

  /* ---------- Modo de prueba: las reglas del servidor, guardadas en el navegador ---------- */
  const TIENDA = [
    ['cuadro-osito', 'sala-pared', 'Cuadro del osito', 15],
    ['reloj-cuco', 'sala-pared', 'Reloj cucú', 35],
    ['guirnalda', 'sala-pared', 'Guirnalda de hojas', 20],
    ['sillon', 'sala-sillon', 'Sillón acolchado', 40],
    ['cojines', 'sala-sillon', 'Cojines', 25],
    ['alfombra-redonda', 'sala-alfombra', 'Alfombra redonda', 20],
    ['alfombra-hojas', 'sala-alfombra', 'Alfombra de hojas', 35],
    ['piano-madera', 'sala-musica', 'Piano de madera', 80],
    ['atril-violin', 'sala-musica', 'Atril con violín', 60],
    ['metronomo', 'sala-musica', 'Metrónomo', 35],
    ['mesa-comedor', 'sala-mesa', 'Mesa del comedor', 45],
    ['tetera', 'cocina-estufa', 'Estufa con tetera', 15],
    ['olla-chocolate', 'cocina-estufa', 'Olla de chocolate', 30],
    ['cortinas', 'cocina-ventana', 'Cortinas de cuadros', 15],
    ['maceta', 'cocina-ventana', 'Maceta con flores', 20],
    ['tazas', 'cocina-mesa', 'Tazas de cacao', 15],
    ['pastel-miel', 'cocina-mesa', 'Pastel de miel', 25],
    ['tarro-miel', 'cocina-repisa', 'Tarro de miel', 20],
    ['frascos-mermelada', 'cocina-repisa', 'Frascos de mermelada', 20],
    ['cama-parches', 'dorm-cama', 'Cama de parches', 60],
    ['cama-hojas', 'dorm-cama', 'Cama de hojas', 50],
    ['lampara', 'dorm-mesita', 'Lámpara de aceite', 30],
    ['libros', 'dorm-mesita', 'Libros de cuentos', 15],
    ['calcetines', 'dorm-pared', 'Calcetines tejidos', 20],
    ['farolito', 'dorm-pared', 'Farolito', 30],
    ['banca', 'jardin-banca', 'Banca de troncos', 35],
    ['columpio', 'jardin-banca', 'Columpio', 50],
    ['flores-jardin', 'jardin-flores', 'Flores del jardín', 20],
    ['calabazas', 'jardin-flores', 'Calabazas', 25],
    ['palitos-malvavisco', 'jardin-fogata', 'Malvaviscos en palitos', 15]
  ].map(([id, lugar, nombre, precio]) => ({ id, lugar, nombre, precio }));
  const INSIGNIAS = [
    ['primera', 'Primera práctica', j => j.dias >= 1], ['racha3', '3 días seguidos', j => j.mejor >= 3], ['racha7', '7 días seguidos', j => j.mejor >= 7],
    ['racha14', '14 días seguidos', j => j.mejor >= 14], ['racha30', '30 días seguidos', j => j.mejor >= 30], ['perfecta', 'Ronda perfecta', (j, x) => !!(x && x.perfecta)],
    ['aciertos100', '100 aciertos', j => j.aciertos >= 100], ['aciertos500', '500 aciertos', j => j.aciertos >= 500], ['dias10', '10 días de práctica', j => j.dias >= 10],
    ['dias30', '30 días de práctica', j => j.dias >= 30], ['compra', 'Primera compra', j => j.inventario.length >= 1], ['casa5', 'Casita decorada', j => Object.keys(j.casa).length >= 5]
  ];
  const PERSONAJES = [['osito', 'Osito', 0], ['conejo', 'Conejo', 3], ['ardilla', 'Ardilla', 7], ['zorro', 'Zorro', 14], ['erizo', 'Erizo', 21], ['raton', 'Ratón', 30]]
    .map(([id, nombre, dias]) => ({ id, nombre, dias }));
  const ETAPAS = ['Cuerpo y pulso', 'Primeras lecturas', 'Lectura y ritmo', 'Intervalos, escalas y acordes', 'Tonalidad: reposo, mayor y menor', 'Músico completo', 'Los modos griegos'];
  const LARGO = [6, 8, 13, 10, 9, 6, 8];   // 60 lecciones desde el 29-oct (ver Registro_Sprinkloud/Guia.js versión 8)
  const APPS = ',ritmo,ritmo,ritmo,oido:sube,notas,ritmo,notas,notas,notas,notas,ritmo,ritmo:3/4,notas,ritmo,ritmo:3/4,ritmo,ritmo,ritmo,ritmo,notas,notas,notas,notas,notas,notas,notas,oido:intervalos:segundas y terceras,oido:intervalos:cuartas, quintas y octavas,oido:intervalos:todos,notas,notas,armaduras:sostenidos,armaduras:bemoles,oido:mayorMenor,oido:triadas,acordes,notas,oido:reposo,oido:mayorMenor,oido:mayorMenor,oido:mayorMenor,circulo,notas,ritmo,ritmo:6/8,oido:intervalos:todos,ritmo,ritmo,ritmo,notas,oido:reposo,ritmo,modos:1,modos:2,modos:3,modos:4,modos:5,modos:6,modos:7,modos:7'
    .split(/,(?=ritmo|oido|notas|armaduras|circulo|acordes|modos|$)/);
  function etapaDe(s) { let e = 0, l = s; while (l > LARGO[e]) l -= LARGO[e++]; return { etapa: e + 1, leccion: l }; }
  const diasEntre = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);

  const demo = {
    hoy() { if (q.get('dia')) return q.get('dia'); const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
    llave: LIBRE ? 'bosque-libre' : 'bosque-demo',
    leer() {
      let d = null; try { d = JSON.parse(localStorage.getItem(demo.llave) || 'null'); } catch (e) { }
      d = d || { malvaviscos: 60, racha: 0, mejor: 0, ultimo: '', lena: 0, dias: 0, aciertos: 0, insignias: [], casa: {}, inventario: [], hoy: {} };
      if (LIBRE && !d.libre) d.libre = { semana: 1, paso: '' };
      return d;
    },
    guardar(j) { try { localStorage.setItem(demo.llave, JSON.stringify(j)); } catch (e) { } },
    /* versión libre: si ayer (o antes) pasó la lección con el 80 %, hoy se abre la siguiente */
    avanzar(j, hoy) {
      if (!j.libre.paso || j.libre.paso >= hoy) return false;
      j.libre.paso = '';
      if (j.libre.semana < ULTIMA_LIBRE) j.libre.semana++; else j.libre.completa = true;
      return true;
    },
    hoyDe(j, hoy) { return j.hoy && j.hoy.fecha === hoy ? j.hoy : { fecha: hoy, actividades: 0, ganados: 0, terminada: false, gastada: 0, aciertos: 0, intentos: 0 }; },
    fogata(j, hoy) {
      if (!j.ultimo) return { estado: 'apagada', racha: 0 };
      const d = diasEntre(j.ultimo, hoy);
      if (d <= 0) return { estado: 'grande', racha: j.racha };
      if (d === 1) return { estado: 'encendida', racha: j.racha };
      if (d - 1 <= j.lena) return { estado: 'brasas', racha: j.racha };
      return { estado: 'apagada', racha: 0 };
    },
    estado() {
      const hoy = demo.hoy(), j = demo.leer();
      if (LIBRE && demo.avanzar(j, hoy)) demo.guardar(j);
      const s = LIBRE ? j.libre.semana : Math.min(60, Math.max(1, Number(q.get('semana')) || 1)), f = demo.fogata(j, hoy), et = etapaDe(s);
      const tema = window.Leccion.GUIA[s], h = demo.hoyDe(j, hoy);
      return {
        alumno: LIBRE ? (j.nombre || '') : 'Amiga', instrumento: 'piano', hoy,   // por ahora el bosque es de piano para todos (29-oct)
        leccion: { semana: s, etapa: et.etapa, nombreEtapa: ETAPAS[et.etapa - 1], numero: et.leccion, nivel: 'Etapa ' + et.etapa + ' · Lección ' + et.leccion, tema: tema[0], objetivo: tema[1], app: APPS[s] },
        camino: window.Leccion.GUIA.slice(1).map((g, i) => {
          const x = etapaDe(i + 1), premium = LIBRE && i + 1 > ULTIMA_LIBRE;
          return { semana: i + 1, etapa: x.etapa, leccion: x.leccion, tema: g[0], app: APPS[i + 1], premium,
            estado: i + 1 === s && !(LIBRE && j.libre.completa) ? 'actual' : i + 1 < s || (LIBRE && j.libre.completa && i + 1 === s) ? 'hecha' : 'futura' };
        }),
        juego: {
          malvaviscos: j.malvaviscos, racha: f.racha, fogata: f.estado, mejor: j.mejor, lena: j.lena, dias: j.dias, aciertos: j.aciertos,
          insignias: j.insignias, casa: j.casa, inventario: j.inventario, personajes: PERSONAJES.filter(p => j.dias >= p.dias).map(p => p.id),
          hoy: { terminada: !!h.terminada, actividades: h.actividades || 0, ganados: h.ganados || 0 },
          energia: LIBRE ? { max: ENERGIA_DIA, queda: Math.max(0, ENERGIA_DIA - (h.gastada || 0)), error: COSTO_ERROR } : null
        },
        libre: LIBRE ? { ultima: ULTIMA_LIBRE, paso: !!j.libre.paso, completa: !!j.libre.completa, cuenta: false, motivo: q.get('motivo') || '' } : null,   // ?motivo=vencida|exalumno para probar
        encuesta: LIBRE ? !j.libre.nivelado : q.has('encuesta'),   // la prueba de nivel (en la prueba sin libre: ?demo=1&encuesta)
        cuenta: LIBRE ? false : undefined,
        biblioteca: ETAPAS.map((nombre, i) => ({ etapa: i + 1, nombre, abierto: !LIBRE && i + 1 <= et.etapa, amazon: LIBRE })),
        catalogo: { tienda: TIENDA, lugares: ['sala-pared', 'sala-sillon', 'sala-alfombra', 'sala-musica', 'sala-mesa', 'cocina-estufa', 'cocina-ventana', 'cocina-mesa', 'cocina-repisa', 'dorm-cama', 'dorm-mesita', 'dorm-pared', 'jardin-banca', 'jardin-flores', 'jardin-fogata'], personajes: PERSONAJES, insignias: INSIGNIAS.map(([id, nombre]) => ({ id, nombre })) }
      };
    },
    insignias(j, x) { const n = INSIGNIAS.filter(([id, , si]) => j.insignias.indexOf(id) < 0 && si(j, x)).map(i => i[0]); j.insignias = j.insignias.concat(n); return n; },
    practica(d) {
      const hoy = demo.hoy(), j = demo.leer(), x = d.actividad;
      if (!(x.intentos >= 1 && x.aciertos >= 0 && x.aciertos <= x.intentos)) throw new Error('El resultado no se entiende.');
      j.hoy = demo.hoyDe(j, hoy);
      let avance = null;
      if (LIBRE) {
        // cierre: la práctica se cierra sin respuestas (la última actividad se saltó): no gasta ni cuenta para pasar
        if (!x.cierre && (j.hoy.gastada || 0) >= ENERGIA_DIA) throw sinEnergia();
        if (!x.cierre) j.hoy.gastada = (j.hoy.gastada || 0) + gasto(x.aciertos, x.intentos);
        if (!j.hoy.terminada && !x.cierre) { j.hoy.aciertos = (j.hoy.aciertos || 0) + x.aciertos; j.hoy.intentos = (j.hoy.intentos || 0) + x.intentos; }
        if (d.terminada && !j.hoy.terminada) {
          const pct = j.hoy.intentos ? j.hoy.aciertos / j.hoy.intentos : 0, paso = pct >= PARA_PASAR && !j.libre.completa;
          if (paso) j.libre.paso = hoy;
          avance = { pct: Math.round(pct * 100), paso, ultima: j.libre.semana >= ULTIMA_LIBRE };
        }
      }
      const perfecta = x.aciertos === x.intentos && x.intentos >= 4;
      let gana = Math.min(x.aciertos, 15) + (perfecta ? 5 : 0);
      if (j.hoy.terminada) gana = Math.floor(gana / 2);
      const antes = j.dias; let fuego = null;
      if (d.terminada && !j.hoy.terminada) {
        j.hoy.terminada = true;
        const dif = j.ultimo ? diasEntre(j.ultimo, hoy) : null;
        if (dif === 1) j.racha++;
        else if (dif !== null && dif > 1 && dif - 1 <= j.lena) { j.lena -= dif - 1; j.racha++; }
        else if (dif !== 0) j.racha = 1;
        j.ultimo = hoy; j.dias++; j.mejor = Math.max(j.mejor, j.racha);
        if (j.racha % 7 === 0) j.lena = Math.min(2, j.lena + 1);
        gana += 20 + Math.min(j.racha, 10);
        fuego = { racha: j.racha, lena: j.lena };
      }
      gana = Math.max(0, Math.min(gana, 150 - (j.hoy.ganados || 0)));
      j.hoy.actividades++; j.hoy.ganados += gana; j.malvaviscos += gana; j.aciertos += x.aciertos;
      const nuevas = demo.insignias(j, { perfecta });
      const amigo = PERSONAJES.find(p => p.dias > antes && p.dias <= j.dias);
      demo.guardar(j);
      return { ok: true, ganados: gana, perfecta, fogata: fuego, insignias: nuevas, personaje: amigo ? amigo.id : null, avance, estado: demo.estado() };
    },
    /* la prueba de nivel: en la versión libre, la lección donde empieza (hasta la 27); en la prueba sin libre, la semana */
    nivel(s) {
      const j = demo.leer();
      if (!(s >= 1 && s <= 60)) throw new Error('La lección no se entiende.');
      if (LIBRE) {
        if (j.libre.nivelado) throw new Error('Ya hiciste la prueba de nivel.');
        Object.assign(j.libre, { semana: Math.min(s, ULTIMA_LIBRE), paso: '', completa: false, nivelado: demo.hoy() });
        demo.guardar(j);
        return { ok: true, estado: demo.estado() };
      }
      const e = demo.estado(), x = etapaDe(s), g = window.Leccion.GUIA[s];
      e.encuesta = false;
      e.leccion = { semana: s, etapa: x.etapa, nombreEtapa: ETAPAS[x.etapa - 1], numero: x.leccion, nivel: 'Etapa ' + x.etapa + ' · Lección ' + x.leccion, tema: g[0], objetivo: g[1], app: APPS[s] };
      e.camino.forEach(c => { c.estado = c.semana === s ? 'actual' : c.semana < s ? 'hecha' : 'futura'; });
      return { ok: true, estado: e };
    },
    comprar(id) {
      const j = demo.leer(), item = TIENDA.find(t => t.id === id);
      if (!item) throw new Error('Eso no está en la tienda.');
      if (j.inventario.indexOf(id) >= 0) throw new Error('Ya lo tienes en tu casita.');
      if (j.malvaviscos < item.precio) throw new Error('Te faltan ' + (item.precio - j.malvaviscos) + ' malvaviscos.');
      j.malvaviscos -= item.precio; j.inventario.push(id);   // queda en la bandeja de calcomanías
      const nuevas = demo.insignias(j); demo.guardar(j);
      return { ok: true, insignias: nuevas, estado: demo.estado() };
    },
    casa(casa) {
      const j = demo.leer();
      const limpia = {};
      Object.keys(casa).forEach(id => {
        if (j.inventario.indexOf(id) < 0) throw new Error('Eso no está en tu bandeja de calcomanías.');
        const c = casa[id];
        if (!(c.x >= 0 && c.x <= 100 && c.y >= 0 && c.y <= 100 && c.s >= .3 && c.s <= 3 && Number.isInteger(c.z))) throw new Error('Esa calcomanía no se entiende.');
        limpia[id] = { x: Math.round(c.x * 10) / 10, y: Math.round(c.y * 10) / 10, s: Math.round(c.s * 100) / 100, z: c.z, f: c.f === true };
      });
      j.casa = limpia;
      const nuevas = demo.insignias(j); demo.guardar(j);
      return { ok: true, insignias: nuevas, estado: demo.estado() };
    }
  };
  const espera = v => new Promise(r => setTimeout(() => r(v), 180));
  /* el servidor dice lo mismo con este texto: la app lo reconoce y muestra «vuelve mañana» */
  const SIN_ENERGIA = '¡Se acabó tu energía de hoy! Vuelve mañana ⚡';
  function sinEnergia() { const e = new Error(SIN_ENERGIA); e.sinEnergia = true; return e; }
  const marcar = e => { if (e && e.message === SIN_ENERGIA) e.sinEnergia = true; throw e; };

  /* Los libros de la biblioteca (uno por etapa, completo). Vienen del sistema con la clave del alumno porque se venden en
     Amazon: no están en esta app pública. En la prueba (?demo=1) se leen de demo-libros/, que arma
     herramientas/libros_demo.js y no se sube a GitHub. Cada libro se baja una sola vez por visita. */
  const libros = {};
  async function bajarLibro(n) {
    if (LIBRE) throw new Error('Este libro está en Amazon 📚');
    const url = DEMO ? 'demo-libros/piano-' + n + '.json'   // por ahora el bosque es de piano para todos
      : window.BOSQUE_API + '?api=libro&k=' + encodeURIComponent(clave) + '&etapa=' + n;
    let d;
    try { d = await (await fetch(url)).json(); } catch (e) { throw new Error(DEMO ? 'En la prueba faltan los libros: corre node herramientas/libros_demo.js' : 'No se pudo abrir el libro. Revisa tu internet.'); }
    if (d.error) throw new Error(d.error);
    return d;
  }

  /* en el modo local, los errores del motor llegan como promesa rechazada (igual que los del servidor) */
  const local = fn => new Promise((ok, mal) => { try { ok(fn()); } catch (e) { mal(e); } }).then(espera);
  return {
    demo: DEMO,
    libre: LIBRE,
    energia: { max: ENERGIA_DIA, error: COSTO_ERROR, gasto },
    tieneClave: () => LOCAL || !!clave,
    cargar: () => LOCAL ? local(() => porInstrumento(demo.estado())) : get(),
    practica: (actividad, terminada) => (LOCAL ? local(() => porInstrumento(demo.practica({ actividad, terminada }))) : post({ accion: 'practicaJuego', actividad, terminada })).catch(marcar),
    comprar: item => LOCAL ? local(() => demo.comprar(item)) : post({ accion: 'comprarJuego', item }),
    libro: n => libros[n] || (libros[n] = bajarLibro(n).catch(e => { delete libros[n]; throw e; })),
    guardarCasa: casa => LOCAL ? local(() => demo.casa(casa)) : post({ accion: 'guardarCasa', casa }),
    nivel: semana => LOCAL ? local(() => porInstrumento(demo.nivel(semana))) : post({ accion: 'nivelJuego', semana }),
    /* reportar un error o un reclamo (llega a la hoja «Reportes» del sistema); en la prueba (?demo=1) no se manda */
    reporte: datos => DEMO ? local(() => ({ ok: true })) : post(Object.assign({ accion: 'reporteJuego' }, datos)),
    /* «Guardar mi progreso con Google»: el servidor revisa el token, pasa lo jugado en este celular (solo la primera vez)
       y devuelve la clave del bosque de esa persona; desde ahí la app entra con esa clave, como un alumno */
    async entrarGoogle(credencial) {
      const r = await post({ accion: 'entrarGoogle', credencial, local: LIBRE ? demo.leer() : null });
      try { localStorage.setItem('bosque-clave', r.clave); } catch (e) { }
      location.replace(location.pathname + '?k=' + encodeURIComponent(r.clave));
      return r;
    }
  };
})();
