
(function(){
'use strict';
var $=function(s){return document.querySelector(s)};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(m){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})};
var norm=function(s){return String(s==null?'':s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()};

var ov=$('#in196Overlay'),listEl=$('#in196List'),detEl=$('#in196Detail'),searchEl=$('#in196Search');
var flat=[],byId=new Map(),ready=false;
var st={mode:'all',group:'all',q:'',limit:50,sel:null,folder:null};

var blockLabels={1:'Urgencias críticas',2:'Monitorización y escalas',3:'Vía aérea y ventilación',4:'Cardiología crítica',
5:'Renal, electrólitos y endocrino',6:'Infecciones y sepsis',7:'Neurología y neurocríticos',8:'Trauma, TCE y quemaduras',
9:'Poblaciones especiales',10:'Perioperatorio y trasplantes',11:'Procedimientos, ecografía e imagen',12:'Toxicología y desastres',
13:'Farmacología y calculadoras',14:'Dolor, delirium, nutrición y movilidad',15:'Hematología, seguridad y enfermería',
16:'Cirugía torácica y MBE',17:'Patologías críticas',18:'Herramientas clínicas',19:'Vademécum crítico',
20:'Electro, Rayos X y POCUS',21:'Integración y calidad'};

var blockIcons={1:'🚨',2:'📈',3:'🫁',4:'❤️',5:'🫘',6:'🦠',7:'🧠',8:'🚑',9:'👶',10:'🏥',
11:'🩻',12:'☣️',13:'💊',14:'💧',15:'🩸',16:'🫀',17:'🩺',18:'🧰',19:'💊',20:'🩻',21:'✅'};

var modes=[['all','🩺 Patologías']];
var favs=[];try{favs=JSON.parse(localStorage.getItem('in196_favs')||'[]')||[]}catch(e){favs=[]}
function saveFavs(){try{localStorage.setItem('in196_favs',JSON.stringify(favs))}catch(e){}}

var coll=function(b){return b.fichas||b.herramientas||b.elementos||b.cards||[]};
var titleOf=function(x){return x.titulo||x.nombre_generico||x.name||x.id};
var subOf=function(x){return x.subcategoria||x.categoria||x.clase_farmacologica||x.tipo_herramienta||''};
var sumOf=function(x){return x.definicion_documental||x.definicion_y_finalidad||x.definicion||x.finalidad_documental||x.finalidad||x.resumen||x.summary||x.proposito||x.descripcion||''};
var ICONMAP=[
  [/cardi|coraz|arritm|\britmo\b|fibrilac|bradicar|taquicar|hemodinam|\bchoque\b|shock|perfus|presion arterial|gasto cardiaco|isquem|infarto|angina|marcapas|desfibril/,'❤️'],
  [/respirat|pulmon|hipoxem|neumot|ventilac|oxigen|capnograf|via aerea|asma|epoc|disnea|intubac|torac|derrame pleural/,'🫁'],
  [/infec|sepsis|septic|microb|antibiot|bacteri|viral|hongo|\bfoco\b|neumonia/,'🦠'],
  [/neuro|cerebr|glasgow|ictus|craneal|conscienc|convuls|\bcoma\b|encefal|delirium|sedac/,'🧠'],
  [/renal|rinon|oliguria|diuresis|nefro|urinari|dialisis|creatinin/,'🫘'],
  [/electrolit|potasio|sodio|calcio|magnesio|acido.?base|acidosis|alcalosis|hiperpotas|hipopotas|hipernatr|hiponatr|fosfato/,'🧪'],
  [/monitor|oximetr|presion venosa|cateter|linea arterial|termodilu|picco|flotrac|vigileo|doppler|saturacion|lidco/,'📈'],
  [/escala|\bscore\b|apache|saps|\bsofa\b|qsofa|\bmeld\b|marcador|cribado|\bindice\b/,'📊'],
  [/farmac|dosis|medicament|vademec|\binfusion\b|analges/,'💊'],
  [/trauma|fractur|lesion|herida|quemad|politraum/,'🚑'],
  [/hemat|sangre|coagul|transfus|hemorrag|anemia|plaquet|\bcid\b/,'🩸'],
  [/endocrin|glucos|insulin|diabet|hormon|tiroid|suprarrenal|cetoacid/,'🧬'],
  [/nutri|alimentac|enteral|parenteral/,'🍎'],
  [/gobernanz|fundament|principio|\bgeneral|seguridad|calidad|\betica|comunicac|documentac/,'🏛️']
];
var iconOf=function(x){
  if(x.icono||x.icon)return x.icono||x.icon;
  var s=norm([x.__t||'',(typeof subOf==='function'?subOf(x):'')||'',x.__mod||'',blockLabels[x.__b]||''].join(' '));
  for(var i=0;i<ICONMAP.length;i++){if(ICONMAP[i][0].test(s))return ICONMAP[i][1]}
  return({17:'🚨',18:'🧰',19:'💊',20:'🩻',21:'✅'}[x.__b]||'📘');
};

function load(){
  if(ready)return true;
  var tag=document.getElementById('inurse-master-21');
  if(!tag){listEl.innerHTML='<div class="cnt">No se encontró el catálogo de la Biblioteca.</div>';return false}
  var raw;
  try{raw=JSON.parse(tag.textContent)}catch(e){listEl.innerHTML='<div class="cnt">No se pudo leer el catálogo.</div>';return false}
  raw.forEach(function(b){
    coll(b).forEach(function(it){
      var x=Object.assign({},it);
      x.__b=b._numero_bloque;x.__mod=b.modulo||'';
      x.__t=titleOf(x);x.__s=sumOf(x);
      x.__q=norm([x.__t,x.__s,subOf(x),JSON.stringify(x.etiquetas||[]),JSON.stringify(x.sinonimos_o_alias||[]),blockLabels[x.__b]||''].join(' '));
      flat.push(x)
    })
  });
  byId=new Map(flat.map(function(x){return [x.id,x]}));
  $('#in196Sub').textContent='21 bloques · '+flat.length.toLocaleString('es-ES')+' recursos';
  ready=true;return true
}

function groups(){
  if(st.mode==='block')return Object.keys(blockLabels).map(function(k){return{id:k,label:k+'. '+blockLabels[k]}});
  if(st.mode==='pathology'){
    var s={};flat.forEach(function(x){if(x.__b===17&&subOf(x))s[subOf(x)]=1});
    return Object.keys(s).sort(function(a,b){return a.localeCompare(b,'es')}).map(function(l){return{id:l,label:l}})
  }
  return []
}
function inMode(x){
  if(st.mode==='all')return true;
  if(st.mode==='fav')return favs.indexOf(x.id)>=0;
  if(st.mode==='block')return st.group==='all'||String(x.__b)===String(st.group);
  if(st.mode==='pathology')return x.__b===17&&(st.group==='all'||subOf(x)===st.group);
  return true
}
function filtered(){
  // La búsqueda recorre TODA la Biblioteca (ignora el bloque abierto).
  if(st.q){
    var terms=norm(st.q).split(/\s+/).filter(Boolean);
    return flat.map(function(x){
      var sc=terms.reduce(function(a,t){return a+(norm(x.__t).indexOf(t)>=0?6:0)+(norm(subOf(x)).indexOf(t)>=0?3:0)+(x.__q.indexOf(t)>=0?1:0)},0);
      return{x:x,sc:sc}
    }).filter(function(z){return z.sc>0}).sort(function(a,b){return b.sc-a.sc||a.x.__t.localeCompare(b.x.__t,'es')}).map(function(z){return z.x})
  }
  // Dentro de un bloque: solo sus fichas, ordenadas alfabéticamente.
  if(st.folder){
    return flat.filter(function(x){return String(x.__b)===String(st.folder)})
      .sort(function(a,b){return String(a.__t).localeCompare(String(b.__t),'es')})
  }
  return flat.filter(inMode)
}
function renderChips(){
  $('#in196Modes').innerHTML=modes.map(function(m){
    return '<button class="chip '+(st.mode===m[0]?'on':'')+'" data-m="'+m[0]+'">'+m[1]+'</button>'
  }).join('');
  var g=groups();
  $('#in196Groups').innerHTML=g.length?('<button class="chip '+(st.group==='all'?'on':'')+'" data-g="all">Todas</button>'+
    g.map(function(x){return '<button class="chip '+(String(st.group)===String(x.id)?'on':'')+'" data-g="'+esc(x.id)+'">'+esc(x.label)+'</button>'}).join('')):''
}
function renderFolders(){
  var counts={};
  flat.forEach(function(x){counts[x.__b]=(counts[x.__b]||0)+1});
  var order=Object.keys(blockLabels);
  listEl.innerHTML='<div class="cnt">21 BLOQUES · '+flat.length.toLocaleString('es-ES')+' RECURSOS</div>'+
    order.map(function(k){
      var n=counts[k]||0;
      return '<button class="card folder" data-folder="'+k+'"><i class="cico">'+(blockIcons[k]||'📘')+'</i>'+
        '<b>'+esc(blockLabels[k])+'</b><em>'+n+' ficha'+(n===1?'':'s')+'</em></button>'
    }).join('')
}
function renderList(){
  // Portada de la Biblioteca: un recuadro por bloque.
  if(!st.q&&!st.folder){renderFolders();return}
  var arr=filtered(),shown=arr.slice(0,st.limit),head;
  if(!st.q&&st.folder){
    head='<button class="card in196-back-card" id="in196FolderBack"><i class="cico">←</i><b>Todos los bloques</b></button>'+
      '<div class="cnt">'+(blockIcons[st.folder]||'📘')+' '+esc(blockLabels[st.folder]||('Bloque '+st.folder))+' · '+arr.length+' ficha'+(arr.length===1?'':'s')+'</div>'
  }else{
    head='<div class="cnt">'+arr.length.toLocaleString('es-ES')+' RESULTADOS · '+flat.length.toLocaleString('es-ES')+' RECURSOS</div>'
  }
  listEl.innerHTML=head+
   (shown.length?shown.map(function(x){
     return '<button class="card" data-id="'+esc(x.id)+'"><i class="cico">'+iconOf(x)+'</i><b>'+esc(x.__t)+'</b>'+
     '<em>Bloque '+x.__b+' · '+esc(subOf(x)||x.__mod)+'</em><span>'+esc(String(x.__s).slice(0,180))+'</span></button>'
   }).join(''):'<div class="cnt">Sin resultados.</div>')+
   (arr.length>shown.length?'<button class="card" id="in196More" style="text-align:center"><b>Cargar más ('+(arr.length-shown.length)+')</b></button>':'')
}
var skip={id:1,titulo:1,nombre_generico:1,categoria:1,subcategoria:1,icono:1,tipo:1,advertencia:1,relacionados:1,comportamiento_en_app:1};
function lab(k){return String(k).replace(/_/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase()})}
function val(v){
  if(v==null||v==='')return'';
  if(Array.isArray(v)){
    if(!v.length)return'';
    if(v.every(function(x){return typeof x!=='object'||x===null}))return '<ul>'+v.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul>';
    return '<ol>'+v.map(function(x){return '<li>'+val(x)+'</li>'}).join('')+'</ol>'
  }
  if(typeof v==='object')return Object.keys(v).map(function(k){var r=val(v[k]);return r?'<p><b>'+esc(lab(k))+':</b> '+r+'</p>':''}).join('');
  return esc(v)
}
function plain(x){
  var p=[x.__t,x.__s];
  Object.keys(x).forEach(function(k){if(skip[k]||k.indexOf('__')===0)return;p.push(lab(k)+': '+(typeof x[k]==='string'?x[k]:JSON.stringify(x[k])))});
  return p.join('\n').slice(0,16000)
}
function show(id){
  var x=byId.get(id);if(!x)return;st.sel=id;
  var secs=Object.keys(x).filter(function(k){return !skip[k]&&k.indexOf('__')!==0&&x[k]!==''&&x[k]!=null})
    .map(function(k){return '<h3>'+esc(lab(k))+'</h3>'+(typeof x[k]==='string'?'<p>'+val(x[k])+'</p>':val(x[k]))}).join('');
  detEl.innerHTML='<button id="in196Back">← Volver</button>'+
    '<h2>'+iconOf(x)+' '+esc(x.__t)+'</h2>'+
    '<div class="acts"><button id="in196Fav">'+(favs.indexOf(x.id)>=0?'★ Quitar favorito':'☆ Favorito')+'</button>'+
    '<button id="in196Copy">📋 Copiar</button><button id="in196Speak">🔊 Leer</button></div>'+
    (x.__s?'<h3>Resumen</h3><p>'+esc(x.__s)+'</p>':'')+secs+
    (x.advertencia?'<div class="warn">⚠️ '+esc(x.advertencia)+'</div>':'');
  detEl.classList.add('on');
  $('#in196Back').onclick=function(){detEl.classList.remove('on')};
  $('#in196Fav').onclick=function(){var i=favs.indexOf(x.id);if(i>=0)favs.splice(i,1);else favs.unshift(x.id);saveFavs();show(x.id);renderList()};
  $('#in196Copy').onclick=function(){var t=plain(x);
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t)['catch'](function(){})}
    else{var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}catch(e){}ta.remove()}};
  $('#in196Speak').onclick=function(){
    if(!('speechSynthesis' in window))return;
    if(speechSynthesis.speaking){speechSynthesis.cancel();return}
    var u=new SpeechSynthesisUtterance(plain(x).slice(0,4000));u.lang='es-ES';u.rate=1.02;speechSynthesis.speak(u)};
  detEl.scrollTop=0
}
function openLib(mode){
  if(!load()){ov.classList.add('on');return}
  st.mode=(mode==='block'||mode==='pathology'||mode==='fav')?mode:'all';
  st.group='all';st.q='';st.limit=50;st.sel=null;st.folder=null;
  if(searchEl)searchEl.value='';
  detEl.classList.remove('on');
  ov.classList.add('on');ov.setAttribute('aria-hidden','false');document.body.classList.add('in196-open');
  renderChips();renderList()
}
function closeLib(){
  ov.classList.remove('on');ov.setAttribute('aria-hidden','true');
  document.body.classList.remove('in196-open');detEl.classList.remove('on');
  try{speechSynthesis.cancel()}catch(e){}
}

