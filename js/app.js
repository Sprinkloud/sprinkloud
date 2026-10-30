/* El bosque de Sprinkloud: pantallas (entrada, camino, práctica, fin, casita, tienda, biblioteca) y el estado del alumno. */
(function () {
  'use strict';
  const S = window.Sonido, A = window.Actividades, Api = window.Api;
  const { el, puff, espera } = A;
  const $ = s => document.querySelector(s);
  let estado = null, etapaVista = 1;

  /* ---------- Día y noche según la hora real ---------- */
  function hora() { const h = new Date().getHours(); document.documentElement.dataset.hora = h >= 19 || h < 6 ? 'noche' : 'dia'; }
  hora(); setInterval(hora, 60000);

  /* ---------- Dibujos chiquitos: fogata, malvavisco ---------- */
  const SVG_FOGATA = '<svg viewBox="0 0 64 64" aria-hidden="true">' +
    '<ellipse cx="32" cy="56" rx="22" ry="4" fill="#5E3B22" opacity=".18"/>' +
    '<rect x="12" y="46" width="40" height="8" rx="4" fill="#8A5A35" transform="rotate(-14 32 50)"/>' +
    '<rect x="12" y="46" width="40" height="8" rx="4" fill="#6E4428" transform="rotate(14 32 50)"/>' +
    '<circle class="brasa" cx="26" cy="47" r="3" fill="#E8742A"/><circle class="brasa" cx="36" cy="46" r="2.4" fill="#FFB54A"/>' +
    '<path class="llama" d="M32 8c6 10 14 16 14 26a14 14 0 0 1-28 0c0-6 4-10 6-14 1 5 3 7 5 7-2-7 0-13 3-19z" fill="#E8742A"/>' +
    '<path class="llama dos" d="M32 22c4 6 8 9 8 15a8 8 0 0 1-16 0c0-4 3-7 4-9 1 3 2 4 3 4-1-4 0-7 1-10z" fill="#FFC75A"/>' +
    '</svg>';
  const fogata = (estadoFuego, clase) => '<span class="fogata ' + (clase || '') + '" data-estado="' + estadoFuego + '">' + SVG_FOGATA + '<span class="humo"></span><span class="humo"></span><span class="humo"></span></span>';
  const MALVAVISCO = '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="8" y="9" width="24" height="24" rx="9" fill="#FFF4EC" stroke="#E6B98A" stroke-width="2"/>' +
    '<path d="M9 17c3-2 19-2 22 0" stroke="#E6B98A" stroke-width="2" fill="none"/><ellipse cx="20" cy="13" rx="9" ry="3.4" fill="#E6B98A" opacity=".8"/>' +
    '<circle cx="15" cy="21" r="1.6" fill="#E6B98A" opacity=".5"/></svg>';

  /* ---------- Arte de la tienda y las insignias (dibujos de Gemini cuando existan; mientras, emojis) ---------- */
  const IMAGENES = new Set(window.BOSQUE_ARTE || []);
  const EMOJI = { 'cuadro-osito': '🖼️', guirnalda: '🍂', 'reloj-cuco': '🕰️', cortinas: '🪟', maceta: '🪴', farolito: '🏮', tetera: '🫖', calcetines: '🧦',
    'olla-chocolate': '🍲', sillon: '🛋️', 'atril-violin': '🎻', 'piano-madera': '🎹', 'alfombra-redonda': '🟠', cojines: '🧶', 'alfombra-hojas': '🍁',
    tazas: '☕', 'pastel-miel': '🍰', lampara: '🪔', libros: '📚', 'tarro-miel': '🍯', metronomo: '⏱️', 'mesa-comedor': '🪑', 'frascos-mermelada': '🫙',
    'cama-parches': '🛏️', 'cama-hojas': '🛌', banca: '🪵', columpio: '🎠', 'flores-jardin': '🌷', calabazas: '🎃', 'palitos-malvavisco': '🍡',
    primera: '🌱', racha3: '🔥', racha7: '🪵', racha14: '🌟', racha30: '👑', perfecta: '💯', aciertos100: '🎯', aciertos500: '🏆', dias10: '🍄', dias30: '🌳', compra: '🛍️', casa5: '🏡' };
  function arte(id) { return IMAGENES.has(id) ? el('img', { src: 'assets/arte/' + id + '.webp', alt: '' }) : document.createTextNode(EMOJI[id] || '✨'); }
  /* La casita es una casa de muñecas vista desde arriba (assets/ilustraciones/casa-vacia.webp, cuadrada).
     Cada lugar: [x, y, tamaño] en % de la imagen. Al elegir un cuarto, la cámara se acerca (CUARTOS: centro y zoom). */
  const LUGARES = { 'sala-pared': 'Pared de la sala', 'sala-sillon': 'Sillón', 'sala-alfombra': 'Alfombra', 'sala-musica': 'Rincón de música', 'sala-mesa': 'Comedor',
    'cocina-estufa': 'Estufa', 'cocina-ventana': 'Ventana', 'cocina-mesa': 'Mesita', 'cocina-repisa': 'Repisa',
    'dorm-cama': 'Cama', 'dorm-mesita': 'Mesita de noche', 'dorm-pared': 'Pared del cuarto',
    'jardin-banca': 'Para sentarse', 'jardin-flores': 'Huerto', 'jardin-fogata': 'Fogata' };
  const POS = { 'sala-pared': [19, 40, 8], 'sala-sillon': [30, 53, 13], 'sala-alfombra': [40, 57, 15], 'sala-musica': [35, 46, 11], 'sala-mesa': [52, 62, 12],
    'cocina-estufa': [71, 46, 10], 'cocina-ventana': [78, 42, 7], 'cocina-mesa': [67, 53, 9], 'cocina-repisa': [65, 41, 7],
    'dorm-cama': [55, 37, 11], 'dorm-mesita': [47, 35, 7], 'dorm-pared': [52, 28, 7],
    'jardin-banca': [63, 85, 10], 'jardin-flores': [19, 72, 11], 'jardin-fogata': [76, 80, 8] };
  const CUARTOS = [
    { id: 'todo', nombre: 'Toda la casa', x: 50, y: 53, zoom: 1 },
    { id: 'sala', nombre: 'Sala', x: 38, y: 53, zoom: 2 },
    { id: 'cocina', nombre: 'Cocina', x: 71, y: 48, zoom: 2.7 },
    { id: 'dorm', nombre: 'Dormitorio', x: 53, y: 35, zoom: 2.7 },
    { id: 'jardin', nombre: 'Jardín', x: 48, y: 77, zoom: 1.7 }
  ];
  let cuartoVisto = 'todo';
  const RETRATO = id => 'assets/ilustraciones/' + (id === 'osito' ? 'osito-bosque' : id) + '.webp';

  /* ---------- Pantallas ---------- */
  /* cada pantalla tiene su canción y su ambiente (Sonido.escena); en la práctica, silencio */
  const ESCENA = { entrada: 'mapa', camino: 'mapa', practica: 'practica', fin: 'silencio', casita: 'casita', tienda: 'tienda', logros: 'logros' };
  function ir(id) {
    const antes = document.querySelector('.pantalla.activa');
    document.querySelectorAll('.pantalla').forEach(p => p.classList.toggle('activa', p.id === id));
    S.callar(); S.pagina();
    if (S.pref.musica) S.escena(ESCENA[id] || 'mapa');
    if (id === 'tienda' && (!antes || antes.id !== 'tienda')) S.campanaPuerta();
  }
  function aviso(texto) {
    const a = $('#aviso'); a.textContent = texto; a.classList.add('ver');
    clearTimeout(aviso.t); aviso.t = setTimeout(() => a.classList.remove('ver'), 2600);
  }
  function fichas() {
    const j = estado.juego;
    return el('div', { class: 'barra' },
      el('span', { class: 'ficha', title: 'Días seguidos de práctica', html: fogata(j.fogata) + '<span class="num">' + j.racha + '</span>' }),
      el('span', { class: 'ficha', title: 'Malvaviscos', html: MALVAVISCO + '<span class="num">' + j.malvaviscos + '</span>' }),
      j.energia ? el('span', { class: 'ficha energia' + (j.energia.queda ? '' : ' vacia'), title: 'Energía de hoy', html: '<span class="rayo" aria-hidden="true">⚡</span><span class="num">' + j.energia.queda + '</span>' }) : null,
      estado.libre ? el('button', { class: 'btn-icono club-btn', type: 'button', 'aria-label': 'Club musical Sprinkloud', title: 'Club musical Sprinkloud', text: '⭐', onclick: () => { S.toque(); club(); } }) : null,
      el('button', { class: 'btn-icono', type: 'button', 'aria-label': 'Música', text: S.pref.musica ? '🎵' : '🔇', onclick: e => { const on = S.alternarMusica(); e.currentTarget.textContent = on ? '🎵' : '🔇'; } }));
  }

  /* ---------- Entrada ---------- */
  function entrada() {
    const p = $('#entrada');
    if (!Api.tieneClave()) {
      p.replaceChildren(el('div', { class: 'portada' }, el('img', { src: 'assets/ilustraciones/osito-bosque.webp', alt: 'El osito en el bosque' })),
        el('h1', { html: 'El bosque<span>de Sprinkloud</span>' }),
        el('p', { text: 'Para entrar, abre el enlace que te mandó tu maestro por WhatsApp.' }));
      ir('entrada'); return;
    }
    const boton = puff('🌲 Entrar al bosque', 'grande respira', async () => {
      S.despertar();
      boton.disabled = true; boton.querySelector('.cara').textContent = 'Abriendo el bosque…';
      try { estado = await Api.cargar(); etapaVista = estado.leccion ? estado.leccion.etapa : 6; camino(); }
      catch (e) { boton.disabled = false; boton.querySelector('.cara').textContent = '🌲 Entrar al bosque'; aviso(e.message || 'No se pudo abrir. Revisa tu internet.'); }
    });
    p.replaceChildren(el('div', { class: 'portada aparece' }, el('img', { src: 'assets/ilustraciones/osito-bosque.webp', alt: 'El osito en el bosque' })),
      el('h1', { class: 'aparece d1', html: 'El bosque<span>de Sprinkloud</span>' }),
      Api.libre ? el('p', { class: 'lema aparece d2', text: 'Aprende teoría musical jugando, unos minutos cada día' }) : null,
      el('div', { class: 'aparece d2', style: 'width:100%;display:grid;justify-items:center' }, boton),
      Api.libre && !Api.demo && window.BOSQUE_GOOGLE_ID ? el('button', { class: 'enlace-texto aparece d3', type: 'button', text: '¿Ya guardaste tu progreso? Entra con Google', onclick: () => { S.toque(); cuenta(true); } }) : null);
    ir('entrada');
  }

  /* ---------- El camino ---------- */
  function camino() {
    const p = $('#camino'), l = estado.leccion, j = estado.juego;
    const lb = estado.libre, sinEnergia = j.energia && !j.energia.queda;
    const saludo = !l ? '¡Terminaste toda la guía! 🎉'
      : lb && lb.completa ? '¡Terminaste la versión libre! 🎉 Sigue con un plan del club'
      : sinEnergia ? '¡Se acabó tu energía de hoy! Vuelve mañana ⚡'
      : j.hoy.terminada ? (lb && lb.paso ? '¡Pasaste la lección! Mañana se abre la siguiente 🌙' : '¡Ya practicaste hoy! Vuelve mañana 🌙')
      : (estado.alumno ? '¡Hola, ' + estado.alumno + '! ' : '¡Hola! ') + 'Hoy toca: ' + l.tema;
    const luciernagas = Array.from({ length: 6 }, (_, i) => el('i', { class: 'luciernaga', style: 'left:' + (10 + i * 15) + '%;top:' + (20 + (i * 37) % 50) + '%;animation-delay:' + (-i * .8) + 's' }));
    const heroe = el('div', { class: 'heroe' }, el('img', { src: 'assets/ilustraciones/osito-bosque.webp', alt: '' }), el('div', { class: 'noche-luz' }, luciernagas), el('div', { class: 'burbuja', text: saludo }));
    const etapas = [...new Set(estado.camino.map(c => c.etapa))];
    const paradas = estado.camino.filter(c => c.etapa === etapaVista);
    const nombre = (estado.leccion && estado.leccion.etapa === etapaVista) ? estado.leccion.nombreEtapa : NOMBRES_ETAPA[etapaVista - 1];
    const zona = el('div', { class: 'zona' },
      el('button', { class: 'btn-icono', type: 'button', 'aria-label': 'Etapa anterior', disabled: etapaVista <= etapas[0], onclick: () => { etapaVista--; camino(); }, text: '◀' }),
      el('h2', { html: '<small>Etapa ' + etapaVista + '</small>' + (nombre || '') }),
      el('button', { class: 'btn-icono', type: 'button', 'aria-label': 'Etapa siguiente', disabled: etapaVista >= etapas[etapas.length - 1], onclick: () => { etapaVista++; camino(); }, text: '▶' }));
    const mapa = el('div', { class: 'mapa' }, dibujarMapa(paradas));
    const practicar = puff('<span class="ico">' + (sinEnergia ? '⚡' : j.hoy.terminada ? '🌟' : '▶') + '</span>', 'grande ' + (j.hoy.terminada || sinEnergia ? '' : 'ocre respira'),
      () => lb && lb.completa ? club('completa') : practicar_(estado.leccion.semana));
    practicar.setAttribute('aria-label', j.hoy.terminada ? 'Practicar más' : 'Practicar');
    if (!l) practicar.disabled = true;
    /* solo los dibujos, sin palabras (pedido de la dueña, 29-oct); el nombre queda para los lectores de pantalla */
    const conNombre = (b, nombre) => { b.setAttribute('aria-label', nombre); b.title = nombre; return b; };
    const nav = el('div', { class: 'nav' },
      conNombre(puff('<span class="ico">🏡</span>', 'madera', () => casita()), 'Mi casita'),
      practicar,
      conNombre(puff('<span class="ico">🧺</span>', 'rosa', () => tienda()), 'Tienda'),
      conNombre(puff('<span class="ico">📚</span>', 'cielo', () => logros()), 'Biblioteca'));
    p.replaceChildren(fichas(), heroe, zona, mapa, nav);
    ir('camino');
    const actual = mapa.querySelector('.parada.actual');
    // centrar la parada de hoy solo dentro del mapa (scrollIntoView también correría la página entera)
    if (actual) requestAnimationFrame(() => { const m = mapa.getBoundingClientRect(), b = actual.getBoundingClientRect(); mapa.scrollTop += (b.top + b.height / 2) - (m.top + m.height / 2); });
    else mapa.scrollTop = mapa.scrollHeight;
  }
  const NOMBRES_ETAPA = ['Cuerpo y pulso', 'Primeras lecturas', 'Lectura y ritmo', 'Intervalos, escalas y acordes', 'Tonalidad: reposo, mayor y menor', 'Músico completo', 'Los modos griegos'];
  const ZONAS = ['#E1E6CF', '#DCE5E8', '#F1E0BC', '#E6DDEB', '#F3DED8', '#DDE8D6', '#E8E0F0'];   // la 7, los modos (29-oct)

  /* El sendero: la lección 1 abajo y se sube, como en un mapa de cuento; árboles y hongos a los lados */
  function dibujarMapa(paradas) {
    /* en computadora el sendero ocupa el mismo ancho que la ilustración de arriba (pedido de la dueña, 29-oct): el dibujo se
       hace más ancho (no más grande), así las piedras y los árboles conservan su tamaño. En el celular, 360 de ancho. */
    const ancho = ($('#app') && $('#app').clientWidth) || 360, W = Math.round(Math.min(720, Math.max(360, (ancho - 32) * 360 / 420)));
    const X = v => Math.round(v * W / 360);   // las posiciones de siempre, repartidas en el ancho nuevo
    const PASO = 96, n = paradas.length, H = n * PASO + 60;
    const pts = paradas.map((_, i) => ({ x: X(i % 2 ? 250 : 110), y: H - 50 - i * PASO }));
    let d = 'M' + pts[0].x + ' ' + (pts[0].y + 40);
    pts.forEach((pt, i) => { const prev = i ? pts[i - 1] : { x: pt.x, y: pt.y + 40 }; d += ' C' + prev.x + ' ' + (prev.y - 48) + ',' + pt.x + ' ' + (pt.y + 48) + ',' + pt.x + ' ' + pt.y; });
    const NS = 'http://www.w3.org/2000/svg';
    let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="' + NS + '" role="list" aria-label="Lecciones de la etapa">' +
      '<defs><clipPath id="cara-osito"><circle cx="0" cy="0" r="24"/></clipPath>' +
      '<radialGradient id="luz" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>' +
      '<rect class="fondo-zona" x="0" y="0" width="' + W + '" height="' + H + '" rx="26" fill="' + ZONAS[(etapaVista - 1) % ZONAS.length] + '"/>' +
      '<path d="' + d + '" fill="none" stroke="#C9A27A" stroke-width="30" stroke-linecap="round" opacity=".45"/>' +
      '<path d="' + d + '" fill="none" stroke="#8A5A35" stroke-width="3" stroke-dasharray="2 12" stroke-linecap="round" opacity=".55"/>';
    // árboles y hongos (decorado del bosque)
    for (let i = 0; i < n; i++) {
      const y = H - 70 - i * PASO, lado = X(i % 2 ? 40 : 320), otro = X(i % 2 ? 330 : 30);
      svg += pino(lado, y + 10, .9 + (i % 3) * .12) + (i % 2 ? hongo(otro, y + 40) : pino(otro, y + 50, .7));
    }
    paradas.forEach((c, i) => {
      const pt = pts[i], col = c.estado === 'hecha' ? ['#647745', '#48592F'] : c.estado === 'actual' ? ['#C4923A', '#9C6F22'] : ['#FBF7EE', '#C9B79B'];
      svg += '<g class="parada ' + c.estado + '" role="listitem" tabindex="0" data-semana="' + c.semana + '" aria-label="Lección ' + c.leccion + ': ' + esc(c.tema) + '" transform="translate(' + pt.x + ' ' + pt.y + ')">' +
        (c.estado === 'actual' ? '<circle class="halo" r="40" fill="none" stroke="#FFB54A" stroke-width="5"/>' : '') +
        '<g class="piedra"><circle r="32" cy="6" fill="' + col[1] + '"/><circle r="32" fill="' + col[0] + '"/><circle r="32" fill="url(#luz)"/>' +
        '<text y="9" text-anchor="middle" font-size="' + (c.premium ? 22 : 26) + '" fill="' + (c.estado === 'futura' ? '#A8977A' : '#FFFDF5') + '">' + (c.premium ? '🔒' : c.estado === 'hecha' ? '★' : c.leccion) + '</text></g>' +
        (c.estado === 'actual' ? '<g transform="translate(' + (i % 2 ? -66 : 66) + ' -14)"><circle r="27" fill="#FBF7EE"/><image href="assets/ilustraciones/osito-bosque.webp" x="-131" y="-104" width="262" height="231" clip-path="url(#cara-osito)"/><circle r="26" fill="none" stroke="#FBF7EE" stroke-width="3"/></g>' : '') +
        '</g>';
    });
    svg += '</svg>';
    const caja = el('div', { html: svg });
    // Enter o espacio sobre una parada (con el teclado) hace lo mismo que tocarla
    caja.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.parada')) { e.preventDefault(); e.target.closest('.parada').dispatchEvent(new MouseEvent('click', { bubbles: true })); } });
    caja.addEventListener('click', e => {
      const g = e.target.closest('.parada'); if (!g) return;
      const c = paradas.find(x => String(x.semana) === g.dataset.semana);
      S.toque();
      // tocar la piedra lleva directo a la lección (pedido de la dueña): la de hoy o el repaso de una pasada; las futuras tienen candado
      if (c.premium) { club('leccion'); return; }   // versión libre: después de la etapa 3, los planes del club
      if (c.estado === 'futura') { aviso('🔒 Lección ' + c.leccion + ': ' + c.tema + (estado.libre ? ' (se abre cuando pases la anterior con 80 %)' : ' (pronto)')); return; }
      practicar_(c.semana);
    });
    return caja;
  }
  function pino(x, y, k) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + k + ')" opacity=".85"><rect x="-3" y="10" width="6" height="12" fill="#8A5A35"/>' +
      '<path d="M0 -34 L18 -6 L8 -6 L22 14 L-22 14 L-8 -6 L-18 -6 Z" fill="#647745"/><path d="M0 -34 L18 -6 L8 -6 L22 14 L0 14 Z" fill="#48592F" opacity=".35"/></g>';
  }
  function hongo(x, y) {
    return '<g transform="translate(' + x + ' ' + y + ')"><rect x="-3" y="-2" width="6" height="10" rx="2" fill="#F6F0E2"/><path d="M-12 0 a12 9 0 0 1 24 0z" fill="#B0685A"/>' +
      '<circle cx="-4" cy="-4" r="1.8" fill="#FBF7EE"/><circle cx="4" cy="-6" r="1.4" fill="#FBF7EE"/></g>';
  }
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

  /* ---------- La práctica del día ---------- */
  function memoriaHoy(semana) { try { const m = JSON.parse(localStorage.getItem('bosque-hoy') || 'null'); return m && m.fecha === estado.hoy && m.semana === semana ? m : null; } catch (e) { return null; } }
  function recordar(m) { try { localStorage.setItem('bosque-hoy', JSON.stringify(m)); } catch (e) { } }

  /* semana: la lección que se tocó en el camino (sin semana: la de hoy). Una lección pasada se practica igual, de repaso. */
  async function practicar_(semana) {
    if (typeof semana !== 'number') semana = estado.leccion.semana;
    const c = estado.camino.find(x => x.semana === semana) || {};
    const leccion = semana === estado.leccion.semana ? estado.leccion
      : { semana, etapa: c.etapa, numero: c.leccion, nivel: 'Etapa ' + c.etapa + ' · Lección ' + c.leccion, tema: c.tema, app: c.app };
    const extra = estado.juego.hoy.terminada;   // ya terminó hoy: práctica libre (otras preguntas, menos malvaviscos)
    if (estado.juego.energia && !estado.juego.energia.queda) { club('energia'); return; }
    let mem = memoriaHoy(semana) || { fecha: estado.hoy, semana, hechas: 0, vuelta: 0 };
    if (extra) { mem.vuelta = (mem.vuelta || 0) + 1; mem.hechas = 0; }
    recordar(mem);
    const base = Object.assign({}, estado, { leccion, alumno: estado.alumno + (mem.vuelta ? '#' + mem.vuelta : '') });
    const lista = A.plan(base);
    const p = $('#practica');
    const pasos = el('div', { class: 'pasos' }, lista.map(a => el('span', { class: 'paso', html: '<span style="font-size:1.1rem">' + a.icono + '</span>' })));
    const escenario = el('div', { class: 'escenario' });
    const cerrar = el('button', { class: 'btn-icono', type: 'button', 'aria-label': 'Volver al bosque', text: '✕', onclick: () => { cancelado = true; soltar(); camino(); } });
    /* versión libre: la energía baja al empezar cada actividad (2) y con cada error (2 más), mientras se juega. Se cuentan los
       sonidos de acierto y de error de las actividades (no los del ejemplo del osito); al terminar cada actividad, la
       cuenta buena es la del servidor (o del celular), con los aciertos e intentos de la actividad. */
    const en = estado.juego.energia;
    const rayo = en ? el('span', { class: 'ficha energia', title: 'Energía de hoy', html: '<span class="rayo" aria-hidden="true">⚡</span><span class="num">' + en.queda + '</span>' }) : null;
    p.replaceChildren(el('div', { class: 'practica-arriba' }, cerrar, pasos, rayo, el('span', { class: 'ficha', html: MALVAVISCO + '<span class="num" id="ganados">+0</span>' })), escenario);
    ir('practica');
    let cancelado = false, ganados = 0, ultimo = null, vivoA = 0, vivoI = 0, actual = null;
    const acierto = S.acierto, error = S.error;
    function soltar() { S.acierto = acierto; S.error = error; }
    const queda = () => estado.juego.energia.queda - Api.energia.gasto(vivoA, vivoI);
    function pintarRayo() {
      const n = Math.max(0, queda());
      rayo.querySelector('.num').textContent = n; rayo.classList.toggle('vacia', !n);
      rayo.classList.remove('baja'); void rayo.offsetWidth; rayo.classList.add('baja');
    }
    function contar(ok) {
      if (!en || cancelado || escenario.classList.contains('ejemplo')) return;
      const antes = queda();
      vivoI++; if (ok) vivoA++;
      if (queda() !== antes) pintarRayo();   // el rayo salta solo cuando la energía baja (la primera respuesta y cada error)
      if (queda() <= 0) agotada();
    }
    async function agotada() {
      cancelado = true; soltar();
      try { if (vivoI && actual) await Api.practica({ tipo: actual, aciertos: vivoA, intentos: vivoI }, false).then(x => { estado = x.estado; }); } catch (e) { }
      if (!estado.juego.energia || estado.juego.energia.queda) estado.juego.energia = Object.assign({}, estado.juego.energia, { queda: 0 });
      camino(); club('energia');
    }
    if (en) { S.acierto = (...a) => { contar(true); return acierto.apply(S, a); }; S.error = (...a) => { contar(false); return error.apply(S, a); }; }
    for (let i = mem.hechas; i < lista.length; i++) {
      if (cancelado) return;
      [...pasos.children].forEach((x, k) => { x.classList.toggle('hecho', k < i); x.classList.toggle('ahora', k === i); });
      escenario.replaceChildren(); S.callar();
      actual = lista[i].tipo; vivoA = vivoI = 0;
      const r = await lista[i].correr(escenario);
      if (cancelado) return;
      if (r) {
        const ultima = i === lista.length - 1;
        try {
          ultimo = await Api.practica({ tipo: lista[i].tipo, aciertos: r.aciertos, intentos: r.intentos }, ultima && !extra);
          ganados += ultimo.ganados; estado = ultimo.estado; vivoA = vivoI = 0;
          if (en) pintarRayo();
          $('#ganados').textContent = '+' + ganados; if (ultimo.ganados) S.moneda(Math.ceil(ultimo.ganados / 4));
        } catch (e) { if (e.sinEnergia) { vivoA = vivoI = 0; agotada(); return; } aviso(e.message || 'No se pudo guardar. Revisa tu internet.'); }
        if (en && !estado.juego.energia.queda && !ultima) { agotada(); return; }
      }
      mem.hechas = i + 1; recordar(mem);
      escenario.classList.remove('ejemplo');
    }
    soltar();
    if (!ultimo || !ultimo.fogata) {   // si la última se saltó, la práctica igual se cierra para prender la fogata
      try { if (!extra && !estado.juego.hoy.terminada) { ultimo = await Api.practica({ tipo: 'repaso', aciertos: 0, intentos: 1, cierre: true }, true); estado = ultimo.estado; ganados += ultimo.ganados; } } catch (e) { }
    }
    fin(ultimo, ganados, extra);
  }

  /* ---------- ¡Terminaste tu práctica de hoy! ---------- */
  function fin(r, ganados, extra) {
    const p = $('#fin'), j = estado.juego;
    p.replaceChildren(...[
      el('div', { class: 'fogata-grande aparece', html: fogata(j.fogata) }),
      el('h1', { class: 'aparece d1', text: extra ? '¡Practicaste más!' : '¡Terminaste tu práctica de hoy!' }),
      el('div', { class: 'ganado aparece d2', html: MALVAVISCO + '+' + ganados }),
      j.racha ? el('div', { class: 'racha-txt aparece d3', text: '🔥 ' + j.racha + (j.racha === 1 ? ' día' : ' días seguidos') + (j.lena ? ' · 🪵 ' + j.lena : '') }) : null,
      avanceTxt(r && r.avance),
      el('div', { class: 'acciones aparece d4' },
        puff('📸 Compartir mi logro', 'rosa', () => window.Compartir.dia(estado, ganados)),
        r && r.avance && r.avance.paso && r.avance.ultima ? puff('⭐ Seguir con el club', 'ocre', () => club('completa')) : null,
        !extra && sinCuenta() ? puff('🔐 Guardar mi progreso', 'madera', () => cuenta()) : null,
        puff('🌲 Volver al bosque', 'grande', () => camino()))].filter(Boolean));
    ir('fin');
    S.festejo(); setTimeout(() => S.fuego(), 500);
    confeti();
    const premios = [].concat((r && r.insignias) || [], r && r.personaje ? ['amigo:' + r.personaje] : []);
    if (premios.length) setTimeout(() => mostrarPremios(premios), 2200);
  }
  /* versión libre: cómo le fue para pasar a la lección siguiente (80 %) */
  function avanceTxt(a) {
    if (!a) return null;
    const texto = a.paso && a.ultima ? '🎉 ¡Completaste la etapa 3 con ' + a.pct + ' %! Terminaste la versión libre.'
      : a.paso ? '⭐ ¡' + a.pct + ' % de aciertos! Mañana se abre la lección siguiente.'
      : '💪 ' + a.pct + ' % de aciertos. Con 80 % pasas a la lección siguiente: ¡mañana otra vez!';
    return el('p', { class: 'avance-txt aparece d3' + (a.paso ? ' paso' : ''), text: texto });
  }

  /* ---------- El club (versión libre): planes con acceso total y clases en vivo, y los libros en Amazon ---------- */
  const MOTIVOS = {
    energia: ['¡Se acabó tu energía de hoy! ⚡', 'Mañana se recarga. ¿Quieres practicar sin límites?'],
    leccion: ['Esta lección es del plan completo 🔒', 'La versión libre llega hasta la etapa 3.'],
    libro: ['Este libro está en Amazon 📚', 'Cada libro trae sus lecciones con dibujos, ejemplos y prácticas.'],
    completa: ['¡Terminaste la versión libre! 🎉', 'Llegaste al final de la etapa 3. ¡Qué gran músico!']
  };
  function club(motivo) {
    const [titulo, sub] = MOTIVOS[motivo] || ['Club musical Sprinkloud ⭐', 'Aprende música con tu maestra, tu app y tus libros.'];
    const abrir = url => { S.toque(); window.open(url, '_blank', 'noopener'); };
    let cerrar;
    const contenido = el('div', { class: 'premio club' },
      el('div', { class: 'retrato' }, el('img', { src: RETRATO('osito'), alt: '' })),
      el('h2', { text: titulo }), el('p', { text: sub }),
      el('p', { class: 'club-dice', html: 'Con un plan del <b>Club musical Sprinkloud</b> tienes:' }),
      el('ul', { class: 'club-lista' },
        el('li', { text: '🌲 Las 60 lecciones del bosque y energía sin límite' }),
        el('li', { text: '📚 Los 7 libros dentro de la app' }),
        el('li', { text: '🎹 Clases de música en vivo con tu maestra' })),
      el('div', { class: 'acciones' },
        puff('💬 Quiero un plan', 'ocre', () => abrir(window.BOSQUE_CLUB.planes)),
        puff('📚 Libros en Amazon', 'cielo', () => abrir(window.BOSQUE_CLUB.amazon)),
        sinCuenta() ? puff('🔐 Guardar mi progreso', 'madera', () => { cerrar(); setTimeout(cuenta, 420); }) : null,
        puff('Ahora no', 'papel', () => cerrar())));
    cerrar = cajon(contenido);
  }

  /* ---------- «Guardar mi progreso con Google» (versión libre, 30-oct) ----------
     El botón lo dibuja Google (Google Identity Services, se carga solo al abrir este cajón). Al entrar, la app se recarga
     con la clave del bosque de esa persona (Api.entrarGoogle). */
  const sinCuenta = () => !!(estado && estado.libre && !estado.libre.cuenta && window.BOSQUE_GOOGLE_ID);
  let googleListo = null;
  function cargarGoogle() {
    if (window.google && google.accounts && google.accounts.id) return Promise.resolve();
    return googleListo || (googleListo = new Promise((ok, mal) => {
      const s = el('script', { src: 'https://accounts.google.com/gsi/client', async: true });
      s.onload = ok; s.onerror = () => { googleListo = null; mal(new Error('No se pudo abrir Google. Revisa tu internet.')); };
      document.head.append(s);
    }));
  }
  function cuenta(volver) {
    let cerrar;
    const lugar = el('div', { class: 'google-boton' }, el('p', { class: 'cargando', text: 'Abriendo Google…' }));
    const contenido = el('div', { class: 'premio club' },
      el('div', { class: 'retrato' }, el('img', { src: RETRATO('osito'), alt: '' })),
      el('h2', { text: volver ? 'Entra con tu cuenta 🔐' : 'Guarda tu progreso 🔐' }),
      el('p', { text: volver ? 'Sigue donde te quedaste, en este celular o en la computadora.' : 'Con tu cuenta de Google no pierdes tu avance y puedes seguir en otro celular o en la computadora.' }),
      lugar,
      el('div', { class: 'acciones' }, puff('Ahora no', 'papel', () => cerrar())));
    cerrar = cajon(contenido);
    cargarGoogle().then(() => {
      google.accounts.id.initialize({
        client_id: window.BOSQUE_GOOGLE_ID,
        callback: async resp => {
          lugar.replaceChildren(el('p', { class: 'cargando', text: 'Guardando tu progreso…' }));
          try { await Api.entrarGoogle(resp.credential); }
          catch (e) { lugar.replaceChildren(el('p', { class: 'cargando', text: e.message || 'No se pudo entrar con Google. Intenta otra vez.' })); }
        }
      });
      lugar.replaceChildren();
      google.accounts.id.renderButton(lugar, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', locale: 'es', width: Math.min(300, lugar.clientWidth || 280) });
    }).catch(e => lugar.replaceChildren(el('p', { class: 'cargando', text: e.message })));
  }

  function confeti() {
    if (!window.confetti || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const formas = ['🍂', '⭐', '🎵', '🔥'].map(t => confetti.shapeFromText({ text: t, scalar: 2 }));
    const tiro = (x, ang) => confetti({ particleCount: 40, spread: 70, angle: ang, origin: { x, y: .7 }, shapes: formas, scalar: 2, ticks: 220, disableForReducedMotion: true });
    tiro(.15, 60); tiro(.85, 120); setTimeout(() => tiro(.5, 90), 350);
  }

  /* ---------- Cajón que sube (premios, elegir un mueble) ---------- */
  function cajon(contenido) {
    const antes = document.activeElement;
    const velo = el('div', { class: 'velo' }), c = el('div', { class: 'cajon', role: 'dialog', 'aria-modal': 'true', tabindex: '-1' }, contenido);
    const titulo = c.querySelector('h2'); if (titulo) { titulo.id = 'cajon-titulo'; c.setAttribute('aria-labelledby', 'cajon-titulo'); }
    let cerrado = false;
    const cerrar = () => {
      if (cerrado) return; cerrado = true;
      document.removeEventListener('keydown', teclas);
      velo.classList.remove('abierto'); c.classList.remove('abierto'); setTimeout(() => { velo.remove(); c.remove(); }, 380);
      if (antes && antes.focus && document.contains(antes)) antes.focus();   // el foco vuelve a donde estaba
    };
    /* Escape cierra; Tab da la vuelta dentro del cajón */
    const teclas = e => {
      if (e.key === 'Escape') { e.preventDefault(); cerrar(); return; }
      if (e.key !== 'Tab') return;
      const f = [...c.querySelectorAll('button, [href], input, select, [tabindex]:not([tabindex="-1"])')].filter(x => !x.disabled);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    };
    document.addEventListener('keydown', teclas);
    velo.addEventListener('click', cerrar);
    document.body.append(velo, c);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      velo.classList.add('abierto'); c.classList.add('abierto');
      (c.querySelector('button') || c).focus({ preventScroll: true });
    }));
    return cerrar;
  }
  function mostrarPremios(lista) {
    if (!lista.length) return;
    const [x, ...resto] = lista;
    const amigo = x.startsWith('amigo:') ? x.slice(6) : null;
    const nombre = amigo ? (estado.catalogo.personajes.find(p => p.id === amigo) || {}).nombre : (estado.catalogo.insignias.find(i => i.id === x) || {}).nombre;
    S.festejo();
    let cerrar;
    const contenido = el('div', { class: 'premio' },
      amigo ? el('div', { class: 'retrato' }, el('img', { src: RETRATO(amigo), alt: '' })) : el('div', { class: 'medalla' }, arte(x)),
      el('h2', { text: amigo ? '¡Llegó ' + (amigo === 'ardilla' ? 'la ' : 'el ') + nombre.toLowerCase() + ' a tu bosque!' : '¡Nueva insignia!' }),
      el('p', { text: amigo ? 'Vendrá a visitarte a tu casita.' : nombre }),
      el('div', { class: 'acciones' },
        puff('📸 Compartir', 'rosa', () => amigo ? window.Compartir.amigo(estado, amigo, nombre) : window.Compartir.insignia(estado, x, nombre)),
        puff('¡Genial!', 'ocre', () => { cerrar(); setTimeout(() => mostrarPremios(resto), 450); })));
    cerrar = cajon(contenido);
  }

  /* ---------- Mi casita: un lienzo de calcomanías (idea de la dueña) ----------
     Cada compra queda en la bandeja; al tocarla se pega en el cuarto que se está viendo y se arrastra donde uno quiera.
     La que se pega o se sube después queda encima (z). Tocar una pegada la elige: agrandar, achicar, voltear, subir, bajar o guardarla. */
  function encuadre(c) {
    const z = c.zoom, max = (z - 1) * 50;
    const tx = Math.max(-max, Math.min(max, (50 - c.x) * z)), ty = Math.max(-max, Math.min(max, (50 - c.y) * z));
    return 'translate(' + tx + '%, ' + ty + '%) scale(' + z + ')';
  }
  /* el cuarto más cercano a un punto de la casa (para acercarse a una calcomanía desde «Toda la casa») */
  const cuartoDe = c => CUARTOS.filter(x => x.id !== 'todo').reduce((m, x) => Math.hypot(x.x - c.x, x.y - c.y) < Math.hypot(m.x - c.x, m.y - c.y) ? x : m).id;
  const tamBase = id => { const t = estado.catalogo.tienda.find(x => x.id === id); return ((POS[t && t.lugar] || [0, 0, 9])[2]) * 1.35; };   // un poco más grandes que los lugares de antes: se ven bien de cerca
  function casita() {
    const p = $('#casita'), j = estado.juego;
    let casa = JSON.parse(JSON.stringify(j.casa || {})), elegida = null, guardar = null;
    const capa = el('div', { class: 'casa-capa' }, el('img', { src: 'assets/ilustraciones/casa-vacia.webp', alt: 'La casita del osito, vista desde arriba', draggable: 'false' }));
    const lienzo = el('div', { class: 'casa casa-arriba' }, capa);
    const bandeja = el('div', { class: 'bandeja' });
    const herramientas = el('div', { class: 'herramientas-calco', hidden: true },
      boton('−', 'Achicar', () => cambiar(c => { c.s = Math.max(.3, +(c.s / 1.15).toFixed(2)); })),
      boton('+', 'Agrandar', () => cambiar(c => { c.s = Math.min(3, +(c.s * 1.15).toFixed(2)); })),
      boton('⇆', 'Voltear', () => cambiar(c => { c.f = !c.f; })),
      boton('▲', 'Poner encima', () => cambiar(c => { c.z = maxZ() + 1; })),
      boton('▼', 'Poner debajo', () => cambiar(c => { Object.values(casa).forEach(o => { o.z++; }); c.z = 0; })),
      boton('↩', 'Guardar en la bandeja', () => { delete casa[elegida]; elegir(null); pintar(); guardarPronto(); }));
    function boton(ico, nombre, fn) { return el('button', { class: 'btn-icono', type: 'button', 'aria-label': nombre, title: nombre, text: ico, onclick: () => { S.toque(); fn(); } }); }
    const maxZ = () => Object.values(casa).reduce((m, c) => Math.max(m, c.z), 0);
    function cambiar(fn) { if (!elegida) return; fn(casa[elegida]); pintar(); guardarPronto(); }
    function elegir(id) { elegida = id; herramientas.hidden = !id; capa.querySelectorAll('.calco').forEach(b => b.classList.toggle('elegida', b.dataset.id === id)); }
    function estilo(id) {
      const c = casa[id];
      return 'left:' + c.x + '%;top:' + c.y + '%;width:' + (tamBase(id) * c.s) + '%;z-index:' + (c.z + 1) + ';transform:translate(-50%,-50%)' + (c.f ? ' scaleX(-1)' : '');
    }
    function pintar() {
      capa.querySelectorAll('.calco').forEach(b => b.remove());
      Object.keys(casa).sort((a, b) => casa[a].z - casa[b].z).forEach(id => {
        const b = el('button', { class: 'calco' + (id === elegida ? ' elegida' : ''), type: 'button', 'data-id': id, style: estilo(id), 'aria-label': nombreItem(id) }, arte(id));
        arrastrable(b, id);
        conTeclado(b, id);
        capa.append(b);
      });
      const libres = j.inventario.filter(id => !casa[id]);
      bandeja.replaceChildren(libres.length
        ? el('div', { class: 'bandeja-fila' }, libres.map(id => el('button', { class: 'calco-bandeja', type: 'button', 'aria-label': 'Pegar ' + nombreItem(id), onclick: () => pegar(id) }, el('span', { class: 'arte-mini' }, arte(id)))))
        : el('p', { class: 'mano', text: j.inventario.length ? '¡Pegaste todas tus calcomanías! 🧸' : 'Compra cosas en la tienda: llegan aquí como calcomanías 🧺' }));
    }
    function pegar(id) {
      S.pegar();
      const c = CUARTOS.find(x => x.id === cuartoVisto), t = estado.catalogo.tienda.find(x => x.id === id);
      const [px, py] = POS[t.lugar] || [50, 55];
      casa[id] = cuartoVisto === 'todo' ? { x: px, y: py, s: 1, z: maxZ() + 1, f: false } : { x: c.x, y: c.y, s: 1, z: maxZ() + 1, f: false };
      elegida = id; pintar(); elegir(id); guardarPronto();
    }
    /* arrastrar con el dedo o el mouse: la posición se calcula sobre la capa (que ya viene con el zoom del cuarto) */
    function arrastrable(b, id) {
      b.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (cuartoVisto === 'todo') { S.toque(); ver(cuartoDe(casa[id])); return; }   // de lejos son chicas: primero se acerca
        b.setPointerCapture(e.pointerId); elegir(id);
        const caja = capa.getBoundingClientRect(), c = casa[id];   // caja: la capa ya con el zoom del cuarto
        const dx = e.clientX - (caja.left + caja.width * c.x / 100), dy = e.clientY - (caja.top + caja.height * c.y / 100);
        let movio = false;
        const x0 = c.x, y0 = c.y, giro = c.f ? ' scaleX(-1)' : '';
        const mover = ev => {
          // mientras se arrastra solo cambia el transform (GPU); left/top se fijan al soltar
          movio = true;
          c.x = Math.max(0, Math.min(100, (ev.clientX - dx - caja.left) / caja.width * 100));
          c.y = Math.max(0, Math.min(100, (ev.clientY - dy - caja.top) / caja.height * 100));
          b.style.transform = 'translate(calc(-50% + ' + ((c.x - x0) / 100 * capa.offsetWidth) + 'px), calc(-50% + ' + ((c.y - y0) / 100 * capa.offsetHeight) + 'px))' + giro;
        };
        const soltar = () => {
          b.removeEventListener('pointermove', mover); b.removeEventListener('pointerup', soltar); b.removeEventListener('pointercancel', soltar);
          if (movio) { b.style.left = c.x + '%'; b.style.top = c.y + '%'; b.style.transform = 'translate(-50%,-50%)' + giro; S.pegar(); guardarPronto(); }
        };
        b.addEventListener('pointermove', mover); b.addEventListener('pointerup', soltar); b.addEventListener('pointercancel', soltar);
      });
    }
    /* con el teclado: al enfocar una calcomanía se elige; las flechas la mueven (Mayús: más lejos), + y − cambian
       el tamaño, Supr o Retroceso la devuelven a la bandeja */
    function conTeclado(b, id) {
      b.addEventListener('focus', () => { if (cuartoVisto !== 'todo') elegir(id); });
      b.addEventListener('keydown', e => {
        if (cuartoVisto === 'todo') { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ver(cuartoDe(casa[id])); } return; }
        const c = casa[id], paso = e.shiftKey ? 5 : 1;
        const mov = { ArrowLeft: [-paso, 0], ArrowRight: [paso, 0], ArrowUp: [0, -paso], ArrowDown: [0, paso] }[e.key];
        if (mov) { e.preventDefault(); c.x = Math.max(0, Math.min(100, c.x + mov[0])); c.y = Math.max(0, Math.min(100, c.y + mov[1])); b.style.left = c.x + '%'; b.style.top = c.y + '%'; guardarPronto(); return; }
        if (e.key === '+' || e.key === '=') { e.preventDefault(); c.s = Math.min(3, +(c.s * 1.15).toFixed(2)); b.setAttribute('style', estilo(id)); guardarPronto(); }
        else if (e.key === '-') { e.preventDefault(); c.s = Math.max(.3, +(c.s / 1.15).toFixed(2)); b.setAttribute('style', estilo(id)); guardarPronto(); }
        else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); delete casa[id]; elegir(null); pintar(); guardarPronto(); }
      });
    }
    function guardarPronto() {
      clearTimeout(guardar);
      guardar = setTimeout(async () => {
        try { const r = await Api.guardarCasa(casa); estado = r.estado; if (r.insignias && r.insignias.length) mostrarPremios(r.insignias); }
        catch (e) { aviso(e.message); }
      }, 700);
    }
    lienzo.addEventListener('pointerdown', e => { if (e.target === lienzo || e.target.tagName === 'IMG' && !e.target.closest('.calco')) elegir(null); });
    const pestanas = el('div', { class: 'pestanas cuartos', role: 'tablist' }, CUARTOS.map(c => el('button', {
      class: 'pestana', type: 'button', 'data-cuarto': c.id, 'aria-pressed': String(c.id === cuartoVisto), text: c.nombre, onclick: () => { S.toque(); ver(c.id); }
    })));
    function ver(id) {
      cuartoVisto = id;
      const cu = CUARTOS.find(x => x.id === id);
      capa.style.transform = encuadre(cu);
      capa.style.setProperty('--zoom', cu.zoom);   // el borde de la elegida no engorda con el zoom
      lienzo.dataset.cuarto = id;   // en «Toda la casa» las calcomanías tienen una zona de toque más grande
      pestanas.querySelectorAll('.pestana').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cuarto === id)));
    }
    p.replaceChildren(
      el('div', { class: 'cabecera' }, el('button', { class: 'btn-icono', type: 'button', 'aria-label': 'Volver', text: '←', onclick: () => camino() }), el('h1', { text: 'Mi casita' }), fichas().children[1]),
      lienzo, herramientas, pestanas,
      el('p', { class: 'mano pista-casa', text: j.inventario.length ? 'Toca una calcomanía y arrástrala ✨' : '' }),
      el('h2', { class: 'seccion-titulo', style: 'margin:8px 2px 6px', text: 'Mis calcomanías' }), bandeja,
      el('div', { class: 'casa-acciones' },
        puff('🧺 Tienda', 'rosa', () => tienda(cuartoVisto === 'todo' ? null : cuartoVisto)),
        puff('📸 Compartir', 'cielo', () => window.Compartir.casa(Object.assign({}, estado, { juego: Object.assign({}, estado.juego, { casa }) }), POS, EMOJI, IMAGENES, tamBase))));
    ir('casita');
    pintar(); ver(cuartoVisto);
  }
  const nombreItem = id => (estado.catalogo.tienda.find(t => t.id === id) || {}).nombre || id;
  /* ---------- Tienda ---------- */
  function tienda(filtro) {
    const p = $('#tienda'), j = estado.juego;
    let lugar = filtro || 'todo';   // 'todo' o un cuarto: sala, cocina, dorm, jardin
    const lista = el('div', { class: 'tienda' });
    const pintar = () => {
      lista.replaceChildren(...estado.catalogo.tienda.filter(t => lugar === 'todo' || t.lugar.startsWith(lugar + '-')).map(t => {
        const tengo = estado.juego.inventario.includes(t.id), alcanza = estado.juego.malvaviscos >= t.precio;
        return el('div', { class: 'articulo' }, el('div', { class: 'arte' }, arte(t.id)), el('h3', { text: t.nombre }),
          tengo ? el('span', { class: 'mano', style: 'font-size:1.3rem;color:var(--moss-deep)', text: 'Ya es tuya ✓' })
            : el('span', { class: 'precio', html: MALVAVISCO + t.precio }),
          tengo ? null : puff(alcanza ? 'Comprar' : 'Faltan ' + (t.precio - estado.juego.malvaviscos), alcanza ? 'ocre' : 'papel', () => comprar(t)));
      }));
    };
    const pestanas = el('div', { class: 'pestanas', role: 'tablist' }, CUARTOS.map(c => c.id).map(l => el('button', {
      class: 'pestana', type: 'button', 'aria-pressed': String(l === lugar), text: l === 'todo' ? 'Todo' : CUARTOS.find(c => c.id === l).nombre,
      onclick: e => { S.toque(); lugar = l; pestanas.querySelectorAll('.pestana').forEach(b => b.setAttribute('aria-pressed', String(b === e.currentTarget))); pintar(); }
    })));
    async function comprar(t) {
      if (estado.juego.malvaviscos < t.precio) { S.error(); aviso('Practica un poco más para juntar ' + (t.precio - estado.juego.malvaviscos) + ' malvaviscos 🍡'); return; }
      try {
        const r = await Api.comprar(t.id); estado = r.estado; S.caja();
        aviso('¡' + t.nombre + ' está en tu bandeja de calcomanías!');
        tienda(lugar);
        if (r.insignias.length) setTimeout(() => mostrarPremios(r.insignias), 600);
      } catch (e) { aviso(e.message); }
    }
    pintar();
    p.replaceChildren(
      el('div', { class: 'cabecera' }, el('button', { class: 'btn-icono', type: 'button', 'aria-label': 'Volver', text: '←', onclick: () => camino() }), el('h1', { text: 'Tienda del bosque' }), fichas().children[1]),
      pestanas, el('div', { class: 'lista-scroll' }, lista),
      el('div', { class: 'casa-acciones', style: 'grid-template-columns:1fr' }, puff('🏡 Ver mi casita', 'madera', () => casita())));
    if (document.querySelector('.pantalla.activa') !== p) ir('tienda');
  }

  /* ---------- Biblioteca (antes «Logros»): los libros de cada etapa, las medallas y los amigos del bosque ----------
     Pedido de la dueña (29-oct): los libros se van juntando en el estante según avanza el alumno, cada libro viene
     COMPLETO (para volver a cualquier lección si algo no entiende), cada hoja suena al pasar y de fondo suena un piano
     tranquilo, como en una biblioteca elegante. Los libros vienen del sistema con la clave del alumno (Api.libro). */
  const LOMOS = ['moss', 'ochre', 'rose', 'sky', 'wood', 'moss-deep', 'plum'];   // el 7: los modos griegos
  /* en el lomo, una sola palabra por libro (el nombre completo va en aria-label y al abrirlo) */
  const PALABRA_LIBRO = ['Pulso', 'Lectura', 'Ritmo', 'Acordes', 'Tonalidad', 'Expresión', 'Modos'];
  function logros() {
    const p = $('#logros'), j = estado.juego;
    const actual = estado.leccion ? estado.leccion.etapa : 1;
    const estante = el('div', { class: 'estante' }, (estado.biblioteca || []).map(b => {
      const lomo = el('button', { class: 'lomo lomo-' + LOMOS[b.etapa - 1] + (b.abierto ? '' : ' cerrado') + (b.etapa === actual ? ' actual' : ''), type: 'button',
        'aria-label': b.abierto ? 'Libro ' + b.etapa + ': ' + b.nombre : b.amazon ? 'Libro ' + b.etapa + ': ' + b.nombre + ', en Amazon' : 'Libro ' + b.etapa + ', se abre cuando llegues a la Etapa ' + b.etapa,
        onclick: () => b.abierto ? abrirLibro(b, lomo) : b.amazon ? club('libro') : (S.toque(), aviso('🔒 Se abre cuando llegues a la Etapa ' + b.etapa)) },
        el('span', { class: 'lomo-num', text: b.abierto ? String(b.etapa) : '🔒' }), el('span', { class: 'lomo-titulo', text: PALABRA_LIBRO[b.etapa - 1] || b.nombre }));
      return lomo;
    }));
    const numeros = el('div', { class: 'numeros' },
      el('div', { class: 'numero', html: '<b>' + j.mejor + '</b><span>mejor racha</span>' }),
      el('div', { class: 'numero', html: '<b>' + j.dias + '</b><span>días de práctica</span>' }),
      el('div', { class: 'numero', html: '<b>' + j.aciertos + '</b><span>aciertos</span>' }));
    const insignias = el('div', { class: 'insignias' }, estado.catalogo.insignias.map(i => {
      const tiene = j.insignias.includes(i.id);
      return el('button', { class: 'insignia' + (tiene ? '' : ' bloqueada'), type: 'button', onclick: () => { S.toque(); tiene ? window.Compartir.insignia(estado, i.id, i.nombre) : aviso('🔒 ' + i.nombre); } },
        el('div', { class: 'medalla' }, arte(i.id)), el('span', { text: i.nombre }));
    }));
    const amigos = el('div', { class: 'amigos' }, estado.catalogo.personajes.map(a => {
      const tiene = (j.personajes || []).includes(a.id);
      return el('div', { class: 'amigo' + (tiene ? '' : ' bloqueado') }, el('div', { class: 'retrato' }, el('img', { src: RETRATO(a.id), alt: '' })), el('span', { text: tiene ? a.nombre : a.dias + ' días' }));
    }));
    p.replaceChildren(
      el('div', { class: 'cabecera' }, el('button', { class: 'btn-icono', type: 'button', 'aria-label': 'Volver', text: '←', onclick: () => camino() }), el('h1', { text: 'Biblioteca' })),
      el('div', { class: 'lista-scroll' },
        el('h2', { class: 'seccion-titulo', text: 'Mis libros' }), estante,
        el('p', { class: 'mano pista-estante', text: estado.libre ? 'Los libros de la serie están en Amazon 📚' : 'Toca un libro para leerlo cuando quieras 📖' }),
        el('h2', { class: 'seccion-titulo', text: 'Medallas' }), numeros, insignias,
        el('h2', { class: 'seccion-titulo', text: 'Amigos del bosque' }), amigos));
    ir('logros');
  }

  /* el estilo del libro (LIBRO_CSS) se encierra en .libro-hoja para que no cambie el resto de la app */
  function estiloLibro(css) {
    if ($('#css-libro')) return;
    const encerrado = css.replace(/@font-face[^}]*}/g, '').replace(/([^{}]+)\{/g, (m, sel) =>
      sel.split(',').map(x => { x = x.trim(); return x === 'body' ? '.libro-hoja' : '.libro-hoja ' + x; }).join(', ') + ' {');
    document.head.append(el('style', { id: 'css-libro', text: encerrado }));
  }
  /* cada lección del libro tiene dos hojas (la explicación y la práctica): en la app son dos páginas, como en papel */
  function hojasDe(libro, terminado) {
    const hojas = [];
    const dueno = String(libro.alumno || '').replace(/[<>&"]/g, '');
    libro.paginas.forEach((pg, grupo) => {
      let html = pg.html;
      if (pg.id === 'portada' && dueno) html += '<p class="dueno">Este libro es de ' + dueno + '</p>';
      // si ya terminó la etapa, el certificado del final lleva su nombre
      if (pg.id === 'fin' && dueno && terminado) html = html.replace('<p>Nombre</p><div class="linea"></div>', '<p>Nombre</p><p class="dueno">' + dueno + '</p>');
      const partes = pg.semana ? html.split(/(?=<div class="hoja2">)/) : [html];
      partes.forEach((h, k) => hojas.push({ titulo: pg.titulo, grupo, segunda: k > 0, html: h, semana: pg.semana || 0 }));
    });
    return hojas;
  }
  /* Ejemplos que suenan (pedido de la dueña, 29-oct): debajo del dibujo de cada lección, botones 🔊 que tocan lo que
     muestra el dibujo (js/ejemplos.js); el dibujo brilla mientras suena */
  function ponerEjemplos(cont, h) {
    const lista = h.semana && !h.segunda ? window.Ejemplos.de(h.semana, estado.instrumento) : [];
    const dib = cont.querySelector('.diagrama');
    if (!lista.length || !dib) return;
    let fin = 0;
    const fila = el('div', { class: 'ejemplos-sonido' }, lista.map(([etiqueta, partitura]) => {
      const b = el('button', { type: 'button', class: 'ejemplo-sonido' }, el('span', { class: 'ico', 'aria-hidden': 'true', text: '🔊' }), el('span', { text: etiqueta }));
      b.addEventListener('click', () => {
        S.despertar();
        const seg = window.Ejemplos.tocar(partitura, S);
        fila.querySelectorAll('.sonando').forEach(x => x.classList.remove('sonando'));
        b.classList.add('sonando'); dib.classList.add('sonando');
        clearTimeout(fin); fin = setTimeout(() => { b.classList.remove('sonando'); dib.classList.remove('sonando'); }, seg * 1000);
      });
      return b;
    }));
    dib.after(el('p', { class: 'ejemplos-titulo', text: 'Escúchalo' }), fila);
  }
  async function abrirLibro(b, lomo) {
    S.toque();
    const p = $('#logros');
    const cerrar = el('button', { class: 'btn-icono', type: 'button', 'aria-label': 'Cerrar el libro', text: '✕' });
    const indiceBtn = el('button', { class: 'btn-icono', type: 'button', 'aria-label': 'Índice del libro', text: '☰' });
    const hoja = el('div', { class: 'libro-pagina', tabindex: '0' }, el('p', { class: 'cargando', text: 'Abriendo el libro…' }));
    const cuenta = el('span', { class: 'libro-cuenta', 'aria-live': 'polite' });
    const antes = puff('◀', 'papel libro-ant', () => pasar(-1)), despues = puff('▶', 'ocre libro-sig', () => pasar(1));
    antes.setAttribute('aria-label', 'Página anterior'); despues.setAttribute('aria-label', 'Página siguiente');
    antes.disabled = despues.disabled = true;
    const lector = el('div', { class: 'lector', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Libro ' + b.etapa + ': ' + b.nombre },
      el('div', { class: 'lector-barra' }, cerrar, el('h2', { text: 'Libro ' + b.etapa + ' · ' + b.nombre }), indiceBtn),
      hoja, el('div', { class: 'lector-pie' }, antes, cuenta, despues));
    p.append(lector);
    cerrar.focus();
    let hojas = [], i = 0, libro = null;
    const llave = 'bosque-libro-' + estado.instrumento + '-' + b.etapa;
    function salir() { document.removeEventListener('keydown', teclas); lector.remove(); S.callar(); S.pagina(); if (lomo) lomo.focus(); }
    cerrar.onclick = salir;
    function teclas(e) {
      if (!lector.isConnected) { document.removeEventListener('keydown', teclas); return; }
      const ind = lector.querySelector('.libro-indice');
      if (e.key === 'Escape') { e.preventDefault(); if (ind) { ind.remove(); indiceBtn.focus(); } else salir(); }
      else if (e.key === 'ArrowRight' && !ind) { e.preventDefault(); pasar(1, true); }
      else if (e.key === 'ArrowLeft' && !ind) { e.preventDefault(); pasar(-1, true); }
      else if (e.key === 'Tab') {   // el foco no se sale del libro
        const f = [...lector.querySelectorAll('button:not([disabled]), [tabindex="0"]')];
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    }
    document.addEventListener('keydown', teclas);
    try { libro = await window.Api.libro(b.etapa); }
    catch (e) { hoja.replaceChildren(el('p', { class: 'cargando', text: e.message })); return; }
    if (!lector.isConnected) return;
    estiloLibro(libro.css);
    hojas = hojasDe(libro, b.etapa < (estado.leccion ? estado.leccion.etapa : 1));
    try { i = Math.min(hojas.length - 1, Math.max(0, Number(localStorage.getItem(llave)) || 0)); } catch (e) { }
    const dato = k => 'data:image/webp;base64,' + libro.imgs[k].replace(/-/g, '+').replace(/_/g, '/');
    function mostrar(dir) {
      S.callar();   // el ejemplo de la hoja anterior no sigue sonando en la nueva
      const h = hojas[i];
      const cont = el('div', { class: 'libro-hoja' + (h.segunda ? ' segunda' : ''), html: h.html });
      cont.querySelectorAll('[data-img]').forEach(im => { if (libro.imgs[im.dataset.img]) im.src = dato(im.dataset.img); });
      cont.querySelectorAll('a').forEach(a => a.replaceWith(...a.childNodes));   // en el libro de la app no hay enlaces
      ponerEjemplos(cont, h);
      if (dir) cont.classList.add(dir > 0 ? 'entra-sig' : 'entra-ant');
      hoja.replaceChildren(cont);
      hoja.scrollTop = 0;
      if (dir) requestAnimationFrame(() => requestAnimationFrame(() => cont.classList.remove('entra-sig', 'entra-ant')));
      cuenta.textContent = (i + 1) + ' de ' + hojas.length;
      antes.disabled = i === 0; despues.disabled = i === hojas.length - 1;
      try { localStorage.setItem(llave, String(i)); } catch (e) { }
    }
    /* el giro de la hoja solo se anima al tocar o deslizar; con el teclado o pasando hojas seguidas (menos de 250 ms) la
       hoja aparece al instante: quien hojea quiere llegar, no ver girar cada página (revisión de animaciones, 29-oct) */
    let ultimaVuelta = 0;
    function pasar(d, porTeclado) {
      const n = i + d;
      if (!hojas.length || n < 0 || n >= hojas.length) return;
      const ahora = performance.now(), seguidas = ahora - ultimaVuelta < 250;
      ultimaVuelta = ahora;
      i = n; S.hojaLibro(); mostrar(porTeclado || seguidas ? 0 : d);
    }
    function irA(n) { if (n === i) return; const d = n > i ? 1 : -1; i = n; S.hojaLibro(); mostrar(d); }
    /* deslizar con el dedo pasa la hoja (si el movimiento es más de lado que hacia abajo) */
    let x0 = null, y0 = 0;
    hoja.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') { x0 = e.clientX; y0 = e.clientY; } });
    hoja.addEventListener('pointerup', e => {
      if (x0 === null) return;
      const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) pasar(dx < 0 ? 1 : -1);
    });
    hoja.addEventListener('pointercancel', () => { x0 = null; });
    indiceBtn.onclick = () => {
      S.toque();
      const viejo = lector.querySelector('.libro-indice'); if (viejo) { viejo.remove(); return; }
      const lista = el('ol', { class: 'libro-indice-lista' }, libro.paginas.map((pg, g) => {
        const n = hojas.findIndex(h => h.grupo === g);
        return el('li', {}, el('button', { type: 'button', class: hojas[i].grupo === g ? 'aqui' : '', text: pg.titulo, onclick: () => { indice.remove(); irA(n); despues.focus(); } }));
      }));
      const indice = el('div', { class: 'libro-indice' }, el('h3', { text: 'Índice' }), lista);
      lector.append(indice);
      (lista.querySelector('.aqui') || lista.querySelector('button')).focus();
    };
    mostrar(0);
  }

  window.addEventListener('pointerdown', () => S.despertar(), { once: true });
  entrada();
})();
