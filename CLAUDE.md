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
| `assets/vista-previa-osito.jpg` | Imagen del enlace en WhatsApp, Facebook e Instagram (Open Graph, 1200×630): **el osito original del bosque** (`Libro_Sprinkloud/img/personajes/bear-recorte.jpg`), con los costados del color del papel. Cambiada el 3-nov a pedido de la dueña: el oso de Gemini con la palabra Sprinkloud no se parecía al personaje. El nombre cambió para que WhatsApp no muestre la vieja; en los enlaces ya mandados puede tardar en cambiar |

## El camino
**Tocar una piedra lleva directo a la lección** (pedido de la dueña, 29-oct; antes solo mostraba el nombre y había que buscar «Practicar»):
- la de hoy abre la práctica;
- una pasada abre una práctica de repaso de esa lección (`practicar_(semana)`);
- las futuras muestran el candado.
- **Sin recuadro de foco al tocar:** el navegador dibujaba un cuadro grande alrededor de la piedra, el osito y el halo. Ahora `.parada:focus` no lleva outline, y con teclado (`:focus-visible`) se ve un aro dorado solo en la piedra.

## El oído del osito: lectura en voz alta con Vosk (`js/voz.js`, 29-oct)
- **Por qué:** el reconocimiento de voz del navegador está hecho para frases y se pierde con sílabas sueltas. Con un audio de prueba entendió 4 de 9; Vosk entendió 9 de 9.
- **Qué se usa:**
  - vosk-browser 0.0.8 (Apache-2.0, `assets/voz/vosk.js`);
  - el modelo vosk-model-small-es-0.42 (Apache-2.0, `assets/voz/modelo-es.tar.gz`, 40 MB);
  - una lista cerrada de palabras: do, re, mi, fa, sol, la, si.
- **Cómo carga:**
  - `Voz.preparar(progreso)` baja el modelo contando el avance, con una barra «Preparando el oído del osito…». Así queda en la caché del navegador, y luego `Vosk.createModel(URL)` lo abre.
  - Empieza a bajarse en cuanto arranca una práctica que tiene lectura en voz alta.
  - Tiene límites de tiempo: si no se prepara, la actividad se salta con un mensaje amable y la práctica sigue.
- **Cómo escucha:** `window.BosqueReconocedor` imita a SpeechRecognition, y `motores/lectura.js` lo usa primero (`copiar_motores.py` lo parcha).
- **Ojo con la CSP:** necesita `'wasm-unsafe-eval'` y `'unsafe-eval'` en `script-src`, porque el worker de Vosk usa `new Function`. Sin `'unsafe-eval'` se quedaba colgado sin avisar. También necesita `blob:` en `connect-src` y en `worker-src`.
- **Lo probado:**
  - el modelo dentro de la app, con un audio de la voz de Windows (`prueba-voz.wav`, fuera de git): 9 de 9;
  - **falta probarlo con el micrófono real** (lo prueba la dueña).

## Tamaño en cada pantalla (29-oct)
- **Cada pantalla puede bajar con scroll** (`.pantalla { overflow-y: auto }`) cuando la ventana es más baja que su contenido; antes, en la computadora, la barra de tareas tapaba botones que no se podían alcanzar.
- **Altura mínima** del mapa: 190 px; de la zona de ejercicios: 380 px.
- Probado en 1280×560 y con el celular acostado (740×360): todos los botones se alcanzan.

## Marcar el pulso (tambor)
- **El golpe cuenta al presionar** (`pointerdown`), no al soltar, así que responde al instante.
- **Margen flexible:** un golpe vale si cae a ±220 ms del clic, descontando lo que tarda el sonido en salir del parlante (`S.retraso()` = `outputLatency`), porque se toca cuando se oye (pedido de la dueña, 29-oct).
- **Valen todas las formas de golpear:** tocar el tambor, hacer clic o tocar en cualquier parte del ejercicio, o apretar cualquier tecla. Enter sigue sirviendo para «¡Ahora tú!».
- Al salir con ✕ deja de escuchar el teclado.

## La práctica de hoy (`Actividades.plan`)
- **Semilla:** `hash(alumno | fecha del servidor | semana)`, así cambia a medianoche y es la misma todo el día. «Practicar más» usa otra vuelta de la semilla y da la mitad de malvaviscos.
- **Las actividades, en orden:**
  1. **La de la lección**, según la columna «App para practicar» de la guía:
     - `notas`: 10 notas, solo las aprendidas (`notasPiano`/`notasViolin`). Se responde con botones Do…Si.
     - `ritmo`: 5 dictados de un compás con 3 opciones dibujadas con sus sílabas. Si la lección tiene una sola figura (lección 1), se usa **marcar el pulso** con el tambor (2 rondas de 8).
     - `oido:modo[:nivel]`: 6 preguntas.
  2. **La hoja de práctica**, con las preguntas de `ejerciciosDe`. Para no adivinar (pedido de la dueña, 29-oct):
     - cada ejercicio trae su **primer ítem resuelto** («Ejemplo ✓»), que no cuenta;
     - los de ritmo (sílabas y «¿cuántos pulsos faltan?») traen antes el cuadro **«Las figuras de esta hoja»**, con cada figura, su sílaba y sus pulsos (`leyenda` en `hoja.js`, armado por `copiar_motores.py`).
     Se revisa con «✓ Revisar» y muestra las soluciones. No la tienen las lecciones 1, 38, 40, 43, 45 y 48.
  3. **Lectura en voz alta** (`lectura.js`, con micrófono): desde la semana 8 y solo si el navegador reconoce voz.
     - **El micrófono se pide al abrir y queda encendido** (`microfono: true`, sin botón), para que el ejercicio se haga bien (pedido de la dueña, 29-oct).
     - Si se cierra sin resultado, se salta.
  4. **Repaso:** la actividad de una lección anterior al azar.
