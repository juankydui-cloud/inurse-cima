/* P2.3 · Pestaña "Algoritmo" a pantalla completa en fichas
   Componente aislado: NO toca inurse54-clean-redesign-js.js ni la
   registrar de `DIAGRAMS`. Cuando una ficha tiene un algoritmo asociado
   (existe `getDiagrams()[docId]`), añade una pestaña "Algoritmo" al
   carrusel de tabs de la ficha. Al pulsarla abre un overlay a pantalla
   completa que renderiza el diagrama y llama a su `.init()`.
*/
(function(){
  'use strict';

  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  }); }
  function detectLang(){
    var htmlLang = (document.documentElement.lang||'').toLowerCase();
    if(htmlLang.startsWith('ca')) return 'ca';
    try{ var s = (localStorage.getItem('inurse_lang')||'').toLowerCase(); if(s.startsWith('ca')) return 'ca'; if(s.startsWith('es')) return 'es'; }catch(e){}
    var nav = (navigator.language||'').toLowerCase();
    if(nav.startsWith('ca')) return 'ca';
    return 'es';
  }
  var LANG = {
    es: { tab:'Algoritmo', close:'Cerrar', title:'Algoritmo interactivo' },
    ca: { tab:'Algoritme',  close:'Tancar', title:'Algorisme interactiu' }
  };
  function t(){ return LANG[detectLang()] || LANG.es; }

  /* `DIAGRAMS` se declara con `const` a nivel de script en
     `inline-script-6388.js`, así que NO existe como `window.DIAGRAMS`.
     Está en el ámbito de scripts compartidos; leemos por referencia
     directa protegida por `typeof`. */
  function getDiagrams(){
    try{ return typeof DIAGRAMS !== 'undefined' ? DIAGRAMS : null; }
    catch(e){ return null; }
  }

  function currentDocId(){
    /* Localizar el documento por el título del banner de la vista in54. */
    var titleEl = document.querySelector('#in54ProtocolContent .in54-proto-banner .in54-proto-meta h1');
    var title = (titleEl && titleEl.textContent || '').trim();
    if(!title) return null;
    var docs = (window.DOCS||[]);
    var d = docs.find(function(d){ return d && d.title && d.title.trim() === title; });
    return d ? d.id : null;
  }

  function ensureTab(){
    var id = currentDocId();
    if(!id) return;
    if(!getDiagrams() || !getDiagrams()[id]) return;
    var tabsBar = document.querySelector('.in54-proto-head .in54-tabs, #in54ProtocolContent .in54-tabs');
    if(!tabsBar) return;
    if(tabsBar.querySelector('[data-p23-open]')) return;   // ya añadida
    var diag = getDiagrams()[id];
    var L = t();
    var btn = document.createElement('button');
    btn.className = 'in54-tab p23-tab';
    btn.setAttribute('data-p23-open','1');
    btn.setAttribute('data-in54-tab', 'Algoritmo');
    btn.innerHTML = '<span class="p23-tab-em">'+esc(diag.icon || '🧩')+'</span>'+esc(L.tab);
    btn.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      openOverlay(id, diag);
    });
    tabsBar.appendChild(btn);
  }

  var _overlay = null;
  function closeOverlay(){
    if(_overlay && _overlay.parentNode){ _overlay.parentNode.removeChild(_overlay); }
    _overlay = null;
    document.body.classList.remove('p23-overlay-open');
    document.removeEventListener('keydown', onEsc);
  }
  function onEsc(e){ if(e.key === 'Escape') closeOverlay(); }
  function openOverlay(id, diag){
    closeOverlay();
    var L = t();
    _overlay = document.createElement('div');
    _overlay.className = 'p23-overlay';
    _overlay.innerHTML =
      '<div class="p23-shell" role="dialog" aria-modal="true" aria-labelledby="p23Title">'
      + '<header class="p23-head">'
      +   '<div class="p23-head-left">'
      +     '<span class="p23-head-em">'+esc(diag.icon || '🧩')+'</span>'
      +     '<h2 id="p23Title">'+esc(diag.title || L.title)+'</h2>'
      +   '</div>'
      +   '<button type="button" class="p23-close" id="p23Close" aria-label="'+esc(L.close)+'">✕</button>'
      + '</header>'
      + '<div class="p23-body" id="p23Body"></div>'
      + '</div>';
    document.body.appendChild(_overlay);
    document.body.classList.add('p23-overlay-open');
    /* Renderizar y arrancar el diagrama */
    var body = _overlay.querySelector('#p23Body');
    try{
      body.innerHTML = typeof diag.render === 'function' ? diag.render() : '';
    }catch(e){ body.textContent = 'No se pudo renderizar el algoritmo.'; }
    if(typeof diag.init === 'function'){
      setTimeout(function(){ try{ diag.init(); }catch(e){} }, 40);
    }
    _overlay.addEventListener('click', function(e){
      if(e.target === _overlay){ closeOverlay(); return; }
      if(e.target.closest('#p23Close')){ closeOverlay(); return; }
    });
    document.addEventListener('keydown', onEsc);
  }
  window.EnferixAlgoTab = { open: openOverlay, close: closeOverlay };

  function scan(){
    /* Cada vez que se abre una ficha, re-verifica y añade la tab. */
    ensureTab();
  }
  var mo = null;
  function boot(){
    scan();
    mo = new MutationObserver(function(muts){
      var relevant = false;
      for(var i=0;i<muts.length && !relevant;i++){
        var m = muts[i];
        if(m.type !== 'childList') continue;
        for(var j=0;j<m.addedNodes.length;j++){
          var n = m.addedNodes[j];
          if(n.nodeType !== 1) continue;
          if(n.classList && (n.classList.contains('in54-proto-banner') ||
              n.classList.contains('in54-tab') ||
              (n.querySelector && (n.querySelector('.in54-proto-banner') || n.querySelector('.in54-tab'))))){
            relevant = true; break;
          }
        }
      }
      if(relevant) scan();
    });
    try{ mo.observe(document.body, { childList:true, subtree:true }); }catch(e){}
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
