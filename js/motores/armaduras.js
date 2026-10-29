/* GENERADO por herramientas/copiar_motores.py desde página_Sprinkloud/practica/armaduras.html: no editar a mano. */
window.Armaduras = (function () {
'use strict';
const SOSTENIDOS = ['Fa', 'Do', 'Sol', 'Re', 'La', 'Mi', 'Si'];
const BEMOLES = ['Si', 'Mi', 'La', 'Re', 'Sol', 'Do', 'Fa'];
const MAYORES_S = ['Do', 'Sol', 'Re', 'La', 'Mi', 'Si', 'Fa♯', 'Do♯'], VF_S = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#'];
const MAYORES_B = ['Do', 'Fa', 'Si♭', 'Mi♭', 'La♭', 'Re♭', 'Sol♭', 'Do♭'], VF_B = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];
const MENORES_S = ['La', 'Mi', 'Si', 'Fa♯', 'Do♯', 'Sol♯', 'Re♯', 'La♯'], MENORES_B = ['La', 'Re', 'Sol', 'Do', 'Fa', 'Si♭', 'Mi♭', 'La♭'];
/* la regla para descubrir la tonalidad mayor de una armadura */
function reglaDe(tipo, n) {
  if (n === 0) return 'Sin alteraciones: Do mayor';
  if (tipo === 's') return 'Último sostenido ' + SOSTENIDOS[n - 1] + '♯ + un semitono = ' + MAYORES_S[n] + ' mayor';
  return n === 1 ? 'Un solo bemol: Fa mayor' : 'Penúltimo bemol ' + BEMOLES[n - 2] + '♭ = ' + MAYORES_B[n] + ' mayor';
}
return { SOSTENIDOS, BEMOLES, MAYORES_S, MAYORES_B, MENORES_S, MENORES_B, VF_S, VF_B, reglaDe };
})();