- **Corregir los errores** (pedido de la dueña, 29-oct):
  - **Notas, ritmo y oído** (`conCorreccion`): al final de la ronda aparece «¡Corrijamos! ✏️» y vuelven solo las preguntas falladas, hasta acertarlas, con 3 vueltas como máximo.
  - **Hoja:** al revisar, lo bueno queda fijo (`Hoja.fijarBien`) y se corrige lo rojo. La segunda vez aparecen las soluciones y la tercera deja seguir.
  - **Pulso:** si una ronda sale con menos de 6 golpes a tiempo, se repite (hasta 2 veces).
  - Los aciertos que se mandan al servidor son los del **primer intento**.
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

## Ejemplos que suenan en los libros (29-oct, pedido de la dueña; publicado el 29-oct)
- En la biblioteca, debajo del dibujo («Míralo») de cada lección aparece **«Escúchalo»** con botones 🔊 que tocan lo mismo que muestra el dibujo: el pulso, los ritmos (con tambor), las notas, los intervalos, los acordes y sus inversiones, las progresiones, los modos… y el dibujo brilla mientras suena (`ponerEjemplos` en `app.js`).
- Los ejemplos están en `js/ejemplos.js` (`Ejemplos.de(semana, instrumento)` y `Ejemplos.tocar(partitura, Sonido)`), copiados a mano de `Libro_Sprinkloud/plantilla/diagramas.html`: si cambia un dibujo, cambiar también su ejemplo. Escritura: `c4 e4 g4` notas, `c4+e4+g4` acorde, `:2` duración en pulsos, `r` silencio, `x`/`X` clic del pulso, `o` tambor, `@80` tempo, `!p`/`!mf`/`!f` volumen y `&` otra voz a la vez. Las 60 lecciones tienen ejemplos (piano y violín).
- `Sonido.notaEn(t, midi, dur, gain)`: una nota en un momento exacto del reloj de audio.

## Por ahora, el bosque es de piano para todos (29-oct, decisión de la dueña; publicado el 29-oct)
- El bosque usa **el libro y la guía de piano para todos los alumnos**, también los de violín (`BOSQUE_INSTRUMENTO = 'Piano'` en `Registro_Sprinkloud/maestros/Código.js`; en la prueba, `instrumento: 'piano'` y los libros `demo-libros/piano-N.json`). Pronto habrá un bosque de violín: entonces se vuelve a usar el instrumento de cada alumno.
- Biblioteca: cada lomo lleva su número y **una sola palabra** (`PALABRA_LIBRO`: Pulso, Lectura, Ritmo, Acordes, Tonalidad, Expresión, Modos); el nombre completo va en `aria-label` y al abrir el libro. La cinta del libro actual cuelga abajo, sin tapar el número.

## 60 lecciones, 7 etapas y actividades nuevas (29-oct, revisión de la dueña; publicado el 29-oct)
- La guía tiene 60 lecciones en 7 etapas (la 7, los modos griegos: zona lila en el camino y un 7.º libro en la biblioteca, lomo `plum`). `api.js`: `LARGO = [6, 8, 13, 10, 9, 6, 8]`, `APPS` copiado de la columna «App para practicar» de `Guia.js` (se parte también en `armaduras`), hasta 53 en la prueba. `porInstrumento` deja solo la parte del instrumento en los temas «piano / violín» y objetivos «Piano: … Violín: …» (el servidor ya lo hace; esto cubre el modo de prueba). Los motores se volvieron a copiar del sitio.
- **Intervalos en el teclado** (actividad `teclado` en `actividades.js`, 🎹): en piano, las lecciones de intervalos (27, 28 y 29) empiezan con un teclado de Do4 a Sol5: se marca una tecla, pide un intervalo y al tocar cuenta los semitonos con puntitos numerados (verde si acierta, rojo si no). Ejemplo primero y vueltas de corrección como las demás. Siempre claro, como la hoja.
- **Armaduras** (actividad `armadura`, ♯, para `armaduras:sostenidos|bemoles|relativas`): ejemplo animado del orden y después 6 preguntas de varias maneras: ordenar las alteraciones, ¿qué tonalidad?, ¿cuántas? y (en el círculo) la relativa menor, con la regla debajo. Datos copiados del sitio (`js/motores/armaduras.js`).
- **Rondas de elegir** (`rondaElegir` en `actividades.js`): ejemplo resuelto, botones esponjosos, la regla debajo y vuelta de corrección. Las usan:
  - **círculo** (🧭, lección 42): el V, el IV, la relativa, las alteraciones y «¿qué acorde NO es?», con un círculo chiquito marcado;
  - **acordes** (🎶, lección 36): inversión, nombre y barra, con el acorde en el pentagrama y su sonido;
  - **modos** (🌈, lecciones 53 a 60, `modos:N`): ¿qué modo es?, nota característica y de oído, solo con los aprendidos;
  - **palabras** (📖): un día sí y otro no desde la lección 7, con las palabras hasta la etapa del alumno.
  Los datos vienen del sitio (`js/motores/circulo.js`, `acordes.js`, `modos.js` y `palabras.js`, copiados por `copiar_motores.py`).
