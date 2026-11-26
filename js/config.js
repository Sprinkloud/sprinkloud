/* Dónde vive el bosque: la web app del panel del maestro (Registro_Sprinkloud/maestros), que guarda en la hoja del sistema.
   Al cambiar el despliegue de esa web app, se actualiza aquí. */
window.BOSQUE_API = 'https://script.google.com/macros/s/AKfycbyyS3H2cdaXUz9zj1oilSdmsrF6ANcy0zPkGD4NuZZNUMj7QdO8A29pioM-jYNlf7YL/exec';
/* Canción del mapa (CC0, ver CREDITOS.md): un amanecer feliz de primavera (pedido de la dueña, 29-oct). Con una sola,
   suena en bucle. Las de la tienda y la casita están en ESCENAS (js/sonido.js). */
window.BOSQUE_MUSICA = ['assets/musica/amanecer-1.mp3'];
/* Versión libre (30-oct): a dónde llevan las invitaciones del club. Los libros: la búsqueda de la serie en Amazon (cuando
   estén los 7 publicados se puede poner el enlace de la página de la serie). */
window.BOSQUE_CLUB = {
  planes: 'https://wa.me/593987999154?text=' + encodeURIComponent('Hola, probé la app El bosque de Sprinkloud y quiero información sobre los planes del club 🎶'),
  // la app sola venció (30-oct): para renovarla
  renovar: 'https://wa.me/593987999154?text=' + encodeURIComponent('Hola, quiero renovar mi app El bosque de Sprinkloud 🌲'),
  // un ex alumno que quiere volver al club
  volver: 'https://wa.me/593987999154?text=' + encodeURIComponent('Hola, quiero volver al Club musical Sprinkloud 🎶'),
  amazon: 'https://www.amazon.com/s?k=' + encodeURIComponent('Aprendo música con Sprinkloud') + '&i=digital-text',
  sitio: 'https://sprinkloud.vercel.app'
};
/* «Guardar mi progreso con Google» (versión libre): ID de cliente OAuth del proyecto «Bosque Sprinkloud» de Google Cloud
   (cuenta del club). No es secreto. Orígenes autorizados: https://sprinkloud.github.io y http://localhost:8020. El mismo ID
   está en GOOGLE_CLIENT_ID (Registro_Sprinkloud/maestros/Código.js). */
window.BOSQUE_GOOGLE_ID = '219016713423-ut0n7sbdjhepmdhdua98a0mqkc5ndi4n.apps.googleusercontent.com';
/* Jingle del festejo al terminar la práctica (CC0) */
window.BOSQUE_JINGLE = 'assets/musica/festejo.mp3';
/* Modo Navidad (25-nov-2026, pedido de la dueña): entre estas fechas (día del celular), la app usa el osito navideño, nieve,
   botones rojos y verdes, cascabeles en vez del «tic» de los botones, música navideña y el «Jingle Bells» al terminar.
   Para verlo en otra fecha: ?navidad=1 (o ?navidad=0 para apagarlo). La música de cada escena va en `musica` (CC0, ver
   CREDITOS.md); una escena sin pista usa la de siempre. La dueña eligió todas las del 25-nov: una por escena y las demás
   van cambiando en el mapa, una tras otra. */
window.BOSQUE_NAVIDAD = {
  desde: '2026-11-25', hasta: '2027-01-06',
  musica: {
    mapa: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => 'assets/musica/navidad-mapa-' + n + '.mp3'),
    tienda: ['assets/musica/navidad-tienda.mp3'],
    casita: ['assets/musica/navidad-casita.mp3'],
    logros: ['assets/musica/navidad-biblioteca.mp3']
  }
};
(function () {
  const n = window.BOSQUE_NAVIDAD, q = new URLSearchParams(location.search).get('navidad'), d = new Date();
  const hoy = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const si = q === '1' ? true : q === '0' ? false : !!n && hoy >= n.desde && hoy <= n.hasta;
  if (si) document.documentElement.dataset.temporada = 'navidad';
})();
