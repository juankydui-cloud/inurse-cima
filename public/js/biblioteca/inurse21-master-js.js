
(function(){
'use strict';
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const norm=s=>String(s??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
/* P3.5 · una sola definición de qué palabra identifica un tema y de cuándo se
   considera que aparece, compartida con la recuperación de guías y con Javny Live. */
const CO=window.EnferixCoincidencia;
const raw=JSON.parse(document.getElementById('inurse-master-21').textContent);
const collection=b=>b.fichas||b.herramientas||b.elementos||b.cards||[];
const titleOf=x=>x.titulo||x.nombre_generico||x.name||x.id;
const iconOf=x=>x.icono||x.icon||({17:'🚨',18:'🧰',19:'💊',20:'🩻',21:'✅'}[x.__block]||'📘');
const summaryOf=x=>x.definicion_documental||x.definicion_y_finalidad||x.definicion||x.finalidad_documental||x.finalidad||x.resumen||x.summary||x.proposito||x.descripcion||x.estado_editorial||'';
const subcatOf=x=>x.subcategoria||x.categoria||x.clase_farmacologica||x.tipo_herramienta||'';
const tabs=[
 ['all','Todo','📚'],['guides','Bloques clínicos 1–16','🏥'],['path','Patologías','🚨'],['tools','Herramientas','🧰'],['vadem','Vademécum','💊'],['electro','Electro','📈'],['rx','Rayos X / POCUS','🩻'],['integration','Integración','✅'],['fav','Favoritos','⭐']
];
const colors={guides:'#6366F1',path:'#14B8A6',tools:'#0891B2',vadem:'#EC4899',electro:'#10B981',rx:'#8B5CF6',integration:'#F59E0B',all:'#22D3EE',fav:'#F59E0B'};
function bucket(x){if(x.__block<=16)return'guides';if(x.__block===17)return'path';if(x.__block===18)return'tools';if(x.__block===19)return'vadem';if(x.__block===20){return x.comportamiento_en_app&&x.comportamiento_en_app.seccion_destino==='Electro'?'electro':'rx'}if(x.__block===21)return'integration';return'all'}

const blockLabels={
  1:'Urgencias críticas',2:'Monitorización y escalas',3:'Vía aérea y ventilación',
  4:'Cardiología crítica',5:'Renal, electrólitos y endocrino',6:'Infecciones y sepsis',
  7:'Neurología y neurocríticos',8:'Trauma, TCE y quemaduras',9:'Poblaciones especiales',
  10:'Perioperatorio y trasplantes',11:'Procedimientos, ecografía e imagen',
  12:'Toxicología y desastres',13:'Farmacología y calculadoras',
  14:'Dolor, delirium, nutrición y movilidad',15:'Hematología, seguridad y enfermería',
  16:'Cirugía torácica y MBE',17:'Patologías críticas',18:'Herramientas clínicas',
  19:'Vademécum crítico',20:'Electro, Rayos X y POCUS',21:'Integración y calidad'
};
const systemDefs=[
  {id:'cardio',label:'Cardiovascular',icon:'❤️',color:'#EF476F',blocks:[4],keys:'cardio hemodin shock choque arritm fibril coronar infarto iam aorta vascular presion hipertens ventr perfusion marcapasos ecg'},
  {id:'resp',label:'Respiratorio',icon:'🫁',color:'#22C55E',blocks:[3,16],keys:'respira pulmon ventilacion via aerea bronquio asma epoc sdra pleura torax traqueo oxigen neumonia atelectasia'},
  {id:'neuro',label:'Neurológico',icon:'🧠',color:'#A855F7',blocks:[7],keys:'neuro cerebral ictus stroke tce convulsion epilep conciencia delirium meningi encefal medular pupila'},
  {id:'renal',label:'Renal y metabólico',icon:'🧪',color:'#06B6D4',blocks:[5],keys:'renal rinon diuresis electrolito sodio potasio calcio magnesio fosfato acido base gasometr glucosa endocrin cetoacidosis'},
  {id:'infect',label:'Infeccioso y sepsis',icon:'🦠',color:'#14B8A6',blocks:[6],keys:'infeccion infeccioso sepsis septico antibiot antimicrobiano bacter fung virus aislamiento cultivo'},
  {id:'digest',label:'Digestivo y hepático',icon:'🫃',color:'#F97316',blocks:[],keys:'digest gastro intestinal abdomen abdominal hepatico higado pancrea nutricion enteral parenteral sangrado digestivo ascitis'},
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
const specialtyDefs=[
  {id:'icu',label:'Medicina Intensiva / UCI',icon:'🏥',color:'#0EA5E9',blocks:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],systems:[]},
  {id:'cardiology',label:'Cardiología',icon:'❤️',color:'#EF476F',blocks:[4],systems:['cardio']},
  {id:'pneumology',label:'Neumología',icon:'🫁',color:'#22C55E',blocks:[3,16],systems:['resp']},
  {id:'neurology',label:'Neurología',icon:'🧠',color:'#A855F7',blocks:[7],systems:['neuro']},
  {id:'emergency',label:'Urgencias y emergencias',icon:'🚨',color:'#F43F5E',blocks:[1],keys:'urgencia emergencia respuesta rapida paro deterioro reanimacion'},
  {id:'anesthesia',label:'Anestesia y Reanimación',icon:'💤',color:'#6366F1',blocks:[3,10,14,16],keys:'anestesia sedacion analgesia intubacion perioperatorio reanimacion'},
  {id:'traumatology',label:'Traumatología',icon:'🚑',color:'#F59E0B',blocks:[8],systems:['trauma']},
  {id:'nephrology',label:'Nefrología',icon:'🧪',color:'#06B6D4',blocks:[5],systems:['renal']},
  {id:'infectious',label:'Infecciosas y sepsis',icon:'🦠',color:'#14B8A6',blocks:[6],systems:['infect']},
  {id:'hematology',label:'Hematología',icon:'🩸',color:'#E11D48',blocks:[],systems:['heme']},
  {id:'pharmacy',label:'Farmacia clínica',icon:'💊',color:'#D946A0',blocks:[13,19],systems:['pharm']},
  {id:'radiology',label:'Radiología y POCUS',icon:'🩻',color:'#8B5CF6',blocks:[11,20],systems:['imaging']},
  {id:'thoracic',label:'Cirugía torácica',icon:'🫁',color:'#0284C7',blocks:[16],keys:'torac cirugia pulmon neumonectomia lobectomia drenaje pleural'},
  {id:'nursing',label:'Enfermería y seguridad',icon:'🛡️',color:'#0EA5E9',blocks:[14,15,18,21],systems:['safety']},
  {id:'pediatrics',label:'Pediatría y Obstetricia',icon:'👶',color:'#EC4899',blocks:[9],systems:['maternal']},
  {id:'toxicology',label:'Toxicología',icon:'☣️',color:'#84CC16',blocks:[12],systems:['toxic']},
  {id:'nutritionrehab',label:'Nutrición y Rehabilitación',icon:'🏃',color:'#10B981',blocks:[14],systems:['nutrition']},
  {id:'transplant',label:'Trasplantes',icon:'🫀',color:'#FB7185',blocks:[10],keys:'trasplante inmunosupresion donante receptor'}
];
function matchesKeywords(text,keys){return norm(keys||'').split(/\s+/).some(k=>k&&text.includes(k))}
function classifySystems(x){
  const text=x.__search||'';
  let ids=systemDefs.filter(d=>d.blocks.includes(x.__block)||matchesKeywords(text,d.keys)).map(d=>d.id);
  if(!ids.length)ids=['multi'];
  return [...new Set(ids)];
}
function classifySpecialties(x){
  const text=x.__search||'';
  const ids=specialtyDefs.filter(d=>d.blocks.includes(x.__block)||(d.systems||[]).some(s=>x.__systems.includes(s))||matchesKeywords(text,d.keys)).map(d=>d.id);
  return [...new Set(ids.length?ids:['icu'])];
}

const flat=[];
raw.forEach(b=>{const n=b._numero_bloque;collection(b).forEach(x=>{const y=Object.assign({},x,{__block:n,__blockName:b.bloque||b.modulo||('Bloque '+n),__module:b.modulo||'',__version:b.version||'',__file:b._archivo_origen||''});y.__bucket=bucket(y);y.__title=titleOf(y);y.__summary=summaryOf(y);y.__search=norm([y.__title,y.__summary,subcatOf(y),JSON.stringify(y.etiquetas||[]),JSON.stringify(y.sinonimos_o_alias||[]),JSON.stringify(y.bloques_origen||[]),y.__blockName].join(' '));y.__systems=classifySystems(y);y.__specialties=classifySpecialties(y);y.__search+=' '+norm(y.__systems.map(id=>(systemDefs.find(d=>d.id===id)||{}).label||id).join(' '))+' '+norm(y.__specialties.map(id=>(specialtyDefs.find(d=>d.id===id)||{}).label||id).join(' '));y.__idx=CO.indice(y.__search);y.__idxTitle=CO.indice(y.__title);y.__idxSub=CO.indice(subcatOf(y));flat.push(y)})});
const byId=new Map(flat.map(x=>[x.id,x]));
let favs=[];try{favs=JSON.parse(localStorage.getItem('inurse21_favs')||'[]')}catch(e){}
let state={tab:'all',q:'',limit:70,selected:null,organize:'all',group:'all'};
const ov=$('#in21Overlay'),listEl=$('#in21List'),detailEl=$('#in21Detail'),countEl=$('#in21Count'),searchEl=$('#in21Search');
function toast21(msg){if(typeof window.toast==='function'){window.toast(msg);return}const t=document.createElement('div');t.className='toast on';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2400)}
function open(tab){state.tab=tab||state.tab||'all';if(tab&&tab!=='all'){state.organize='all';state.group='all'}state.limit=70;ov.classList.add('on');ov.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';renderTabs();renderOrganizer();renderList();setTimeout(()=>searchEl.focus(),80)}
function close(){ov.classList.remove('on');ov.setAttribute('aria-hidden','true');document.body.style.overflow='';detailEl.classList.remove('mobile-on')}

const organizeModes=[
 ['all','Todo','📚'],['block','Por bloques','🔢'],['pathology','Patologías','🚨'],
 ['system','Por sistemas','🫀'],['specialty','Especialidades','🩺']
];
function pathologyGroups(){
  return [...new Set(flat.filter(x=>x.__block===17).map(x=>subcatOf(x)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
}
function groupDefinitions(){
  if(state.organize==='block')return raw.map(b=>({id:String(b._numero_bloque),label:blockLabels[b._numero_bloque]||('Bloque '+b._numero_bloque),icon:'📘',color:'#6366F1'}));
  if(state.organize==='pathology')return pathologyGroups().map((label,i)=>({id:label,label,icon:['❤️','🫁','🧠','🧪','🦠','🩸','🚑','🏥'][i%8],color:'#14B8A6'}));
  if(state.organize==='system')return systemDefs;
  if(state.organize==='specialty')return specialtyDefs;
  return [];
}
function matchesOrganization(x){
  if(state.organize==='all')return true;
  if(state.organize==='block')return state.group==='all'||String(x.__block)===String(state.group);
  if(state.organize==='pathology')return x.__block===17&&(state.group==='all'||subcatOf(x)===state.group);
  if(state.organize==='system')return state.group==='all'||x.__systems.includes(state.group);
  if(state.organize==='specialty')return state.group==='all'||x.__specialties.includes(state.group);
  return true;
}
function organizationLabel(){
  if(state.organize==='all')return'Mostrando toda la Biblioteca virtual';
  const mode=organizeModes.find(m=>m[0]===state.organize);
  if(state.group==='all')return(mode?mode[1]:'Organización')+' · todas las categorías';
  const def=groupDefinitions().find(g=>String(g.id)===String(state.group));
  return(mode?mode[1]:'Organización')+' · '+(def?def.label:state.group);
}
function renderOrganizer(){
  const modeBox=$('#in19OrgModes'),groupBox=$('#in19OrgGroups'),scope=$('#in19OrgScope');
  if(!modeBox||!groupBox||!scope)return;
  modeBox.innerHTML=organizeModes.map(m=>`<button class="in19-org-mode ${state.organize===m[0]?'on':''}" data-in19-mode="${m[0]}"><span>${m[2]}</span>${m[1]}</button>`).join('');
  const defs=groupDefinitions();
  const universe=flat.filter(x=>state.organize==='pathology'?x.__block===17:true);
  const countFor=id=>{
    if(id==='all')return universe.length;
    if(state.organize==='block')return universe.filter(x=>String(x.__block)===String(id)).length;
    if(state.organize==='pathology')return universe.filter(x=>subcatOf(x)===id).length;
    if(state.organize==='system')return universe.filter(x=>x.__systems.includes(id)).length;
    if(state.organize==='specialty')return universe.filter(x=>x.__specialties.includes(id)).length;
    return 0;
  };
  scope.textContent=organizationLabel();
  groupBox.innerHTML=state.organize==='all'?'':[
    `<button class="in19-org-group ${state.group==='all'?'on':''}" data-in19-group="all" style="--in19-group:#0A6ED1">Todos <span class="n">${countFor('all')}</span></button>`,
    ...defs.map(g=>`<button class="in19-org-group ${String(state.group)===String(g.id)?'on':''}" data-in19-group="${esc(g.id)}" style="--in19-group:${g.color||'#0A6ED1'}">${g.icon||'•'} ${esc(g.label)} <span class="n">${countFor(g.id)}</span></button>`)
  ].join('');
}

function filtered(){let arr=flat.filter(matchesOrganization);if(state.tab==='fav')arr=arr.filter(x=>favs.includes(x.id));else if(state.tab!=='all')arr=arr.filter(x=>x.__bucket===state.tab);if(state.q){const terms=norm(state.q).split(/\s+/).filter(Boolean);arr=arr.map(x=>({x,score:terms.reduce((a,t)=>a+(x.__search.includes(t)?1:0)+(norm(x.__title).includes(t)?4:0),0)})).filter(z=>z.score>0).sort((a,b)=>b.score-a.score||a.x.__title.localeCompare(b.x.__title)).map(z=>z.x)}return arr}
function renderTabs(){const c=flat.reduce((a,x)=>(a[x.__bucket]=(a[x.__bucket]||0)+1,a),{});$('#in21Tabs').innerHTML=tabs.map(t=>`<button class="in21-tab ${state.tab===t[0]?'on':''}" data-in21-tab="${t[0]}">${t[2]} ${t[1]} <span style="opacity:.65">${t[0]==='all'?flat.length:t[0]==='fav'?favs.length:(c[t[0]]||0)}</span></button>`).join('')}
function card(x){const on=state.selected===x.id?' on':'';const col=colors[x.__bucket]||'#14B8A6';return `<div class="in21-card${on}" data-in21-id="${esc(x.id)}" style="--in21c:${col}"><div class="in21-card-top"><div class="in21-card-icon">${esc(iconOf(x))}</div><div class="in21-card-copy"><div class="in21-card-title">${esc(x.__title)}</div><div class="in21-card-meta">Bloque ${x.__block} · ${esc(subcatOf(x)||x.__module)}</div><div class="in21-card-summary">${esc(x.__summary)}</div><div class="in19-card-tax">${x.__systems.slice(0,2).map(id=>{const d=systemDefs.find(s=>s.id===id);return d?`<span>${d.icon} ${esc(d.label)}</span>`:''}).join('')}</div></div><button class="in21-star" data-in21-fav="${esc(x.id)}">${favs.includes(x.id)?'★':'☆'}</button></div></div>`}
function renderList(){const arr=filtered();countEl.textContent=`${arr.length.toLocaleString('es-ES')} resultados · ${flat.length.toLocaleString('es-ES')} elementos integrados`;const shown=arr.slice(0,state.limit);listEl.innerHTML=shown.map(card).join('')+(arr.length>shown.length?`<button class="in21-load" id="in21Load">Cargar más (${arr.length-shown.length})</button>`:'')||'<div class="in21-empty" style="height:auto">Sin resultados. Prueba otro término o pestaña.</div>';const load=$('#in21Load');if(load)load.onclick=()=>{state.limit+=100;renderList()}}
function label(k){return String(k).replace(/^__/,'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
const skip=new Set(['id','titulo','nombre_generico','categoria','subcategoria','icono','tipo','advertencia','__block','__blockName','__module','__version','__file','__bucket','__title','__summary','__search','__systems','__specialties','relacionados','comportamiento_en_app']);
function scalar(v){if(v===true)return'Sí';if(v===false)return'No';if(v===null||v===undefined)return'';return String(v)}
function renderValue(v,depth=0){if(v===null||v===undefined||v==='')return'';if(Array.isArray(v)){if(!v.length)return'';if(v.every(x=>typeof x!=='object'||x===null))return `<ul>${v.map(x=>`<li>${esc(scalar(x))}</li>`).join('')}</ul>`;return `<ol>${v.map(x=>`<li>${renderValue(x,depth+1)}</li>`).join('')}</ol>`}if(typeof v==='object'){return Object.entries(v).map(([k,val])=>{const r=renderValue(val,depth+1);return r?`<div class="in21-kv"><div class="in21-k">${esc(label(k))}</div><div class="in21-v">${r}</div></div>`:''}).join('')}return esc(scalar(v))}
function plainItem(x){const parts=[x.__title,x.__summary];Object.entries(x).forEach(([k,v])=>{if(skip.has(k)||k.startsWith('__'))return;try{parts.push(label(k)+': '+(typeof v==='string'?v:JSON.stringify(v)))}catch(e){}});return parts.join('\n').slice(0,12000)}
function sectionOrder(x){const preferred=['definicion_documental','definicion_y_finalidad','definicion','finalidad_documental','finalidad','puntos_clave','presentacion_y_pistas','hallazgos_clave','valoracion_inicial','valoracion_inmediata','entradas_o_elementos','primeras_acciones_no_prescriptivas','algoritmo_documental','lectura_sistematica','intervenciones_o_familias_terapeuticas','monitorizacion','cuidados_de_enfermeria','cuidados_y_verificaciones_de_enfermeria','criterios_de_alarma_o_escalada','criterios_de_alarma_y_escalada','criterios_de_alarma','diagnostico_diferencial_clave','errores_y_trampas','riesgos_clave','situaciones_especiales','preparacion_y_administracion','salida_o_resultado','formula','interpretacion_y_limites','fuente_documental','fuentes_actuales','fuentes_de_actualizacion','bloques_origen','estado_editorial','estado_implementacion'];const keys=[];preferred.forEach(k=>{if(k in x)keys.push(k)});Object.keys(x).forEach(k=>{if(!skip.has(k)&&!k.startsWith('__')&&!keys.includes(k)&&!['etiquetas','sinonimos_o_alias'].includes(k))keys.push(k)});return keys}
function show(id){const x=byId.get(id);if(!x)return;state.selected=id;const col=colors[x.__bucket]||'#14B8A6';const badges=[`Bloque ${x.__block}`,subcatOf(x),x.prioridad_editorial||x.nivel_prioridad_editorial||x.prioridad||'',x.estado_editorial||x.estado_implementacion||''].filter(Boolean);let sections='';sectionOrder(x).forEach(k=>{const r=renderValue(x[k]);if(r)sections+=`<section class="in21-sec"><h4>${esc(label(k))}</h4>${typeof x[k]==='string'?`<p>${r}</p>`:r}</section>`});const warning=x.advertencia||raw.find(b=>b._numero_bloque===x.__block)?.advertencia_general||'';const sysHtml=x.__systems.map(id=>systemDefs.find(d=>d.id===id)).filter(Boolean).map(d=>`<span class="in19-tax-badge" style="--in19-tax:${d.color}">${d.icon} ${esc(d.label)}</span>`).join('');const specHtml=x.__specialties.map(id=>specialtyDefs.find(d=>d.id===id)).filter(Boolean).map(d=>`<span class="in19-tax-badge" style="--in19-tax:${d.color}">${d.icon} ${esc(d.label)}</span>`).join('');detailEl.innerHTML=`<button class="in21-action in21-mobile-back" id="in21Back">← Volver</button><div style="--in21c:${col}"><div class="in21-detail-head"><div class="in21-detail-icon">${esc(iconOf(x))}</div><div class="in21-detail-title"><h3>${esc(x.__title)}</h3><div class="in21-badges">${badges.map(b=>`<span class="in21-badge">${esc(b)}</span>`).join('')}</div></div></div><div class="in21-actions"><button class="in21-action primary" id="in21Ask">💬 Preguntar a Javny</button><button class="in21-action" id="in21Speak">🔊 Leer</button><button class="in21-action" id="in21Share">📤 Compartir</button><button class="in21-action warn" id="in21FavDetail">${favs.includes(x.id)?'★ Quitar favorito':'☆ Favorito'}</button></div><div class="in19-source-note"><b>Fuente:</b> Biblioteca virtual Enferix. Esta ficha permanece separada visualmente de Guías clínicas, aunque Javny puede combinar ambas fuentes cuando analiza un caso.</div><div class="in19-taxonomy"><h4>Sistemas implicados</h4><div class="in19-tax-list">${sysHtml}</div></div><div class="in19-taxonomy"><h4>Especialidades relacionadas</h4><div class="in19-tax-list">${specHtml}</div></div>${x.__summary?`<section class="in21-sec"><h4>Resumen</h4><p>${esc(x.__summary)}</p></section>`:''}${sections}${warning?`<div class="in21-warn">⚠️ ${esc(warning)}</div>`:''}</div>`;detailEl.style.setProperty('--in21c',col);detailEl.classList.add('mobile-on');$('#in21Back').onclick=()=>detailEl.classList.remove('mobile-on');$('#in21Ask').onclick=()=>askJavnyItem(x);$('#in21Speak').onclick=e=>readItem(x,e.currentTarget);$('#in21Share').onclick=()=>shareItem(x);$('#in21FavDetail').onclick=()=>toggleFav(x.id);renderList()}
function toggleFav(id){const i=favs.indexOf(id);if(i>=0)favs.splice(i,1);else favs.unshift(id);localStorage.setItem('inurse21_favs',JSON.stringify(favs));renderTabs();renderList();if(state.selected===id)show(id)}
function readItem(x,btn){const text=plainItem(x);if(typeof window.speak==='function'){btn._reset=()=>btn.textContent='🔊 Leer';btn.textContent='⏹ Parar';window.speak(text,btn);return}if(!('speechSynthesis'in window)){toast21('Este navegador no permite lectura en voz alta');return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='es-ES';speechSynthesis.speak(u)}
async function shareItem(x){const text=`Enferix · Bloque ${x.__block}\n${x.__title}\n\n${x.__summary}\n\nContenido educativo; validar con protocolo vigente.`;try{if(navigator.share){await navigator.share({title:x.__title,text});return}await navigator.clipboard.writeText(text);toast21('Ficha copiada')}catch(e){}}
function askJavnyItem(x){const context=`Consulta esta ficha de la Biblioteca virtual Enferix y responde usando primero su contenido. Cita la ficha y diferencia cualquier complemento externo.\n\nFicha: ${x.__title}\nBloque ${x.__block}: ${x.__blockName}\nContenido: ${plainItem(x).slice(0,6500)}`;close();try{if(typeof window.openJavnyWithContext==='function'){window.openJavnyWithContext(context);return}}catch(e){}const fab=document.querySelector('.fab,#javnyBtn,[data-javny]');if(fab)fab.click();setTimeout(()=>{const q=document.querySelector('#qinput,.qinput,textarea[placeholder*="Javny"],textarea[placeholder*="Pregunta"]');if(q){q.value=context;q.dispatchEvent(new Event('input',{bubbles:true}));q.focus()}},300)}

// Add all master items to Javny's existing local retrieval without showing 1,676 extra cards in the original catalogue.
function catFor(x){const t=norm([x.__title,subcatOf(x),x.__summary].join(' '));if(/respir|ventil|pulmon|torax|asma|epoc/.test(t))return'resp';if(/cardi|shock|hemodin|arrit|ecg|coronar/.test(t))return'cardio';if(/neuro|ictus|cerebr|delir|sedacion/.test(t))return'ictus';if(/trauma|quemadura|toxic|antidoto/.test(t))return'trauma';if(/imagen|rayos|pocus|ecografia|radiografia/.test(t))return'imagen';if(/farmac|medic|antib|anticoag|vasoactiv/.test(t))return'farm';return'uci'}
try{if(false&&typeof DOCS!=='undefined'&&Array.isArray(DOCS)){const existing=new Set(DOCS.map(d=>d.id));flat.filter(x=>x.__block<=20).forEach(x=>{if(existing.has(x.id))return;DOCS.push({id:x.id,cat:catFor(x),title:x.__title,source:`Bloque ${x.__block} · ${x.__module||x.__blockName}`,tags:norm([subcatOf(x),JSON.stringify(x.etiquetas||[]),JSON.stringify(x.sinonimos_o_alias||[])].join(' ')),summary:x.__summary,sec:[{h:'Contenido integrado',b:`<p>${esc(plainItem(x).slice(0,7500)).replace(/\n/g,'<br>')}</p>`}],__masterHidden:true});existing.add(x.id)})}}catch(e){console.warn('Integración DOCS',e)}

// Add the 100 structured medicines to the original vademecum drawer.
function vcat(x){const s=norm(x.subcategoria);if(s.includes('antibacter'))return'atb';if(s.includes('antifung')||s.includes('antiviral'))return s.includes('antifung')?'fung':'viral';if(s.includes('anticoag')||s.includes('hemost'))return'hemat';if(s.includes('respiratorio')||s.includes('alergia'))return'resp';if(s.includes('neurologico'))return'neuro';if(s.includes('renal')||s.includes('gastro'))return'nefro';if(s.includes('antidoto')||s.includes('toxicologia'))return'antidoto';if(s.includes('sedacion'))return'anest';return'cardio'}
try{if(false&&typeof VADEM!=='undefined'&&Array.isArray(VADEM)){const b19=flat.filter(x=>x.__block===19);const names=new Set(VADEM.map(d=>norm(d.n)));b19.forEach(x=>{if(names.has(norm(x.nombre_generico)))return;const d={n:x.nombre_generico,a:[x.clase_farmacologica,x.finalidad_documental].filter(Boolean).join(' · '),i:x.finalidad_documental||'',p:'🔒 Posología, dilución y velocidad bloqueadas. Consultar orden validada, farmacia, protocolo institucional y CIMA/AEMPS.',c:(x.riesgos_clave||[]).join(' · '),r:[...(x.monitorizacion||[]),...(x.cuidados_de_enfermeria||[]),...(x.situaciones_especiales||[])].join(' · '),route:'validar vía',cat:vcat(x),source:'Enferix · Bloque 19 · ficha estructural sin dosis',__masterId:x.id};VADEM.push(d);names.add(norm(d.n));if(typeof vadeCounts!=='undefined')vadeCounts[d.cat]=(vadeCounts[d.cat]||0)+1});if(typeof buildVadeChips==='function')buildVadeChips()}}catch(e){console.warn('Integración VADEM',e)}

// Add the 130 new critical pathologies to the existing pathology chapters.
const pathMap=new Map();
function chapterFor(x){const s=norm(x.subcategoria+' '+x.__title);if(s.includes('respiratorio')||s.includes('via aerea'))return'respiratorio';if(s.includes('cardiovascular')||s.includes('shock'))return'circulatorio';if(s.includes('neurolog'))return'nervioso';if(s.includes('renal')||s.includes('electrolito'))return/genitourin|renal|potas|sodio|calcio|magnes/.test(s)?'genitourinario':'endocrino';if(s.includes('infeccioso')||s.includes('sepsis'))return'infecciosas';if(s.includes('gastro')||s.includes('hepatico')||s.includes('nutricional'))return'digestivo';if(s.includes('hematologico')||s.includes('trombotico')||s.includes('hemorragico'))return'sangre';if(s.includes('trauma')||s.includes('quemadura')||s.includes('toxicologia'))return'traumatismos';if(s.includes('posoperatorio')||s.includes('dispositivo'))return'cirugia';return'sintomas'}
try{if(false&&typeof PATODIS!=='undefined'&&typeof PATODEF!=='undefined'){flat.filter(x=>x.__block===17).forEach(x=>{const ch=chapterFor(x),local='in21-'+x.id;if(!PATODIS[ch])PATODIS[ch]=[];if(!PATODIS[ch].some(a=>a[0]===local))PATODIS[ch].push([local,x.__title]);PATODEF[local]=x.definicion||x.__summary||'';pathMap.set(local,x.id)})}}catch(e){console.warn('Integración patologías',e)}

// Add an unobtrusive tile inside the original tools section.
try{if(false&&typeof renderHerramientas==='function'){const old=renderHerramientas;renderHerramientas=function(){old();setTimeout(()=>{const g=document.querySelector('.tools-grid');if(g&&!g.querySelector('[data-in21-open]')){const b=document.createElement('button');b.className='tool-card';b.dataset.in21Open='tools';b.innerHTML='<div class="tico">🧰</div><div class="tname">Biblioteca avanzada · 96 herramientas</div><div class="tdesc">Escalas, calculadoras, checklists, plantillas y algoritmos del Bloque 18.</div>';b.onclick=()=>open('tools');g.prepend(b)}},0)}}}catch(e){}

// Robust microphone manager with permission request and Gemini audio fallback.
const Voice={active:null,async permission(){if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)return null;const stream=await navigator.mediaDevices.getUserMedia({audio:true});stream.getTracks().forEach(t=>t.stop());return true},key(){try{return localStorage.getItem('guiaHJ23_apikey')||localStorage.getItem('inurse_gemini_api_key_v1')||localStorage.getItem('in51_gemini_key')||localStorage.getItem('inurse52_gemini_api_key')||''}catch(e){return''}},async start(btn,onText,onFinal){if(this.active){this.stop();return}btn.classList.add('listening');try{try{await this.permission()}catch(e){if(e&&(['NotAllowedError','SecurityError','PermissionDeniedError'].includes(e.name))){throw new Error('MIC_PERMISSION')}}const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(SR){const r=new SR();this.active={type:'sr',obj:r,btn};r.lang='es-ES';r.interimResults=true;r.continuous=false;let final='';r.onresult=e=>{let inter='';for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)final+=e.results[i][0].transcript;else inter+=e.results[i][0].transcript}onText((final+inter).trim())};r.onerror=e=>{if(e.error==='not-allowed')toast21('Permite el micrófono en Safari/Ajustes y vuelve a probar');else if(e.error!=='aborted')toast21('No se ha podido reconocer la voz: '+e.error)};r.onend=()=>{btn.classList.remove('listening');this.active=null;if(final.trim())onFinal(final.trim())};r.start();return}if(window.MediaRecorder&&navigator.mediaDevices){await this.recordFallback(btn,onText,onFinal);return}throw new Error('UNSUPPORTED')}catch(e){btn.classList.remove('listening');this.active=null;if(e.message==='MIC_PERMISSION')toast21('Micrófono bloqueado. Autoriza el acceso para este archivo o sitio en Safari/Ajustes.');else toast21('El reconocimiento de voz no está disponible. Usa el dictado del teclado o abre la app desde una web HTTPS.')}},stop(){const a=this.active;if(!a)return;try{a.obj.stop()}catch(e){}try{a.stream&&a.stream.getTracks().forEach(t=>t.stop())}catch(e){}a.btn&&a.btn.classList.remove('listening');this.active=null},async recordFallback(btn,onText,onFinal){const key=this.key();if(!key)throw new Error('UNSUPPORTED');const stream=await navigator.mediaDevices.getUserMedia({audio:true});const chunks=[];const mr=new MediaRecorder(stream);this.active={type:'rec',obj:mr,stream,btn};mr.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};mr.onstop=async()=>{stream.getTracks().forEach(t=>t.stop());btn.classList.remove('listening');this.active=null;try{toast21('Transcribiendo el audio…');const blob=new Blob(chunks,{type:mr.mimeType||'audio/webm'});const b64=await new Promise((ok,no)=>{const fr=new FileReader();fr.onload=()=>ok(String(fr.result).split(',')[1]);fr.onerror=no;fr.readAsDataURL(blob)});let model='gemini-3.5-flash';try{const c=JSON.parse(localStorage.getItem('inurse52_javny_config')||'{}');model=c.model||model}catch(e){}const url=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;const resp=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:'Transcribe literalmente este audio en español. Devuelve solo la transcripción.'},{inline_data:{mime_type:blob.type||'audio/webm',data:b64}}]}]})});const data=await resp.json();if(!resp.ok)throw new Error(data?.error?.message||('HTTP '+resp.status));const text=(data.candidates?.[0]?.content?.parts||[]).map(p=>p.text||'').join(' ').trim();if(text){onText(text);onFinal(text)}else throw new Error('Sin transcripción')}catch(e){toast21('No se pudo transcribir: '+e.message)}};mr.start();toast21('Grabando… pulsa de nuevo para terminar');setTimeout(()=>{if(this.active&&this.active.obj===mr&&mr.state==='recording')mr.stop()},15000)}};
window.EnferixVoiceManager=Voice;
function voiceTarget(btn){const id=btn.id;if(id==='micBtn')return {el:$('#search'),final:t=>{const el=$('#search');el.value=t;el.dispatchEvent(new Event('input',{bubbles:true}))}};if(id==='qmicBtn')return {el:$('#qinput')};if(id==='ecgMic')return {el:$('#ecgGuess')};if(id==='rxMic')return {el:$('#rxGuess')};if(id==='triageVoiceBtn')return {el:$('#triageInput')};if(id==='in21Mic'||id==='in21MicTest')return {el:searchEl,final:t=>{searchEl.value=t;state.q=t;state.limit=70;renderList()}};if(id==='recMic')return {el:$('#transcript'),final:t=>{const tr=$('#transcript');if(tr)tr.textContent=t;try{if(typeof handleVoiceCommand==='function'&&handleVoiceCommand(t))return}catch(e){}const s=$('#search');if(s){s.value=t;s.dispatchEvent(new Event('input',{bubbles:true}))}}};let el=btn.closest('.qwrap,.triage-input-box,.in63-field,.cc-input-wrap')?.querySelector('textarea,input')||btn.parentElement?.querySelector('textarea,input')||document.activeElement;if(!(el instanceof HTMLInputElement||el instanceof HTMLTextAreaElement))el=null;return {el}}
document.addEventListener('click',e=>{const b=e.target.closest('#micBtn,#qmicBtn,#recMic,#ecgMic,#rxMic,#triageVoiceBtn,#in21Mic,#in21MicTest,#ccMic,[id^="in63Dict"],.qmic');if(!b)return;const t=voiceTarget(b);if(!t.el&&b.id!=='in21MicTest')return;e.preventDefault();e.stopImmediatePropagation();let base=t.el&&('value'in t.el)?t.el.value:'';Voice.start(b,text=>{if(!t.el)return;if('value'in t.el){t.el.value=(base?base+' ':'')+text;t.el.dispatchEvent(new Event('input',{bubbles:true}))}else t.el.textContent=text},text=>{if(t.final)t.final(text)})},true);


