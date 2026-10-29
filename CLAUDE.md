# CLAUDE.md: App_Bosque («El bosque de Sprinkloud»)

La app nueva de Sprinkloud (desde el 28 de octubre de 2026). Reemplaza a la app vieja de violín (App_Sprinkloud), que se descartó: se hizo desde cero.

Es la **práctica diaria como juego**, con forma de cuento en acuarela:
- un camino por el bosque (una parada por lección);
- la práctica de hoy (3 o 4 actividades de la lección);
- la **fogata** es la racha de días;
- los **malvaviscos** son las monedas;
- la **casita del osito** se decora con lo que se compra en la tienda;
- hay insignias y amigos del bosque que llegan con los días de práctica;
- se comparten logros por WhatsApp o Instagram.

## Decisiones de la dueña
- **Entrar:** el alumno entra con su **enlace secreto**, que el maestro manda por WhatsApp (`?k=<clave>`). La clave queda guardada en el celular y se borra de la barra de direcciones.
- **Una sola app por lección:** todo lo de la lección vive aquí: lectura de notas, ritmo, oído, la hoja de práctica (ya no se imprime) y la lectura en voz alta.
- **Sin apuro:** el alumno entra cuando quiera. Mientras el maestro no pase a la siguiente lección (botones Anterior/Siguiente de su panel), la app sigue con la misma lección, con ejercicios nuevos cada día.
- **Sílabas de ritmo:** ta, ti-ti (las de la guía y los libros).
- **Lo que ve el maestro:** solo la racha 🔥 de cada alumno. El mensaje de tareas lleva solo el enlace al bosque.
- **Publicación:** **publicada el 29-oct-2026**, en GitHub Pages (`Sprinkloud/sprinkloud`, rama `main`, https://sprinkloud.github.io/sprinkloud/). Eso es lo que usa `URL_BOSQUE` en el servidor.
  - Esta carpeta es el clon del repo: basta con `git push` y Pages se actualiza en 1 o 2 minutos.
  - La app vieja de violín queda en la etiqueta `app-vieja`.
  - **No se publica sin su «upload».**

## Stack
- Estático, sin build: `index.html`, `css/app.css` y scripts clásicos en `js/`.
- Librerías desde jsDelivr con SRI: VexFlow 4.2.2, Howler 2.2.4 y canvas-confetti 1.9.4. La CSP está en un `<meta>`, porque GitHub Pages no deja poner encabezados.
- **Backend:** la web app de `Registro_Sprinkloud/maestros/`, sección 9 de su `Código.js`. Guarda en la hoja del sistema (hojas «Juego» y «Práctica diaria», y la clave `Tipo: Alumno` en «Enlaces»).
  - Todo lo que vale algo se calcula en el servidor: racha, leña, malvaviscos (con tope de 150 por día), precios, insignias y amigos.
  - Las pruebas están en `Registro_Sprinkloud/pruebas/juego_test.js`.

## Comandos
```bash
node servidor-local.js                        # http://localhost:8020/?demo=1
python herramientas/copiar_motores.py         # vuelve a copiar los ejercicios del sitio (página_Sprinkloud/practica)
```
**Modo de prueba `?demo=1`:** las mismas reglas del servidor, guardadas en el navegador, sin tocar datos reales. Se combina con `&semana=9&ins=piano&dia=2026-11-03` para elegir la lección, el instrumento y el día.

## Archivos
| Archivo | Qué hace |
|---|---|
| `js/config.js` | URL de la API (el despliegue de maestros), la música de fondo y el jingle |
| `js/api.js` | GET `?api=juego&k=` y POST `text/plain` (`practicaJuego`, `comprarJuego`, `guardarCasa`), más el modo de prueba |
| `js/actividades.js` | Las actividades y el plan del día (ver abajo) |
| `js/app.js` | Pantallas: entrada, camino, práctica, fin, casita, tienda y logros, más el cajón de premios |
| `js/compartir.js` | Tarjeta de 1080×1920 en canvas → `navigator.share({files})`; si no se puede, descarga + `wa.me` |
| `js/sonido.js` | Sonidos sintetizados (toque, acierto que sube de tono con la racha, error suave, moneda, fuego, página) y la música |
| `js/arte.js` | Lista de los dibujos de `assets/arte/` que ya existen (los demás se ven como emoji) |
| `js/motores/*.js` | **GENERADOS** por `herramientas/copiar_motores.py` desde el sitio: `hoja.js`, `lectura.js`, `ritmo.js`, `oido.js` y `leccion.js`. No se editan a mano |
| `manifest.json`, `assets/icono-*.png` | Instalable en la pantalla de inicio |

## La práctica de hoy (`Actividades.plan`)
- **Semilla:** `hash(alumno | fecha del servidor | semana)`, así cambia a medianoche y es la misma todo el día. «Practicar más» usa otra vuelta de la semilla y da la mitad de malvaviscos.
- **Las actividades, en orden:**
  1. **La de la lección**, según la columna «App para practicar» de la guía:
     - `notas`: 10 notas, solo las aprendidas (`notasPiano`/`notasViolin`). Se responde con botones Do…Si.
     - `ritmo`: 5 dictados de un compás con 3 opciones dibujadas con sus sílabas. Si la lección tiene una sola figura (lección 1), se usa **marcar el pulso** con el tambor (2 rondas de 8).
     - `oido:modo[:nivel]`: 6 preguntas.
  2. **La hoja de práctica**, con las preguntas de `ejerciciosDe`. Se revisa con «✓ Revisar» y muestra las soluciones. No la tienen las lecciones 1, 38, 40, 43, 45 y 48.
  3. **Lectura en voz alta** (`lectura.js`, con micrófono): desde la semana 8 y solo si el navegador reconoce voz. Si se cierra sin resultado, se salta.
  4. **Repaso:** la actividad de una lección anterior al azar.
- **Ejemplo:** cada actividad empieza con uno (etiqueta «Mira 👀»): el osito responde una pregunta y aparece «¡Ahora tú!».
- **Al guardar:** cada actividad se manda al servidor al terminar. La última va con `terminada: true`, que aviva la fogata.
- **Si sale a la mitad:** el avance del día se guarda en `localStorage['bosque-hoy']`, para seguir donde quedó.

## Diseño
- `DESIGN.md` manda: tokens de acuarela heredados de la app vieja, botones esponjosos, día y noche según la hora real, y movimiento de Emil Kowalski.
- Cuando se cambie algo visual, correr `/impeccable audit`. Para cualquier animación, usar la skill `review-animations`.

## La casita: casa de muñecas vista desde arriba (idea de la dueña, 29-oct)
- **La casa:** `assets/ilustraciones/casa-vacia.webp`, generada con Gemini (`etapa8.txt`). Es una cabaña de troncos vacía, sin techo, vista desde arriba en diagonal. Tiene sala (el cuarto grande), cocina (piso de baldosas), dormitorio (el cuarto del fondo) y jardín con la fogata afuera.
- **15 lugares** (`LUGARES_CASA` en el servidor; `POS` en `js/app.js` con [x, y, tamaño] en % de la imagen):
  - **sala:** pared, sillón, alfombra, música, mesa;
  - **cocina:** estufa, ventana, mesa, repisa;
  - **dormitorio:** cama, mesita, pared;
  - **jardín:** banca, flores, fogata.
- **Pestañas «Toda la casa · Sala · Cocina · Dormitorio · Jardín»:** la capa (la imagen y los lugares) hace zoom al cuarto (`CUARTOS`: centro y zoom; `encuadre()` no deja que se salga de la casa). Usa 520 ms con ease-in-out y, con movimiento reducido, va sin animación.
  - En «Toda la casa» se ven solo las cosas puestas; tocar una lleva a su cuarto.
  - En un cuarto aparecen los círculos ✨ de ese cuarto.
- **La tienda filtra por cuarto.** Tiene 30 cosas (`TIENDA`): 2 o 3 por lugar.
- La tarjeta para compartir la casita dibuja la misma casa cuadrada.

## Calcomanías (idea de la dueña, 29-oct)
- **Cómo se pegan:** cada compra (una por cosa) queda en la bandeja «Mis calcomanías». Al tocarla, se pega en el cuarto que se está viendo.
  - Se arrastra con el dedo o el mouse: `pointer` con captura, y la posición se calcula sobre la capa ya con zoom.
  - Al tocar una pegada aparecen sus herramientas: −, +, ⇆ (voltear), ▲ (encima), ▼ (debajo) y ↩ (volver a la bandeja).
- **Datos:** `casa = {id: {x, y, s, z, f}}` (posición en %, tamaño, capa, volteada). Se guarda 0,7 s después del último cambio (`guardarCasa_` lo valida en el servidor).
  - El tamaño base sale del lugar de la cosa en `POS` × 1,35.
- **El recorte:** con rembg (IA libre de GitHub, modelo `isnet-general-use`, en `herramientas/arte.py`). Cada dibujo queda con todos sus colores, opaco. El borde blanco de calcomanía lo pone el CSS con `drop-shadow`.

## Música y ambiente por escena (`ESCENAS` en `js/sonido.js`)
| Escena | Qué suena |
|---|---|
| Mapa | Wooden Inn / Forest, una tras otra. De día suenan los pájaros; la fogata crepita siempre (más de noche) |
| Tienda | Bossa nova. Al entrar suena la campanita de la puerta, y al comprar la caja registradora con monedas |
| Casita | Guitarra suave y la chimenea que crepita. Al pegar una calcomanía suena un «pop» |
| Logros | La canción de la casita |
| Práctica | Silencio, porque los ejercicios de oído y ritmo necesitan escuchar |
| Fin | El jingle |

- Las canciones cambian con un fundido (`Sonido.escena`, que llama `ir()` en `app.js`).
- El botón 🎵 apaga la música y el ambiente.

## Revisión de animaciones (`/review-animations`, 29-oct)
Se corrigieron estos puntos:
- **Respiración del botón:** pasó al botón de afuera, porque pisaba el `:active` y los botones principales no se hundían.
- **Arrastre de calcomanías:** con `transform` mientras se arrastra; `left/top` se fijan al soltar.
- **Hover:** `:hover:not(:active)`, para que la presión le gane al hover con mouse.
- **Tiempos:**
  - festejo: 360 ms, con escalones de 70 ms;
  - cambio de pantalla: 260 ms;
  - zoom de la casita: 420 ms.
- **`.btn-icono`:** tiene transición al hundirse (60 ms) y al soltarse (140 ms).
- **Movimiento reducido:** el cajón y el aviso solo se desvanecen.
- **Limpieza:** se borraron las reglas `.lugar`, que no se usaban.
- **Pruebas automáticas:** a los botones que respiran hay que hacerles clic con `{ force: true }` en Playwright, porque nunca están quietos.

## Auditoría `/impeccable audit` (29-oct): 15/20 → corregida
- **Contraste AA:**
  - el ocre lleva letra café (`--ochre-ink`);
  - rosa y cielo usan los tonos `-strong`;
  - la etiqueta de etapa y la racha de día usan `--label-ochre` y `--fire-text`.
- **Teclado:** el cajón lleva el foco adentro, Escape lo cierra y devuelve el foco. Las paradas del camino se abren con Enter o con la barra espaciadora.
- **Calcomanías:**
  - el borde blanco va dibujado en la imagen (`con_borde` en `arte.py`), con una sola sombra de CSS;
  - en «Toda la casa», tocar una acerca la cámara a su cuarto.
- **Pestañas:** de 44 px.
- **Colores:** todos en tokens de `:root`, y la hoja usa `--hoja-*`.
- **Detector:** las excepciones están en `.impeccable/config.json` (papel crema, luces de las luciérnagas). Después de los cambios da 0 antipatrones.

## Segunda auditoría (29-oct): 18/20; se corrigieron los pendientes
- **Calcomanías con teclado:** al enfocarlas se eligen. Las flechas las mueven (Mayús + flecha, 5 %), `+` y `−` cambian el tamaño, y Supr las devuelve a la bandeja. En «Toda la casa», Enter acerca la cámara a su cuarto.
- **«Toda la casa»:** las calcomanías tienen una zona de toque invisible de 14 px extra (`::after`).
- **Arrastre con el dedo:** probado con toques reales de Chrome (CDP `Input.dispatchTouchEvent`). Mueve y guarda, y no corre la página. **Falta probarlo en un iPhone y un Android de verdad.**
- **La página no se corre:** `html, body { overflow: hidden }`, y el mapa centra la parada de hoy moviendo solo su propio scroll (antes `scrollIntoView` corría la página 14 px).

## Arte pendiente (Gemini)
- Hoy, los muebles y las insignias se ven como emoji.
- Las imágenes van en `assets/arte/<id>.webp`, con fondo transparente, y se agregan a `js/arte.js`.
- Ids de los muebles: los de `TIENDA` en el servidor. Ids de las insignias: los de `INSIGNIAS`.
- Los pedidos están en `Libro_Sprinkloud/herramientas/ilustraciones/etapa7.txt`, y se generan con `.\ilustraciones.ps1 7`.
- `herramientas/arte.py` vuelve transparente el papel (`sin_papel`, como «color a alfa», con más cuerpo), recorta cada dibujo al objeto y actualiza `js/arte.js`.
- **29-oct:** 8 de 42 listas (cuadro, guirnalda, reloj, cortinas, maceta, farolito, tetera y calcetines). La tarea diaria de la sesión (10:41) sigue con el resto. Los muebles de piso se piden en vista desde arriba en diagonal, como la casa.
