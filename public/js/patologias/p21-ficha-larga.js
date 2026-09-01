/* P2.1 · Ficha larga navegable
   Componente aislado: NO toca inurse54-clean-redesign-js.js.
   Al abrirse una ficha en la vista `#in54ProtocolContent`:
     · Inyecta un bloque "Puntos clave" entre el banner y las pestañas.
       Fuente: `doc.puntos_clave` (array) si viene relleno a mano;
       si no, se derivan literalmente hasta 5 <li> de las primeras
       secciones del documento (etiqueta discreta «extraído de la ficha»).
     · Deja la barra `.in54-tabs` sticky bajo el header con highlight
       automático de la pestaña activa al hacer scroll (IntersectionObserver).
   Nunca reformula texto: los bullets extraídos son verbatim.
*/
(function(){
  'use strict';
  var MAX_PUNTOS = 5;

  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  }); }
  function textOf(html){
    var d = document.createElement('div'); d.innerHTML = String(html||'');
    return (d.textContent || '').replace(/\s+/g,' ').trim();
  }

  function findDocByTitle(title){
    if(!title) return null;
    var docs = (window.DOCS||[]);
    return docs.find(function(d){ return d && d.title && d.title.trim() === title.trim(); }) || null;
  }

  /* ── Puntos clave ── */
  function collectPuntos(doc){
    if(!doc) return { items: [], source: 'ninguno' };
    /* 1) Manual manda */
    if(Array.isArray(doc.puntos_clave) && doc.puntos_clave.length){
      return {
        items: doc.puntos_clave.slice(0, MAX_PUNTOS).map(function(x){ return textOf(x); }).filter(Boolean),
        source: 'manual'
      };
    }
    /* 2) Extraer literalmente hasta 5 <li> de las primeras secciones */
    var items = [];
    var secs = Array.isArray(doc.sec) ? doc.sec : [];
    for(var i=0;i<secs.length && items.length<MAX_PUNTOS;i++){
      var wrap = document.createElement('div');
      wrap.innerHTML = String(secs[i].b || '');
      var lis = wrap.querySelectorAll('li');
      for(var j=0;j<lis.length && items.length<MAX_PUNTOS;j++){
        var t = (lis[j].textContent || '').replace(/\s+/g,' ').trim();
        if(t && t.length >= 8) items.push(t);
      }
    }
    return { items: items, source: items.length ? 'auto' : 'ninguno' };
  }

  function puntosHTML(doc){
    var p = collectPuntos(doc);
    if(!p.items.length) return '';
    var tag = p.source === 'manual'
      ? '<span class="p21-badge p21-badge-manual" title="Puntos clave revisados por el editor de la ficha">Revisado</span>'
      : '<span class="p21-badge p21-badge-auto" title="Extraídos automáticamente de las secciones de la ficha; verificar antes de citar">Extraído de la ficha</span>';
    return '<section class="p21-puntos" data-in54-section="Puntos clave" data-p21="1">'
      +   '<h3><span class="p21-em">🔑</span>Puntos clave '+tag+'</h3>'
      +   '<ul>'+ p.items.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join('') +'</ul>'
      + '</section>';
  }

  /* ── Sticky tabs: en vez de hacer sticky la barra por separado (lo que
     provoca overlap con el header cuyo alto varía), la MOVEMOS DENTRO
     del propio header sticky. Así viajan juntos, sin cálculos ni
     glitches, y garantizamos fondo opaco compartido. */
  function stickifyTabs(root){
    var tabs = root.querySelector('.in54-tabs');
    var head = document.querySelector('.in54-proto-head');
    if(!tabs || !head) return;
    tabs.classList.add('p21-tabs-in-head');
    if(!head.querySelector('.p21-tabs-in-head')){
      head.appendChild(tabs);
    }
  }
  function bindActiveOnScroll(root){
    var tabButtons = Array.from(root.querySelectorAll('.in54-tab[data-in54-tab]'));
    if(!tabButtons.length) return;
    var sections = Array.from(root.querySelectorAll('.in54-section[data-in54-section]'));
    if(!sections.length) return;
    var labelToBtn = {};
    tabButtons.forEach(function(b){
      var lab = b.getAttribute('data-in54-tab');
      labelToBtn[lab] = b;
    });
    /* Añade la pestaña "Puntos clave" si el bloque existe y aún no está */
    var pk = root.querySelector('.p21-puntos');
    if(pk && !labelToBtn['Puntos clave']){
      var newTab = document.createElement('button');
      newTab.className = 'in54-tab';
      newTab.setAttribute('data-in54-tab', 'Puntos clave');
      newTab.textContent = 'Puntos clave';
      newTab.addEventListener('click', function(){
        pk.scrollIntoView({ behavior:'smooth', block:'start' });
      });
      /* Inserta como segunda pestaña (tras Resumen) si existe. */
      var resumenBtn = labelToBtn['Resumen'];
      if(resumenBtn && resumenBtn.nextSibling){
        resumenBtn.parentNode.insertBefore(newTab, resumenBtn.nextSibling);
      } else {
        tabButtons[0] && tabButtons[0].parentNode.insertBefore(newTab, tabButtons[0].nextSibling);
      }
      tabButtons = Array.from(root.querySelectorAll('.in54-tab[data-in54-tab]'));
      labelToBtn['Puntos clave'] = newTab;
      sections = Array.from(root.querySelectorAll('.in54-section[data-in54-section]'));
    }
    var io = new IntersectionObserver(function(entries){
      /* La sección más cerca de la línea guía manda la pestaña activa. */
      var visible = entries.filter(function(e){ return e.isIntersecting; })
        .sort(function(a,b){ return a.boundingClientRect.top - b.boundingClientRect.top; });
      if(!visible.length) return;
      var top = visible[0];
      var label = top.target.getAttribute('data-in54-section');
      tabButtons.forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-in54-tab') === label); });
    }, { rootMargin: '-180px 0px -55% 0px', threshold: 0 });
    sections.forEach(function(s){ io.observe(s); });
  }

  /* ── Inyección ── */
  function ensureP21(container){
    if(!container) return;
    if(container.dataset.p21 === '1') return;
    /* Localizar el documento por el título del banner */
    var titleEl = container.querySelector('.in54-proto-banner .in54-proto-meta h1');
    var title = (titleEl && titleEl.textContent || '').trim();
    var doc = findDocByTitle(title);
    if(!doc) return;
    /* Puntos clave — insertar tras el banner, antes de las tabs */
    var tabs = container.querySelector('.in54-tabs');
    var banner = container.querySelector('.in54-proto-banner');
    if(!banner) return;
    var pkHTML = puntosHTML(doc);
    if(pkHTML){
      var wrap = document.createElement('div');
      wrap.innerHTML = pkHTML;
      var pk = wrap.firstElementChild;
      banner.parentNode.insertBefore(pk, tabs || banner.nextSibling);
    }
    stickifyTabs(container);
    bindActiveOnScroll(container);
    container.dataset.p21 = '1';
  }

  function scan(){
    var container = document.getElementById('in54ProtocolContent');
    if(container) ensureP21(container);
  }

  var mo = null;
  var MO_OPTS = { childList: true, subtree: true };
  function boot(){
    scan();
    mo = new MutationObserver(function(muts){
      /* renderProtocol reemplaza el innerHTML del contenedor: cuando
         aparezcan nuevos `.in54-proto-banner`, resetear y re-inyectar. */
      var relevant = false;
      for(var i=0;i<muts.length && !relevant;i++){
        var m = muts[i];
        if(m.type !== 'childList') continue;
        for(var j=0;j<m.addedNodes.length;j++){
          var n = m.addedNodes[j];
          if(n.nodeType !== 1) continue;
          if(n.classList && (n.classList.contains('in54-proto-banner') ||
              (n.querySelector && n.querySelector('.in54-proto-banner')))){
            var container = document.getElementById('in54ProtocolContent');
            if(container){ container.dataset.p21 = ''; }
            relevant = true; break;
          }
        }
      }
      if(relevant){
        try{ mo.disconnect(); }catch(e){}
        scan();
        try{ mo.observe(document.body, MO_OPTS); }catch(e){}
      }
    });
    try{ mo.observe(document.body, MO_OPTS); }catch(e){}
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
