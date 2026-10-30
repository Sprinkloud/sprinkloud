/* Revisión de textos sueltos (30-oct): la dueña vio «null», números chicos y palabras sueltas en la pantalla.
   Este recorrido se pega en Playwright (browser_run_code) con el servidor local en http://localhost:8020: entra al bosque
   en modo de prueba, hace la práctica de varias lecciones respondiendo solo, abre la casita, la tienda, la biblioteca y
   un libro, y en cada paso busca textos que no deberían verse:
   - «null», «undefined», «NaN», «[object …]»;
   - texto suelto colgado directo de una pantalla, del body o de #app (sin un elemento que lo contenga).
   Devuelve la lista de hallazgos con la pantalla y el texto. */
async (page) => {
  const hallazgos = [], errores = [];
  page.on('pageerror', e => errores.push(String(e.message).slice(0, 200)));
  page.on('console', m => { if (m.type() === 'error') errores.push(m.text().slice(0, 200)); });
  const revisar = async donde => {
    const r = await page.evaluate(() => {
      const malos = [];
      const visible = n => { const e = n.parentElement; if (!e) return false; const s = getComputedStyle(e); const b = e.getBoundingClientRect(); return s.visibility !== 'hidden' && s.display !== 'none' && Number(s.opacity) > 0.05 && b.width > 0 && b.height > 0; };
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) {
        const t = n.textContent.trim();
        if (!t || !visible(n)) continue;
        const p = n.parentElement;
        if (/\b(null|undefined|NaN)\b|\[object/.test(t)) malos.push('RARO en <' + p.tagName.toLowerCase() + ' class="' + p.className + '">: ' + t.slice(0, 80));
        else if (p === document.body || p.id === 'app' || p.classList.contains('pantalla') || p.classList.contains('escenario') || p.classList.contains('barra') || p.classList.contains('nav'))
          malos.push('SUELTO en <' + p.tagName.toLowerCase() + ' id="' + p.id + '" class="' + p.className + '">: ' + t.slice(0, 80));
      }
      return malos;
    });
    r.forEach(x => hallazgos.push(donde + ' → ' + x));
  };
  const tocar = async (sel, opts) => { const l = page.locator(sel).first(); if (await l.count()) { await l.click({ force: true, ...opts }).catch(() => { }); return true; } return false; };
  /* responde una actividad: espera que termine el ejemplo y toca botones de respuesta hasta que aparezca otra cosa */
  const practicar = async semana => {
    await page.goto('http://localhost:8020/?demo=1&semana=' + semana);
    await page.evaluate(() => { localStorage.removeItem('bosque-demo'); localStorage.removeItem('bosque-hoy'); });
    await page.reload(); await page.waitForTimeout(700);
    await tocar('text=/Entrar al bosque/'); await page.waitForTimeout(1200);
    await revisar('camino ' + semana);
    await tocar('[aria-label="Practicar"]'); await page.waitForTimeout(1500);
    for (let paso = 0; paso < 120; paso++) {
      if (await page.locator('#fin.activa').count()) break;
      await revisar('práctica ' + semana + ' paso ' + paso);
      if (await tocar('.escenario .puff:has-text("Ahora tú")')) { await page.waitForTimeout(500); continue; }
      if (await page.locator('.escenario.ejemplo').count()) { await page.waitForTimeout(600); continue; }
      if (await tocar('.escenario .puff:has-text("Seguir")')) { await page.waitForTimeout(800); continue; }
      if (await tocar('.escenario .puff:has-text("Revisar")')) { await page.waitForTimeout(800); continue; }
      // tambor: tocar varias veces
      if (await page.locator('.escenario .tambor').count()) { for (let k = 0; k < 10; k++) { await tocar('.escenario .tambor'); await page.waitForTimeout(300); } continue; }
      // teclado: tocar una tecla
      if (await page.locator('.escenario .tecla').count() && !(await page.locator('.escenario .respuestas-juego .puff').count())) { await tocar('.escenario .tecla >> nth=3'); await page.waitForTimeout(700); continue; }
      // voz: se salta (cerrar con el botón de seguir si lo hay)
      if (await tocar('.escenario .respuestas-juego .puff:not([disabled])')) { await page.waitForTimeout(900); continue; }
      if (await tocar('.escenario .puff:not([disabled])')) { await page.waitForTimeout(900); continue; }
      // la hoja: elegir la primera opción de cada pregunta
      if (await tocar('.escenario .hoja-papel button:not([disabled])')) { await page.waitForTimeout(200); continue; }
      await page.waitForTimeout(800);
    }
    await revisar('fin ' + semana);
  };
  for (const s of [1, 5, 9, 16, 21, 28, 33, 36, 40, 44, 50, 54]) await practicar(s);
  // casita, tienda, biblioteca y un libro
  await page.goto('http://localhost:8020/?demo=1&semana=20'); await page.waitForTimeout(700);
  await tocar('text=/Entrar al bosque/'); await page.waitForTimeout(1200);
  await tocar('[aria-label="Mi casita"]'); await page.waitForTimeout(1000); await revisar('casita');
  await tocar('.casa-acciones .puff:has-text("Tienda")'); await page.waitForTimeout(1000); await revisar('tienda');
  await page.goBack().catch(() => { });
  await page.goto('http://localhost:8020/?demo=1&semana=20'); await page.waitForTimeout(700);
  await tocar('text=/Entrar al bosque/'); await page.waitForTimeout(1200);
  await tocar('[aria-label="Biblioteca"]'); await page.waitForTimeout(1000); await revisar('biblioteca');
  await tocar('.lomo:not(.cerrado)'); await page.waitForTimeout(2500); await revisar('libro hoja 1');
  for (let k = 0; k < 6; k++) { await tocar('[aria-label="Página siguiente"]'); await page.waitForTimeout(500); await revisar('libro hoja ' + (k + 2)); }
  return { hallazgos: [...new Set(hallazgos)].slice(0, 60), errores: [...new Set(errores)].slice(0, 20) };
}
