
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const overlay=$('#v28CimaOverlay');
const searchView=$('#v28CimaSearchView');
const detailView=$('#v28CimaDetailView');
const resultsBox=$('#v28CimaResults');
const queryInput=$('#v28CimaQuery');
const favoritesKey='inurse_v28_cima_favorites';
const recentKey='inurse_v28_cima_recent';
let mode='name';
let lastResults=[];
let current=null;
let activeTab='summary';
let pathologyIndex=null;
let recognition=null;

const TAB_MAP={
  dose:{label:'Posología y forma de administración',prefixes:['4.2']},
  contra:{label:'Contraindicaciones',prefixes:['4.3']},
  warnings:{label:'Advertencias y precauciones especiales de empleo',prefixes:['4.4']},
  interactions:{label:'Interacción con otros medicamentos y otras formas de interacción',prefixes:['4.5']},
  pregnancy:{label:'Fertilidad, embarazo y lactancia',prefixes:['4.6']},
  adverse:{label:'Reacciones adversas',prefixes:['4.8']},
  overdose:{label:'Sobredosis',prefixes:['4.9']},
  storage:{label:'Precauciones especiales de conservación',prefixes:['6.4']},
};

function esc(s){
  return String(s??'').replace(/[&<>"']/g,m=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[m]);
}
function norm(s){
  return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
}
function flatten(v){
  if(v==null)return'';
  if(typeof v==='string'||typeof v==='number')return String(v);
  if(Array.isArray(v))return v.map(flatten).join(' ');
  if(typeof v==='object')return Object.values(v).map(flatten).join(' ');
  return'';
}
function backendBase(){
  const saved=(localStorage.getItem('inurse_v20_backend_url')||'').trim().replace(/\/$/,'');
  if(saved)return saved;
  if(location.protocol==='http:'||location.protocol==='https:')return location.origin;
  return 'http://localhost:8787';
}
function setState(state,title,text){
  const dot=$('#v28CimaStateDot');
  dot.className=state;
  $('#v28CimaState').textContent=title;
  $('#v28CimaStateText').textContent=text;
}
async function fetchJSON(url,options={}){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),18000);
  try{
    const response=await fetch(url,{...options,signal:controller.signal});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data.error||data.message||('HTTP '+response.status));
    return data;
  }finally{clearTimeout(timer)}
}
async function checkBackend(){
  try{
    const data=await fetchJSON(backendBase()+'/api/cima/health');
    setState('ok','CIMA conectada','Servicio CIMA-AEMPS disponible.');
    return data;
  }catch(e){
    setState('error','Backend no iniciado','Abre Enferix desde http://localhost:8787.');
    return null;
  }
}
function openCima(){
  overlay.classList.add('on');overlay.setAttribute('aria-hidden','false');
  showSearch();
  checkBackend();
  setTimeout(()=>queryInput.focus(),80);
}
function closeCima(){
  overlay.classList.remove('on');overlay.setAttribute('aria-hidden','true');
}
function showSearch(){
  searchView.style.display='block';detailView.classList.remove('on');
}
function showDetail(){
  searchView.style.display='none';detailView.classList.add('on');
}
function getFavorites(){
  try{return JSON.parse(localStorage.getItem(favoritesKey)||'[]')}catch(e){return[]}
}
function saveFavorites(list){
  localStorage.setItem(favoritesKey,JSON.stringify(list.slice(0,100)));
}
function isFavorite(nregistro){
  return getFavorites().some(x=>x.nregistro===nregistro);
}
function toggleFavorite(){
  if(!current?.medicine)return;
  const med=current.medicine,all=getFavorites();
  const index=all.findIndex(x=>x.nregistro===med.nregistro);
  if(index>=0)all.splice(index,1);
  else all.unshift({nregistro:med.nregistro,nombre:med.nombre,pactivos:med.pactivos});
  saveFavorites(all);
  $('#v28DrugFavorite').textContent=isFavorite(med.nregistro)?'★':'☆';
}
function addRecent(med){
  try{
    let all=JSON.parse(localStorage.getItem(recentKey)||'[]');
    all=all.filter(x=>x.nregistro!==med.nregistro);
    all.unshift({nregistro:med.nregistro,nombre:med.nombre,pactivos:med.pactivos});
    localStorage.setItem(recentKey,JSON.stringify(all.slice(0,20)));
  }catch(e){}
}
function sanitizeHTML(raw){
  const parser=new DOMParser();
  const doc=parser.parseFromString('<div id="safe">'+String(raw||'')+'</div>','text/html');
  const root=doc.querySelector('#safe');
  root.querySelectorAll('script,style,iframe,object,embed,form,input,button,textarea,select,link,meta,svg').forEach(x=>x.remove());
  root.querySelectorAll('*').forEach(el=>{
    [...el.attributes].forEach(attr=>{
      const name=attr.name.toLowerCase();
      if(name.startsWith('on')||['style','class','id','srcdoc'].includes(name))el.removeAttribute(attr.name);
    });
    if(el.tagName==='A'){
      const href=el.getAttribute('href')||'';
      if(!/^https:\/\/(cima|www\.aemps|sede\.aemps)\./i.test(href))el.removeAttribute('href');
      else{el.target='_blank';el.rel='noopener noreferrer'}
    }
    if(el.tagName==='IMG')el.remove();
  });
  return root.innerHTML;
}
function sectionList(){
  const raw=current?.sections;
  if(Array.isArray(raw))return raw;
  if(Array.isArray(raw?.resultados))return raw.resultados;
  if(Array.isArray(raw?.secciones))return raw.secciones;
  return[];
}
function sectionHTML(prefixes){
  const matches=sectionList().filter(s=>
    prefixes.some(prefix=>String(s.seccion||'')===prefix||String(s.seccion||'').startsWith(prefix+'.'))
  ).sort((a,b)=>(Number(a.orden)||0)-(Number(b.orden)||0));
  if(!matches.length)return'';
  return matches.map(s=>`<section><h3>${esc(s.seccion||'')} · ${esc(s.titulo||'')}</h3>${sanitizeHTML(s.contenido||'')}</section>`).join('');
}
function sectionText(prefixes){
  const box=document.createElement('div');box.innerHTML=sectionHTML(prefixes);return box.textContent||'';
}
function docUrl(type){
  const docs=current?.medicine?.docs||[];
  return docs.find(d=>Number(d.tipo)===type)?.url||docs.find(d=>Number(d.tipo)===type)?.urlHtml||'';
}
function formatDate(epoch){
  if(!epoch)return'No consta';
  try{return new Intl.DateTimeFormat('es-ES',{dateStyle:'medium'}).format(new Date(epoch))}catch(e){return'No consta'}
}
function buildPathologyIndex(){
  if(pathologyIndex)return pathologyIndex;
  const out=[];
  try{
    const tag=$('#inurse-master-21');
    const blocks=tag?JSON.parse(tag.textContent):[];
    blocks.forEach(block=>{
      const items=block.fichas||block.herramientas||block.elementos||block.cards||[];
      items.forEach(item=>{
        const types=Array.isArray(item.tipo)?item.tipo:[item.tipo];
        if(!types.filter(Boolean).some(t=>norm(t).includes('patologia')))return;
        const title=item.titulo||item.title||item.nombre||'Patología';
        const text=[
          title,item.categoria,item.subcategoria,item.etiquetas,
          item.definicion_documental,item.focos_frecuentes,item.causas_o_diagnostico_diferencial,
          item.manifestaciones_y_alertas,item.signos_de_sospecha
        ].map(flatten).join(' ');
        out.push({
          id:item.id,title,
          meta:[item.categoria,item.subcategoria].filter(Boolean).join(' · '),
          text:norm(text),
          tags:Array.isArray(item.etiquetas)?item.etiquetas:[]
        });
      });
    });
  }catch(e){console.warn(e)}
  pathologyIndex=out;
  return out;
}
function relatedPathologies(){
  const medicine=current?.medicine||{};
  const indication=sectionText(['4.1']);
  const hay=norm([indication,medicine.pactivos,medicine.nombre,(medicine.atcs||[]).map(x=>x.nombre).join(' ')].join(' '));
  const stop=new Set('para como este esta estos estas tratamiento pacientes medicamento medicamentos administracion enfermedad enfermedades puede deben sobre entre desde hasta cada otras otros'.split(' '));
  const tokens=[...new Set(hay.split(' ').filter(t=>t.length>4&&!stop.has(t)))];
  return buildPathologyIndex().map(item=>{
    let score=0;
    tokens.forEach(t=>{
      if(norm(item.title).includes(t))score+=8;
      if(item.text.includes(t))score+=1;
    });
    return{item,score};
  }).filter(x=>x.score>2).sort((a,b)=>b.score-a.score).slice(0,9).map(x=>x.item);
}
function renderRelated(){
  const rows=relatedPathologies();
  $('#v28RelatedPathologies').innerHTML=rows.length?rows.map(x=>
    `<button type="button" class="v28-related-card" data-related-id="${esc(x.id)}">
      <b>${esc(x.title)}</b><small>${esc(x.meta||'Biblioteca Enferix')}</small>
    </button>`
  ).join(''):'<div class="v28-section-missing">No se han encontrado relaciones claras con las patologías internas.</div>';
}
function setMode(next){
  mode=next;
  $$('#v28SearchModes button').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
  const map={
    name:['Ej.: paracetamol, Aspirina C…','Busca por nombre del medicamento.'],
    active:['Ej.: noradrenalina, amoxicilina…','Busca por nombre del principio activo.'],
    pathology:['Ej.: sepsis, asma, dolor neuropático…','Busca ese texto en la sección 4.1 de indicaciones de las fichas técnicas.'],
    atc:['Ej.: N02BE01 o analgésicos…','Busca por código ATC o su descripción.']
  };
  queryInput.placeholder=map[mode][0];$('#v28SearchHint').textContent=map[mode][1];
}
function normalizeItems(data){
  if(Array.isArray(data))return data;
  return data.items||data.resultados||data.medicamentos||data.content||[];
}
function localMatches(q){
  try{
    if(typeof VADEM==='undefined'||!Array.isArray(VADEM))return[];
    const n=norm(q);
    return VADEM.filter(v=>norm([v.n,v.a,v.i,v.p,v.r,v.c,v.cat].join(' ')).includes(n)).slice(0,12);
  }catch(e){return[]}
}
function renderLocalFallback(q,errorText){
  const local=localMatches(q);
  resultsBox.innerHTML=`<div class="v28-error">
    No se ha podido conectar con CIMA: ${esc(errorText)}.
    <button type="button" data-open-local="1">Abrir el Vademécum local de Enferix</button>
  </div>`+(local.length?local.map(v=>`
    <button type="button" class="v28-result-card" data-local-drug="${esc(v.n)}">
      <span class="v28-result-icon">iN</span>
      <span class="v28-result-copy"><h4>${esc(v.n)}</h4><p>${esc(v.i||v.a||'Referencia local de Enferix')}</p>
      <span class="v28-result-tags"><span>Fuente local</span><span>${esc(v.cat||'Farmacología')}</span></span></span>
    </button>`).join(''):'');
}
async function searchCima(event){
  if(event)event.preventDefault();
  const q=queryInput.value.trim();
  if(q.length<2){
    resultsBox.innerHTML='<div class="v28-error">Escribe al menos dos caracteres.</div>';return;
  }
  $('#v28ResultsTitle').textContent=mode==='pathology'?'Medicamentos relacionados con «'+q+'»':'Resultados para «'+q+'»';
  $('#v28ResultsSub').textContent='Consultando la base oficial CIMA-AEMPS.';
  $('#v28ResultsCount').textContent='';
  resultsBox.innerHTML='<div class="v28-loading"><span></span><span></span><span></span><p>Buscando medicamentos…</p></div>';
  const params=new URLSearchParams({
    mode,q,page:'1',
    commercial:$('#v28CommercialOnly').checked?'1':'0',
    authorized:$('#v28AuthorizedOnly').checked?'1':'0'
  });
  try{
    const data=await fetchJSON(backendBase()+'/api/cima/search?'+params);
    lastResults=normalizeItems(data);
    renderResults(lastResults,data);
    setState('ok','CIMA conectada','Resultados recuperados de AEMPS.');
  }catch(e){
    setState('error','CIMA no disponible','Comprueba el backend y la conexión.');
    renderLocalFallback(q,e.message);
  }
}
function renderResults(items,data={}){
  $('#v28ResultsCount').textContent=items.length+' resultados';
  $('#v28ResultsSub').textContent=items.length?'Selecciona un medicamento para abrir su ficha completa.':'No se han encontrado coincidencias.';
  if(!items.length){
    resultsBox.innerHTML='<div class="v28-empty"><span>🔎</span><b>Sin resultados</b><p>Prueba con un principio activo, una marca diferente o un término más general.</p></div>';
    return;
  }
  resultsBox.innerHTML=items.map(m=>`
    <button type="button" class="v28-result-card" data-nregistro="${esc(m.nregistro||'')}">
      <span class="v28-result-icon">Rx</span>
      <span class="v28-result-copy">
        <h4>${esc(m.nombre||'Medicamento')}</h4>
        <p>${esc(m.pactivos||'Principio activo no indicado')} · ${esc(m.labtitular||'')}</p>
        <span class="v28-result-tags">
          ${m.comerc===false?'<span>No comercializado</span>':'<span class="available">Comercializado</span>'}
          ${m.receta===false?'<span>Sin receta</span>':'<span>Con receta</span>'}
          ${m.psum?'<span class="supply">Problema de suministro</span>':''}
          ${m.triangulo?'<span>▼ Seguimiento adicional</span>':''}
        </span>
      </span>
    </button>`).join('');
}
async function openMedicine(nregistro){
  if(!nregistro)return;
  showDetail();
  $('#v28DetailLoading').style.display='block';
  $('#v28DetailContent').classList.remove('on');
  try{
    current=await fetchJSON(backendBase()+'/api/cima/medicine/'+encodeURIComponent(nregistro));
    activeTab='summary';
    renderMedicine();
    addRecent(current.medicine);
    setState('ok','CIMA conectada','Ficha completa recuperada.');
  }catch(e){
    $('#v28DetailLoading').innerHTML=`<div class="v28-error">No se ha podido cargar la ficha: ${esc(e.message)}<button type="button" id="v28RetryDetail">Reintentar</button></div>`;
    setTimeout(()=>{
      const b=$('#v28RetryDetail');if(b)b.onclick=()=>openMedicine(nregistro);
    });
  }
}
function metaItem(label,value){
  return `<div class="v28-meta-item"><b>${esc(label)}</b><span>${esc(value||'No consta')}</span></div>`;
}
function renderMedicine(){
  const m=current.medicine||{};
  $('#v28DetailLoading').style.display='none';$('#v28DetailContent').classList.add('on');
  $('#v28DrugName').textContent=m.nombre||'Medicamento';
  $('#v28DrugActives').textContent=m.pactivos||'';
  $('#v28DrugStatus').textContent=m.comerc?'Comercializado':'No comercializado';
  $('#v28DrugFavorite').textContent=isFavorite(m.nregistro)?'★':'☆';
  $('#v28DrugMeta').innerHTML=[
    metaItem('N.º registro',m.nregistro),
    metaItem('Laboratorio',m.labtitular),
    metaItem('Prescripción',m.cpresc),
    metaItem('Dosis / concentración',m.dosis),
    metaItem('Forma farmacéutica',m.formaFarmaceutica?.nombre||m.formaFarmaceuticaSimplificada?.nombre),
    metaItem('Vías', (m.viasAdministracion||[]).map(x=>x.nombre).join(', ')),
    metaItem('ATC',(m.atcs||[]).map(x=>x.codigo+' · '+x.nombre).join(' / ')),
    metaItem('Última ficha técnica',formatDate((m.docs||[]).find(d=>Number(d.tipo)===1)?.fecha))
  ].join('');
  const warnings=[];
  warnings.push(m.receta===false?['Sin receta','ok']:['Requiere prescripción','']);
  if(m.psum)warnings.push(['Problema de suministro','danger']);
  if(m.triangulo)warnings.push(['Seguimiento adicional ▼','danger']);
  if(m.conduc)warnings.push(['Puede afectar a la conducción','']);
  if(m.nosustituible&&Number(m.nosustituible.id)!==0)warnings.push(['No sustituible','']);
  if(m.huerfano)warnings.push(['Medicamento huérfano','']);
  if(m.biosimilar)warnings.push(['Biosimilar','']);
  $('#v28DrugWarnings').innerHTML=warnings.map(w=>`<span class="v28-warning-tag ${w[1]}">${esc(w[0])}</span>`).join('');
  $('#v28FetchedAt').textContent=new Intl.DateTimeFormat('es-ES',{dateStyle:'medium',timeStyle:'short'}).format(new Date());
  $('#v28OpenTechnical').disabled=!docUrl(1);
  $('#v28OpenProspectus').disabled=!docUrl(2);
  renderTabs();
  renderRelated();
}
function renderTabs(){
  $$('#v28DrugTabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===activeTab));
  const box=$('#v28DrugTabContent');
  if(activeTab==='summary'){box.innerHTML=summaryHTML();return}
  if(activeTab==='security'){box.innerHTML=securityHTML();return}
  const conf=TAB_MAP[activeTab];
  const content=sectionHTML(conf.prefixes);
  box.innerHTML=content?`<div class="v28-section-content">${content}</div>`:
    `<div class="v28-section-missing">CIMA no ofrece esta sección en formato segmentado para este medicamento. Consulta la ficha técnica oficial completa.</div>`;
}
function summaryHTML(){
  const m=current.medicine||{};
  const indications=sectionHTML(['4.1']);
  const principles=(m.principiosActivos||[]).map(x=>
    `${x.nombre}${x.cantidad?' '+x.cantidad:''}${x.unidad?' '+x.unidad:''}`
  ).join(', ')||m.pactivos||'No consta';
  const presentations=(m.presentaciones||[]);
  return `<div class="v28-summary-grid">
    <div class="v28-summary-card"><b>Principios activos</b><p>${esc(principles)}</p></div>
    <div class="v28-summary-card"><b>Administración</b><p>${esc((m.viasAdministracion||[]).map(x=>x.nombre).join(', ')||'No consta')}</p></div>
    <div class="v28-summary-card"><b>Forma farmacéutica</b><p>${esc(m.formaFarmaceutica?.nombre||'No consta')}</p></div>
    <div class="v28-summary-card"><b>Condiciones</b><p>${esc(m.cpresc||'No consta')}</p></div>
  </div>
  <div class="v28-section-content"><h3>4.1 · Indicaciones terapéuticas</h3>${indications||'<p>No disponible en formato segmentado.</p>'}</div>
  <div class="v28-presentations"><h3>Presentaciones</h3>
    ${presentations.length?presentations.map(p=>`
      <div class="v28-presentation"><div><b>${esc(p.nombre||'Presentación')}</b><small>Código nacional: ${esc(p.cn||'')}</small></div>
      <span class="${p.psum?'problem':''}">${p.psum?'Suministro afectado':p.comerc?'Disponible':'No comercializada'}</span></div>`).join(''):
      '<div class="v28-section-missing">No constan presentaciones.</div>'}
  </div>`;
}
function securityHTML(){
  const notes=Array.isArray(current.notes)?current.notes:(current.notes?.resultados||[]);
  const mats=Array.isArray(current.materials)?current.materials:(current.materials?.resultados||[]);
  const supply=Array.isArray(current.supply)?current.supply:[];
  const docs=current.medicine?.docs||[];
  const cards=[];
  notes.forEach(n=>cards.push(`<div class="v28-security-card"><b>Nota de seguridad · ${esc(n.asunto||n.ref||'AEMPS')}</b><p>${esc(formatDate(n.fecha))}</p>${n.url?`<a href="${esc(n.url)}" target="_blank" rel="noopener">Abrir nota oficial</a>`:''}</div>`));
  mats.forEach(m=>{
    cards.push(`<div class="v28-security-card"><b>Material informativo · ${esc(m.titulo||'Seguridad')}</b><p>Material para profesionales y pacientes disponible en AEMPS.</p></div>`)
  });
  supply.forEach(s=>cards.push(`<div class="v28-security-card"><b>Problema de suministro · ${esc(s.nombre||s.cn||'')}</b><p>${esc(s.observ||'')}</p></div>`));
  docs.forEach(d=>cards.push(`<div class="v28-security-card"><b>${Number(d.tipo)===1?'Ficha técnica':Number(d.tipo)===2?'Prospecto':'Documento regulatorio'}</b><p>Actualizado: ${esc(formatDate(d.fecha))}</p>${d.url?`<a href="${esc(d.url)}" target="_blank" rel="noopener">Abrir documento oficial</a>`:''}</div>`));
  return `<div class="v28-security-list">${cards.length?cards.join(''):'<div class="v28-section-missing">No constan notas, materiales o incidencias adicionales.</div>'}</div>`;
}
function askJavny(){
  const m=current?.medicine;if(!m)return;
  closeCima();
  const text=`Consulta farmacológica sobre ${m.nombre}. Principios activos: ${m.pactivos}. Utiliza la ficha CIMA-AEMPS y especifica presentación, posología, contraindicaciones, interacciones, embarazo/lactancia, conservación y sobredosis.`;
  const fab=$('#ccFab')||$('#askFab');if(fab)fab.click();
  setTimeout(()=>{
    const ta=$('#ccTa');if(ta){ta.value=text;ta.dispatchEvent(new Event('input',{bubbles:true}));ta.focus()}
  },100);
}
function openOfficial(type){
  const url=docUrl(type);if(url)window.open(url,'_blank','noopener');
}
function openLocal(){
  closeCima();
  if(typeof openVade==='function')openVade();
}
function openRelated(id){
  closeCima();
  if(window.Enferix21?.openItem){window.Enferix21.openItem(id);return}
  if(window.Enferix21?.open){window.Enferix21.open('all');return}
  $('#library21Btn')?.click();
}
function startVoice(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){
    $('#v28VoiceState').className='v28-voice-state on';
    $('#v28VoiceState').textContent='El reconocimiento de voz no está disponible en este navegador.';
    return;
  }
  if(recognition){try{recognition.stop()}catch(e){}}
  recognition=new SR();recognition.lang='es-ES';recognition.interimResults=true;recognition.continuous=false;
  $('#v28CimaVoice').classList.add('listening');
  $('#v28VoiceState').className='v28-voice-state on';$('#v28VoiceState').textContent='Te escucho…';
  recognition.onresult=e=>{
    let final='',interim='';
    for(let i=e.resultIndex;i<e.results.length;i++){
      if(e.results[i].isFinal)final+=e.results[i][0].transcript;
      else interim+=e.results[i][0].transcript;
    }
    queryInput.value=(final||interim).trim();
    $('#v28VoiceState').textContent='«'+queryInput.value+'»';
  };
  recognition.onend=()=>{
    $('#v28CimaVoice').classList.remove('listening');
    if(queryInput.value.trim().length>=2)setTimeout(()=>searchCima(),250);
  };
  recognition.onerror=e=>{
    $('#v28CimaVoice').classList.remove('listening');
    $('#v28VoiceState').textContent='No se ha podido utilizar el micrófono: '+e.error;
  };
  try{recognition.start()}catch(e){}
}