- **Repaso con más temas complejos:** en el repaso diario, las lecciones de intervalos, armaduras, mayor o menor y triadas valen 3 veces (pedido de la dueña: se repasan bastante y de varias maneras).
- **Los 4 botones del camino son solo dibujos** (🏡 ▶ 🧺 📚, pedido de la dueña): el nombre queda en `aria-label` y `title`.

## Biblioteca (antes «Logros», pedido de la dueña, 29-oct)
- **El estante:** un libro por etapa (6), con lomos de colores sobre una repisa de madera. Se abren los de las etapas a las que el alumno ya llegó; los demás se ven vacíos con 🔒 y avisan «Se abre cuando llegues a la Etapa N». La cinta naranja marca el libro de la etapa en la que va.
- **Cada libro viene COMPLETO** (portada con «Este libro es de <nombre>», apertura de la etapa, todas las lecciones, «¡Lo lograste!» con el certificado y las palabras de música), para que pueda volver a cualquier lección si algo no entiende. Cada lección son dos páginas (la explicación y la práctica), como en el papel. Sin enlaces ni botones a la página: todo se practica en la app. Si la etapa ya está terminada, el certificado lleva su nombre.
- **Los libros NO están en este repo:** se venden en Amazon. Salen del sistema con la clave del alumno (`?api=libro&k=&etapa=N`, `apiLibro_` en `Registro_Sprinkloud/maestros`), solo de las etapas a las que llegó, con sus imágenes en WebP base64url (500 a 900 KB por libro). `Api.libro(n)` los guarda en memoria durante la visita.
- **El lector** (`abrirLibro` en `app.js`): una hoja a la vez sobre papel claro (también de noche), ◀ ▶, flechas del teclado, deslizar con el dedo, ☰ índice (hoja que sube) y Escape para cerrar (el foco vuelve al lomo). Recuerda la página donde quedó (`localStorage` `bosque-libro-<ins>-<etapa>`). La hoja entra girando un poco desde el lomo (300 ms, `--ease-out`; con movimiento reducido, solo aparece).
- El CSS del libro (`LIBRO_CSS`) se encierra en `.libro-hoja` al cargarlo (`estiloLibro`). `.pasos` de la app (la barra de la práctica) chocaba con `ol.pasos` del libro: se corrige con `.libro-hoja ol.pasos`.
- **Para probar sin servidor:** `node herramientas/libros_demo.js` arma `demo-libros/<ins>-<etapa>.json` (en `.gitignore`, **nunca se sube**) y `?demo=1&semana=9` los abre. Antes hay que correr `Libro_Sprinkloud/herramientas/lecciones_maestros.js` si cambió algo del libro.

## Música y ambiente por escena (`ESCENAS` en `js/sonido.js`)
| Escena | Qué suena |
|---|---|
| Mapa | Un amanecer feliz de primavera (pedido de la dueña, 29-oct): `amanecer-1.mp3` (Good Morning, de Cakeflaps, CC0), en bucle. Bright Eyes y Flute & Strings se probaron y se quitaron porque sonaban mal. De día suenan los pájaros; la fogata crepita siempre (más de noche) |
| Tienda | Bossa nova. Al entrar suena la campanita de la puerta, y al comprar la caja registradora con monedas |
| Casita | Guitarra suave y la chimenea que crepita. Al pegar una calcomanía suena un «pop» |
| Biblioteca | Piano tranquilo (dos piezas de Holizna, CC0, una tras otra). Cada hoja del libro suena al pasar (`Sonido.hojaLibro`: el papel roza y la hoja cae) |
| Práctica | Silencio, porque los ejercicios de oído y ritmo necesitan escuchar |
| Fin | El jingle |

