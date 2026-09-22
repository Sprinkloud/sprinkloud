/**
 * SPRINKLOUD: servidor de la app de violín
 * Google Apps Script + Google Sheets (gratis)
 *
 * Primera vez:
 *   1. Ejecuta la función configurar() (menú de arriba > elegir "configurar" > Ejecutar).
 *   2. Mira la clave de la maestra en "Registro de ejecución".
 *   3. Implementar > Nueva implementación > Aplicación web
 *        Ejecutar como: Yo
 *        Quién tiene acceso: Cualquier usuario
 *   4. Copia la URL que termina en /exec y pégala en index.html (API_URL).
 *
 * Cada vez que cambies este archivo:
 *   Implementar > Gestionar implementaciones > (lápiz) > Versión: Nueva versión > Implementar.
 *   Así la URL no cambia.
 */

const HOJAS = {
  Alumnos: ['id', 'nombre', 'codigo', 'nivel', 'leccion', 'estrellas', 'canciones', 'checks', 'notas', 'creado', 'actualizado'],
  Repertorio: ['id', 'titulo', 'origen', 'porque', 'nivel', 'leccion', 'frases', 'creado', 'actualizado']
};
const COLUMNAS_JSON = ['estrellas', 'canciones', 'checks', 'frases'];
const EDITABLES_ALUMNO = ['nombre', 'nivel', 'leccion', 'estrellas', 'canciones', 'checks', 'notas'];
const EDITABLES_CANCION = ['titulo', 'origen', 'porque', 'nivel', 'leccion', 'frases', 'creado'];
const MAX_CELDA = 45000; // Google Sheets admite 50.000 caracteres por celda

/* ---------- configuración ---------- */

function configurar() {
  const ss = SpreadsheetApp.getActive();
  Object.keys(HOJAS).forEach(function (nombre) {
    const cols = HOJAS[nombre];
    const sh = ss.getSheetByName(nombre) || ss.insertSheet(nombre);
    sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold').setBackground('#DCEBE0');
    sh.setFrozenRows(1);
  });
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('CLAVE_MAESTRA')) props.setProperty('CLAVE_MAESTRA', generarCodigo(8));
  Logger.log('Listo. Clave de la maestra: ' + props.getProperty('CLAVE_MAESTRA'));
}

/** Muestra la clave actual en el registro de ejecución. */
function verClave() {
  Logger.log('Clave de la maestra: ' + PropertiesService.getScriptProperties().getProperty('CLAVE_MAESTRA'));
}

/** Para cambiar la clave: escribe la nueva aquí, guarda y ejecuta esta función. */
function cambiarClave() {
  const nueva = 'escribe-aqui-la-nueva-clave';
  if (nueva.length < 6 || nueva === 'escribe-aqui-la-nueva-clave') throw new Error('Escribe una clave de al menos 6 caracteres en la función cambiarClave.');
  PropertiesService.getScriptProperties().setProperty('CLAVE_MAESTRA', nueva);
  Logger.log('Clave cambiada.');
}

/* ---------- entrada web ---------- */

function doGet() {
  return responder({ ok: true, app: 'Sprinkloud', mensaje: 'El servidor está funcionando.' });
}

function doPost(e) {
  let res;
  try {
    const q = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    res = manejar(q);
  } catch (err) {
    res = { ok: false, error: String((err && err.message) || err) };
  }
  return responder(res);
}

function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function manejar(q) {
  switch (q.accion) {
    case 'alumno': {
      const codigo = String(q.codigo || '').trim().toUpperCase();
      if (!codigo) throw new Error('Escribe tu código.');
      const a = leer('Alumnos').filter(function (x) { return String(x.codigo).toUpperCase() === codigo; })[0];
      if (!a) throw new Error('No encontramos ese código. Pídele tu código a tu maestra.');
      delete a.notas; // las notas de la maestra no se muestran al alumno
      delete a.codigo;
      return { ok: true, alumno: a, repertorio: repertorioComoObjeto() };
    }
    case 'maestra':
      verificar(q.clave);
      return { ok: true, alumnos: leer('Alumnos'), repertorio: repertorioComoObjeto() };

    case 'nuevoAlumno': {
      verificar(q.clave);
      const nombre = String(q.nombre || '').trim().slice(0, 60);
      if (!nombre) throw new Error('Escribe el nombre del alumno.');
      return conCandado(function () {
        const usados = leer('Alumnos').map(function (x) { return String(x.codigo).toUpperCase(); });
        let codigo = generarCodigo(6);
        while (usados.indexOf(codigo) >= 0) codigo = generarCodigo(6);
        const ahora = Date.now();
        const a = { id: 'a' + ahora.toString(36) + generarCodigo(3).toLowerCase(), nombre: nombre, codigo: codigo, nivel: 1, leccion: 1,
          estrellas: {}, canciones: {}, checks: {}, notas: '', creado: ahora, actualizado: ahora };
        agregar('Alumnos', a);
        return { ok: true, alumno: a };
      });
    }
    case 'guardarAlumno':
      verificar(q.clave);
      return conCandado(function () {
        actualizar('Alumnos', q.id, q.cambios || {}, EDITABLES_ALUMNO);
        return { ok: true };
      });

    case 'borrarAlumno':
      verificar(q.clave);
      return conCandado(function () { borrar('Alumnos', q.id); return { ok: true }; });

    case 'guardarCancion':
      verificar(q.clave);
      return conCandado(function () {
        const id = String(q.id || '').slice(0, 80);
        if (!id) throw new Error('Falta el identificador de la canción.');
        const existe = leer('Repertorio').some(function (x) { return x.id === id; });
        if (existe) actualizar('Repertorio', id, q.cancion || {}, EDITABLES_CANCION);
        else {
          const c = { id: id };
          EDITABLES_CANCION.forEach(function (k) { if (q.cancion && k in q.cancion) c[k] = q.cancion[k]; });
          c.creado = c.creado || Date.now(); c.actualizado = Date.now();
          agregar('Repertorio', c);
        }
        return { ok: true };
      });

    case 'borrarCancion':
      verificar(q.clave);
      return conCandado(function () { borrar('Repertorio', q.id); return { ok: true }; });

    default:
      throw new Error('Acción desconocida.');
  }
}

