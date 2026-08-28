/* =========================================================================
   Enferix · Índices y escalas clínicas (Anestesiología)
   Interfaz del módulo: catálogo con buscador y agrupación por categorías,
   y vista de calculadora estilo MDCalc (botones No/Sí con puntos,
   desplegables y panel de resultado en vivo con nivel de color).
   Consume window.ENFERIX_ESCALAS_DATA (/data/escalas-anestesia.js).
   Expone window.EnferixEscalas = { open, openCalc, close }.
   ========================================================================= */
(function(){
'use strict';

var LEVEL_LABEL={ok:'Bajo',info:'Leve',warn:'Intermedio',danger:'Alto'};
var DATA_SRC='/data/escalas-clinicas.js';
var state={view:'catalog',calcId:null,values:{},query:'',cat:'all',spec:'all'};
var overlay=null,dataPromise=null;

/* ── Escalas propias de Enferix migradas desde el apartado «Cálculo» ──
   Norton, Barthel, RASS, Morse y la escala de dolor no están en el catálogo
   importado, así que se adaptan desde CALCS (/data/escalas.js) al motor
   genérico. Se reutiliza su función compute() original sin reescribirla. */
var CAT_ENFERMERIA='Valoración enfermera';
var ESP_ENFERMERIA='Enfermería';
var LEGADO={
  norton:'Riesgo de úlceras por presión según estado físico, mental, actividad, movilidad e incontinencia.',
  barthel:'Grado de autonomía en las diez actividades básicas de la vida diaria.',
  rass:'Nivel de sedación y agitación del paciente crítico, de -5 a +4.',
  morse:'Riesgo de caídas durante el ingreso hospitalario.',
  dolor:'Intensidad del dolor mediante escala visual analógica o numérica verbal.'
};

/* El nivel de color se deduce del semáforo que ya usan las interpretaciones. */
function nivelDesdeTexto(t){
  if(/🔴/.test(t))return 'danger';
  if(/🟠|🟡/.test(t))return 'warn';
  if(/🟢/.test(t))return 'ok';
  return 'info';
}

/* CALCS se declara con «const» en /data/escalas.js, así que existe como global
   pero NO como propiedad de window: hay que leerlo por su nombre. */
function calcsGlobal(){
  try{if(typeof CALCS!=='undefined')return CALCS;}catch(e){}
  return window.CALCS||null;
}

function adaptarLegado(id){
  var todas=calcsGlobal();
  var c=todas&&todas[id];
  if(!c||!c.fields)return null;
  return {
    id:'legacy-'+id,
    name:c.title,
    description:LEGADO[id]||'',
    category:CAT_ENFERMERIA,
    specialty:[ESP_ENFERMERIA],
    inputs:c.fields.map(function(f){
      if(f.type==='number'){
        return {id:f.id,type:'number',label:f.label,unit:f.unit};
      }
      return {id:f.id,type:'select',label:f.label,dropdown:true,noPoints:true,
        options:(f.options||[]).map(function(o){return {value:o.v,label:o.l};})};
    }),
    compute:function(v){
      var r=c.compute(v)||{};
      return {
        main:String(r.main==null?'':r.main),
        interpretation:r.interp||'',
        level:nivelDesdeTexto(r.interp||''),
        details:r.detail?[r.detail]:[]
      };
    }
  };
}

var legadoCache=null;
function escalasLegado(){
  if(legadoCache)return legadoCache;
  if(!calcsGlobal())return [];
  var cat=window.ENFERIX_ESCALAS_DATA;
  /* Si el catálogo importado ya trae la escala con el mismo identificador
     (Barthel y RASS, por ejemplo), se usa esa y no la copia de «Cálculo»:
     así la sección nunca muestra la misma escala dos veces. */
  var yaEsta={};
  if(cat)cat.CALCULATORS.forEach(function(c){yaEsta[c.id]=true;});
  legadoCache=Object.keys(LEGADO).filter(function(id){return !yaEsta[id];})
    .map(adaptarLegado).filter(Boolean);
  return legadoCache;
}

function data(){
  var d=window.ENFERIX_ESCALAS_DATA;
  if(!d)return {CATEGORIES:[],SPECIALTIES:[],CALCULATORS:[]};
  var leg=escalasLegado();
  return {
    CATEGORIES:leg.length?d.CATEGORIES.concat([CAT_ENFERMERIA]):d.CATEGORIES,
    SPECIALTIES:leg.length?d.SPECIALTIES.concat([ESP_ENFERMERIA]):d.SPECIALTIES,
    CALCULATORS:d.CALCULATORS.concat(leg)
  };
}

/* El catálogo pesa varios cientos de KB: se carga la primera vez que se abre
   el módulo, para no penalizar el arranque de la aplicación. */
function ensureData(){
  if(window.ENFERIX_ESCALAS_DATA)return Promise.resolve();
  if(dataPromise)return dataPromise;
  dataPromise=new Promise(function(resolve,reject){
    var s=document.createElement('script');
    s.src=DATA_SRC;
    s.onload=function(){resolve();};
    s.onerror=function(){dataPromise=null;reject(new Error('No se pudo cargar '+DATA_SRC));};
    document.head.appendChild(s);
  });
  return dataPromise;
}
function esc(s){var d=document.createElement('div');d.textContent=s==null?'':String(s);return d.innerHTML;}
/* Varias escalas llevan subíndices o superíndices en el nombre (CHA₂DS₂-VASc,
   CHADS₂, PaO₂/FiO₂, ABCD²…) que nadie escribe con el teclado: se equiparan a
   sus dígitos normales antes de buscar. */
var DIGITOS={'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9',
             '⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9'};
function norm(s){
  return (s||'').normalize('NFD').replace(/[̀-ͯ]/g,'')
    .replace(/[⁰-₉¹²³]/g,function(ch){return DIGITOS[ch]||ch;})
    .toLowerCase();
}
/* Forma compacta (solo letras y números) para que «cha2ds2vasc» encuentre
   «CHA₂DS₂-VASc» y «pao2fio2» encuentre «PaO₂/FiO₂». */
function compact(s){return norm(s).replace(/[^a-z0-9]/g,'');}
function fmtNum(n,dec){return n.toLocaleString('es-ES',{minimumFractionDigits:0,maximumFractionDigits:dec==null?2:dec});}
function badge(p){return p>0?'+'+fmtNum(p):fmtNum(p);}

/* ── Montaje del overlay ── */
function buildOverlay(){
  if(overlay)return;
  overlay=document.createElement('section');
  overlay.id='esc35Overlay';
  overlay.setAttribute('aria-hidden','true');
  overlay.setAttribute('aria-label','Índices y escalas clínicas');
  overlay.innerHTML=
    '<div class="esc35-shell" role="dialog" aria-modal="true">'+
      // Cabecera como <div>: la app aplica un fondo oscuro con !important a
      // todo <header>, que en tema claro dejaría el texto ilegible.
      '<div class="esc35-head">'+
        '<div class="esc35-mark">📐</div>'+
        '<div class="esc35-title"><h2>Índices y escalas</h2><p id="esc35Sub">Escalas e índices clínicos con interpretación</p></div>'+
        '<button type="button" id="esc35Home" title="Volver al catálogo">⌂</button>'+
        '<button type="button" id="esc35Close" title="Cerrar">✕</button>'+
      '</div>'+
      '<div class="esc35-body" id="esc35Body"></div>'+
    '</div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click',function(e){
    if(e.target===overlay)close();
  });
  document.getElementById('esc35Close').addEventListener('click',close);
  document.getElementById('esc35Home').addEventListener('click',function(){showCatalog();});
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&overlay.classList.contains('on'))close();
  });
}

