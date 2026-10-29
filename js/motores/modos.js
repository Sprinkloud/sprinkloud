/* GENERADO por herramientas/copiar_motores.py desde página_Sprinkloud/practica/modos.html: no editar a mano. */
window.Modos = (function () {
'use strict';
const MODOS_G = [
  { n: 'Jónico', blanca: 0, st: [0, 2, 4, 5, 7, 9, 11], car: null, que: 'la escala mayor' },
  { n: 'Eólico', blanca: 5, st: [0, 2, 3, 5, 7, 8, 10], car: 2, que: 'la menor natural: su tercera es menor' },
  { n: 'Mixolidio', blanca: 4, st: [0, 2, 4, 5, 7, 9, 10], car: 6, que: 'mayor con la séptima menor' },
  { n: 'Dórico', blanca: 1, st: [0, 2, 3, 5, 7, 9, 10], car: 5, que: 'menor con la sexta mayor' },
  { n: 'Lidio', blanca: 3, st: [0, 2, 4, 6, 7, 9, 11], car: 3, que: 'mayor con la cuarta aumentada' },
  { n: 'Frigio', blanca: 2, st: [0, 1, 3, 5, 7, 8, 10], car: 1, que: 'menor con la segunda menor' },
  { n: 'Locrio', blanca: 6, st: [0, 1, 3, 5, 6, 8, 10], car: 4, que: 'segunda menor y quinta disminuida' }
];
const BLANCAS_ES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'], BLANCAS_VF = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
/* las 8 notas del modo desde su tecla blanca (claves de VexFlow y nombres) */
function escalaBlanca(m) {
  const claves = [], nombres = [];
  for (let k = 0; k <= 7; k++) { const l = (m.blanca + k) % 7, oct = 4 + Math.floor((m.blanca + k) / 7); claves.push(BLANCAS_VF[l] + '/' + oct); nombres.push(BLANCAS_ES[l]); }
  return { claves, nombres };
}
const ORDINAL = ['1ª', '2ª', '3ª', '4ª', '5ª', '6ª', '7ª'];
return { MODOS_G, BLANCAS_ES, escalaBlanca, ORDINAL };
})();