/* ---------- utilidades ---------- */

function verificar(clave) {
  const real = PropertiesService.getScriptProperties().getProperty('CLAVE_MAESTRA');
  if (!real) throw new Error('Falta configurar el servidor: ejecuta configurar() en Apps Script.');
  if (String(clave || '') !== real) throw new Error('La clave de la maestra no es correcta.');
}

function conCandado(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function hoja(nombre) {
  const sh = SpreadsheetApp.getActive().getSheetByName(nombre);
  if (!sh) throw new Error('Falta la hoja "' + nombre + '". Ejecuta configurar() en Apps Script.');
  return sh;
}

function leer(nombre) {
  const cols = HOJAS[nombre];
  const sh = hoja(nombre);
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  const valores = sh.getRange(2, 1, n, cols.length).getValues();
  return valores.filter(function (fila) { return fila[0] !== ''; }).map(function (fila) { return aObjeto(cols, fila); });
}

function aObjeto(cols, fila) {
  const o = {};
  cols.forEach(function (c, i) {
    let v = fila[i];
    if (COLUMNAS_JSON.indexOf(c) >= 0) {
      try { v = v === '' ? (c === 'frases' ? [] : {}) : JSON.parse(v); } catch (e) { v = c === 'frases' ? [] : {}; }
    } else if (c === 'nivel' || c === 'leccion' || c === 'creado' || c === 'actualizado') {
      v = v === '' ? null : Number(v);
    } else {
      v = v === null || v === undefined ? '' : String(v);
    }
    o[c] = v;
  });
  return o;
}

function aFila(cols, o) {
  return cols.map(function (c) {
    let v = o[c];
    if (v === undefined || v === null) return '';
    if (COLUMNAS_JSON.indexOf(c) >= 0) {
      v = JSON.stringify(v);
      if (v.length > MAX_CELDA) throw new Error('El dato "' + c + '" es demasiado grande para guardarlo.');
      return v;
    }
    if (typeof v === 'string') return v.slice(0, MAX_CELDA);
    return v;
  });
}

function filaDe(nombre, id) {
  const sh = hoja(nombre);
  const n = sh.getLastRow() - 1;
  if (n < 1) return -1;
  const ids = sh.getRange(2, 1, n, 1).getValues();
  for (let i = 0; i < ids.length; i++) if (String(ids[i][0]) === String(id)) return i + 2;
  return -1;
}

function agregar(nombre, o) {
  hoja(nombre).appendRow(aFila(HOJAS[nombre], o));
}

function actualizar(nombre, id, cambios, permitidos) {
  const cols = HOJAS[nombre];
  const r = filaDe(nombre, id);
  if (r < 0) throw new Error('No se encontró el registro. Recarga la página.');
  const sh = hoja(nombre);
  const actual = aObjeto(cols, sh.getRange(r, 1, 1, cols.length).getValues()[0]);
  permitidos.forEach(function (k) { if (k in cambios) actual[k] = cambios[k]; });
  actual.actualizado = Date.now();
  sh.getRange(r, 1, 1, cols.length).setValues([aFila(cols, actual)]);
}

function borrar(nombre, id) {
  const r = filaDe(nombre, id);
  if (r > 0) hoja(nombre).deleteRow(r);
}

function repertorioComoObjeto() {
  const o = {};
  leer('Repertorio').forEach(function (c) { o[c.id] = c; });
  return o;
}

function generarCodigo(n) {
  const letras = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < n; i++) s += letras.charAt(Math.floor(Math.random() * letras.length));
  return s;
}
