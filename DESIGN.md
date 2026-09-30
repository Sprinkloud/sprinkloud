---
name: Sprinkloud
description: App del Club Musical Sprinkloud con aspecto de libro ilustrado en acuarela, protagonizada por un osito en un bosque de pinos.
colors:
  moss: "#647745"
  moss-deep: "#48592F"
  moss-soft: "#E1E6CF"
  ochre: "#C4923A"
  ochre-soft: "#F1E0BC"
  dusty-blue: "#7895A6"
  dusty-blue-soft: "#DCE5E8"
  rose-clay: "#B0685A"
  paper: "#F6F0E2"
  paper-deep: "#EFE6D1"
  surface: "#FBF7EE"
  ink: "#3A3128"
  ink-soft: "#6D6152"
  pencil-line: "#DCCFB5"
  string-sol: "#9C5B55"
  string-re: "#C4923A"
  string-la: "#647745"
  string-mi: "#567388"
  night-paper: "#1E2521"
  night-paper-deep: "#27302A"
  night-surface: "#2C3530"
  night-ink: "#EDE6D6"
  night-ink-soft: "#B9AF9C"
  night-line: "#3E4A42"
  night-moss: "#9DB47A"
  night-ochre: "#D9AE63"
  night-dusty-blue: "#9DB6C4"
  night-rose-clay: "#D69585"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(1.9rem, 5vw, 2.8rem)"
    fontWeight: 600
    lineHeight: 1.15
    fontVariation: "'SOFT' 100, 'WONK' 0"
  headline:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(1.4rem, 3.4vw, 1.9rem)"
    fontWeight: 600
    lineHeight: 1.15
    fontVariation: "'SOFT' 100"
  title:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "1.15rem"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "Nunito Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Nunito Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.3
  hand:
    fontFamily: "Caveat, cursive"
    fontSize: "1.35rem"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  sm: "9px"
  md: "14px"
  card: "22px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.moss}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
    typography: "{typography.label}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
    typography: "{typography.label}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "24px"
  notice:
    backgroundColor: "{colors.ochre-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "16px 20px"
  nav-tab-active:
    backgroundColor: "{colors.moss-soft}"
    textColor: "{colors.moss-deep}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  note-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: "6px 2px"
---

<!-- IMPLEMENTADO en index.html (migración del 26 de septiembre de 2026; acuarelas del club el 28 de septiembre). Pendiente: reemplazar los Fluent Emoji del bosque por acuarelas. -->

# Design System: Sprinkloud

## Overview

**Creative North Star: "El libro de cuentos del bosque"**

Sprinkloud se ve como un libro ilustrado clásico para niños. Acuarela delicada con línea fina de tinta, paleta terrosa y apagada, papel con textura y mucho espacio en blanco. El osito del club acompaña al alumno por un bosque de pinos en calma, con luz de mañana entre las ramas. Cada pantalla es una viñeta con un solo protagonista, sea el mapa, la lección o el juego, rodeada de papel en blanco.

La descripción de referencia se usa tal cual como prompt al generar o encargar ilustraciones:

> Classic children's storybook illustration, delicate watercolor and fine ink linework, soft muted earthy palette of moss green, warm ochre, dusty blue and cream, gentle washes with visible paper texture and soft bleeding edges, a small anthropomorphic brown bear cub wearing a simple knitted scarf, standing in a quiet pine forest, tall pine trees, ferns, mushrooms and wildflowers, dappled morning light filtering through branches, cozy nostalgic early-20th-century picture book aesthetic, tender and whimsical mood, lots of white space around the scene, hand-drawn, storybook vignette composition.

**El osito.** Es la mascota y el guía.

- Oso pardo pequeño, antropomorfo, con una bufanda tejida sencilla en ocre o musgo.
- Siempre con la misma bufanda y las mismas proporciones.
- Aparece en la pantalla de entrada (`osito-bosque`), al cerrar cada práctica (Lottie `osito`) y en el "Reto para casa" (`osito-casa`).

