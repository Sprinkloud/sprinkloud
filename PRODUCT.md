# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Alumnos desde unos 6 años** que practican violín en casa con su familia entre una clase y la siguiente. Usan celular, tablet o computadora por igual.
- **Maestros del club**: dan una clase virtual por semana por Google Meet, siguen la lección de la app y la presentan en la videollamada. Evalúan con estrellas y hacen avanzar al alumno.
- **Administración**: la fundadora y la Dirección Pedagógica. Inscribe alumnos y maestros, asigna niveles y revisa la app en vista previa.

## Product Purpose

Sprinkloud es la app del Club Musical Sprinkloud. Guía al alumno lección a lección por una metodología propia, desde no saber nada de violín hasta interpretar y acompañar música. El éxito es que el alumno practique varios días por semana, toque canciones completas desde el principio y entienda lo que toca.

## Positioning

Metodología de Adquisición Natural del club: oír, luego tocar, luego leer, con canciones conocidas desde la clase 1, teoría justo a tiempo y sprints musicales. El recorrido de 8 niveles, las sílabas de ritmo del club (pan, lu-na, cho-co-la-te…) y el pentagrama con dibujos (muñequito, sol, visto, fantasma) son propios.

## Operating Context

- Una clase virtual semanal, en la que el maestro presenta la app en Meet.
- Seis días de práctica corta en casa, de 10 a 15 minutos.
- Los avances, videos y preguntas se envían por el grupo de WhatsApp del club (representante y maestro). La app solo lo recuerda; no envía nada.
- Las partituras se preparan en MuseScore 3 y se importan como MusicXML.

## Capabilities and Constraints

- La app es una sola página estática (`index.html` más `config.js`) publicada en GitHub Pages, sin paso de build.
- Los datos viven en una hoja de Google a través de Apps Script (`apps-script/Código.js`).
- Hay tres roles: alumno (entra con un código), maestro y administración (entran con una clave).
- Incluye 8 niveles con 88 lecciones, práctica paso a paso, juegos de ritmo y de notas, 24 cápsulas visuales, partituras en tarjetas y en pentagrama, postura 2D, metrónomo, afinador, logros, medallas, certificados, un ranking semanal por grupo y el bosque canjeable.
- Todo está en español.
- Pendiente: 10 canciones del repertorio sin partitura. No se inventan melodías.

## Brand Commitments

- Nombre: **Club Musical Sprinkloud**. Logo de árboles en `LOGO_JPG`.
- Lema: "No buscamos la perfección para practicar: practicamos para perfeccionarnos."
- Libro de referencia de la fundadora: *Primero Escucho*.
- Textos cortos, sin justificar la metodología ante el alumno ni la familia.
- Nunca se nombran ni se insertan canales o videos de YouTube.
- Imágenes solo de fuentes gratuitas, con su licencia registrada.

## Evidence on Hand

- Mapa de la metodología: `docs/METODOLOGIA.md`, copia del documento de la Dirección Pedagógica.
- Repertorio con 11 canciones escritas y 10 pendientes (`CANCIONES` en `index.html`).
- Ilustraciones abiertas con licencia en `assets/emoji/LICENCIA.md`.
- No hay testimonios, cifras de alumnos ni precios; no se inventan.

## Product Principles

1. Se toca desde el primer día; la lectura llega después de tocar.
2. Cada pantalla es un solo paso claro que un niño entiende sin leer mucho.
3. La práctica en casa se premia con constancia: racha, estrellas, hojitas y medallas.
4. El maestro manda en el avance: la app acompaña la clase, no la reemplaza.

## Accessibility & Inclusion

WCAG AA. Sin necesidades específicas adicionales confirmadas.
