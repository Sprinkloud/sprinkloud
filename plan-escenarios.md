# El álbum del bosque: mapas, stickers, amigos y mejoras

Empezó el 12-nov-2026 como «opción 2» (escenarios con stickers) y el 16-nov la dueña definió la economía a 6 meses. Este archivo dice qué se decidió, qué está hecho y qué falta por cada mapa.

## Las decisiones de la dueña

- **La casita de stickers se queda como está.** La casita en cuadrícula y el osito que camina se descartaron el 12-nov.
- **Cada mapa es una página de álbum** (16-nov): un paisaje de cuento clásico en acuarela, vacío, para pegar stickers («un álbum de diferentes escenas donde cada usuario disfruta decorando a su gusto»).
- **Un alumno se queda mínimo 6 meses.** Llenar un mapa en una semana es una recompensa barata y nos obligaría a crear decenas de mapas. Por eso:
  - **los mapas se ahorran**: el alumno decide entre remodelar su casa o seguir juntando para el mapa;
  - **los stickers de los mapas cuestan más** que los de la casita;
  - **los stickers se mejoran pagando** y desde entonces hacen algo. No todos: solo los que pueden. Algunos preparan un regalo que se le da a un amigo y desaparece;
  - **los amigos son stickers**: aparecen en la bandeja cuando llegan y desaparecen si el alumno deja de practicar.
- **Cada mapa tiene 30 stickers,** como la casita («me pareció variado y divertido para elegir»).
- **Un mapa a la vez, con todo su conjunto.** No importa cuánto tarde la tarea diaria de Gemini. Se revisa y se sube los viernes en la noche.
- **Hay que ir diseñando mejoras** para cada sticker que se pueda, en cada mapa (tabla de abajo).
- **Sin textos que expliquen nada**, como en todo el juego.
- **Cámara libre y lápiz** (16-nov, tarde): en lugar de las etiquetas de los cuartos se acerca y se desliza por la página. Tocar una cosa la hace actuar sin elegirla; para mover las calcomanías está el botón del lápiz. Los amigos se mueven siempre. Una cosa que se puede mejorar y todavía no lo está muestra una estrella con su precio.
- **Sin esperas** (16-nov): la carga y el tiempo de espera tienen que estar nulos o mínimos. Todo se ve al instante y se guarda por detrás.

## La economía

- **Cuánto se gana:** de 45 a 70 malvaviscos en un día de práctica (tope 150). Un alumno regular, 4 o 5 días por semana, junta unos 250 por semana: unos 6 500 en 6 meses. La casita completa cuesta 920.
- **Precios aprobados (16-nov):**

| Qué | Precio |
|---|---|
| Mapa del lago | 900 |
| Mapa del picnic | 1 200 |
| Mapa del huerto | 1 500 |
| Stickers de un mapa | 60 a 250 |
| Mejoras | 60 a 250 |
| Cada regalo que se prepara | 5 a 12 |

- **Un mapa completo** (el mapa, sus 30 stickers y sus mejoras) pide unos 5 000 malvaviscos: unos 5 meses de práctica regular. Los tres mapas juntos alcanzan para más de un año.

## Los amigos (regla aprobada el 16-nov)

- **Llegan con los días de práctica:** conejo 3, ardilla 7, zorro 14, erizo 21 y ratón 30. El osito está siempre.
- **Si deja de practicar, se van de uno en uno,** primero el último que llegó. Dos días completos sin practicar no cuestan nada (un fin de semana libre); al tercero se va uno, y después uno por día. Cada leña guardada salva un día más.
- **Al volver, los días se cuentan desde el último amigo que le queda.** Ejemplo: pierde al ratón (30) y le queda el erizo (21): necesita 9 días para recuperarlo.
- **Son stickers:** el amigo que está de visita aparece en la bandeja y se pega en la casita o en un mapa. El que se va desaparece de donde estaba pegado.
- **El juego no avisa cuando un amigo se va.** En la tienda y en la biblioteca se ve cuántos días faltan para el siguiente.

## Lo que está hecho (publicado el 16-nov-2026)

