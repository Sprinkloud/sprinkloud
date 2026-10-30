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
  amazon: 'https://www.amazon.com/s?k=' + encodeURIComponent('Aprendo música con Sprinkloud') + '&i=digital-text',
  sitio: 'https://sprinkloud.vercel.app'
};
/* Jingle del festejo al terminar la práctica (CC0) */
window.BOSQUE_JINGLE = 'assets/musica/festejo.mp3';
