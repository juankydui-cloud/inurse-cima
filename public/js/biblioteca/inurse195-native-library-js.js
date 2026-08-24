
(function(){
'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const norm=s=>String(s??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
const safeStore={
 get(k,f=''){try{const v=localStorage.getItem(k);return v===null?f:v}catch(e){return f}},
 set(k,v){try{localStorage.setItem(k,v)}catch(e){}}
};
const overlay=$('#in195Overlay'),listEl=$('#in195List'),detailEl=$('#in195Detail'),countEl=$('#in195Count'),searchEl=$('#in195Search');
let raw=[],flat=[],byId=new Map(),ready=false;
let favs=[];try{favs=JSON.parse(safeStore.get('in195_favs','[]'))||[]}catch(e){favs=[]}
let state={mode:'all',group:'all',q:'',limit:40,selected:null};

const modes=[['all','Todo','📚'],['block','Por bloques','🔢'],['pathology','Patologías','🚨'],['system','Por sistemas','🫀'],['specialty','Especialidades','🏥']];
const blockLabels={1:'Urgencias críticas',2:'Monitorización y escalas',3:'Vía aérea y ventilación',4:'Cardiología crítica',5:'Renal, electrólitos y endocrino',6:'Infecciones y sepsis',7:'Neurología y neurocríticos',8:'Trauma, TCE y quemaduras',9:'Poblaciones especiales',10:'Perioperatorio y trasplantes',11:'Procedimientos, ecografía e imagen',12:'Toxicología y desastres',13:'Farmacología y calculadoras',14:'Dolor, delirium, nutrición y movilidad',15:'Hematología, seguridad y enfermería',16:'Cirugía torácica y MBE',17:'Patologías críticas',18:'Herramientas clínicas',19:'Vademécum crítico',20:'Electro, Rayos X y POCUS',21:'Integración y calidad'};
const systems=[
 {id:'cardio',label:'Cardiovascular',icon:'❤️',color:'#EF476F',blocks:[4],keys:'cardio hemodin shock choque arritm fibril coronar infarto iam aorta vascular presion hipertens ventr perfusion marcapasos ecg'},
 {id:'resp',label:'Respiratorio',icon:'🫁',color:'#22C55E',blocks:[3,16],keys:'respira pulmon ventilacion via aerea bronquio asma epoc sdra pleura torax traqueo oxigen neumonia atelectasia'},
 {id:'neuro',label:'Neurológico',icon:'🧠',color:'#A855F7',blocks:[7],keys:'neuro cerebral ictus tce convulsion epilep conciencia delirium meningi encefal medular pupila'},
 {id:'renal',label:'Renal y metabólico',icon:'🧪',color:'#06B6D4',blocks:[5],keys:'renal rinon diuresis electrolito sodio potasio calcio magnesio fosfato acido base gasometr glucosa endocrin cetoacidosis'},
 {id:'infect',label:'Infeccioso y sepsis',icon:'🦠',color:'#14B8A6',blocks:[6],keys:'infeccion infeccioso sepsis septico antibiot antimicrobiano bacter fung virus aislamiento cultivo'},
 {id:'digest',label:'Digestivo y hepático',icon:'🫃',color:'#F97316',blocks:[],keys:'digest gastro intestinal abdomen abdominal hepatico higado pancrea nutricion sangrado ascitis'},
 {id:'heme',label:'Hematológico',icon:'🩸',color:'#E11D48',blocks:[],keys:'hematolog sangre anemia plaqueta coagul transfusion trombo anticoag hemorrag cid hit hemolisis'},
 {id:'trauma',label:'Trauma y quemaduras',icon:'🚑',color:'#F59E0B',blocks:[8],keys:'trauma tce quemadura lesion medular fractura politrauma hemotorax contusion'},
 {id:'toxic',label:'Toxicología',icon:'☣️',color:'#84CC16',blocks:[12],keys:'toxic intoxic antidoto sobredosis veneno cbrne contaminacion'},
 {id:'maternal',label:'Materno y pediátrico',icon:'👶',color:'#EC4899',blocks:[9],keys:'pediatr neonatal obstetr embarazo gestante eclampsia puerperio nino'},
 {id:'periop',label:'Perioperatorio y cirugía',icon:'🏥',color:'#6366F1',blocks:[10,16],keys:'perioperatorio posoperatorio cirugia quirurgico trasplante anestesia reanimacion drenaje toracico'},
 {id:'nutrition',label:'Nutrición y rehabilitación',icon:'🏃',color:'#10B981',blocks:[14],keys:'nutricion movilidad rehabilitacion debilidad ejercicio dolor sueno familia alta'},
 {id:'pharm',label:'Farmacología',icon:'💊',color:'#D946A0',blocks:[13,19],keys:'farmaco medicamento dosis infusion antidoto vasoactivo sedante antibiotico'},
 {id:'imaging',label:'Imagen y POCUS',icon:'🩻',color:'#8B5CF6',blocks:[11,20],keys:'imagen radiografia rayos ecografia pocus tomografia tac resonancia electro ecg'},
 {id:'safety',label:'Seguridad y enfermería',icon:'🛡️',color:'#0EA5E9',blocks:[15,18,21],keys:'enfermeria seguridad checklist comunicacion transporte calidad etica consentimiento dispositivo prevencion'},
 {id:'multi',label:'Multisistema / UCI',icon:'🏥',color:'#64748B',blocks:[1,2],keys:'uci critico monitorizacion gravedad soporte multiorganico respuesta rapida'}
];
const specialties=[
 {id:'icu',label:'Medicina Intensiva / UCI',icon:'🏥',color:'#0EA5E9',blocks:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]},
 {id:'cardiology',label:'Cardiología',icon:'❤️',color:'#EF476F',blocks:[4],systems:['cardio']},
 {id:'pneumology',label:'Neumología',icon:'🫁',color:'#22C55E',blocks:[3,16],systems:['resp']},
 {id:'neurology',label:'Neurología',icon:'🧠',color:'#A855F7',blocks:[7],systems:['neuro']},
 {id:'emergency',label:'Urgencias y emergencias',icon:'🚨',color:'#F43F5E',blocks:[1],keys:'urgencia emergencia respuesta rapida paro deterioro reanimacion'},
 {id:'anesthesia',label:'Anestesia y Reanimación',icon:'💤',color:'#6366F1',blocks:[3,10,14,16],keys:'anestesia sedacion analgesia intubacion perioperatorio reanimacion'},
 {id:'traumatology',label:'Traumatología',icon:'🚑',color:'#F59E0B',blocks:[8],systems:['trauma']},
 {id:'nephrology',label:'Nefrología',icon:'🧪',color:'#06B6D4',blocks:[5],systems:['renal']},
 {id:'infectious',label:'Infecciosas y sepsis',icon:'🦠',color:'#14B8A6',blocks:[6],systems:['infect']},
 {id:'hematology',label:'Hematología',icon:'🩸',color:'#E11D48',systems:['heme']},
 {id:'pharmacy',label:'Farmacia clínica',icon:'💊',color:'#D946A0',blocks:[13,19],systems:['pharm']},
 {id:'radiology',label:'Radiología y POCUS',icon:'🩻',color:'#8B5CF6',blocks:[11,20],systems:['imaging']},
 {id:'nursing',label:'Enfermería y seguridad',icon:'🛡️',color:'#0EA5E9',blocks:[14,15,18,21],systems:['safety']},
 {id:'pediatrics',label:'Pediatría y Obstetricia',icon:'👶',color:'#EC4899',blocks:[9],systems:['maternal']},
 {id:'toxicology',label:'Toxicología',icon:'☣️',color:'#84CC16',blocks:[12],systems:['toxic']},
 {id:'transplant',label:'Trasplantes',icon:'🫀',color:'#FB7185',blocks:[10],keys:'trasplante inmunosupresion donante receptor'}
];
const collection=b=>b.fichas||b.herramientas||b.elementos||b.cards||[];
const titleOf=x=>x.titulo||x.nombre_generico||x.name||x.id;
const summaryOf=x=>x.definicion_documental||x.definicion_y_finalidad||x.definicion||x.finalidad_documental||x.finalidad||x.resumen||x.summary||x.proposito||x.descripcion||x.estado_editorial||'';
const subcat=x=>x.subcategoria||x.categoria||x.clase_farmacologica||x.tipo_herramienta||'';
const iconOf=x=>x.icono||x.icon||({17:'🚨',18:'🧰',19:'💊',20:'🩻',21:'✅'}[x.__block]||'📘');
const matchKeys=(text,keys='')=>norm(keys).split(/\s+/).some(k=>k&&text.includes(k));
function classifySystems(x){let ids=systems.filter(d=>(d.blocks||[]).includes(x.__block)||matchKeys(x.__search,d.keys)).map(d=>d.id);return [...new Set(ids.length?ids:['multi'])]}
function classifySpecialties(x){let ids=specialties.filter(d=>(d.blocks||[]).includes(x.__block)||(d.systems||[]).some(s=>x.__systems.includes(s))||matchKeys(x.__search,d.keys)).map(d=>d.id);return [...new Set(ids.length?ids:['icu'])]}
function loadData(){
 if(ready)return true;
 const tag=document.querySelector('#inurse-master-21');
 if(!tag){countEl.textContent='No se encontró el catálogo de la Biblioteca';return false}
 try{raw=JSON.parse(tag.textContent)}catch(e){countEl.textContent='No se pudo leer el catálogo';return false}
 raw.forEach(b=>collection(b).forEach(item=>{
   const x=Object.assign({},item,{__block:b._numero_bloque,__module:b.modulo||'',__blockName:b.bloque||b.modulo||('Bloque '+b._numero_bloque)});
   x.__title=titleOf(x);x.__summary=summaryOf(x);
   x.__search=norm([x.__title,x.__summary,subcat(x),JSON.stringify(x.etiquetas||[]),JSON.stringify(x.sinonimos_o_alias||[]),x.__blockName].join(' '));
   x.__systems=classifySystems(x);x.__specialties=classifySpecialties(x);
   x.__search+=' '+norm(x.__systems.map(id=>(systems.find(d=>d.id===id)||{}).label||id).join(' '))+' '+norm(x.__specialties.map(id=>(specialties.find(d=>d.id===id)||{}).label||id).join(' '));
   flat.push(x)
 }));
 byId=new Map(flat.map(x=>[x.id,x]));ready=true;return true
}
function defs(){
 if(state.mode==='block')return raw.map(b=>({id:String(b._numero_bloque),label:blockLabels[b._numero_bloque]||('Bloque '+b._numero_bloque),icon:'📘',color:'#6366F1'}));
 if(state.mode==='pathology')return [...new Set(flat.filter(x=>x.__block===17).map(x=>subcat(x)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es')).map((label,i)=>({id:label,label,icon:['❤️','🫁','🧠','🧪','🦠','🩸','🚑','🏥'][i%8],color:'#14B8A6'}));
 if(state.mode==='system')return systems;
 if(state.mode==='specialty')return specialties;
 return[]
}
function matchesMode(x){
 if(state.mode==='all')return true;
 if(state.mode==='block')return state.group==='all'||String(x.__block)===String(state.group);
 if(state.mode==='pathology')return x.__block===17&&(state.group==='all'||subcat(x)===state.group);
 if(state.mode==='system')return state.group==='all'||x.__systems.includes(state.group);
 if(state.mode==='specialty')return state.group==='all'||x.__specialties.includes(state.group);
 return true
}
function filtered(){
 let arr=flat.filter(matchesMode);
 if(state.q){
   const terms=norm(state.q).split(/\s+/).filter(Boolean);
   arr=arr.map(x=>({x,score:terms.reduce((a,t)=>a+(norm(x.__title).includes(t)?6:0)+(norm(subcat(x)).includes(t)?3:0)+(x.__search.includes(t)?1:0),0)}))
    .filter(z=>z.score>0).sort((a,b)=>b.score-a.score||a.x.__title.localeCompare(b.x.__title,'es')).map(z=>z.x)
 }
 return arr
}
function renderModes(){
 $('#in195Modes').innerHTML=modes.map(m=>`<button class="in195-mode ${state.mode===m[0]?'on':''}" data-mode="${m[0]}"><span>${m[2]}</span>${m[1]}</button>`).join('');
 const d=defs();const universe=flat.filter(x=>state.mode==='pathology'?x.__block===17:true);
 const count=id=>{
  if(id==='all')return universe.length;
  if(state.mode==='block')return universe.filter(x=>String(x.__block)===String(id)).length;
  if(state.mode==='pathology')return universe.filter(x=>subcat(x)===id).length;
  if(state.mode==='system')return universe.filter(x=>x.__systems.includes(id)).length;
  if(state.mode==='specialty')return universe.filter(x=>x.__specialties.includes(id)).length;
  return 0
 };
 const mode=modes.find(m=>m[0]===state.mode);
 const selected=d.find(x=>String(x.id)===String(state.group));
 $('#in195Scope').textContent=state.mode==='all'?'Toda la Biblioteca virtual':(mode?mode[1]:'')+(state.group==='all'?' · todas las categorías':' · '+(selected?selected.label:state.group));
 $('#in195Groups').innerHTML=state.mode==='all'?'':[
  `<button class="in195-group ${state.group==='all'?'on':''}" data-group="all" style="--in195-color:#0A6ED1">Todos <span class="n">${count('all')}</span></button>`,
  ...d.map(g=>`<button class="in195-group ${String(state.group)===String(g.id)?'on':''}" data-group="${esc(g.id)}" style="--in195-color:${g.color||'#0A6ED1'}">${g.icon||'•'} ${esc(g.label)} <span class="n">${count(g.id)}</span></button>`)
 ].join('')
}
function card(x){
 const sys=x.__systems.slice(0,2).map(id=>systems.find(d=>d.id===id)).filter(Boolean);
 const color=(sys[0]||{}).color||'#18C6C8';
 return `<button class="in195-card ${state.selected===x.id?'on':''}" data-id="${esc(x.id)}" style="--in195-color:${color}">
 <span class="in195-cardtop"><span class="in195-cicon">${esc(iconOf(x))}</span><span class="in195-ccopy">
 <span class="in195-ctitle">${esc(x.__title)}</span><span class="in195-cmeta">Bloque ${x.__block} · ${esc(subcat(x)||x.__module)}</span>
 <span class="in195-csummary">${esc(x.__summary)}</span><span class="in195-tax">${sys.map(d=>`<span>${d.icon} ${esc(d.label)}</span>`).join('')}</span>
 </span><span class="in195-star" data-fav="${esc(x.id)}">${favs.includes(x.id)?'★':'☆'}</span></span></button>`
}
function renderList(){
 const arr=filtered(),shown=arr.slice(0,state.limit);
 countEl.textContent=`${arr.length.toLocaleString('es-ES')} resultados · ${flat.length.toLocaleString('es-ES')} recursos`;
 listEl.innerHTML=shown.map(card).join('')+(arr.length>shown.length?`<button class="in195-load" id="in195Load">Cargar más (${arr.length-shown.length})</button>`:'')||'<div class="in195-empty" style="height:auto"><p>Sin resultados.</p></div>';
 $('#in195Load')?.addEventListener('click',()=>{state.limit+=80;renderList()})
}
const skip=new Set(['id','titulo','nombre_generico','categoria','subcategoria','icono','tipo','advertencia','__block','__module','__blockName','__title','__summary','__search','__systems','__specialties','relacionados','comportamiento_en_app']);
const label=k=>String(k).replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
function renderValue(v){
 if(v==null||v==='')return'';
 if(Array.isArray(v)){
   if(!v.length)return'';
   if(v.every(x=>typeof x!=='object'||x===null))return `<ul>${v.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
   return `<ol>${v.map(x=>`<li>${renderValue(x)}</li>`).join('')}</ol>`
 }
 if(typeof v==='object')return Object.entries(v).map(([k,val])=>{const r=renderValue(val);return r?`<div class="in195-kv"><div class="in195-key">${esc(label(k))}</div><div class="in195-value">${r}</div></div>`:''}).join('');
 return esc(v)
}
function plain(x){const parts=[x.__title,x.__summary];Object.entries(x).forEach(([k,v])=>{if(skip.has(k)||k.startsWith('__'))return;parts.push(label(k)+': '+(typeof v==='string'?v:JSON.stringify(v)))});return parts.join('\n').slice(0,16000)}
function show(id){
 const x=byId.get(id);if(!x)return;state.selected=id;
 const sys=x.__systems.map(id=>systems.find(d=>d.id===id)).filter(Boolean);
 const spec=x.__specialties.map(id=>specialties.find(d=>d.id===id)).filter(Boolean);
 const sections=Object.entries(x).filter(([k,v])=>!skip.has(k)&&!k.startsWith('__')&&v!==''&&v!=null).map(([k,v])=>`<section class="in195-section"><h3>${esc(label(k))}</h3>${typeof v==='string'?`<p>${renderValue(v)}</p>`:renderValue(v)}</section>`).join('');
 const warning=x.advertencia||'';
 detailEl.innerHTML=`<button type="button" class="in195-action in195-mobileback" id="in195Back">← Volver</button>
 <div class="in195-detailhead"><div class="in195-detailicon">${esc(iconOf(x))}</div><div class="in195-detailtitle"><h2>${esc(x.__title)}</h2><div class="in195-badges"><span class="in195-badge">Bloque ${x.__block}</span><span class="in195-badge">${esc(subcat(x)||x.__module)}</span></div></div></div>
 <div class="in195-actions"><button class="in195-action primary" id="in195Copy">📋 Copiar</button><button class="in195-action" id="in195Speak">🔊 Leer</button><button class="in195-action" id="in195Fav">${favs.includes(x.id)?'★ Quitar favorito':'☆ Favorito'}</button></div>
 <section class="in195-section"><h3>Sistemas implicados</h3><div class="in195-taxlist">${sys.map(d=>`<span class="in195-taxbadge">${d.icon} ${esc(d.label)}</span>`).join('')}</div></section>
 <section class="in195-section"><h3>Especialidades relacionadas</h3><div class="in195-taxlist">${spec.map(d=>`<span class="in195-taxbadge">${d.icon} ${esc(d.label)}</span>`).join('')}</div></section>
 ${x.__summary?`<section class="in195-section"><h3>Resumen</h3><p>${esc(x.__summary)}</p></section>`:''}${sections}${warning?`<div class="in195-warning">⚠️ ${esc(warning)}</div>`:''}`;
 detailEl.classList.add('mobile-on');$('#in195Back')?.addEventListener('click',()=>detailEl.classList.remove('mobile-on'));
 $('#in195Fav').onclick=()=>toggleFav(x.id);$('#in195Copy').onclick=()=>copyText(plain(x));
 $('#in195Speak').onclick=()=>speak(plain(x));renderList()
}
function toggleFav(id){const i=favs.indexOf(id);if(i>=0)favs.splice(i,1);else favs.unshift(id);safeStore.set('in195_favs',JSON.stringify(favs));renderList();if(state.selected===id)show(id)}
async function copyText(text){try{await navigator.clipboard.writeText(text)}catch(e){const t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}}
function speak(text){if(!('speechSynthesis'in window))return;if(speechSynthesis.speaking){speechSynthesis.cancel();return}const u=new SpeechSynthesisUtterance(text);u.lang='es-ES';u.rate=1.02;speechSynthesis.speak(u)}
function open(mode='all',group='all'){
 if(!loadData())return;
 state.mode=mode||'all';state.group=group||'all';state.limit=40;state.selected=null;state.q='';searchEl.value='';
 overlay.classList.add('on');overlay.setAttribute('aria-hidden','false');document.body.classList.add('in195-open');
 renderModes();renderList();setTimeout(()=>searchEl.focus(),100)
}
function close(){overlay.classList.remove('on');overlay.setAttribute('aria-hidden','true');document.body.classList.remove('in195-open');detailEl.classList.remove('mobile-on')}
function search(q){open('all');searchEl.value=q;state.q=q;renderList()}
function openItem(id){open('all');show(id)}

$('#in195Modes').onclick=e=>{const b=e.target.closest('[data-mode]');if(!b)return;state.mode=b.dataset.mode;state.group='all';state.limit=40;state.selected=null;detailEl.classList.remove('mobile-on');renderModes();renderList()};
$('#in195Groups').onclick=e=>{const b=e.target.closest('[data-group]');if(!b)return;state.group=b.dataset.group;state.limit=40;state.selected=null;detailEl.classList.remove('mobile-on');renderModes();renderList()};
listEl.onclick=e=>{const fav=e.target.closest('[data-fav]');if(fav){e.preventDefault();e.stopPropagation();toggleFav(fav.dataset.fav);return}const c=e.target.closest('[data-id]');if(c)show(c.dataset.id)};
searchEl.oninput=()=>{state.q=searchEl.value;state.limit=40;renderList()};
$('#in195Clear').onclick=()=>{searchEl.value='';state.q='';renderList()};
$('#in195Random').onclick=()=>{const a=filtered();if(a.length)show(a[Math.floor(Math.random()*a.length)].id)};
$('#in195Close').onclick=close;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('on'))close()});

document.addEventListener('click',e=>{
 const el=e.target.closest('[data-in192-view="library"],[data-in192-organize],#library21Btn,#in192OpenFullLibrary,#in192LibrarySearch');
 if(!el)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
 open(el.dataset.in192Organize||'all')
},true);

const old=window.Enferix21||{};
window.Enferix21={...old,open:tab=>['block','pathology','system','specialty','all'].includes(tab)?open(tab):open('all'),organize:open,search,openItem,close};
window.EnferixNativeLibrary={open,close,search,openItem,isOpen:()=>overlay.classList.contains('on')};
})();