- Las canciones cambian con un fundido (`Sonido.escena`, que llama `ir()` en `app.js`).
- El botón 🎵 apaga la música y el ambiente.
- **Todas las canciones están niveladas a −24 dB de volumen medio** (ffmpeg `volumedetect` + `volume` + `alimiter`, 96 kbps). Las de la biblioteca estaban 10 dB más fuertes y tapaban los ejemplos. Al agregar una canción, nivelarla igual.

## Sonidos que no se mezclan (pedido de la dueña, 29-oct)
- **`Sonido.callar()`** corta de golpe todo lo que suena o está programado (notas, clics, tambor, el jingle): cambia el `bus` de los efectos por uno nuevo y apaga el viejo en 30 ms. La música de la escena no se toca.
- Se llama al cambiar de pantalla (`ir`), al empezar cada actividad de la práctica, al pasar o cerrar una hoja del libro, y antes de tocar algo nuevo (`Sonido.tocar`, `tocarCompas` del ritmo y `Ejemplos.tocar`).
- **`Sonido.luego(ms, fn)`** es como `setTimeout`, pero no hace nada si antes se llamó a `callar`. Se usa para las notas que se tocan con un poco de espera.
- **Ejemplos del libro:** `Sonido.musica.silenciar(ms)` apaga la música mientras suena el ejemplo y la devuelve despacio. El volumen de los ejemplos subió de .26 a .42.
- **El toque de los botones es un «tic» corto sin nota** (4-nov, pedido de la dueña): la nota aguda de piano del 3-nov se mezclaba con las notas de los ejercicios. Es un clic de ruido en 3800 Hz más un golpecito de 1500 a 700 Hz, de unos 40 ms (`Sonido.toque`). También suena así al contar los semitonos y al armar las armaduras.
- **La voz de piano tiene armónicos fuertes** (filtro en 5200 Hz), porque los parlantes del celular casi no dan los graves y la nota se reconoce por sus armónicos. El tambor lleva, además, el golpe del parche (ruido corto), que es lo que se oye en el celular.

## Fijar la app en la pantalla (29-oct)
- `manifest.json` **no tiene `start_url`** a propósito, y `api.js` deja la clave en la dirección (`?k=`). Así el ícono fijado abre la dirección con la clave. En el iPhone, la app fijada no comparte lo guardado con Safari, y sin la clave en la dirección pediría el enlace otra vez.
- Las instrucciones para el alumno (iPhone, Android y computadora) van en el mensaje de bienvenida del panel del maestro (`Registro_Sprinkloud/maestros/Maestro.html`, `mensajeTareas`).

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

## Revisión de animaciones `/review-animations` (29-oct)
- **Giro de hoja del libro:** `pasar(d, porTeclado)` en `js/app.js` solo anima (`entra-sig`/`entra-ant`) al tocar o deslizar. Con las flechas del teclado o con vueltas a menos de 250 ms (`ultimaVuelta`), la hoja aparece sin giro. La transición dura 240 ms (transform) y 200 ms (opacity), ambas con `--ease-out`.
- **Brillo del dibujo que suena:** va en `.diagrama::after` y solo anima `opacity` (`brilla-dibujo`). El `.diagrama` ya no tiene `box-shadow` ni transición propia.
- **Presión asimétrica:** `.ejemplo-sonido:active` baja en 40 ms y sube en 120; `.tecla-j:active` baja al instante y sube en 90.
- El movimiento reducido sigue apagando el giro y el pulso del brillo.

## Versión libre (30-oct, pedido de la dueña; publicado el 30-oct)
Quien entra **sin el enlace del maestro** (sin `?k=`) juega gratis. Es la muestra del club para atraer alumnos a los planes y vender los libros de Amazon. Se prueba con `?demo=1&libre=1`.
- **Guardado:** en el celular (`localStorage` `bosque-libre`), con el mismo motor del modo de prueba (`demo` en `js/api.js`, con `LIBRE`/`LOCAL`). Pendiente: el botón «Guardar mi progreso con Google» (fase 2, ver abajo).
- **Energía ⚡:** 20 al día, se recarga a medianoche. Cada actividad gasta 2 y cada error 2 más (`gasto` en `js/api.js`). Una práctica del día trae de 18 a 30 preguntas en 4 actividades: sin errores gasta 8 y alcanza. Primero se pensó en 1 por respuesta, pero así no alcanzaba ni sin errores. En la práctica, el rayo baja mientras se juega (se cuentan `S.acierto` y `S.error` fuera del ejemplo). Si llega a 0, se guarda lo respondido y se abre el espacio del club (`club('energia')`). El motor rechaza con `SIN_ENERGIA`, y el servidor debe usar el mismo texto.
- **Avance:** si la práctica del día termina con el 80 % o más de aciertos (`PARA_PASAR`), al día siguiente se abre la lección siguiente (`j.libre.paso`, `demo.avanzar`). Llega hasta la lección 27, el final de la etapa 3 (`ULTIMA_LIBRE`). Las lecciones 28 a 60 se ven con 🔒 (`premium`) y llevan al club.
- **Biblioteca:** los 7 libros con candado (`amazon: true`), que llevan al club con el botón de Amazon. **Excepción (2-nov-2026):** el ex alumno conserva abierto el libro de su nivel, el que recibió con la prueba de nivel. Lo decide el servidor (`abierto: true`, `Registro_Sprinkloud/maestros`, sección 9e); la app no cambia.
- **El club** (`club(motivo)` en `js/app.js`, la estrella ⭐ de la barra): las 60 lecciones y energía sin límite, los 7 libros en la app y clases en vivo. Botones «Quiero un plan» (WhatsApp del club) y «Libros en Amazon» (`BOSQUE_CLUB` en `js/config.js`; Amazon es la búsqueda de la serie hasta tener el enlace de la página de la serie).
- **Alumnos del club:** con su enlace no cambia nada (sin energía ni candados).
- **Fase 2, pendiente:** inicio de sesión con Google (Google Identity Services). Hace falta que la dueña cree el ID de cliente OAuth en Google Cloud (origen `https://sprinkloud.github.io`). El servidor verifica el token con `UrlFetchApp` (tokeninfo); esto agrega un permiso a la web app de maestros y la dueña tiene que volver a autorizarla. Se guarda en la hoja «Juego» con `AlumnoID` `G-<sub>` y una clave tipo `Público` en «Enlaces», más una hoja «Público» con el nombre y el correo. Al entrar, el progreso del celular pasa a la cuenta. Después viene Google Play (paquete TWA, `assetlinks.json` en el repo `Sprinkloud/sprinkloud.github.io`, página de privacidad y prueba cerrada de 12 personas por 14 días).

