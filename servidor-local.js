// Servidor local para probar la app: node servidor-local.js  →  http://localhost:8020/?demo=1
const http = require('http'), fs = require('fs'), path = require('path');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.webp': 'image/webp', '.png': 'image/png', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.svg': 'image/svg+xml' };
http.createServer((req, res) => {
  const ruta = decodeURIComponent(req.url.split('?')[0]);
  const archivo = path.join(__dirname, ruta === '/' ? 'index.html' : ruta);
  if (!archivo.startsWith(__dirname) || !fs.existsSync(archivo) || fs.statSync(archivo).isDirectory()) { res.writeHead(404); return res.end('no'); }
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(archivo).pipe(res);
}).listen(8020, () => console.log('http://localhost:8020/?demo=1'));
