/* Conversación con el sistema (Registro_Sprinkloud/maestros, sección 9). El alumno entra con ?k=<clave>, que se guarda
   en el celular. Con ?demo=1 todo pasa en el navegador con las mismas reglas del servidor (para probar sin tocar datos):
   ?demo=1&semana=9&dia=2026-11-03&ins=piano cambian la lección, el día y el instrumento de la prueba. */
window.Api = (function () {
  'use strict';
  const q = new URLSearchParams(location.search);
  const DEMO = q.has('demo');
  let clave = q.get('k');
  try {
    if (clave) localStorage.setItem('bosque-clave', clave);
    else clave = localStorage.getItem('bosque-clave');
  } catch (e) { }
  /* la clave se queda en la dirección: al fijar la app en la pantalla (agregar a inicio / instalar), el ícono abre esta
     misma dirección (manifest.json no tiene start_url a propósito). En el iPhone, la app fijada no comparte lo guardado
     con Safari: sin la clave en la dirección, pediría el enlace otra vez (29-oct) */
  if (clave && !DEMO && q.get('k') !== clave) history.replaceState(null, '', location.pathname + '?k=' + encodeURIComponent(clave));
  /* Versión libre (pedido de la dueña, 30-oct): quien entra sin el enlace del maestro juega gratis, guardado en su celular,
     con energía diaria y hasta el final de la etapa 3; los libros quedan en Amazon y los planes del club dan acceso total.
     ?demo=1&libre=1 la prueba con su propio guardado. */
  const LIBRE = q.has('libre') || (!DEMO && !clave);
  const LOCAL = DEMO || LIBRE;   // todo pasa en el navegador, con las mismas reglas del servidor
  /* cada actividad gasta 2 y cada error 2 más; se recarga a medianoche. Una práctica del día trae de 18 a 30 preguntas
     (4 actividades): sin errores gasta 8 y alcanza; con muchos errores se acaba antes (pedido de la dueña, 30-oct) */
  const ENERGIA_DIA = 20, COSTO_ACTIVIDAD = 2, COSTO_ERROR = 2;
  const ULTIMA_LIBRE = 27;   // la versión libre llega hasta el final de la etapa 3 (6 + 8 + 13 lecciones)
  const PARA_PASAR = .7;   // con el 70 % de aciertos en la práctica del día, al día siguiente se abre la lección siguiente (17-nov-2026: antes 80 %; igual que el servidor)
  const gasto = (aciertos, intentos) => intentos ? COSTO_ACTIVIDAD + COSTO_ERROR * (intentos - aciertos) : 0;

  /* Las lecciones 20 a 23 son distintas en piano y en violín: el tema viene como «piano / violín» y el objetivo como
     «Piano: … Violín: …». Cada alumno ve solo lo de su instrumento. */
  function parte(t, ins) {
    const x = String(t || ''), m = x.match(/^Piano: (.*?) Violín: (.*)$/);
    if (m) return ins === 'violin' ? m[2] : m[1];
    const p = x.split(' / ');
    return p.length === 2 ? p[ins === 'violin' ? 1 : 0] : x;
  }
  function porInstrumento(d) {
    const e = d && (d.camino ? d : d.estado);
    if (!e || !e.instrumento) return d;
    if (e.leccion) { e.leccion.tema = parte(e.leccion.tema, e.instrumento); e.leccion.objetivo = parte(e.leccion.objetivo, e.instrumento); }
    (e.camino || []).forEach(c => { c.tema = parte(c.tema, e.instrumento); });
    return d;
  }
  async function get() {
    const r = await fetch(window.BOSQUE_API + '?api=juego&k=' + encodeURIComponent(clave));
    const d = await r.json();
    if (d.error) throw new Error(d.error);
    return porInstrumento(d);
  }
  async function post(cuerpo) {
    const r = await fetch(window.BOSQUE_API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ k: clave }, cuerpo)) });
    const d = await r.json();
    if (d.error) throw new Error(d.error);
    return porInstrumento(d);
  }

  /* ---------- Modo de prueba: las reglas del servidor, guardadas en el navegador ---------- */
  const TIENDA = [
    ['cuadro-osito', 'sala-pared', 'Cuadro del osito', 15],
    ['reloj-cuco', 'sala-pared', 'Reloj cucú', 35],
    ['guirnalda', 'sala-pared', 'Guirnalda de hojas', 20],
    ['sillon', 'sala-sillon', 'Sillón acolchado', 40],
    ['cojines', 'sala-sillon', 'Cojines', 25],
    ['alfombra-redonda', 'sala-alfombra', 'Alfombra redonda', 20],
    ['alfombra-hojas', 'sala-alfombra', 'Alfombra de hojas', 35],
    ['piano-madera', 'sala-musica', 'Piano de madera', 80],
    ['atril-violin', 'sala-musica', 'Atril con violín', 60],
    ['metronomo', 'sala-musica', 'Metrónomo', 35],
    ['mesa-comedor', 'sala-mesa', 'Mesa del comedor', 45],
    ['tetera', 'cocina-estufa', 'Estufa con tetera', 15],
    ['olla-chocolate', 'cocina-estufa', 'Olla de chocolate', 30],
    ['cortinas', 'cocina-ventana', 'Cortinas de cuadros', 15],
    ['maceta', 'cocina-ventana', 'Maceta con flores', 20],
    ['tazas', 'cocina-mesa', 'Tazas de cacao', 15],
    ['pastel-miel', 'cocina-mesa', 'Pastel de miel', 25],
    ['tarro-miel', 'cocina-repisa', 'Tarro de miel', 20],
    ['frascos-mermelada', 'cocina-repisa', 'Frascos de mermelada', 20],
    ['cama-parches', 'dorm-cama', 'Cama de parches', 60],
    ['cama-hojas', 'dorm-cama', 'Cama de hojas', 50],
    ['lampara', 'dorm-mesita', 'Lámpara de aceite', 30],
    ['libros', 'dorm-mesita', 'Libros de cuentos', 15],
    ['calcetines', 'dorm-pared', 'Calcetines tejidos', 20],
    ['farolito', 'dorm-pared', 'Farolito', 30],
    ['banca', 'jardin-banca', 'Banca de troncos', 35],
    ['columpio', 'jardin-banca', 'Columpio', 50],
    ['flores-jardin', 'jardin-flores', 'Flores del jardín', 20],
    ['calabazas', 'jardin-flores', 'Calabazas', 25],
    ['palitos-malvavisco', 'jardin-fogata', 'Malvaviscos en palitos', 15]
  ].map(([id, lugar, nombre, precio]) => ({ id, lugar, nombre, precio })).concat([
    /* los mapas del álbum y sus stickers (16-nov-2026): igual que TIENDA en Registro_Sprinkloud/maestros/Código.js */
    { id: 'mapa-lago', tipo: 'mapa', mapa: 'lago', lugar: 'lago', nombre: 'El lago', precio: 900 },
    { id: 'lago-nenufares-rana', mapa: 'lago', lugar: 'lago', nombre: 'Nenúfares con ranita', precio: 60, tam: 17 },
    { id: 'lago-peces', mapa: 'lago', lugar: 'lago', nombre: 'Peces saltando', precio: 80, tam: 14 },
    { id: 'lago-cesta-pesca', mapa: 'lago', lugar: 'lago', nombre: 'Cesta de pesca', precio: 90, tam: 14 },
    { id: 'lago-patitos', mapa: 'lago', lugar: 'lago', nombre: 'Mamá pata y patitos', precio: 110, tam: 20 },
    { id: 'lago-cana-pescar', mapa: 'lago', lugar: 'lago', nombre: 'Caña de pescar', precio: 130, tam: 17 },
    { id: 'lago-canoa', mapa: 'lago', lugar: 'lago', nombre: 'Canoa', precio: 250, tam: 30 },
    { id: 'lago-velero', mapa: 'lago', lugar: 'lago', nombre: 'Velero', precio: 220, tam: 26 },
    { id: 'lago-salvavidas', mapa: 'lago', lugar: 'lago', nombre: 'Salvavidas', precio: 60, tam: 12 },
    { id: 'lago-libelulas', mapa: 'lago', lugar: 'lago', nombre: 'Libélulas', precio: 80, tam: 14 },
    { id: 'lago-tortuga-tronco', mapa: 'lago', lugar: 'lago', nombre: 'Tortuga en el tronco', precio: 110, tam: 18 },
    { id: 'lago-cisne', mapa: 'lago', lugar: 'lago', nombre: 'Cisne', precio: 130, tam: 16 },
    { id: 'lago-garza', mapa: 'lago', lugar: 'lago', nombre: 'Garza', precio: 110, tam: 15 },
    { id: 'lago-juncos', mapa: 'lago', lugar: 'lago', nombre: 'Juncos', precio: 60, tam: 14 },
    { id: 'lago-farol-muelle', mapa: 'lago', lugar: 'lago', nombre: 'Farol del muelle', precio: 90, tam: 11 },
    { id: 'lago-cubeta-peces', mapa: 'lago', lugar: 'lago', nombre: 'Cubeta de peces', precio: 80, tam: 12 },
    { id: 'lago-red-pesca', mapa: 'lago', lugar: 'lago', nombre: 'Red de pesca', precio: 70, tam: 14 },
    { id: 'lago-tienda-campana', mapa: 'lago', lugar: 'lago', nombre: 'Tienda de campaña', precio: 200, tam: 26 },
    { id: 'lago-fogatita-olla', mapa: 'lago', lugar: 'lago', nombre: 'Fogatita con olla', precio: 150, tam: 16 },
    { id: 'lago-toalla-sombrero', mapa: 'lago', lugar: 'lago', nombre: 'Toalla con sombrero', precio: 70, tam: 16 },
    { id: 'lago-barquito-papel', mapa: 'lago', lugar: 'lago', nombre: 'Barquitos de papel', precio: 80, tam: 16 },
    { id: 'lago-ranitas', mapa: 'lago', lugar: 'lago', nombre: 'Ranitas', precio: 90, tam: 16 },
    { id: 'lago-balsa-troncos', mapa: 'lago', lugar: 'lago', nombre: 'Balsa de troncos', precio: 180, tam: 24 },
    { id: 'lago-bote-cisne', mapa: 'lago', lugar: 'lago', nombre: 'Bote cisne', precio: 240, tam: 26 },
    { id: 'lago-puente-arco', mapa: 'lago', lugar: 'lago', nombre: 'Puente de arco', precio: 200, tam: 32 },
    { id: 'lago-castor-presa', mapa: 'lago', lugar: 'lago', nombre: 'Castor y su presa', precio: 130, tam: 18 },
    { id: 'lago-nutria', mapa: 'lago', lugar: 'lago', nombre: 'Nutria', precio: 120, tam: 16 },
    { id: 'lago-boya', mapa: 'lago', lugar: 'lago', nombre: 'Boya con gaviota', precio: 80, tam: 12 },
    { id: 'lago-hamaca', mapa: 'lago', lugar: 'lago', nombre: 'Hamaca', precio: 160, tam: 24 },
    { id: 'lago-farolitos-flotantes', mapa: 'lago', lugar: 'lago', nombre: 'Farolitos flotantes', precio: 120, tam: 18 },
    { id: 'lago-piedras-paso', mapa: 'lago', lugar: 'lago', nombre: 'Piedras de paso', precio: 70, tam: 20 },
    /* 26-nov-2026: el mapa del picnic con sus 30 stickers (los pintó la tarea diaria; la dueña dijo «upload») */
    { id: 'mapa-picnic', tipo: 'mapa', mapa: 'picnic', lugar: 'picnic', nombre: 'El picnic', precio: 1200 },
    { id: 'picnic-cesta-picnic', mapa: 'picnic', lugar: 'picnic', nombre: 'Cesta de picnic', precio: 100, tam: 16 },
    { id: 'picnic-manta-picnic', mapa: 'picnic', lugar: 'picnic', nombre: 'Manta de cuadros', precio: 90, tam: 24 },
    { id: 'picnic-sandwiches-limonada', mapa: 'picnic', lugar: 'picnic', nombre: 'Sándwiches y limonada', precio: 110, tam: 18 },
    { id: 'picnic-cometa', mapa: 'picnic', lugar: 'picnic', nombre: 'Cometa', precio: 150, tam: 14 },
    { id: 'picnic-sombrilla', mapa: 'picnic', lugar: 'picnic', nombre: 'Sombrilla', precio: 120, tam: 20 },
    { id: 'picnic-pastel-fresas', mapa: 'picnic', lugar: 'picnic', nombre: 'Pastel de fresas', precio: 160, tam: 15 },
    { id: 'picnic-tarta-manzana', mapa: 'picnic', lugar: 'picnic', nombre: 'Tarta de manzana', precio: 140, tam: 15 },
    { id: 'picnic-sandia', mapa: 'picnic', lugar: 'picnic', nombre: 'Sandía', precio: 100, tam: 16 },
    { id: 'picnic-canasta-frutas', mapa: 'picnic', lugar: 'picnic', nombre: 'Canasta de frutas', precio: 110, tam: 15 },
    { id: 'picnic-globos', mapa: 'picnic', lugar: 'picnic', nombre: 'Globos', precio: 120, tam: 14 },
    { id: 'picnic-banderines', mapa: 'picnic', lugar: 'picnic', nombre: 'Banderines', precio: 90, tam: 26 },
    { id: 'picnic-columpio-rama', mapa: 'picnic', lugar: 'picnic', nombre: 'Columpio de la rama', precio: 180, tam: 20 },
    { id: 'picnic-pelota', mapa: 'picnic', lugar: 'picnic', nombre: 'Pelota', precio: 60, tam: 11 },
    { id: 'picnic-ukelele', mapa: 'picnic', lugar: 'picnic', nombre: 'Ukelele', precio: 200, tam: 15 },
    { id: 'picnic-mariposas', mapa: 'picnic', lugar: 'picnic', nombre: 'Mariposas', precio: 80, tam: 14 },
    { id: 'picnic-hormiguitas', mapa: 'picnic', lugar: 'picnic', nombre: 'Hormiguitas', precio: 80, tam: 14 },
    { id: 'picnic-ramo-frasco', mapa: 'picnic', lugar: 'picnic', nombre: 'Ramo en frasco', precio: 70, tam: 11 },
    { id: 'picnic-cojines', mapa: 'picnic', lugar: 'picnic', nombre: 'Cojines', precio: 70, tam: 15 },
    { id: 'picnic-bicicleta', mapa: 'picnic', lugar: 'picnic', nombre: 'Bicicleta', precio: 250, tam: 26 },
    { id: 'picnic-rehilete', mapa: 'picnic', lugar: 'picnic', nombre: 'Rehilete', precio: 60, tam: 11 },
    { id: 'picnic-termo-tazas', mapa: 'picnic', lugar: 'picnic', nombre: 'Termo con tazas', precio: 110, tam: 15 },
    { id: 'picnic-caballete', mapa: 'picnic', lugar: 'picnic', nombre: 'Caballete', precio: 150, tam: 16 },
    { id: 'picnic-burbujas', mapa: 'picnic', lugar: 'picnic', nombre: 'Burbujas', precio: 80, tam: 12 },
    { id: 'picnic-tabla-quesos', mapa: 'picnic', lugar: 'picnic', nombre: 'Tabla de quesos', precio: 120, tam: 16 },
    { id: 'picnic-carrito-helados', mapa: 'picnic', lugar: 'picnic', nombre: 'Carrito de helados', precio: 240, tam: 24 },
    { id: 'picnic-gramofono', mapa: 'picnic', lugar: 'picnic', nombre: 'Gramófono', precio: 220, tam: 17 },
    { id: 'picnic-raquetas', mapa: 'picnic', lugar: 'picnic', nombre: 'Raquetas', precio: 80, tam: 15 },
    { id: 'picnic-pajaritos-migas', mapa: 'picnic', lugar: 'picnic', nombre: 'Pajaritos con migas', precio: 90, tam: 15 },
    { id: 'picnic-farolillos-papel', mapa: 'picnic', lugar: 'picnic', nombre: 'Farolillos de papel', precio: 130, tam: 24 },
    { id: 'picnic-mesita-picnic', mapa: 'picnic', lugar: 'picnic', nombre: 'Mesita de picnic', precio: 120, tam: 18 },
    /* 26-nov-2026: el mapa del huerto con sus 30 stickers (los pintó la tarea diaria; la dueña dijo «upload») */
    { id: 'mapa-huerto', tipo: 'mapa', mapa: 'huerto', lugar: 'huerto', nombre: 'El huerto', precio: 1500 },
    { id: 'huerto-regadera', mapa: 'huerto', lugar: 'huerto', nombre: 'Regadera', precio: 80, tam: 13 },
    { id: 'huerto-carretilla', mapa: 'huerto', lugar: 'huerto', nombre: 'Carretilla', precio: 130, tam: 20 },
    { id: 'huerto-pala-rastrillo', mapa: 'huerto', lugar: 'huerto', nombre: 'Pala y rastrillo', precio: 70, tam: 14 },
    { id: 'huerto-zanahorias', mapa: 'huerto', lugar: 'huerto', nombre: 'Zanahorias', precio: 100, tam: 18 },
    { id: 'huerto-espantapajaros', mapa: 'huerto', lugar: 'huerto', nombre: 'Espantapájaros', precio: 180, tam: 18 },
    { id: 'huerto-coles', mapa: 'huerto', lugar: 'huerto', nombre: 'Coles', precio: 80, tam: 18 },
    { id: 'huerto-tomates', mapa: 'huerto', lugar: 'huerto', nombre: 'Tomates', precio: 90, tam: 14 },
    { id: 'huerto-girasoles', mapa: 'huerto', lugar: 'huerto', nombre: 'Girasoles', precio: 120, tam: 18 },
    { id: 'huerto-fresas-mata', mapa: 'huerto', lugar: 'huerto', nombre: 'Mata de fresas', precio: 110, tam: 14 },
    { id: 'huerto-maiz', mapa: 'huerto', lugar: 'huerto', nombre: 'Maíz', precio: 100, tam: 18 },
    { id: 'huerto-lechugas', mapa: 'huerto', lugar: 'huerto', nombre: 'Lechugas', precio: 80, tam: 18 },
    { id: 'huerto-calabaza-gigante', mapa: 'huerto', lugar: 'huerto', nombre: 'Calabaza gigante', precio: 200, tam: 18 },
    { id: 'huerto-canasta-verduras', mapa: 'huerto', lugar: 'huerto', nombre: 'Canasta de verduras', precio: 110, tam: 15 },
    { id: 'huerto-gallina-pollitos', mapa: 'huerto', lugar: 'huerto', nombre: 'Gallina con pollitos', precio: 150, tam: 17 },
    { id: 'huerto-casita-pajaros', mapa: 'huerto', lugar: 'huerto', nombre: 'Casita de pájaros', precio: 130, tam: 13 },
    { id: 'huerto-colmena', mapa: 'huerto', lugar: 'huerto', nombre: 'Colmena', precio: 180, tam: 15 },
    { id: 'huerto-costal-semillas', mapa: 'huerto', lugar: 'huerto', nombre: 'Costal de semillas', precio: 70, tam: 12 },
    { id: 'huerto-letreritos', mapa: 'huerto', lugar: 'huerto', nombre: 'Letreritos', precio: 60, tam: 16 },
    { id: 'huerto-botas-lluvia', mapa: 'huerto', lugar: 'huerto', nombre: 'Botas de lluvia', precio: 70, tam: 11 },
    { id: 'huerto-canasta-manzanas', mapa: 'huerto', lugar: 'huerto', nombre: 'Canasta de manzanas', precio: 100, tam: 15 },
    { id: 'huerto-tendedero', mapa: 'huerto', lugar: 'huerto', nombre: 'Tendedero', precio: 120, tam: 24 },
    { id: 'huerto-invernadero', mapa: 'huerto', lugar: 'huerto', nombre: 'Invernadero', precio: 250, tam: 26 },
    { id: 'huerto-pozo', mapa: 'huerto', lugar: 'huerto', nombre: 'Pozo', precio: 220, tam: 18 },
    { id: 'huerto-macetas-hierbas', mapa: 'huerto', lugar: 'huerto', nombre: 'Macetas de hierbas', precio: 80, tam: 15 },
    { id: 'huerto-cerca-flores', mapa: 'huerto', lugar: 'huerto', nombre: 'Cerca con flores', precio: 90, tam: 22 },
    { id: 'huerto-veleta', mapa: 'huerto', lugar: 'huerto', nombre: 'Veleta', precio: 140, tam: 13 },
    { id: 'huerto-manzano', mapa: 'huerto', lugar: 'huerto', nombre: 'Manzano', precio: 240, tam: 26 },
    { id: 'huerto-caracol', mapa: 'huerto', lugar: 'huerto', nombre: 'Caracol', precio: 80, tam: 11 },
    { id: 'huerto-topo', mapa: 'huerto', lugar: 'huerto', nombre: 'Topo', precio: 110, tam: 12 },
    { id: 'huerto-barril-lluvia', mapa: 'huerto', lugar: 'huerto', nombre: 'Barril de lluvia', precio: 100, tam: 14 }
  ]);
  /* mejoras: un sticker comprado se mejora pagando y desde entonces hace algo; los que tienen `uso` preparan un regalo */
  const MEJORAS = {
    'tetera': { precio: 200, accion: 'hornear', uso: 10, regalo: 'galletas' }, 'olla-chocolate': { precio: 150, accion: 'servir', uso: 8, regalo: 'cacao' },
    'piano-madera': { precio: 250, accion: 'cancion' }, 'atril-violin': { precio: 200, accion: 'melodia' }, 'reloj-cuco': { precio: 120, accion: 'cucu' },
    'cama-parches': { precio: 150, accion: 'dormir' }, 'cama-hojas': { precio: 150, accion: 'dormir' }, 'columpio': { precio: 100, accion: 'mecer' },
    'metronomo': { precio: 80, accion: 'pulso' }, 'lampara': { precio: 60, accion: 'luz' }, 'farolito': { precio: 60, accion: 'luz' },
    'lago-canoa': { precio: 120, accion: 'navegar' }, 'lago-patitos': { precio: 100, accion: 'nadar' }, 'lago-peces': { precio: 80, accion: 'saltar' },
    'lago-nenufares-rana': { precio: 80, accion: 'croar' }, 'lago-cana-pescar': { precio: 150, accion: 'pescar', uso: 5, regalo: 'pescado' },
    'lago-velero': { precio: 120, accion: 'navegar' },
    'lago-libelulas': { precio: 80, accion: 'revolotear' },
    'lago-tortuga-tronco': { precio: 80, accion: 'esconder' },
    'lago-cisne': { precio: 100, accion: 'nadar' },
    'lago-garza': { precio: 80, accion: 'aletear' },
    'lago-juncos': { precio: 60, accion: 'viento' },
    'lago-farol-muelle': { precio: 60, accion: 'luz' },
    'lago-cubeta-peces': { precio: 80, accion: 'saltar' },
    'lago-tienda-campana': { precio: 150, accion: 'dormir' },
    'lago-fogatita-olla': { precio: 150, accion: 'servir', uso: 8, regalo: 'sopa' },
    'lago-barquito-papel': { precio: 80, accion: 'navegar' },
    'lago-ranitas': { precio: 80, accion: 'croar' },
    'lago-balsa-troncos': { precio: 120, accion: 'navegar' },
    'lago-bote-cisne': { precio: 120, accion: 'navegar' },
    'lago-castor-presa': { precio: 80, accion: 'roer' },
    'lago-nutria': { precio: 100, accion: 'nadar' },
    'lago-boya': { precio: 60, accion: 'campana' },
    'lago-hamaca': { precio: 100, accion: 'mecer' },
    'lago-farolitos-flotantes': { precio: 80, accion: 'luz' },
    'picnic-cesta-picnic': { precio: 150, accion: 'servir', uso: 8, regalo: 'sandwich' },
    'picnic-sandwiches-limonada': { precio: 120, accion: 'servir', uso: 6, regalo: 'limonada' },
    'picnic-cometa': { precio: 100, accion: 'volar' },
    'picnic-sombrilla': { precio: 60, accion: 'girar' },
    'picnic-pastel-fresas': { precio: 200, accion: 'servir', uso: 12, regalo: 'pastel' },
    'picnic-sandia': { precio: 120, accion: 'servir', uso: 6, regalo: 'sandia' },
    'picnic-globos': { precio: 80, accion: 'volar' },
    'picnic-banderines': { precio: 60, accion: 'mecer' },
    'picnic-columpio-rama': { precio: 100, accion: 'mecer' },
    'picnic-pelota': { precio: 80, accion: 'saltar' },
    'picnic-ukelele': { precio: 200, accion: 'cancion' },
    'picnic-mariposas': { precio: 80, accion: 'revolotear' },
    'picnic-hormiguitas': { precio: 80, accion: 'caminar' },
    'picnic-bicicleta': { precio: 120, accion: 'timbre' },
    'picnic-rehilete': { precio: 60, accion: 'girar' },
    'picnic-termo-tazas': { precio: 120, accion: 'servir', uso: 6, regalo: 'te' },
    'picnic-burbujas': { precio: 80, accion: 'burbujas' },
    'picnic-tabla-quesos': { precio: 150, accion: 'servir', uso: 8, regalo: 'queso' },
    'picnic-carrito-helados': { precio: 200, accion: 'servir', uso: 10, regalo: 'helado' },
    'picnic-gramofono': { precio: 200, accion: 'melodia' },
    'picnic-pajaritos-migas': { precio: 80, accion: 'picotear' },
    'picnic-farolillos-papel': { precio: 80, accion: 'luz' },
    'huerto-regadera': { precio: 80, accion: 'regar' },
    'huerto-carretilla': { precio: 100, accion: 'rodar' },
    'huerto-zanahorias': { precio: 150, accion: 'servir', uso: 5, regalo: 'zanahoria' },
    'huerto-espantapajaros': { precio: 80, accion: 'mecer' },
    'huerto-girasoles': { precio: 60, accion: 'viento' },
    'huerto-fresas-mata': { precio: 150, accion: 'servir', uso: 6, regalo: 'fresas' },
    'huerto-gallina-pollitos': { precio: 100, accion: 'picotear' },
    'huerto-casita-pajaros': { precio: 80, accion: 'cucu' },
    'huerto-colmena': { precio: 200, accion: 'servir', uso: 10, regalo: 'miel' },
    'huerto-botas-lluvia': { precio: 60, accion: 'saltar' },
    'huerto-tendedero': { precio: 60, accion: 'mecer' },
    'huerto-invernadero': { precio: 60, accion: 'luz' },
    'huerto-pozo': { precio: 120, accion: 'balde' },
    'huerto-veleta': { precio: 60, accion: 'girar' },
    'huerto-manzano': { precio: 150, accion: 'servir', uso: 5, regalo: 'manzana' },
    'huerto-caracol': { precio: 80, accion: 'caminar' },
    'huerto-topo': { precio: 80, accion: 'esconder' }
  };
  const REGALOS = ['galletas', 'cacao', 'pescado', 'sopa', 'sandwich', 'limonada', 'pastel', 'sandia', 'te', 'queso', 'helado', 'zanahoria', 'fresas', 'miel', 'manzana'], DESPENSA_MAX = 9;
  /* El vestidor del osito (26-nov-2026, pedido de la dueña): ropa que se compra y se pone. Una prenda por ranura (al poner
     otra gorra, la anterior se quita sola). La bufanda de siempre es gratis y viene puesta. Las ranuras van en el orden en
     que se dibujan (de abajo hacia arriba): las medias debajo de los zapatos, la chompa debajo de la chaqueta y la bufanda
     encima de las dos. Precios para 6 meses (memoria bosque-economia-largo-plazo). Solo se venden las que ya tienen dibujo
     (js/ropa.js); el servidor tendrá la misma lista. */
  const RANURAS = ['medias', 'piernas', 'pies', 'torso', 'abrigo', 'cuello', 'muneca', 'cabeza'];
  /* ROPA:INICIO (la escribe herramientas/prendas.py desde prendas.json; no se edita a mano) */
  const ROPA = [
    { id: 'bufanda', nombre: 'Bufanda de cuadritos', ranura: 'cuello', precio: 0 },
    { id: 'gorra-roja', nombre: 'Gorra roja', ranura: 'cabeza', precio: 120 },
    { id: 'gorro-lana', nombre: 'Gorro de lana', ranura: 'cabeza', precio: 150 },
    { id: 'sombrero-paja', nombre: 'Sombrero de paja', ranura: 'cabeza', precio: 180 },
    { id: 'boina', nombre: 'Boina', ranura: 'cabeza', precio: 140 },
    { id: 'bufanda-roja', nombre: 'Bufanda roja', ranura: 'cuello', precio: 100 },
    { id: 'corbatin', nombre: 'Corbatín', ranura: 'cuello', precio: 90 },
    { id: 'panuelo', nombre: 'Pañuelo', ranura: 'cuello', precio: 80 },
    { id: 'camiseta-amarilla', nombre: 'Camiseta amarilla', ranura: 'torso', precio: 80 },
    { id: 'camiseta-rayas', nombre: 'Camiseta de rayas', ranura: 'torso', precio: 100 },
    { id: 'camiseta-musica', nombre: 'Camiseta de la nota', ranura: 'torso', precio: 120 },
    { id: 'polo-verde', nombre: 'Polo verde', ranura: 'torso', precio: 110 },
    { id: 'chompa-verde', nombre: 'Chompa verde', ranura: 'torso', precio: 250 },
    { id: 'sueter-rojo', nombre: 'Suéter del corazón', ranura: 'torso', precio: 230 },
    { id: 'buzo-azul', nombre: 'Buzo con capucha', ranura: 'torso', precio: 260 },
    { id: 'chaqueta-jean', nombre: 'Chaqueta de jean', ranura: 'abrigo', precio: 350 },
    { id: 'impermeable', nombre: 'Impermeable amarillo', ranura: 'abrigo', precio: 380 },
    { id: 'chaleco', nombre: 'Chaleco de lana', ranura: 'abrigo', precio: 200 },
    { id: 'chaqueta-acolchada', nombre: 'Chaqueta acolchada', ranura: 'abrigo', precio: 420 },
    { id: 'pantalon-jean', nombre: 'Pantalón de jean', ranura: 'piernas', precio: 220 },
    { id: 'pantalon-pana', nombre: 'Pantalón de pana', ranura: 'piernas', precio: 200 },
    { id: 'jogger-gris', nombre: 'Jogger', ranura: 'piernas', precio: 180 },
    { id: 'shorts-azul', nombre: 'Shorts azules', ranura: 'piernas', precio: 120 },
    { id: 'shorts-rojo', nombre: 'Shorts rojos', ranura: 'piernas', precio: 120 },
    { id: 'medias-rayas', nombre: 'Medias de rayas', ranura: 'medias', precio: 60 },
    { id: 'medias-azules', nombre: 'Medias azules', ranura: 'medias', precio: 50 },
    { id: 'medias-verdes', nombre: 'Medias de lana', ranura: 'medias', precio: 70 },
    { id: 'deportivos-azules', nombre: 'Deportivos azules', ranura: 'pies', precio: 300 },
    { id: 'deportivos-rojos', nombre: 'Deportivos rojos', ranura: 'pies', precio: 300 },
    { id: 'zapatos-cafe', nombre: 'Zapatos de cuero', ranura: 'pies', precio: 250 },
    { id: 'botas-lluvia', nombre: 'Botas de lluvia', ranura: 'pies', precio: 220 },
    { id: 'sandalias', nombre: 'Sandalias', ranura: 'pies', precio: 150 },
    { id: 'reloj-dorado', nombre: 'Reloj dorado', ranura: 'muneca', precio: 450 },
    { id: 'reloj-deportivo', nombre: 'Reloj deportivo', ranura: 'muneca', precio: 350 }
  ];
  /* ROPA:FIN */
  const PUESTO_INICIAL = { cuello: 'bufanda' };
  const ropaDe = x => ['bufanda'].concat((x && x.ropa) || []);
  const CATALOGO_TIENDA = TIENDA.map(t => MEJORAS[t.id] ? Object.assign({}, t, { mejora: MEJORAS[t.id] }) : t);
  /* LOGROS:INICIO (copiados del servidor con Registro_Sprinkloud/pruebas/copiar_logros.py; no se editan aquí) */
  const diasEntre_ = (a, b) => diasEntre(a, b);   // diasEntre se define más abajo
  const LOGRO_ = function (j) { return (j.extras && j.extras.logros) || {}; };
  const INSIGNIAS = [
    // Constancia: días de práctica
    { id: 'primera', grupo: 'Constancia', nombre: 'Primera práctica', si: function (j) { return j.dias >= 1; } },
    { id: 'dias5', grupo: 'Constancia', nombre: '5 días de práctica', si: function (j) { return j.dias >= 5; } },
    { id: 'dias10', grupo: 'Constancia', nombre: '10 días de práctica', si: function (j) { return j.dias >= 10; } },
    { id: 'dias20', grupo: 'Constancia', nombre: '20 días de práctica', si: function (j) { return j.dias >= 20; } },
    { id: 'dias30', grupo: 'Constancia', nombre: '30 días de práctica', si: function (j) { return j.dias >= 30; } },
    { id: 'dias50', grupo: 'Constancia', nombre: '50 días de práctica', si: function (j) { return j.dias >= 50; } },
    { id: 'dias100', grupo: 'Constancia', nombre: '100 días de práctica', si: function (j) { return j.dias >= 100; } },
    { id: 'dias200', grupo: 'Constancia', nombre: '200 días de práctica', si: function (j) { return j.dias >= 200; } },
    { id: 'dias365', grupo: 'Constancia', nombre: 'Un año de práctica', si: function (j) { return j.dias >= 365; } },
    // Racha: días seguidos (la mejor racha)
    { id: 'racha3', grupo: 'Racha', nombre: '3 días seguidos', si: function (j) { return j.mejor >= 3; } },
    { id: 'racha7', grupo: 'Racha', nombre: '7 días seguidos', si: function (j) { return j.mejor >= 7; } },
    { id: 'racha14', grupo: 'Racha', nombre: '14 días seguidos', si: function (j) { return j.mejor >= 14; } },
    { id: 'racha21', grupo: 'Racha', nombre: '21 días seguidos', si: function (j) { return j.mejor >= 21; } },
    { id: 'racha30', grupo: 'Racha', nombre: '30 días seguidos', si: function (j) { return j.mejor >= 30; } },
    { id: 'racha50', grupo: 'Racha', nombre: '50 días seguidos', si: function (j) { return j.mejor >= 50; } },
    { id: 'racha100', grupo: 'Racha', nombre: '¡100 días seguidos!', si: function (j) { return j.mejor >= 100; } },
    { id: 'racha200', grupo: 'Racha', nombre: '200 días seguidos', si: function (j) { return j.mejor >= 200; } },
    { id: 'racha365', grupo: 'Racha', nombre: 'Un año sin parar', si: function (j) { return j.mejor >= 365; } },
    // Aciertos
    { id: 'aciertos50', grupo: 'Aciertos', nombre: '50 aciertos', si: function (j) { return j.aciertos >= 50; } },
    { id: 'aciertos100', grupo: 'Aciertos', nombre: '100 aciertos', si: function (j) { return j.aciertos >= 100; } },
    { id: 'aciertos500', grupo: 'Aciertos', nombre: '500 aciertos', si: function (j) { return j.aciertos >= 500; } },
    { id: 'aciertos1000', grupo: 'Aciertos', nombre: '1000 aciertos', si: function (j) { return j.aciertos >= 1000; } },
    { id: 'aciertos2500', grupo: 'Aciertos', nombre: '2500 aciertos', si: function (j) { return j.aciertos >= 2500; } },
    { id: 'aciertos5000', grupo: 'Aciertos', nombre: '5000 aciertos', si: function (j) { return j.aciertos >= 5000; } },
    { id: 'aciertos10000', grupo: 'Aciertos', nombre: '¡10 000 aciertos!', si: function (j) { return j.aciertos >= 10000; } },
    // Rondas perfectas (todas bien en una actividad de 4 preguntas o más)
    { id: 'perfecta', grupo: 'Rondas perfectas', nombre: 'Ronda perfecta', si: function (j, x) { return !!(x && x.perfecta) || LOGRO_(j).perfectas >= 1; } },
    { id: 'perfectas10', grupo: 'Rondas perfectas', nombre: '10 rondas perfectas', si: function (j) { return LOGRO_(j).perfectas >= 10; } },
    { id: 'perfectas25', grupo: 'Rondas perfectas', nombre: '25 rondas perfectas', si: function (j) { return LOGRO_(j).perfectas >= 25; } },
    { id: 'perfectas50', grupo: 'Rondas perfectas', nombre: '50 rondas perfectas', si: function (j) { return LOGRO_(j).perfectas >= 50; } },
    { id: 'perfectas100', grupo: 'Rondas perfectas', nombre: '100 rondas perfectas', si: function (j) { return LOGRO_(j).perfectas >= 100; } },
    // Etapas de la guía (la etapa de su lección; también si llegó con la prueba de nivel)
    { id: 'etapa2', grupo: 'Etapas', nombre: 'Llegaste a la Etapa 2', si: function (j, x) { return !!(x && x.etapa >= 2); } },
    { id: 'etapa3', grupo: 'Etapas', nombre: 'Llegaste a la Etapa 3', si: function (j, x) { return !!(x && x.etapa >= 3); } },
    { id: 'etapa4', grupo: 'Etapas', nombre: 'Llegaste a la Etapa 4', si: function (j, x) { return !!(x && x.etapa >= 4); } },
    { id: 'etapa5', grupo: 'Etapas', nombre: 'Llegaste a la Etapa 5', si: function (j, x) { return !!(x && x.etapa >= 5); } },
    { id: 'etapa6', grupo: 'Etapas', nombre: 'Llegaste a la Etapa 6', si: function (j, x) { return !!(x && x.etapa >= 6); } },
    { id: 'etapa7', grupo: 'Etapas', nombre: 'Llegaste a la Etapa 7', si: function (j, x) { return !!(x && x.etapa >= 7); } },
    { id: 'guia', grupo: 'Etapas', nombre: 'Terminaste toda la guía', si: function (j, x) { return !!(x && x.guia); } },
    // Tienda y casita
    { id: 'compra', grupo: 'Tienda y casita', nombre: 'Primera compra', si: function (j) { return j.inventario.length >= 1; } },
    { id: 'compras5', grupo: 'Tienda y casita', nombre: '5 cosas compradas', si: function (j) { return j.inventario.length >= 5; } },
    { id: 'compras15', grupo: 'Tienda y casita', nombre: '15 cosas compradas', si: function (j) { return j.inventario.length >= 15; } },
    { id: 'compras30', grupo: 'Tienda y casita', nombre: 'Gran coleccionista', si: function (j) { return j.inventario.length >= 30; } },
    { id: 'mapa1', grupo: 'Tienda y casita', nombre: 'Un mapa nuevo', si: function (j) { return j.inventario.some(function (id) { return id.indexOf('mapa-') === 0; }); } },
    { id: 'mejora1', grupo: 'Tienda y casita', nombre: 'Primera mejora', si: function (j) { return ((j.extras && j.extras.mejoras) || []).length >= 1; } },
    { id: 'mejoras5', grupo: 'Tienda y casita', nombre: '5 mejoras', si: function (j) { return ((j.extras && j.extras.mejoras) || []).length >= 5; } },
    { id: 'casa5', grupo: 'Tienda y casita', nombre: 'Casita decorada', si: function (j) { return Object.keys(j.casa).length >= 5; } },
    { id: 'casa10', grupo: 'Tienda y casita', nombre: 'Casita llena de vida', si: function (j) { return Object.keys(j.casa).length >= 10; } },
    { id: 'casa20', grupo: 'Tienda y casita', nombre: 'Decorador del bosque', si: function (j) { return Object.keys(j.casa).length >= 20; } },
    { id: 'ahorro300', grupo: 'Tienda y casita', nombre: 'Ahorraste 300 malvaviscos', si: function (j) { return j.malvaviscos >= 300; } },
    { id: 'ahorro1000', grupo: 'Tienda y casita', nombre: 'Un tesoro de 1000 malvaviscos', si: function (j) { return j.malvaviscos >= 1000; } },
    // Amigos y regalos
    { id: 'amigos', grupo: 'Amigos y regalos', nombre: 'Todos tus amigos de visita', si: function (j) { return !!(j.extras && j.extras.amistad >= 30); } },
    { id: 'preparados5', grupo: 'Amigos y regalos', nombre: 'Cocinero del bosque', si: function (j) { return LOGRO_(j).preparados >= 5; } },
    { id: 'regalo1', grupo: 'Amigos y regalos', nombre: 'Primer regalo', si: function (j) { return LOGRO_(j).regalos >= 1; } },
    { id: 'regalos10', grupo: 'Amigos y regalos', nombre: '10 regalos dados', si: function (j) { return LOGRO_(j).regalos >= 10; } },
    // Momentos especiales (al terminar la práctica del día)
    { id: 'madrugador', grupo: 'Momentos', nombre: 'Madrugador', si: function (j, x) { return !!(x && x.termino && x.hora < 8); } },
    { id: 'lunes', grupo: 'Momentos', nombre: 'Lunes con energía', si: function (j, x) { return !!(x && x.termino && diaSemana_(x.hoy) === 1); } },
    { id: 'finde', grupo: 'Momentos', nombre: 'Fin de semana musical', si: function (j, x) { return !!(x && x.termino && diaSemana_(x.hoy) === 7 && LOGRO_(j).sabado && diasEntre_(LOGRO_(j).sabado, x.hoy) === 1); } },
    { id: 'extra', grupo: 'Momentos', nombre: 'Práctica extra', si: function (j) { return !!(j.hoy && j.hoy.terminada && j.hoy.actividades >= 8); } },
    { id: 'volvio', grupo: 'Momentos', nombre: '¡Volviste al bosque!', si: function (j, x) { return !!(x && x.termino && x.volvio); } },
    // Temporadas: practicar (terminar la práctica del día) en sus fechas
    { id: 'tnavidad', grupo: 'Temporadas', nombre: 'Navidad en el bosque', si: function (j, x) { return enTemporada_(x, 'navidad'); } },
    { id: 'tanionuevo', grupo: 'Temporadas', nombre: 'Primer día del año', si: function (j, x) { return enTemporada_(x, 'anionuevo'); } },
    { id: 'tsanvalentin', grupo: 'Temporadas', nombre: 'Amor y amistad', si: function (j, x) { return enTemporada_(x, 'sanvalentin'); } },
    { id: 'tnino', grupo: 'Temporadas', nombre: 'Día del Niño', si: function (j, x) { return enTemporada_(x, 'nino'); } },
    { id: 'tmadre', grupo: 'Temporadas', nombre: 'Para mamá', si: function (j, x) { return enTemporada_(x, 'madre'); } },
    { id: 'tpadre', grupo: 'Temporadas', nombre: 'Para papá', si: function (j, x) { return enTemporada_(x, 'padre'); } },
    { id: 'tmusica', grupo: 'Temporadas', nombre: 'Día de la Música', si: function (j, x) { return enTemporada_(x, 'musica'); } }
  ];
  /* el día de la semana de una fecha yyyy-MM-dd (1 = lunes … 7 = domingo) */
  function diaSemana_(hoy) { const p = String(hoy).split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).getUTCDay() || 7; }
  /* las temporadas de una fecha (las mismas fechas que App_Bosque/js/config.js): Navidad del 25-nov al 6-ene, Año Nuevo el
     1-ene, San Valentín del 7 al 15-feb, Día del Niño en México (24 al 30-abr) y en Ecuador (26-may al 1-jun), Día de la Madre
     la semana del 2.º domingo de mayo y del 10 (Ecuador y México), Día del Padre la semana del 3.er domingo de junio y Día de
     la Música del 16 al 22-nov. Sin Halloween ni Día de Muertos (principios de la dueña). */
  function temporadasDe_(hoy) {
    const p = String(hoy).split('-'), a = +p[0], md = p[1] + '-' + p[2], dos = function (n) { return (n < 10 ? '0' : '') + n; };
    const domingo = function (m, n) { const w = new Date(Date.UTC(a, m - 1, 1)).getUTCDay(); return 1 + (7 - w) % 7 + (n - 1) * 7; };
    const entre = function (x, y) { return md >= x && md <= y; };
    const madre = domingo(5, 2), padre = domingo(6, 3), r = [];
    if (md >= '11-25' || md <= '01-06') r.push('navidad');
    if (md === '01-01') r.push('anionuevo');
    if (entre('02-07', '02-15')) r.push('sanvalentin');
    if (entre('04-24', '04-30') || entre('05-26', '06-01')) r.push('nino');
    if (entre('05-' + dos(Math.min(madre, 10) - 6), '05-' + dos(Math.max(madre, 10)))) r.push('madre');
    if (entre('06-' + dos(padre - 6), '06-' + dos(padre))) r.push('padre');
    if (entre('11-16', '11-22')) r.push('musica');
    return r;
  }
  function enTemporada_(x, t) { return !!(x && x.termino && x.hoy && temporadasDe_(x.hoy).indexOf(t) >= 0); }
  /* LOGROS:FIN */
  const PERSONAJES = [['osito', 'Osito', 0], ['conejo', 'Conejo', 3], ['ardilla', 'Ardilla', 7], ['zorro', 'Zorro', 14], ['erizo', 'Erizo', 21], ['raton', 'Ratón', 30]]
    .map(([id, nombre, dias]) => ({ id, nombre, dias }));
  /* Los amigos son stickers y se van si deja de practicar (regla de la dueña, 16-nov-2026): igual que amistad_ del servidor.
     Dos días completos sin practicar no cuestan nada; después se va uno por día (primero el último que llegó) y la leña
     también salva días. Al volver, los días se cuentan desde el último amigo que le queda. El osito nunca se va. */
  const GRACIA_AMIGOS = 2, AMISTAD_MAX = 30;
  function amistad(j, hoy) {
    const guardada = j.extras && j.extras.amistad != null ? Number(j.extras.amistad) || 0 : Math.min(j.dias, AMISTAD_MAX);
    const tiene = PERSONAJES.filter(p => guardada >= p.dias).length;
    const faltas = j.ultimo ? Math.max(0, diasEntre(j.ultimo, hoy) - 1) : 0;
    const perdidos = Math.max(0, faltas - GRACIA_AMIGOS - (j.lena || 0));
    const quedan = Math.max(1, tiene - perdidos);
    const puntos = quedan < tiene ? PERSONAJES[quedan - 1].dias : guardada;
    const sig = PERSONAJES[quedan];
    return { puntos, amigos: PERSONAJES.slice(0, quedan).map(p => p.id), siguiente: sig ? { id: sig.id, faltan: sig.dias - puntos } : null };
  }
  function extrasJuego(j, hoy) {
    const am = amistad(j, hoy), x = j.extras || {}, casa = {};
    Object.keys(j.casa || {}).forEach(id => { if (id.indexOf('amigo-') !== 0 || am.amigos.includes(id.slice(6))) casa[id] = j.casa[id]; });
    return { personajes: am.amigos, amistad: { puntos: am.puntos, siguiente: am.siguiente }, casa, mejoras: x.mejoras || [], despensa: x.despensa || {},
      ropa: ropaDe(x), puesto: x.puesto || PUESTO_INICIAL };
  }
  const ETAPAS = ['Cuerpo y pulso', 'Primeras lecturas', 'Lectura y ritmo', 'Intervalos, escalas y acordes', 'Tonalidad: reposo, mayor y menor', 'Músico completo', 'Los modos griegos'];
  const LARGO = [6, 8, 13, 10, 9, 6, 8];   // 60 lecciones desde el 29-oct (ver Registro_Sprinkloud/Guia.js versión 8)
  const APPS = ',ritmo,ritmo,ritmo,oido:sube,notas,ritmo,notas,notas,notas,notas,ritmo,ritmo:3/4,notas,ritmo,ritmo:3/4,ritmo,ritmo,ritmo,ritmo,notas,notas,notas,notas,notas,notas,notas,oido:intervalos:segundas y terceras,oido:intervalos:cuartas, quintas y octavas,oido:intervalos:todos,notas,notas,armaduras:sostenidos,armaduras:bemoles,oido:mayorMenor,oido:triadas,acordes,notas,oido:reposo,oido:mayorMenor,oido:mayorMenor,oido:mayorMenor,circulo,notas,ritmo,ritmo:6/8,oido:intervalos:todos,ritmo,ritmo,ritmo,notas,oido:reposo,ritmo,modos:1,modos:2,modos:3,modos:4,modos:5,modos:6,modos:7,modos:7'
    .split(/,(?=ritmo|oido|notas|armaduras|circulo|acordes|modos|$)/);
  function etapaDe(s) { let e = 0, l = s; while (l > LARGO[e]) l -= LARGO[e++]; return { etapa: e + 1, leccion: l }; }
  const diasEntre = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);
  /* repetir la prueba de nivel (4-nov): igual que pruebaNivel_ del servidor, una vez cada 7 días */
  const DIAS_REPETIR_PRUEBA = 7;
  const pruebaDe = lb => {
    const ult = lb && (lb.intento || lb.nivelado);
    if (!ult) return null;
    const d = new Date(Date.parse(ult + 'T12:00:00Z') + DIAS_REPETIR_PRUEBA * 86400000).toISOString().slice(0, 10);
    return { puede: demo.hoy() >= d, desde: d, dias: DIAS_REPETIR_PRUEBA };
  };

  const demo = {
    hoy() { if (q.get('dia')) return q.get('dia'); const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
    llave: LIBRE ? 'bosque-libre' : 'bosque-demo',
    leer() {
      let d = null; try { d = JSON.parse(localStorage.getItem(demo.llave) || 'null'); } catch (e) { }
      d = d || { malvaviscos: 60, racha: 0, mejor: 0, ultimo: '', lena: 0, dias: 0, aciertos: 0, insignias: [], casa: {}, inventario: [], hoy: {} };
      if (LIBRE && !d.libre) d.libre = { semana: 1, paso: '' };
      /* solo en la prueba (no en la versión libre): ?malvaviscos=2000 y ?amistad=14 (días de amistad: llegan los amigos)
         se ponen una vez por dirección, para probar los mapas, las mejoras y los amigos sin practicar semanas */
      if (DEMO && !LIBRE && (q.has('malvaviscos') || q.has('amistad')) && d.ajuste !== location.search) {
        if (q.has('malvaviscos')) d.malvaviscos = Math.max(0, Math.min(99999, Number(q.get('malvaviscos')) || 0));
        if (q.has('amistad')) { const n = Math.max(0, Math.min(AMISTAD_MAX, Number(q.get('amistad')) || 0)); d.extras = Object.assign({}, d.extras, { amistad: n }); d.dias = Math.max(d.dias, n); d.ultimo = demo.hoy(); }
        d.ajuste = location.search; demo.guardar(d);
      }
      return d;
    },
    guardar(j) { try { localStorage.setItem(demo.llave, JSON.stringify(j)); } catch (e) { } },
    /* versión libre: si ayer (o antes) pasó la lección con el 70 %, hoy se abre la siguiente */
    avanzar(j, hoy) {
      if (!j.libre.paso || j.libre.paso >= hoy) return false;
      j.libre.paso = '';
      if (j.libre.semana < ULTIMA_LIBRE) j.libre.semana++; else j.libre.completa = true;
      return true;
    },
    hoyDe(j, hoy) { return j.hoy && j.hoy.fecha === hoy ? j.hoy : { fecha: hoy, actividades: 0, ganados: 0, terminada: false, gastada: 0, aciertos: 0, intentos: 0 }; },
    fogata(j, hoy) {
      if (!j.ultimo) return { estado: 'apagada', racha: 0 };
      const d = diasEntre(j.ultimo, hoy);
      if (d <= 0) return { estado: 'grande', racha: j.racha };
      if (d === 1) return { estado: 'encendida', racha: j.racha };
      if (d - 1 <= j.lena) return { estado: 'brasas', racha: j.racha };
      return { estado: 'apagada', racha: 0 };
    },
    estado() {
      const hoy = demo.hoy(), j = demo.leer();
      if (LIBRE && demo.avanzar(j, hoy)) demo.guardar(j);
      const s = LIBRE ? j.libre.semana : Math.min(60, Math.max(1, Number(q.get('semana')) || 1)), f = demo.fogata(j, hoy), et = etapaDe(s);
      const tema = window.Leccion.GUIA[s], h = demo.hoyDe(j, hoy), ex = extrasJuego(j, hoy);
      return {
        alumno: LIBRE ? (j.nombre || '') : 'Amiga', instrumento: 'piano', hoy,   // por ahora el bosque es de piano para todos (29-oct)
        leccion: { semana: s, etapa: et.etapa, nombreEtapa: ETAPAS[et.etapa - 1], numero: et.leccion, nivel: 'Etapa ' + et.etapa + ' · Lección ' + et.leccion, tema: tema[0], objetivo: tema[1], app: APPS[s] },
        camino: window.Leccion.GUIA.slice(1).map((g, i) => {
          const x = etapaDe(i + 1), premium = LIBRE && i + 1 > ULTIMA_LIBRE;
          return { semana: i + 1, etapa: x.etapa, leccion: x.leccion, tema: g[0], app: APPS[i + 1], premium,
            estado: i + 1 === s && !(LIBRE && j.libre.completa) ? 'actual' : i + 1 < s || (LIBRE && j.libre.completa && i + 1 === s) ? 'hecha' : 'futura' };
        }),
        juego: {
          malvaviscos: j.malvaviscos, racha: f.racha, fogata: f.estado, mejor: j.mejor, lena: j.lena, dias: j.dias, aciertos: j.aciertos,
          insignias: j.insignias, casa: ex.casa, inventario: j.inventario, personajes: ex.personajes, amistad: ex.amistad, mejoras: ex.mejoras, despensa: ex.despensa,
          ropa: ex.ropa, puesto: ex.puesto,
          hoy: { terminada: !!h.terminada, actividades: h.actividades || 0, ganados: h.ganados || 0 },
          energia: LIBRE ? { max: ENERGIA_DIA, queda: Math.max(0, ENERGIA_DIA - (h.gastada || 0)), error: COSTO_ERROR } : null
        },
        libre: LIBRE ? { ultima: ULTIMA_LIBRE, paso: !!j.libre.paso, completa: !!j.libre.completa, cuenta: false, motivo: q.get('motivo') || '' } : null,   // ?motivo=vencida|exalumno para probar
        encuesta: LIBRE ? !j.libre.nivelado : q.has('encuesta'),   // la prueba de nivel (en la prueba sin libre: ?demo=1&encuesta)
        // repetir la prueba desde la biblioteca; en la prueba sin libre se puede siempre (?demo=1&prueba=no para verla bloqueada)
        prueba: LIBRE ? pruebaDe(j.libre) : q.has('encuesta') ? null : q.get('prueba') === 'no' ? { puede: false, desde: demo.hoy(), dias: DIAS_REPETIR_PRUEBA } : { puede: true, desde: demo.hoy(), dias: DIAS_REPETIR_PRUEBA },
        cuenta: LIBRE ? false : undefined,
        biblioteca: ETAPAS.map((nombre, i) => ({ etapa: i + 1, nombre, abierto: !LIBRE && i + 1 <= et.etapa, amazon: LIBRE })),
        catalogo: { tienda: CATALOGO_TIENDA, lugares: ['sala-pared', 'sala-sillon', 'sala-alfombra', 'sala-musica', 'sala-mesa', 'cocina-estufa', 'cocina-ventana', 'cocina-mesa', 'cocina-repisa', 'dorm-cama', 'dorm-mesita', 'dorm-pared', 'jardin-banca', 'jardin-flores', 'jardin-fogata'], personajes: PERSONAJES, insignias: INSIGNIAS.map(i => ({ id: i.id, nombre: i.nombre, grupo: i.grupo })), ropa: ROPA, ranuras: RANURAS }
      };
    },
    insignias(j, x) { const n = INSIGNIAS.filter(i => j.insignias.indexOf(i.id) < 0 && i.si(j, x)).map(i => i.id); j.insignias = j.insignias.concat(n); return n; },
    practica(d) {
      const hoy = demo.hoy(), j = demo.leer(), x = d.actividad;
      if (!(x.intentos >= 1 && x.aciertos >= 0 && x.aciertos <= x.intentos)) throw new Error('El resultado no se entiende.');
      j.hoy = demo.hoyDe(j, hoy);
      let avance = null;
      if (LIBRE) {
        // cierre: la práctica se cierra sin respuestas (la última actividad se saltó): no gasta ni cuenta para pasar
        if (!x.cierre && (j.hoy.gastada || 0) >= ENERGIA_DIA) throw sinEnergia();
        if (!x.cierre) j.hoy.gastada = (j.hoy.gastada || 0) + gasto(x.aciertos, x.intentos);
        if (!j.hoy.terminada && !x.cierre) { j.hoy.aciertos = (j.hoy.aciertos || 0) + x.aciertos; j.hoy.intentos = (j.hoy.intentos || 0) + x.intentos; }
        if (d.terminada && !j.hoy.terminada) {
          const pct = j.hoy.intentos ? j.hoy.aciertos / j.hoy.intentos : 0, paso = pct >= PARA_PASAR && !j.libre.completa;
          if (paso) j.libre.paso = hoy;
          avance = { pct: Math.round(pct * 100), paso, ultima: j.libre.semana >= ULTIMA_LIBRE };
        }
      }
      const perfecta = x.aciertos === x.intentos && x.intentos >= 4;
      let gana = Math.min(x.aciertos, 15) + (perfecta ? 5 : 0);
      if (j.hoy.terminada) gana = Math.floor(gana / 2);
      let fuego = null, amigoNuevo = null, volvio = false;
      const termino = !!d.terminada && !j.hoy.terminada;
      if (termino) {
        j.hoy.terminada = true;
        const am = amistad(j, hoy), sube = Math.min(AMISTAD_MAX, am.puntos + 1);   // antes de tocar el último día y la leña
        amigoNuevo = PERSONAJES.find(p => p.dias > am.puntos && p.dias <= sube) || null;
        j.extras = Object.assign({}, j.extras, { amistad: sube });
        Object.keys(j.casa || {}).forEach(id => { if (id.indexOf('amigo-') === 0 && !am.amigos.includes(id.slice(6))) delete j.casa[id]; });
        const dif = j.ultimo ? diasEntre(j.ultimo, hoy) : null;
        volvio = dif !== null && dif >= 8;   // logro «¡Volviste al bosque!»
        if (dif === 1) j.racha++;
        else if (dif !== null && dif > 1 && dif - 1 <= j.lena) { j.lena -= dif - 1; j.racha++; }
        else if (dif !== 0) j.racha = 1;
        j.ultimo = hoy; j.dias++; j.mejor = Math.max(j.mejor, j.racha);
        if (j.racha % 7 === 0) j.lena = Math.min(2, j.lena + 1);
        gana += 20 + Math.min(j.racha, 10);
        fuego = { racha: j.racha, lena: j.lena };
      }
      gana = Math.max(0, Math.min(gana, 150 - (j.hoy.ganados || 0)));
      j.hoy.actividades++; j.hoy.ganados += gana; j.malvaviscos += gana; j.aciertos += x.aciertos;
      // logros (26-nov-2026): los mismos contadores y datos que el servidor
      const lg = Object.assign({}, LOGRO_(j));
      if (perfecta) lg.perfectas = (lg.perfectas || 0) + 1;
      if (termino && diaSemana_(hoy) === 6) lg.sabado = hoy;
      j.extras = Object.assign({}, j.extras, { logros: lg });
      const s = LIBRE ? j.libre.semana : Math.min(60, Math.max(1, Number(q.get('semana')) || 1));
      const nuevas = demo.insignias(j, { perfecta, termino, hoy, hora: new Date().getHours(), etapa: etapaDe(s).etapa, guia: false, volvio });
      demo.guardar(j);
      return { ok: true, ganados: gana, perfecta, fogata: fuego, insignias: nuevas, personaje: amigoNuevo ? amigoNuevo.id : null, avance, estado: demo.estado() };
    },
    /* la prueba de nivel: en la versión libre, la lección donde empieza (hasta la 27); en la prueba sin libre, la semana */
    nivel(s) {
      const j = demo.leer();
      if (!(s >= 1 && s <= 60)) throw new Error('La lección no se entiende.');
      if (LIBRE) {
        // repetirla sube una etapa como máximo (25-nov-2026, igual que topeSubida_ del servidor)
        const tope = x => { const e = etapaDe(x).etapa; return e >= 7 ? x : LARGO.slice(0, e).reduce((t, n) => t + n, 1); };
        const repite = !!j.libre.nivelado, pr = pruebaDe(j.libre), nueva = Math.min(s, ULTIMA_LIBRE, repite ? tope(j.libre.semana || 1) : 60);
        if (repite && !(pr && pr.puede)) throw new Error('Podrás repetir la prueba de nivel desde el ' + pr.desde.split('-').reverse().join('/') + '.');
        if (!repite) j.libre.nivelado = demo.hoy();
        j.libre.intento = demo.hoy();
        const subio = !repite || nueva > (j.libre.semana || 1);
        if (subio) Object.assign(j.libre, { semana: nueva, paso: '', completa: false });
        demo.guardar(j);
        return { ok: true, repetida: repite, subio, estado: demo.estado() };
      }
      // la prueba sin libre: la lección actual es la de ?semana= (o la que eligió la prueba); repetir solo sube
      const antes = demo.estado(), repite = !q.has('encuesta') || !!demo.nivelada;
      const subio = !repite || !antes.leccion || s > antes.leccion.semana;
      if (!subio) return { ok: true, repetida: true, subio: false, estado: antes };
      demo.nivelada = s;
      const e = demo.estado(), x = etapaDe(s), g = window.Leccion.GUIA[s];
      e.encuesta = false;
      e.leccion = { semana: s, etapa: x.etapa, nombreEtapa: ETAPAS[x.etapa - 1], numero: x.leccion, nivel: 'Etapa ' + x.etapa + ' · Lección ' + x.leccion, tema: g[0], objetivo: g[1], app: APPS[s] };
      e.camino.forEach(c => { c.estado = c.semana === s ? 'actual' : c.semana < s ? 'hecha' : 'futura'; });
      return { ok: true, repetida: repite, subio: true, estado: e };
    },
    comprar(id) {
      const j = demo.leer(), item = TIENDA.find(t => t.id === id);
      if (!item) throw new Error('Eso no está en la tienda.');
      if (j.inventario.indexOf(id) >= 0) throw new Error('Ya lo tienes en tu casita.');
      if (item.mapa && item.tipo !== 'mapa' && j.inventario.indexOf('mapa-' + item.mapa) < 0) throw new Error('Primero consigue ese mapa.');
      if (j.malvaviscos < item.precio) throw new Error('Te faltan ' + (item.precio - j.malvaviscos) + ' malvaviscos.');
      j.malvaviscos -= item.precio; j.inventario.push(id);   // queda en la bandeja de calcomanías
      const nuevas = demo.insignias(j); demo.guardar(j);
      return { ok: true, insignias: nuevas, estado: demo.estado() };
    },
    /* mejorar un sticker que ya tiene: se paga una vez y desde entonces hace algo al tocarlo */
    mejorar(id) {
      const j = demo.leer(), m = MEJORAS[id], x = Object.assign({ mejoras: [] }, j.extras);
      if (!m) throw new Error('Eso no se puede mejorar.');
      if (j.inventario.indexOf(id) < 0) throw new Error('Primero cómpralo en la tienda.');
      if ((x.mejoras || []).indexOf(id) >= 0) throw new Error('Ya lo mejoraste.');
      if (j.malvaviscos < m.precio) throw new Error('Te faltan ' + (m.precio - j.malvaviscos) + ' malvaviscos.');
      j.malvaviscos -= m.precio; x.mejoras = (x.mejoras || []).concat([id]); j.extras = x;
      const nuevas = demo.insignias(j); demo.guardar(j);
      return { ok: true, insignias: nuevas, estado: demo.estado() };
    },
    /* usar un sticker mejorado que prepara algo (galletas, cacao, un pescado): cuesta su `uso` y queda en la despensa */
    usar(id) {
      const j = demo.leer(), m = MEJORAS[id], x = Object.assign({ mejoras: [] }, j.extras);
      if (!m || !m.regalo) throw new Error('Eso no prepara nada.');
      if ((x.mejoras || []).indexOf(id) < 0) throw new Error('Primero mejóralo.');
      const despensa = Object.assign({}, x.despensa);
      if ((despensa[m.regalo] || 0) >= DESPENSA_MAX) throw new Error('Ya tienes muchos. Dale uno a un amigo.');
      if (j.malvaviscos < m.uso) throw new Error('Te faltan ' + (m.uso - j.malvaviscos) + ' malvaviscos.');
      j.malvaviscos -= m.uso; despensa[m.regalo] = (despensa[m.regalo] || 0) + 1; x.despensa = despensa;
      x.logros = Object.assign({}, x.logros); x.logros.preparados = (x.logros.preparados || 0) + 1; j.extras = x;
      const nuevas = demo.insignias(j); demo.guardar(j);
      return { ok: true, regalo: m.regalo, insignias: nuevas, estado: demo.estado() };
    },
    /* darle un regalo a un amigo que está de visita: el regalo desaparece */
    dar(regalo, amigo) {
      const j = demo.leer(), x = Object.assign({}, j.extras);
      if (REGALOS.indexOf(regalo) < 0) throw new Error('Ese regalo no se entiende.');
      if (!amistad(j, demo.hoy()).amigos.includes(amigo)) throw new Error('Ese amigo no está de visita.');
      const despensa = Object.assign({}, x.despensa);
      if (!(despensa[regalo] >= 1)) throw new Error('No tienes de eso para dar.');
      despensa[regalo]--; if (!despensa[regalo]) delete despensa[regalo];
      x.despensa = despensa;
      x.logros = Object.assign({}, x.logros); x.logros.regalos = (x.logros.regalos || 0) + 1; j.extras = x;
      const nuevas = demo.insignias(j); demo.guardar(j);
      return { ok: true, insignias: nuevas, estado: demo.estado() };
    },
    /* comprar una prenda: queda suya y puesta (en su ranura, en lugar de la que había) */
    comprarRopa(id) {
      const j = demo.leer(), p = ROPA.find(r => r.id === id), x = Object.assign({}, j.extras);
      if (!p) throw new Error('Esa prenda no está en el vestidor.');
      if (ropaDe(x).indexOf(id) >= 0) throw new Error('Ya es tuya.');
      if (j.malvaviscos < p.precio) throw new Error('Te faltan ' + (p.precio - j.malvaviscos) + ' malvaviscos.');
      j.malvaviscos -= p.precio; x.ropa = (x.ropa || []).concat([id]);
      x.puesto = Object.assign({}, x.puesto || PUESTO_INICIAL, { [p.ranura]: id }); j.extras = x;
      const nuevas = demo.insignias(j); demo.guardar(j);
      return { ok: true, insignias: nuevas, estado: demo.estado() };
    },
    /* lo que tiene puesto: {ranura: prenda}, solo prendas suyas y cada una en su ranura */
    vestir(puesto) {
      const j = demo.leer(), x = Object.assign({}, j.extras), mias = ropaDe(x), limpio = {};
      Object.keys(puesto || {}).forEach(r => {
        const id = puesto[r], p = ROPA.find(q => q.id === id);
        if (RANURAS.indexOf(r) < 0 || !p || p.ranura !== r) throw new Error('Esa prenda no va ahí.');
        if (mias.indexOf(id) < 0) throw new Error('Esa prenda todavía no es tuya.');
        limpio[r] = id;
      });
      x.puesto = limpio; j.extras = x; demo.guardar(j);
      return { ok: true, estado: demo.estado() };
    },
    casa(casa) {
      const j = demo.leer();
      const limpia = {}, amigos = amistad(j, demo.hoy()).amigos;
      /* también se pegan los amigos que están de visita («amigo-<id>»), y cada calcomanía va en la casita o en un mapa
         que ya tiene (`e`); los mapas mismos no se pegan */
      Object.keys(casa).slice(0, TIENDA.length + PERSONAJES.length).forEach(id => {
        const esAmigo = id.indexOf('amigo-') === 0;
        if (esAmigo ? !amigos.includes(id.slice(6)) : (j.inventario.indexOf(id) < 0 || id.indexOf('mapa-') === 0)) throw new Error(esAmigo ? 'Ese amigo no está de visita.' : 'Eso no está en tu bandeja de calcomanías.');
        const c = casa[id];
        if (!(c.x >= 0 && c.x <= 100 && c.y >= 0 && c.y <= 100 && c.s >= .3 && c.s <= 3 && Number.isInteger(c.z))) throw new Error('Esa calcomanía no se entiende.');
        limpia[id] = { x: Math.round(c.x * 10) / 10, y: Math.round(c.y * 10) / 10, s: Math.round(c.s * 100) / 100, z: c.z, f: c.f === true };
        if (c.e) {
          if (j.inventario.indexOf('mapa-' + c.e) < 0) throw new Error('Todavía no tienes ese mapa.');
          limpia[id].e = String(c.e);
        }
      });
      j.casa = limpia;
      const nuevas = demo.insignias(j); demo.guardar(j);
      return { ok: true, insignias: nuevas, estado: demo.estado() };
    }
  };
  const espera = v => new Promise(r => setTimeout(() => r(v), 180));
  /* el servidor dice lo mismo con este texto: la app lo reconoce y muestra «vuelve mañana» */
  const SIN_ENERGIA = '¡Se acabó tu energía de hoy! Vuelve mañana ⚡';
  function sinEnergia() { const e = new Error(SIN_ENERGIA); e.sinEnergia = true; return e; }
  const marcar = e => { if (e && e.message === SIN_ENERGIA) e.sinEnergia = true; throw e; };

  /* Los libros de la biblioteca (uno por etapa, completo). Vienen del sistema con la clave del alumno porque se venden en
     Amazon: no están en esta app pública. En la prueba (?demo=1) se leen de demo-libros/, que arma
     herramientas/libros_demo.js y no se sube a GitHub. Cada libro se baja una sola vez por visita. */
  const libros = {};
  async function bajarLibro(n) {
    if (LIBRE) throw new Error('Este libro está en Amazon 📚');
    const url = DEMO ? 'demo-libros/piano-' + n + '.json'   // por ahora el bosque es de piano para todos
      : window.BOSQUE_API + '?api=libro&k=' + encodeURIComponent(clave) + '&etapa=' + n;
    let d;
    try { d = await (await fetch(url)).json(); } catch (e) { throw new Error(DEMO ? 'En la prueba faltan los libros: corre node herramientas/libros_demo.js' : 'No se pudo abrir el libro. Revisa tu internet.'); }
    if (d.error) throw new Error(d.error);
    return d;
  }

  /* en el modo local, los errores del motor llegan como promesa rechazada (igual que los del servidor) */
  const local = fn => new Promise((ok, mal) => { try { ok(fn()); } catch (e) { mal(e); } }).then(espera);
  return {
    demo: DEMO,
    libre: LIBRE,
    energia: { max: ENERGIA_DIA, error: COSTO_ERROR, gasto },
    tieneClave: () => LOCAL || !!clave,
    cargar: () => LOCAL ? local(() => porInstrumento(demo.estado())) : get(),
    practica: (actividad, terminada) => (LOCAL ? local(() => porInstrumento(demo.practica({ actividad, terminada }))) : post({ accion: 'practicaJuego', actividad, terminada })).catch(marcar),
    comprar: item => LOCAL ? local(() => demo.comprar(item)) : post({ accion: 'comprarJuego', item }),
    mejorar: item => LOCAL ? local(() => demo.mejorar(item)) : post({ accion: 'mejorarJuego', item }),
    usar: item => LOCAL ? local(() => demo.usar(item)) : post({ accion: 'usarJuego', item }),
    dar: (regalo, amigo) => LOCAL ? local(() => demo.dar(regalo, amigo)) : post({ accion: 'darJuego', regalo, amigo }),
    libro: n => libros[n] || (libros[n] = bajarLibro(n).catch(e => { delete libros[n]; throw e; })),
    guardarCasa: casa => LOCAL ? local(() => demo.casa(casa)) : post({ accion: 'guardarCasa', casa }),
    /* el vestidor (26-nov-2026). Por ahora solo en la prueba: el servidor todavía no lo tiene */
    comprarRopa: item => LOCAL ? local(() => demo.comprarRopa(item)) : post({ accion: 'comprarRopa', item }),
    vestir: puesto => LOCAL ? local(() => demo.vestir(puesto)) : post({ accion: 'vestirJuego', puesto }),
    nivel: semana => LOCAL ? local(() => porInstrumento(demo.nivel(semana))) : post({ accion: 'nivelJuego', semana }),
    /* reportar un error o un reclamo (llega a la hoja «Reportes» del sistema); en la prueba (?demo=1) no se manda */
    reporte: datos => DEMO ? local(() => ({ ok: true })) : post(Object.assign({ accion: 'reporteJuego' }, datos)),
    /* «Guardar mi progreso con Google»: el servidor revisa el token, pasa lo jugado en este celular (solo la primera vez)
       y devuelve la clave del bosque de esa persona; desde ahí la app entra con esa clave, como un alumno */
    async entrarGoogle(credencial) {
      const r = await post({ accion: 'entrarGoogle', credencial, local: LIBRE ? demo.leer() : null });
      try { localStorage.setItem('bosque-clave', r.clave); } catch (e) { }
      location.replace(location.pathname + '?k=' + encodeURIComponent(r.clave));
      return r;
    }
  };
})();