## El alumno avanza solo, prueba de nivel, Gmail y reportes (30-oct, pedido de la dueña)
- **Avance:** los alumnos del club pasan de lección con 80 % o más en 2 días (el servidor; ver `Registro_Sprinkloud/CLAUDE.md`). Al terminar la práctica, `avanceTxt` dice cuántos días lleva («Llevas 1 de 2 días con 80 %»). La versión libre sigue con 1 día.
- **Prueba de nivel** (`js/encuesta.js` y `encuesta(repetir)` en `js/app.js`). Más justa desde el 4-nov (pedido de la dueña: tocó mal la primera pregunta y la mandó al principio):
  - **Preguntas:** 18, tres por etapa de la 1 a la 6, de lo fácil a lo difícil (una con sonido y otra con la nota en el pentagrama). Las opciones salen en otro orden en cada intento (`mezclar`).
  - **Una etapa se aprueba con 2 de 3.** La prueba sigue hasta que una etapa ya no se puede aprobar (2 fallas en ella) o hasta 3 fallas en total (`evaluar`). Empieza en la primera lección de la primera etapa sin aprobar (`INICIO`); si aprueba todo, en la etapa 7. «No lo sé todavía» cuenta como falla.
  - **Contra los toques sin querer:** cada pregunta espera 600 ms antes de aceptar un toque (`PAUSA_ENCUESTA`, botones a media opacidad con `.espera`) y solo acepta una respuesta.
  - **Al final** dice «Contestaste bien N de M» y dónde empieza. También queda «Empezar desde la lección 1».
  - **Repetirla desde la biblioteca** (botón «Subir de nivel», `pruebaNivel()`; antes de los 7 días queda gris, `.puff.plomo`, sin frases, y al tocarlo solo avisa «⏳ Desde el dd/mm»): una vez cada 7 días y **solo sube**. Si le va peor, «¡Buen intento!» y sigue en su lección. Si todavía no se puede, dice desde qué día. Lo decide el servidor (`estado.prueba` = {puede, desde, dias}, `pruebaNivel_` en `maestros/Código.js`).
  - **Para probar:** `?demo=1&encuesta` (sin libre), `?demo=1&libre=1` y `&dia=2026-11-12` para simular que pasó la semana; `&prueba=no` la muestra bloqueada.
  - De noche, el pentagrama de la prueba queda sobre papel claro (antes, la tinta oscura no se veía).
- **Gmail:** `estado.cuenta === false` muestra «🔐 Guardar mi progreso» (al terminar la práctica, en la biblioteca y en el espacio del club), también a los alumnos.
- **Reportes:** «💬 Reportar un error o reclamo» abajo del camino y «💬 ¿Algo está mal en este ejercicio?» en la práctica (`reportar()`), con tipo (Error en un ejercicio, La app no funciona, Reclamo, Idea), mensaje y el contexto (lección, actividad, pantalla y dispositivo). Llega a la hoja «Reportes». En `?demo=1` no se manda.

