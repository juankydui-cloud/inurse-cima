
(function(){
'use strict';

const $ = (s, r=document) => r.querySelector(s);
const overlay = $('#v26LiveOverlay');
const mini = $('#v26LiveMini');
const startBtn = $('#v26StartLive');
const micBtn = $('#v26MicToggle');
const audioBtn = $('#v26AudioToggle');
const closeCaseBtn = $('#v26CloseCase');
const endBtn = $('#v26EndSession');
const transcript = $('#v26Transcript');
const sourceBox = $('#v26Sources');
const caseBox = $('#v26CaseSummary');
const caseStateLabel = $('#v26CaseState');
const orb = $('#v26Orb');

const LIVE_MODEL_DEFAULT = 'gemini-3.1-flash-live-preview';
const MAX_SESSION_SECONDS = 14 * 60 + 30;
const OPENED_AS_FILE = location.protocol === 'file:';

let ws = null;
let live = false;
let ready = false;
let micPaused = false;
let audioMuted = false;
let startedAt = 0;
let timerId = null;
let reconnectHandle = '';
let inputContext = null;
let inputStream = null;
let inputSource = null;
let inputProcessor = null;
let inputSilentGain = null;
let outputContext = null;
let outputGain = null;
let nextPlayTime = 0;
let playingSources = new Set();
let currentUserText = '';
let currentModelText = '';
let userCommitTimer = null;
let sourceHistory = [];
let caseData = {
  priority:'',
  patientSummary:'',
  immediateActions:[],
  missingData:[],
  redFlags:[],
  lastUpdate:''
};

function esc(s){
  return String(s ?? '').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[m]);
}
function norm(s){
  return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[^a-z0-9%/.,+\-\s]/g,' ').replace(/\s+/g,' ').trim();
}
/* P3.5 · Criterio de qué palabra identifica un tema clínico y de cuándo se
   considera que aparece. Se aplica AQUÍ y no en las recuperaciones de consulta
   (portada y chat del avatar), que se quedan como estaban por decisión de
   Juanky. Consecuencia asumida: hoy Live y el chat pueden ordenar distinto la
   misma pregunta. Si algún día se unifica, el criterio se toma de p35 y no se
   copia. */
const CO=window.EnferixCoincidencia;
function stripHtml(s){
  const d=document.createElement('div');d.innerHTML=String(s||'');return (d.textContent||'').replace(/\s+/g,' ').trim();
}
function flatten(value){
  if(value==null)return'';
  if(typeof value==='string'||typeof value==='number')return String(value);
  if(Array.isArray(value))return value.map(flatten).join(' ');
  if(typeof value==='object')return Object.values(value).map(flatten).join(' ');
  return'';
}
function backendBase(){
  const saved=(localStorage.getItem('inurse_v20_backend_url')||'').trim().replace(/\/$/,'');
  if(saved)return saved;
  if(location.protocol==='http:'||location.protocol==='https:')return location.origin;
  return 'http://localhost:8787';
}
function updateActivationBox(state,title,text){
  const box=$('#v281Activation');
  if(!box)return;
  box.className='v281-activation '+(state||'');
  $('#v281ActivationTitle').textContent=title;
  $('#v281ActivationText').innerHTML=text;
}
async function activationCheck(){
  const isCorrectOrigin=(location.protocol==='http:'||location.protocol==='https:') &&
    (location.hostname==='localhost'||location.hostname==='127.0.0.1');
  if(location.protocol==='file:'){
    updateActivationBox(
      'error',
      'La aplicación está abierta como archivo',
      'Cierra esta pestaña y ejecuta <code>ABRIR_INURSE_CIMA.command</code>. La dirección correcta es <code>http://localhost:8787</code>.'
    );
    return false;
  }
  if(!isCorrectOrigin){
    updateActivationBox(
      '',
      'Enferix está en una dirección distinta',
      'Para el funcionamiento local recomendado utiliza <code>http://localhost:8787</code>.'
    );
  }
  try{
    const data=await fetchJSON(backendBase()+'/api/health');
    updateActivationBox(
      'ok',
      'Servidor local activado',
      'Enferix está abierta correctamente. Ya puedes consultar medicamentos en CIMA-AEMPS.'
    );
    return Boolean(data.ok);
  }catch(e){
    updateActivationBox(
      'error',
      'El servidor local no responde',
      'Ejecuta <code>ABRIR_INURSE_CIMA.command</code> y vuelve a abrir esta pantalla.'
    );
    return false;
  }
}

async function checkLocalBackend(){
  const url='http://localhost:8787';
  try{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),2500);
    const response=await fetch(url+'/api/health',{signal:controller.signal});
    clearTimeout(timeout);
    const data=await response.json().catch(()=>({}));
    if(!response.ok||!data.ok)throw new Error(data.error||('HTTP '+response.status));
    return {ok:true,data};
  }catch(error){
    return {ok:false,error:error?.message||String(error)};
  }
}
function showFileModeWarning(){
  const box=$('#v261FileWarning');
  if(box)box.classList.add('on');
  setStatus('Abierta como archivo local','warn');
  setStage(
    'error',
    'Falta abrir Javny Live desde el servidor',
    'Inicia el backend y entra en http://localhost:8787. El micrófono no se activará correctamente desde file://.'
  );
  startBtn.textContent='Abrir Javny Live correctamente';
}

