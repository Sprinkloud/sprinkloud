/* Arma los libros de la biblioteca para probar la app sin servidor (?demo=1): demo-libros/<instrumento>-<etapa>.json,
   con la misma forma que devuelve apiLibro_ en Registro_Sprinkloud/maestros/Código.js.
   Los libros se venden en Amazon: demo-libros/ está en .gitignore y NUNCA se sube a GitHub.
   Desde el 12-nov-2026 los libros salen de Libro_Sprinkloud/datos-app (los mismos que se suben a la hoja de libros), y el CSS de
   maestros/LibroIndice.js.
   Uso: node herramientas/libros_demo.js   (después de correr Libro_Sprinkloud/herramientas/lecciones_maestros.js) */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const MAESTROS = path.join(__dirname, '..', '..', 'Registro_Sprinkloud', 'maestros');
const DATOS = path.join(__dirname, '..', '..', 'Libro_Sprinkloud', 'datos-app');
const DESTINO = path.join(__dirname, '..', 'demo-libros');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(MAESTROS, 'LibroIndice.js'), 'utf8').replace(/^const /gm, 'var '), ctx);
const LIBROS = Object.keys(ctx.LIBRO_NOMBRES.piano).length;   // 7 desde el 29-oct (los modos griegos)
fs.mkdirSync(DESTINO, { recursive: true });
let total = 0;
for (const ins of ['piano', 'violin']) {   // la app usa los de piano por ahora; los de violín quedan para el bosque de violín
  for (let n = 1; n <= LIBROS; n++) {
    const libro = JSON.parse(fs.readFileSync(path.join(DATOS, `libro-${ins}-${n}.json`), 'utf8')), imgs = {};
    const paginas = libro.paginas.map(pg => {
      let html = pg.html;
      if (pg.semana) html = libro.lecciones[pg.semana].html.replace(/\s*<h3>Ejercicios<\/h3>[\s\S]*$/, '</div>');   // igual que apiLibro_: solo teoría (8-nov-2026)
      (html.match(/data-img="[^"]+"/g) || []).forEach(x => { const rel = x.slice(10, -1); if (libro.imgs[rel]) imgs[rel] = libro.imgs[rel]; });
      return { id: pg.id, titulo: pg.titulo, semana: pg.semana || 0, html };
    });
    const json = JSON.stringify({ etapa: n, nombre: libro.nombre, instrumento: ins, alumno: 'Amiga', css: ctx.LIBRO_CSS, paginas, imgs });
    fs.writeFileSync(path.join(DESTINO, `${ins}-${n}.json`), json);
    total += json.length;
  }
}
console.log(`${LIBROS * 2} libros (${Math.round(total / 1024)} KB) → ${DESTINO}`);
