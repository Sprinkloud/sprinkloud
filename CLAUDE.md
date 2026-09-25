# CLAUDE.md: Sprinkloud

App web de clases de violín del Club Musical Sprinkloud. Tiene tres roles: alumno (entra con un código de 6 letras), maestro (clave propia, guardada en la hoja `Maestros`) y administración (la clave de las Script Properties). Incluye lecciones, repertorio, editor de canciones, PDFs, un violinista 3D, un metrónomo, un afinador y un modo de presentación para Meet.

- Repo: https://github.com/Sprinkloud/sprinkloud (rama `main`)
- Producción: https://sprinkloud.github.io/sprinkloud/ (GitHub Pages, `main` / raíz)
- Guía de puesta en marcha para la maestra: [README.md](README.md)
- Mapa de la metodología (niveles, cápsulas visuales, gamificación, próximas entregas): [docs/METODOLOGIA.md](docs/METODOLOGIA.md). Es la copia del documento en línea de la Dirección Pedagógica; si no coinciden, manda el documento en línea.

## Arquitectura

No hay build, dependencias ni `package.json`:

| Archivo | Rol |
|---|---|
| `index.html` | Toda la app: HTML, CSS y JS en un único archivo (unas 2100 líneas). Se sirve tal cual desde GitHub Pages. |
| `config.js` | Solo define `window.SPRINKLOUD_API` (la URL `/exec`). `index.html` lo carga, y si falta o está vacío la app entra en modo demostración. |
| `apps-script/Código.js` | Backend en Google Apps Script, ligado a la hoja de Google "Sprinkloud App". Se sincroniza con clasp (ver Despliegue). `appsscript.json` es el manifiesto (zona horaria, webapp). |

**Flujo de datos:** `Api.call(accion, datos)` en `index.html` hace `fetch POST` a `API_URL` con el JSON `{accion, ...datos}`. `doPost` → `manejar(q)` en `Código.js` hace un `switch` por `accion` y responde siempre con `{ok, ...}` o con `{ok:false, error}`.

Acciones: `alumno` (devuelve también `grupo`, el ranking semanal del grupo del mismo maestro, y `maestroNombre`), `guardarProgreso` (el alumno guarda su propia columna `progreso` con su código), `acceso` (login de maestro o administración, devuelve el `rol`), `nuevoAlumno`, `guardarAlumno`, `borrarAlumno`, `nuevoMaestro`, `guardarMaestro`, `borrarMaestro`, `guardarCancion`, `borrarCancion`. `verificar(clave, soloAdmin)` identifica al usuario con `identificar()`. Las acciones de alta y baja de alumnos y maestros, y `borrarCancion`, exigen `soloAdmin`. Las escrituras van dentro de `conCandado()` (LockService).

**Base de datos:** hay tres hojas, definidas en `HOJAS` de `Código.js`:
- `Alumnos`: id, nombre, codigo, nivel, leccion, estrellas, canciones, checks, notas, creado, actualizado, maestro, progreso
  - `progreso` (JSON, lo escribe el alumno): `dias` (fechas de práctica), `juegos` (mejores estrellas por `nivel.leccion.juego`), `bosque` ([tipo, fila, col]), `festejos` (niveles ya celebrados), `semana` ({id ISO, puntos, dias}). `hoja()` agrega los encabezados que falten, así que no hace falta volver a ejecutar `configurar()` por columnas nuevas.
- `Repertorio`: id, titulo, origen, porque, nivel, leccion, frases, creado, actualizado
- `Maestros`: id, nombre, clave, activo, creado, actualizado

Las columnas de `COLUMNAS_JSON` se guardan como JSON serializado (máximo `MAX_CELDA` = 45000 caracteres) y las de `COLUMNAS_BOOL` como booleanos. Solo se pueden escribir los campos de `EDITABLES_*`. Si agregas una hoja o una columna, hay que volver a ejecutar `configurar()` en producción.

