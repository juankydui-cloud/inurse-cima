
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const dataTag=$('#inurse-v27-algorithm-data');
const DATA=dataTag?JSON.parse(dataTag.textContent):{catalog:[],modules:{}};
const CATALOG=DATA.catalog||[];
const MODULES=DATA.modules||{};
const overlay=$('#v27AlgorithmsOverlay');
const catalogView=$('#v27AlgCatalog');
const viewer=$('#v27AlgViewer');
const frame=$('#v27AlgorithmFrame');
const grid=$('#v27AlgGrid');
const search=$('#v27AlgSearch');
let activeCategory='all';
let currentId='';

function esc(s){
  return String(s??'').replace(/[&<>"']/g,m=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[m]);
}
function norm(s){
  return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
}
function decodeModule(encoded){
  const bin=atob(encoded),bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  return new TextDecoder('utf-8').decode(bytes);
}
function openOverlay(){
  overlay.classList.add('on');overlay.setAttribute('aria-hidden','false');
  if(!currentId)showCatalog();
}
function closeOverlay(){
  overlay.classList.remove('on');overlay.setAttribute('aria-hidden','true');
  if(frame)frame.srcdoc='';
  currentId='';
  showCatalog();
}
function showCatalog(){
  catalogView.style.display='block';viewer.classList.remove('on');
  $('#v27AlgHome').style.visibility='hidden';
  frame.srcdoc='';currentId='';
  render();
}
function openAlgorithm(id){
  const item=CATALOG.find(x=>x.id===id);
  const encoded=MODULES[id];
  if(!item||!encoded)return;
  currentId=id;openOverlay();
  catalogView.style.display='none';viewer.classList.add('on');
  $('#v27AlgHome').style.visibility='visible';
  $('#v27ViewerTitle').textContent=item.title;
  $('#v27ViewerMeta').textContent=item.category+' · '+item.type+' · '+item.source;
  $('#v27ViewerStatus').textContent='Cargando…';
  frame.srcdoc=decodeModule(encoded);
}
function render(){
  const q=norm(search.value);
  const rows=CATALOG.filter(item=>{
    const categoryOk=activeCategory==='all'||item.category===activeCategory;
    const hay=norm([item.title,item.subtitle,item.category,item.type,item.keywords,item.source].join(' '));
    return categoryOk&&(!q||hay.includes(q)||q.split(' ').every(t=>hay.includes(t)));
  });
  if(!rows.length){
    grid.innerHTML='<div class="v27-alg-empty">No se ha encontrado ningún algoritmo con esos criterios.</div>';
    return;
  }
  grid.innerHTML=rows.map(item=>`
    <button type="button" class="v27-alg-card" style="--v27-accent:${esc(item.accent)}" data-v27-open="${esc(item.id)}">
      <span class="v27-alg-icon">${esc(item.icon)}</span>
      <span class="v27-alg-content">
        <span class="v27-alg-topline">
          <span class="v27-alg-badge">${esc(item.category)}</span>
          <span class="v27-alg-badge">${esc(item.type)}</span>
        </span>
        <h4>${esc(item.title)}</h4>
        <p>${esc(item.subtitle)}</p>
        <span class="v27-alg-card-meta">
          <span>${esc(item.source)}</span>
          <span>${esc(item.evidence)}</span>
        </span>
      </span>
      <span class="v27-alg-card-warning">${esc(item.warning)}</span>
    </button>
  `).join('');
}
function findAndOpenByVoice(text){
  const n=norm(text);
  if(/\bapgar\b/.test(n)){openAlgorithm('apgar');return true}
  if(/\bkdigo\b/.test(n)){openAlgorithm('ckd-kdigo');return true}
  if(/\bckd\b.*\bepi\b|\bfiltrado glomerular\b|\begfr\b|\bfge\b/.test(n)){
    openAlgorithm('ckd-epi');return true
  }
  if(/\bcorticoide|\bprednisona|\bdexametasona|\bhidrocortisona/.test(n)){
    openAlgorithm('corticoides');return true
  }
  return false;
}

$('#v27AlgorithmsBtn').addEventListener('click',openOverlay);
$('#v27AlgClose').addEventListener('click',closeOverlay);
$('#v27AlgHome').addEventListener('click',showCatalog);
$('#v27ViewerBack').addEventListener('click',showCatalog);
$('#v27AlgClear').addEventListener('click',()=>{search.value='';render();search.focus()});
search.addEventListener('input',render);
$('#v27AlgFilters').addEventListener('click',e=>{
  const b=e.target.closest('[data-v27-cat]');if(!b)return;
  activeCategory=b.dataset.v27Cat;
  document.querySelectorAll('[data-v27-cat]').forEach(x=>x.classList.toggle('active',x===b));
  render();
});
grid.addEventListener('click',e=>{
  const b=e.target.closest('[data-v27-open]');if(b)openAlgorithm(b.dataset.v27Open)
});
window.addEventListener('message',e=>{
  if(e.data?.type==='inurse-algorithm-ready'&&e.data.algorithmId===currentId){
    $('#v27ViewerStatus').textContent='Listo';
  }
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&overlay.classList.contains('on')){
    if(currentId)showCatalog();else closeOverlay();
  }
});

window.EnferixAlgorithms={
  openHub:openOverlay,
  open:openAlgorithm,
  close:closeOverlay,
  searchAndOpen:findAndOpenByVoice,
  list:()=>CATALOG.map(x=>({...x}))
};
window.V27_ALGORITHM_CATALOG=CATALOG;
render();
})();