function open(){
  buildOverlay();
  overlay.classList.add('on');
  overlay.setAttribute('aria-hidden','false');
  document.body.classList.add('esc35-lock');
  if(window.ENFERIX_ESCALAS_DATA){
    if(state.view==='calc'&&state.calcId)renderCalc();else showCatalog();
    return;
  }
  document.getElementById('esc35Body').innerHTML=
    '<div class="esc35-loading">Cargando el catálogo de escalas…</div>';
  ensureData().then(function(){
    if(state.view==='calc'&&state.calcId)renderCalc();else showCatalog();
  }).catch(function(err){
    document.getElementById('esc35Body').innerHTML=
      '<div class="esc35-loading">No se pudo cargar el catálogo de escalas. '+
      'Comprueba la conexión y vuelve a intentarlo.</div>';
    console.error(err);
  });
}
function close(){
  if(!overlay)return;
  overlay.classList.remove('on');
  overlay.setAttribute('aria-hidden','true');
  document.body.classList.remove('esc35-lock');
}
function openCalc(id){
  buildOverlay();
  ensureData().then(function(){
    var c=data().CALCULATORS.find(function(x){return x.id===id;});
    if(c){state.view='calc';state.calcId=id;state.values=initialValues(c);}
    open();
  }).catch(function(){open();});
}

