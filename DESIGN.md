# DESIGN.md: Sprinkloud

Sprinkloud se ve como un libro ilustrado clásico para niños. Acuarela delicada con línea fina de tinta, paleta terrosa y apagada, papel con textura y mucho espacio en blanco. El osito del club acompaña al alumno por un bosque de pinos en calma, con luz de mañana entre las ramas.

Este documento manda sobre el aspecto visual y el movimiento de la app. Las reglas de animación siguen la filosofía de diseño de Emil Kowalski (skills `emil-design-eng`, `animate` y `review-animations` del workspace).

## 1. Dirección visual

**Descripción de referencia** (se usa tal cual como prompt al generar o encargar ilustraciones):

> Classic children's storybook illustration, delicate watercolor and fine ink linework, soft muted earthy palette of moss green, warm ochre, dusty blue and cream, gentle washes with visible paper texture and soft bleeding edges, a small anthropomorphic brown bear cub wearing a simple knitted scarf, standing in a quiet pine forest, tall pine trees, ferns, mushrooms and wildflowers, dappled morning light filtering through branches, cozy nostalgic early-20th-century picture book aesthetic, tender and whimsical mood, lots of white space around the scene, hand-drawn, storybook vignette composition.

| Rasgo | Se ve así | Evitar |
|---|---|---|
| Técnica | Acuarela suave con línea de tinta sepia fina | Vector plano, degradados digitales, 3D |
| Color | Pocos tonos por escena, lavados transparentes | Colores saturados, neón, negro puro |
| Bordes | Manchas que se abren sobre el papel | Formas con borde duro y sombra paralela |
| Composición | Viñeta centrada rodeada de papel en blanco | Escenas que llenan todo el marco |
| Luz | Mañana tamizada, cálida, sin contraste fuerte | Brillos, reflejos o luz dramática |
| Ánimo | Tierno, tranquilo, nostálgico | Estridente, infantilizado, de caricatura moderna |

### El osito

El osito es la mascota y el guía del alumno.

- Oso pardo pequeño, antropomorfo, con bufanda tejida sencilla en ocre o verde musgo.
- Aparece en el mapa (en la lección actual), en los festejos, en los avisos y en las cápsulas.
- Siempre con la misma bufanda y las mismas proporciones.
- En las ilustraciones de postura toca el violín con la técnica correcta. Las manos pueden ser de osito, pero dedos, muñeca, antebrazo y brazo se leen con claridad.

## 2. Color

La paleta sale de la descripción: musgo, ocre, azul polvoso y crema. Todo se define como variables en `:root`, con su versión nocturna ("bosque de noche") para el tema oscuro.

| Variable | Claro | Oscuro | Uso |
|---|---|---|---|
| `--paper` | `#F6F0E2` | `#1E2521` | Fondo de la página (papel crema) |
| `--paper-2` | `#EFE6D1` | `#27302A` | Tarjetas hundidas, zonas de práctica |
| `--surface` | `#FBF7EE` | `#2C3530` | Tarjetas |
| `--ink` | `#3A3128` | `#EDE6D6` | Texto (tinta sepia, nunca negro puro) |
| `--ink-2` | `#6D6152` | `#B9AF9C` | Texto secundario |
| `--line` | `#DCCFB5` | `#3E4A42` | Bordes y separadores a lápiz |
| `--moss` | `#6B7F4A` | `#9DB47A` | Acción principal, lección hecha |
| `--moss-deep` | `#48592F` | `#C2D5A3` | Títulos, énfasis |
| `--moss-soft` | `#E1E6CF` | `#34402A` | Fondos de éxito |
| `--ochre` | `#C4923A` | `#D9AE63` | Estrellas, lección actual, medallas |
| `--ochre-soft` | `#F1E0BC` | `#4A3D24` | Avisos, fondos cálidos |
| `--dusty-blue` | `#7895A6` | `#9DB6C4` | Agua, cielo, información |
| `--dusty-blue-soft` | `#DCE5E8` | `#2E3C44` | Fondos informativos |
| `--rose` | `#B0685A` | `#D69585` | Error y "así no" (terracota suave, nunca rojo) |