**Los guías de cada sección.** Personajes de la misma colección, con la cabeza de sección (`guiaHTML`) y una frase corta en Caveat: ratón en Partituras, erizo en Herramientas, zorro en Logros y ardilla en Mi bosque. El conejo queda libre para las cápsulas.

**Imágenes.** Las acuarelas y los Lottie son propios del club y no llevan créditos. Los originales están en `assets/image/` (no se publican) y la app usa copias WebP en `assets/ilustraciones/`:

| Qué | De dónde sale | Formato |
|---|---|---|
| Osito y guías | `image/personajes y paisajes/` | WebP de 640 a 1000 px, con `.acuarela` (multiplicar sobre el papel en tema claro) y `.vineta` (bordes que se desvanecen) |
| Postura y manos | `image/violin postura/` | WebP de 1100 a 1200 px con puntos numerados encima (`POSTURA` y `mountPostura`). Nunca dibujos propios: si falta una vista, se pide la imagen |
| Reacciones animadas | `image/formato lottie/` | JSON en `assets/lottie/`, con lottie_light desde cdnjs |

**El mapa de lecciones es llano** (pedido de la fundadora): sendero gris en zigzag, un árbol por lección en un círculo (musgo si está hecha, ocre con anillo si es la actual, gris si falta) y a la derecha "Lección N", el título en Nunito Sans y tres estrellas. Sin fondo, río ni decoraciones. Los Fluent Emoji planos siguen en el bosque y las cápsulas, suavizados con `saturate(.7) sepia(.16)`.

**Lottie.** Solo personajes y objetos de la colección: `osito` (fin de práctica), `ardilla` (juego con 2 o 3 estrellas), `abeja` (festejo de nivel) y `camara` (aviso del video). Se reproducen una vez al aparecer; los de tipo "tocar" repiten al pasar el puntero. Con movimiento reducido quedan quietos en su pose final. No se usan el logo de Instagram ni el pavo.

**Key Characteristics:**
- Papel crema con textura y lavados transparentes; nada de color plano ni degradados digitales.
- Línea de tinta sepia, fina y un poco irregular.
- Un protagonista por pantalla, con papel en blanco alrededor.
- Tono tierno, tranquilo y nostálgico, sin estridencias.

## Colors

La paleta es terrosa y apagada: musgo, ocre, azul polvoso y crema, con tinta sepia en lugar de negro. De noche se convierte en un "bosque de noche" (tokens `night-*`).

### Primary
- **Musgo del bosque** (moss): acción principal, lecciones hechas y la sección activa. Su versión profunda (moss-deep) va en títulos y énfasis; la suave (moss-soft) en fondos de éxito.

### Secondary
- **Ocre de la mañana** (ochre): estrellas, lección actual, medallas y la bufanda del osito. Su versión suave (ochre-soft) va en avisos y fondos cálidos.

### Tertiary
- **Azul polvoso** (dusty-blue): agua, cielo e información. Su versión suave (dusty-blue-soft) va en fondos informativos.
- **Arcilla rosada** (rose-clay): errores y "así no". Siempre terracota suave, nunca rojo.

### Neutral
- **Papel crema** (paper): fondo de la página. Su versión más profunda (paper-deep) va en zonas hundidas y de práctica.
- **Hoja limpia** (surface): tarjetas.
- **Tinta sepia** (ink): texto. La versión suave (ink-soft) va en el texto secundario.
- **Línea de lápiz** (pencil-line): bordes y separadores.

### Named Rules
**The Four Strings Rule.** Las cuatro cuerdas conservan su color en toda la app, dentro de la paleta: Sol en rosa tierra (string-sol), Re en ocre (string-re), La en musgo (string-la) y Mi en azul polvoso (string-mi). Ninguna otra cosa usa esos colores para significar otra cosa.

**The Sepia Ink Rule.** No existe el negro puro. Todo texto y contorno es tinta sepia (ink); de noche es crema (night-ink).