// Independent organization controls for the Virtual Library.
$('#in19OrgModes').onclick=e=>{
  const b=e.target.closest('[data-in19-mode]');if(!b)return;
  state.organize=b.dataset.in19Mode;state.group='all';state.tab='all';state.limit=70;state.selected=null;
  detailEl.classList.remove('mobile-on');renderTabs();renderOrganizer();renderList();
};
$('#in19OrgGroups').onclick=e=>{
  const b=e.target.closest('[data-in19-group]');if(!b)return;
  state.group=b.dataset.in19Group;state.tab='all';state.limit=70;state.selected=null;
  detailEl.classList.remove('mobile-on');renderTabs();renderOrganizer();renderList();
};

// Library events.
$('#library21Btn').onclick=()=>open('all');$('#in21Close').onclick=close;$('#in21Back').onclick=()=>detailEl.classList.remove('mobile-on');ov.addEventListener('click',e=>{if(e.target===ov)close()});$('#in21Clear').onclick=()=>{searchEl.value='';state.q='';state.limit=70;renderList()};searchEl.addEventListener('input',()=>{state.q=searchEl.value;state.limit=70;renderList()});$('#in21Tabs').onclick=e=>{const b=e.target.closest('[data-in21-tab]');if(!b)return;state.tab=b.dataset.in21Tab;state.organize='all';state.group='all';state.limit=70;state.selected=null;detailEl.classList.remove('mobile-on');renderTabs();renderOrganizer();renderList()};listEl.onclick=e=>{const f=e.target.closest('[data-in21-fav]');if(f){e.stopPropagation();toggleFav(f.dataset.in21Fav);return}const c=e.target.closest('[data-in21-id]');if(c)show(c.dataset.in21Id)};$('#in21Stats').onclick=()=>{state.tab='integration';state.q='';searchEl.value='';renderTabs();renderList();const first=filtered()[0];if(first)show(first.id)};
// Open hidden master references used by Javny and new pathologies.
document.addEventListener('click',e=>{const a=e.target.closest('[data-in52-doc]');if(a){const id=a.getAttribute('data-in52-doc');if(byId.has(id)){e.preventDefault();e.stopImmediatePropagation();open();show(id);return}}const p=e.target.closest('[data-patodis]');if(p){const bits=p.dataset.patodis.split('|'),mid=pathMap.get(bits[1]);if(mid){e.preventDefault();e.stopImmediatePropagation();open('path');show(mid)}}},true);