$('#in196Close').onclick=closeLib;
$('#in196Modes').onclick=function(e){var b=e.target.closest('[data-m]');if(!b)return;st.mode=b.dataset.m;st.group='all';st.limit=50;st.folder=null;detEl.classList.remove('on');renderChips();renderList()};
$('#in196Groups').onclick=function(e){var b=e.target.closest('[data-g]');if(!b)return;st.group=b.dataset.g;st.limit=50;detEl.classList.remove('on');renderChips();renderList()};
listEl.onclick=function(e){
  if(e.target.closest('#in196More')){st.limit+=80;renderList();return}
  if(e.target.closest('#in196FolderBack')){st.folder=null;st.limit=50;renderList();listEl.scrollTop=0;return}
  var f=e.target.closest('[data-folder]');
  if(f){st.folder=f.dataset.folder;st.limit=50;renderList();listEl.scrollTop=0;return}
  var c=e.target.closest('[data-id]');if(c)show(c.dataset.id)
};
searchEl.oninput=function(){st.q=searchEl.value;st.limit=50;renderList()};
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&ov.classList.contains('on'))closeLib()});

/* Entradas: capturamos el clic en window (fase captura) para adelantarnos
   a cualquier módulo antiguo que escuche en document. */
window.addEventListener('click',function(e){
  var el=e.target.closest('#library21Btn,[data-in192-view="library"],[data-in192-organize],#in192OpenFullLibrary,#in192LibrarySearch,#in17OpenVirtualLibrary,[data-library]');
  if(!el)return;
  e.preventDefault();e.stopPropagation();
  if(e.stopImmediatePropagation)e.stopImmediatePropagation();
  openLib(el.dataset?el.dataset.in192Organize:'all')
},true);

/* Desactiva la biblioteca antigua para que no interfiera. */
function cleanup(){
  var old=document.getElementById('in21Overlay');if(old)old.remove();
  var old2=document.getElementById('in195Overlay');if(old2){old2.classList.remove('on');old2.style.display='none'}
  var btn=document.getElementById('library21Btn');if(btn){btn.onclick=null;btn.title='Biblioteca virtual Enferix'}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',cleanup);else cleanup();
setTimeout(cleanup,600);setTimeout(cleanup,1800);

window.abrirBiblioteca=openLib;
window.EnferixNativeLibrary={open:openLib,close:closeLib,search:function(q){openLib('all');searchEl.value=q;st.q=q;renderList()},openItem:function(id){openLib('all');show(id)},isOpen:function(){return ov.classList.contains('on')}};
window.Enferix21=Object.assign({},window.Enferix21||{},{open:openLib,organize:openLib,close:closeLib});
})();
