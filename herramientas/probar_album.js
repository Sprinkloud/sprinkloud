/* El modo de prueba (js/api.js) tiene que seguir las MISMAS reglas que el servidor (Registro_Sprinkloud/maestros/Código.js,
   probadas en Registro_Sprinkloud/pruebas/album_test.js): los amigos que se van de uno en uno y vuelven contando desde el
   último, los amigos como calcomanías, los mapas que se ahorran, las mejoras y los regalos (16-nov-2026).
   Corre sin navegador: `node herramientas/probar_album.js`. Cada «día» abre la app otra vez con ?dia=. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const codigo = fs.readFileSync(path.join(__dirname, '..', 'js', 'api.js'), 'utf8');
const guardado = {};
function abrir(dia, extra) {
  const window = { Leccion: { GUIA: Array.from({ length: 61 }, (_, i) => ['Tema ' + i, 'Objetivo ' + i]) } };
  const ctx = { window, URLSearchParams, setTimeout, Date, JSON, Math, Number, String, Object, Promise, Error, console,
    location: { search: '?demo=1&dia=' + dia + (extra || ''), pathname: '/' }, history: { replaceState() { } },
    localStorage: { getItem: k => (k in guardado ? guardado[k] : null), setItem: (k, v) => { guardado[k] = String(v); } } };
  vm.createContext(ctx); vm.runInContext(codigo, ctx);
  return window.Api;
}
let fallos = 0, pasos = 0;
const ok = (c, msg, extra) => { pasos++; if (!c) { fallos++; console.log('  ✗ ' + msg, extra !== undefined ? JSON.stringify(extra).slice(0, 300) : ''); } else console.log('  ✓ ' + msg); };
const dia = n => '2026-11-' + String(n).padStart(2, '0');
const terminar = api => api.practica({ tipo: 'notas', aciertos: 5, intentos: 6 }, true);
const falla = async (promesa, texto) => { try { await promesa; return false; } catch (e) { return texto.test(e.message); } };

(async () => {
  console.log('\n1) Los amigos llegan con los días de práctica');
  let api = abrir(dia(2)), e = await api.cargar(), r;
  ok(e.juego.personajes.join() === 'osito' && e.juego.amistad.siguiente.id === 'conejo' && e.juego.amistad.siguiente.faltan === 3, 'al empezar solo está el osito y faltan 3 días para el conejo', e.juego.amistad);
  for (const n of [2, 3, 4]) r = await terminar(abrir(dia(n)));
  ok(r.personaje === 'conejo' && r.estado.juego.personajes.join() === 'osito,conejo', 'al tercer día llega el conejo', r.personaje);
  for (const n of [5, 6, 7, 8]) r = await terminar(abrir(dia(n)));
  ok(r.personaje === 'ardilla' && r.estado.juego.amistad.puntos === 7 && r.fogata.lena === 1, 'al séptimo día llega la ardilla (y gana una leña)', [r.personaje, r.estado.juego.amistad]);

  console.log('\n2) Los amigos son calcomanías');
  api = abrir(dia(8));
  r = await api.guardarCasa({ 'amigo-ardilla': { x: 40, y: 50, s: 1, z: 1 }, 'amigo-osito': { x: 60, y: 50, s: 1, z: 2 } });
  ok(r.estado.juego.casa['amigo-ardilla'] && r.estado.juego.casa['amigo-osito'], 'un amigo que está de visita se pega en la casita');
  ok(await falla(api.guardarCasa({ 'amigo-raton': { x: 40, y: 50, s: 1, z: 1 } }), /no está de visita/), 'un amigo que todavía no llega no se puede pegar');
  await api.guardarCasa({ 'amigo-ardilla': { x: 40, y: 50, s: 1, z: 1 }, 'amigo-osito': { x: 60, y: 50, s: 1, z: 2 } });

  console.log('\n3) Si deja de practicar, se van de uno en uno');
  e = await abrir(dia(11)).cargar();
  ok(e.juego.personajes.join() === 'osito,conejo,ardilla' && e.juego.casa['amigo-ardilla'], 'un fin de semana sin practicar no cuesta ningún amigo');
  r = await terminar(abrir(dia(11)));
  ok(r.estado.juego.amistad.puntos === 8 && r.estado.juego.lena === 1, 'al volver, la amistad sigue subiendo (8) y la leña sigue ahí', r.estado.juego.amistad);
  e = await abrir(dia(15)).cargar();
  ok(e.juego.personajes.join() === 'osito,conejo,ardilla', 'con tres días sin practicar y una leña, todavía no se va nadie', e.juego.personajes);
  e = await abrir(dia(16)).cargar();
  ok(e.juego.personajes.join() === 'osito,conejo' && !e.juego.casa['amigo-ardilla'] && e.juego.casa['amigo-osito'], 'al cuarto día se va la ardilla y su calcomanía desaparece', e.juego.personajes);
  ok(e.juego.amistad.puntos === 3 && e.juego.amistad.siguiente.id === 'ardilla' && e.juego.amistad.siguiente.faltan === 4, 'los días se cuentan desde el último amigo que le queda: 4 para recuperar a la ardilla', e.juego.amistad);
  e = await abrir(dia(18)).cargar();
  ok(e.juego.personajes.join() === 'osito', 'si sigue sin practicar se van de uno en uno; el osito nunca se va');
  e = await abrir('2026-12-10').cargar();
  ok(e.juego.personajes.join() === 'osito' && e.juego.amistad.puntos === 0, 'aunque pasen semanas, el osito se queda');

  console.log('\n4) Al volver, se recuperan en el mismo orden');
  for (const d of ['2026-12-10', '2026-12-11', '2026-12-12']) r = await terminar(abrir(d));
  ok(r.personaje === 'conejo' && r.estado.juego.amistad.puntos === 3 && !r.estado.juego.casa['amigo-ardilla'], 'con 3 días de práctica vuelve el conejo; la ardilla ya no está pegada', [r.personaje, r.estado.juego.amistad]);

  console.log('\n5) Los mapas se ahorran');
  api = abrir('2026-12-12');
  e = await api.cargar();
  /* 20-nov-2026: el lago completo, con sus 30 stickers, y la fogatita que sirve sopa */
  const delLago = e.catalogo.tienda.filter(t => t.mapa === 'lago' && t.tipo !== 'mapa');
  ok(delLago.length === 30 && delLago.every(t => t.precio >= 60 && t.precio <= 250 && t.tam > 0 && (!t.mejora || (t.mejora.precio >= 60 && t.mejora.precio <= 250))), 'el lago tiene sus 30 stickers, con precios y mejoras de 60 a 250', delLago.length);
  const fogatita = delLago.find(t => t.id === 'lago-fogatita-olla');
  ok(fogatita && fogatita.mejora && fogatita.mejora.regalo === 'sopa' && fogatita.mejora.uso === 8, 'la fogatita mejorada sirve una sopa por 8');
  const lago = e.catalogo.tienda.find(t => t.id === 'mapa-lago'), canoa = e.catalogo.tienda.find(t => t.id === 'lago-canoa');
  ok(lago && lago.tipo === 'mapa' && lago.precio === 900 && canoa.mapa === 'lago' && canoa.precio === 250 && canoa.tam > 0, 'la tienda trae el mapa del lago (900) y sus stickers');
  ok(await falla(api.comprar('mapa-lago'), /Te faltan \d+ malvaviscos/), 'con lo de unos días de práctica no alcanza para el mapa');
  api = abrir('2026-12-12', '&malvaviscos=3000');   // solo en la prueba: malvaviscos para probar las compras caras
  ok(await falla(api.comprar('lago-canoa'), /Primero consigue ese mapa/), 'los stickers de un mapa no se compran sin el mapa');
  r = await api.comprar('mapa-lago');
  ok(r.estado.juego.malvaviscos === 2100 && r.estado.juego.inventario.includes('mapa-lago'), 'comprar el mapa descuenta 900', r.estado.juego.malvaviscos);
  r = await api.comprar('lago-canoa');
  ok(r.estado.juego.malvaviscos === 1850, 'con el mapa ya se compran sus stickers');
  r = await api.guardarCasa({ 'lago-canoa': { x: 60, y: 60, s: 1, z: 1, e: 'lago' }, 'amigo-conejo': { x: 30, y: 70, s: 1, z: 2, e: 'lago' }, 'amigo-osito': { x: 50, y: 50, s: 1, z: 1 } });
  ok(r.estado.juego.casa['lago-canoa'].e === 'lago' && r.estado.juego.casa['amigo-conejo'].e === 'lago' && !r.estado.juego.casa['amigo-osito'].e, 'un sticker o un amigo se pega en el mapa o en la casita');
  ok(await falla(api.guardarCasa({ 'lago-canoa': { x: 60, y: 60, s: 1, z: 1, e: 'picnic' } }), /no tienes ese mapa/), 'no se pega en un mapa que no tiene');
  ok(await falla(api.guardarCasa({ 'mapa-lago': { x: 60, y: 60, s: 1, z: 1 } }), /bandeja/), 'el mapa mismo no es un sticker');

  console.log('\n6) Mejoras y regalos');
  e = await api.cargar();
  ok(e.catalogo.tienda.find(t => t.id === 'tetera').mejora.precio === 200 && !e.catalogo.tienda.find(t => t.id === 'sillon').mejora, 'la tienda dice qué stickers se pueden mejorar y cuánto cuesta');
  ok(await falla(api.mejorar('tetera'), /Primero cómpralo/), 'no se mejora algo que no compró');
  ok(await falla(api.mejorar('sillon'), /no se puede mejorar/), 'el sillón no tiene mejora');
  await api.comprar('tetera'); await api.comprar('piano-madera');
  const antes = (await api.cargar()).juego.malvaviscos;
  r = await api.mejorar('tetera');
  ok(r.estado.juego.malvaviscos === antes - 200 && r.estado.juego.mejoras.join() === 'tetera', 'mejorar la estufa cuesta 200 y queda mejorada');
  ok(await falla(api.mejorar('tetera'), /Ya lo mejoraste/), 'no se mejora dos veces');
  ok(await falla(api.usar('olla-chocolate'), /Primero mejóralo/), 'una olla sin mejorar no prepara nada');
  ok(await falla(api.usar('piano-madera'), /no prepara nada/), 'el piano no prepara regalos');
  r = await api.usar('tetera');
  ok(r.regalo === 'galletas' && r.estado.juego.despensa.galletas === 1 && r.estado.juego.malvaviscos === antes - 210, 'hornear galletas cuesta 10 y quedan en la despensa');
  ok(await falla(api.dar('galletas', 'raton'), /no está de visita/), 'no se le dan a un amigo que no está');
  ok(await falla(api.dar('cacao', 'conejo'), /No tienes/), 'no se da lo que no tiene');
  r = await api.dar('galletas', 'conejo');
  ok(!r.estado.juego.despensa.galletas, 'al dárselas al conejo, las galletas desaparecen');
  for (let i = 0; i < 9; i++) await api.usar('tetera');
  ok(await falla(api.usar('tetera'), /muchos/), 'no se guardan más de 9 sin dar');
  const g = JSON.parse(guardado['bosque-demo']);
  ok(g.extras.mejoras.join() === 'tetera' && g.extras.amistad === 3, 'las mejoras y la amistad se guardan en «extras», como en el servidor', g.extras);

  console.log('\n9) Pasar de lección con 70 % (17-nov-2026: la dueña lo bajó de 80), igual que el servidor');
  const libre = () => {   // la versión libre (sin clave), con su memoria vacía: ahí la regla la aplica la app
    const window = { Leccion: { GUIA: Array.from({ length: 61 }, (_, i) => ['Tema ' + i, 'Objetivo ' + i]) } }, mem = {};
    const ctx = { window, URLSearchParams, setTimeout, Date, JSON, Math, Number, String, Object, Promise, Error, console,
      location: { search: '?dia=' + dia(2), pathname: '/' }, history: { replaceState() { } },
      localStorage: { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); } } };
    vm.createContext(ctx); vm.runInContext(codigo, ctx);
    return window.Api;
  };
  const con = async (aciertos, intentos) => { const a = libre(); await a.cargar(); return (await a.practica({ tipo: 'notas', aciertos, intentos }, true)).avance; };
  const justo = await con(7, 10), casi = await con(13, 19);
  ok(justo && justo.pct === 70 && justo.paso === true, 'con 70 % justo pasa de lección', justo);
  ok(casi && casi.pct === 68 && casi.paso === false, 'con 68 % todavía no', casi);
  const textoApp = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  ok(/const PCT_PASAR = 70;/.test(textoApp) && !/\b80 %/.test(textoApp), 'los mensajes de la app dicen 70 % y ninguno dice 80 %');

  console.log(`\n${pasos - fallos}/${pasos} comprobaciones bien` + (fallos ? ` · ${fallos} FALLARON` : ''));
  process.exit(fallos ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