/* ── Catálogo ── */
function showCatalog(){
  state.view='catalog';state.calcId=null;
  var d=data();
  var body=document.getElementById('esc35Body');
  var specs='<button type="button" class="esc35-spec'+(state.spec==='all'?' on':'')+'" data-spec="all">Todas las especialidades</button>'+
    d.SPECIALTIES.map(function(s){
      var n=d.CALCULATORS.filter(function(c){return c.specialty.indexOf(s)>=0;}).length;
      return '<button type="button" class="esc35-spec'+(state.spec===s?' on':'')+'" data-spec="'+esc(s)+'">'+esc(s)+' <i>'+n+'</i></button>';
    }).join('');
  body.innerHTML=
    '<section class="esc35-hero">'+
      '<div><span class="esc35-eyebrow">'+esc(d.SPECIALTIES.slice(0,3).join(' · '))+
      (d.SPECIALTIES.length>3?' · +'+(d.SPECIALTIES.length-3)+' más':'')+'</span>'+
      '<h3>Índices y escalas clínicas listos para usar</h3>'+
      '<p>Gravedad en UCI, neurocrítico, ventilación, riesgo perioperatorio, arritmias, tromboembolismo, pediatría y neonatología, urgencias, medicina familiar, cirugía cardiotorácica, dolor, infecciones y farmacología. Cada escala muestra su puntuación, el riesgo estimado y la interpretación en vivo.</p></div>'+
      '<div class="esc35-stats"><div><b>'+d.CALCULATORS.length+'</b><span>escalas</span></div><div><b>'+d.SPECIALTIES.length+'</b><span>especialidades</span></div><div><b>100%</b><span>sin conexión</span></div></div>'+
    '</section>'+
    '<div class="esc35-specs" id="esc35Specs">'+specs+'</div>'+
    '<div class="esc35-tools">'+
      '<label class="esc35-search"><span>🔎</span>'+
      '<input id="esc35Search" type="search" placeholder="Buscar RCRI, SOFA, CHA₂DS₂-VASc, CIWA…" autocomplete="off">'+
      '<button type="button" id="esc35Clear" aria-label="Borrar búsqueda">✕</button></label>'+
      '<div class="esc35-filters" id="esc35Filters"></div>'+
    '</div>'+
    '<div id="esc35Groups"></div>'+
    '<aside class="esc35-note"><span>🛡️</span><div><b>Apoyo a la decisión clínica</b>'+
    '<p>Los resultados son orientativos y de apoyo formativo. Prevalecen los protocolos del centro, las guías vigentes y el juicio del profesional responsable.</p></div></aside>';
  var inp=document.getElementById('esc35Search');
  inp.value=state.query;
  inp.addEventListener('input',function(){state.query=inp.value;renderGroups();});
  document.getElementById('esc35Clear').addEventListener('click',function(){state.query='';inp.value='';inp.focus();renderGroups();});
  document.getElementById('esc35Specs').addEventListener('click',function(e){
    var b=e.target.closest('[data-spec]');if(!b)return;
    state.spec=b.dataset.spec;state.cat='all';
    document.querySelectorAll('#esc35Specs .esc35-spec').forEach(function(x){x.classList.toggle('on',x===b);});
    renderCatChips();renderGroups();
  });
  document.getElementById('esc35Filters').addEventListener('click',function(e){
    var b=e.target.closest('[data-cat]');if(!b)return;
    state.cat=b.dataset.cat;
    document.querySelectorAll('#esc35Filters .esc35-chip').forEach(function(x){x.classList.toggle('on',x===b);});
    renderGroups();
  });
  renderCatChips();
  document.getElementById('esc35Groups').addEventListener('click',function(e){
    var card=e.target.closest('[data-esc35-id]');if(!card)return;
    state.view='calc';state.calcId=card.dataset.esc35Id;
    var c=data().CALCULATORS.find(function(x){return x.id===state.calcId;});
    state.values=initialValues(c);
    renderCalc();
  });
  renderGroups();
}

