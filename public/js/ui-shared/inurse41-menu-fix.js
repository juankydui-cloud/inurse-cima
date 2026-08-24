
(function(){
  function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function catsOf(d){return Array.isArray(d.cat)?d.cat:[d.cat];}
  function openSpec(spec){
    try{ window.__INURSE_HOME=false; query=''; activeCat='spec:'+spec; var si=document.getElementById('search'); if(si) si.value=''; var cb=document.getElementById('clearBtn'); if(cb) cb.style.display='none'; if(typeof render==='function') render(); window.scrollTo({top:0,behavior:'smooth'}); }catch(e){}
    var ov=document.getElementById('v29Ov'), pan=document.getElementById('v29Panel'); if(ov) ov.classList.remove('on'); if(pan) pan.classList.remove('on'); document.body.style.overflow='';
  }
  function openDoc(spec,id){
    openSpec(spec);
    setTimeout(function(){ var el=document.getElementById('card-'+id); if(el){ if(typeof toggle==='function') toggle(id); el.scrollIntoView({behavior:'smooth',block:'center'}); } },120);
  }
  function rebuildIntensiva(){
    if(typeof DOCS==='undefined') return;
    if(window.__SPEC_SETS && Array.isArray(window.__SPEC_SETS.intensiva) && window.__SPEC_SETS.intensiva.indexOf('farm')<0) window.__SPEC_SETS.intensiva.push('farm');
    var sp=document.querySelector('#v29Panel .v29-spec[data-spec="intensiva"]'); if(!sp) return;
    var nm=sp.querySelector('.nm'); if(nm) nm.textContent='UCI / Medicina Intensiva';
    var cats=['uci','resp','enfoqueuci','anest','farm'];
    var docs=DOCS.filter(function(d){var dc=catsOf(d);return cats.some(function(c){return dc.indexOf(c)>=0;});});
    var ct=sp.querySelector('[data-ct="intensiva"]'); if(ct) ct.textContent=docs.length+' '+(docs.length===1?'guía':'guías');
    var host=sp.querySelector('[data-list="intensiva"]'); if(!host) return;
    var html=docs.slice(0,10).map(function(d){return '<button class="v29-doc" data-inurse-doc="'+esc(d.id)+'"><b>'+esc(d.title)+'</b></button>';}).join('');
    if(docs.length>10) html+='<button class="v29-seeall" data-inurse-spec="intensiva">Ver las '+docs.length+' guías de UCI / Medicina Intensiva →</button>';
    host.innerHTML=html;
    host.querySelectorAll('[data-inurse-doc]').forEach(function(b){b.addEventListener('click',function(){openDoc('intensiva',b.getAttribute('data-inurse-doc'));});});
    host.querySelectorAll('[data-inurse-spec]').forEach(function(b){b.addEventListener('click',function(){openSpec('intensiva');});});
  }
  document.addEventListener('click',function(e){ if(e.target.closest('#v29MenuBtn')) setTimeout(rebuildIntensiva,180); },true);
  setTimeout(rebuildIntensiva,1200);
})();