function retrieveLibraryForJavny(qy,limit=7){
  /* Reparto y coincidencia según P3.5. Antes se puntuaba igual toda palabra y
     se buscaba por subcadena: "cuidados del paciente con traqueostomía"
     devolvía "Cinco elementos del consentimiento informado", porque "con" casa
     dentro de "CONsentimiento", y "cuidados" pesaba tanto como el término que
     identifica el tema. */
  const T=CO.terminos(qy);
  if(!T.todos.length)return'';
  const scored=flat.map(x=>{
    let score=0,cob=0,tit=false;
    T.clinicos.forEach(t=>{
      let dentro=false;
      if(CO.casa(x.__idxTitle,t)){score+=7;tit=true;dentro=true}
      if(CO.casa(x.__idxSub,t)){score+=3;tit=true;dentro=true}
      if(CO.casa(x.__idx,t)){score+=1;dentro=true}
      if(dentro)cob++;
    });
    T.proceso.forEach(t=>{if(CO.casa(x.__idxTitle,t))score+=1});
    if(x.__block===17)score+=T.clinicos.some(t=>CO.casa(x.__idxTitle,t))?2:0;
    /* Es del tema si el término clínico está en el título o la subcategoría, o
       si la ficha menciona TODOS los términos de la pregunta. Una mención de
       paso a una parte de lo preguntado no la hace del tema. */
    const ok=T.hayClinicos?(tit||(cob>0&&cob===T.clinicos.length)):score>0;
    return{x,score,ok};
  }).filter(z=>z.ok).sort((a,b)=>b.score-a.score||a.x.__title.localeCompare(b.x.__title,'es')).slice(0,Math.max(1,limit||7));
  return scored.map(z=>{
    const x=z.x;
    const content=plainItem(x).slice(0,1900);
    return `### [BIBLIOTECA VIRTUAL] ${x.__title}\nID: ${x.id} · Bloque ${x.__block} · ${subcatOf(x)||x.__module}\n${content}`;
  }).join('\n\n');
}
window.EnferixLibraryRetrieve=retrieveLibraryForJavny;

// API for direct access from Javny or future modules.
window.Enferix21={
  open,close,
  openItem:id=>{open();show(id)},
  search:q=>{open();searchEl.value=q;state.q=q;renderList()},
  organize:(mode,group='all')=>{open('all');state.organize=mode;state.group=String(group);state.tab='all';renderTabs();renderOrganizer();renderList()},
  retrieve:retrieveLibraryForJavny,
  stats:()=>({blocks:21,elements:flat.length,ids:byId.size,pathologies:flat.filter(x=>x.__block===17).length,tools:flat.filter(x=>x.__block===18).length,medicines:flat.filter(x=>x.__block===19).length,imaging:flat.filter(x=>x.__block===20).length})
};
renderTabs();renderOrganizer();renderList();
})();
