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
  function redondo(g, img, x, y, r, enfoque) {
    g.save(); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.closePath(); g.fillStyle = '#FFFDF8'; g.fill(); g.clip();
    if (img) { const k = Math.max(2 * r / img.width, 2 * r / img.height) * 1.15; g.drawImage(img, x - img.width * k / 2, y - img.height * k * (enfoque || .4), img.width * k, img.height * k); }
    g.restore();
    g.lineWidth = 16; g.strokeStyle = '#FFFDF8'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 6; g.strokeStyle = '#C4923A'; g.beginPath(); g.arc(x, y, r + 11, 0, Math.PI * 2); g.stroke();
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
    async dia(estado, ganados) {
      const j = estado.juego, osito = await cargar(RETRATO('osito'));
      const c = await lienzo(async g => {
        redondo(g, osito, W / 2, 720, 330, .42);
        textos(g, '¡Terminé mi práctica de hoy!', '🔥 ' + j.racha + (j.racha === 1 ? ' día' : ' días seguidos') + '  ·  🍡 +' + ganados, 1180);
        g.font = '600 60px Caveat, cursive'; g.fillStyle = '#6D6152'; g.fillText((estado.leccion ? estado.leccion.nivel + ' · ' + estado.leccion.tema : ''), W / 2, 1460);
      });
      enviar(c, '¡Terminé mi práctica de música de hoy en el bosque de Sprinkloud! 🔥 ' + j.racha + ' días seguidos 🎶', 'mi-practica');
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
    async casa(estado, POS, EMOJI, IMAGENES, tamBase) {
      const fondo = await cargar('assets/ilustraciones/casa-vacia.webp');
      const c = await lienzo(async g => {
        const x0 = 60, y0 = 330, w = W - 120, h = w;   // la casa vista desde arriba es cuadrada
        g.save(); roundRect(g, x0, y0, w, h, 48); g.clip(); if (fondo) g.drawImage(fondo, x0, y0, w, h);
        const casa = estado.juego.casa;
        for (const id of Object.keys(casa).sort((a, b) => casa[a].z - casa[b].z)) {
          const k = casa[id], s = w * tamBase(id) * k.s / 100, cx = x0 + w * k.x / 100, cy = y0 + h * k.y / 100;
          g.save(); g.translate(cx, cy); if (k.f) g.scale(-1, 1);
          const im = IMAGENES.has(id) ? await cargar('assets/arte/' + id + '.webp') : null;
          if (im) g.drawImage(im, -s / 2, -s / 2, s, s);
          else { g.font = (s * .8) + 'px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(EMOJI[id] || '✨', 0, 0); }
          g.restore();
        }
        g.restore(); g.textBaseline = 'alphabetic';
        g.lineWidth = 14; g.strokeStyle = '#FFFDF8'; roundRect(g, x0, y0, w, h, 48); g.stroke();
        textos(g, 'La casita de mi osito', '🔥 ' + estado.juego.racha + ' días · 🏅 ' + estado.juego.insignias.length + ' insignias', y0 + h + 120);
      });
      enviar(c, '¡Mira la casita que decoré en el bosque de Sprinkloud practicando música! 🏡🎶', 'mi-casita');
    }
  };
  function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
})();
