/* El álbum en varios tamaños de pantalla, con un Chrome propio (no usa el navegador que la dueña está mirando):
   la cámara (lupa, deslizar, pellizco), el modo de jugar (tocar = acción; solo los amigos se mueven), el lápiz (mover)
   y que nada espere al servidor (se prueba con un servidor que tarda 2,5 s en cada pedido).
   Con el servidor local en 8020: `node herramientas/probar_camara.js`. Usa playwright-core de Libro_Sprinkloud. */
const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', 'Libro_Sprinkloud', 'node_modules', 'playwright-core'));
const TAMANOS = [[320, 640], [390, 844], [768, 1024], [1280, 720]];
let fallos = 0, pasos = 0;
const ok = (c, msg, extra) => { pasos++; if (!c) { fallos++; console.log('  ✗ ' + msg, extra !== undefined ? JSON.stringify(extra).slice(0, 300) : ''); } else console.log('  ✓ ' + msg); };

(async () => {
  const navegador = await chromium.launch({ channel: 'chrome', headless: true });
  for (const [w, h] of TAMANOS) {
    console.log('\n' + w + ' × ' + h);
    const ctx = await navegador.newContext({ viewport: { width: w, height: h }, hasTouch: w < 700 });
    const pag = await ctx.newPage();
    const errores = [];
    pag.on('pageerror', e => errores.push(e.message));
    pag.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });
    await pag.goto('http://localhost:8020/?demo=1&malvaviscos=3000&amistad=14');
    await pag.waitForSelector('#entrada .puff'); await pag.click('#entrada .puff', { force: true });
    await pag.waitForSelector('#camino.activa'); await pag.waitForTimeout(400);
    /* se compran unas cosas por el motor de la app, para tener qué tocar: el piano y la estufa mejorados, el reloj sin mejorar */
    await pag.evaluate(async () => { for (const id of ['piano-madera', 'sillon', 'tetera', 'reloj-cuco', 'mapa-lago', 'lago-canoa']) await window.Api.comprar(id); await window.Api.mejorar('piano-madera'); await window.Api.mejorar('tetera'); });
    await pag.reload(); await pag.click('#entrada .puff', { force: true }); await pag.waitForSelector('#camino.activa'); await pag.waitForTimeout(400);
    await pag.evaluate(() => [...document.querySelectorAll('#camino button')].find(b => b.textContent.includes('🏡')).click());
    await pag.waitForSelector('#casita.activa'); await pag.waitForTimeout(500);
    const r = await pag.evaluate(async () => {
      const espera = ms => new Promise(x => setTimeout(x, ms));
      const pe = (el, tipo, x, y, id) => el.dispatchEvent(new PointerEvent(tipo, { bubbles: true, clientX: x, clientY: y, pointerId: id || 1, isPrimary: (id || 1) === 1, pointerType: 'touch' }));
      const centro = b => { const q = b.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; };
      const calco = id => [...document.querySelectorAll('.calco')].find(b => b.dataset.id === id);
      const toque = b => { const [x, y] = centro(b); pe(b, 'pointerdown', x, y); pe(b, 'pointerup', x, y); b.click(); };
      const arrastra = (b, dx, dy) => { const [x, y] = centro(b); pe(b, 'pointerdown', x, y); for (let i = 1; i <= 4; i++) pe(b, 'pointermove', x + dx * i / 4, y + dy * i / 4); pe(b, 'pointerup', x + dx, y + dy); b.click(); };
      const cam = () => document.querySelector('.casa-capa').style.transform;
      const pos = id => calco(id).style.left + ' ' + calco(id).style.top;
      const anim = id => calco(id).querySelector('.calco-arte').getAnimations().length;
      const dinero = () => Number(document.querySelector('.pantalla.activa .cabecera .num').textContent);
      const sale = () => { const ancho = document.documentElement.clientWidth, mal = []; document.querySelectorAll('#casita *').forEach(e => { if (e.closest('.casa-capa, .paginas-album, .bandeja-fila')) return; const q = e.getBoundingClientRect(); if (q.width && (q.right > ancho + 1 || q.left < -1)) mal.push(e.className); }); return mal; };
      const chicos = () => [...document.querySelectorAll('#casita button')].filter(b => !b.closest('.casa-capa') && !b.hidden && b.offsetParent && (b.getBoundingClientRect().height < 43.5 || b.getBoundingClientRect().width < 43.5)).map(b => b.getAttribute('aria-label') || b.textContent);
      const o = {};
      o.pestanas = document.querySelectorAll('#casita .cuartos').length;
      o.controles = [...document.querySelectorAll('.controles-album button')].map(b => b.getAttribute('aria-label'));
      o.miniaturas = [...document.querySelectorAll('.pagina-album img')].map(i => i.getAttribute('src').split('/').pop());
      // pegar: un amigo no enciende el lápiz; una cosa sí
      const ficha = id => [...document.querySelectorAll('.calco-bandeja')].find(b => b.dataset.id === id);
      const lapiz = document.querySelector('.lapiz');
      ficha('amigo-osito').click(); await espera(150); o.lapizTrasAmigo = lapiz.getAttribute('aria-pressed');
      ficha('piano-madera').click(); await espera(150); o.lapizTrasCosa = lapiz.getAttribute('aria-pressed'); o.elegidaTrasCosa = (document.querySelector('.calco.elegida') || { dataset: {} }).dataset.id;
      o.saleConHerramientas = sale(); o.chicos = chicos();
      for (const id of ['sillon', 'tetera', 'reloj-cuco']) { ficha(id).click(); await espera(120); }
      arrastra(calco('sillon'), -60, 40); arrastra(calco('amigo-osito'), 50, -50); arrastra(calco('tetera'), 60, 50); arrastra(calco('reloj-cuco'), -50, -50); await espera(100);
      lapiz.click(); await espera(100); o.lapizApagado = lapiz.getAttribute('aria-pressed') + ' · elegidas ' + document.querySelectorAll('.calco.elegida').length;
      // jugar, con la cámara como se abre: una cosa sin mejorar muestra solo una estrella con su precio (sin cajón)
      toque(calco('reloj-cuco')); await espera(150);
      o.estrella = [...document.querySelectorAll('.chispa')].map(c => c.textContent).join('|') + ' · cajones ' + document.querySelectorAll('.cajon').length + ' · elegidas ' + document.querySelectorAll('.calco.elegida').length;
      // tocar el piano lo hace sonar y no lo elige
      toque(calco('piano-madera')); await espera(250); o.pianoToca = anim('piano-madera') + ' · elegidas ' + document.querySelectorAll('.calco.elegida').length;
      await espera(2600);
      // la cámara
      const c1 = cam(); document.querySelector('[aria-label="Acercar"]').click(); await espera(350); o.lupa = c1 + ' → ' + cam();
      const lienzo = document.querySelector('.casa-arriba'), q = lienzo.getBoundingClientRect(), cx = q.x + q.width / 2, cy = q.y + q.height / 2, img = document.querySelector('.casa-capa > img');
      let c0 = cam(); arrastra(img, -40, -30); o.desliza = cam() !== c0;
      let p0 = pos('piano-madera'); c0 = cam(); arrastra(calco('piano-madera'), 30, 20); o.pianoQuieto = pos('piano-madera') === p0; o.camaraSigue = cam() !== c0; o.pianoCallado = anim('piano-madera') === 0;
      p0 = pos('amigo-osito'); c0 = cam(); arrastra(calco('amigo-osito'), -20, 20); o.ositoSeMueve = pos('amigo-osito') !== p0; o.camaraQuieta = cam() === c0;
      c0 = cam(); pe(img, 'pointerdown', cx - 30, cy, 1); pe(img, 'pointerdown', cx + 30, cy, 2);
      for (let i = 1; i <= 4; i++) { pe(img, 'pointermove', cx - 30 - i * 6, cy, 1); pe(img, 'pointermove', cx + 30 + i * 6, cy, 2); }
      pe(img, 'pointerup', cx - 54, cy, 1); pe(img, 'pointerup', cx + 54, cy, 2); o.pellizco = c0 + ' → ' + cam();
      o.sale = sale(); o.alto = document.querySelector('#casita').scrollHeight + '/' + document.querySelector('#casita').clientHeight;
      await espera(1200);   // lo movido ya se guardó
      // con cinco calcomanías pegadas llega la insignia «Casita decorada»: se cierra su cajón antes de seguir
      for (let i = 0; i < 4; i++) { const g = [...document.querySelectorAll('.cajon .puff')].find(b => b.textContent.includes('Genial')); if (!g) break; g.click(); await espera(900); }

      // ---- SIN ESPERAS: el servidor tarda 2,5 s en cada pedido y la app responde igual al instante ----
      const pedidos = [];
      ['comprar', 'mejorar', 'usar', 'dar', 'guardarCasa'].forEach(n => { const f = window.Api[n]; window.Api[n] = (...a) => { pedidos.push(n); return new Promise(x => setTimeout(x, 2500)).then(() => f(...a)); }; });
      const d0 = dinero(), t0 = performance.now();
      toque(calco('tetera'));
      o.hornea = { cobro: d0 - dinero(), bandeja: (document.querySelector('.calco-bandeja.regalo') || { getAttribute: () => '' }).getAttribute('aria-label'), animada: anim('tetera'), ms: Math.round(performance.now() - t0) };
      toque(calco('amigo-osito')); document.querySelector('.calco-bandeja.regalo').click();
      o.da = { regalos: document.querySelectorAll('.calco-bandeja.regalo').length, festeja: anim('amigo-osito'), ms: Math.round(performance.now() - t0) };
      // con el lápiz: mejorar el reloj, también al instante
      lapiz.click(); toque(calco('reloj-cuco')); document.querySelector('.pastilla.mejorar').click(); await espera(450);
      const d1 = dinero(); document.querySelector('.premio.mejora .puff').click();
      o.mejora = { cobro: d1 - dinero(), pastilla: document.querySelectorAll('.pastilla.mejorar').length };
      lapiz.click(); await espera(500);
      // tienda: comprar al instante, y se ve el álbum de vuelta con lo comprado en la bandeja
      [...document.querySelectorAll('#casita .puff')].find(b => b.textContent.includes('Tienda')).click(); await espera(300);
      const tarjeta = n => [...document.querySelectorAll('#tienda .articulo')].find(a => a.querySelector('h3').textContent === n);
      const d2 = dinero(); [...tarjeta('Cojines').querySelectorAll('.puff')].find(b => b.textContent.includes('Comprar')).click();
      o.compra = { cobro: d2 - dinero(), tarjeta: tarjeta('Cojines').querySelector('.tuya') ? tarjeta('Cojines').querySelector('.tuya').textContent : 'sigue en venta' };
      [...document.querySelectorAll('#tienda .puff')].find(b => b.textContent.includes('Ver mi casita')).click(); await espera(300);
      o.enBandeja = !!ficha('cojines'); o.relojSigue = !!calco('reloj-cuco') && !!calco('tetera');
      o.pedidosEnCamino = pedidos.join();
      await espera(2500 * 5 + 1500);   // llegan todas las respuestas, en orden
      const g = JSON.parse(localStorage.getItem('bosque-demo'));
      o.guardado = { pedidos: pedidos.join(), mejoras: g.extras.mejoras.join(), despensa: JSON.stringify(g.extras.despensa || {}), cojines: g.inventario.includes('cojines'), malvaviscos: g.malvaviscos, enPantalla: dinero() };
      // el lago: se ve entero y su cámara es otra
      [...document.querySelectorAll('.pagina-album')].find(b => b.dataset.pagina === 'lago').click(); await espera(400);
      o.lago = cam() + ' · ' + lienzo.isConnected + ' · ' + document.querySelector('.casa-arriba').style.touchAction;
      [...document.querySelectorAll('.pagina-album')].find(b => b.dataset.pagina === 'casa').click(); await espera(400);
      o.casaRecuerda = cam();
      return o;
    });
    ok(r.pestanas === 0 && r.controles.join() === 'Mover las calcomanías,Alejar,Acercar', 'sin etiquetas de cuartos: lápiz y dos lupas', r.controles);
    ok(r.miniaturas.join() === 'casa-vacia-mini.webp,escenario-lago-mini.webp', 'el selector de páginas usa miniaturas', r.miniaturas);
    ok(r.lapizTrasAmigo === 'false' && r.lapizTrasCosa === 'true' && r.elegidaTrasCosa === 'piano-madera', 'pegar un amigo no enciende el lápiz; pegar una cosa sí, y queda elegida', [r.lapizTrasAmigo, r.lapizTrasCosa, r.elegidaTrasCosa]);
    ok(!r.saleConHerramientas.length && !r.chicos.length, 'con las herramientas a la vista nada se sale y los botones miden 44 px o más', [r.saleConHerramientas, r.chicos]);
    ok(r.lapizApagado === 'false · elegidas 0', 'al apagar el lápiz no queda nada elegido', r.lapizApagado);
    ok(/⭐ 120/.test(r.estrella) && / cajones 0 · elegidas 0/.test(r.estrella), 'jugar: una cosa sin mejorar muestra solo una estrella con su precio', r.estrella);
    ok(r.pianoToca === '1 · elegidas 0', 'jugar: tocar el piano lo hace sonar sin elegirlo', r.pianoToca);
    ok(/scale\(1\.95/.test(r.lupa) && r.desliza && /scale\((2|3|4)/.test(r.pellizco), 'la lupa acerca, un dedo desliza y dos dedos acercan más', [r.lupa, r.pellizco]);
    ok(r.pianoQuieto && r.camaraSigue && r.pianoCallado, 'jugar: arrastrar desde el piano desliza la cámara; el piano no se mueve ni suena', [r.pianoQuieto, r.camaraSigue, r.pianoCallado]);
    ok(r.ositoSeMueve && r.camaraQuieta, 'jugar: el osito sí se mueve, y la cámara se queda quieta', [r.ositoSeMueve, r.camaraQuieta]);
    ok(!r.sale.length, 'nada se sale de la pantalla (' + r.alto + ')', r.sale);
    ok(r.hornea.cobro === 10 && r.hornea.bandeja === 'Galletas: 1' && r.hornea.animada === 1 && r.hornea.ms < 150, 'sin esperas: la estufa hornea al instante (' + r.hornea.ms + ' ms) con el servidor a 2,5 s', r.hornea);
    ok(r.da.regalos === 0 && r.da.festeja === 1 && r.da.ms < 250, 'sin esperas: el osito recibe las galletas al instante', r.da);
    ok(r.mejora.cobro === 120 && r.mejora.pastilla === 0, 'sin esperas: mejorar cobra y queda mejorado al instante', r.mejora);
    ok(r.compra.cobro === 25 && /tuya/.test(r.compra.tarjeta) && r.enBandeja && r.relojSigue, 'sin esperas: comprar se ve al instante y la calcomanía ya está en la bandeja', [r.compra, r.enBandeja, r.relojSigue]);
    ok(r.guardado.pedidos === 'usar,dar,mejorar,comprar' || r.guardado.pedidos === 'usar,dar,mejorar,guardarCasa,comprar' || /^usar,dar,(guardarCasa,)?mejorar,(guardarCasa,)?comprar/.test(r.guardado.pedidos), 'los pedidos salen por detrás y en orden', r.guardado.pedidos);
    ok(/tetera/.test(r.guardado.mejoras) && /reloj-cuco/.test(r.guardado.mejoras) && r.guardado.despensa === '{}' && r.guardado.cojines && r.guardado.malvaviscos === r.guardado.enPantalla, 'al llegar las respuestas, lo guardado es igual a lo que se ve', r.guardado);
    ok(/scale\(1\)/.test(r.lago) && /pan-y/.test(r.lago) && /scale\((2|3|4)/.test(r.casaRecuerda), 'el lago se ve entero y la casita recuerda dónde quedó su cámara', [r.lago, r.casaRecuerda]);
    ok(!errores.length, 'sin errores de JavaScript', errores);
    await ctx.close();
  }
  await navegador.close();
  console.log(`\n${pasos - fallos}/${pasos} comprobaciones bien` + (fallos ? ` · ${fallos} FALLARON` : ''));
  process.exit(fallos ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
