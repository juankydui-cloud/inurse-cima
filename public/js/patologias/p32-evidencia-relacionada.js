/* P3.2 · Evidencia relacionada al final de ficha (Prioridad 3)
   Bloque nuevo al final de cada ficha clínica (#in54ProtocolContent) con
   resultados del orquestador RAG (Europe PMC + NICE + OpenFDA), agrupados
   por fuente, con año y enlace externo.

   Regla férrea: no se inventa evidencia. `doc.evidenceQuery` es editorial
   (fallback: título ES literal). Sin resultados / fallo se muestran con
   estado vacío honesto, nunca con contenido inventado.
*/
(function(){
  'use strict';

  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  }); }

  function detectLang(){
    var h = (document.documentElement.lang||'').toLowerCase();
    if(h.startsWith('ca')) return 'ca';
    try{ var s = (localStorage.getItem('inurse_lang')||'').toLowerCase(); if(s.startsWith('ca')) return 'ca'; if(s.startsWith('es')) return 'es'; }catch(e){}
    var n = (navigator.language||'').toLowerCase();
    if(n.startsWith('ca')) return 'ca';
    return 'es';
  }

  var L = {
    es: {
      title:'Evidencia relacionada', subtitle:'Europe PMC · NICE · OpenFDA',
      loading:'Buscando evidencia relacionada…',
      empty:'Sin resultados en las fuentes consultadas para este término.',
      fail:'No se ha podido consultar alguna fuente externa.',
      failSources:'Fuentes con error:', retry:'Reintentar',
      colEpmc:'Europe PMC', colNice:'NICE', colFda:'OpenFDA',
      noItemsSource:'Sin resultados en esta fuente.',
      noDrugs:'Sin fármacos editoriales definidos en esta ficha para buscar en OpenFDA.'
    },
    ca: {
      title:'Evidència relacionada', subtitle:'Europe PMC · NICE · OpenFDA',
      loading:'Cercant evidència relacionada…',
      empty:'Sense resultats a les fonts consultades per a aquest terme.',
      fail:'No s\'ha pogut consultar alguna font externa.',
      failSources:'Fonts amb error:', retry:'Reintenta-ho',
      colEpmc:'Europe PMC', colNice:'NICE', colFda:'OpenFDA',
      noItemsSource:'Sense resultats en aquesta font.',
      noDrugs:'Sense fàrmacs editorials definits en aquesta fitxa per cercar a OpenFDA.'
    }
  };
  function t(){ return L[detectLang()] || L.es; }

  function findDocByTitle(title){
    if(!title) return null;
    var docs = (window.DOCS||[]);
    return docs.find(function(d){ return d && d.title && d.title.trim() === title.trim(); }) || null;
  }

  function sectionHTML(){
    var LL = t();
    return '<article class="in54-section p32-section" data-in54-section="'+esc(LL.title)+'" data-p32="1">'
      + '<h3><span class="p32-em" data-p2a-icon="search">🔎</span>'+esc(LL.title)+' <span class="p32-subtitle">'+esc(LL.subtitle)+'</span></h3>'
      + '<div class="p32-body"><p class="p32-loading">'+esc(LL.loading)+'</p></div>'
      + '</article>';
  }

  function renderLoading(box){
    var LL = t();
    box.innerHTML = '<p class="p32-loading">'+esc(LL.loading)+'</p>';
  }

  function itemHTML(item){
    var meta = [item.year, item.journal, item.authors].filter(Boolean).map(esc).join(' · ');
    var body = item.detail ? '<p class="p32-item-detail">'+esc(item.detail)+'</p>' : '';
    var link = item.url
      ? '<a class="p32-item-link" href="'+esc(item.url)+'" target="_blank" rel="noopener">'+esc(item.title)+'</a>'
      : '<span class="p32-item-title-plain">'+esc(item.title)+'</span>';
    return '<li class="p32-item">'
      + link
      + (meta ? '<div class="p32-item-meta">'+meta+'</div>' : '')
      + body
      + '</li>';
  }

  function yearOf(item){
    var y = parseInt(String(item && item.year || '').replace(/\D/g,'').slice(0,4), 10);
    return isNaN(y) ? -1 : y;
  }
  // Más reciente primero: una guía de 2022 debe anteceder a la versión de
  // 2015 de la misma sociedad. Sort estable: a igualdad de año conserva el
  // orden de relevancia que ya trae la fuente.
  function sortByYearDesc(items){
    return items.slice().sort(function(a,b){ return yearOf(b) - yearOf(a); });
  }

  function columnHTML(key, label, result){
    var LL = t();
    var failed = !result || result.status < 200 || result.status >= 300;
    var items = sortByYearDesc((result && result.items) || []);
    var body;
    if(result && result.skipped){
      body = '<p class="p32-col-empty">'+esc(LL.noDrugs)+'</p>';
    } else if(failed){
      body = '<p class="p32-col-empty p32-col-fail">'+esc(result && result.error ? result.error : LL.fail)+'</p>';
    } else if(!items.length){
      body = '<p class="p32-col-empty">'+esc(LL.noItemsSource)+'</p>';
    } else {
      body = '<ul class="p32-list">'+items.map(itemHTML).join('')+'</ul>';
    }
    var isSkipped = !!(result && result.skipped);
    return '<div class="p32-col p32-col-'+key+'" data-p32-status="'+(isSkipped?'skipped':(failed?'fail':'ok'))+'">'
      + '<h4 class="p32-col-head">'+esc(label)+'</h4>'
      + body
      + '</div>';
  }

  function renderResult(box, data, query){
    var LL = t();
    var s = data.sources || {};
    var failedNames = [];
    [['europepmc', LL.colEpmc], ['nice', LL.colNice], ['openfda', LL.colFda]].forEach(function(pair){
      var r = s[pair[0]];
      if(!r || r.status < 200 || r.status >= 300) failedNames.push(pair[1]);
    });

    if(data.anyFailed){
      var html = '<div class="p32-state p32-state-fail">'
        + '<p class="p32-state-msg">'+esc(LL.fail)+'</p>'
        + (failedNames.length ? '<p class="p32-state-detail">'+esc(LL.failSources)+' '+esc(failedNames.join(', '))+'</p>' : '')
        + '<button type="button" class="p32-retry">'+esc(LL.retry)+'</button>'
        + '</div>';
      box.innerHTML = html;
      return;
    }
    if(!data.totalCount){
      box.innerHTML = '<p class="p32-state p32-state-empty">'+esc(LL.empty)+'</p>';
      return;
    }
    box.innerHTML = '<div class="p32-cols">'
      + columnHTML('epmc', LL.colEpmc, s.europepmc)
      + columnHTML('nice', LL.colNice, s.nice)
      + columnHTML('fda', LL.colFda, s.openfda)
      + '</div>';
  }

  function renderMock(data){
    var box = document.querySelector('#in54ProtocolContent .p32-body');
    if(!box) return;
    renderResult(box, data, data.query || '');
  }

  // Cada `.p32-body` es propio de LA FICHA que lo creó: al cambiar de ficha,
  // renderProtocol() reemplaza el innerHTML entero de #in54ProtocolContent
  // (ver p21-ficha-larga.js), así que este nodo queda huérfano y se descarta.
  // Aun así, si una petición tarda y el usuario ya navegó (o pulsó
  // Reintentar dos veces seguidas), la respuesta tardía NUNCA debe pintarse:
  // se compara un número de secuencia propio del nodo y se comprueba que
  // sigue enganchado al documento antes de escribir nada.
  function loadEvidence(box, query, drugs){
    var mySeq = (box._p32Seq || 0) + 1;
    box._p32Seq = mySeq;
    box.dataset.p32Query = query || '';
    box.dataset.p32Drugs = (drugs && drugs.length) ? drugs.join(',') : '';
    renderLoading(box);
    var url = '/api/evidencia-relacionada?q='+encodeURIComponent(query);
    if(drugs && drugs.length) url += '&drugs='+encodeURIComponent(drugs.join(','));
    function stale(){ return box._p32Seq !== mySeq || !document.body.contains(box); }
    fetch(url, { cache:'no-store' })
      .then(function(r){ return r.json().then(function(j){ return { ok:r.ok, body:j }; }); })
      .then(function(res){
        if(stale()) return;
        if(!res.ok) throw new Error(res.body && res.body.error || 'HTTP error');
        try{ console.log('[EvidenciaRelacionada] debug por fuente:', res.body.sources); }catch(e){}
        renderResult(box, res.body, query);
      })
      .catch(function(err){
        if(stale()) return;
        var LL = t();
        box.innerHTML = '<div class="p32-state p32-state-fail">'
          + '<p class="p32-state-msg">'+esc(LL.fail)+'</p>'
          + '<p class="p32-state-detail">'+esc(err.message||'')+'</p>'
          + '<button type="button" class="p32-retry">'+esc(LL.retry)+'</button>'
          + '</div>';
      });
  }

  function ensureP32(container){
    if(!container) return;
    if(container.dataset.p32 === '1') return;
    var titleEl = container.querySelector('.in54-proto-banner .in54-proto-meta h1');
    var title = (titleEl && titleEl.textContent || '').trim();
    var doc = findDocByTitle(title);
    if(!doc) return;
    var query = (doc.evidenceQuery && String(doc.evidenceQuery).trim()) || doc.title || title;
    if(!query) return;
    var drugs = Array.isArray(doc.evidenceDrugs) ? doc.evidenceDrugs.map(function(d){ return String(d).trim(); }).filter(Boolean) : [];

    var wrap = document.createElement('div');
    wrap.innerHTML = sectionHTML();
    var section = wrap.firstElementChild;
    container.appendChild(section);
    container.dataset.p32 = '1';

    if(window.EnferixIcons){
      section.querySelectorAll('[data-p2a-icon]').forEach(function(n){
        var name = n.getAttribute('data-p2a-icon');
        if(window.EnferixIcons.has(name)){ n.innerHTML = window.EnferixIcons.get(name); n.classList.add('enfx-ic-slot'); }
      });
    }

    var box = section.querySelector('.p32-body');
    loadEvidence(box, query, drugs);
  }

  document.addEventListener('click', function(ev){
    var btn = ev.target.closest('.p32-retry');
    if(!btn) return;
    var box = btn.closest('.p32-body');
    if(box) loadEvidence(box, box.dataset.p32Query || '', box.dataset.p32Drugs ? box.dataset.p32Drugs.split(',') : []);
  });

  function scan(){
    var container = document.getElementById('in54ProtocolContent');
    if(container) ensureP32(container);
  }

  var mo = null;
  var MO_OPTS = { childList: true, subtree: true };
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
              (n.querySelector && n.querySelector('.in54-proto-banner')))){
            var container = document.getElementById('in54ProtocolContent');
            if(container){ container.dataset.p32 = ''; }
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

  window.EnferixEvidenciaRelacionada = { _renderMock: renderMock };
})();
