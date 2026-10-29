---
name: El bosque de Sprinkloud
description: La práctica diaria de música como un cuento ilustrado en acuarela: un osito, un camino por el bosque, una fogata y una casita de madera.
colors:
  moss: "#647745"
  moss-deep: "#48592F"
  moss-soft: "#E1E6CF"
  ochre: "#C4923A"
  ochre-deep: "#9C6F22"
  ochre-soft: "#F1E0BC"
  rose: "#B0685A"
  rose-deep: "#8E4D41"
  sky: "#7895A6"
  paper: "#F6F0E2"
  surface: "#FBF7EE"
  cream: "#FFFDF8"
  ink: "#3A3128"
  ink-soft: "#6D6152"
  wood: "#8A5A35"
  wood-deep: "#5E3B22"
  fire: "#E8742A"
  night-paper: "#232A25"
  night-surface: "#2C3530"
  night-ink: "#EDE6D6"
  ochre-ink: "#2E2010"
  ochre-strong: "#8A6420"
  label-ochre: "#7E5A1A"
  sky-strong: "#567285"
  sky-strong-deep: "#3E5563"
  rose-strong: "#A15A4D"
  rose-strong-deep: "#7E4338"
  fire-text: "#A64B17"
  night-ok-text: "#B5CB93"
  night-mal-text: "#E2A699"
  medalla-luz: "#FFF6DA"
  hoja-tinta: "#2B241C"
  hoja-tinta-suave: "#5A4E40"
  hoja-ocre: "#8F6A2A"
  hoja-linea: "#CDBF9F"
  hoja-mal: "#9A5245"
  hoja-mal-fondo: "#F3DED8"
typography:
  display: "Fraunces (SOFT 100), 600–700"
  body: "Nunito Sans 400/700/800"
  hand: "Caveat 600, para lo que dice el osito"
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  ease-in-out: "cubic-bezier(0.77, 0, 0.175, 1)"
  ease-drawer: "cubic-bezier(0.32, 0.72, 0, 1)"
---

# El bosque de Sprinkloud: sistema de diseño

## La idea
El alumno entra a un libro de cuentos. Todo parece pintado sobre papel de acuarela: el osito de la dueña, pinos, un sendero de tierra, la fogata con humo y una casita de madera. Nada plano, saturado ni de plástico. La única excepción son los botones, acolchados como cojines, para que den ganas de tocarlos.

## Reglas
- **El cuento manda.** Las imágenes son de la dueña (osito, casita, amigos) o de Gemini en su mismo estilo. Los emojis son solo provisorios hasta que llegue el dibujo.
- **Sin textos largos.** Cada pantalla tiene una frase corta en la letra del osito (Caveat). Las explicaciones se reemplazan por un ejemplo: «Mira 👀», el osito lo hace y aparece «¡Ahora tú!».
- **Botones esponjosos.**
  - Tienen dos capas: un borde de madera y una cara acolchada, con brillo arriba a la izquierda y sombra suave abajo.
  - La cara está 6 px arriba (8 px en los grandes) y al tocarla baja a 1 px en 60 ms, para que el toque se sienta.
  - Colores: musgo (lo principal), ocre (lo que invita, como «Practicar» y «¡Ahora tú!»), rosa (tienda y compartir), cielo (logros y escuchar), madera (casita) y papel (respuestas).
- **Contraste AA (auditoría del 29-oct).** El texto sobre color siempre llega a 4,5:1:
  - **Ocre:** el botón queda dorado, con letra café `ochre-ink` (5,7:1). La pestaña elegida y la etiqueta «Mira» usan `ochre-strong` (5,3:1).
  - **Rosa y cielo:** sus caras de botón usan los tonos `-strong` (5,0:1).
  - **De día:** la etiqueta de etapa es `label-ochre` y la racha, `fire-text`. De noche vuelven al ocre y al fuego, que ya contrastan.
  - **Los colores claros** (`ochre`, `rose`, `sky`) quedan para rellenos sin texto: medallas, zonas del camino y fogata.