**Cuerdas del violín.** Conservan su identidad de color dentro de la paleta:

| Cuerda | Variable | Claro | Oscuro |
|---|---|---|---|
| Sol | `--s-sol` | `#9C5B55` | `#C98A82` |
| Re | `--s-re` | `#C4923A` | `#D9AE63` |
| La | `--s-la` | `#6B7F4A` | `#9DB47A` |
| Mi | `--s-mi` | `#6E8DA3` | `#9DB6C4` |

**Contraste.** El texto sobre `--paper` y `--surface` cumple AA (4.5:1). Los colores de las cuerdas se usan como relleno de notas y tarjetas, con texto crema encima, y se comprueban en los dos temas.

## 3. Papel, tinta y acuarela

- **Textura de papel:** un ruido SVG (`feTurbulence`) muy suave, con opacidad de 3 a 5 %, en el fondo de la página. Se dibuja una sola vez como `background-image`, sin animarlo.
- **Tarjetas:** fondo `--surface`, borde de 1 px en `--line` y radio grande (18 a 24 px). La sombra es una mancha cálida y difusa (`0 6px 18px rgba(58, 49, 40, .08)`), nunca una sombra gris dura.
- **Bordes de acuarela:** las ilustraciones SVG propias (postura, mapa, cápsulas) llevan el filtro `#acuarela`: `feTurbulence` más `feDisplacementMap` con escala 2 a 3, para que los bordes "sangren". El filtro no se aplica a texto, botones ni partituras.
- **Tinta:** los contornos de las ilustraciones van en `--ink` o sepia, de 1.5 a 2.5 px, con extremos redondeados y algo de irregularidad.
- **Espacio en blanco:** cada pantalla tiene un protagonista, sea el mapa, la lección o el juego. Alrededor queda papel vacío, sin rellenar esquinas con decoración.

## 4. Tipografía

| Rol | Fuente | Uso |
|---|---|---|
| Títulos | **Fraunces** (Google Fonts, eje `SOFT` alto, peso 600) | Nombres de nivel, títulos de pantalla, festejos |
| Texto | **Nunito Sans** (ya en uso) | Todo el texto corrido, botones y etiquetas |
| Nota a mano | **Caveat** (Google Fonts) | Frases cortas del osito, rótulos del mapa, lemas. Nunca en párrafos |
| Notas musicales y números | Fraunces | Nombres de notas grandes, puntos, contador de racha |

- Fraunces reemplaza a Sora.
- Tamaño mínimo de texto: 16 px en el alumno y 14 px en el panel del maestro.
- Interlineado de 1.5 en el texto y de 1.15 en los títulos.

## 5. Ilustraciones e imágenes

Las fuentes permitidas son todas gratuitas, y cada imagen se anota en `assets/LICENCIAS.md` con su archivo, fuente, autor, licencia y enlace.

| Tipo | Fuente | Cómo |
|---|---|---|
| Osito, escenas del mapa, festejos | IA gratuita de imágenes con el prompt de la sección 1, o ilustración encargada | Exportar en PNG con fondo transparente o WebP, a 2x |
| Postura y manos | SVG propio (ya existe en `mountPostura`) | Redibujar con línea de tinta, lavados de la paleta y el filtro `#acuarela` |
| Flora y fauna del bosque | Láminas de libros ilustrados de dominio público (Wikimedia Commons, Internet Archive, Biodiversity Heritage Library) | Recortar en viñeta y verificar el dominio público en Ecuador |
| Íconos de la interfaz | Trazo fino dibujado a mano (SVG propio) | Mismo grosor que la tinta de las ilustraciones |