**The AA Rule.** Todo texto cumple contraste AA (4.5:1) en los dos temas, comprobado: tinta sobre papel 11.2:1, tinta suave 5.3:1, crema sobre musgo 4.6:1. Sobre las cuerdas Sol, La y Mi el número de dedo va en crema; sobre Re (ocre) va en tinta, porque el crema no llega al contraste. Estrellas y medallas ocre llevan siempre contorno de tinta.

## Typography

**Display Font:** Fraunces (con Georgia)
**Body Font:** Nunito Sans (con system-ui)
**Hand Font:** Caveat

**Character:** Una serif suave de libro antiguo para los títulos y una sans redondeada y muy legible para el texto de los niños. Caveat pone la voz a mano del osito.

### Hierarchy
- **Display** (600, clamp 1.9–2.8rem, 1.15): nombre del nivel y títulos de los festejos.
- **Headline** (600, clamp 1.4–1.9rem, 1.15): títulos de pantalla y de cada paso de la práctica.
- **Title** (600, 1.15rem, 1.25): títulos de tarjetas y secciones.
- **Body** (400, 1rem, 1.5): todo el texto corrido; el mínimo es 16 px para el alumno y 14 px en el panel del maestro.
- **Label** (700, 0.875rem): botones, etiquetas y chips.
- **Hand** (600, 1.35rem): frases cortas del osito, rótulos del mapa y el lema. Nunca en párrafos.

### Named Rules
**The Storybook Numbers Rule.** Los números que se celebran (racha, puntos, notas grandes) van en Fraunces.

## Layout

Es una app de una columna centrada que en computadora abre en dos (lección y sendero, o mapa y panel). En celulares la navegación del alumno va abajo; en computadora va arriba. El ritmo de espacios sigue la escala de 4 · 8 · 16 · 24 · 40 px. El mapa de lecciones tiene un ancho máximo de 420 px y siempre queda centrado, con papel a los lados.

**The One Protagonist Rule.** Cada pantalla tiene un solo protagonista. No se rellenan las esquinas con decoración.

## Elevation & Depth

La profundidad es de papel apilado, no de material flotante. Las tarjetas se separan del fondo solo con una línea de lápiz de 1 px, sin sombra. El fondo lleva una textura de papel con ruido SVG (`feTurbulence`) al 3–5 % de opacidad, que no se anima.

### Shadow Vocabulary
- **Mancha de papel** (`box-shadow: 0 6px 18px rgba(58, 49, 40, .08)`): solo superficies que flotan sobre otras, como la hoja de la práctica. Nunca junto con una línea de lápiz.
- **Botón hundido** (`box-shadow: 0 4px 0 rgba(58, 49, 40, .18)`): solo en los botones grandes de juego (reproducir, tocar aquí), que bajan al presionarse.

### Named Rules
**The Paper Stack Rule.** No hay sombras grises duras ni elevación por capas tipo Material. Si algo necesita destacar, se le da papel alrededor, no sombra.

## Shapes

Las esquinas son redondeadas y amables: 9 px en las tarjetas de nota, 14 px en paneles pequeños, 22 px en las tarjetas grandes, y forma de píldora en botones y chips. Las ilustraciones SVG propias llevan el filtro `#acuarela` (`feTurbulence` con `feDisplacementMap`, escala 2–3), para que los bordes se abran como la acuarela sobre el papel. El filtro nunca se aplica a texto, botones ni partituras.

## Components

### Buttons
- **Shape:** píldora (999px).
- **Primary:** fondo musgo con texto crema, sin sombra.
- **Secondary:** hoja limpia con borde de lápiz y texto en tinta.
- **Press:** baja a `scale(0.97)` al presionarse (ver Motion).
- **Hover:** solo con puntero fino, oscurece el borde a musgo.

