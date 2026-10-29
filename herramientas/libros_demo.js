/* Arma los libros de la biblioteca para probar la app sin servidor (?demo=1): demo-libros/<instrumento>-<etapa>.json,
   con la misma forma que devuelve apiLibro_ en Registro_Sprinkloud/maestros/Código.js.
   Los libros se venden en Amazon: demo-libros/ está en .gitignore y NUNCA se sube a GitHub.
   Uso: node herramientas/libros_demo.js   (después de correr Libro_Sprinkloud/herramientas/lecciones_maestros.js) */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const MAESTROS = path.join(__dirname, '..', '..', 'Registro_Sprinkloud', 'maestros');
const DESTINO = path.join(__dirname, '..', 'demo-libros');
const ctx = {};
vm.createContext(ctx);
for (const f of fs.readdirSync(MAESTROS).filter(f => /^Libro.*\.js$/.test(f))) {
  // const → var: así las tablas quedan a la vista en el contexto
  vm.runInContext(fs.readFileSync(path.join(MAESTROS, f), 'utf8').replace(/^const /gm, 'var '), ctx);
}
const LIBROS = Object.keys(ctx.LIBRO_BOSQUE.piano).length;   // 7 desde el 29-oct (los modos griegos)
const tablas = Array.from({ length: LIBROS }, (_, i) => ctx['LIBRO_IMG_' + (i + 1)]);
fs.mkdirSync(DESTINO, { recursive: true });
let total = 0;
for (const ins of ['piano', 'violin']) {   // la app usa los de piano por ahora; los de violín quedan para el bosque de violín
  for (let n = 1; n <= LIBROS; n++) {
    const libro = ctx.LIBRO_BOSQUE[ins][n], imgs = {};
    const paginas = libro.paginas.map(pg => {
      let html = pg.html;
      if (pg.semana) html = ctx.LIBRO_HTML[ins][pg.semana].html.replace(/<div class="practica">[\s\S]*?<\/div>\s*(?=<div class="logro">)/, '');
      (html.match(/data-img="[^"]+"/g) || []).forEach(x => {
        const rel = x.slice(10, -1);
        if (!imgs[rel]) tablas.forEach(t => { if (t[rel]) imgs[rel] = t[rel]; });
      });
      return { id: pg.id, titulo: pg.titulo, semana: pg.semana || 0, html };
    });
    const json = JSON.stringify({ etapa: n, nombre: libro.nombre, instrumento: ins, alumno: 'Amiga', css: ctx.LIBRO_CSS, paginas, imgs });
    fs.writeFileSync(path.join(DESTINO, `${ins}-${n}.json`), json);
    total += json.length;
  }
}
console.log(`${LIBROS * 2} libros (${Math.round(total / 1024)} KB) → ${DESTINO}`);