/* Events */
const vadeButton=$('#vadeBtn');
if(vadeButton)vadeButton.onclick=openCima;
const v281Open=$('#v281OpenCorrectly');
if(v281Open)v281Open.onclick=async()=>{
  try{
    const r=await fetch('http://localhost:8787/api/health',{cache:'no-store'});
    if(r.ok){location.href='http://localhost:8787';return}
  }catch(e){}
  updateActivationBox(
    'error',
    'Primero debes iniciar el servidor',
    'En la carpeta descargada haz doble clic en <code>ABRIR_INURSE_CIMA.command</code>.'
  );
};
$('#v28CimaClose').onclick=closeCima;
$('#v28CimaHome').onclick=showSearch;
$('#v28CimaLocal').onclick=openLocal;
$('#v28DetailBack').onclick=showSearch;
$('#v28CimaForm').onsubmit=searchCima;
$('#v28CimaVoice').onclick=startVoice;
$('#v28DrugFavorite').onclick=toggleFavorite;
$('#v28AskJavny').onclick=askJavny;
$('#v28OpenTechnical').onclick=()=>openOfficial(1);
$('#v28OpenProspectus').onclick=()=>openOfficial(2);
$('#v28OpenInteracciones').onclick=()=>{
  if(window.EnferixInteracciones&&window.EnferixInteracciones.open)window.EnferixInteracciones.open();
};
$('#v28SearchModes').onclick=e=>{
  const b=e.target.closest('[data-mode]');if(b)setMode(b.dataset.mode);
};
resultsBox.onclick=e=>{
  const local=e.target.closest('[data-open-local]');if(local){openLocal();return}
  const localDrug=e.target.closest('[data-local-drug]');if(localDrug){openLocal();return}
  const card=e.target.closest('[data-nregistro]');if(card)openMedicine(card.dataset.nregistro);
};
$('#v28DrugTabs').onclick=e=>{
  const b=e.target.closest('[data-tab]');if(!b)return;
  activeTab=b.dataset.tab;renderTabs();
};
$('#v28RelatedPathologies').onclick=e=>{
  const b=e.target.closest('[data-related-id]');if(b)openRelated(b.dataset.relatedId);
};
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&overlay.classList.contains('on')){
    if(detailView.classList.contains('on'))showSearch();else closeCima();
  }
});

window.EnferixCima={
  open:openCima,
  close:closeCima,
  search:(q,nextMode='name')=>{openCima();setMode(nextMode);queryInput.value=q;searchCima()},
  openMedicine
};

setMode('name');
})();
