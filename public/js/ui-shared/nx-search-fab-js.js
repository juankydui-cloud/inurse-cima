
(function(){
  'use strict';
  function real(){ return document.getElementById('search'); }
  function feed(v){ var r=real(); if(r){ r.value=v; r.dispatchEvent(new Event('input',{bubbles:true})); } }
  function openBar(){ var o=document.getElementById('nxSearchOverlay'); if(!o) return; o.classList.add('on'); o.setAttribute('aria-hidden','false');
    var i=document.getElementById('nxSearchBig'); if(i){ setTimeout(function(){ i.focus(); }, 30); } }
  function closeBar(){ var o=document.getElementById('nxSearchOverlay'); if(!o) return; o.classList.remove('on'); o.setAttribute('aria-hidden','true');
    var i=document.getElementById('nxSearchBig'); if(i) i.value=''; feed(''); }
  document.addEventListener('click',function(e){
    if(e.target.closest('#nxSearchFab')){ openBar(); return; }
    if(e.target.closest('#nxSearchClose')){ closeBar(); return; }
    // Al abrir un resultado, cerrar la barra
    if(e.target.closest('#in50GlobalResults [data-in50-open]')){ var o=document.getElementById('nxSearchOverlay'); if(o) o.classList.remove('on'); }
  });
  document.addEventListener('input',function(e){ if(e.target && e.target.id==='nxSearchBig'){ feed(e.target.value); } });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'){ var o=document.getElementById('nxSearchOverlay'); if(o&&o.classList.contains('on')) closeBar(); } });
})();
