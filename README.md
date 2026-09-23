# Sprinkloud: app de violín del Club Musical

App web para las clases de violín del Club Musical Sprinkloud. Funciona en cualquier navegador,
sin instalar nada y sin costos: la página se publica en GitHub Pages y los datos se guardan en
una hoja de Google mediante Apps Script.

## Qué hay en este repositorio

| Archivo | Qué es | Dónde va |
|---|---|---|
| `index.html` | Toda la app (alumno, maestra, editor de canciones, PDFs, violinista 3D, metrónomo, afinador) | Se publica en GitHub Pages |
| `config.js` | La dirección del servidor (URL `/exec`) | Se publica junto a `index.html` |
| `apps-script/Código.js` | El servidor: guarda alumnos, maestros, progreso y repertorio en la hoja de Google | Apps Script, dentro de la hoja (se sube con `clasp push`) |
| `README.md` | Esta guía | — |

El código del servidor no contiene claves: la clave de administración se guarda en las
propiedades del script, dentro de tu cuenta de Google.

## Puesta en marcha

### 1. La base de datos (una sola vez)

1. En Google Drive crea una hoja nueva llamada **Sprinkloud App**.
2. Abre **Extensiones → Apps Script**, borra lo que haya y pega el contenido de `apps-script/Código.js`. Guarda.
3. Elige la función **configurar** y pulsa **Ejecutar**. Acepta los permisos que pide Google.
4. En **Registro de ejecución** aparece la **clave de administración**. Guárdala en un lugar
   seguro: es la única que puede inscribir alumnos y manejar a los maestros.

### 2. El servidor (una sola vez)

1. En Apps Script: **Implementar → Nueva implementación → Aplicación web**.
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
2. Copia la URL que termina en `/exec` y ábrela en el navegador: debe responder
   `{"ok":true,...}`.

Cada vez que cambies el servidor: **Implementar → Gestionar implementaciones → lápiz →
Versión: Nueva versión → Implementar**. Así la URL no cambia. Con clasp: `clasp push` y
después `clasp deploy -i <id de la implementación>` (sin `-i` se crea otra URL).

### 3. Conectar la página

En `config.js` está esta línea:

```js
window.SPRINKLOUD_API = '';
```

Pega ahí tu URL `/exec`. Si la dejas vacía, la app funciona en **modo demostración**
(código de alumno `SOFIA1`, clave de maestra `maestra1`, clave de administración `demo`)
y no guarda nada.

### 4. Publicar la página

1. Sube `index.html` a este repositorio (rama `main`, carpeta raíz).
2. **Settings → Pages → Branch: `main` / `(root)` → Save**.
3. En uno o dos minutos la app queda en `https://sprinkloud.github.io/sprinkloud/`.

### 5. Usarla

1. Entra con la **clave de administración** (la que da `configurar()`), abre la pestaña
   **Administración** y crea el acceso de cada maestro: la app le genera su propia clave.
2. En la misma pestaña inscribe a los alumnos. Eliges el maestro y el nivel y la lección
   en que empieza, para que quien ya sabe tocar no arranque desde cero. La app le crea un
   código de 6 letras.
3. Envía a cada familia el enlace de la app y el código del alumno, y a cada maestro su clave.
4. En clase, el botón **Presentar en la videollamada** abre la pantalla para compartir en Meet.

## Quién puede hacer qué

| Acción | Administración | Maestro | Alumno |
|---|---|---|---|
| Dar clase, evaluar con estrellas, avanzar de lección, notas privadas | Sí | Sí | No |
| Crear y editar canciones del repertorio | Sí | Sí | No |
| Inscribir o quitar alumnos, cambiarles el nivel y el maestro | Sí | No | No |
| Crear maestros, cambiar su clave, desactivar o borrar su acceso | Sí | No | No |
| Borrar canciones del repertorio | Sí | No | No |
| Ver su lección, sus notas, metrónomo y afinador | Sí | Sí | Sí |

Cuando un maestro se desvincula del club, entra en **Administración → Maestros** y pulsa
**Desactivar acceso**: deja de poder entrar de inmediato, pero sus alumnos y todo el progreso
se conservan. **Borrar** lo saca de la lista y deja a sus alumnos sin maestro asignado.

## Notas

- La página es pública, así que la URL del servidor también lo es. Lo que protege los datos son
  las claves: la de administración, la de cada maestro y el código de cada alumno (que solo ve
  su propio progreso, sin las notas privadas de los maestros).
- Las claves de los maestros se guardan en la hoja **Maestros**. Cualquiera que pueda abrir esa
  hoja las ve, así que compártela solo con quien administre el club.
- Para cambiar la clave: edita la función `cambiarClave` en Apps Script, ejecútala y vuelve a
  publicar una versión nueva de la implementación.
- Respaldos: la hoja de Google guarda historial de versiones (**Archivo → Historial de versiones**).
- Para agregar el Nivel 2: en `index.html` busca la lista `NIVELES`, que incluye un comentario
  con el formato a seguir.
- Los PDFs del repertorio se generan en el propio navegador, no hay que subirlos a ningún lado.

## Contenido del Nivel 1

Ocho lecciones ("Mi primera canción") con cinco canciones base: Los pollitos dicen, Estrellita,
Himno a la alegría, Martinillo y Cascabel. Todas en la escala de Do en primera posición, primero
en pizzicato y después con arco. Las notas se muestran en tarjetas de colores, sin pentagrama,
hasta el nivel en que el alumno aprende a leer partitura.