## Textos sueltos y modo nocturno (30-oct, la dueña vio «null» y una insignia que no se veía de noche)
- **Causa del «null»:** `replaceChildren`/`append` del navegador escriben «null» si reciben un hijo opcional vacío (`cond ? el(...) : null`). Pasó en la entrada (la frase de la versión libre). Ahora todas las pantallas de `js/app.js` se llenan con `llenar(nodo, ...hijos)`, que descarta null y false; `el()` de `actividades.js` y `hoja.js` ya lo hacía. `aviso()` nunca muestra «undefined».
- **Revisión automática:** `herramientas/revisar_textos.js` (se pega en Playwright con el servidor local): recorre la entrada, la prueba de nivel, prácticas de varias lecciones, la casita, la tienda, la biblioteca y un libro, y busca «null», «undefined», «NaN» o texto suelto. Después del arreglo: sin hallazgos ni errores de JavaScript.
- **Modo nocturno:** de noche las medallas quedan de metal claro (las bloqueadas, grises al 62 %), y los retratos (amigos, premios, prueba de nivel) van sobre papel claro: con `mix-blend-mode: multiply` sobre el fondo oscuro se veían casi negros.

## La app sola, apps vencidas y ex alumnos (30-oct, pedido de la dueña)
- Quien compra la app sola (4,99 USD al mes o 39,99 USD al año; la registra servicio al cliente, ver `Registro_Sprinkloud/CLAUDE.md`) entra con su enlace como un alumno: sin energía ni candados, con los libros de sus etapas y «Llevas N de 2 días» al terminar.
- Si su app vence o un alumno queda inactivo, el mismo enlace abre la versión de prueba con su avance guardado. El servidor manda `estado.libre.motivo` (`vencida` o `exalumno`). Al entrar se abre una vez el espacio del club («Tu app venció ⏳» o «¡Te extrañamos en el club! 🌲»), con el botón «Renovar mi app» o «Volver al club» (`BOSQUE_CLUB.renovar` y `volver` en `js/config.js`, WhatsApp del club). Para probarlo: `?demo=1&libre=1&motivo=vencida`.
- El espacio del club también ofrece «📱 O solo la app completa: 4,99 USD al mes o 39,99 USD al año».

## Arte pendiente (Gemini)
- Hoy, los muebles y las insignias se ven como emoji.
- Las imágenes van en `assets/arte/<id>.webp`, con fondo transparente, y se agregan a `js/arte.js`.
- Ids de los muebles: los de `TIENDA` en el servidor. Ids de las insignias: los de `INSIGNIAS`.
- Los pedidos están en `Libro_Sprinkloud/herramientas/ilustraciones/etapa9.txt` (antes `etapa7.txt`; la etapa 7 ahora es el libro de los modos), y se generan con `.\ilustraciones.ps1 9`.
- `herramientas/arte.py` vuelve transparente el papel (`sin_papel`, como «color a alfa», con más cuerpo), recorta cada dibujo al objeto y actualiza `js/arte.js`.
- **29-oct:** 8 de 42 listas (cuadro, guirnalda, reloj, cortinas, maceta, farolito, tetera y calcetines). La tarea diaria de la sesión (10:41) sigue con el resto. Los muebles de piso se piden en vista desde arriba en diagonal, como la casa.
- **29-oct (tarde):** 16 de 42 listas (más olla de chocolate, atril con violín, metrónomo, tazas, pastel de miel e insignias primera, racha3 y racha7). **Faltan 26.** Se borraron 8 que Gemini dibujó con el osito encima (sillón, piano, 2 alfombras, cojines, lámpara, libros y tarro de miel); se repiten. Causa: el estilo común de `ilustraciones.ps1` describía al osito; ahora la etapa 7 usa `$estiloObjeto` («solo el objeto, sin el osito ni ningún personaje»). `arte.py` ya no convierte `bosque-enlace` (es la vista previa del enlace).
- **30-oct:** 26 de 42 listas (más sillón, piano de madera, alfombra redonda, cojines, alfombra de hojas, lámpara, libros, tarro de miel e insignias racha14 y racha30, ya sin el osito). **Faltan 16.** Se probaron en la casita (Sala y Toda la casa) y quedan bien; el sillón se movió a `sala-sillon: [30, 53, 13]` porque tapaba la pared. Cuando estén las 42, se sube (la dueña lo autorizó el 30-oct).
- **3-nov: las 42 listas** (llegaron calabazas y malvaviscos en palitos). `arte.py` hace el recorte normal si el fino (alpha matting) se queda sin memoria, como pasó con los palitos. Se subieron las 42.
- **2-nov:** 40 de 42 listas (más perfecta, aciertos100, aciertos500, dias10, dias30, compra, casa5, mesa del comedor, frascos de mermelada, cama de parches, cama de hojas, banca, columpio y flores del jardín). **Faltan 2: calabazas y palitos de malvavisco.** Se movieron `sala-mesa` a [44, 55] (quedaba sobre la pared delantera) y `cocina-repisa` a [75, 44] (quedaba sobre la pared del dormitorio).

