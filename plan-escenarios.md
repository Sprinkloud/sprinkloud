# Plan: más escenarios para pegar stickers (opción 2, 12-nov-2026)

## La decisión de la dueña

- **Se descartó la casita en cuadrícula:** «No me gustó como quedó. Nos vamos por la opción 2».
- **La casita de stickers se queda como está:** es la que está publicada, sobre el dibujo `casa-vacia.webp`.
- **Escenarios nuevos que se compran:** en la tienda hay stickers para ir pegando en ellos. La dueña dijo que los alumnos «ya se enamoraron de poner stickers en una base».
- **Los primeros escenarios:** el lago (ir a pescar), el picnic en el prado y el huerto.
- **Sin osito:** los escenarios son solo para pegar stickers. El osito que camina y su títere se borraron.

## Cómo se ve

- **Cada escenario es un fondo vacío** con la misma vista en diagonal que la casita, como una isla sobre papel blanco. Los hace Gemini (etapa 18 de `Libro_Sprinkloud/herramientas/ilustraciones`), con la casita adjunta para copiar la vista, el trazo y el color.
- **Arriba de la casita, un selector de escenarios:** Casita · Lago · Picnic · Huerto.
  - Un escenario sin comprar se ve con 🔒. Al tocarlo, se abre la tienda en ese escenario.
  - Como en todo el juego, no hay textos que expliquen nada.
- **Pegar, mover, agrandar, voltear y devolver a la bandeja** funcionan igual que hoy en la casita.
- **Cualquier sticker se puede pegar en cualquier escenario comprado.** La tienda los ordena por escenario solo para encontrarlos.

## La tienda

**Los escenarios:** un tipo nuevo de cosa, `tipo: 'escenario'`, más caro que un sticker. Propuesta: 120 malvaviscos cada uno; el precio lo decide la dueña.

**Los stickers de cada escenario** (✓ = ya existe el dibujo en `Libro_Sprinkloud/img/stickers`):

| Escenario | Stickers |
|---|---|
| Lago | caña de pescar ✓, cesta de pesca ✓, canoa, peces saltando, nenúfares con ranita, patitos |
| Picnic | cesta de picnic ✓, manta de cuadros, sándwiches y limonada, cometa, sombrilla |
| Huerto | regadera ✓, carretilla ✓, pala y rastrillo ✓, zanahorias, espantapájaros, coles |

- Precios de 15 a 50, como los de hoy.
- Los nuevos se piden a Gemini con encuadre de objeto, sin personajes y sin fondo, y llevan el borde blanco de sticker, igual que los de la tienda (`herramientas/arte.py`).

## Datos y servidor (`Registro_Sprinkloud/maestros/Código.js`)

- **En `TIENDA`:** los escenarios (`{ id: 'escenario-lago', tipo: 'escenario', … }`) y los stickers con `escena: 'lago' | 'picnic' | 'huerto'`.
- **En la casa,** cada sticker guarda además `e`, el escenario donde está pegado. Si no lo tiene, es la casa: así todo lo que los alumnos ya pegaron sigue igual.
- **`guardarCasa_`** solo acepta `e` de la casa o de un escenario que el alumno compró.
- **Pruebas:** `pruebas/juego_test.js` (comprar un escenario, pegar en él, no pegar en uno sin comprar).

## La app (`js/app.js`)

- Se parte de la casita **publicada**, con sus pestañas de cuartos. Lo del osito que camina y del mapa con zoom se borró el 12-nov.
- Los fondos van en `assets/ilustraciones/escenario-<id>.webp`.
- La tarjeta para compartir dibuja el escenario que se está viendo.

## Orden

1. **Los 3 fondos con Gemini:** la dueña los aprueba.
2. **Los stickers nuevos de cada escenario.**
3. **Servidor:** tienda, `e` en la casa y pruebas.
4. **App:** selector, tienda por escenario y compartir.
5. **Upload** con la skill `subir-sprinkloud`.
