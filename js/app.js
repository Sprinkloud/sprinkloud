/* El bosque de Sprinkloud: pantallas (entrada, camino, práctica, fin, casita, tienda, biblioteca) y el estado del alumno. */
(function () {
  'use strict';
  const S = window.Sonido, A = window.Actividades, Api = window.Api;
  const { el, puff, espera } = A;
  const $ = s => document.querySelector(s);
  let estado = null, etapaVista = 1;

  /* ---------- Día y noche según la hora real ---------- */
  // Siempre de día (4-nov, pedido de la dueña): de noche la app quedaba casi negra y costaba jugar, practicar, ver la tienda y
  // la biblioteca. Los estilos de :root[data-hora="noche"] siguen en app.css por si algún día se vuelve a probar, pero no se usan.
  document.documentElement.dataset.hora = 'dia';

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
    'mapa-lago': '🏞️', 'lago-canoa': '🛶', 'lago-peces': '🐟', 'lago-nenufares-rana': '🐸', 'lago-patitos': '🦆', 'lago-cana-pescar': '🎣', 'lago-cesta-pesca': '🧺',
    'regalo-galletas': '🍪', 'regalo-cacao': '☕', 'regalo-pescado': '🐟',
    'amigo-osito': '🐻', 'amigo-conejo': '🐰', 'amigo-ardilla': '🐿️', 'amigo-zorro': '🦊', 'amigo-erizo': '🦔', 'amigo-raton': '🐭',
    primera: '🌱', racha3: '🔥', racha7: '🪵', racha14: '🌟', racha30: '👑', perfecta: '💯', aciertos100: '🎯', aciertos500: '🏆', dias10: '🍄', dias30: '🌳', compra: '🛍️', casa5: '🏡' };
  function arte(id) { return IMAGENES.has(id) ? el('img', { src: 'assets/arte/' + id + '.webp', alt: '' }) : document.createTextNode(EMOJI[id] || '✨'); }
  /* La casita es una casa de muñecas vista desde arriba (assets/ilustraciones/casa-vacia.webp, cuadrada).
     Cada lugar: [x, y, tamaño] en % de la imagen. Al elegir un cuarto, la cámara se acerca (CUARTOS: centro y zoom). */
  const LUGARES = { 'sala-pared': 'Pared de la sala', 'sala-sillon': 'Sillón', 'sala-alfombra': 'Alfombra', 'sala-musica': 'Rincón de música', 'sala-mesa': 'Comedor',
    'cocina-estufa': 'Estufa', 'cocina-ventana': 'Ventana', 'cocina-mesa': 'Mesita', 'cocina-repisa': 'Repisa',
    'dorm-cama': 'Cama', 'dorm-mesita': 'Mesita de noche', 'dorm-pared': 'Pared del cuarto',
    'jardin-banca': 'Para sentarse', 'jardin-flores': 'Huerto', 'jardin-fogata': 'Fogata' };
  const POS = { 'sala-pared': [19, 40, 8], 'sala-sillon': [30, 53, 13], 'sala-alfombra': [40, 57, 15], 'sala-musica': [35, 46, 11], 'sala-mesa': [44, 55, 12],
    'cocina-estufa': [71, 46, 10], 'cocina-ventana': [78, 42, 7], 'cocina-mesa': [67, 53, 9], 'cocina-repisa': [75, 44, 7],
    'dorm-cama': [55, 37, 11], 'dorm-mesita': [47, 35, 7], 'dorm-pared': [52, 28, 7],
    'jardin-banca': [63, 85, 10], 'jardin-flores': [19, 72, 11], 'jardin-fogata': [76, 80, 8] };
  const CUARTOS = [
    // más cerca desde el 4-nov (pedido de la dueña: la casa más grande para decorar mejor); antes 1, 2, 2,7 y 2,7
    { id: 'todo', nombre: 'Toda la casa', x: 51, y: 52, zoom: 1.3 },
    { id: 'sala', nombre: 'Sala', x: 38, y: 53, zoom: 2.4 },
    { id: 'cocina', nombre: 'Cocina', x: 71, y: 48, zoom: 3.1 },
    { id: 'dorm', nombre: 'Dormitorio', x: 53, y: 35, zoom: 3.1 },
    { id: 'jardin', nombre: 'Jardín', x: 48, y: 68, zoom: 1.6 }   // el huerto (x 19) y la fogata (x 76) tienen que verse a la vez
  ];
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
  /* pone los hijos en un elemento y descarta los que no van (null, false): sin esto, el navegador escribe «null» en la
     pantalla (lo vio la dueña el 30-oct en la entrada). Todas las pantallas se llenan con esta función. */
  const llenar = (nodo, ...hijos) => nodo.replaceChildren(...hijos.flat().filter(h => h != null && h !== false));
  /* Mientras carga (pedido de la dueña, 3-nov): el osito «carga» algo de la casita, con frases que cambian, para que no se
     sienta la espera. Si ya existe el dibujo del osito con la carretilla de flores (assets/arte/osito-carretilla.webp), va
     ese; si no, el osito con una cosita de la casita que cambia con cada frase. Con movimiento reducido, quieto. */
  const FRASES_ESPERA = ['Afinando el violín…', 'Juntando malvaviscos…', 'Avivando la fogata…', 'Barriendo la casita…',
    'Despertando a los amigos del bosque…', 'Buscando las partituras…', 'Casi listo, un compás más…'];
  function esperando(primera) {
    const arte = window.BOSQUE_ARTE || [], carretilla = true;   // ya está el dibujo del osito con la carretilla (3-nov): va siempre
    const cosas = arte.filter(id => !/^(aciertos|dias|racha|primera|perfecta|compra|casa5|osito)/.test(id));
    const cosa = carretilla || !cosas.length ? null : el('img', { class: 'espera-cosa', src: 'assets/arte/' + cosas[Math.floor(Math.random() * cosas.length)] + '.webp', alt: '' });
    const frase = el('p', { class: 'espera-frase', text: primera || FRASES_ESPERA[0] });
    const caja = el('div', { class: 'espera', role: 'status' },
      el('div', { class: 'espera-escena', 'aria-hidden': 'true' },
        el('img', { class: 'espera-osito' + (carretilla ? ' carretilla' : ''), src: 'assets/osito-cargando.webp', alt: '' }), cosa),
      frase);
    let i = 0;
    const reloj = setInterval(() => {
      if (!caja.isConnected) { clearInterval(reloj); return; }
      i = (i + 1) % FRASES_ESPERA.length;
      frase.textContent = FRASES_ESPERA[i];
      frase.classList.remove('cambia'); void frase.offsetWidth; frase.classList.add('cambia');
      if (cosa && cosas.length > 1) cosa.src = 'assets/arte/' + cosas[(cosas.indexOf(cosa.src.split('/').pop().replace('.webp', '')) + 1) % cosas.length] + '.webp';
    }, 1800);
    return caja;
  }
  function aviso(texto) {
    const a = $('#aviso'); a.textContent = texto || 'Algo no salió bien. Intenta otra vez.'; a.classList.add('ver');
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
      llenar(p, el('div', { class: 'portada' }, el('img', { src: 'assets/ilustraciones/osito-bosque.webp', alt: 'El osito en el bosque' })),
        el('h1', { html: 'El bosque<span>de Sprinkloud</span>' }),
        el('p', { text: 'Para entrar, abre el enlace que te mandó tu maestro por WhatsApp.' }));
      ir('entrada'); return;
    }
    /* 12-nov-2026 (la app tardaba muchísimo): el bosque se empieza a pedir apenas se abre la página, mientras el alumno
       mira la portada; al tocar «Entrar» casi siempre ya llegó. Si ese pedido falló, se vuelve a pedir. */
    let pedido = Api.cargar();
    pedido.catch(() => { });
    const boton = puff('🌲 Entrar al bosque', 'grande respira', async () => {
      S.despertar();
      boton.disabled = true; boton.querySelector('.cara').textContent = 'Abriendo el bosque…';
      const espera = esperando('Abriendo el bosque…'); boton.after(espera);
      try {
        try { estado = await pedido; } catch (e) { pedido = Api.cargar(); estado = await pedido; }
        etapaVista = estado.leccion ? estado.leccion.etapa : 6;
        estado.encuesta ? encuesta() : camino();
        // ex alumno o app vencida: al entrar, una vez, le cuenta que su avance sigue guardado y cómo volver a todo
        if (estado.libre && estado.libre.motivo && !estado.encuesta) setTimeout(() => club(), 900);
      }
      catch (e) { espera.remove(); boton.disabled = false; boton.querySelector('.cara').textContent = '🌲 Entrar al bosque'; aviso(e.message || 'No se pudo abrir. Revisa tu internet.'); }
    });
    llenar(p, el('div', { class: 'portada aparece' }, el('img', { src: 'assets/ilustraciones/osito-bosque.webp', alt: 'El osito en el bosque' })),
      el('h1', { class: 'aparece d1', html: 'El bosque<span>de Sprinkloud</span>' }),
      Api.libre ? el('p', { class: 'lema aparece d2', text: 'Aprende teoría musical jugando, unos minutos cada día' }) : null,
      el('div', { class: 'aparece d2', style: 'width:100%;display:grid;justify-items:center' }, boton),
      Api.libre && !Api.demo && window.BOSQUE_GOOGLE_ID ? el('button', { class: 'enlace-texto aparece d3', type: 'button', text: '¿Ya guardaste tu progreso? Entra con Google', onclick: () => { S.toque(); cuenta(true); } }) : null);
    ir('entrada');
  }

  /* ---------- La prueba de nivel (30-oct; más justa desde el 4-nov): al entrar la primera vez, y desde la biblioteca para
     subir de nivel (repetir). Las reglas están en js/encuesta.js: un toque equivocado no decide el nivel. ---------- */
  const PAUSA_ENCUESTA = 600;   // ms sin poder responder al aparecer cada pregunta: el toque de la anterior no cuenta aquí
  function encuesta(repetir) {
    const p = $('#practica'), E = window.Encuesta;
    const escenario = el('div', { class: 'escenario encuesta' });
    const respuestas = [];
    llenar(p, escenario);
    ir('practica');
    llenar(escenario,
      el('div', { class: 'retrato-encuesta' }, el('img', { src: RETRATO('osito'), alt: '' })),
      el('h1', { text: repetir ? '¿Listo para subir de nivel? 🎵' : 'Antes de empezar, una prueba cortita 🎵' }),
      el('p', { class: 'mano', text: repetir
        ? 'Contesta con calma. Si te va bien, subes de nivel; si no, sigues en tu lección y la puedes repetir en ' + ((estado.prueba && estado.prueba.dias) || 7) + ' días.'
        : 'Contesta lo que sepas. Si no sabes, toca «' + E.NO_SE + '». Un error no decide tu nivel: así empiezas en tu lección justa.' }),
      el('div', { class: 'acciones-encuesta' },
        puff(repetir ? 'Empezar' : 'Empezar la prueba', 'grande ocre', () => preguntar(0)),
        repetir ? puff('Ahora no', 'papel', () => logros()) : puff('Empezar desde la lección 1', 'papel', () => terminar(1))));
    function preguntar(i) {
      const q = E.PREGUNTAS[i];
      const puntos = el('div', { class: 'puntos-encuesta', 'aria-label': 'Pregunta ' + (i + 1) + ' de ' + E.PREGUNTAS.length }, E.PREGUNTAS.map((_, k) => el('i', { class: k < i ? 'hecho' : k === i ? 'ahora' : '' })));
      const dibujo = q.pentagrama ? el('div', { class: 'pentagrama-encuesta' }) : null;
      const escuchar = q.sonido ? puff('🔊 Escuchar', 'cielo', () => { S.despertar(); S.callar(); S.nota(q.sonido[0], .7); S.luego(800, () => S.nota(q.sonido[1], .7)); }) : null;
      const listaDesde = Date.now() + PAUSA_ENCUESTA;
      let hecha = false;
      const responder = op => {
        if (hecha || Date.now() < listaDesde) return;   // un toque doble o muy rápido no responde por error
        hecha = true;
        S.callar();
        const bien = op === q.correcta;
        if (bien) S.acierto(); else if (op !== E.NO_SE) S.error();
        respuestas.push({ etapa: q.etapa, bien });
        const r = E.evaluar(respuestas);
        if (r.sigue) setTimeout(() => preguntar(i + 1), 250);
        else terminar(E.semanaDe(r.etapa), r);
      };
      const opciones = el('div', { class: 'respuestas-encuesta espera' }, E.mezclar(q.opciones).map(op => puff(op, 'papel', () => responder(op))));
      llenar(escenario, puntos, el('h2', { class: 'pregunta-encuesta', text: q.texto }), dibujo, escuchar, opciones,
        el('button', { class: 'enlace-texto', type: 'button', text: E.NO_SE, onclick: () => responder(E.NO_SE) }));
      setTimeout(() => opciones.classList.remove('espera'), PAUSA_ENCUESTA);
      if (dibujo) E.pentagrama(dibujo, q.pentagrama);
      if (q.sonido) setTimeout(() => escuchar.click(), 350);
    }
    async function terminar(semana, resultado) {
      llenar(escenario, esperando('Buscando tu lección…'));
      try {
        const r = await Api.nivel(semana);
        estado = r.estado; etapaVista = estado.leccion ? estado.leccion.etapa : 1;
        const l = estado.leccion, subio = !r.repetida || r.subio;
        const cuenta = resultado ? 'Contestaste bien ' + resultado.bien + ' de ' + resultado.total + '. ' : '';
        llenar(escenario,
          el('div', { class: 'retrato-encuesta' }, el('img', { src: RETRATO('osito'), alt: '' })),
          el('h1', { text: !r.repetida ? '¡Listo! 🎉' : subio ? '¡Subiste de nivel! 🎉' : '¡Buen intento! 🌱' }),
          el('p', { class: 'mano', text: cuenta + (!r.repetida ? 'Empiezas en la ' + l.nivel + ': ' + l.tema + '.'
            : subio ? 'Ahora vas en la ' + l.nivel + ': ' + l.tema + '.'
            : 'Sigues en la ' + l.nivel + ': ' + l.tema + '. Practica un poco más y vuelve a intentarlo en ' + ((estado.prueba && estado.prueba.dias) || 7) + ' días.') }),
          el('div', { class: 'acciones-encuesta' }, puff('🌲 Ir al bosque', 'grande', () => camino())));
        if (subio) S.festejo();
      } catch (e) {
        aviso(e.message || 'No se pudo guardar. Revisa tu internet.');
        llenar(escenario, el('div', { class: 'acciones-encuesta' }, puff('Intentar otra vez', 'ocre', () => terminar(semana, resultado)),
          repetir ? puff('Volver a la biblioteca', 'papel', () => logros()) : null));
      }
    }
  }

  /* ---------- Reportar un error o un reclamo (30-oct): llega a la hoja «Reportes» del sistema ---------- */
  const TIPOS_REPORTE = ['Error en un ejercicio', 'La app no funciona', 'Reclamo', 'Idea'];
  function reportar(contexto) {
    contexto = contexto || {};
    let tipo = contexto.actividad ? TIPOS_REPORTE[0] : '', cerrar;
    const chips = el('div', { class: 'pestanas tipos-reporte', role: 'group', 'aria-label': 'Qué pasó' }, TIPOS_REPORTE.map(t => el('button', {
      class: 'pestana', type: 'button', 'aria-pressed': String(t === tipo), text: t,
      onclick: e => { S.toque(); tipo = t; chips.querySelectorAll('.pestana').forEach(b => b.setAttribute('aria-pressed', String(b === e.currentTarget))); }
    })));
    const texto = el('textarea', { class: 'reporte-texto', rows: '4', maxlength: '1000', 'aria-label': 'Cuéntanos qué pasó', placeholder: 'Cuéntanos qué pasó o qué te gustaría…' });
    const enviar = puff('Enviar', 'ocre', async () => {
      if (!tipo) { aviso('Elige qué pasó 👆'); return; }
      if (texto.value.trim().length < 3) { aviso('Cuéntanos un poquito qué pasó ✏️'); texto.focus(); return; }
      enviar.disabled = true;
      try {
        const l = estado && estado.leccion;
        await Api.reporte({ tipo, mensaje: texto.value, contexto: { leccion: l ? l.nivel : '', actividad: contexto.actividad || '', pantalla: contexto.pantalla || '', dispositivo: navigator.userAgent } });
        cerrar(); aviso('¡Gracias! Ya nos llegó tu mensaje 💛');
      } catch (e) { enviar.disabled = false; aviso(e.message || 'No se pudo enviar. Revisa tu internet.'); }
    });
    cerrar = cajon(el('div', { class: 'premio club reporte' },
      el('h2', { text: 'Cuéntanos qué pasó 💬' }),
      el('p', { text: 'Lo leemos para mejorar la app.' }),
      chips, texto,
      el('div', { class: 'acciones' }, enviar, puff('Cancelar', 'papel', () => cerrar()))));
  }

  /* ---------- El camino ---------- */
  function camino() {
    const p = $('#camino'), l = estado.leccion, j = estado.juego;
    precargarAlbum();
    const lb = estado.libre, sinEnergia = j.energia && !j.energia.queda;
    const saludo = !l ? '¡Terminaste toda la guía! 🎉'
      : lb && lb.completa ? '¡Terminaste la versión libre! 🎉 Sigue con un plan del club'
      : sinEnergia ? '¡Se acabó tu energía de hoy! Vuelve mañana ⚡'
      : j.hoy.terminada ? ((lb && lb.paso) || (estado.avance && estado.avance.paso) ? '¡Pasaste la lección! Mañana se abre la siguiente 🌙' : '¡Ya practicaste hoy! Vuelve mañana 🌙')
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
    const reporte = el('button', { class: 'enlace-texto reportar', type: 'button', text: '💬 Reportar un error o reclamo', onclick: () => { S.toque(); reportar({ pantalla: 'camino' }); } });
    llenar(p, fichas(), heroe, zona, mapa, nav, reporte);
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
    const reporte = el('button', { class: 'enlace-texto reportar', type: 'button', text: '💬 ¿Algo está mal en este ejercicio?', onclick: () => { S.toque(); reportar({ actividad: actual, pantalla: 'practica' }); } });
    llenar(p, el('div', { class: 'practica-arriba' }, cerrar, pasos, rayo, el('span', { class: 'ficha', html: MALVAVISCO + '<span class="num" id="ganados">+0</span>' })), escenario, reporte);
    ir('practica');
    let cancelado = false, ganados = 0, ultimo = null, vivoA = 0, vivoI = 0, actual = null;
    let cola = Promise.resolve();   // las actividades que se están guardando, en orden (12-nov-2026)
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
        const datos = { tipo: lista[i].tipo, aciertos: r.aciertos, intentos: r.intentos };
        if (en) {   // con energía (versión libre), cada actividad decide si se puede seguir: se espera la respuesta
          try {
            ultimo = await Api.practica(datos, ultima && !extra);
            ganados += ultimo.ganados; estado = ultimo.estado; vivoA = vivoI = 0;
            pintarRayo();
            $('#ganados').textContent = '+' + ganados; if (ultimo.ganados) S.moneda(Math.ceil(ultimo.ganados / 4));
          } catch (e) { if (e.sinEnergia) { vivoA = vivoI = 0; agotada(); return; } aviso(e.message || 'No se pudo guardar. Revisa tu internet.'); }
          if (!estado.juego.energia.queda && !ultima) { agotada(); return; }
        } else {
          /* 12-nov-2026 (la app tardaba muchísimo): la actividad se guarda por detrás, en orden, y el alumno pasa enseguida a
             la siguiente. Los malvaviscos se suman cuando llega la respuesta (sin sonido: puede estar en un ejercicio de oído). */
          vivoA = vivoI = 0;
          cola = cola.then(() => Api.practica(datos, ultima && !extra)).then(x => {
            ultimo = x; ganados += x.ganados; estado = x.estado;
            const g = $('#ganados'); if (g) g.textContent = '+' + ganados;
          }).catch(e => { aviso(e.message || 'No se pudo guardar. Revisa tu internet.'); });
        }
      }
      mem.hechas = i + 1; recordar(mem);
      escenario.classList.remove('ejemplo');
    }
    soltar();
    /* lo que quedó guardándose por detrás termina aquí: el osito empuja su carretilla mientras tanto */
    escenario.replaceChildren(esperando('Avivando la fogata…'));
    await cola;
    if (cancelado) return;
    if (!ultimo || !ultimo.fogata) {   // si la última se saltó, la práctica igual se cierra para prender la fogata
      try { if (!extra && !estado.juego.hoy.terminada) { ultimo = await Api.practica({ tipo: 'repaso', aciertos: 0, intentos: 1, cierre: true }, true); estado = ultimo.estado; ganados += ultimo.ganados; } } catch (e) { }
    }
    fin(ultimo, ganados, extra);
  }

  /* ---------- ¡Terminaste tu práctica de hoy! ---------- */
  function fin(r, ganados, extra) {
    const p = $('#fin'), j = estado.juego;
    llenar(p,
      el('div', { class: 'fogata-grande aparece', html: fogata(j.fogata) }),
      el('h1', { class: 'aparece d1', text: extra ? '¡Practicaste más!' : '¡Terminaste tu práctica de hoy!' }),
      el('div', { class: 'ganado aparece d2', html: MALVAVISCO + '+' + ganados }),
      j.racha ? el('div', { class: 'racha-txt aparece d3', text: '🔥 ' + j.racha + (j.racha === 1 ? ' día' : ' días seguidos') + (j.lena ? ' · 🪵 ' + j.lena : '') }) : null,
      avanceTxt(r && r.avance),
      el('div', { class: 'acciones aparece d4' },
        puff('📸 Compartir mi logro', 'rosa', () => window.Compartir.dia(estado, ganados)),
        r && r.avance && r.avance.paso && r.avance.ultima ? puff('⭐ Seguir con el club', 'ocre', () => club('completa')) : null,
        !extra && sinCuenta() ? puff('🔐 Guardar mi progreso', 'madera', () => cuenta()) : null,
        puff('🌲 Volver al bosque', 'grande', () => camino())));
    ir('fin');
    S.festejo(); setTimeout(() => S.fuego(), 500);
    confeti();
    const premios = [].concat((r && r.insignias) || [], r && r.personaje ? ['amigo:' + r.personaje] : []);
    if (premios.length) setTimeout(() => mostrarPremios(premios), 2200);
  }
  /* cómo le fue para pasar a la lección siguiente (80 %): alumnos del club, en 2 días; versión libre, en 1 */
  function avanceTxt(a) {
    if (!a) return null;
    if (a.dias != null) {
      const t = a.paso ? '⭐ ¡' + a.pct + ' %! Lección lograda: mañana empiezas la siguiente.'
        : a.pct >= 80 ? '⭐ ¡' + a.pct + ' %! Llevas ' + a.dias + ' de ' + a.necesita + ' días con 80 %. ¡Un día más y pasas!'
        : '💪 ' + a.pct + ' % de aciertos. Para pasar de lección necesitas 80 % en ' + a.necesita + ' días. ¡Mañana otra vez!';
      return el('p', { class: 'avance-txt aparece d3' + (a.pct >= 80 ? ' bien' : ''), text: t });
    }
    const texto = a.paso && a.ultima ? '🎉 ¡Completaste la etapa 3 con ' + a.pct + ' %! Terminaste la versión libre.'
      : a.paso ? '⭐ ¡' + a.pct + ' % de aciertos! Mañana se abre la lección siguiente.'
      : '💪 ' + a.pct + ' % de aciertos. Con 80 % pasas a la lección siguiente: ¡mañana otra vez!';
    return el('p', { class: 'avance-txt aparece d3' + (a.paso ? ' bien' : ''), text: texto });
  }

  /* ---------- El club (versión libre): planes con acceso total y clases en vivo, y los libros en Amazon ---------- */
  const MOTIVOS = {
    energia: ['¡Se acabó tu energía de hoy! ⚡', 'Mañana se recarga. ¿Quieres practicar sin límites?'],
    leccion: ['Esta lección es del plan completo 🔒', 'La versión libre llega hasta la etapa 3.'],
    libro: ['Este libro está en Amazon 📚', 'Cada libro trae sus lecciones con dibujos, ejemplos y prácticas.'],
    completa: ['¡Terminaste la versión libre! 🎉', 'Llegaste al final de la etapa 3. ¡Qué gran músico!'],
    /* el enlace de un alumno inactivo o de una app vencida abre la versión de prueba, con su avance guardado (30-oct) */
    exalumno: ['¡Te extrañamos en el club! 🌲', 'Tu avance sigue guardado. Vuelve al club para seguir con todo.'],
    vencida: ['Tu app venció ⏳', 'Tu avance sigue guardado. Renuévala para seguir con las 60 lecciones y tus libros.']
  };
  function club(motivo) {
    const origen = estado && estado.libre && estado.libre.motivo;   // ex alumno o app vencida
    const [titulo, sub] = MOTIVOS[motivo || origen] || ['Club musical Sprinkloud ⭐', 'Aprende música con tu maestra, tu app y tus libros.'];
    const pedir = origen === 'vencida' ? ['🌲 Renovar mi app', window.BOSQUE_CLUB.renovar] : origen === 'exalumno' ? ['💬 Volver al club', window.BOSQUE_CLUB.volver] : ['💬 Quiero un plan', window.BOSQUE_CLUB.planes];
    const abrir = url => { S.toque(); window.open(url, '_blank', 'noopener'); };
    let cerrar;
    const contenido = el('div', { class: 'premio club' },
      el('div', { class: 'retrato' }, el('img', { src: RETRATO('osito'), alt: '' })),
      el('h2', { text: titulo }), el('p', { text: sub }),
      el('p', { class: 'club-dice', html: 'Con un plan del <b>Club musical Sprinkloud</b> tienes:' }),
      el('ul', { class: 'club-lista' },
        el('li', { text: '🌲 Las 60 lecciones del bosque y energía sin límite' }),
        el('li', { text: '📚 Los 7 libros dentro de la app' }),
        el('li', { text: '🎹 Clases de música en vivo con tu maestra' }),
        el('li', { text: '📱 O solo la app completa: 4,99 USD al mes o 39,99 USD al año' })),
      el('div', { class: 'acciones' },
        puff(pedir[0], 'ocre', () => abrir(pedir[1])),
        puff('📚 Libros en Amazon', 'cielo', () => abrir(window.BOSQUE_CLUB.amazon)),
        sinCuenta() ? puff('🔐 Guardar mi progreso', 'madera', () => { cerrar(); setTimeout(cuenta, 420); }) : null,
        puff('Ahora no', 'papel', () => cerrar())));
    cerrar = cajon(contenido);
  }

  /* ---------- «Guardar mi progreso con Google» (versión libre, 30-oct) ----------
     El botón lo dibuja Google (Google Identity Services, se carga solo al abrir este cajón). Al entrar, la app se recarga
     con la clave del bosque de esa persona (Api.entrarGoogle). */
  const sinCuenta = () => !!(estado && estado.cuenta === false && window.BOSQUE_GOOGLE_ID);   // alumnos y versión libre (30-oct)
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
          llenar(lugar, el('p', { class: 'cargando', text: 'Guardando tu progreso…' }));
          try { await Api.entrarGoogle(resp.credential); }
          catch (e) { llenar(lugar, el('p', { class: 'cargando', text: e.message || 'No se pudo entrar con Google. Intenta otra vez.' })); }
        }
      });
      lugar.replaceChildren();
      google.accounts.id.renderButton(lugar, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', locale: 'es', width: Math.min(300, lugar.clientWidth || 280) });
    }).catch(e => llenar(lugar, el('p', { class: 'cargando', text: e.message })));
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
      el('p', { text: amigo ? '¡Ya está en tus calcomanías!' : nombre }),
      el('div', { class: 'acciones' },
        puff('📸 Compartir', 'rosa', () => amigo ? window.Compartir.amigo(estado, amigo, nombre) : window.Compartir.insignia(estado, x, nombre)),
        puff('¡Genial!', 'ocre', () => { cerrar(); setTimeout(() => mostrarPremios(resto), 450); })));
    cerrar = cajon(contenido);
  }

  /* ---------- Mi casita: un lienzo de calcomanías (idea de la dueña) ----------
     Cada compra queda en la bandeja; al tocarla se pega en el cuarto que se está viendo y se arrastra donde uno quiera.
     La que se pega o se sube después queda encima (z). Tocar una pegada la elige: agrandar, achicar, voltear, subir, bajar o guardarla. */
  /* ---------- El álbum (16-nov-2026, idea de la dueña): la casita y los mapas son páginas donde se pegan calcomanías ----------
     Cada calcomanía pegada dice en qué página está (`e`: el mapa; sin `e`, la casita). Los amigos que están de visita son
     calcomanías («amigo-<id>») y los mapas se compran en la tienda. */
  const NOMBRE_REGALO = { galletas: 'Galletas', cacao: 'Cacao', pescado: 'Pescado' };
  const ACCION_ICO = { hornear: '🍪', servir: '☕', cancion: '🎵', melodia: '🎶', cucu: '🐦', dormir: '💤', mecer: '🍃', pulso: '🎼', luz: '💡',
    navegar: '🌊', nadar: '💦', saltar: '💦', croar: '🐸', pescar: '🎣' };
  const itemDe = id => estado.catalogo.tienda.find(t => t.id === id);
  const mejorada = id => (estado.juego.mejoras || []).includes(id);
  const paginas = () => [{ id: 'casa', nombre: 'Mi casita', img: 'assets/ilustraciones/casa-vacia.webp', mini: 'assets/ilustraciones/casa-vacia-mini.webp', tengo: true }]
    .concat(estado.catalogo.tienda.filter(t => t.tipo === 'mapa').map(t => ({ id: t.mapa, nombre: t.nombre, img: 'assets/ilustraciones/escenario-' + t.mapa + '.webp',
      mini: 'assets/ilustraciones/escenario-' + t.mapa + '-mini.webp', item: t, tengo: estado.juego.inventario.includes(t.id) })));
  let paginaVista = 'casa';
  const luces = new Set();   // lámparas encendidas (mientras la app está abierta)
  /* el ancho de cada calcomanía en % de la página. Los amigos guardan su tamaño entre ellos (BOSQUE_AMIGOS, del osito al
     ratón); en un mapa todo se ve un poco más grande que en la casita, que se mira de cerca cuarto por cuarto */
  const AMIGO_ANCHO = { casa: 13, mapa: 19 };
  function tamBase(id, pagina) {
    const enMapa = !!pagina && pagina !== 'casa';
    if (id.startsWith('amigo-')) return AMIGO_ANCHO[enMapa ? 'mapa' : 'casa'] * ((window.BOSQUE_AMIGOS || {})[id.slice(6)] || .7);
    const t = itemDe(id) || {};
    if (t.tam) return enMapa ? t.tam : t.tam * .7;
    return (POS[t.lugar] || [0, 0, 9])[2] * 1.35 * (enMapa ? 1.25 : 1);
  }

  /* ---------- Los stickers mejorados hacen algo (movimiento con la API de animaciones del navegador: solo transform y opacity) ---------- */
  const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)', EASE_IN_OUT = 'cubic-bezier(0.77, 0, 0.175, 1)';   // las mismas curvas de app.css
  const quieto = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SUBE = 'cubic-bezier(0.5, 1, 0.89, 1)', CAE = 'cubic-bezier(0.11, 0, 0.5, 0)';   // lo que salta: frena al subir y acelera igual al caer (easings.net, «Quad»)
  const cuadros = (curva, ...t) => t.map(x => ({ transform: x, easing: curva }));
  /* un péndulo: del centro a un extremo, después de extremo a extremo (pasa por el centro a su mayor velocidad, sin
     detenerse ahí) y de vuelta al centro. Con 4 extremos en 2 s cruza el centro en 0,5, 1 y 1,5 s: los clics del metrónomo */
  const pendulo = (grados, extremos) => [{ transform: 'rotate(0)', easing: SUBE, offset: 0 }]
    .concat(Array.from({ length: extremos }, (_, i) => ({ transform: 'rotate(' + (i % 2 ? grados : -grados) + 'deg)', easing: EASE_IN_OUT, offset: (i + .5) / extremos })),
      [{ transform: 'rotate(0)', offset: 1 }]);
  /* el reloj se sacude con cada «cu-cú» (en 0 y en 0,7 s) y espera quieto entre los dos */
  const CUCU = [[0, 0], [.083, -5], [.167, 5], [.25, -3], [.333, 0], [.667, 0], [.75, -5], [.833, 5], [.917, -3], [1, 0]]
    .map(([offset, g]) => ({ transform: 'rotate(' + g + 'deg)', easing: EASE_OUT, offset }));
  /* cada acción: [cuadros, opciones, origen del giro, chispitas, cada cuánto sale una chispita (ms)] */
  const MOVIMIENTOS = {
    cancion: d => [cuadros(EASE_IN_OUT, 'translateY(0) rotate(0)', 'translateY(-5%) rotate(-2deg)', 'translateY(0) rotate(0)', 'translateY(-5%) rotate(2deg)', 'translateY(0) rotate(0)'), { duration: 1200, iterations: Math.max(1, Math.round(d / 1.2)) }, '50% 100%', ['♪', '♫', '♪', '♫', '♪'], 420],
    melodia: d => [pendulo(3, Math.max(2, Math.round(d / .68))), { duration: Math.round(d * 1000) }, '50% 100%', ['♪', '♫', '♪', '♫'], 520],
    cucu: () => [CUCU, { duration: 1050 }, '50% 0', ['🐦', '🐦'], 700],
    dormir: () => [cuadros(EASE_IN_OUT, 'scale(1)', 'scale(1.04)', 'scale(1)'), { duration: 1300, iterations: 2 }, '50% 100%', ['z', 'z', 'Z'], 600],
    mecer: () => [cuadros(EASE_IN_OUT, 'rotate(0)', 'rotate(7deg)', 'rotate(-7deg)', 'rotate(5deg)', 'rotate(-5deg)', 'rotate(0)'), { duration: 1800 }, '50% 0', ['🍃'], 0],
    pulso: () => [pendulo(8, 4), { duration: 2000 }, '50% 100%', [], 0],
    navegar: () => [cuadros(EASE_IN_OUT, 'translateX(0) rotate(0)', 'translateX(45%) rotate(-2deg)', 'translateX(0) rotate(0)'), { duration: 2400 }, '50% 50%', ['💧', '💧'], 900],
    nadar: () => [cuadros(EASE_IN_OUT, 'translateX(0) rotate(0)', 'translateX(18%) rotate(3deg)', 'translateX(35%) rotate(-3deg)', 'translateX(18%) rotate(3deg)', 'translateX(0) rotate(0)'), { duration: 1800 }, '50% 50%', ['💧'], 0],
    /* el pez sube frenando y cae acelerando, como cualquier cosa que salta: la única caída con una curva que acelera */
    saltar: () => [[{ transform: 'translateY(0) rotate(0)', easing: SUBE }, { transform: 'translateY(-40%) rotate(-12deg)', easing: CAE }, { transform: 'translateY(0) rotate(0)' }], { duration: 750, iterations: 2 }, '50% 50%', ['💧', '💧'], 750],
    croar: () => [cuadros(EASE_OUT, 'scale(1, 1)', 'scale(1.1, .86)', 'translateY(-14%) scale(.96, 1.06)', 'scale(1.06, .94)', 'scale(1, 1)'), { duration: 500, iterations: 2 }, '50% 100%', [], 0],
    hornear: () => [cuadros(EASE_IN_OUT, 'rotate(0)', 'rotate(-2deg)', 'rotate(2deg)', 'rotate(-2deg)', 'rotate(0)'), { duration: 900 }, '50% 100%', ['💨', '💨'], 350],
    servir: () => [cuadros(EASE_IN_OUT, 'rotate(0)', 'rotate(-2deg)', 'rotate(2deg)', 'rotate(0)'), { duration: 700 }, '50% 100%', ['💨'], 0],
    pescar: () => [cuadros(EASE_OUT, 'rotate(0)', 'rotate(-14deg)', 'rotate(6deg)', 'rotate(0)'), { duration: 900 }, '50% 100%', ['💧'], 500],
    regalo: () => [cuadros(EASE_OUT, 'translateY(0)', 'translateY(-12%)', 'translateY(0)', 'translateY(-7%)', 'translateY(0)'), { duration: 700 }, '50% 100%', ['💛', '💛', '💛'], 160]
  };
  /* una chispita (una nota, una gota, un corazón, o el dibujo de un regalo) que sale de arriba de la calcomanía y sube */
  function chispa(capa, b, contenido, espera, lado) {
    const s = el('span', { class: 'chispa', 'aria-hidden': 'true', style: 'left:' + b.style.left + ';top:calc(' + b.style.top + ' - ' + (parseFloat(b.style.width) * .38) + '%)' }, contenido);
    capa.append(s);
    const dx = (lado || 0) * .9, op = { duration: 1300, delay: espera || 0, fill: 'both' };
    /* dos animaciones: sube frenando (transform) y se ve casi todo el viaje (opacity); con una sola curva se borraba enseguida */
    if (!quieto()) s.animate([{ transform: 'translate(-50%, -50%) scale(.9)' }, { transform: 'translate(calc(-50% + ' + dx + 'em), -260%) scale(1)' }], Object.assign({ easing: EASE_OUT }, op));
    else s.style.transform = 'translate(-50%, -100%)';
    s.animate([{ opacity: 0 }, { opacity: 1, offset: .12 }, { opacity: 1, offset: .6 }, { opacity: 0 }], op).onfinish = () => s.remove();
    return s;
  }
  function jugar(capa, b, accion) {
    const m = MOVIMIENTOS[accion], dibujo = b.querySelector('.calco-arte');
    if (!m || !dibujo) return false;
    /* si ya está actuando, otro toque no lo reinicia: una animación que vuelve a empezar hace saltar el dibujo a su
       lugar (la canoa a mitad de viaje). Termina lo suyo y recién entonces puede actuar otra vez */
    if (dibujo.getAnimations().some(a => a.id === 'accion' && a.playState === 'running')) return false;
    S.callar();
    dibujo.getAnimations().forEach(a => a.cancel());   // un saludo a medias sí se corta
    const dur = S.juguete(accion);
    if (dur > 1.5 && S.pref.musica && S.musica && S.musica.silenciar) S.musica.silenciar(dur * 1000);   // la canción de la casita se calla mientras suena
    const [marcos, op, origen, chispitas, cada] = m(dur || 1.6);
    dibujo.style.transformOrigin = origen;
    const a = quieto() ? dibujo.animate([{ opacity: 1 }, { opacity: .6 }, { opacity: 1 }], { duration: 400, easing: 'ease' })   // sin moverse: solo parpadea
      : dibujo.animate(marcos, op);
    a.id = 'accion';
    chispitas.forEach((c, i) => chispa(capa, b, c, i * cada, i % 2 ? 1 : -1));
    return true;
  }

  /* ---------- Sin esperas (16-nov-2026, la dueña: «la carga y el tiempo de espera tienen que estar nulos o mínimos») ----------
     Cada pedido al servidor tarda de 2 a 3 segundos (Google). Por eso comprar, mejorar, preparar un regalo, darlo y
     guardar el álbum se ven AL INSTANTE: la app aplica el cambio con las mismas reglas del servidor y lo manda por
     detrás, en orden. Cuando llega la última respuesta, el estado del servidor reemplaza al de la app. Si el servidor
     rechaza algo, se avisa, se vuelve a pedir el estado y se repinta la pantalla. */
  let colaJuego = Promise.resolve(), pendientes = 0, filtroTienda = null;
  function porDetras(cambio, pedido, alLlegar) {
    cambio(estado.juego);
    pendientes++;
    colaJuego = colaJuego.then(pedido).then(r => {
      pendientes--;
      if (!pendientes && r && r.estado) estado = r.estado;   // ya no queda nada en camino: manda el servidor
      if (alLlegar) alLlegar(r);
    }, async e => {
      pendientes--;
      aviso(e.message);
      try { estado = await Api.cargar(); } catch (x) { return; }
      const activa = document.querySelector('.pantalla.activa');
      if (activa && activa.id === 'casita') casita(); else if (activa && activa.id === 'tienda') tienda(filtroTienda);
    });
  }
  /* los dibujos del álbum se bajan apenas entra, mientras mira el camino: al abrir la casita o un mapa ya están */
  let precargado = false;
  function precargarAlbum() {
    if (precargado || !estado) return; precargado = true;
    const pedir = () => {
      const jg = estado.juego;
      paginas().filter(pg => pg.tengo).map(pg => pg.img)
        .concat(jg.inventario.filter(id => !id.startsWith('mapa-')).concat((jg.personajes || []).map(a => 'amigo-' + a)).filter(id => IMAGENES.has(id)).map(id => 'assets/arte/' + id + '.webp'))
        .forEach(src => { new Image().src = src; });
    };
    (window.requestIdleCallback || (f => setTimeout(f, 1200)))(pedir);
  }

  /* mejorar un sticker: se ve qué va a hacer (su dibujito) y cuánto cuesta; sin frases */
  function ofrecerMejora(t, listo) {
    const m = t.mejora, falta = m.precio - estado.juego.malvaviscos;
    let cerrar, ocupado = false;
    cerrar = cajon(el('div', { class: 'premio mejora' },
      el('div', { class: 'mejora-arte' }, arte(t.id), el('span', { class: 'sello', 'aria-hidden': 'true', text: ACCION_ICO[m.accion] || '⭐' })),
      el('h2', { text: t.nombre }),
      el('span', { class: 'precio', html: MALVAVISCO + m.precio }),
      el('div', { class: 'acciones', style: 'grid-template-columns:1fr' },
        puff(falta > 0 ? 'Faltan ' + falta : '⭐ Mejorar', falta > 0 ? 'plomo' : 'ocre', () => {
          if (falta > 0) { S.error(); return; }
          if (ocupado || mejorada(t.id)) return; ocupado = true;
          porDetras(j => { j.malvaviscos -= m.precio; j.mejoras = (j.mejoras || []).concat([t.id]); }, () => Api.mejorar(t.id));
          S.caja(); cerrar(); listo && listo();
        }))));
  }

  /* La cámara de cada página (16-nov-2026, pedido de la dueña: «en lugar de las etiquetas de las habitaciones, que se pueda
     hacer zoom y deslizarse por el escenario»): z = cuánto se acerca; tx, ty = corrimiento en % del lienzo. */
  const ZOOM_MAX = 4;
  const camaras = { casa: { z: 1.3, tx: -1.3, ty: -2.6 } };   // la casita empieza un poco cerca: su dibujo trae mucho margen de bosque
  const LUPA = mas => '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">' +
    '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21M7.5 10.5h6' + (mas ? 'M10.5 7.5v6' : '') + '"/></svg>';

  /* Dos maneras de estar en el álbum (16-nov-2026, la dueña):
     - JUGAR (como se abre): tocar una cosa la hace actuar, sin elegirla. Las cosas no se mueven; arrastrar desliza la
       cámara. Los amigos sí se mueven siempre, y reciben regalos.
     - LÁPIZ ✏️: las calcomanías se eligen, se arrastran, se agrandan, se voltean y vuelven a la bandeja. */
  function casita() {
    const p = $('#casita');
    let casa = JSON.parse(JSON.stringify(estado.juego.casa || {})), elegida = null, guardar = null, arrastrada = false;
    let editando = false, regaloArmado = null, amigoActivo = null;
    const pags = paginas();
    if (!pags.some(x => x.id === paginaVista && x.tengo)) paginaVista = 'casa';
    const enPagina = id => (casa[id].e || 'casa') === paginaVista;
    const esAmigo = id => id.startsWith('amigo-');
    const fondo = el('img', { src: pags.find(x => x.id === paginaVista).img, alt: '', draggable: 'false' });
    const capa = el('div', { class: 'casa-capa' }, fondo);
    const lienzo = el('div', { class: 'casa casa-arriba' }, capa);
    const bandeja = el('div', { class: 'bandeja' });
    const extras = el('span', { class: 'extras-calco' });
    const herramientas = el('div', { class: 'herramientas-calco', hidden: true },
      extras,
      boton('−', 'Achicar', () => cambiar(c => { c.s = Math.max(.3, +(c.s / 1.15).toFixed(2)); })),
      boton('+', 'Agrandar', () => cambiar(c => { c.s = Math.min(3, +(c.s * 1.15).toFixed(2)); })),
      boton('⇆', 'Voltear', () => cambiar(c => { c.f = !c.f; })),
      boton('▲', 'Poner encima', () => cambiar(c => { c.z = maxZ() + 1; })),
      boton('▼', 'Poner debajo', () => cambiar(c => { Object.values(casa).forEach(o => { o.z++; }); c.z = 0; })),
      boton('↩', 'Guardar en la bandeja', () => { delete casa[elegida]; elegir(null); pintar(); guardarPronto(); }));
    function boton(ico, nombre, fn, clase) { return el('button', { class: 'btn-icono' + (clase ? ' ' + clase : ''), type: 'button', 'aria-label': nombre, title: nombre, html: ico, onclick: () => { S.toque(); fn(); } }); }
    function pastilla(clase, nombre, dibujo, numero, fn) {
      return el('button', { class: 'pastilla ' + clase, type: 'button', 'aria-label': nombre, title: nombre, onclick: () => { S.toque(); fn(); } },
        el('span', { class: 'pastilla-arte' }, dibujo), el('span', { class: 'num', html: numero }));
    }
    const maxZ = () => Object.values(casa).reduce((m, c) => Math.max(m, c.z), 0);
    const calco = id => [...capa.querySelectorAll('.calco')].find(b => b.dataset.id === id);
    const entre = (v, a, b) => Math.max(a, Math.min(b, v));
    function cambiar(fn) { if (!elegida) return; fn(casa[elegida]); pintar(); guardarPronto(); }
    function elegir(id) {
      elegida = id; herramientas.hidden = !id;
      capa.querySelectorAll('.calco').forEach(b => b.classList.toggle('elegida', b.dataset.id === id));
      /* con el lápiz, la calcomanía elegida que se puede mejorar muestra su estrella con el precio */
      const t = id && !esAmigo(id) ? itemDe(id) : null, m = t && t.mejora;
      llenar(extras, m && !mejorada(id) ? pastilla('mejorar', 'Mejorar', document.createTextNode('⭐'), MALVAVISCO + m.precio, () => ofrecerMejora(t, () => {
        pintarMonedas(); elegir(t.id);   // ya mejorada: muestra sola lo que hace
        setTimeout(() => { const b = calco(t.id); if (b) m.accion === 'luz' ? actuar(t.id) : jugar(capa, b, m.accion); }, 420);
      })) : null);
      extras.hidden = !extras.children.length;
    }
    function editar(si) {
      editando = si; lienzo.classList.toggle('editando', si); lapiz.setAttribute('aria-pressed', String(si));
      if (!si) elegir(null);
    }

    /* ---- la cámara: dos dedos o la rueda acercan, un dedo desliza; los botones de lupa hacen lo mismo ---- */
    const cam = Object.assign({ z: 1, tx: 0, ty: 0 }, camaras[paginaVista]);
    const tope = () => (cam.z - 1) * 50;   // hasta dónde se corre sin que el dibujo deje un hueco en el lienzo
    /* pasado el borde, la página cede cada vez menos (como una goma) en vez de chocar contra una pared; al soltar vuelve */
    const goma = v => { const t = tope(), sobra = Math.abs(v) - t; return sobra <= 0 ? v : Math.sign(v) * (t + sobra / (1 + sobra / 10)); };
    let puesto = {}, relojZoom = null;
    /* lo que depende del zoom y hace recalcular el estilo de todas las calcomanías se escribe solo cuando cambia, y la
       variable --zoom espera a que el gesto descanse (antes iba en cada cuadro del pellizco) */
    function fijar(clave, valor, poner) { if (puesto[clave] !== valor) { puesto[clave] = valor; poner(valor); } }
    function fijarZoom(ya) {
      const poner = () => fijar('zoom', cam.z.toFixed(2), v => capa.style.setProperty('--zoom', v));   // el borde de la elegida y las chispitas no engordan con el zoom
      clearTimeout(relojZoom);
      if (ya || puesto.zoom == null) poner(); else relojZoom = setTimeout(poner, 120);
    }
    /* modo: false (sigue al dedo), 'suave' (botones de lupa y vuelta del borde) o 'deriva' (la inercia al soltar).
       sinTope: mientras el dedo arrastra, la página puede pasarse un poco del borde */
    function camara(modo, sinTope) {
      cam.z = entre(cam.z, 1, ZOOM_MAX);
      if (!sinTope) { const t = tope(); cam.tx = entre(cam.tx, -t, t); cam.ty = entre(cam.ty, -t, t); }
      modo = modo === true ? 'suave' : modo;
      /* antes de pedir una transición, el navegador tiene que haber visto dónde está la página ahora: si el último
         movimiento del dedo y el soltar llegan en el mismo cuadro, sin esto animaría también ese último tramo */
      if (modo) getComputedStyle(capa).transform;
      capa.classList.toggle('suave', modo === 'suave' && !quieto()); capa.classList.toggle('deriva', modo === 'deriva' && !quieto());
      capa.style.transform = 'translate(' + cam.tx.toFixed(3) + '%, ' + cam.ty.toFixed(3) + '%) scale(' + cam.z.toFixed(4) + ')';
      fijarZoom(!!modo);
      fijar('cuarto', cam.z < 1.7 ? 'todo' : 'cerca', v => { lienzo.dataset.cuarto = v; });   // de lejos, las calcomanías tienen una zona de toque más grande
      fijar('toque', cam.z > 1.01 ? 'none' : 'pan-y', v => { lienzo.style.touchAction = v; });   // sin acercar no hay nada que deslizar: el dedo baja la pantalla
      fijar('menos', cam.z <= 1.01, v => { menos.disabled = v; }); fijar('mas', cam.z >= ZOOM_MAX - .01, v => { mas.disabled = v; });
      const t = tope();
      camaras[paginaVista] = { z: cam.z, tx: entre(cam.tx, -t, t), ty: entre(cam.ty, -t, t) };   // cada página recuerda dónde quedó su cámara
    }
    /* un dedo que cae mientras la cámara todavía se mueve (inercia o lupa) la detiene donde va. Si iba volviendo de
       pasarse del borde, queda en el borde: nunca descansa mostrando un hueco */
    function detener() {
      if (!capa.classList.contains('suave') && !capa.classList.contains('deriva')) return;
      if (capa.getAnimations().some(x => x.playState === 'running') && capa.offsetWidth) {   // si ya llegó, no hay nada que medir
        const m = new DOMMatrixReadOnly(getComputedStyle(capa).transform), casi = (v, destino, margen) => Math.abs(v - destino) < margen ? destino : v;
        if (m.a > 0) { cam.z = casi(m.a, cam.z, .003); cam.tx = casi(m.e / capa.offsetWidth * 100, cam.tx, .06); cam.ty = casi(m.f / capa.offsetHeight * 100, cam.ty, .06); }
      }
      camara(false);
    }
    /* acerca o aleja dejando quieto el punto (px, py) de la pantalla; sin punto, el centro del lienzo */
    function acercar(factor, px, py, suave) {
      const r = lienzo.getBoundingClientRect();
      const sx = px == null ? 0 : (px - r.left - r.width / 2) / r.width * 100, sy = py == null ? 0 : (py - r.top - r.height / 2) / r.height * 100;
      const z = entre(cam.z * factor, 1, ZOOM_MAX), k = z / cam.z;
      cam.tx = sx - (sx - cam.tx) * k; cam.ty = sy - (sy - cam.ty) * k; cam.z = z;
      camara(suave);
    }
    const menos = boton(LUPA(false), 'Alejar', () => acercar(1 / 1.5, null, null, true));
    const mas = boton(LUPA(true), 'Acercar', () => acercar(1.5, null, null, true));
    const lapiz = el('button', { class: 'btn-icono lapiz', type: 'button', 'aria-label': 'Mover las calcomanías', title: 'Mover las calcomanías', 'aria-pressed': 'false', text: '✏️', onclick: () => { S.toque(); editar(!editando); } });
    const punteros = new Map();
    let gesto = null, paneo = false, arrastrando = false;
    const distancia = () => { const [a, b] = [...punteros.values()]; return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; };
    lienzo.addEventListener('pointerdown', e => {   // en la fase de captura: se cuentan los dedos antes de que una calcomanía decida
      if (e.isPrimary) punteros.clear();
      detener();
      punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (punteros.size === 1) { paneo = false; gesto = null; }
      if (punteros.size === 2 && !arrastrando) { gesto = Object.assign({ tipo: 'pellizco' }, distancia()); paneo = true; }
    }, true);
    lienzo.addEventListener('pointerdown', e => {   // llega aquí si no lo tomó una calcomanía que se mueve
      if (punteros.size !== 1) return;
      gesto = { tipo: 'desliza', id: e.pointerId, x: e.clientX, y: e.clientY, tx: cam.tx, ty: cam.ty, activo: false };
      if (!e.target.closest('.calco')) { amigoActivo = null; if (editando) elegir(null); }
    });
    lienzo.addEventListener('pointermove', e => {
      if (!punteros.has(e.pointerId) || !gesto) return;
      if (e.pointerType === 'mouse' && e.buttons === 0) { punteros.delete(e.pointerId); gesto = null; return; }   // el mouse se soltó fuera del lienzo
      punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (gesto.tipo === 'pellizco' && punteros.size >= 2) {
        const n = distancia(), r = lienzo.getBoundingClientRect();
        cam.tx += (n.x - gesto.x) / r.width * 100; cam.ty += (n.y - gesto.y) / r.height * 100;   // los dos dedos también arrastran
        acercar(n.d / gesto.d, n.x, n.y);
        Object.assign(gesto, n);
      } else if (gesto.tipo === 'desliza' && gesto.id === e.pointerId) {
        const dx = e.clientX - gesto.x, dy = e.clientY - gesto.y;
        if (!gesto.activo && Math.hypot(dx, dy) < 5) return;   // un dedo nunca está del todo quieto: menos de 5 px es un toque
        if (!gesto.activo) { gesto.activo = true; paneo = true; try { lienzo.setPointerCapture(e.pointerId); } catch (err) { } }
        const r = lienzo.getBoundingClientRect(), ahora = performance.now(), tx0 = cam.tx, ty0 = cam.ty;
        cam.tx = goma(gesto.tx + dx / r.width * 100); cam.ty = goma(gesto.ty + dy / r.height * 100);
        /* la velocidad del dedo (en % del lienzo por milisegundo), suavizada, para la inercia al soltar */
        const dt = ahora - (gesto.t || ahora);
        if (dt >= 4) { gesto.vx = .6 * (cam.tx - tx0) / dt + .4 * (gesto.vx || 0); gesto.vy = .6 * (cam.ty - ty0) / dt + .4 * (gesto.vy || 0); gesto.t = ahora; }
        else if (!gesto.t) gesto.t = ahora;
        camara(false, true);
      }
    });
    const suelta = e => {
      punteros.delete(e.pointerId);
      if (!gesto) return;
      if (gesto.tipo === 'pellizco' && punteros.size === 1) {   // quedó un dedo: sigue deslizando desde donde está
        const [[id, pt]] = [...punteros.entries()];
        gesto = { tipo: 'desliza', id, x: pt.x, y: pt.y, tx: cam.tx, ty: cam.ty, activo: true };
      } else if (!punteros.size) {
        const g = gesto; gesto = null; setTimeout(() => { paneo = false; }, 0);   // el «click» de este toque ya pasó
        if (g.tipo === 'desliza' && g.activo) {
          /* al soltar con impulso la página sigue un poco y frena sola; si quedó pasada del borde, vuelve */
          const rapido = g.t && performance.now() - g.t < 90 && Math.hypot(g.vx || 0, g.vy || 0) > .03 && !quieto();
          const t = tope(), pasada = Math.abs(cam.tx) > t + .01 || Math.abs(cam.ty) > t + .01;
          if (rapido) { cam.tx += g.vx * 240; cam.ty += g.vy * 240; }
          camara(rapido ? 'deriva' : pasada ? 'suave' : false);   // sin impulso y dentro del borde: se queda donde la dejó el dedo
        } else fijarZoom(true);
      }
    };
    lienzo.addEventListener('pointerup', suelta); lienzo.addEventListener('pointercancel', suelta);
    lienzo.addEventListener('wheel', e => {
      if (e.deltaY > 0 && cam.z <= 1.01) return;   // ya está lejos del todo: la rueda baja la pantalla
      e.preventDefault();
      acercar(Math.exp(-e.deltaY * .0016), e.clientX, e.clientY);
    }, { passive: false });

    function estilo(id) {
      const c = casa[id];
      return 'left:' + c.x + '%;top:' + c.y + '%;width:' + (tamBase(id, paginaVista) * c.s) + '%;z-index:' + (c.z + 1) + ';transform:translate(-50%,-50%)' + (c.f ? ' scaleX(-1)' : '');
    }
    function pintar() {
      capa.querySelectorAll('.calco').forEach(b => b.remove());
      Object.keys(casa).filter(enPagina).sort((a, b) => casa[a].z - casa[b].z).forEach(id => {
        const viva = !esAmigo(id) && (itemDe(id) || {}).mejora;
        const b = el('button', { class: 'calco' + (id === elegida ? ' elegida' : '') + (esAmigo(id) ? ' es-amigo' : '') + (viva ? ' viva' : '') + (luces.has(id) && mejorada(id) ? ' encendida' : ''),
          type: 'button', 'data-id': id, style: estilo(id), 'aria-label': nombreItem(id) }, el('span', { class: 'calco-arte' }, arte(id)));
        arrastrable(b, id);
        conTeclado(b, id);
        capa.append(b);
      });
      pintarBandeja();
    }
    /* la bandeja sola (los regalos y lo que falta pegar): se repinta sin tocar las calcomanías, que pueden estar moviéndose */
    function pintarBandeja() {
      const jg = estado.juego;
      const libres = jg.inventario.filter(id => !id.startsWith('mapa-') && !casa[id]).concat((jg.personajes || []).map(a => 'amigo-' + a).filter(id => !casa[id]));
      const regalos = Object.keys(jg.despensa || {}).filter(r => jg.despensa[r] > 0);
      if (!regalos.includes(regaloArmado)) regaloArmado = null;
      llenar(bandeja, libres.length || regalos.length
        ? el('div', { class: 'bandeja-fila' },
          regalos.map(r => el('button', { class: 'calco-bandeja regalo' + (r === regaloArmado ? ' armado' : ''), type: 'button', 'data-regalo': r, 'aria-pressed': String(r === regaloArmado), 'aria-label': NOMBRE_REGALO[r] + ': ' + jg.despensa[r], onclick: () => ofrecer(r) },
            el('span', { class: 'arte-mini' }, arte('regalo-' + r)), el('span', { class: 'cuenta', text: String(jg.despensa[r]) }))),
          libres.map(id => el('button', { class: 'calco-bandeja', type: 'button', 'data-id': id, 'aria-label': 'Pegar ' + nombreItem(id), onclick: () => pegar(id) }, el('span', { class: 'arte-mini' }, arte(id)))))
        : el('p', { class: 'mano', text: '¡Pegaste todas tus calcomanías! 🧸' }));
    }
    /* una calcomanía de la bandeja se pega en el centro de lo que se está viendo. Una cosa entra con el lápiz puesto
       (hay que acomodarla); un amigo no lo necesita: se mueve siempre */
    function pegar(id) {
      S.pegar();
      const azar = () => Math.round((Math.random() - .5) * 8 / cam.z);
      casa[id] = { x: entre(50 - cam.tx / cam.z + azar(), 4, 96), y: entre(50 - cam.ty / cam.z + azar(), 4, 96), s: 1, z: maxZ() + 1, f: false };
      if (paginaVista !== 'casa') casa[id].e = paginaVista;
      if (!esAmigo(id) && !editando) editar(true);
      pintar(); if (editando) elegir(id); guardarPronto();
    }
    /* un sticker mejorado hace lo suyo (la lámpara se enciende o se apaga; los demás se mueven y suenan) */
    function actuar(id) {
      const t = itemDe(id), m = t && t.mejora, b = calco(id);
      if (!m || !b || !mejorada(id)) return;
      if (m.accion === 'luz') { luces.has(id) ? luces.delete(id) : luces.add(id); b.classList.toggle('encendida', luces.has(id)); S.juguete('luz'); return; }
      jugar(capa, b, m.accion);
    }
    /* la estufa hornea, la olla sirve, la caña pesca: cuesta unos malvaviscos (se ven salir) y el regalo queda en la bandeja */
    let ultimo = { id: null, t: 0 };
    function preparar(id) {
      const m = itemDe(id).mejora, jg = estado.juego, ahora = Date.now();
      if (ultimo.id === id && ahora - ultimo.t < 600) return;   // dos toques pegados no cobran dos veces
      if (jg.malvaviscos < m.uso) { S.error(); aviso('Te faltan ' + (m.uso - jg.malvaviscos) + ' malvaviscos 🍡'); return; }
      if (((jg.despensa || {})[m.regalo] || 0) >= 9) {   // la despensa está llena: los amigos piden su parte
        S.error(); const f = bandeja.querySelector('[data-regalo="' + m.regalo + '"]');
        if (f && !quieto()) f.animate(cuadros(EASE_OUT, 'scale(1)', 'scale(1.14)', 'scale(1)'), { duration: 320 });
        return;
      }
      ultimo = { id, t: ahora };
      porDetras(j => { j.malvaviscos -= m.uso; j.despensa = Object.assign({}, j.despensa, { [m.regalo]: ((j.despensa || {})[m.regalo] || 0) + 1 }); }, () => Api.usar(id));
      const b = calco(id);
      if (b) {
        jugar(capa, b, m.accion);
        chispa(capa, b, el('span', { class: 'chispa-precio', html: '−' + m.uso + MALVAVISCO }), 0, 1);
        chispa(capa, b, arte('regalo-' + m.regalo), 700, 0).classList.add('grande');
      }
      pintarMonedas(); pintarBandeja();
      const ficha = bandeja.querySelector('[data-regalo="' + m.regalo + '"]');
      if (ficha && !quieto()) ficha.animate(cuadros(EASE_OUT, 'scale(1)', 'scale(1.14)', 'scale(1)'), { duration: 320, delay: 900 });
    }
    function dar(regalo, amigo) {
      if (!((estado.juego.despensa || {})[regalo] > 0) || !(estado.juego.personajes || []).includes(amigo)) return;
      porDetras(j => { const d = Object.assign({}, j.despensa); d[regalo]--; if (!d[regalo]) delete d[regalo]; j.despensa = d; }, () => Api.dar(regalo, amigo));
      const b = calco('amigo-' + amigo);
      if (b) jugar(capa, b, 'regalo');
      regaloArmado = null; pintarBandeja();
    }
    const saltito = (cosas) => { if (!quieto()) cosas.forEach((a, i) => a && a.animate(cuadros(EASE_OUT, 'translateY(0)', 'translateY(-10%)', 'translateY(0)'), { duration: 300, delay: i * 50 })); };
    /* tocar un regalo de la bandeja: va para el amigo que se acaba de tocar; si no hay, queda listo para el próximo
       amigo que se toque (y los amigos dan un saltito para pedirlo) */
    function ofrecer(regalo) {
      S.toque();
      if (amigoActivo && calco('amigo-' + amigoActivo)) { dar(regalo, amigoActivo); return; }
      regaloArmado = regaloArmado === regalo ? null : regalo;
      pintarBandeja();
      if (regaloArmado) saltito([...capa.querySelectorAll('.calco.es-amigo .calco-arte')].concat([...bandeja.querySelectorAll('.calco-bandeja')].filter(b => (b.dataset.id || '').startsWith('amigo-'))));
    }
    /* JUGAR: lo que pasa al tocar una calcomanía sin el lápiz */
    function tocar(id) {
      if (esAmigo(id)) {
        if (regaloArmado) { dar(regaloArmado, id.slice(6)); return; }
        amigoActivo = id.slice(6); S.toque();
        const b = calco(id);
        saltito([b && b.querySelector('.calco-arte')].concat([...bandeja.querySelectorAll('.calco-bandeja.regalo')]));   // saluda, y los regalos se ofrecen
        return;
      }
      const t = itemDe(id), m = t && t.mejora;
      if (!m) return;
      if (!mejorada(id)) {   // todavía no hace nada: una estrella con su precio avisa que se puede mejorar (con el lápiz o en la tienda)
        const b = calco(id); S.toque();
        if (b) { chispa(capa, b, el('span', { class: 'chispa-precio', html: '⭐ ' + m.precio + MALVAVISCO }), 0, 0); saltito([b.querySelector('.calco-arte')]); }
        return;
      }
      if (m.regalo) preparar(id); else actuar(id);
    }
    /* se arrastran las calcomanías con el lápiz puesto, y los amigos siempre. Lo demás no se mueve: el dedo desliza la cámara */
    function arrastrable(b, id) {
      b.addEventListener('pointerdown', e => {
        if (!(editando || esAmigo(id)) || punteros.size > 1) return;
        e.preventDefault(); e.stopPropagation();
        b.setPointerCapture(e.pointerId); arrastrando = true;
        if (editando) elegir(id);
        const caja = capa.getBoundingClientRect(), c = casa[id];   // caja: la capa ya con el zoom de la cámara
        const dx = e.clientX - (caja.left + caja.width * c.x / 100), dy = e.clientY - (caja.top + caja.height * c.y / 100);
        let movio = false;
        const x0 = c.x, y0 = c.y, giro = c.f ? ' scaleX(-1)' : '', ex0 = e.clientX, ey0 = e.clientY;
        const mover = ev => {
          if (!movio && Math.hypot(ev.clientX - ex0, ev.clientY - ey0) < 5) return;
          // mientras se arrastra solo cambia el transform (GPU); left/top se fijan al soltar
          movio = true;
          c.x = entre((ev.clientX - dx - caja.left) / caja.width * 100, 0, 100);
          c.y = entre((ev.clientY - dy - caja.top) / caja.height * 100, 0, 100);
          b.style.transform = 'translate(calc(-50% + ' + ((c.x - x0) / 100 * capa.offsetWidth) + 'px), calc(-50% + ' + ((c.y - y0) / 100 * capa.offsetHeight) + 'px))' + giro;
        };
        const soltar = () => {
          b.removeEventListener('pointermove', mover); b.removeEventListener('pointerup', soltar); b.removeEventListener('pointercancel', soltar);
          arrastrada = movio; arrastrando = false;
          setTimeout(() => { arrastrada = false; }, 0);   // el «click» de este toque ya pasó
          if (movio) { b.style.left = c.x + '%'; b.style.top = c.y + '%'; b.style.transform = 'translate(-50%,-50%)' + giro; S.pegar(); guardarPronto(); }
        };
        b.addEventListener('pointermove', mover); b.addEventListener('pointerup', soltar); b.addEventListener('pointercancel', soltar);
      });
      /* un toque (o Enter) sin arrastrar ni deslizar: sin el lápiz, la calcomanía hace lo suyo */
      b.addEventListener('click', () => {
        if (arrastrada) { arrastrada = false; return; }
        if (paneo || editando) return;
        tocar(id);
      });
    }
    /* con el teclado: lo que se mueve (con el lápiz, todo; sin él, los amigos) va con las flechas (Mayús: más lejos);
       con el lápiz, + y − cambian el tamaño y Supr o Retroceso la devuelven a la bandeja */
    function conTeclado(b, id) {
      b.addEventListener('focus', () => { if (editando) elegir(id); });
      b.addEventListener('keydown', e => {
        if (!(editando || esAmigo(id))) return;
        const c = casa[id], paso = e.shiftKey ? 5 : 1;
        const mov = { ArrowLeft: [-paso, 0], ArrowRight: [paso, 0], ArrowUp: [0, -paso], ArrowDown: [0, paso] }[e.key];
        if (mov) { e.preventDefault(); c.x = entre(c.x + mov[0], 0, 100); c.y = entre(c.y + mov[1], 0, 100); b.style.left = c.x + '%'; b.style.top = c.y + '%'; guardarPronto(); return; }
        if (!editando) return;
        if (e.key === '+' || e.key === '=') { e.preventDefault(); c.s = Math.min(3, +(c.s * 1.15).toFixed(2)); b.setAttribute('style', estilo(id)); guardarPronto(); }
        else if (e.key === '-') { e.preventDefault(); c.s = Math.max(.3, +(c.s / 1.15).toFixed(2)); b.setAttribute('style', estilo(id)); guardarPronto(); }
        else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); delete casa[id]; elegir(null); pintar(); guardarPronto(); }
      });
    }
    function guardarPronto() {
      estado.juego.casa = JSON.parse(JSON.stringify(casa));   // si sale y vuelve a entrar antes de que llegue al servidor, la ve igual
      if (guardar) clearTimeout(guardar); else pendientes++;   // cuenta como pendiente desde ya: una respuesta vieja no la pisa
      guardar = setTimeout(() => {
        guardar = null; pendientes--;
        porDetras(() => { }, () => Api.guardarCasa(casa), r => { if (r.insignias && r.insignias.length) mostrarPremios(r.insignias); });
      }, 700);
    }
    /* las páginas del álbum: la casita y cada mapa. Una página que todavía no tiene lleva a la tienda, a ese mapa */
    const titulo = el('h1', { text: pags.find(x => x.id === paginaVista).nombre });
    const selector = el('div', { class: 'paginas-album', role: 'tablist', 'aria-label': 'Páginas del álbum' }, pags.map(pg => el('button', {
      class: 'pagina-album' + (pg.tengo ? '' : ' cerrada'), type: 'button', 'data-pagina': pg.id, 'aria-pressed': String(pg.id === paginaVista),
      'aria-label': pg.tengo ? pg.nombre : pg.nombre + ', en la tienda por ' + pg.item.precio + ' malvaviscos', onclick: () => { S.toque(); irPagina(pg.id); }
    }, el('img', { src: pg.mini, alt: '', width: '40', height: '40' }), pg.tengo ? el('span', { text: pg.id === 'casa' ? 'Casita' : pg.nombre }) : el('span', { class: 'precio', html: '🔒 ' + MALVAVISCO + pg.item.precio }))));
    function irPagina(id) {
      const pg = pags.find(x => x.id === id);
      if (!pg.tengo) { tienda(pg.id); return; }
      if (id === paginaVista) return;
      paginaVista = id; elegir(null); amigoActivo = null;
      Object.assign(cam, camaras[id] || { z: 1, tx: 0, ty: 0 });
      fondo.src = pg.img; titulo.textContent = pg.nombre;
      selector.querySelectorAll('.pagina-album').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pagina === id)));
      pintar(); camara(); fijarZoom(true);   // de una página a otra no hay viaje de cámara: la página nueva aparece
      lienzo.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: EASE_OUT });
    }
    const cabecera = el('div', { class: 'cabecera' }, el('button', { class: 'btn-icono', type: 'button', 'aria-label': 'Volver', text: '←', onclick: () => camino() }), titulo, fichas().children[1]);
    function pintarMonedas() { cabecera.replaceChild(fichas().children[1], cabecera.lastChild); }
    llenar(p,
      cabecera, selector, lienzo,
      el('div', { class: 'controles-album' }, lapiz, el('span', { class: 'zoom-album' }, menos, mas)),
      herramientas,
      el('h2', { class: 'seccion-titulo', style: 'margin:8px 2px 6px', text: 'Mis calcomanías' }), bandeja,
      el('div', { class: 'casa-acciones' },
        puff('🧺 Tienda', 'rosa', () => tienda(paginaVista !== 'casa' ? paginaVista : null)),
        puff('📸 Compartir', 'cielo', () => window.Compartir.casa(Object.assign({}, estado, { juego: Object.assign({}, estado.juego, { casa }) }), POS, EMOJI, IMAGENES,
          id => tamBase(id, paginaVista), pags.find(x => x.id === paginaVista)))));
    ir('casita');
    pintar(); camara();
  }
  const nombreItem = id => id.startsWith('amigo-') ? (estado.catalogo.personajes.find(a => a.id === id.slice(6)) || {}).nombre || id : (itemDe(id) || {}).nombre || id;

  /* ---------- Tienda: la casita por cuartos, los mapas con sus stickers, las mejoras y los amigos ---------- */
  function tienda(filtro) {
    const p = $('#tienda');
    let lugar = filtro || 'todo';   // 'todo' (la casita entera), un cuarto, un mapa, 'mejoras' o 'amigos'
    filtroTienda = lugar;
    const mapas = estado.catalogo.tienda.filter(t => t.tipo === 'mapa');
    const filtros = CUARTOS.map(c => ({ id: c.id, nombre: c.id === 'todo' ? 'Casita' : c.nombre }))
      .concat(mapas.map(m => ({ id: m.mapa, nombre: m.nombre })), [{ id: 'mejoras', nombre: '⭐ Mejoras' }, { id: 'amigos', nombre: 'Amigos' }]);
    const lista = el('div', { class: 'tienda' });
    const precio = n => el('span', { class: 'precio', html: MALVAVISCO + n });
    const dibujo = t => el('div', { class: 'arte' }, arte(t.id), t.mejora ? el('span', { class: 'sello' + (mejorada(t.id) ? ' lista' : ''), 'aria-hidden': 'true', text: ACCION_ICO[t.mejora.accion] || '⭐' }) : null);
    /* una cosa de la tienda: comprarla; si ya es suya y se puede mejorar, mejorarla */
    const tarjeta = t => {
      const jg = estado.juego, tengo = jg.inventario.includes(t.id), falta = t.precio - jg.malvaviscos;
      const cerrado = !!t.mapa && !jg.inventario.includes('mapa-' + t.mapa), m = t.mejora;
      return el('div', { class: 'articulo' + (cerrado ? ' cerrado' : '') }, dibujo(t), el('h3', { text: t.nombre }),
        tengo
          ? (m && !mejorada(t.id)
            ? [precio(m.precio), puff('⭐ Mejorar', jg.malvaviscos >= m.precio ? 'ocre' : 'papel', () => ofrecerMejora(t, () => tienda(lugar)))]
            : el('span', { class: 'mano tuya', text: m ? 'Mejorada ⭐' : 'Ya es tuya ✓' }))
          : [precio(t.precio), cerrado
            ? puff('🔒', 'plomo', () => { S.error(); const c = lista.querySelector('.mapa-tienda'); if (c && !quieto()) c.animate(cuadros(EASE_OUT, 'scale(1)', 'scale(1.03)', 'scale(1)'), { duration: 260 }); })
            : puff(falta > 0 ? 'Faltan ' + falta : 'Comprar', falta > 0 ? 'papel' : 'ocre', () => comprar(t))]);
    };
    /* un mapa: se ve el paisaje, cuánto cuesta y cuánto lleva ahorrado */
    const tarjetaMapa = t => {
      const jg = estado.juego, tengo = jg.inventario.includes(t.id), falta = t.precio - jg.malvaviscos;
      return el('div', { class: 'articulo mapa-tienda' },
        el('img', { class: 'mapa-vista', src: 'assets/ilustraciones/escenario-' + t.mapa + '.webp', alt: t.nombre }),
        el('h3', { text: t.nombre }),
        tengo ? puff(('Ir a ' + t.nombre.toLowerCase()).replace('a el ', 'al '), 'madera', () => { paginaVista = t.mapa; casita(); })
          : [precio(t.precio),
            el('div', { class: 'ahorro', role: 'img', 'aria-label': 'Tienes ' + Math.min(jg.malvaviscos, t.precio) + ' de ' + t.precio + ' malvaviscos' }, el('i', { style: 'transform:scaleX(' + Math.min(1, jg.malvaviscos / t.precio).toFixed(3) + ')' })),
            puff(falta > 0 ? 'Faltan ' + falta : 'Comprar', falta > 0 ? 'papel' : 'ocre', () => comprar(t))]);
    };
    const tarjetaAmigo = a => {
      const jg = estado.juego, tiene = (jg.personajes || []).includes(a.id), sig = jg.amistad && jg.amistad.siguiente && jg.amistad.siguiente.id === a.id ? jg.amistad.siguiente : null;
      return el('div', { class: 'articulo' + (tiene ? '' : ' cerrado') }, el('div', { class: 'arte' }, arte('amigo-' + a.id)), el('h3', { text: a.nombre }),
        el('span', { class: 'mano tuya', text: tiene ? 'Está contigo ✓' : sig ? '🔥 Faltan ' + sig.faltan + (sig.faltan === 1 ? ' día' : ' días') : '🔒' }));
    };
    const pintar = () => {
      const cat = estado.catalogo.tienda, jg = estado.juego;
      let hijos;
      if (lugar === 'amigos') hijos = estado.catalogo.personajes.map(tarjetaAmigo);
      else if (lugar === 'mejoras') {
        const mias = cat.filter(t => t.mejora && jg.inventario.includes(t.id));
        hijos = mias.length ? mias.sort((a, b) => mejorada(a.id) - mejorada(b.id)).map(tarjeta) : [el('p', { class: 'mano tienda-vacia', text: 'Aquí llegan tus calcomanías que se pueden mejorar ⭐' })];
      } else if (mapas.some(m => m.mapa === lugar)) hijos = [tarjetaMapa(mapas.find(m => m.mapa === lugar))].concat(cat.filter(t => t.mapa === lugar && t.tipo !== 'mapa').map(tarjeta));
      else hijos = cat.filter(t => !t.mapa && (lugar === 'todo' || t.lugar.startsWith(lugar + '-'))).map(tarjeta);
      llenar(lista, hijos);
    };
    const pestanas = el('div', { class: 'pestanas', role: 'tablist' }, filtros.map(f => el('button', {
      class: 'pestana', type: 'button', 'data-filtro': f.id, 'aria-pressed': String(f.id === lugar), text: f.nombre,
      onclick: e => { S.toque(); lugar = filtroTienda = f.id; pestanas.querySelectorAll('.pestana').forEach(b => b.setAttribute('aria-pressed', String(b === e.currentTarget))); pintar(); lista.parentNode.scrollTop = 0; e.currentTarget.scrollIntoView({ block: 'nearest', inline: 'center' }); }
    })));
    function comprar(t) {
      const jg = estado.juego;
      if (jg.malvaviscos < t.precio) { S.error(); aviso('Practica un poco más para juntar ' + (t.precio - jg.malvaviscos) + ' malvaviscos 🍡'); return; }
      if (jg.inventario.includes(t.id)) return;
      porDetras(j => { j.malvaviscos -= t.precio; j.inventario = j.inventario.concat([t.id]); }, () => Api.comprar(t.id),
        r => { if (r.insignias && r.insignias.length) mostrarPremios(r.insignias); });
      S.caja();
      if (t.tipo === 'mapa') { confeti(); aviso('¡' + t.nombre + ' ya es tuyo! 🎉'); }
      else aviso('¡' + t.nombre + ' está en tu bandeja de calcomanías!');
      tienda(lugar);
    }
    pintar();
    llenar(p,
      el('div', { class: 'cabecera' }, el('button', { class: 'btn-icono', type: 'button', 'aria-label': 'Volver', text: '←', onclick: () => camino() }), el('h1', { text: 'Tienda del bosque' }), fichas().children[1]),
      pestanas, el('div', { class: 'lista-scroll' }, lista),
      el('div', { class: 'casa-acciones', style: 'grid-template-columns:1fr' }, puff('🏡 Ver mi casita', 'madera', () => casita())));
    const activa = pestanas.querySelector('[aria-pressed="true"]');
    if (activa) activa.scrollIntoView({ block: 'nearest', inline: 'center' });
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
      const tiene = (j.personajes || []).includes(a.id), sig = j.amistad && j.amistad.siguiente && j.amistad.siguiente.id === a.id ? j.amistad.siguiente : null;
      return el('div', { class: 'amigo' + (tiene ? '' : ' bloqueado') }, el('div', { class: 'retrato' }, el('img', { src: RETRATO(a.id), alt: '' })),
        el('span', { text: tiene ? a.nombre : sig ? 'Faltan ' + sig.faltan + (sig.faltan === 1 ? ' día' : ' días') : '🔒' }));
    }));
    llenar(p, 
      el('div', { class: 'cabecera' }, el('button', { class: 'btn-icono', type: 'button', 'aria-label': 'Volver', text: '←', onclick: () => camino() }), el('h1', { text: 'Biblioteca' })),
      el('div', { class: 'lista-scroll' },
        el('h2', { class: 'seccion-titulo', text: 'Mis libros' }), estante,
        el('p', { class: 'mano pista-estante', text: estado.libre ? 'Los libros de la serie están en Amazon 📚' : 'Toca un libro para leerlo cuando quieras 📖' }),
        pruebaNivel(),
        el('h2', { class: 'seccion-titulo', text: 'Medallas' }), numeros, insignias,
        el('h2', { class: 'seccion-titulo', text: 'Amigos del bosque' }), amigos,
        sinCuenta() ? el('div', { class: 'casa-acciones', style: 'grid-template-columns:1fr;margin-top:18px' }, puff('🔐 Guardar mi progreso con Google', 'madera', () => cuenta())) : null));
    ir('logros');
    /* 12-nov-2026: el libro de su etapa se empieza a bajar al entrar a la biblioteca, antes de tocar el lomo */
    const suyo = (estado.biblioteca || []).find(b => b.abierto && estado.leccion && b.etapa === estado.leccion.etapa);
    if (suyo) Api.libro(suyo.etapa).catch(() => { });
  }

  /* repetir la prueba de nivel para subir (4-nov): una vez por semana; si todavía no se puede, dice desde qué día */
  function pruebaNivel() {
    const pr = estado.prueba;
    if (!pr) return null;
    const f = pr.desde.split('-');
    // antes de los 7 días el botón queda gris (plomo), sin frases (pedido de la dueña, 4-nov): al tocarlo, solo la fecha
    return el('div', { class: 'prueba-nivel casa-acciones', style: 'grid-template-columns:1fr;margin-top:14px' },
      pr.puede ? puff('Subir de nivel', 'ocre', () => encuesta(true)) : puff('Subir de nivel', 'plomo', () => aviso('⏳ Desde el ' + f[2] + '/' + f[1])));
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
      let partes = pg.semana ? html.split(/(?=<div class="hoja2">)/) : [html];
      /* 11-nov-2026 (la dueña): el libro de la app es solo teoría, así que la segunda hoja de varias lecciones quedaba vacía
         y en el celular «Míralo» se cortaba abajo de la primera. Como en el PDF: «Míralo» pasa a la segunda hoja, y una
         hoja sin texto ni dibujo no se muestra. */
      if (pg.semana && partes.length === 2) {
        const doc = new DOMParser().parseFromString('<div id="r">' + html + '</div>', 'text/html');
        const h1 = doc.querySelector('.hoja1'), h2 = doc.querySelector('.hoja2');
        if (h1 && h2) {
          const hijos = [...h1.children], iM = hijos.findIndex(k => k.tagName === 'H3' && k.textContent.trim() === 'Míralo');
          if (iM >= 0) h2.prepend(...hijos.slice(iM));   // 14-nov-2026: también los párrafos que van entre dos dibujos (ligadura → síncopa)
          partes = [h1.outerHTML, h2.outerHTML].filter((p, k) => k === 0 || /\S/.test(h2.textContent) || h2.querySelector('img'));
        }
      }
      partes.forEach((h, k) => hojas.push({ titulo: pg.titulo, grupo, segunda: k > 0, html: h, semana: pg.semana || 0 }));
    });
    return hojas;
  }
  /* Ejemplos que suenan (pedido de la dueña, 29-oct): debajo del dibujo de cada lección, botones 🔊 que tocan lo que
     muestra el dibujo (js/ejemplos.js); el dibujo brilla mientras suena */
  function ponerEjemplos(cont, h) {
    const dibujos = cont.querySelectorAll('.diagrama'), dib = dibujos[dibujos.length - 1];   // «Míralo» va en la segunda hoja (11-nov-2026); con dos dibujos, debajo del último (14-nov)
    const lista = h.semana && dib ? window.Ejemplos.de(h.semana, estado.instrumento) : [];
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
    const hoja = el('div', { class: 'libro-pagina', tabindex: '0' }, esperando('Abriendo el libro…'));
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
    catch (e) { llenar(hoja, el('p', { class: 'cargando', text: e.message })); return; }
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
      llenar(hoja, cont);
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