### Cards / Containers
- **Corner Style:** 22 px.
- **Background:** hoja limpia sobre papel crema.
- **Shadow Strategy:** ninguna; la línea de lápiz basta.
- **Border:** línea de lápiz de 1 px.
- **Internal Padding:** 24 px (16 px en celulares).

### Navigation
- La barra del alumno es papel con una línea de lápiz. La sección activa lleva fondo musgo suave y texto musgo profundo.
- Los íconos son de trazo fino a mano, del mismo grosor que la tinta.

### Mapa del bosque (Signature)
- Viñeta de acuarela con un sendero ocre claro que serpentea entre pinos, helechos y hongos.
- Claros circulares: los hechos en musgo con estrellas ocre, el actual en ocre con el osito al lado y un anillo que respira, y los bloqueados en papel con un candado a lápiz.
- El nombre de cada lección va en una etiqueta de papel con letra a mano.

### Tarjetas de nota y pentagrama (Signature)
- Tarjeta de nota: lavado del color de la cuerda al 16 %, borde de tinta del mismo color, número de dedo en un círculo pintado (crema en Sol, La y Mi; tinta en Re).
- Pentagrama: líneas en tinta suave de 1.2 px sobre papel y cabezas de nota con el color de su cuerda.

### Estrellas, medallas y avisos
- Estrellas y medallas: ocre con contorno de tinta; la medalla se ve pintada, no metálica.
- Aviso: fondo ocre suave con el osito pequeño a la izquierda.

## Do's and Don'ts

### Do:
- **Do** usa solo los tokens de color de este archivo, en tema claro y de noche.
- **Do** deja papel en blanco alrededor del protagonista de cada pantalla.
- **Do** registra cada imagen nueva en `assets/LICENCIAS.md`.
- **Do** mantén al osito con la misma bufanda y las mismas proporciones en toda la app.

### Don't:
- **Don't** uses vector plano, degradados digitales, 3D, neón ni negro puro.
- **Don't** pongas sombras grises duras ni bordes de acuarela sobre texto, botones o partituras.
- **Don't** llenes la pantalla con decoración ni con párrafos: el alumno tiene 6 años.
- **Don't** uses confeti de colores; los festejos llevan hojas y pétalos de acuarela.

## Motion

El movimiento se rige por la filosofía de Emil Kowalski (skills `animate` y `review-animations` del workspace). No se usa `/impeccable animate`. Antes de animar algo se responden cuatro preguntas en orden: ¿se anima?, ¿para qué?, ¿con qué curva?, ¿cuánto dura? El carácter es de libro de cuentos: calmo, un poco más pausado que una app de productividad y nunca rebotón. Las curvas y duraciones exactas están en `.impeccable/design.json` (`extensions.motion`) y como variables CSS:

```css
:root{
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);      /* entradas y respuestas */
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);  /* algo que se mueve dentro de la pantalla */
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);   /* paneles y hojas que suben */
  --dur-press: 140ms; --dur-fast: 180ms; --dur-base: 240ms; --dur-panel: 320ms;
}
```

### Reglas
- Solo se animan `transform` y `opacity`. `filter: blur()` solo se usa para suavizar un cruce entre dos estados, hasta 2 px.
- Nunca `transition: all` ni `ease-in` en la interfaz. Para entrar y responder se usa `--ease-out`; para color y hover, `ease`.
- Nada aparece desde `scale(0)`: se entra desde `scale(0.95)` con `opacity: 0`.
- Todo lo que se presiona baja a `scale(0.97)` con `--dur-press`.
- Salir es más rápido que entrar. Lo que se interrumpe seguido usa transiciones, no `@keyframes`.
- Los hover van dentro de `@media (hover: hover) and (pointer: fine)`.
- No se anima nada que dispare el teclado.
- Stagger de 40 a 60 ms entre elementos que entran juntos, sin bloquear la interacción.
- Con `prefers-reduced-motion` se quitan desplazamientos, escalas, hojas que caen y respiraciones; quedan las transiciones de opacidad y color.

### Cada pieza de la app

