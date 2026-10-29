/* GENERADO por herramientas/copiar_motores.py desde página_Sprinkloud/practica/ritmo.html: no editar a mano. */
window.Ritmo = (function () {
'use strict';
const CELLS = [
  {id:"pan",   tab:"base", notes:[{b:1}]},
  {id:"luna",  tab:"base", notes:[{b:.5},{b:.5}]},
  {id:"choco", tab:"base", notes:[{b:.25},{b:.25},{b:.25},{b:.25}]},
  {id:"gran",  tab:"base", notes:[{b:.5},{b:.25},{b:.25}]},
  {id:"cama",  tab:"base", notes:[{b:.25},{b:.25},{b:.5}]},
  {id:"vali",  tab:"base", notes:[{b:.25},{b:.5},{b:.25}]},
  {id:"blan",  tab:"base", notes:[{b:.5,dot:1},{b:.25}]},
  {id:"ques",  tab:"base", notes:[{b:.25},{b:.5,dot:1}]},
  {id:"musi",  tab:"base", notes:[{b:.5,t:1},{b:.5,t:1},{b:.5,t:1}]},
  {id:"y",     tab:"base", notes:[{b:.5}]},

  {id:"lee",   tab:"extended", notes:[{b:1,dot:1}]},
  {id:"bla2",  tab:"extended", notes:[{b:2}]},
  {id:"bla3",  tab:"extended", notes:[{b:2,dot:1}]},
  {id:"red",   tab:"extended", notes:[{b:4}]},

  {id:"s16",   tab:"silences", notes:[{b:.25,rest:1}]},
  {id:"s8",    tab:"silences", notes:[{b:.5,rest:1}]},
  {id:"s4",    tab:"silences", notes:[{b:1,rest:1}]},
  {id:"s2",    tab:"silences", notes:[{b:2,rest:1}]},
  {id:"ct",    tab:"silences", notes:[{b:.5,rest:1},{b:.5}]},
  {id:"pc",    tab:"silences", notes:[{b:.5},{b:.5,rest:1}]},

  /* 6/8: el pulso es la negra con puntillo (tres corcheas) */
  {id:"tres8", tab:"seis", notes:[{b:.5},{b:.5},{b:.5}]},
  {id:"negp6", tab:"seis", notes:[{b:1,dot:1}]},
  {id:"neg8",  tab:"seis", notes:[{b:1},{b:.5}]},
  {id:"och4",  tab:"seis", notes:[{b:.5},{b:1}]},
  {id:"blap6", tab:"seis", notes:[{b:2,dot:1}]},
  {id:"s4p6",  tab:"seis", notes:[{b:1,dot:1,rest:1}]},
  {id:"s8n6",  tab:"seis", notes:[{b:.5,rest:1},{b:1}]}
];

/* Sílabas de la guía de Sprinkloud para cada célula, iguales a las de practica/hojas.html:
   Kodály (ta = negra, ti-ti = dos corcheas, sh = silencio, ta-a = blanca) y Takadimi para semicorcheas, tresillos y 6/8 */
const SILABAS = {
  pan:"ta", luna:"ti-ti", choco:"ta-ka-di-mi", gran:"ta di-mi", cama:"ta-ka di", vali:"ta-ka mi", blan:"ta mi", ques:"ta-ka",
  musi:"ta-ki-da", y:"ti", lee:"ta-i", bla2:"ta-a", bla3:"ta-a-a", red:"ta-a-a-a",
  s16:"sh", s8:"sh", s4:"sh", s2:"sh-sh", ct:"sh ti", pc:"ti sh",
  tres8:"ta-ki-da", negp6:"ta", neg8:"ta da", och4:"ta ki", blap6:"ta-a", s4p6:"sh", s8n6:"sh ki"
};
const silaba = c => '<span class="sil">' + (SILABAS[c.id] || "") + '</span>';

/* Compases: largo del compás y del pulso en negras (6/8 se siente "en dos": dos pulsos de negra con puntillo) */
const COMPASES = {
  "4/4": {bar:4, pulso:1},
  "3/4": {bar:3, pulso:1},
  "2/4": {bar:2, pulso:1},
  "6/8": {bar:3, pulso:1.5}
};

const EXAMPLES = [
  {compas:"4/4", name:"Marcha",          ids:["pan","luna","pan","pan","luna","luna","pan","pan"]},
  {compas:"4/4", name:"Corcheas y semis",ids:["luna","choco","luna","pan","choco","luna","choco","pan"]},
  {compas:"4/4", name:"Con silencios",   ids:["pan","s4","luna","pan","luna","s4","choco","pan"]},
  {compas:"4/4", name:"Puntillos",       ids:["blan","luna","ques","pan","blan","blan","luna","pan"]},
  {compas:"3/4", name:"Vals",            ids:["pan","pan","pan","bla2","pan","pan","luna","pan","bla3"]},
  {compas:"3/4", name:"Con puntillo",    ids:["lee","y","pan","pan","luna","luna","bla3"]},
  {compas:"2/4", name:"Marcha en dos",   ids:["pan","pan","luna","pan","luna","luna","bla2"]},
  {compas:"2/4", name:"Polca",           ids:["luna","choco","pan","s4","luna","luna","bla2"]},
  {compas:"6/8", name:"Barcarola",       ids:["negp6","negp6","tres8","negp6","neg8","neg8","blap6"]},
  {compas:"6/8", name:"Tarantela",       ids:["tres8","tres8","neg8","tres8","tres8","neg8","negp6","s4p6"]}
];

/* Ritmos latinos populares (patrón básico de cada uno, dos o cuatro compases). Al elegir uno se cambia al compás que usa */
const LATINOS = [
  {compas:"4/4", name:"Salsa (clave 3-2)",     pais:"Cuba y el Caribe", ids:["lee","lee","pan","s4","pan","bla2"]},
  {compas:"4/4", name:"Son cubano (clave 2-3)", pais:"Cuba",            ids:["s4","pan","bla2","lee","lee","pan"]},
  {compas:"4/4", name:"Reggaetón (dembow)",    pais:"Puerto Rico y Panamá", ids:["blan","luna","blan","luna","blan","luna","blan","luna"]},
  {compas:"4/4", name:"Cumbia",                pais:"Colombia y México", ids:["pan","ct","pan","ct","pan","ct","pan","ct"]},
  {compas:"4/4", name:"Bachata",               pais:"República Dominicana", ids:["pan","pan","pan","luna","pan","pan","pan","luna"]},
  {compas:"4/4", name:"Bolero",                pais:"Cuba y México",    ids:["pan","luna","pan","pan","pan","luna","pan","pan"]},
  {compas:"2/4", name:"Habanera y tango",      pais:"Cuba y Argentina", ids:["blan","luna","blan","luna","blan","luna","bla2"]},
  {compas:"2/4", name:"Sanjuanito",            pais:"Ecuador",          ids:["gran","gran","gran","gran","gran","gran","pan","pan"]},
  {compas:"3/4", name:"Pasillo",               pais:"Ecuador y Colombia", ids:["pan","ct","pan","pan","ct","pan","pan","ct","pan","bla3"]},
  {compas:"3/4", name:"Vals criollo",          pais:"Perú",             ids:["pan","luna","luna","pan","luna","luna","pan","luna","luna","bla3"]},
  {compas:"6/8", name:"Huapango",              pais:"México",           ids:["tres8","neg8","tres8","neg8","tres8","neg8","blap6"]},
  {compas:"6/8", name:"Son jarocho",           pais:"México",           ids:["neg8","neg8","neg8","neg8","neg8","tres8","blap6"]},
  {compas:"6/8", name:"Joropo",                pais:"Venezuela y Colombia", ids:["tres8","tres8","tres8","tres8","neg8","tres8","blap6"]}
];

const byId = id => CELLS.find(c => c.id === id);

/* =========================================================
   2. Notación dibujada en SVG (sin depender de fuentes musicales)
   ========================================================= */
const G = {Y:50, TOP:16, RX:5.4, RY:4.1, SW:1.7, BEAM:4.6, GAP:6.6};
const rd = (x,n) => { const p = Math.pow(10, n||6); return Math.round(x*p)/p; };
const noteDur = n => rd(n.b * (n.dot ? 1.5 : 1) * (n.t ? 2/3 : 1));
const cellDur = c => rd(c.notes.reduce((s,n) => s + noteDur(n), 0), 3);
const flagsOf = n => (n.rest ? 0 : n.b === .25 ? 2 : n.b === .5 ? 1 : 0);

function flagGlyph(sx, top, count){
  let s = "";
  for(let k=0;k<count;k++){
    const y = top + k*7.6;
    s += '<path d="M'+(sx+G.SW)+','+y+' c8,3.4 10.5,9 6.6,15.2 c1.6,-7.2 -1.6,-10.2 -6.6,-11.8 z"/>';
  }
  return s;
}

function restGlyph(b, x){
  const Y = G.Y;
  if(b >= 4)
    return '<rect x="'+(x-13)+'" y="'+(Y-9)+'" width="26" height="1.4" opacity=".5"/><rect x="'+(x-9)+'" y="'+(Y-9)+'" width="18" height="6.2" rx="1"/>';
  if(b >= 2)
    return '<rect x="'+(x-13)+'" y="'+(Y+1)+'" width="26" height="1.4" opacity=".5"/><rect x="'+(x-9)+'" y="'+(Y-5)+'" width="18" height="6.2" rx="1"/>';
  if(b >= 1)
    return '<path d="M'+(x-4)+','+(Y-18)+' L'+(x+4)+','+(Y-9)+' L'+(x-3)+','+(Y-1)+' L'+(x+4.5)+','+(Y+7)+'" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>'
         + '<path d="M'+(x+4.5)+','+(Y+7)+' c-5.6,-3.6 -10.2,-0.4 -8.1,4.3 c1.2,2.9 3.9,4.7 6.7,5.7 c-3.7,-4.1 -2.4,-7.7 2.4,-6.5 z"/>';
  if(b >= .5)
    return '<path d="M'+(x+4)+','+(Y-11)+' L'+(x-3.6)+','+(Y+11)+'" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'
         + '<circle cx="'+(x-.2)+'" cy="'+(Y-8.4)+'" r="3.4"/>';
  return '<path d="M'+(x+4)+','+(Y-16)+' L'+(x-4.2)+','+(Y+12)+'" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'
       + '<circle cx="'+(x+.2)+'" cy="'+(Y-13.4)+'" r="3.2"/><circle cx="'+(x-2.4)+'" cy="'+(Y-2.6)+'" r="3.2"/>';
}

function cellSVG(cell, opt){
  opt = opt || {};
  const prefix = opt.prefix;
  const ns = cell.notes, dur = cellDur(cell);

  let acc = 0;
  const ts = ns.map(n => { const v = acc; acc += noteDur(n); return v; });

  // El ancho respeta la proporción de las duraciones, pero nunca deja
  // que dos figuras se toquen.
  let span = 54*Math.pow(dur,.55) - 36;
  for(let i=0;i<ns.length-1;i++){
    // un silencio necesita más aire para que se lea su medio pulso
    const need = (ns[i].rest || ns[i+1].rest) ? 34 : 19;
    span = Math.max(span, need / (noteDur(ns[i])/dur));
  }
  const W = Math.round(Math.min(320, Math.max(70, span + 36)));
  const L = 18, R = W - 18;
  const xs = ns.map((n,i) => ns.length === 1 ? W/2 : L + (ts[i]/dur)*(R-L));
  const dx = G.RX - .6;

  // Grupos unidos por barra
  const groups = []; let cur = null;
  ns.forEach((n,i) => {
    if(flagsOf(n) > 0){ if(!cur){ cur = []; groups.push(cur); } cur.push(i); }
    else cur = null;
  });

  const beamed = new Set();
  const beams = [];
  groups.forEach(gr => {
    if(gr.length < 2) return;
    gr.forEach(i => beamed.add(i));
    const maxF = Math.max.apply(null, gr.map(i => flagsOf(ns[i])));
    for(let lv=1; lv<=maxF; lv++){
      let p = 0;
      while(p < gr.length){
        if(flagsOf(ns[gr[p]]) < lv){ p++; continue; }
        let q = p;
        while(q+1 < gr.length && flagsOf(ns[gr[q+1]]) >= lv) q++;
        const y = G.TOP + (lv-1)*G.GAP;
        if(q > p){
          const x1 = xs[gr[p]]+dx-.5, x2 = xs[gr[q]]+dx+G.SW+.5;
          beams.push('<rect x="'+x1.toFixed(1)+'" y="'+y+'" width="'+(x2-x1).toFixed(1)+'" height="'+G.BEAM+'" rx="0.7"/>');
        } else {
          const w = 8.5, x0 = xs[gr[p]]+dx;
          const x1 = p === 0 ? x0 : x0 - w + G.SW;   // barra corta hacia el lado del grupo
          beams.push('<rect x="'+x1.toFixed(1)+'" y="'+y+'" width="'+w+'" height="'+G.BEAM+'" rx="0.7"/>');
        }
        p = q + 1;
      }
    }
    if(ns[gr[0]].t){
      const cx = (xs[gr[0]] + xs[gr[gr.length-1]] + dx)/2;
      beams.push('<text x="'+cx.toFixed(1)+'" y="'+(G.TOP-4)+'" text-anchor="middle" font-size="11.5" font-style="italic" font-weight="600">3</text>');
    }
  });

  const parts = ns.map((n,i) => {
    const x = xs[i];
    const nid = prefix != null ? ' data-nid="'+prefix+'-'+i+'"' : "";
    let s = "";
    if(n.rest){
      s += restGlyph(n.b, x);
      if(n.dot) s += '<circle cx="'+(x+9.5).toFixed(1)+'" cy="'+(G.Y-4)+'" r="1.9"/>';
    } else {
      const hollow = n.b >= 2;
      s += '<ellipse cx="'+x.toFixed(1)+'" cy="'+G.Y+'" rx="'+(hollow?6.3:G.RX)+'" ry="'+(hollow?4.6:G.RY)+'" transform="rotate(-16 '+x.toFixed(1)+' '+G.Y+')" '+(hollow?'fill="none" stroke="currentColor" stroke-width="1.8"':"")+'/>';
      if(n.b < 4){
        const sx = x + dx, top = flagsOf(n) > 0 ? G.TOP : G.TOP+3;
        s += '<rect x="'+sx.toFixed(1)+'" y="'+top+'" width="'+G.SW+'" height="'+(G.Y-top).toFixed(1)+'"/>';
        if(!beamed.has(i) && flagsOf(n) > 0) s += flagGlyph(sx, G.TOP, flagsOf(n));
      }
      if(n.dot) s += '<circle cx="'+(x+10.5).toFixed(1)+'" cy="'+G.Y+'" r="1.9"/>';
    }
    return '<g class="nt"'+nid+'>'+s+'</g>';
  }).join("");

  return '<svg class="rsvg" viewBox="0 4 '+W+' 68" width="'+W+'" height="68" fill="currentColor" aria-hidden="true">'+beams.join("")+parts+'</svg>';
}

return { CELLS, SILABAS, COMPASES, byId, cellDur, noteDur, cellSVG };
})();