Hoy el mapa, el bosque y las cápsulas usan Fluent Emoji, que son planos. Se reemplazan por ilustraciones de acuarela conforme existan, sección por sección.

## 6. Componentes

| Componente | Aspecto |
|---|---|
| Botón principal | Fondo `--moss`, texto crema, forma de píldora, sin sombra |
| Botón secundario | Borde a lápiz `--line` sobre papel, texto `--ink` |
| Tarjetas de nota | Lavado del color de la cuerda al 16 % y borde de tinta del mismo color, en tonos apagados |
| Pentagrama | Líneas en `--ink-2` de 1.2 px sobre papel; cabezas de nota con el color de la cuerda |
| Mapa del bosque | Viñeta de acuarela con sendero ocre claro. Claros circulares: hechos en musgo, actual en ocre con el osito al lado, bloqueados en papel con candado a lápiz |
| Estrellas y medallas | Ocre con contorno de tinta; la medalla parece pintada, no metálica |
| Aviso | Fondo `--ochre-soft` con el osito pequeño a la izquierda |
| Barra de navegación del alumno | Papel con línea superior a lápiz; la sección activa con fondo `--moss-soft` |

## 7. Movimiento

El movimiento sigue a Emil Kowalski. Antes de animar algo se contestan cuatro preguntas en orden: ¿se anima?, ¿para qué?, ¿con qué curva?, ¿cuánto dura? El carácter es de libro de cuentos: calmo, un poco más pausado que una app de productividad, nunca rebotón.

### Variables

```css
:root{
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);      /* entradas y respuestas */
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);  /* algo que se mueve dentro de la pantalla */
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);   /* paneles y hojas que suben */
  --dur-press: 140ms;   /* respuesta al presionar */
  --dur-fast: 180ms;    /* cambios pequeños, salidas */
  --dur-base: 240ms;    /* entradas de tarjetas y pasos */
  --dur-panel: 320ms;   /* paneles y superposiciones */
}
```

### Reglas

- Solo se animan `transform` y `opacity`. `filter: blur()` solo se usa para suavizar un cruce entre dos estados, hasta 2 px.
- Nunca `transition: all`; siempre se nombran las propiedades.
- Nunca `ease-in` en la interfaz. Para entrar y responder se usa `--ease-out`; para color y hover, `ease`.
- Nada aparece desde `scale(0)`. Se entra desde `scale(0.95)` con `opacity: 0`.
- Todo lo que se presiona responde con `transform: scale(0.97)` en `:active` (`--dur-press`, `--ease-out`).
- Salir es más rápido que entrar: entrada con `--dur-base`, salida con `--dur-fast`.
- Lo que se interrumpe con frecuencia usa transiciones, no `@keyframes`.
- Los hover van dentro de `@media (hover: hover) and (pointer: fine)`.
- No se anima nada que dispare el teclado, como la barra espaciadora en el Eco o el cambio de sección.
- Stagger de 40 a 60 ms entre elementos que entran juntos, sin bloquear la interacción.
- **Movimiento reducido** (`prefers-reduced-motion`): se quitan los desplazamientos, escalas, hojas que caen y respiraciones; quedan las transiciones de opacidad y color.

### Cada pieza de la app