function tarjeta(c){
  return '<button type="button" class="esc35-card" data-esc35-id="'+esc(c.id)+'">'+
    '<b>'+esc(c.name)+'</b><small>'+esc(c.description)+'</small></button>';
}

/* Escalas de la especialidad activa, sin aplicar buscador ni categoría. */
function bySpecialty(){
  var d=data();
  if(state.spec==='all')return d.CALCULATORS;
  return d.CALCULATORS.filter(function(c){return c.specialty.indexOf(state.spec)>=0;});
}

/* Solo se ofrecen las categorías que tienen escalas en la especialidad activa:
   con 26 categorías, mostrarlas todas siempre resultaría inmanejable. */
function renderCatChips(){
  var d=data();
  var present=bySpecialty().reduce(function(acc,c){acc[c.category]=(acc[c.category]||0)+1;return acc;},{});
  var html='<button type="button" class="esc35-chip'+(state.cat==='all'?' on':'')+'" data-cat="all">Todas</button>';
  html+=d.CATEGORIES.filter(function(c){return present[c];}).map(function(c){
    return '<button type="button" class="esc35-chip'+(state.cat===c?' on':'')+'" data-cat="'+esc(c)+'">'+
      esc(c)+' <i>'+present[c]+'</i></button>';
  }).join('');
  document.getElementById('esc35Filters').innerHTML=html;
}

function renderGroups(){
  var d=data();
  var q=norm(state.query.trim());
  var qc=compact(state.query);
  var list=bySpecialty().filter(function(c){
    if(state.cat!=='all'&&c.category!==state.cat)return false;
    if(!q)return true;
    var texto=[c.name,c.shortName||'',c.description,c.category,c.id].join(' ');
    return norm(texto).indexOf(q)>=0||(qc&&compact(texto).indexOf(qc)>=0);
  });

  /* Con más de 250 escalas, buscar un nombre concreto tiene que devolverlo
     primero: al buscar se muestra una lista única ordenada por relevancia,
     en lugar de la agrupación por categorías. */
  if(q){
    var puntuar=function(c){
      var nombre=norm(c.name+' '+(c.shortName||''));
      var nc=compact(c.name+' '+(c.shortName||''));
      if(nombre.indexOf(q)===0||nc.indexOf(qc)===0||norm(c.id).indexOf(q)===0)return 0;
      if(nombre.indexOf(q)>=0||(qc&&nc.indexOf(qc)>=0))return 1;
      return 2;
    };
    var ordenada=list.map(function(c,i){return {c:c,p:puntuar(c),i:i};})
      .sort(function(a,b){return a.p-b.p||a.i-b.i;}).map(function(x){return x.c;});
    document.getElementById('esc35Groups').innerHTML=ordenada.length
      ? '<section class="esc35-cat"><h4>Resultados <small>'+ordenada.length+'</small></h4>'+
        '<div class="esc35-grid">'+ordenada.map(tarjeta).join('')+'</div></section>'
      : '<p class="esc35-empty">No se encontraron escalas para «'+esc(state.query)+'».</p>';
    return;
  }
  var html=d.CATEGORIES.map(function(cat){
    var items=list.filter(function(c){return c.category===cat;});
    if(!items.length)return '';
    return '<section class="esc35-cat"><h4>'+esc(cat)+' <small>'+items.length+'</small></h4>'+
      '<div class="esc35-grid">'+items.map(tarjeta).join('')+'</div></section>';
  }).join('');
  document.getElementById('esc35Groups').innerHTML=
    html||'<p class="esc35-empty">No se encontraron escalas para «'+esc(state.query)+'».</p>';
}

