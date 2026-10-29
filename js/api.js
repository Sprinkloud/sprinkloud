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
  /* la clave no se queda en la barra de direcciones (por si comparten una captura) */
  if (q.get('k')) history.replaceState(null, '', location.pathname + (DEMO ? '?demo=1' : ''));

  async function get() {
    const r = await fetch(window.BOSQUE_API + '?api=juego&k=' + encodeURIComponent(clave));
    const d = await r.json();
    if (d.error) throw new Error(d.error);
    return d;
  }
  async function post(cuerpo) {
    const r = await fetch(window.BOSQUE_API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ k: clave }, cuerpo)) });
    const d = await r.json();
    if (d.error) throw new Error(d.error);
    return d;
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
  const ETAPAS = ['Cuerpo y pulso', 'Primeras lecturas', 'Lectura y ritmo', 'Intervalos, escalas y acordes', 'Tonalidad: reposo, mayor y menor', 'Músico completo'];
  const LARGO = [6, 8, 10, 8, 8, 8];
  const APPS = ',ritmo,ritmo,ritmo,oido:sube,notas,ritmo,notas,notas,notas,notas,ritmo,ritmo:3/4,notas,ritmo,ritmo:3/4,ritmo,ritmo,ritmo,ritmo,notas,notas,notas,notas,oido:intervalos:segundas y terceras,oido:intervalos:cuartas, quintas y octavas,oido:intervalos:todos,notas,notas,notas,oido:mayorMenor,oido:triadas,notas,oido:reposo,oido:mayorMenor,oido:mayorMenor,oido:mayorMenor,notas,ritmo,ritmo:6/8,oido:intervalos:todos,ritmo,ritmo,ritmo,notas,ritmo,oido:reposo,oido:triadas,ritmo'
    .split(/,(?=ritmo|oido|notas|$)/);
  function etapaDe(s) { let e = 0, l = s; while (l > LARGO[e]) l -= LARGO[e++]; return { etapa: e + 1, leccion: l }; }
  const diasEntre = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);

  const demo = {
    hoy() { if (q.get('dia')) return q.get('dia'); const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
    leer() {
      let d = null; try { d = JSON.parse(localStorage.getItem('bosque-demo') || 'null'); } catch (e) { }
      return d || { malvaviscos: 60, racha: 0, mejor: 0, ultimo: '', lena: 0, dias: 0, aciertos: 0, insignias: [], casa: {}, inventario: [], hoy: {} };
    },
    guardar(j) { try { localStorage.setItem('bosque-demo', JSON.stringify(j)); } catch (e) { } },
    fogata(j, hoy) {
      if (!j.ultimo) return { estado: 'apagada', racha: 0 };
      const d = diasEntre(j.ultimo, hoy);
      if (d <= 0) return { estado: 'grande', racha: j.racha };
      if (d === 1) return { estado: 'encendida', racha: j.racha };
      if (d - 1 <= j.lena) return { estado: 'brasas', racha: j.racha };
      return { estado: 'apagada', racha: 0 };
    },
    estado() {
      const s = Math.min(48, Math.max(1, Number(q.get('semana')) || 1)), hoy = demo.hoy(), j = demo.leer(), f = demo.fogata(j, hoy), et = etapaDe(s);
      const tema = window.Leccion.GUIA[s];
      return {
        alumno: 'Amiga', instrumento: q.get('ins') === 'piano' ? 'piano' : 'violin', hoy,
        leccion: { semana: s, etapa: et.etapa, nombreEtapa: ETAPAS[et.etapa - 1], numero: et.leccion, nivel: 'Etapa ' + et.etapa + ' · Lección ' + et.leccion, tema: tema[0], objetivo: tema[1], app: APPS[s] },
        camino: window.Leccion.GUIA.slice(1).map((g, i) => { const x = etapaDe(i + 1); return { semana: i + 1, etapa: x.etapa, leccion: x.leccion, tema: g[0], app: APPS[i + 1], estado: i + 1 === s ? 'actual' : i + 1 < s ? 'hecha' : 'futura' }; }),
        juego: {
          malvaviscos: j.malvaviscos, racha: f.racha, fogata: f.estado, mejor: j.mejor, lena: j.lena, dias: j.dias, aciertos: j.aciertos,
          insignias: j.insignias, casa: j.casa, inventario: j.inventario, personajes: PERSONAJES.filter(p => j.dias >= p.dias).map(p => p.id),
          hoy: j.hoy && j.hoy.fecha === hoy ? { terminada: !!j.hoy.terminada, actividades: j.hoy.actividades || 0, ganados: j.hoy.ganados || 0 } : { terminada: false, actividades: 0, ganados: 0 }
        },
        catalogo: { tienda: TIENDA, lugares: ['sala-pared', 'sala-sillon', 'sala-alfombra', 'sala-musica', 'sala-mesa', 'cocina-estufa', 'cocina-ventana', 'cocina-mesa', 'cocina-repisa', 'dorm-cama', 'dorm-mesita', 'dorm-pared', 'jardin-banca', 'jardin-flores', 'jardin-fogata'], personajes: PERSONAJES, insignias: INSIGNIAS.map(([id, nombre]) => ({ id, nombre })) }
      };
    },
    insignias(j, x) { const n = INSIGNIAS.filter(([id, , si]) => j.insignias.indexOf(id) < 0 && si(j, x)).map(i => i[0]); j.insignias = j.insignias.concat(n); return n; },
    practica(d) {
      const hoy = demo.hoy(), j = demo.leer(), x = d.actividad;
      if (!(x.intentos >= 1 && x.aciertos >= 0 && x.aciertos <= x.intentos)) throw new Error('El resultado no se entiende.');
      if (!j.hoy || j.hoy.fecha !== hoy) j.hoy = { fecha: hoy, actividades: 0, ganados: 0, terminada: false };
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
      return { ok: true, ganados: gana, perfecta, fogata: fuego, insignias: nuevas, personaje: amigo ? amigo.id : null, estado: demo.estado() };
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

  return {
    demo: DEMO,
    tieneClave: () => DEMO || !!clave,
    cargar: () => DEMO ? espera(demo.estado()) : get(),
    practica: (actividad, terminada) => DEMO ? espera(demo.practica({ actividad, terminada })) : post({ accion: 'practicaJuego', actividad, terminada }),
    comprar: item => DEMO ? espera(demo.comprar(item)) : post({ accion: 'comprarJuego', item }),
    guardarCasa: casa => DEMO ? espera(demo.casa(casa)) : post({ accion: 'guardarCasa', casa })
  };
})();
