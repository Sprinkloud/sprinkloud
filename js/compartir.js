/* Compartir logros y la casita: una tarjeta de 1080×1920 (tamaño historia de Instagram) dibujada en canvas.
   Sale por el menú de compartir del celular (WhatsApp, Instagram...). Si el navegador no puede, se descarga la imagen
   y se ofrece el texto para WhatsApp. Las historias de Instagram no se abren directo desde una web: se sube la imagen. */
window.Compartir = (function () {
  'use strict';
  const W = 1080, H = 1920;
  const cargar = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });

  async function lienzo(dibujar) {
    await document.fonts.ready;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    // papel de acuarela con manchas suaves
    g.fillStyle = '#F6F0E2'; g.fillRect(0, 0, W, H);
    [[200, 260, 520, '#C4923A', .12], [900, 1500, 620, '#647745', .14], [540, 1000, 700, '#B0685A', .06]].forEach(([x, y, r, col, a]) => {
      const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, hexA(col, a)); gr.addColorStop(1, hexA(col, 0)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    });
    g.textAlign = 'center'; g.fillStyle = '#3A3128';
    g.font = '600 64px Caveat, cursive'; g.fillStyle = '#9C6F22'; g.fillText('El bosque de', W / 2, 150);
    g.font = '700 92px Fraunces, Georgia, serif'; g.fillStyle = '#48592F'; g.fillText('Sprinkloud', W / 2, 250);
    await dibujar(g);
    const logo = await cargar('assets/logo-sprinkloud.png');
    if (logo) { const h = 120, w = logo.width * h / logo.height; g.drawImage(logo, W / 2 - w / 2, H - 200, w, h); }
    return c;
  }
  function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }
  /* un círculo de papel con su doble aro; pintar(g) dibuja adentro (ya recortado al círculo) */
  function marco(g, x, y, r, pintar) {
    g.save(); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.closePath(); g.fillStyle = '#FFFDF8'; g.fill(); g.clip();
    pintar(g);
    g.restore();
    g.lineWidth = 16; g.strokeStyle = '#FFFDF8'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 6; g.strokeStyle = '#C4923A'; g.beginPath(); g.arc(x, y, r + 11, 0, Math.PI * 2); g.stroke();
  }
  /* un botón esponjoso como los de la app (.puff en app.css, a escala de la tarjeta): el borde oscuro abajo y la cara
     acolchada encima, con su brillo arriba a la izquierda y su sombra abajo a la derecha. x es el centro; y, el borde de arriba */
  function puffBoton(g, x, y, w, h, color, borde, texto, fuente) {
    const r = 64, alto = 18, x0 = x - w / 2;
    g.save(); g.shadowColor = 'rgba(58, 40, 20, .45)'; g.shadowBlur = 36; g.shadowOffsetY = 26;
    roundRect(g, x0, y + alto, w, h, r); g.fillStyle = borde; g.fill(); g.restore();
    g.save(); roundRect(g, x0, y, w, h, r); g.clip();
    g.fillStyle = color; g.fillRect(x0, y, w, h);
    const brillo = g.createRadialGradient(x0 + w * .3, y + h * .15, 0, x0 + w * .3, y + h * .15, w * .6);
    brillo.addColorStop(0, 'rgba(255, 255, 255, .42)'); brillo.addColorStop(.55, 'rgba(255, 255, 255, 0)');
    g.fillStyle = brillo; g.fillRect(x0, y, w, h);
    const hondo = g.createRadialGradient(x0 + w * .7, y + h * 1.1, 0, x0 + w * .7, y + h * 1.1, w * .7);
    hondo.addColorStop(0, 'rgba(0, 0, 0, .14)'); hondo.addColorStop(.6, 'rgba(0, 0, 0, 0)');
    g.fillStyle = hondo; g.fillRect(x0, y, w, h);
    g.fillStyle = 'rgba(0, 0, 0, .10)'; g.fillRect(x0, y + h - 8, w, 8);
    g.fillStyle = 'rgba(255, 255, 255, .45)'; g.fillRect(x0, y, w, 5);
    g.restore();
    g.font = fuente; g.fillStyle = '#FFFDF5'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(texto, x, y + h / 2 + 4, w - 80); g.textBaseline = 'alphabetic';
  }
  /* el dibujo sin su margen transparente (los stickers traen mucho aire alrededor y se veían chiquitos en la tarjeta) */
  function recortado(img) {
    if (!img) return null;
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const h = c.getContext('2d'); h.drawImage(img, 0, 0);
    let px; try { px = h.getImageData(0, 0, c.width, c.height).data; } catch (e) { return img; }
    let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (px[(y * c.width + x) * 4 + 3] > 12) {
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    if (x1 < 0) return img;
    const r = document.createElement('canvas'); r.width = x1 - x0 + 1; r.height = y1 - y0 + 1;
    r.getContext('2d').drawImage(c, x0, y0, r.width, r.height, 0, 0, r.width, r.height);
    return r;
  }
  function redondo(g, img, x, y, r, enfoque) {
    marco(g, x, y, r, g => { if (img) { const k = Math.max(2 * r / img.width, 2 * r / img.height) * 1.15; g.drawImage(img, x - img.width * k / 2, y - img.height * k * (enfoque || .4), img.width * k, img.height * k); } });
  }
  function textos(g, titulo, sub, y) {
    g.textAlign = 'center';
    g.font = '700 84px Fraunces, Georgia, serif'; g.fillStyle = '#3A3128';
    partir(g, titulo, 900).forEach((l, i) => g.fillText(l, W / 2, y + i * 96));
    if (sub) { g.font = '600 70px Caveat, cursive'; g.fillStyle = '#E8742A'; g.fillText(sub, W / 2, y + partir(g, titulo, 900).length * 96 + 40); }
  }
  function partir(g, t, max) {
    const ps = t.split(' '), out = []; let l = '';
    ps.forEach(p => { const x = l ? l + ' ' + p : p; if (g.measureText(x).width > max && l) { out.push(l); l = p; } else l = x; });
    out.push(l); return out;
  }
  async function enviar(canvas, texto, nombre) {
    const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', .9));
    const archivo = new File([blob], nombre + '.jpg', { type: 'image/jpeg' });
    try {
      if (navigator.canShare && navigator.canShare({ files: [archivo] })) { await navigator.share({ files: [archivo], text: texto }); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    // sin menú de compartir: se descarga la imagen y se abre WhatsApp con el texto
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre + '.jpg'; document.body.append(a); a.click(); a.remove();
    setTimeout(() => window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank', 'noopener'), 600);
  }

  const RETRATO = id => 'assets/ilustraciones/' + (id === 'osito' ? 'osito-bosque' : id) + '.webp';
  return {
    /* la tarjeta de la racha (26-nov-2026, la dueña: «visualmente limpio, sin explicaciones, sin más objetos, solo una
       imagen limpia y pocas letras», como la pantalla final): papel liso, UNA imagen grande (d.img: lo que logró hoy; o
       d.svg: la fogata), «¡Increíble, Lena!» y dos botones esponjosos.
       Revisión de proporciones (skill impeccable, 26-nov): todo va como UN grupo centrado en la zona segura de las historias
       de Instagram (250 px libres arriba y abajo: ahí van el perfil y la barra de «Enviar mensaje»), con las mismas
       separaciones sea cual sea la forma del dibujo; la imagen llena su caja (860×640) aunque sea ancha. */
    async dia(estado, ganados, nombre, d) {
      await document.fonts.ready;
      const j = estado.juego, c = document.createElement('canvas'); c.width = W; c.height = H;
      const g = c.getContext('2d'), X = W / 2;
      g.fillStyle = '#F6F0E2'; g.fillRect(0, 0, W, H);
      const src = d && d.img ? d.img : 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(((d && d.svg) || '').replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" '));
      const img = recortado(await cargar(src));
      const k = img ? Math.min(820 / img.width, 640 / img.height) : 0, iw = img ? img.width * k : 0, ih = img ? img.height * k : 0;
      /* «¡Increíble, Lena!» (la dueña, 26-nov); la palabra cambia con los días para que cada tarjeta se vea nueva */
      const palabra = ['¡Increíble', '¡Genial', '¡Bravo', '¡Imparable', '¡Excelente'][j.racha % 5];
      const frase = nombre ? palabra + ', ' + nombre + '!' : palabra + '!';
      let t = 124; g.font = '700 ' + t + 'px Fraunces, Georgia, serif';
      while (g.measureText(frase).width > 900 && t > 70) { t -= 4; g.font = '700 ' + t + 'px Fraunces, Georgia, serif'; }
      /* el grupo: imagen · 80 · frase (alto de su letra) · 80 · botón · 48 · botón (cada botón: 160 + su borde de 18) */
      const BOTON = 160, BORDE = 18, ANCHO = 820, SEP = 80, ENTRE = 48;
      const alto = ih + (ih ? SEP : 0) + t + SEP + (BOTON + BORDE) * 2 + ENTRE;
      let y = 250 + Math.max(0, (H - 500 - alto) / 2);
      if (img) { g.drawImage(img, X - iw / 2, y, iw, ih); y += ih + SEP; }
      g.textAlign = 'center'; g.fillStyle = '#3A3128'; g.fillText(frase, X, y + t * .8); y += t + SEP;
      /* los botones esponjosos de la pantalla final (la dueña: «me gustan… déjalos en la captura»), los dos del mismo ancho
         («que nada se vea desproporcionado»): el rosa con el fuego y el número de la racha («se entiende que es una racha
         sin explicación») y el verde con el nombre del bosque */
      puffBoton(g, X, y, ANCHO, BOTON, '#A15A4D', '#7E4338', '🔥 ' + j.racha, '800 88px "Nunito Sans", system-ui, sans-serif'); y += BOTON + BORDE + ENTRE;
      puffBoton(g, X, y, ANCHO, BOTON, '#647745', '#48592F', '🌲 El bosque de Sprinkloud', '800 62px "Nunito Sans", system-ui, sans-serif');
      enviar(c, '🔥 ' + j.racha + (j.racha === 1 ? ' día' : ' días seguidos') + ' practicando música en el bosque de Sprinkloud 🎶', 'mi-racha');
    },
    async insignia(estado, id, nombre) {
      const c = await lienzo(async g => {
        g.save(); g.translate(W / 2, 720);
        const gr = g.createRadialGradient(-80, -90, 20, 0, 0, 330); gr.addColorStop(0, '#FFF6DA'); gr.addColorStop(.55, '#F1E0BC'); gr.addColorStop(1, '#C4923A');
        g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 300, 0, Math.PI * 2); g.fill();
        g.lineWidth = 18; g.strokeStyle = '#FFFDF8'; g.stroke(); g.lineWidth = 8; g.strokeStyle = '#C4923A'; g.beginPath(); g.arc(0, 0, 322, 0, Math.PI * 2); g.stroke();
        g.font = '260px serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(({ primera: '🌱', racha3: '🔥', racha7: '🪵', racha14: '🌟', racha30: '👑', perfecta: '💯', aciertos100: '🎯', aciertos500: '🏆', dias10: '🍄', dias30: '🌳', compra: '🛍️', casa5: '🏡' })[id] || '⭐', 0, 10);
        g.restore(); g.textBaseline = 'alphabetic';
        textos(g, '¡Gané una insignia!', nombre, 1200);
      });
      enviar(c, '¡Gané la insignia «' + nombre + '» en el bosque de Sprinkloud! 🏅🎶', 'mi-insignia');
    },
    async amigo(estado, id, nombre) {
      const img = await cargar(RETRATO(id));
      const c = await lienzo(async g => { redondo(g, img, W / 2, 720, 330, .3); textos(g, '¡Llegó un amigo a mi bosque!', nombre, 1200); });
      enviar(c, '¡' + nombre + ' llegó a mi bosque de Sprinkloud por practicar música! 🌲🎶', 'mi-amigo');
    },
    /* pagina: la página del álbum que se comparte ({id, nombre, img}); sin ella, la casita */
    async casa(estado, POS, EMOJI, IMAGENES, tamBase, pagina) {
      const pg = pagina || { id: 'casa', img: 'assets/ilustraciones/casa-vacia.webp' };
      const fondo = await cargar(pg.img);
      const c = await lienzo(async g => {
        const x0 = 60, y0 = 330, w = W - 120, h = w;   // la casa vista desde arriba es cuadrada
        g.save(); roundRect(g, x0, y0, w, h, 48); g.clip(); if (fondo) g.drawImage(fondo, x0, y0, w, h);
        const casa = estado.juego.casa;
        for (const id of Object.keys(casa).filter(id => (casa[id].e || 'casa') === pg.id).sort((a, b) => casa[a].z - casa[b].z)) {
          const k = casa[id], s = w * tamBase(id, pg.id) * k.s / 100, cx = x0 + w * k.x / 100, cy = y0 + h * k.y / 100;
          g.save(); g.translate(cx, cy); if (k.f) g.scale(-1, 1);
          const im = IMAGENES.has(id) ? await cargar('assets/arte/' + id + '.webp') : null;
          if (im) g.drawImage(im, -s / 2, -s / 2, s, s);
          else { g.font = (s * .8) + 'px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(EMOJI[id] || '✨', 0, 0); }
          g.restore();
        }
        g.restore(); g.textBaseline = 'alphabetic';
        g.lineWidth = 14; g.strokeStyle = '#FFFDF8'; roundRect(g, x0, y0, w, h, 48); g.stroke();
        textos(g, pg.id === 'casa' ? 'La casita de mi osito' : pg.nombre + ' de mi bosque', '🔥 ' + estado.juego.racha + ' días · 🏅 ' + estado.juego.insignias.length + ' insignias', y0 + h + 120);
      });
      enviar(c, '¡Mira la casita que decoré en el bosque de Sprinkloud practicando música! 🏡🎶', 'mi-casita');
    }
  };
  function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
})();