| Pieza | Frecuencia | Movimiento |
|---|---|---|
| Cambio de sección | Decenas de veces al día | Ninguno: solo cambia el color de la pestaña activa (`ease`, 120 ms) |
| Botones y claros del mapa | Muchas veces | `scale(0.97)` al presionar, 140 ms `--ease-out` |
| Lección actual en el mapa | Siempre visible | Anillo ocre que respira con opacidad de .5 a 1 en 3 s `ease-in-out`, sin escala |
| Abrir una práctica | Varias veces al día | Sube desde `translateY(24px)` con opacidad, 320 ms `--ease-drawer`; cierra en 180 ms |
| Pasar de paso | Varias veces por práctica | Entra desde `translateX(16px)` con opacidad, 240 ms `--ease-out`; el anterior sale en 160 ms. Al volver con la flecha, entra desde `translateX(-16px)` y la barra retrocede |
| Círculo de cuenta | Cada play de ritmo | Reloj en reposo; en la cuenta 1-2-3-4 fondo ocre suave y después el pulso (el 1 en musgo). Solo cambia el color, 80 ms `ease`, sin escala |
| Pizza que suena (una por pulso) | Varias veces por compás | Capa ocre (multiplicar) de opacidad 0 → .55 en 80 ms y vuelve en 180 ms `ease` en todos los pedazos de la figura; la insignia y la figura de la tira cambian a ocre. Solo color |
| Leer notas | Cada nota | Sobre la imagen del violín: la nota tocada crece a `scale(1.3)` con aro oscuro, 160 ms `--ease-out` (con movimiento reducido, solo el aro); la estrella ganada entra desde `scale(.95)` con opacidad, 240 ms `--ease-out`, sin rebote |
| Barra de avance | Cada paso | `transform: scaleX()` desde la izquierda, 400 ms `--ease-out` |
| Nota que suena | Varias veces por segundo | Solo cambia el color, 80 ms `ease` |
| Toque en el Eco | Muchas veces por ronda | El botón baja 3 px en 90 ms |
| Acierto en un juego | Cada pregunta | Pasa a musgo con `scale(0.97)` → `1`, 160 ms `--ease-out` |
| Error en un juego | Cada pregunta | Vaivén de 4 px dos veces en 240 ms, color arcilla |
| Combo | Ocasional | Entra desde `scale(0.95)` con opacidad, 180 ms |
| Cápsulas | Una vez por lección | Stagger de 60 ms, 300 ms `--ease-out`; la clave de Sol se revela de abajo hacia arriba con `clip-path: inset()` en 1.2 s `--ease-in-out` |
| Punto de postura activo | Varias veces por lección | El punto crece a `scale(1.18)` y pasa a ocre, 180 ms `--ease-out`; la frase entra desde `translateY(4px)`, 180 ms; al cambiar de imagen, fundido de 240 ms |
| Personajes Lottie | Una vez por pantalla | Su propia animación, sin bucle |
| Poner algo en el bosque | Pocas veces | Baja desde `translateY(-8px) scale(0.95)`, 220 ms `--ease-out`; quitarlo, 150 ms |
| Fin de práctica | Una vez al día | Estrellas en stagger de 80 ms desde `scale(0.9)`, 300 ms `--ease-out` |
| Festejo de fin de nivel | Rara vez | La medalla entra con un resorte suave (`bounce` 0.2, 0.6 s) y caen hasta 30 hojas y pétalos de acuarela durante 2.4 s |

### Tamaños de toque
En pantallas táctiles o angostas (≤ 760 px), todo control mide al menos 44 × 44 px, incluidos los puntos del violín virtual en los juegos.

### Antes de publicar
- `/review-animations` (lo lanza la fundadora; no se puede invocar desde un agente) sobre todo cambio de movimiento, y `/impeccable audit` sobre la interfaz.
- Con movimiento reducido no queda nada que se desplace ni escale.
- Probado en un celular real, sobre todo el Eco y los toques en el mapa.