## El osito que espera mientras carga (3-nov-2026, pedido de la dueña)
- `esperando(frase)` en `js/app.js`: el osito empuja una carretilla de flores (`assets/osito-cargando.webp`, de Gemini: `bosque-osito-carretilla` en `Libro_Sprinkloud/herramientas/ilustraciones/etapa10.txt`, recortada con rembg), con frases que cambian cada 1,8 s («Juntando malvaviscos…», «Avivando la fogata…»).
- Aparece al entrar al bosque (debajo del botón), al buscar la lección después de la prueba de nivel y al abrir un libro. La pantalla de entrada ya empieza con él (`index.html`). Con movimiento reducido, queda quieto.
- La misma imagen la usan los paneles del sistema (`Registro_Sprinkloud`), que la cargan desde GitHub Pages.

## La casita más de cerca (4-nov-2026, pedido de la dueña: más grande para decorar mejor)
- `CUARTOS` en `js/app.js`: «Toda la casa» con zoom 1,3 (antes 1; el dibujo tenía mucho margen de árboles y pasto), sala 2,4 (antes 2), cocina y dormitorio 3,1 (antes 2,7).
- Jardín: 1,6 (antes 1,7), centrado en 48 × 68 (más abajo se ve el papel blanco del borde del dibujo), porque más cerca quedaban afuera el huerto (x 19) o la fogata (x 76).
- Con zoom 1,3, todos los lugares de `POS` siguen dentro de «Toda la casa».

## Siempre de día (4-nov-2026, pedido de la dueña)
- La app ya no cambia a modo noche según la hora: `js/app.js` pone siempre `data-hora="dia"`. De noche quedaba casi negra y costaba jugar, practicar y ver la tienda y la biblioteca.
- Los estilos de `:root[data-hora="noche"]` siguen en `css/app.css`, pero no se usan. Las luciérnagas y los pájaros dependían de la hora: ahora siempre suenan los pájaros del día.
- Lo que dicen otras secciones sobre «día y noche según la hora real» quedó viejo.

## La pantalla final en el celular (4-nov-2026, la dueña vio la racha y los malvaviscos encima de las letras)
- **La causa:** el texto del avance («Llevas 1 de 2 días con 80 %…») llevaba la clase `paso` cuando se sacaba 80 % o más. Esa clase es la del circulito de 30 px de la barra de la práctica, así que el texto quedaba metido en un círculo chiquito, de una palabra por línea, y se desbordaba sobre la racha y los botones. Ahora la clase es `bien` (`avanceTxt` en `js/app.js`).
- **Además:** en `.fin` nada se aprieta (`.fin > * { flex-shrink: 0 }`). Si no cabe, la pantalla baja con scroll desde arriba (`justify-content: safe center`). De noche, el verde del avance usa `--ok-text`, porque el musgo oscuro no se leía.
- Probado en 360×780 y 320×568: sin elementos encimados.

## Lectura en voz alta: se puede repetir (7-nov-2026, comentario de una alumna)
- **El problema:** si se equivocaba al nombrar las notas, el cuadro se cerraba solo a los 1,8 s y la práctica seguía. No había cómo repetir: la alumna tuvo que salir y volver a entrar.
- **Ahora** (`voz` en `js/actividades.js`): con errores, el cuadro queda abierto con las notas rojas y el aviso «N de 8. Mira las rojas y toca ▶ Empezar para leerlas otra vez (2 de 3)». «▶ Empezar» repite las mismas notas.
  - Son hasta 3 intentos. Con 8 de 8, o al tercer intento, sigue la práctica.
  - Cuenta el primer intento, como en las vueltas de corrección.
  - Si se cierra con «Cerrar» después de un intento, vale ese primer resultado. Si se cierra sin ningún intento, la actividad se salta.
- **Las lecciones de clave de fa** (por ejemplo, la 21) rompían esta actividad: pedía solo notas de clave de sol, recibía una lista vacía, VexFlow fallaba y quedaba trabada. Ahora usa la clave que tiene más notas, y si no hay notas se salta.
- **El cuadro en un celular de 320 px:** se salía de la pantalla y cortaba el título y las instrucciones, porque el pentagrama medía como mínimo 300 px. Ahora mide como mínimo 220 px: el parche está en `copiar_motores.py` y en `motores/lectura.js`. Además, en `app.css`, `dialog.lh` tiene `max-width` y sus hijos `min-width: 0`.
- **La zona del ejercicio** (`.escenario`) ahora tiene `flex: 1 0 auto` (antes era `1 1 0`). Con contenido alto, por ejemplo armaduras en 320×640, se desbordaba y quedaba encima del enlace «¿Algo está mal en este ejercicio?». Ahora crece y la pantalla baja con scroll.
- **Ordenar sostenidos o bemoles no se corta al primer error** (pedido de la dueña, 7-nov):
  - el alumno pone las 7 en el orden que cree, en 7 lugares (`.ranuras-orden`), y con ↩ quita la última;
  - al final, cada lugar queda verde o rojo, con la correcta debajo, y aparece el mensaje «N de 7 en su lugar»;
  - el pentagrama muestra la armadura completa.
  - Para la misma idea en las apps del sitio (formar escalas), se le pasó el pedido al agente que revisa las apps.
  - Prueba: `herramientas/probar_orden.js` (320×640).