| Pieza | Frecuencia | Movimiento |
|---|---|---|
| Cambio de sección (Inicio, Partituras…) | Decenas de veces al día | Ninguno: cambia al instante, solo el color de la pestaña activa (`ease`, 120 ms) |
| Botones y claros del mapa | Muchas veces | `scale(0.97)` al presionar, 140 ms `--ease-out` |
| Lección actual en el mapa | Siempre visible | Anillo ocre que "respira" con opacidad de .5 a 1 en 3 s `ease-in-out`, sin escala |
| Abrir una práctica | Varias veces al día | La hoja sube desde abajo: `translateY(24px)` y opacidad, 320 ms `--ease-drawer`; cierra en 180 ms |
| Pasar de paso en la práctica | Varias veces por práctica | El paso nuevo entra desde `translateX(16px)` con opacidad, 240 ms `--ease-out`; el anterior sale en 160 ms |
| Barra de avance | Cada paso | `transform: scaleX()` con `transform-origin: left`, 400 ms `--ease-out` |
| Tarjeta o nota que suena | Varias veces por segundo | Solo cambia el color, 80 ms `ease`, sin escala |
| Toque en el Eco | Muchas veces por ronda | El botón baja 3 px, 90 ms, sin transición de vuelta larga |
| Acierto en un juego | Cada pregunta | La carta pasa a musgo con `scale(0.97)` → `1`, 160 ms `--ease-out` |
| Error en un juego | Cada pregunta | Vaivén horizontal de 4 px, dos veces, 240 ms, con color terracota |
| Combo | Ocasional | El texto entra desde `scale(0.95)` y opacidad, 180 ms |
| Cápsulas | Una vez por lección | Los dibujos entran en stagger de 60 ms, 300 ms `--ease-out`; la clave de Sol se dibuja con trazo (`stroke-dashoffset`) en 1.2 s `--ease-in-out` |
| "Así no" en la postura | Pocas veces | Cruce entre ilustraciones con `blur(2px)`, 200 ms `ease` |
| Poner algo en el bosque | Pocas veces | Baja desde `translateY(-8px) scale(0.95)` hasta su lugar, 220 ms `--ease-out`; quitarlo, 150 ms |
| Fin de práctica | Una vez al día | Estrellas en stagger de 80 ms desde `scale(0.9)`, 300 ms `--ease-out` |
| Festejo de fin de nivel | Rara vez | Aquí sí hay deleite: la medalla entra con resorte suave (`bounce` 0.2, 0.6 s) y caen hojas y pétalos de acuarela (máximo 30, 2.4 s `linear`) en lugar de confeti de colores |

### Lo que hay que ajustar en el código actual

| Antes | Después | Por qué |
|---|---|---|
| `.pr-bar i` y `.lv-bar i` con `transition: width` | `transform: scaleX()` con `transform-origin: left` | `width` fuerza layout; `transform` va por GPU |
| `@keyframes pop` desde `scale(.7)` | Desde `scale(0.95)` con `opacity: 0` y `--ease-out` | Nada aparece de casi cero |
| `.btn` con `transition: background, border-color` y sin `:active` | Agregar `:active{transform:scale(.97)}` con `--dur-press` | El botón tiene que sentirse presionado |
| Anillo del claro actual con `scale` infinito | Respiración solo de opacidad, 3 s | Movimiento constante cansa; la opacidad basta |
| Confeti de colores (`caer`, 760° de giro) | Hojas y pétalos de acuarela, pocos y lentos, solo en festejos de nivel | El confeti chillón rompe el tono de libro; también se usa hoy al terminar cada juego |
| `@keyframes clave` con `blur(6px)` | Trazo de la clave con `stroke-dashoffset`, 1.2 s | Dibujar la clave es la explicación; el desenfoque no enseña nada |
| `.pollito` y `hop` con saltos de 16 px | 8 px con `--ease-out` | Más calmo, acorde al ánimo |
| Hover sin media query en `.btn`, `.item` y `button.rc` | Envolver en `@media (hover: hover) and (pointer: fine)` | En los celulares el hover queda pegado |

## 8. Checklist antes de publicar un cambio visual

- [ ] Usa solo las variables de color de la sección 2, en tema claro y oscuro.
- [ ] Toda imagen nueva está anotada en `assets/LICENCIAS.md`.
- [ ] La pantalla tiene un solo protagonista y espacio en blanco alrededor.
- [ ] Las animaciones pasan la revisión de la skill `review-animations`.
- [ ] Con movimiento reducido no queda nada que se desplace ni escale.
- [ ] Se probó en un celular real, sobre todo el Eco y los toques en el mapa.