**Seguridad:** la clave de administración está en las Script Properties (`CLAVE_MAESTRA`), nunca en el repo. Las claves de los maestros están en la hoja `Maestros`, y solo la administración las recibe. La acción `alumno` elimina `notas` y `codigo` de la respuesta. `guardarAlumno` descarta `maestro` si quien guarda no es administración. El ranking solo expone el nombre de pila y los puntos de la semana.

## index.html: secciones

El JS está dividido con comentarios `/* ============ nombre ============ */`. Para ubicarte, busca por el nombre de la sección:
configuración (`API_URL`) · utilidades (`$`, `$$`, `esc`, `toast`) · música (`STR`, `DEDO`, `LECCIONES`) · niveles (`NIVELES`) · audio (WebAudio) · micrófono y detección de altura · conexión con la hoja de Google (`Api`, `Demo`, `Store`) · estado de la app (`S`, `go`, `renderApp`) · entrada · vista alumno · metrónomo · afinador · diapasón interactivo · violinista 3D (three.js) · vista maestra · repertorio: catálogo, editor y PDF (jsPDF) · modo presentación · inicio.

- Librerías cargadas por CDN: three.js r128 y jsPDF 2.5.1 (cdnjs), y Google Fonts (Sora, Nunito Sans).
- Estado global en `S`. `Store` hace actualizaciones optimistas y avisa a quien esté suscrito con `Store.on`/`emit`.
- Los temas claro y oscuro usan las variables CSS de `:root` y `[data-theme]`.
- La sesión se guarda en `localStorage` con la clave `sprinkloud-sesion`.

## Desarrollo y pruebas

- **Probar en local:** abre `index.html` en el navegador o sírvelo con `npx serve .` o `python -m http.server`. El micrófono (afinador) necesita `localhost` o HTTPS.
- **Modo demostración:** si `SPRINKLOUD_API` está vacío, la app usa el objeto `Demo` en memoria (alumno `SOFIA1`, maestra `maestra1`, administración `demo`) y no guarda nada. ⚠️ `config.js` apunta a **producción**, así que al probar en local se escribe en la hoja real. Para experimentar, usa una copia con un `config.js` vacío y **no subas `config.js` vacío**.
- No hay tests automatizados ni linter. Para comprobar que la página carga sin errores, ábrela en Chrome headless (`--headless=new --dump-dom --enable-logging=stderr`).

## Despliegue

- **Backend con clasp:** `.clasp.json` (en la raíz, ignorado) apunta al script `17Y9TA0cX0mvmlZBQnpkgGxyAoy_YOvo2og220UlUtMRhCXBmX6jysb8P` con `rootDir: apps-script`; si falta, `clasp clone <scriptId> --rootDir ./apps-script`. `clasp push` sube los cambios. Para publicar, `clasp deploy -i <deploymentId>` actualiza **la implementación existente** (producción: `AKfycbz6dZlLukO0fF58FbfALdmxhd_tyG3QjPo3QuKYDmQ1DThfQS2kIa91EEVeeL6CgPTN1g`), así la URL `/exec` no cambia. Nunca uses `clasp deploy` sin `-i`: crea una implementación nueva con otra URL. `.clasp.json` y `.clasprc.json` están en `.gitignore`.
- **Frontend:** basta con hacer push a `main`. GitHub Pages se actualiza en 1 o 2 minutos.
- **Orden:** si un cambio toca el protocolo (acciones u hojas), el frontend y el backend tienen que salir juntos. Primero se actualiza Apps Script, se ejecuta `configurar()` si hay hojas o columnas nuevas y se actualiza la implementación. Después se hace push del frontend.

## Convenciones