function setStatus(text, mode=''){
  $('#v26LiveStatus').textContent=text;
  const dot=$('#v26LiveStatusDot');
  dot.className=mode;
  $('#v26LivePulse').className=mode==='on'?'on':'';
}
function setStage(mode,title,text){
  orb.className='v26-orb '+mode;
  $('#v26StageTitle').textContent=title;
  $('#v26StageText').textContent=text;
}
function enableControls(enabled){
  [micBtn,audioBtn,closeCaseBtn,endBtn].forEach(b=>b.disabled=!enabled);
}
function showLive(){
  overlay.classList.add('on');overlay.setAttribute('aria-hidden','false');mini.classList.remove('on');
}
function minimizeLive(){
  if(!live){overlay.classList.remove('on');return}
  overlay.classList.remove('on');overlay.setAttribute('aria-hidden','true');mini.classList.add('on');
}
function timeText(seconds){
  const m=Math.floor(seconds/60),s=seconds%60;
  return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
}
function startTimer(){
  startedAt=Date.now();clearInterval(timerId);
  timerId=setInterval(()=>{
    const sec=Math.floor((Date.now()-startedAt)/1000);
    $('#v26LiveTimer').textContent=timeText(sec);
    if(sec>=MAX_SESSION_SECONDS){
      addLine('model','La sesión Live ha alcanzado su límite de seguridad. Finalízala y abre una nueva para continuar.');
      stopLive('Límite de sesión alcanzado');
    }
  },1000);
}
function resetTimer(){
  clearInterval(timerId);timerId=null;$('#v26LiveTimer').textContent='00:00';
}
function addLine(role,text,temporary=false){
  const empty=$('.v26-transcript-empty',transcript);if(empty)empty.remove();
  let row;
  if(temporary){
    row=$(`.v26-line.${role}[data-temporary="1"]`,transcript);
  }
  if(!row){
    row=document.createElement('div');
    row.className='v26-line '+role;
    if(temporary)row.dataset.temporary='1';
    row.innerHTML='<div class="v26-line-icon">'+(role==='model'?'✨':'🧑‍⚕️')+'</div><div class="v26-bubble"></div>';
    transcript.appendChild(row);
  }
  $('.v26-bubble',row).innerHTML=esc(text)+(temporary?'<small>transcribiendo…</small>':'');
  transcript.scrollTop=transcript.scrollHeight;
  return row;
}
function finalizeTemporary(role,text){
  const row=$(`.v26-line.${role}[data-temporary="1"]`,transcript);
  if(row){
    delete row.dataset.temporary;
    $('.v26-bubble',row).textContent=text;
  }else if(text)addLine(role,text,false);
  transcript.scrollTop=transcript.scrollHeight;
}
function renderCase(){
  const parts=[];
  if(caseData.priority)parts.push(['Prioridad',caseData.priority,/inmediata|critica|emergencia|alta/i.test(caseData.priority)]);
  if(caseData.patientSummary)parts.push(['Resumen',caseData.patientSummary,false]);
  if(caseData.redFlags?.length)parts.push(['Señales de alarma',caseData.redFlags.join(' · '),true]);
  if(caseData.immediateActions?.length)parts.push(['Ahora',caseData.immediateActions.join(' · '),false]);
  if(caseData.missingData?.length)parts.push(['Datos pendientes',caseData.missingData.join(' · '),false]);
  if(!parts.length){
    caseBox.className='v26-case-empty';
    caseBox.textContent='Javny irá organizando prioridad, datos críticos, actuaciones y datos pendientes.';
    caseStateLabel.textContent='Sin datos todavía';return;
  }
  caseBox.className='v26-case-grid';
  caseBox.innerHTML=parts.map(p=>`<div class="v26-case-item${p[2]?' critical':''}"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('');
  caseStateLabel.textContent='Actualizado durante la conversación';
}
function renderSources(){
  if(!sourceHistory.length){
    sourceBox.className='v26-sources-empty';sourceBox.textContent='Todavía no se ha realizado ninguna búsqueda.';return;
  }
  sourceBox.className='';
  sourceBox.innerHTML=sourceHistory.slice(-8).reverse().map(s=>
    `<div class="v26-source"><b>${esc(s.title)}</b><small>${esc(s.meta||'')}</small><em>${esc(s.type||'Fuente Enferix')}</em></div>`
  ).join('');
}
function resetCase(silent=false){
  caseData={priority:'',patientSummary:'',immediateActions:[],missingData:[],redFlags:[],lastUpdate:''};
  // El cuadro clínico se olvida con el caso: si no, el siguiente arrastraría el
  // anterior y buscaría una parada en una consulta que ya no lo es.
  try{ olvidarCuadro(); }catch(e){}
  turnoArrancado=false;
  sourceHistory=[];renderCase();renderSources();
  if(!silent)addLine('model','Caso cerrado. He borrado el contexto temporal. Puedes iniciar otro diciendo «Oye Javny».');
  if(ws&&ready){
    sendWS({realtimeInput:{text:'El usuario ha cerrado el caso. Borra el contexto clínico temporal del caso anterior y espera un caso nuevo.'}});
  }
}
function sanitizeTranscript(s){
  /* El reconocimiento de voz transcribe "112" como "alumno uno dos". Se
     normaliza aquí, que es por donde pasa TODO lo transcrito antes de llegar al
     modelo, para que la indicación de avisar al 112 no se pierda. */
  try{ if(window.EnferixUrgencias&&window.EnferixUrgencias.normalizarEmergencias) s=window.EnferixUrgencias.normalizarEmergencias(s); }catch(e){}
  return String(s||'')
    .replace(/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/gi,'[correo omitido]')
    .replace(/\b(?:dni|nie|nhc|nuhsa|historia\s*clinica|nombre|apellidos)\s*[:\-]?\s*[^\n,;]{2,50}/gi,'[identificador omitido]')
    .replace(/\b\d{7,12}\b/g,'[identificador omitido]').trim();
}
function handleVoiceCommand(text){
  const n=norm(text);
  if(/(?:abre|busca).*(?:cima|vademecum|medicamento|farmaco)/.test(n)&&window.EnferixCima){
    const cleaned=text.replace(/(?:oye\s+)?javny/ig,'').replace(/abre|busca|en\s+cima|vademecum|medicamento|farmaco/ig,' ').replace(/\s+/g,' ').trim();
    try{minimizeLive()}catch(e){}
    window.EnferixCima.search(cleaned||'',/para|indicado|patologia/.test(n)?'pathology':'name');
    addLine('model','He abierto el Vademécum CIMA. La sesión Live continúa minimizada.');
    return true;
  }
  if(window.EnferixAlgorithms&&window.EnferixAlgorithms.searchAndOpen(text)){
    try{minimizeLive()}catch(e){}
    addLine('model','He abierto el algoritmo solicitado. La sesión Live continúa minimizada.');
    return true;
  }
  if(/(?:javny\s+)?(?:para|detente|finaliza la sesion|termina la sesion)/.test(n)){
    stopLive('Sesión finalizada por voz');return true;
  }
  if(/(?:javny\s+)?(?:cerrar|cierra|borra|borrar).*(?:caso|contexto)/.test(n)){
    resetCase(false);return true;
  }
  return false;
}

/* ---------------- Knowledge retrieval ---------------- */
let knowledgeIndex=null;
/* Documentación del producto, no contenido clínico. Por categoría/subcategoría
   editorial, para que un documento nuevo del mismo tipo quede cubierto sin
   tocar nada. */
var CATEGORIAS_DE_PRODUCTO=/integracion\s+global|calidad\s+y\s+despliegue|gobernanza|catalogo\s+y\s+actualizacion|javny,?\s+gemini|backend,?\s+despliegue|accesibilidad,?\s+movil/i;
function esDocumentacionInterna(f,block){
  try{
    const campos=norm([f&&f.categoria,f&&f.subcategoria,f&&f.tipo_elemento,block&&block.bloque].filter(Boolean).join(' '));
    return CATEGORIAS_DE_PRODUCTO.test(campos);
  }catch(e){ return false; }
}

function prepareKnowledge(){
  if(knowledgeIndex)return knowledgeIndex;
  const out=[];
  try{
    if(typeof DOCS!=='undefined'&&Array.isArray(DOCS)){
      DOCS.forEach(d=>{
        const sections=(d.sec||[]).map(s=>({heading:s.h||'',body:stripHtml(s.b||'')}));
        const text=[d.title,d.source,d.tags,d.summary,sections.map(s=>s.heading+' '+s.body).join(' ')].join(' ');
        out.push({
          type:'Guía clínica',id:d.id,title:d.title||'Sin título',
          meta:(d.source||'Guías clínicas Enferix'),
          searchable:norm(text),
          payload:{
            tipo_fuente:'Guía clínica',
            id:d.id,titulo:d.title,fuente:d.source,resumen:d.summary,
            contenido:sections.slice(0,8),
            advertencia:'Contrastar siempre con el protocolo institucional vigente.'
          }
        });
      });
    }
  }catch(e){console.warn('No se pudo indexar DOCS',e)}
  try{
    const tag=document.getElementById('inurse-master-21');
    const blocks=tag?JSON.parse(tag.textContent):[];
    blocks.forEach(block=>{
      const items=block.fichas||block.herramientas||block.elementos||block.cards||[];
      items.forEach(f=>{
        /* La Biblioteca virtual no es sólo contenido clínico: incluye la
           documentación del propio producto —cómo se citan las fuentes, cómo se
           controla la vigencia, cómo se despliega—. Esos documentos comparten
           vocabulario con lo que un profesional dice cuando habla DE la app
           ("no tienes la fuente") y ganaban la búsqueda por coincidencia
           literal, desplazando al contenido clínico.

           El criterio es la CATEGORÍA editorial que ya llevan, no una lista de
           títulos: "Integración global, calidad y despliegue" agrupa los 96
           documentos de producto (navegación, gobernanza, operación, datos, QA,
           seguridad, accesibilidad, IA/RAG…), y las subcategorías de gobernanza
           del contenido hacen lo propio. No se borran: siguen en la Biblioteca
           y se abren desde ella; simplemente no son candidatas en una búsqueda
           clínica. */
        if(esDocumentacionInterna(f,block)) return;
        const title=f.titulo||f.title||f.nombre||'Sin título';
        const text=[title,block.bloque,f.categoria,f.subcategoria,f.etiquetas,flatten(f)].join(' ');
        out.push({
          type:'Biblioteca virtual',id:f.id||'',title,
          meta:(block.bloque||'Bloque Enferix')+(f.categoria?' · '+f.categoria:''),
          searchable:norm(text),
          payload:{
            tipo_fuente:'Biblioteca virtual',
            bloque:block.bloque,titulo:title,id:f.id||'',
            definicion:f.definicion_documental||f.definicion||f.resumen||'',
            alertas:f.manifestaciones_y_alertas||f.alertas||[],
            valoracion_inicial:f.valoracion_inicial||[],
            algoritmo:f.algoritmo_documental||f.algoritmo_app||[],
            cuidados_enfermeria:f.cuidados_de_enfermeria||[],
            criterios_escalada:f.criterios_de_escalada||[],
            advertencia:f.advertencia||block.advertencia_general||'Contrastar con fuentes vigentes y protocolo local.',
            fuente_documental:f.fuente_documental||''
          }
        });
      });
    });
  }catch(e){console.warn('No se pudo indexar la Biblioteca',e)}
  try{
    (window.V27_ALGORITHM_CATALOG||[]).forEach(a=>{
      const searchable=norm([a.title,a.subtitle,a.category,a.type,a.keywords,a.source,a.warning].join(' '));
      out.push({
        type:'Algoritmo clínico',id:'alg-'+a.id,title:a.title,
        meta:a.category+' · '+a.type+' · '+a.source,
        searchable,
        payload:{
          tipo_fuente:'Algoritmo clínico integrado',
          id:a.id,titulo:a.title,categoria:a.category,tipo:a.type,
          descripcion:a.subtitle,fuente:a.source,
          advertencia:a.warning,
          accion_disponible:'Puede abrirse dentro de Enferix con el módulo Algoritmos clínicos.'
        }
      });
    });
  }catch(e){console.warn('No se pudo indexar el catálogo de algoritmos',e)}
  /* Índices de P3.5. Se calculan aquí, junto con el índice, y no en cada
     búsqueda: son 1.800 fichas. */
  out.forEach(o=>{
    o.idx=CO.indice(o.searchable);
    o.idxTitle=CO.indice(o.title);
    o.idxMeta=CO.indice(o.meta);
  });
  knowledgeIndex=out;
  return out;
}
const STOP=new Set('de la el los las y o en con por para del al un una unos unas que se su sus es son como ante sobre entre desde hasta paciente caso tengo tiene hay me mi lo le'.split(' '));
const SYNONYMS={
  sepsis:['shock septico','infeccion','lactato','hipotension'],
  ictus:['accidente cerebrovascular','codigo ictus','nihss','focalidad'],
  infarto:['iam','sindrome coronario','dolor toracico','st'],
  disnea:['dificultad respiratoria','hipoxemia','saturacion','respiratorio'],
  hiperpotasemia:['potasio alto','hiperkalemia','ondas t'],
  trauma:['politrauma','politraumatizado','abcde'],
  parada:['pcr','reanimacion','rcp','asistolia'],
  anafilaxia:['alergia grave','adrenalina','estridor'],
  hipoglucemia:['glucosa baja','glucemia baja']
};
function queryTokens(query){
  /* Live tokeniza por su cuenta, así que la traducción del coloquial de urgencia
     (P3.4) hay que aplicarla también aquí: sin ella "no responde y no respira"
     devolvía "Mecánica respiratoria" y "está sangrando mucho" devolvía "Dolor
     torácico". Con la recuperación ya inyectándose en cada turno, servir la ficha
     equivocada es peor que no servir ninguna. */
  try{ if(window.EnferixUrgencias&&window.EnferixUrgencias.expandir) query=window.EnferixUrgencias.expandir(query); }catch(e){}
  const T=CO.terminos(query);
  const idxQuery=CO.indice(query);
  /* Los sinónimos se comprueban por principio de palabra, no por subcadena:
     "st" (del síndrome coronario) casaba dentro de "traqueoSTomía" y metía en
     la búsqueda infarto, dolor torácico y coronario en una pregunta sobre
     cuidados de traqueostomía. */
  const extra=[];
  Object.entries(SYNONYMS).forEach(([key,values])=>{
    if(CO.casa(idxQuery,key)||values.some(v=>v.split(' ').every(w=>CO.casa(idxQuery,w))))
      extra.push(key,...values.flatMap(v=>v.split(' ')));
  });
  const clinicos=[...new Set(T.clinicos.concat(extra.filter(w=>w.length>2&&!STOP.has(w)&&!CO.esProceso(w))))];
  return {clinicos,proceso:T.proceso,hayClinicos:T.hayClinicos,todos:T.todos};
}
function searchINurse(query,focus='all',limit=5){
  const tokens=queryTokens(query);const index=prepareKnowledge();
  /* En urgencia, el término clínico manda sobre el resto de la frase. Sin esto,
     "está sangrando mucho por la herida del muslo" devolvía "Dolor torácico":
     una ficha larga acumula +1 por cada palabra suelta del relato que aparezca
     en su cuerpo y acaba superando a la ficha que sí trata la hemorragia. El
     bonus se aplica sólo al TÍTULO y sólo con los términos que P3.4 ha
     traducido, que son los que identifican el cuadro. */
  let terminosUrgencia=[];
  try{
    const U=window.EnferixUrgencias;
    if(U&&U.detectar){
      const d=U.detectar(query);
      if(d.urgencia) terminosUrgencia=CO.normalizar(d.terminos).split(' ').filter(x=>x.length>3);
    }
  }catch(e){}
  const frase=CO.normalizar(query);
  let scored=index.map(item=>{
    let score=0,cob=0,tit=false;
    /* El término clínico decide; la palabra de proceso ("cuidados", "manejo",
       "protocolo") sólo desempata. Con el mismo peso, "qué cuidados lleva una
       sonda vesical" devolvía "Cuidados generales en ictus agudo". */
    tokens.clinicos.forEach(t=>{
      let dentro=false;
      if(CO.casa(item.idxTitle,t)){score+=9;tit=true;dentro=true}
      if(CO.casa(item.idxMeta,t)){score+=4;tit=true;dentro=true}
      if(CO.casa(item.idx,t)){score+=1;dentro=true}
      if(dentro)cob++;
    });
    tokens.proceso.forEach(t=>{ if(CO.casa(item.idxTitle,t))score+=1; });
    if(frase&&item.idx.indexOf(frase)>=0)score+=12;
    /* Coherencia con el CUADRO, no con un término suelto. El bonus era +25 por
       una sola coincidencia, y "obstrucción" es polisémica en medicina: con
       "atragantamiento" premiaba igual a "Obstrucción aguda de la vía aérea"
       que a "síndrome de obstrucción sinusoidal" (hepática). Ahora cuenta
       CUÁNTOS términos del cuadro casan: la de vía aérea casa tres
       (obstrucción, vía, aérea) y la hepática sólo uno. */
    if(terminosUrgencia.length){
      let casan=0;
      terminosUrgencia.forEach(t=>{ if(CO.casa(item.idxTitle,t)) casan++; });
      if(casan>=2) score+=12*casan;
    }
    if(focus==='guides'&&item.type==='Guía clínica')score+=3;
    if(focus==='library'&&item.type==='Biblioteca virtual')score+=3;
    /* Es del tema si el término clínico está en el título o la fuente, o si la
       ficha menciona TODOS los términos de la pregunta. Con la recuperación
       inyectándose en cada turno, servir una ficha que sólo nombra de pasada
       una parte de lo preguntado es peor que no servir ninguna. */
    const ok=tokens.hayClinicos?(tit||(cob>0&&cob===tokens.clinicos.length)):score>0;
    return {item,score,ok};
  }).filter(x=>x.ok);
  /* Live tiene su propia recuperación, así que el filtro de ámbito hay que
     aplicarlo también aquí — con la MISMA definición de p34, no con una copia:
     con dos criterios acabarían discrepando y Live serviría en una parada la
     ficha que la portada ya descarta. Sólo actúa en urgencia en curso. */
  try{
    const U=window.EnferixUrgencias;
    if(U&&U.enCurso&&U.esGestion&&U.enCurso(query)){
      scored=scored.filter(x=>!U.esGestion([x.item.title,x.item.meta].join(' ')));
    }
  }catch(e){}
  /* Con un cuadro reconocido, una ficha que sólo comparte UN término suelto no
     es del cuadro: es un homónimo. Se descartan, salvo que el filtro se quede
     sin nada, en cuyo caso se conserva el conjunto original —quedarse sin
     fichas es peor, y para el caso de "ninguna aplicable" ya está la regla de
     seguridad que impide dar indicación. */
  if(terminosUrgencia.length){
    const coherentes=scored.filter(x=>{
      let casan=0;
      terminosUrgencia.forEach(k=>{ if(CO.casa(x.item.idxTitle,k)||CO.casa(x.item.idxMeta,k)) casan++; });
      return casan>=2;
    });
    if(coherentes.length) scored=coherentes;
  }
  scored=scored.sort((a,b)=>b.score-a.score).slice(0,Math.max(1,Math.min(8,Number(limit)||5)));
  const sources=scored.map(x=>({title:x.item.title,meta:x.item.meta,type:x.item.type,id:x.item.id}));
  sources.forEach(s=>{
    if(!sourceHistory.some(old=>old.id===s.id&&old.type===s.type))sourceHistory.push(s);
  });
  sourceHistory=sourceHistory.slice(-16);renderSources();
  return {
    query,
    notice:'Contenido interno documental. Las dosis, algoritmos y recomendaciones deben contrastarse con guías vigentes y protocolo institucional.',
    resultados:scored.map(x=>x.item.payload)
  };
}
function updateCaseFromTool(args){
  if(args.priority)caseData.priority=String(args.priority).slice(0,300);
  if(args.patient_summary)caseData.patientSummary=String(args.patient_summary).slice(0,900);
  if(Array.isArray(args.immediate_actions))caseData.immediateActions=args.immediate_actions.slice(0,6).map(String);
  if(Array.isArray(args.missing_data))caseData.missingData=args.missing_data.slice(0,8).map(String);
  if(Array.isArray(args.red_flags))caseData.redFlags=args.red_flags.slice(0,8).map(String);
  caseData.lastUpdate=new Date().toISOString();renderCase();
  return {ok:true,case:caseData};
}

/* ---------------- Audio capture ---------------- */
function floatTo16kPCM(input,sourceRate){
  if(!input||!input.length)return new Int16Array();
  const ratio=sourceRate/16000;
  const length=Math.max(1,Math.round(input.length/ratio));
  const out=new Int16Array(length);
  for(let i=0;i<length;i++){
    const start=Math.floor(i*ratio),end=Math.min(input.length,Math.floor((i+1)*ratio));
    let sum=0,count=0;
    for(let j=start;j<end;j++){sum+=input[j];count++}
    const sample=Math.max(-1,Math.min(1,count?sum/count:input[start]||0));
    out[i]=sample<0?sample*0x8000:sample*0x7fff;
  }
  return out;
}
function bytesToBase64(view){
  const bytes=new Uint8Array(view.buffer,view.byteOffset,view.byteLength);
  let binary='';const step=0x8000;
  for(let i=0;i<bytes.length;i+=step)binary+=String.fromCharCode(...bytes.subarray(i,i+step));
  return btoa(binary);
}
async function initOutput(){
  if(outputContext)return;
  outputContext=new (window.AudioContext||window.webkitAudioContext)();
  outputGain=outputContext.createGain();outputGain.gain.value=audioMuted?0:1;outputGain.connect(outputContext.destination);
  await outputContext.resume();
  nextPlayTime=outputContext.currentTime;
}
async function startMicrophone(){
  if(inputStream)return;
  inputStream=await navigator.mediaDevices.getUserMedia({
    audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1}
  });
  inputContext=new (window.AudioContext||window.webkitAudioContext)();
  await inputContext.resume();
  inputSource=inputContext.createMediaStreamSource(inputStream);
  inputProcessor=inputContext.createScriptProcessor(4096,1,1);
  inputSilentGain=inputContext.createGain();inputSilentGain.gain.value=0;
  inputProcessor.onaudioprocess=e=>{
    if(!live||!ready||micPaused||!ws||ws.readyState!==WebSocket.OPEN)return;
    const pcm=floatTo16kPCM(e.inputBuffer.getChannelData(0),inputContext.sampleRate);
    if(!pcm.length)return;
    sendWS({realtimeInput:{audio:{data:bytesToBase64(pcm),mimeType:'audio/pcm;rate=16000'}}});
  };
  inputSource.connect(inputProcessor);inputProcessor.connect(inputSilentGain);inputSilentGain.connect(inputContext.destination);
  micBtn.classList.add('active');$('small',micBtn).textContent='Escuchando';
}
async function stopMicrophone(permanent=false){
  if(ws&&ready&&!permanent)sendWS({realtimeInput:{audioStreamEnd:true}});
  try{if(inputProcessor)inputProcessor.disconnect()}catch(e){}
  try{if(inputSource)inputSource.disconnect()}catch(e){}
  try{if(inputSilentGain)inputSilentGain.disconnect()}catch(e){}
  if(inputStream){inputStream.getTracks().forEach(t=>t.stop())}
  if(inputContext){try{await inputContext.close()}catch(e){}}
  inputContext=inputStream=inputSource=inputProcessor=inputSilentGain=null;
  micBtn.classList.remove('active');$('small',micBtn).textContent=permanent?'Finalizado':'Pausado';
}
function stopPlayback(){
  playingSources.forEach(s=>{try{s.stop()}catch(e){}});
  playingSources.clear();
  if(outputContext)nextPlayTime=outputContext.currentTime;
}
async function playPCM(base64){
  if(audioMuted)return;
  await initOutput();
  const bin=atob(base64),bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  const aligned=bytes.byteLength-(bytes.byteLength%2);
  const ints=new Int16Array(bytes.buffer,bytes.byteOffset,aligned/2);
  const float=new Float32Array(ints.length);
  for(let i=0;i<ints.length;i++)float[i]=ints[i]/32768;
  const buffer=outputContext.createBuffer(1,float.length,24000);
  buffer.copyToChannel(float,0);
  const source=outputContext.createBufferSource();source.buffer=buffer;source.connect(outputGain);
  const start=Math.max(outputContext.currentTime+.015,nextPlayTime);
  source.start(start);nextPlayTime=start+buffer.duration;playingSources.add(source);
  source.onended=()=>playingSources.delete(source);
}

/* ---------------- WebSocket and tools ---------------- */
function sendWS(message){
  if(ws&&ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(message));
}
const SYSTEM_INSTRUCTION=`Eres Javny Live, asistente de apoyo protocolizado en tiempo real para profesionales sanitarios.
Habla siempre en español de España, con tono calmado, claro y muy breve.
El usuario puede estar atendiendo una emergencia. No eres la responsable clínica, no sustituyes el juicio profesional, el equipo de emergencias ni los protocolos vigentes.
Al principio espera a que el usuario diga “Oye Javny”, “Javny” o formule una pregunta directa.
Durante un caso:
1. Confirma en una frase los datos críticos entendidos, especialmente cifras.
2. Da solo una a tres prioridades inmediatas por turno.
3. Pregunta por el siguiente dato crítico que falta.
4. Ante peligro vital, indica activar inmediatamente el circuito/equipo de emergencia local y seguir ABCDE y el protocolo institucional.
5. En cada turno recibirás un mensaje que empieza por "CONTEXTO DE ENFERIX PARA ESTE TURNO" con las fichas que la aplicación ha recuperado. Es tu fuente: apóyate en ella y nombra la ficha que uses. Conserva la procedencia entre Guías clínicas y Biblioteca virtual. Puedes llamar además a search_inurse si necesitas buscar otra cosa distinta.
5b. Si ese mensaje dice que NO hay ficha aplicable, NO te calles. Responde con el criterio general de enfermería para primeros auxilios y urgencias: avisar al 112 o al equipo de parada, posición de seguridad, RCP básica, desobstrucción de la vía aérea, control de una hemorragia, no mover a quien puede tener una lesión de columna, y en general qué hacer y qué no hacer ahora. Eso no necesita ficha: quien llama desde la calle necesita saber qué hacer, no que le digas que no tienes la fuente.
5c. Lo que SÍ necesita ficha, y sin ella no se dice: dosis concretas, medicación, pasos de un protocolo específico del centro y actuaciones invasivas o de alto riesgo. Sólo si te preguntan por eso, di que no tienes el protocolo específico en la aplicación y remite al protocolo del centro o al 112. Fuera de eso, habla.
6. El contenido interno puede proceder de documentación antigua. No lo presentes como guía actual y señala que debe contrastarse.
7. No inventes dosis de fármacos, concentraciones, energías de desfibrilación ni contraindicaciones de un tratamiento. Solo menciona una dosis si aparece expresamente en la fuente devuelta, leyéndola despacio y diciendo que debe verificarse con la ficha técnica/protocolo vigente. Las cifras propias del soporte vital básico —ritmo y profundidad de las compresiones, relación compresión-ventilación— forman parte del criterio básico de primeros auxilios y sí puedes darlas aunque no haya ficha: una RCP sin su ritmo no es una indicación, es un silencio.
8. Llama a update_case cuando cambie la prioridad, aparezca una señal de alarma, haya nuevas actuaciones o falten datos.
9. No repitas nombres, DNI, números de historia, teléfonos ni otros identificadores.
9b. En el panel del caso (update_case) recoge SÓLO lo que el usuario ha dicho, nunca lo inferido. Si dice "mi padre", el resumen es "padre del usuario", no "varón" ni una edad: el sexo y la edad no se han dicho. No completes sexo, edad, antecedentes ni diagnóstico a partir de suposiciones; deja el hueco o ponlo en datos pendientes. Lo que se muestra en pantalla se lee como dato del caso, y un dato inventado es peor que un hueco.
10. Permite interrupciones. Si te interrumpen, detén la explicación y atiende al nuevo dato.
Cuando el usuario diga “más breve”, responde en formato: AHORA / DESPUÉS / DIME.
Cuando diga “repite”, repite únicamente la última instrucción.
Cuando diga “cerrar caso”, confirma que el contexto temporal queda borrado.
No des diagnósticos definitivos; expresa hipótesis y nivel de incertidumbre.`;

const tools=[{
  functionDeclarations:[
    {
      name:'search_inurse',
      description:'Busca contenido clínico interno relevante en las Guías clínicas y en la Biblioteca virtual de Enferix. Debe usarse antes de dar orientación protocolizada.',
      parameters:{
        type:'OBJECT',
        properties:{
          query:{type:'STRING',description:'Consulta clínica concreta: síndrome, signo, algoritmo, fármaco o cuidados.'},
          focus:{type:'STRING',enum:['all','guides','library'],description:'Repositorio preferente.'},
          limit:{type:'INTEGER',description:'Número de resultados, entre 1 y 8.'}
        },
        required:['query']
      }
    },
    {
      name:'update_case',
      description:'Actualiza el panel temporal del caso para mostrar prioridad, resumen, actuaciones inmediatas, datos pendientes y señales de alarma.',
      parameters:{
        type:'OBJECT',
        properties:{
          priority:{type:'STRING'},
          patient_summary:{type:'STRING'},
          immediate_actions:{type:'ARRAY',items:{type:'STRING'}},
          missing_data:{type:'ARRAY',items:{type:'STRING'}},
          red_flags:{type:'ARRAY',items:{type:'STRING'}}
        }
      }
    }
  ]
}];

async function executeToolCall(toolCall){
  const responses=[];
  for(const fc of (toolCall.functionCalls||[])){
    const args=fc.args||fc.arguments||{};
    let result;
    try{
      if(fc.name==='search_inurse'){
        result=searchINurse(args.query||'',args.focus||'all',args.limit||5);
      }else if(fc.name==='update_case'){
        result=updateCaseFromTool(args);
      }else{
        result={error:'Herramienta no disponible'};
      }
    }catch(e){
      result={error:e.message||String(e)};
    }
    responses.push({id:fc.id,name:fc.name,response:{result}});
  }
  if(responses.length)sendWS({toolResponse:{functionResponses:responses}});
}
/* ═══════════ Recuperación determinista por turno ═══════════════════════════
   La búsqueda en Live era una function call: la lanzaba el modelo si le parecía.
   La instrucción 5 del guion se lo pide, pero es una petición, no una garantía,
   y en una parada la brevedad que también le pedimos gana. Resultado: turnos con
   indicaciones de RCP y el panel de fuentes vacío, de forma intermitente.

   Ahora la recuperación la hace el CÓDIGO en cada turno, y el resultado se
   inyecta como contexto. La transcripción de entrada llega mientras el usuario
   habla, así que la búsqueda va POR DELANTE de la respuesta, no detrás: cuando
   el modelo empieza a generar ya tiene las fichas —o el aviso de que no las hay—.

   Y ese aviso es la otra mitad, pero acotado: si no hay ficha aplicable, lo que
   se le prohíbe son las dosis, la medicación, el protocolo específico y las
   actuaciones invasivas o de alto riesgo — no el criterio básico de primeros
   auxilios, que sí da. La comprobación tiene que ir por delante igual, porque
   en voz una dosis ya dicha no se puede retirar.

   searchINurse es local (índice en memoria, sin red), de ahí que el coste por
   turno se mida en milisegundos. */
var turnoRecuperado='', turnoTimer=null, turnoFichas=0, turnoMsTotal=0;
var turnoInyectado=false, turnoCuadroInyectado='', turnoBytes=0;

/* ── El cuadro clínico del caso, no las palabras del turno ────────────────────
   Una sesión de Live es UN caso. Quien la usa dice al principio lo que ve
   ("una persona que no se mueve y parece que no respira") y luego habla de
   otras cosas: pide repetir, pregunta, o le reprocha a Javny que no tenga la
   fuente. Recalcular el cuadro en cada turno hacía que la búsqueda se fuera
   detrás de las palabras del último turno: con "no tienes la fuente" ganaban
   los documentos que llevan "fuente" en el título.

   El cuadro se fija cuando se reconoce por primera vez y PERSISTE hasta que se
   cierra el caso. A partir de ahí, en cada turno se busca por el cuadro
   reconocido —los términos con los que están escritas las fichas— y no por la
   coincidencia literal de lo que se acaba de decir. Si aparece un cuadro nuevo
   (empieza a sangrar durante la reanimación), se añade. */
var cuadroActivo={claves:[],terminos:''};

function actualizarCuadro(texto){
  try{
    const U=window.EnferixUrgencias;
    if(!U||!U.detectar) return;
    const d=U.detectar(texto);
    if(!d.urgencia) return;
    let cambio=false;
    d.claves.forEach(k=>{ if(cuadroActivo.claves.indexOf(k)<0){cuadroActivo.claves.push(k);cambio=true;} });
    if(cambio){
      cuadroActivo.terminos=(cuadroActivo.terminos+' '+d.terminos).replace(/\s+/g,' ').trim();
      console.log(`[Javny Live] cuadro clínico del caso: ${cuadroActivo.claves.join(', ')}`);
    }
  }catch(e){}
}
function olvidarCuadro(){ cuadroActivo={claves:[],terminos:''}; }

/* searchINurse devuelve {query, notice, resultados}, donde `resultados` son los
   payload de cada ficha ({titulo, fuente, resumen, contenido…}). NO devuelve
   `sources` ni `context`: leerlos daba siempre vacío y habría inyectado
   "no hay fichas" en todos los turnos, dejando a Javny sin poder indicar nada. */
function contextoDeFichas(res){
  const fuentes=(res&&res.resultados)||[];
  if(!fuentes.length){
    /* Sin ficha, Javny NO se calla. Decisión clínica del usuario (Juanky), y
       vuelta atrás deliberada sobre la regla estricta: Live es para la calle, y
       en la calle nadie necesita saber si es sepsis o shock, sino qué hacer
       ahora —posición, compresiones, avisar, no mover—. Ese criterio básico de
       enfermería no sale de una ficha y callarlo no es seguridad, es
       inutilidad.

       La regla de "sin fuente no se habla" sigue viva donde de verdad protege:
       dosis, medicación, protocolo específico y actuaciones invasivas o de alto
       riesgo. Ahí, y sólo ahí, la respuesta es decir que no está en la
       aplicación. */
    return 'CONTEXTO DE ENFERIX PARA ESTE TURNO: la búsqueda en las fuentes de la '
      +'aplicación NO ha devuelto ninguna ficha aplicable a lo que acaba de decir '
      +'el usuario.\nResponde igualmente, con el criterio general de enfermería para '
      +'primeros auxilios y urgencias: avisar al 112 o al equipo de parada, posición, '
      +'RCP básica, maniobras de desobstrucción, control de hemorragia, no mover ante '
      +'sospecha de lesión de columna, y qué hacer y qué no hacer ahora. Eso no '
      +'necesita ficha y es lo que hace falta.\nSin ficha NO des: dosis, medicación, '
      +'pasos de un protocolo específico del centro, ni actuaciones invasivas o de alto '
      +'riesgo. Si preguntan por eso, di que no tienes el protocolo específico en la '
      +'aplicación y remite al protocolo del centro o al 112.\nNo digas que no tienes '
      +'la fuente para lo que sí es criterio básico.';
  }
  /* Sólo DOS fichas y sólo los fragmentos que vienen a cuento. Antes iban cinco
     fichas con cuatro secciones completas cada una: ~5 KB por inyección, que en
     voz se paga en silencio antes de la primera palabra. El modelo no necesita
     la biblioteca entera para decir la siguiente maniobra; necesita el trozo que
     la contiene. */
  const claves=norm((cuadroActivo.terminos||'')+' '+(turnoRecuperado||'')).split(/\s+/).filter(x=>x.length>3);
  /* Los dos orígenes traen el payload con campos distintos: las Guías clínicas
     dan `contenido` (secciones con heading/body) y la Biblioteca virtual da
     `definicion`, `alertas`, `valoracion_inicial`, `algoritmo`,
     `cuidados_enfermeria` y `criterios_escalada`. Leer sólo los de guías dejaba
     las fichas de biblioteca sin cuerpo —194 bytes de contexto—, y con eso el
     modelo habría dicho que no tiene la fuente teniéndola. */
  function seccionesDe(f){
    if(Array.isArray(f.contenido)&&f.contenido.length) return f.contenido;
    const bloques=[
      ['Definición',f.definicion],
      ['Alertas',f.alertas],
      ['Valoración inicial',f.valoracion_inicial],
      ['Algoritmo',f.algoritmo],
      ['Cuidados de enfermería',f.cuidados_enfermeria],
      ['Criterios de escalada',f.criterios_escalada]
    ];
    return bloques
      .filter(([,v])=>v&&(Array.isArray(v)?v.length:String(v).trim()))
      .map(([h,v])=>({heading:h,body:Array.isArray(v)?v.join('. '):String(v)}));
  }
  function trozosRelevantes(f){
    const secs=seccionesDe(f);
    if(!secs.length) return '';
    // Cada sección puntúa por cuántas palabras del cuadro contiene.
    const puntuadas=secs.map(sec=>{
      const t=norm((sec.heading||'')+' '+(sec.body||''));
      let n=0; claves.forEach(k=>{ if(t.includes(k)) n++; });
      return {sec,n};
    }).sort((a,b)=>b.n-a.n).slice(0,2);
    return puntuadas.map(x=>`   · ${x.sec.heading||''}: ${String(x.sec.body||'').slice(0,260)}`).join('\n');
  }
  /* En urgencia basta LA ficha del cuadro: Live es para actuar y el ritmo manda.
     En consulta tranquila se dejan dos, que puede permitírselo. La respuesta
     exhaustiva con toda la bibliografía es del recuadro de la portada, que no se
     toca y sigue recibiendo el contexto completo. */
  const cuantas=cuadroActivo.claves.length?1:2;
  const lista=fuentes.slice(0,cuantas).map((f,i)=>{
    const cuerpo=trozosRelevantes(f);
    return `${i+1}. ${f.titulo||''}`+((f.fuente||f.bloque)?` · ${f.fuente||f.bloque}`:'')
      +((f.resumen||f.definicion)?`\n   ${String(f.resumen||f.definicion).slice(0,200)}`:'')
      +(cuerpo?`\n${cuerpo}`:'');
  }).join('\n');
  return 'CONTEXTO DE ENFERIX PARA ESTE TURNO:\n'+lista
    +'\nApóyate en esto y nombra la ficha que uses. Si lo que necesitas no está aquí, dilo.';
}

/* Expuestas únicamente para poder medir la recuperación desde fuera (pruebas).
   No las usa la sesión. */
try{
  window.__liveSearchParaMedir=function(q){ return searchINurse(q,'all',5); };
  window.__liveIndiceParaMedir=function(){ return prepareKnowledge(); };
  window.__liveTurnoParaMedir=function(q){
    actualizarCuadro(q);
    const consulta=cuadroActivo.terminos?(cuadroActivo.terminos+' '+q):q;
    turnoRecuperado=q;
    return searchINurse(consulta,'all',5);
  };
  window.__liveResetCuadro=function(){ olvidarCuadro(); };
  window.__liveContextoParaMedir=function(res){ return contextoDeFichas(res); };
  window.__liveArranqueParaMedir=function(res){ return arranqueUrgente(res); };
  // Replica exacta de las guardas reales de recuperarParaTurno, para medir el
  // comportamiento del código y no una versión aproximada escrita en la prueba.
  window.__liveDecidirInyeccion=function(texto,forzar){
    actualizarCuadro(texto);
    const hayCuadro=cuadroActivo.claves.length>0;
    if(!forzar&&!hayCuadro) return {inyecta:false,motivo:'sin cuadro todavía'};
    const cuadroAhora=cuadroActivo.claves.join(',');
    if(turnoInyectado&&cuadroAhora===turnoCuadroInyectado) return {inyecta:false,motivo:'ya inyectado, mismo cuadro'};
    const t0=performance.now();
    const consulta=cuadroActivo.terminos?(cuadroActivo.terminos+' '+texto):texto;
    turnoRecuperado=texto;
    const res=searchINurse(consulta,'all',5);
    const ms=+(performance.now()-t0).toFixed(1);
    const carga=contextoDeFichas(res);
    turnoInyectado=true; turnoCuadroInyectado=cuadroAhora;
    return {inyecta:true,ms,bytes:carga.length,fichas:(res.resultados||[]).length,
            top:(res.resultados||[])[0]?.titulo||'—',cuadro:cuadroAhora};
  };
  window.__liveResetTurno=function(){ turnoInyectado=false; turnoCuadroInyectado=''; turnoRecuperado=''; };
}catch(e){}

/* ── Arranque inmediato en urgencia ──────────────────────────────────────────
   En una parada las primeras frases son siempre las mismas: activar el sistema
   de emergencia y empezar a comprimir. No dependen de qué diga el resto del
   relato, así que no tienen por qué esperar a nada. Live es para actuar; la
   respuesta larga y con bibliografía es del recuadro de la portada.

   El arranque sale en cuanto se reconoce el cuadro, con turnComplete para que
   el modelo hable YA sin esperar a que el usuario termine la frase. El contexto
   completo llega detrás, mientras sigue hablando.

   Con ficha recuperada, la primera acción se toma de ella. Sin ficha, el
   arranque ya no se limita a activar el 112: da también la primera maniobra de
   primeros auxilios que corresponda, con el criterio general de enfermería. Lo
   que no se recorta es la parte de la regla que protege de verdad — ni dosis ni
   medicación sin fuente —, dicha antes en vez de después. */
var turnoArrancado=false;

function primeraAccionDe(res){
  const f=((res&&res.resultados)||[])[0];
  if(!f) return '';
  /* Se busca el primer paso accionable de la ficha, no un párrafo de contexto:
     los encabezados de actuación inmediata son los que sirven aquí. */
  const secs=(Array.isArray(f.contenido)&&f.contenido.length)?f.contenido:[];
  const prioritaria=/actuaci|inmediat|inicial|algoritmo|secuencia|maniobra|primeros|abordaje|manejo/i;
  const elegida=secs.find(x=>prioritaria.test(x.heading||''))||secs[0];
  if(!elegida) return String(f.definicion||f.resumen||'').slice(0,220);
  return String(elegida.body||'').slice(0,220);
}

function arranqueUrgente(res){
  const ficha=((res&&res.resultados)||[])[0];
  if(!ficha){
    /* Antes el arranque sin ficha se limitaba a activar el 112 y decir que no
       había fuente. Ahora arranca igual con la maniobra básica que corresponda
       al cuadro: es el momento en el que más falta hace y el criterio de
       primeros auxilios no depende de una ficha. Lo que sigue prohibido aquí
       es la dosis y la medicación. */
    return 'URGENCIA EN CURSO y la búsqueda NO ha devuelto ficha aplicable. Habla AHORA '
      +'igualmente, en dos frases muy cortas e imperativas: primero, que active el 112 o '
      +'el equipo de parada del centro; segundo, la primera maniobra de primeros auxilios '
      +'que corresponda a lo que ha descrito, con el criterio general de enfermería. Sin '
      +'dosis y sin medicación. Nada de contexto ni de explicaciones.';
  }
  return 'URGENCIA EN CURSO. Habla AHORA, sin esperar a nada más. Di sólo dos cosas, en '
    +'frases muy cortas e imperativas: primero, que active el 112 o el equipo de parada '
    +'del centro; segundo, la primera maniobra según la ficha "'+(ficha.titulo||'')+'":\n'
    +primeraAccionDe(res)
    +'\nNada más: ni contexto, ni bibliografía, ni explicaciones. El resto del contenido '
    +'te llega enseguida.';
}

function recuperarParaTurno(forzar){
  const texto=sanitizeTranscript(currentUserText);
  if(!texto) return;
  /* UNA sola inyección por turno. La transcripción llega en fragmentos y el
     texto crece con cada uno; recuperar en todos suponía cuatro búsquedas y
     ~17 KB de contexto por turno, con la última llegando justo al dejar de
     hablar: ahí estaba el silencio. Ahora se espera a que la frase tenga
     sustancia, se inyecta una vez, y sólo se repite si aparece un cuadro
     clínico nuevo (empieza a sangrar durante la reanimación) o al cerrar el
     turno si aún no se había inyectado nada.

     Lo que decide CUÁNDO inyectar es el cuadro clínico, no una longitud: un
     umbral por caracteres disparaba con la frase a medias —"una persona que no
     se mueve" recuperaba "Seguridad y personalización de alarmas"— y esa ficha
     se quedaba en el contexto el resto del turno.

       · En cuanto se reconoce el cuadro (al oír "no respira"), se inyecta ya,
         mientras el usuario sigue hablando: es el caso urgente y el que no
         puede esperar.
       · Sin cuadro reconocido, se espera al cierre del turno, que es cuando se
         sabe qué se ha preguntado. Una consulta tranquila puede permitírselo.
       · Si aparece un cuadro nuevo a mitad de turno, se vuelve a inyectar. */
  actualizarCuadro(texto);
  const hayCuadro=cuadroActivo.claves.length>0;
  if(!forzar&&!hayCuadro) return;
  const cuadroAhora=cuadroActivo.claves.join(',');
  if(turnoInyectado&&cuadroAhora===turnoCuadroInyectado) return;
  const t0=(performance&&performance.now)?performance.now():Date.now();
  let res=null;
  /* Con un cuadro reconocido, se busca por él: el relato del turno se conserva
     detrás (puede traer el fármaco, la dosis o el ritmo), pero quien manda es
     el cuadro. Sin cuadro, se busca como siempre. */
  const consulta=cuadroActivo.terminos ? (cuadroActivo.terminos+' '+texto) : texto;
  try{ res=searchINurse(consulta,'all',5); }catch(e){ res=null; }
  const ms=Math.round(((performance&&performance.now)?performance.now():Date.now())-t0);
  turnoRecuperado=texto;
  turnoFichas=(res&&res.resultados&&res.resultados.length)||0;
  turnoMsTotal+=ms;
  turnoInyectado=true;
  turnoCuadroInyectado=cuadroAhora;

  /* Primero el arranque, que desbloquea el habla; el contexto va detrás. Sólo
     en urgencia en curso y sólo una vez por caso: en una consulta tranquila no
     hay nada que adelantar. */
  if(hayCuadro&&!turnoArrancado){
    turnoArrancado=true;
    sendWS({clientContent:{turns:[{role:'user',parts:[{text:arranqueUrgente(res)}]}],turnComplete:true}});
    marcarBuscando(false);
    console.log('[Javny Live] arranque urgente enviado · '+((res&&res.resultados||[])[0]?.titulo||'sin ficha'));
  }

  const carga=contextoDeFichas(res);
  turnoBytes+=carga.length;
  sendWS({clientContent:{turns:[{role:'user',parts:[{text:carga}]}],turnComplete:false}});
  marcarBuscando(false);
  /* Se registran los TÍTULOS, no sólo el número: la única forma de auditar esto
     es la consola del navegador (Live no pasa por el servidor), y saber que hubo
     5 fichas no dice si eran las correctas. */
  const titulos=((res&&res.resultados)||[]).slice(0,3).map(f=>f.titulo||'?').join(' | ');
  console.log(`[Javny Live] recuperación · ${turnoFichas} fichas · ${ms} ms`
    +(cuadroActivo.claves.length?` · cuadro: ${cuadroActivo.claves.join(',')}`:' · sin cuadro')
    +`\n   dijo: "${texto.slice(0,70)}"\n   fichas: ${titulos}`);
}

/* ── Señal de que está trabajando ────────────────────────────────────────────
   Entre que dejas de hablar y que Javny suelta la primera palabra hay un hueco.
   En voz, un silencio sin señal no se distingue de un cuelgue, y quien está
   reanimando no puede quedarse dudando si el sistema sigue vivo.

   Señal visual siempre; el aviso sonoro sólo si el hueco se alarga, para no
   meter un pitido en cada turno de una conversación. */
var buscandoDesde=0, avisoSonoroTimer=null;

function marcarBuscando(activo){
  try{
    const panel=document.getElementById('v26StageTitle');
    const sub=document.getElementById('v26StageText');
    const overlay=document.getElementById('v26LiveOverlay');
    if(overlay) overlay.classList.toggle('v26-buscando',!!activo);
    if(activo){
      buscandoDesde=Date.now();
      if(panel) panel.textContent='Consultando las fichas…';
      if(sub) sub.textContent='Javny está buscando en las guías de la aplicación antes de responder.';
      clearTimeout(avisoSonoroTimer);
      // Sólo si se alarga: por debajo de esto, la señal visual basta.
      avisoSonoroTimer=setTimeout(pitidoDeEspera,1200);
    }else{
      clearTimeout(avisoSonoroTimer);
    }
  }catch(e){}
}

/* Tono corto y suave, sintetizado: no depende de ningún archivo y no compite
   con la voz de Javny. */
function pitidoDeEspera(){
  try{
    const Ctx=window.AudioContext||window.webkitAudioContext;
    if(!Ctx) return;
    const ctx=new Ctx();
    const osc=ctx.createOscillator(), gain=ctx.createGain();
    osc.frequency.value=660; osc.type='sine';
    gain.gain.setValueAtTime(0.0001,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.06,ctx.currentTime+0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+0.22);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime+0.24);
    setTimeout(()=>{ try{ctx.close()}catch(e){} },400);
  }catch(e){}
}

function recuperarPronto(){
  if(!turnoInyectado) marcarBuscando(true);
  clearTimeout(turnoTimer);
  // Corto a propósito: tiene que llegar antes de que el usuario deje de hablar.
  turnoTimer=setTimeout(recuperarParaTurno,250);
}

function commitUserSoon(){
  clearTimeout(userCommitTimer);
  userCommitTimer=setTimeout(()=>{
    const clean=sanitizeTranscript(currentUserText);
    if(clean){
      // Última pasada por si la frase terminó con datos que no estaban en el
      // parcial con el que se buscó ("...y no respira").
      clearTimeout(turnoTimer);
      recuperarParaTurno(!turnoInyectado);   // fuerza sólo si el turno iba sin contexto
      finalizeTemporary('user',clean);
      handleVoiceCommand(clean);
    }
    currentUserText='';
  },550);
}
function handleServerContent(sc){
  if(sc.interrupted){
    stopPlayback();currentModelText='';setStage('listening','Te escucho','Has interrumpido a Javny. Continúa con el nuevo dato.');
  }
  if(sc.inputTranscription?.text){
    const part=sc.inputTranscription.text;
    currentUserText=(currentUserText+' '+part).replace(/\s+/g,' ').trim();
    addLine('user',sanitizeTranscript(currentUserText),true);
    setStage('listening','Te escucho','Sigue hablando; Javny detectará automáticamente cuándo terminas.');
    recuperarPronto();   // la búsqueda sale ya, mientras sigue hablando
    commitUserSoon();
  }
  if(sc.modelTurn?.parts||sc.outputTranscription?.text){
    // Ya está hablando: se retira la señal de espera.
    marcarBuscando(false);
  }
  if(sc.outputTranscription?.text){
    currentModelText=(currentModelText+' '+sc.outputTranscription.text).replace(/\s+/g,' ').trim();
    addLine('model',currentModelText,true);
    setStage('speaking','Javny está respondiendo','Puedes interrumpirla hablando en cualquier momento.');
  }
  if(sc.modelTurn?.parts){
    sc.modelTurn.parts.forEach(part=>{
      const inline=part.inlineData;
      if(inline?.data&&(inline.mimeType||'').startsWith('audio/'))playPCM(inline.data).catch(console.error);
    });
  }
  if(sc.generationComplete)setStage('speaking','Javny está terminando','Escucha la indicación y aporta el siguiente dato.');
  if(sc.turnComplete){
    // Queda registrado turno a turno para poder auditarlo después.
    console.log(`[Javny Live] turno completado · recuperación: ${turnoRecuperado?'sí':'NO'}`
      +` · ${turnoFichas} fichas · ${turnoMsTotal} ms · ${turnoBytes} B inyectados`);
    turnoRecuperado='';turnoFichas=0;turnoMsTotal=0;turnoInyectado=false;turnoCuadroInyectado='';turnoBytes=0;
    if(currentModelText)finalizeTemporary('model',currentModelText);
    currentModelText='';
    setStage('listening','Te escucho','Continúa con la evolución del mismo caso.');
  }
}
async function handleMessage(event){
  let text=event.data;
  if(text instanceof Blob)text=await text.text();
  let msg;try{msg=JSON.parse(text)}catch(e){return}
  if(msg.setupComplete){
    ready=true;setStatus('Conectada','on');setStage('listening','Te escucho','Empieza diciendo «Oye Javny» y describe la situación.');
    await startMicrophone();startTimer();return;
  }
  if(msg.serverContent)handleServerContent(msg.serverContent);
  if(msg.toolCall)await executeToolCall(msg.toolCall);
  if(msg.toolCallCancellation){}
  if(msg.goAway){
    addLine('model','El servidor va a cerrar la conexión. Finaliza la sesión y abre una nueva.');
    setStatus('Conexión próxima a finalizar','warn');
  }
  if(msg.sessionResumptionUpdate?.newHandle)reconnectHandle=msg.sessionResumptionUpdate.newHandle;
}
async function requestToken(){
  const base=backendBase();
  const res=await fetch(base+'/api/live/token',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(data.error||('No se pudo crear el token ('+res.status+')'));
  if(!data.token)throw new Error('El backend no devolvió un token Live.');
  return data;
}
async function startLive(){
  if(OPENED_AS_FILE){
    showFileModeWarning();
    const result=await checkLocalBackend();
    if(result.ok){
      location.href='http://localhost:8787';
    }else{
      addLine('model','El backend todavía no está iniciado. Descomprime el paquete del backend y ejecuta 2_INICIAR_JAVNY_LIVE.command.');
    }
    return;
  }
  if(live)return;
  if(!navigator.mediaDevices?.getUserMedia)throw new Error('Este navegador no permite acceder al micrófono.');
  live=true;showLive();startBtn.classList.add('connecting');startBtn.textContent='Conectando…';
  setStatus('Solicitando permiso','warn');setStage('thinking','Preparando Javny Live','Autoriza el micrófono cuando Safari lo solicite.');
  try{
    await initOutput();
    // Request microphone during the original user action before opening the WebSocket.
    inputStream=await navigator.mediaDevices.getUserMedia({
      audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1}
    });
    const tokenData=await requestToken();
    const model=tokenData.model||LIVE_MODEL_DEFAULT;
    const url='wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained?access_token='+encodeURIComponent(tokenData.token);
    ws=new WebSocket(url);
    ws.onopen=()=>{
      setStatus('Configurando sesión','warn');
      const setup={
        model:'models/'+model,
        generationConfig:{
          responseModalities:['AUDIO'],
          temperature:0.12,
          maxOutputTokens:1400,
          speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:'Kore'}}}
        },
        systemInstruction:{parts:[{text:SYSTEM_INSTRUCTION}]},
        tools,
        realtimeInputConfig:{
          automaticActivityDetection:{
            disabled:false,
            startOfSpeechSensitivity:'START_SENSITIVITY_LOW',
            endOfSpeechSensitivity:'END_SENSITIVITY_LOW',
            prefixPaddingMs:80,
            silenceDurationMs:700
          },
          activityHandling:'START_OF_ACTIVITY_INTERRUPTS',
          turnCoverage:'TURN_INCLUDES_ONLY_ACTIVITY'
        },
        inputAudioTranscription:{},
        outputAudioTranscription:{},
        sessionResumption:reconnectHandle?{handle:reconnectHandle}:{}
      };
      sendWS({setup});
    };
    ws.onmessage=handleMessage;
    ws.onerror=()=>{setStatus('Error de conexión','error');setStage('error','No se ha podido conectar','Comprueba el backend, la clave y la conexión a internet.')};
    ws.onclose=event=>{
      const wasLive=live;ready=false;ws=null;
      if(wasLive){
        setStatus('Desconectada','error');setStage('error','La sesión se ha desconectado',event.reason||'Finaliza y vuelve a iniciar una sesión.');
        stopMicrophone(true);enableControls(false);
      }
    };
    // Reuse the already granted stream in startMicrophone.
    const granted=inputStream;inputStream=null;
    inputStream=granted;
    // Build processing graph here because startMicrophone exits if a stream already exists.
    inputContext=new (window.AudioContext||window.webkitAudioContext)();
    await inputContext.resume();
    inputSource=inputContext.createMediaStreamSource(inputStream);
    inputProcessor=inputContext.createScriptProcessor(4096,1,1);
    inputSilentGain=inputContext.createGain();inputSilentGain.gain.value=0;
    inputProcessor.onaudioprocess=e=>{
      if(!live||!ready||micPaused||!ws||ws.readyState!==WebSocket.OPEN)return;
      const pcm=floatTo16kPCM(e.inputBuffer.getChannelData(0),inputContext.sampleRate);
      if(pcm.length)sendWS({realtimeInput:{audio:{data:bytesToBase64(pcm),mimeType:'audio/pcm;rate=16000'}}});
    };
    inputSource.connect(inputProcessor);inputProcessor.connect(inputSilentGain);inputSilentGain.connect(inputContext.destination);
    startBtn.style.display='none';enableControls(true);
    micBtn.classList.add('active');$('small',micBtn).textContent='Escuchando';
  }catch(e){
    console.error(e);live=false;ready=false;startBtn.classList.remove('connecting');startBtn.textContent='Volver a intentar';
    setStatus('No conectada','error');setStage('error','No he podido iniciar Javny Live',e.message||String(e));
    await stopMicrophone(true);stopPlayback();
  }
}
async function stopLive(reason='Sesión finalizada'){
  if(!live&& !ws)return;
  live=false;ready=false;clearTimeout(userCommitTimer);
  try{if(ws&&ws.readyState===WebSocket.OPEN)sendWS({realtimeInput:{audioStreamEnd:true}})}catch(e){}
  try{if(ws)ws.close(1000,'Sesión finalizada por el usuario')}catch(e){}
  ws=null;await stopMicrophone(true);stopPlayback();resetTimer();enableControls(false);
  setStatus('Desconectada','');setStage('idle',reason,'Pulsa “Iniciar sesión clínica” para comenzar una nueva conversación.');
  startBtn.style.display='inline-block';startBtn.classList.remove('connecting');startBtn.textContent='Iniciar nueva sesión';
  audioMuted=false;micPaused=false;audioBtn.classList.remove('active');$('span',audioBtn).textContent='🔊';$('small',audioBtn).textContent='Activado';
}
async function toggleMic(){
  if(!live)return;
  micPaused=!micPaused;
  if(micPaused){
    sendWS({realtimeInput:{audioStreamEnd:true}});
    micBtn.classList.remove('active');$('span',micBtn).textContent='🔇';$('small',micBtn).textContent='Pausado';
  }else{
    $('span',micBtn).textContent='🎙️';micBtn.classList.add('active');$('small',micBtn).textContent='Escuchando';
  }
}
function toggleAudio(){
  audioMuted=!audioMuted;
  if(outputGain)outputGain.gain.value=audioMuted?0:1;
  audioBtn.classList.toggle('active',audioMuted);
  $('span',audioBtn).textContent=audioMuted?'🔇':'🔊';
  $('small',audioBtn).textContent=audioMuted?'Silenciado':'Activado';
  if(audioMuted)stopPlayback();
}

/* ---------------- Events ---------------- */
['#v26LiveHeaderBtn','#v26LiveChatBtn'].forEach(sel=>{
  const b=$(sel);if(b)b.addEventListener('click',()=>{showLive();if(!live)startBtn.focus()});
});
mini.addEventListener('click',showLive);
$('#v26LiveMinimize').addEventListener('click',minimizeLive);
$('#v26LiveClose').addEventListener('click',()=>live?minimizeLive():overlay.classList.remove('on'));
startBtn.addEventListener('click',startLive);
const openLocalhostBtn=$('#v261OpenLocalhost');
const checkBackendBtn=$('#v261CheckBackend');
if(openLocalhostBtn)openLocalhostBtn.addEventListener('click',async()=>{
  const result=await checkLocalBackend();
  if(result.ok)location.href='http://localhost:8787';
  else addLine('model','No encuentro el backend en localhost:8787. Ejecuta 2_INICIAR_JAVNY_LIVE.command y vuelve a pulsar.');
});
if(checkBackendBtn)checkBackendBtn.addEventListener('click',async()=>{
  checkBackendBtn.disabled=true;checkBackendBtn.textContent='Comprobando…';
  const result=await checkLocalBackend();
  if(result.ok){
    checkBackendBtn.textContent='✅ Backend disponible';
    setTimeout(()=>{location.href='http://localhost:8787'},500);
  }else{
    checkBackendBtn.textContent='❌ Backend no iniciado';
    setTimeout(()=>{checkBackendBtn.disabled=false;checkBackendBtn.textContent='Comprobar backend'},2200);
  }
});
micBtn.addEventListener('click',toggleMic);
audioBtn.addEventListener('click',toggleAudio);
closeCaseBtn.addEventListener('click',()=>resetCase(false));
endBtn.addEventListener('click',()=>stopLive('Sesión finalizada'));
window.addEventListener('beforeunload',()=>{try{if(ws)ws.close()}catch(e){}});

prepareKnowledge();
renderCase();renderSources();
if(OPENED_AS_FILE)showFileModeWarning();
})();
