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
var state={view:'catalog',calcId:null,values:{},query:'',cat:'all'};
var overlay=null;

function data(){return window.ENFERIX_ESCALAS_DATA||{CATEGORIES:[],CALCULATORS:[]};}
function esc(s){var d=document.createElement('div');d.textContent=s==null?'':String(s);return d.innerHTML;}
function norm(s){return (s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();}
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
      '<header class="esc35-head">'+
        '<div class="esc35-mark">📐</div>'+
        '<div class="esc35-title"><h2>Índices y escalas</h2><p>Anestesiología · calculadoras clínicas con interpretación</p></div>'+
        '<button type="button" id="esc35Home" title="Volver al catálogo">⌂</button>'+
        '<button type="button" id="esc35Close" title="Cerrar">✕</button>'+
      '</header>'+
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
  if(state.view==='calc'&&state.calcId)renderCalc();else showCatalog();
}
function close(){
  if(!overlay)return;
  overlay.classList.remove('on');
  overlay.setAttribute('aria-hidden','true');
  document.body.classList.remove('esc35-lock');
}
function openCalc(id){
  buildOverlay();
  var c=data().CALCULATORS.find(function(x){return x.id===id;});
  if(!c){open();return;}
  state.view='calc';state.calcId=id;state.values=initialValues(c);
  open();
}

/* ── Catálogo ── */
function showCatalog(){
  state.view='catalog';state.calcId=null;
  var d=data();
  var body=document.getElementById('esc35Body');
  var chips='<button type="button" class="esc35-chip'+(state.cat==='all'?' on':'')+'" data-cat="all">Todas</button>'+
    d.CATEGORIES.map(function(c){
      return '<button type="button" class="esc35-chip'+(state.cat===c?' on':'')+'" data-cat="'+esc(c)+'">'+esc(c)+'</button>';
    }).join('');
  body.innerHTML=
    '<section class="esc35-hero">'+
      '<div><span class="esc35-eyebrow">Especialidad · Anestesiología</span>'+
      '<h3>Índices y escalas clínicas listos para usar</h3>'+
      '<p>Riesgo perioperatorio, dolor, vía aérea, ventilación, hemodinámica, sedación, abstinencia, infecciones y farmacología. Cada escala muestra su puntuación, el riesgo estimado y la interpretación en vivo.</p></div>'+
      '<div class="esc35-stats"><div><b>'+d.CALCULATORS.length+'</b><span>escalas</span></div><div><b>'+d.CATEGORIES.length+'</b><span>categorías</span></div><div><b>100%</b><span>sin conexión</span></div></div>'+
    '</section>'+
    '<div class="esc35-tools">'+
      '<label class="esc35-search"><span>🔎</span>'+
      '<input id="esc35Search" type="search" placeholder="Buscar RCRI, SOFA, CIWA, Mallampati…" autocomplete="off">'+
      '<button type="button" id="esc35Clear" aria-label="Borrar búsqueda">✕</button></label>'+
      '<div class="esc35-filters" id="esc35Filters">'+chips+'</div>'+
    '</div>'+
    '<div id="esc35Groups"></div>'+
    '<aside class="esc35-note"><span>🛡️</span><div><b>Apoyo a la decisión clínica</b>'+
    '<p>Los resultados son orientativos y de apoyo formativo. Prevalecen los protocolos del centro, las guías vigentes y el juicio del profesional responsable.</p></div></aside>';
  var inp=document.getElementById('esc35Search');
  inp.value=state.query;
  inp.addEventListener('input',function(){state.query=inp.value;renderGroups();});
  document.getElementById('esc35Clear').addEventListener('click',function(){state.query='';inp.value='';inp.focus();renderGroups();});
  document.getElementById('esc35Filters').addEventListener('click',function(e){
    var b=e.target.closest('[data-cat]');if(!b)return;
    state.cat=b.dataset.cat;
    document.querySelectorAll('#esc35Filters .esc35-chip').forEach(function(x){x.classList.toggle('on',x===b);});
    renderGroups();
  });
  document.getElementById('esc35Groups').addEventListener('click',function(e){
    var card=e.target.closest('[data-esc35-id]');if(!card)return;
    state.view='calc';state.calcId=card.dataset.esc35Id;
    var c=data().CALCULATORS.find(function(x){return x.id===state.calcId;});
    state.values=initialValues(c);
    renderCalc();
  });
  renderGroups();
}

function renderGroups(){
  var d=data();
  var q=norm(state.query.trim());
  var list=d.CALCULATORS.filter(function(c){
    if(state.cat!=='all'&&c.category!==state.cat)return false;
    if(!q)return true;
    return norm(c.name).indexOf(q)>=0||norm(c.shortName||'').indexOf(q)>=0||
           norm(c.description).indexOf(q)>=0||norm(c.category).indexOf(q)>=0;
  });
  var html=d.CATEGORIES.map(function(cat){
    var items=list.filter(function(c){return c.category===cat;});
    if(!items.length)return '';
    return '<section class="esc35-cat"><h4>'+esc(cat)+' <small>'+items.length+'</small></h4>'+
      '<div class="esc35-grid">'+items.map(function(c){
        return '<button type="button" class="esc35-card" data-esc35-id="'+esc(c.id)+'">'+
          '<b>'+esc(c.name)+'</b><small>'+esc(c.description)+'</small></button>';
      }).join('')+'</div></section>';
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