- **Revisión de textos cortados:** `herramientas/revisar_cortes.js`. Se corre con Chrome propio, sin el MCP: `node herramientas/correr_revision.js herramientas/revisar_cortes.js 360x780 <lecciones>`, una lección por proceso. Si no se le pasan lecciones, revisa la prueba de nivel. Busca texto que se sale de la pantalla, que tapa un contenedor o que es más ancho que su caja.

## Sonidos más claros (3-nov-2026, pedido de la dueña)
- **Toque de botón** (`Sonido.toque`): el 3-nov fue una nota aguda de piano, que se mezclaba con las notas de los ejercicios. Desde el 4-nov es un «tic» corto sin nota (ver «Sonidos que no se mezclan»).
- **Cambio de pantalla** (`Sonido.pagina`): ya no suena. El soplido también se oía como «posh» en cada botón.
- **Pulso del ritmo** (`Sonido.tambor`, en las actividades y los ejemplos): una campana clara y corta (`campana(t, 88, .34, .4)`). El tambor sonaba muy grave y casi no se oía en el celular.

## Motores copiados del sitio, 7-nov-2026 (revisión de enlaces de los libros)
- Se volvió a correr `herramientas/copiar_motores.py`:
  - `oido.js` trae 3 ejercicios nuevos (`progresiones`, `reposoMenor` y `dictado`), que la guía v9 usa en las lecciones 39, 41 y 46. Sin ellos, el bosque habría caído en «¿sube o baja?»;
  - `leccion.js` y `hoja.js` traen los temas 10, 22 y 23 corregidos y la hoja 10 del violín con la escala de Re;
  - `lectura.js` trae el ancho mínimo de 220 px.
- `copiar_motores.py` se salta el parche de 220 px si el sitio ya lo trae.
- `actividades.js`, en `poolNotas`: el sitio suma notas con alteración (`'f/4:#'`, `[tecla, clave, '#']`) en las lecciones 10 a 19 del violín y en la 25. El juego del bosque responde con nombres naturales, así que las deja fuera. Prueba: `Registro_Sprinkloud/pruebas/juego_test.js` 117/117.

## Hojas con todos los ejercicios de los libros nuevos (7-nov-2026)
- Se volvió a correr `herramientas/copiar_motores.py`. `hoja.js` trae los ~45 tipos de ejercicio nuevos de `página_Sprinkloud/practica/hojas.html` (ver su `CLAUDE.md`, sección del 7-nov): ritmo, pulso y metrónomo, ostinato, escalera, melodías por pasos y saltos, leer una melodía, ligaduras y síncopa, enarmónicos y becuadro, nota de arriba, menor armónica y V en menor, progresiones, pentatónica, ordenar dinámicas y tempos, forma y repeticiones, anacrusa, acompañar con I-IV-V y modos desde cualquier nota. `leccion.js` trae los temas de la guía v9 y el violín 9 a 19 en Do (do fijo). `palabras.js` trae 108 palabras. El parche de `lectura.js` (`Math.max(220, …)`) sigue vivo.
- **Las 60 lecciones tienen hoja** (`SIN_HOJA` vacío): ahora también la 1, 44, 46, 49 y 52. La actividad de hoja (`hoja` en `js/actividades.js`) no cambió: arma cualquier tipo, pone el primer ítem como «Ejemplo ✓», marca verde o rojo y a la segunda vuelta muestra las respuestas. `leerMelodia` devuelve dos ejercicios (la melodía y las preguntas sobre ella): `ejerciciosDe` ya los entrega aplanados.
- `css/app.css`: `.hoja-papel .solucion` ocupa su propia línea; y para la biblioteca, las clases nuevas de `Libro_Sprinkloud/plantilla/libro.css` dentro de `.libro-hoja`: `.ejercicio`, `.num-ej`, `.items` (`.it`), `.sol` y `.sol-leccion`.
- `herramientas/revisar_cortes.js`: con `INS=piano,violin` recorre los dos instrumentos, y ahora también junta los errores de la consola (no solo los de JavaScript).
- **Arreglos de 320 px que salieron en el recorrido:** la barra de pasos de la práctica (hasta 6 actividades) empujaba los malvaviscos fuera de la pantalla: bajo 380 px los circulitos miden 26 px y van con 4 px de separación. «Aumentada» y «Disminuida» no cabían en los botones del oído: bajo 380 px la letra de `.respuestas-juego .puff .cara` es de 1rem.
- **Recorrido (`revisar_cortes.js`, piano y violín, la práctica entera respondiendo sola):** las 60 lecciones a 320×640 y a 360×780 dieron 0 textos cortados y 0 errores de consola, con los arreglos de arriba. Se corre una lección por proceso, con 4 procesos como máximo y un tiempo límite por proceso: con 10 Chrome a la vez, Vosk se quedó sin memoria («Array buffer allocation failed») y algunos lotes se trabaron.