/* ── Vista de calculadora ── */
function initialValues(c){
  var v={};
  c.inputs.forEach(function(inp){
    if(inp.type==='boolean')v[inp.id]=0;
    else if(inp.type==='select')v[inp.id]=(inp.default!=null?inp.default:inp.options[0].value);
  });
  return v;
}

function renderCalc(){
  var c=data().CALCULATORS.find(function(x){return x.id===state.calcId;});
  if(!c){showCatalog();return;}
  var body=document.getElementById('esc35Body');
  var chips='<span class="esc35-tag">'+esc(c.category)+'</span>'+
    (c.specialty||[]).map(function(s){return '<span class="esc35-tag subtle">'+esc(s)+'</span>';}).join('');
  body.innerHTML=
    '<div class="esc35-calc">'+
      '<button type="button" class="esc35-back" id="esc35Back">← Volver al catálogo</button>'+
      '<h3>'+esc(c.name)+'</h3>'+
      '<p class="esc35-desc">'+esc(c.description)+'</p>'+
      '<div class="esc35-tags">'+chips+'</div>'+
      '<div class="esc35-inputs" id="esc35Inputs"></div>'+
      '<div class="esc35-result" id="esc35Result" aria-live="polite"></div>'+
      '<div id="esc35Extra"></div>'+
      '<p class="esc35-disclaimer">Herramienta de apoyo docente y de cálculo. No sustituye el juicio clínico ni los protocolos de tu centro; verifica siempre las dosis y decisiones con fuentes oficiales.</p>'+
    '</div>';
  document.getElementById('esc35Back').addEventListener('click',function(){showCatalog();});
  var wrap=document.getElementById('esc35Inputs');
  c.inputs.forEach(function(inp){wrap.appendChild(inputRow(c,inp));});
  renderExtra(c);
  renderResult(c);
  document.querySelector('.esc35-shell').scrollTop=0;
}

function inputRow(c,inp){
  var row=document.createElement('div');
  row.className='esc35-row';
  var label='<div class="esc35-row-label"><b>'+esc(inp.label)+'</b>'+
    (inp.description?'<small>'+esc(inp.description)+'</small>':'')+'</div>';
  var ctrl=document.createElement('div');
  ctrl.className='esc35-row-ctrl';
  row.innerHTML=label;
  row.appendChild(ctrl);

  if(inp.type==='number'){
    var lab=document.createElement('label');
    lab.className='esc35-numwrap';
    var num=document.createElement('input');
    num.type='number';num.inputMode='decimal';
    if(inp.min!=null)num.min=inp.min;
    if(inp.max!=null)num.max=inp.max;
    num.step=inp.step!=null?inp.step:'any';
    if(state.values[inp.id]!=null&&!isNaN(state.values[inp.id]))num.value=state.values[inp.id];
    num.addEventListener('input',function(){
      state.values[inp.id]=num.value===''?undefined:Number(num.value);
      renderResult(c);
    });
    lab.appendChild(num);
    if(inp.unit){var u=document.createElement('span');u.className='esc35-unit';u.textContent=inp.unit;lab.appendChild(u);}
    ctrl.appendChild(lab);
  }else if(inp.type==='boolean'){
    var pts=inp.points!=null?inp.points:1;
    var seg=document.createElement('div');
    seg.className='esc35-seg';
    [0,pts].forEach(function(val,i){
      var cur=state.values[inp.id]||0;
      var b=document.createElement('button');
      b.type='button';
      b.className='esc35-segbtn'+((i===0)===(cur===0)?' sel':'');
      b.innerHTML='<span>'+esc(inp.labels?inp.labels[i]:(i===0?'No':'Sí'))+'</span>'+
        (inp.noPoints?'':'<i>'+badge(i===0?0:pts)+'</i>');
      b.addEventListener('click',function(){
        state.values[inp.id]=(i===0?0:pts);
        seg.querySelectorAll('.esc35-segbtn').forEach(function(x,j){x.classList.toggle('sel',j===i);});
        renderResult(c);
      });
      seg.appendChild(b);
    });
    ctrl.appendChild(seg);
  }else if(inp.type==='select'){
    if(inp.dropdown||inp.options.length>5){
      var sel=document.createElement('select');
      sel.className='esc35-select';
      inp.options.forEach(function(o){
        var op=document.createElement('option');
        op.value=o.value;
        op.textContent=o.label+(inp.noPoints?'':' ('+badge(o.value)+')');
        sel.appendChild(op);
      });
      sel.value=state.values[inp.id];
      sel.addEventListener('change',function(){
        state.values[inp.id]=Number(sel.value);
        renderResult(c);
      });
      ctrl.appendChild(sel);
    }else{
      var seg2=document.createElement('div');
      seg2.className='esc35-seg wrap';
      inp.options.forEach(function(o){
        var b=document.createElement('button');
        b.type='button';
        if(o.description)b.title=o.description;
        b.className='esc35-segbtn'+(state.values[inp.id]===o.value?' sel':'');
        b.innerHTML='<span>'+esc(o.label)+'</span>'+(inp.noPoints?'':'<i>'+badge(o.value)+'</i>');
        b.addEventListener('click',function(){
          state.values[inp.id]=o.value;
          seg2.querySelectorAll('.esc35-segbtn').forEach(function(x){x.classList.toggle('sel',x===b);});
          renderResult(c);
        });
        seg2.appendChild(b);
      });
      ctrl.appendChild(seg2);
    }
  }
  return row;
}

