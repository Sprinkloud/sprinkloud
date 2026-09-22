# Sprinkloud: app de violín del Club Musical

App web para las clases de violín del Club Musical Sprinkloud. Funciona en cualquier navegador,
sin instalar nada y sin costos: la página se publica en GitHub Pages y los datos se guardan en
una hoja de Google mediante Apps Script.

## Qué hay en este repositorio

| Archivo | Qué es | Dónde va |
|---|---|---|
| `index.html` | Toda la app (alumno, maestra, editor de canciones, PDFs, violinista 3D, metrónomo, afinador) | Se publica en GitHub Pages |
| `Codigo.gs` | El servidor: guarda alumnos, progreso y repertorio en la hoja de Google | Se pega en Apps Script, dentro de la hoja |
| `README.md` | Esta guía | — |

`Codigo.gs` está aquí solo como respaldo. No contiene claves: la clave de la maestra se guarda
en las propiedades del script, dentro de tu cuenta de Google.

## Puesta en marcha

### 1. La base de datos (una sola vez)

1. En Google Drive crea una hoja nueva llamada **Sprinkloud App**.
2. Abre **Extensiones → Apps Script**, borra lo que haya y pega el contenido de `Codigo.gs`. Guarda.
3. Elige la función **configurar** y pulsa **Ejecutar**. Acepta los permisos que pide Google.
4. En **Registro de ejecución** aparece la **clave de la maestra**. Guárdala en un lugar seguro.

### 2. El servidor (una sola vez)

1. En Apps Script: **Implementar → Nueva implementación → Aplicación web**.
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
2. Copia la URL que termina en `/exec` y ábrela en el navegador: debe responder
   `{"ok":true,...}`.

Cada vez que cambies `Codigo.gs`: **Implementar → Gestionar implementaciones → lápiz →
Versión: Nueva versión → Implementar**. Así la URL no cambia.

### 3. Conectar la página

En `index.html`, cerca del inicio del código, está esta línea:

```js
const API_URL = '';
```

Pega ahí tu URL `/exec`. Si la dejas vacía, la app funciona en **modo demostración**
(código de alumno `SOFIA1`, clave de maestra `demo`) y no guarda nada.

### 4. Publicar la página

1. Sube `index.html` a este repositorio (rama `main`, carpeta raíz).
2. **Settings → Pages → Branch: `main` / `(root)` → Save**.
3. En uno o dos minutos la app queda en `https://sprinkloud.github.io/sprinkloud/`.

### 5. Usarla

1. Entra con la clave de la maestra y agrega a cada alumno: la app le crea un código de 6 letras.
2. Envía a cada familia el enlace de la app y el código del alumno.
3. En clase, el botón **Presentar en la videollamada** abre la pantalla para compartir en Meet.

## Notas

- La página es pública, así que la URL del servidor también lo es. Lo que protege los datos es
  la clave de la maestra (para ver y editar todo) y el código de cada alumno (que solo ve su
  propio progreso, sin las notas privadas de la maestra).
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
