/* GENERADO por herramientas/copiar_motores.py desde página_Sprinkloud/practica/acordes.html: no editar a mano. */
window.Acordes = (function () {
'use strict';
const LETRAS = ['c', 'd', 'e', 'f', 'g', 'a', 'b'], NOTAS_ES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
const ACORDES = [{ raiz: 0, menor: false }, { raiz: 3, menor: false }, { raiz: 4, menor: false }, { raiz: 1, menor: true }, { raiz: 2, menor: true }, { raiz: 5, menor: true }];
const INVERSIONES = ['Estado fundamental', '1ª inversión', '2ª inversión'];
const nombreAcorde = a => NOTAS_ES[a.raiz] + (a.menor ? 'm' : '');
/* las 3 notas (índices de letra) de abajo hacia arriba, según la inversión */
function notasDe(a, inv) { const n = [a.raiz, (a.raiz + 2) % 7, (a.raiz + 4) % 7]; return n.slice(inv).concat(n.slice(0, inv)); }
const conBarra = (a, inv) => nombreAcorde(a) + (inv ? '/' + NOTAS_ES[notasDe(a, inv)[0]] : '');
/* claves de VexFlow subiendo desde la octava 4 */
function clavesDe(a, inv) {
  let oct = 4, ant = -1;
  return notasDe(a, inv).map(l => { if (l <= ant) oct++; ant = l; return LETRAS[l] + '/' + oct; });
}
function reglaDe(a, inv) {
  const bajo = NOTAS_ES[notasDe(a, inv)[0]], papel = ['la fundamental', 'la tercera', 'la quinta'][inv];
  return 'Abajo está ' + bajo + ', ' + papel + ' de ' + nombreAcorde(a) + ': ' + INVERSIONES[inv].toLowerCase() + (inv ? ' (' + conBarra(a, inv) + ')' : '');
}
return { NOTAS_ES, ACORDES, INVERSIONES, nombreAcorde, notasDe, conBarra, clavesDe, reglaDe };
})();