function renderResult(c){
  var box=document.getElementById('esc35Result');
  if(!box)return;
  var missing=c.inputs.some(function(i){
    return i.type==='number'&&(state.values[i.id]==null||isNaN(state.values[i.id]));
  });
  var r=null;
  if(!missing){
    try{r=c.compute(state.values);}catch(e){r=null;}
  }
  if(!r){
    box.className='esc35-result';
    box.innerHTML='<div class="esc35-result-empty">Completa los campos numéricos para ver el resultado.</div>';
    return;
  }
  box.className='esc35-result lvl-'+(r.level||'info');
  box.innerHTML=
    '<div class="esc35-result-top">'+
      '<div class="esc35-result-main"><b>'+esc(r.main)+'</b>'+(r.mainUnit?'<span>'+esc(r.mainUnit)+'</span>':'')+'</div>'+
      (r.secondary?'<div class="esc35-result-sec"><b>'+esc(r.secondary)+'</b>'+(r.secondaryLabel?'<span>'+esc(r.secondaryLabel)+'</span>':'')+'</div>':'')+
    '</div>'+
    '<div class="esc35-result-interp">'+
      (r.level?'<span class="esc35-pill">'+esc(LEVEL_LABEL[r.level]||r.level)+'</span>':'')+
      '<span>'+esc(r.interpretation)+'</span>'+
    '</div>'+
    (r.details&&r.details.length?'<ul class="esc35-result-details">'+r.details.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>':'');
}

function renderExtra(c){
  var box=document.getElementById('esc35Extra');
  var html='';
  if(c.notes&&c.notes.length)
    html+='<section class="esc35-extra"><h4>Notas</h4><ul>'+c.notes.map(function(n){return '<li>'+esc(n)+'</li>';}).join('')+'</ul></section>';
  if(c.references&&c.references.length)
    html+='<section class="esc35-extra"><h4>Referencias</h4><ul>'+c.references.map(function(n){return '<li>'+esc(n)+'</li>';}).join('')+'</ul></section>';
  box.innerHTML=html;
}

/* ── Enganches con la app ── */
function install(){
  var btn=document.getElementById('escalasBtn');
  if(btn)btn.addEventListener('click',open);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();

window.EnferixEscalas={open:open,openCalc:openCalc,close:close};
})();
