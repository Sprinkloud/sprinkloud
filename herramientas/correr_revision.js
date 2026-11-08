/* Corre una revisión de Playwright (revisar_cortes.js o revisar_textos.js) con Chrome propio, sin el MCP.
   Uso: node herramientas/correr_revision.js herramientas/revisar_cortes.js 360x780 [lecciones separadas por coma]
   Usa playwright-core de Libro_Sprinkloud y el Chrome instalado. Necesita el servidor local (node servidor-local.js). */
const path = require('path'), fs = require('fs');
const { chromium } = require(path.join(__dirname, '..', '..', 'Libro_Sprinkloud', 'node_modules', 'playwright-core'));
(async () => {
  const [archivo, tam = '360x780', lecciones] = process.argv.slice(2);
  const [w, h] = tam.split('x').map(Number);
  if (lecciones) process.env.LECCIONES = lecciones;   // y INS=piano,violin en el entorno para los dos instrumentos
  const navegador = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await navegador.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true });
  const fn = eval('(' + fs.readFileSync(archivo, 'utf8').replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '') + ')');
  try { console.log(JSON.stringify(await fn(page), null, 1)); } finally { await navegador.close(); }
})();