- Todo en **español**: identificadores (`alumno`, `leccion`, `guardarCancion`), mensajes de error y textos de la interfaz. Los mensajes de error van dirigidos a la maestra o a las familias, en tono amable.
- JS compacto y de estilo funcional: arrow functions de una línea, plantillas HTML con template strings y `esc()` para escapar cualquier dato del usuario.
- `Código.js` usa `function () {}` al estilo de Apps Script (V8). No uses sintaxis que Apps Script no admita.
- Si agregas una acción nueva, impleméntala **en los dos lados**: `manejar()` en `Código.js` y `Demo.call()` en `index.html`.
- Para agregar un nivel, añade un objeto a `NIVELES` (el formato está en el comentario de esa sección). Las claves de progreso siguen el formato `"nivel.leccion"` (función `K()`).
- Contenido para el alumno: poco texto y visual, paso a paso (estilo Duolingo). No escribas en la app justificaciones de la metodología. No menciones ni insertes videos de YouTube. Las imágenes deben salir de fuentes gratuitas y quedar anotadas con su licencia.
- Sílabas de ritmo: se usan las del club (pan, lu-na, cho-co-la-te, grán-chi-co, ca-ma-rón, va-lien-te, blan-co, que-so, mú-si-ca, Le-e, y, "1 - 2"…), las mismas de la herramienta https://sprinkloud.vercel.app/Teoría Musical/Ritmo.html. En las tarjetas de canciones y en los PDF se calculan con `silabas(frase)`.
- La vista del alumno va por secciones (`S.alSec`): Inicio, Partituras, Herramientas, Logros y Mi bosque (`SECCIONES`, `renderInicio`, `renderPartituras`, `herramientasHTML`, `renderLogros`, `renderBosque`). No mezcles contenidos entre secciones.
- Hojitas del bosque: estrella del maestro 10, estrella de juego 1, día de práctica 2. Se calculan (`hojasGanadas`) y se restan los objetos puestos (`ITEMS`), así que no se pueden duplicar.
- "Ver la app como alumno" (`abrirVistaPrevia`, `S.preview`): la administración y los maestros ven cualquier nivel y lección. En vista previa no se guarda nada en la hoja.
- Práctica del alumno (Entrega 1 de docs/METODOLOGIA.md):
  - Cada lección tiene `ritmo:{nueva, juego}` y `visual` (la cápsula), definidos en `PRACTICA_N1`.
  - Secciones del código: "ritmo del club" (`CELULAS`, `celulasHasta`, `tocarCelulas`), "juegos de ritmo" (`mountJuego`: eco, cual, completa; `mountRitmoPanel`), "cápsulas visuales" (`CAPSULAS`, `miniQuiz`) y "práctica paso a paso" (`pasosDe`, `PASOS`, overlay `#practica`).
  - Las estrellas de los juegos y los días de práctica van a `progreso` en la hoja (`guardarJuego`, `marcarPractica`, `guardarProgreso`). Lo que quedó guardado solo en el navegador se migra al entrar (`migrarAvanceLocal`).
- No agregues un paso de build: la app es `index.html` más `config.js`, y se publica tal cual.
- Los roles en `S.rol` son `'admin'`, `'maestro'` y `'alumno'`. En cambio, `'maestra'` es el nombre de la **vista** (`go('maestra')`), no un rol.

## Estado del proyecto

Última actualización: 25 de septiembre de 2026. Las entregas vienen de [docs/METODOLOGIA.md](docs/METODOLOGIA.md), sección "Siguientes pasos en la app".

| Entrega | Estado |
|---|---|
| Roles de administración y maestros, `config.js`, servidor sincronizado con clasp | Publicado (implementación de Apps Script, versión 2) |
| 1. Lección paso a paso, ritmo del club, juegos Eco / ¿Cuál sonó? / Completa el compás, cápsulas 1–4 del Nivel 1 | Publicado en GitHub Pages |
| Secciones del alumno (Inicio, Partituras, Herramientas, Logros, Mi bosque), vista previa para la administración | Hecho |
| 2. Premios: racha, calendario, insignias, medallas, festejo de fin de nivel, certificado PDF, ranking del grupo, aviso de video con 2 estrellas, bosque con tienda | Hecho |
| 3. Ilustraciones 2D (postura, mano izquierda, mano del arco, brazo) en lugar del violinista 3D | Pendiente |
| 4. Nivel 2: 10 lecciones, cápsulas 5–9, repertorio | Pendiente |
| 5. Nivel 3 y partituras: pentagrama del club, cápsulas 10–17, juegos Del pentagrama al violín y Del oído al violín, MusicXML de MuseScore | Pendiente |

Pendientes técnicos:
- El sonido y la latencia del juego Eco no se han probado en celulares reales.