- **Servidor** (`Registro_Sprinkloud/maestros/Código.js`, sección 9): el mapa del lago y sus 6 primeros stickers en `TIENDA`; `MEJORAS`; `amistad_`; `mejorarJuego`, `usarJuego` y `darJuego`; `guardarCasa` con amigos y con `e` (la página). Pruebas: `Registro_Sprinkloud/pruebas/album_test.js` (37).
- **Modo de prueba** (`js/api.js`): las mismas reglas. Prueba: `node herramientas/probar_album.js` (34).
- **App** (`js/app.js`, `css/app.css`, `js/sonido.js`, `js/compartir.js`): el álbum con sus páginas, la tienda con mapas, mejoras y amigos, y las acciones. El detalle está en `CLAUDE.md`, «El álbum».
- **Arte** (`herramientas/arte.py`): el fondo del lago, 6 stickers del lago, 2 regalos y los 6 amigos.
- **20-nov-2026, el lago completo:** los otros 24 stickers en `TIENDA` y 19 mejoras en `MEJORAS` (servidor y `js/api.js`), el regalo nuevo `sopa` (la fogatita) y 6 acciones nuevas en la app: `revolotear` (libélulas), `esconder` (tortuga), `aletear` (garza), `viento` (juncos), `roer` (castor) y `campana` (boya). Los regalos `pescado` y `sopa` todavía se ven como emoji: falta su dibujo.

## Los stickers de cada mapa y su mejora

✓ = ya está en la tienda (**el lago entró completo, con sus 30, el 20-nov-2026**). Los demás entran a medida que la tarea diaria los pinta (`Libro_Sprinkloud/herramientas/ilustraciones/etapa19.txt`, en este orden). Las acciones que todavía no existen en la app están en cursiva: se programan cuando llegue el dibujo.

### El lago (900)

| Sticker | Precio | Mejora | Qué hace |
|---|---|---|---|
| Nenúfares con ranita ✓ | 60 | 80 | Croa y salta |
| Peces saltando ✓ | 80 | 80 | Saltan con un chapoteo |
| Cesta de pesca ✓ | 90 | sin mejora | |
| Mamá pata y patitos ✓ | 110 | 100 | Nadan y hacen cuac |
| Caña de pescar ✓ | 130 | 150 | Pesca un pescado (5), regalo para un amigo |
| Canoa ✓ | 250 | 120 | Navega |
| Velero ✓ | 220 | 120 | Navega |
| Salvavidas ✓ | 60 | sin mejora | |
| Libélulas ✓ | 80 | 80 | Revolotean |
| Tortuga en el tronco ✓ | 110 | 80 | Esconde la cabeza y asoma |
| Cisne ✓ | 130 | 100 | Nada |
| Garza ✓ | 110 | 80 | Aletea |
| Juncos ✓ | 60 | 60 | Se doblan con el viento |
| Farol del muelle ✓ | 90 | 60 | Se enciende |
| Cubeta de peces ✓ | 80 | 80 | Saltan |
| Red de pesca ✓ | 70 | sin mejora | |
| Tienda de campaña ✓ | 200 | 150 | Alguien duerme adentro (zzz) |
| Fogatita con olla ✓ | 150 | 150 | Sirve una sopa (8), regalo |
| Toalla con sombrero ✓ | 70 | sin mejora | |
| Barquitos de papel ✓ | 80 | 80 | Navegan |
| Ranitas ✓ | 90 | 80 | Croan en fila |
| Balsa de troncos ✓ | 180 | 120 | Navega |
| Bote cisne ✓ | 240 | 120 | Navega |
| Puente de arco ✓ | 200 | sin mejora | |
| Castor y su presa ✓ | 130 | 80 | Asoma y roe |
| Nutria ✓ | 120 | 100 | Nada panza arriba |
| Boya con gaviota ✓ | 80 | 60 | Suena su campana |
| Hamaca ✓ | 160 | 100 | Se mece |
| Farolitos flotantes ✓ | 120 | 80 | Se encienden |
| Piedras de paso ✓ | 70 | sin mejora | |

### El picnic (1 200)

