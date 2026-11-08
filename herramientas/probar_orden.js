/* Prueba del 7-nov: en la lección 33 (armaduras), ordenar los sostenidos poniendo dos al revés; al final se corrige.
   Y en la lección 21 (clave de fa) la lectura en voz alta abre sin error y cabe en 320 px.
   Uso: node herramientas/correr_revision.js herramientas/probar_orden.js 320x640 */
async (page) => {
  const errores = [], out = {};
  page.on('pageerror', e => errores.push(String(e.message).slice(0, 200)));
  const fs = require('fs'), dir = process.env.TEMP + '/claude';
  await page.goto('http://localhost:8020/?demo=1&semana=33&ins=piano');
  await page.evaluate(() => { localStorage.clear(); }); await page.reload(); await page.waitForTimeout(800);
  await page.locator('text=/Entrar al bosque/').first().click({ force: true }); await page.waitForTimeout(1200);
  const empezar1 = page.locator('text=/Empezar desde la lección 1/'); if (await empezar1.count()) { await empezar1.first().click({ force: true }); await page.waitForTimeout(800); }
  await page.locator('[aria-label="Practicar"]').first().click({ force: true });
  await page.locator('.escenario .puff:has-text("Ahora tú")').waitFor({ timeout: 20000 });
  await page.locator('.escenario .puff:has-text("Ahora tú")').click({ force: true });
  await page.waitForTimeout(500);
  await page.screenshot({ path: dir + '/orden-antes.png' }); out.botones = await page.$$eval('.respuestas-juego .puff', bs => bs.map(b => b.dataset.op || b.innerText)); out.consigna = await page.textContent('.consigna');
  const bemol = out.botones.some(b => b.includes('♭'));
  const orden = await page.evaluate(b => (b ? window.Armaduras.BEMOLES : window.Armaduras.SOSTENIDOS).map(x => x + (b ? '♭' : '♯')), bemol);
  const toca = async t => page.locator('.respuestas-juego .puff[data-op="' + t + '"]').click({ force: true, timeout: 3000 }).catch(() => out.falta = t);
  // pone las dos primeras al revés
  for (const t of [orden[1], orden[0], ...orden.slice(2)]) { await toca(t); await page.waitForTimeout(150); }
  await page.waitForTimeout(400);
  out.lugares = await page.$$eval('.lugar-orden', ls => ls.map(l => l.className.replace('lugar-orden', '').trim() + ':' + l.innerText.replace(/\n/g, '/')));
  out.mensaje = await page.textContent('.mensaje');
  await page.screenshot({ path: dir + '/orden-320.png' });
  // lectura en clave de fa (lección 21)
  await page.goto('http://localhost:8020/?demo=1&semana=21&ins=piano');
  await page.evaluate(() => { localStorage.clear(); }); await page.reload(); await page.waitForTimeout(800);
  await page.evaluate(() => window.SprinkloudLectura.abrir({ clave: 'bass', notas: ['f/2', 'g/2', 'a/2', 'b/2', 'c/3', 'd/3'] }));
  await page.waitForTimeout(800);
  out.dialogo = await page.$eval('dialog.lh', d => { const b = d.getBoundingClientRect(); return Math.round(b.left) + '…' + Math.round(b.right) + ' de ' + innerWidth; });
  await page.screenshot({ path: dir + '/lectura-320.png' });
  out.errores = errores;
  return out;
}
