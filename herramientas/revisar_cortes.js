/* Revisión de textos cortados (7-nov): una alumna vio preguntas con el texto cortado en el celular.
   Se pega en Playwright (browser_run_code, archivo) con el servidor local en http://localhost:8020 y la ventana del
   tamaño de un celular (360x780 o 320x568). Hace la práctica de muchas lecciones respondiendo sola y la prueba de nivel,
   y en cada paso busca texto que no se ve entero:
   - que se sale de la pantalla por los costados;
   - que lo tapa un contenedor con overflow hidden/clip (no cuenta lo que se ve bajando con scroll);
   - un elemento con texto más ancho por dentro que por fuera (scrollWidth > clientWidth) que no se puede correr.
   Devuelve la lista de hallazgos (pantalla, clase y texto). */
async (page) => {
  const hallazgos = [], errores = [];
  page.on('pageerror', e => errores.push(String(e.stack || e.message).slice(0, 600)));
  page.on('console', m => { if (m.type() === 'error') errores.push('consola: ' + m.text().slice(0, 300)); });   // 7-nov: también los errores de la consola
  const revisar = async donde => {
    const r = await page.evaluate(() => {
      const malos = [], W = innerWidth;
      const visible = e => { const s = getComputedStyle(e); const b = e.getBoundingClientRect(); return s.visibility !== 'hidden' && s.display !== 'none' && Number(s.opacity) > 0.05 && b.width > 0 && b.height > 0; };
      const nombre = e => '<' + e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? ' .' + e.className.trim().split(/\s+/).join('.') : '') + '>';
      const conTexto = [...document.querySelectorAll('body *')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && visible(e));
      for (const e of conTexto) {
        if (e.closest('svg') || e.closest('dialog:not([open]),.pantalla:not(.activa), [hidden], .lomo-titulo, .lector-barra h2')) continue;
        const t = e.textContent.trim().replace(/\s+/g, ' ').slice(0, 70);
        const b = e.getBoundingClientRect();
        if (b.right > W + 1 || b.left < -1) { malos.push('SE SALE ' + nombre(e) + ' (' + Math.round(b.left) + '…' + Math.round(b.right) + ' de ' + W + '): ' + t); continue; }
        const s = getComputedStyle(e);
        if (e.scrollWidth > e.clientWidth + 2 && s.overflowX !== 'auto' && s.overflowX !== 'scroll' && s.display !== 'inline') { malos.push('MÁS ANCHO ' + nombre(e) + ' (' + e.scrollWidth + ' > ' + e.clientWidth + '): ' + t); continue; }
        for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) {
          const sa = getComputedStyle(a);
          const ox = sa.overflowX, oy = sa.overflowY;
          const ab = a.getBoundingClientRect();
          const cortaX = (ox === 'hidden' || ox === 'clip') && (b.left < ab.left - 1 || b.right > ab.right + 1);
          const cortaY = (oy === 'hidden' || oy === 'clip') && (b.top < ab.top - 1 || b.bottom > ab.bottom + 1);
          if (cortaX || cortaY) { malos.push('TAPADO ' + nombre(e) + ' por ' + nombre(a) + ': ' + t); break; }
        }
      }
      return malos;
    });
    r.forEach(x => hallazgos.push(donde + ' → ' + x));
  };
  const tocar = async sel => { const l = page.locator(sel).first(); if (await l.count()) { await l.click({ force: true }).catch(() => { }); return true; } return false; };
  const practicar = async (semana, ins) => {
    await page.goto('http://localhost:8020/?demo=1&semana=' + semana + '&ins=' + ins);
    await page.evaluate(() => { localStorage.removeItem('bosque-demo'); localStorage.removeItem('bosque-hoy'); });
    await page.reload(); await page.waitForTimeout(700);
    await tocar('text=/Entrar al bosque/'); await page.waitForTimeout(1200);
    await tocar('text=/Empezar desde la lección 1/'); await page.waitForTimeout(800);
    await tocar('[aria-label="Practicar"]'); await page.waitForTimeout(1500);
    for (let paso = 0; paso < 140; paso++) {
      if (await page.locator('#fin.activa').count()) break;
      await revisar(ins + ' lección ' + semana + ' paso ' + paso);
      const d = page.locator('dialog.lh[open] .lh-cerrar');
      if (await d.count()) { await d.click({ force: true }).catch(() => { }); await page.waitForTimeout(500); continue; }
      if (await tocar('.escenario .puff:has-text("Ahora tú")')) { await page.waitForTimeout(500); continue; }
      if (await page.locator('.escenario.ejemplo').count()) { await page.waitForTimeout(600); continue; }
      if (await tocar('.escenario .puff:has-text("Seguir")')) { await page.waitForTimeout(800); continue; }
      if (await tocar('.escenario .puff:has-text("Revisar")')) { await page.waitForTimeout(800); continue; }
      if (await page.locator('.escenario .tambor').count()) { for (let k = 0; k < 10; k++) { await tocar('.escenario .tambor'); await page.waitForTimeout(300); } continue; }
      if (await page.locator('.escenario .tecla').count() && !(await page.locator('.escenario .respuestas-juego .puff').count())) { await tocar('.escenario .tecla >> nth=3'); await page.waitForTimeout(700); continue; }
      if (await tocar('.escenario .respuestas-juego .puff:not([disabled])')) { await page.waitForTimeout(900); continue; }
      if (await tocar('.escenario .puff:not([disabled])')) { await page.waitForTimeout(900); continue; }
      if (await tocar('.escenario .hoja-papel button:not([disabled])')) { await page.waitForTimeout(200); continue; }
      await page.waitForTimeout(800);
    }
  };
  // la prueba de nivel: contesta siempre la primera opción (llega lejos o se corta pronto, según el orden)
  const soloLecciones = typeof process !== 'undefined' && process.env && process.env.LECCIONES;
  for (let vuelta = 0; vuelta < (soloLecciones ? 0 : 3); vuelta++) {
    await page.goto('http://localhost:8020/?demo=1&encuesta'); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(800);
    await tocar('text=/Entrar al bosque/'); await page.waitForTimeout(1000);
    for (let k = 0; k < 25; k++) {
      await revisar('prueba de nivel ' + vuelta + ' pregunta ' + k);
      if (!(await tocar('.respuestas-encuesta .puff >> nth=' + (vuelta % 2)))) { await tocar('.acciones-encuesta .puff'); }
      await page.waitForTimeout(900);
    }
  }
  const lecciones = soloLecciones ? soloLecciones.split(',').map(Number) : [];
  /* INS=piano,violin (7-nov): también el violín; por defecto, piano (el bosque es de piano para todos) */
  const instrumentos = (process.env.INS || 'piano').split(',');
  for (const s of lecciones) for (const ins of instrumentos) await practicar(s, ins);
  return { hallazgos: [...new Set(hallazgos.map(h => h.replace(/ paso \d+| pregunta \d+/, '')))].slice(0, 80), errores: [...new Set(errores)].slice(0, 20) };
}