| Sticker | Precio | Mejora | Qué hace |
|---|---|---|---|
| Cesta de picnic | 100 | 150 | Prepara un sándwich (8), regalo |
| Manta de cuadros | 90 | sin mejora | |
| Sándwiches y limonada | 110 | 120 | Sirve limonada (6), regalo |
| Cometa | 150 | 100 | *Vuela* |
| Sombrilla | 120 | 60 | *Gira* |
| Pastel de fresas | 160 | 200 | Corta una rebanada (12), regalo |
| Tarta de manzana | 140 | sin mejora | |
| Sandía | 100 | 120 | Corta una rebanada (6), regalo |
| Canasta de frutas | 110 | sin mejora | |
| Globos | 120 | 80 | *Flotan y vuelven* |
| Banderines | 90 | 60 | Se mecen |
| Columpio de la rama | 180 | 100 | Se mece |
| Pelota | 60 | 80 | Rebota |
| Ukelele | 200 | 200 | Toca una canción |
| Mariposas | 80 | 80 | *Revolotean* |
| Hormiguitas | 80 | 80 | *Caminan en fila* |
| Ramo en frasco | 70 | sin mejora | |
| Cojines | 70 | sin mejora | |
| Bicicleta | 250 | 120 | *Rueda y suena su timbre* |
| Rehilete | 60 | 60 | *Gira* |
| Termo con tazas | 110 | 120 | Sirve un té (6), regalo |
| Caballete | 150 | sin mejora | |
| Burbujas | 80 | 80 | *Salen burbujas* |
| Tabla de quesos | 120 | 150 | Corta un queso (8), regalo |
| Carrito de helados | 240 | 200 | Sirve un helado (10), regalo |
| Gramófono | 220 | 200 | Toca una canción |
| Raquetas | 80 | sin mejora | |
| Pajaritos con migas | 90 | 80 | *Picotean y cantan* |
| Farolillos de papel | 130 | 80 | Se encienden |
| Mesita de picnic | 120 | sin mejora | |

### El huerto (1 500)

| Sticker | Precio | Mejora | Qué hace |
|---|---|---|---|
| Regadera | 80 | 80 | *Riega* |
| Carretilla | 130 | 100 | *Rueda* |
| Pala y rastrillo | 70 | sin mejora | |
| Zanahorias | 100 | 150 | Cosecha una zanahoria (5), regalo |
| Espantapájaros | 180 | 80 | Se mece y saluda |
| Coles | 80 | sin mejora | |
| Tomates | 90 | sin mejora | |
| Girasoles | 120 | 60 | Se mecen |
| Mata de fresas | 110 | 150 | Cosecha fresas (6), regalo |
| Maíz | 100 | sin mejora | |
| Lechugas | 80 | sin mejora | |
| Calabaza gigante | 200 | sin mejora | |
| Canasta de verduras | 110 | sin mejora | |
| Gallina con pollitos | 150 | 100 | *Picotean y cacarean* |
| Casita de pájaros | 130 | 80 | El pajarito canta |
| Colmena | 180 | 200 | Da un tarrito de miel (10), regalo |
| Costal de semillas | 70 | sin mejora | |
| Letreritos | 60 | sin mejora | |
| Botas de lluvia | 70 | 60 | Saltan |
| Canasta de manzanas | 100 | sin mejora | |
| Tendedero | 120 | 60 | Se mece |
| Invernadero | 250 | 60 | Se enciende |
| Pozo | 220 | 120 | *Sube el balde con agua* |
| Macetas de hierbas | 80 | sin mejora | |
| Cerca con flores | 90 | sin mejora | |
| Veleta | 140 | 60 | *Gira* |
| Manzano | 240 | 150 | Da una manzana (5), regalo |
| Caracol | 80 | 80 | *Pasea despacio* |
| Topo | 110 | 80 | *Se esconde y asoma* |
| Barril de lluvia | 100 | sin mejora | |

### Mapas que siguen

Los fondos del escenario de conciertos, el campamento, el bosque nevado y la playa están pedidos en `etapa18.txt`. La dueña los aprueba antes de diseñar sus 30 stickers.

### Idea para después

Que cada amigo tenga un regalo favorito (el ratón el queso, el conejo la zanahoria, el osito la miel) y festeje más al recibirlo. No está hecho ni aprobado.

## Cómo entra un sticker nuevo a la tienda

1. La tarea diaria lo pinta y `stickers.py` lo recorta en `Libro_Sprinkloud/img/stickers/`.
2. Se mira el dibujo (color, sin texto, sin personajes de más).
3. `python herramientas/arte.py` lo lleva a `assets/arte/<mapa>-<nombre>.webp` y actualiza `js/arte.js`.
4. Se agrega a `TIENDA` (con `mapa`, `precio` y `tam`) y, si tiene mejora, a `MEJORAS`, en el servidor y en `js/api.js`. Los dos tienen que quedar iguales.
5. Si su acción es nueva: el movimiento en `MOVIMIENTOS` (`js/app.js`), el sonido en `Sonido.juguete` (`js/sonido.js`) y su dibujito en `ACCION_ICO`. Si prepara un regalo nuevo: `REGALOS` en el servidor y en `js/api.js`, `NOMBRE_REGALO` y el dibujo `regalo-<id>.webp`.
6. Pruebas: `album_test.js`, `probar_album.js` y mirarlo en el navegador.
7. Se sube el viernes, con la palabra «upload».
