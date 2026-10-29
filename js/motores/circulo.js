/* GENERADO por herramientas/copiar_motores.py desde página_Sprinkloud/practica/circulo.html: no editar a mano. */
window.Circulo = (function () {
'use strict';
const C_MAYORES = ['Do', 'Sol', 'Re', 'La', 'Mi', 'Si', 'Fa♯', 'Re♭', 'La♭', 'Mi♭', 'Si♭', 'Fa'];
const C_MENORES = ['Lam', 'Mim', 'Sim', 'Fa♯m', 'Do♯m', 'Sol♯m', 'Re♯m', 'Si♭m', 'Fam', 'Dom', 'Solm', 'Rem'];
const C_ALT = ['0', '1♯', '2♯', '3♯', '4♯', '5♯', '6', '5♭', '4♭', '3♭', '2♭', '1♭'];
const vecina = (i, d) => (i + d + 12) % 12;
/* los 6 acordes de la tonalidad i: la tonalidad y sus dos vecinas (I, IV, V) y sus relativas menores (vi, ii, iii) */
function acordesDe(i) {
  return { mayores: [vecina(i, -1), i, vecina(i, 1)], menores: [vecina(i, -1), i, vecina(i, 1)] };
}
function reglaAcordes(i) {
  return 'I ' + C_MAYORES[i] + ' · IV ' + C_MAYORES[vecina(i, -1)] + ' · V ' + C_MAYORES[vecina(i, 1)] +
    ' · ii ' + C_MENORES[vecina(i, -1)] + ' · iii ' + C_MENORES[vecina(i, 1)] + ' · vi ' + C_MENORES[i];
}
/* las tonalidades por las que se pregunta: sin Do (está fijo arriba) y sin Fa♯ ni Re♭, cuyos acordes cruzan Fa♯ / Sol♭
   y obligarían a hablar de enarmónicos */
const PREGUNTABLES = [1, 2, 3, 4, 5, 8, 9, 10, 11];
function altTexto(i) {
  if (i === 0) return 'sin alteraciones';
  if (i === 6) return '6 sostenidos (o 6 bemoles)';
  const n = parseInt(C_ALT[i], 10), s = C_ALT[i].includes('♯');
  return n + (s ? ' sostenido' : ' bemol') + (n > 1 ? (s ? 's' : 'es') : '');
}
return { C_MAYORES, C_MENORES, C_ALT, vecina, acordesDe, reglaAcordes, PREGUNTABLES, altTexto };
})();