- **Todo color es un token** de `:root`. La hoja de práctica tiene su propia tinta de imprenta (`--hoja-*`). El pentagrama y la hoja son papel: siempre claros (`--papel-claro`), también de noche, sin filtros, porque invertidos no se leían bien (pedido de la dueña, 29-oct).
- **Un protagonista por pantalla:** el camino, la pregunta, la fogata del final o la casita.
- **Sin scroll en las pantallas principales.**
  - Todo se mide con `dvh`.
  - Solo se desplazan el mapa del camino (con un desvanecido arriba y abajo), la hoja de práctica, la tienda y los logros.
- **Celulares desde 320 px:**
  - botones de 44 px como mínimo;
  - sin scroll horizontal;
  - en computadora, una columna de 760 px como máximo;
  - en pantallas bajas (menos de 640 px de alto), la ilustración de arriba se achica.
- **Día y noche, por la hora real.**
  - De 19:00 a 6:00 el papel se oscurece, aparecen luciérnagas y la fogata ilumina desde abajo. El pentagrama y la hoja de práctica siguen claros.
  - Los colores de noche están en `:root[data-hora="noche"]`.
- **La casita es un lienzo de calcomanías:**
  - cada dibujo con todos sus colores (recorte con rembg) y un borde blanco de pegatina dibujado en la imagen (`herramientas/arte.py`, 7 px) más una sola sombra suave de CSS; antes eran 5 `drop-shadow`, que pesaban en cada zoom;
  - en «Toda la casa» tocar una calcomanía acerca la cámara a su cuarto; ahí se arrastra;
  - una se puede pegar encima de otra;
  - el zoom por cuarto dura 420 ms, con ease-in-out.
- **Confeti solo para festejar**, al final de la práctica, con formas del cuento: 🍂 ⭐ 🎵 🔥. Se respeta el movimiento reducido.
- **Sonido:**
  - un toque de madera en cada botón;
  - una marimba que sube de tono con cada acierto seguido;
  - un error suave, que nunca castiga;
  - chispitas al ganar malvaviscos, la fogata que se aviva y el jingle de festejo;
  - cada pantalla tiene su canción y su ambiente: pájaros y fogata en el mapa, campanita y caja registradora en la tienda, chimenea en la casita;
  - en la práctica hay silencio;
  - la música de fondo se puede apagar.

## Movimiento (Emil Kowalski)
- Solo se animan `transform` y `opacity`. Nunca se parte de `scale(0)`: el mínimo es `.85` con opacidad 0.
- **Cambio de pantalla:** como pasar de página. Opacidad y subida de 14 px en 260 ms, con ease-out fuerte.
- **Botones:** se hunden en 60 ms y se sueltan en 140 ms. La respiración de los principales va en el botón de afuera, para no pisar la presión. Con mouse, `:hover:not(:active)`.
- **Cajón de premios y muebles:** sube desde abajo en 360 ms con la curva de drawer. El fondo se oscurece en 220 ms.
- **Llamas, humo, halo de la parada actual y luciérnagas:** animaciones CSS constantes y suaves. Con movimiento reducido se apagan.
- **Lo que aparece en el festejo:** 360 ms, escalonado cada 70 ms.
- **Movimiento reducido:** el cajón y el aviso solo se desvanecen.

## Teclado
- **Cajones (premios):** el foco entra al primer botón, Tab da la vuelta adentro, Escape cierra y el foco vuelve a donde estaba.
- **Paradas del camino:** se abren con Enter o con la barra espaciadora.

## Excepciones del detector de impeccable (`.impeccable/config.json`)
El fondo de papel crema y las luciérnagas que titilan con su brillo son parte del cuento, no adornos por costumbre.
- **Hover:** solo con mouse (`@media (hover: hover) and (pointer: fine)`).
