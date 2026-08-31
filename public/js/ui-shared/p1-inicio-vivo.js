/* P1.1 · Inicio "vivo"
   Componente aislado que se apoya en el home actual (`.nx-wrap`) sin tocarlo.
   Lee `window.DOCS` (cargado por /data/guias.js) y muestra tres cosas:
     · "Actualizado recientemente"  → fichas con año más reciente en `source`.
     · "Requieren atención"         → fichas cuyo año detectado ya lleva
                                      demasiado tiempo (heurística por año).
     · Timestamp global             → última fecha detectada en el corpus.
   Fuente única de verdad: `source` de cada ficha + el mapa `SOURCE_EVIDENCE`
   que ya vive en /data/guias.js. No se inventa contenido nuevo.
*/
(function(){
  'use strict';
  var CURRENT_YEAR = new Date().getFullYear();
  /* Umbrales conservadores en años. Ajustar aquí si cambia la política. */
  var THRESHOLDS = { vigente: 2, revisar: 4 };   // años desde publicación

  function docYear(doc){
    if(!doc || typeof doc.last_updated !== 'string' && typeof doc.last_updated !== 'number'){
      /* extrae 4 dígitos de `source` como fallback */
      var m = String(doc && doc.source || '').match(/(19|20)\d{2}/);
      return m ? parseInt(m[0], 10) : null;
    }
    var n = parseInt(String(doc.last_updated).slice(0,4), 10);
    return isNaN(n) ? null : n;
  }
  function docState(y){
    if(!y) return 'sin-fecha';
    var age = CURRENT_YEAR - y;
    if(age <= THRESHOLDS.vigente) return 'vigente';
    if(age <= THRESHOLDS.revisar) return 'revisar';
    return 'caducada';
  }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  }); }

  var STATE_LABEL = {
    'vigente':   'Vigente',
    'revisar':   'Revisar',
    'caducada':  'Caducada',
    'sin-fecha': 'Sin fecha'
  };
  var CAT_LABEL = {
    'cardio':'Cardio', 'respi':'Resp', 'neuro':'Neuro', 'digest':'Digest',
    'nefro':'Nefro',   'endocrino':'Endo', 'infec':'Infec', 'onco':'Onco',
    'psi':'Psic',      'uci':'UCI',     'urgen':'Urg',   'gine':'Gine',
    'ped':'Pedia',     'ger':'Geria',   'trauma':'Trauma','farma':'Farma',
    'quir':'Quir',     'derma':'Derma', 'oftalm':'Oftal','otorrino':'ORL',
    'reuma':'Reuma',   'imagen':'Img'
  };

  function buildIndex(){
    var docs = (window.DOCS && Array.isArray(window.DOCS)) ? window.DOCS : [];
    var rows = [];
    var latest = null;
    for(var i=0;i<docs.length;i++){
      var d = docs[i];
      if(!d || !d.id || !d.title) continue;
      var y = docYear(d);
      if(y && (latest===null || y>latest)) latest = y;
      rows.push({
        id: d.id, title: d.title, cat: d.cat || '', source: d.source || '',
        year: y, state: docState(y), grade: d.evidence_level || ''
      });
    }
    /* recientes: por año desc, ficha aleatoria estable por título */
    var recientes = rows.filter(function(r){ return r.year; })
      .sort(function(a,b){
        if(b.year !== a.year) return b.year - a.year;
        return a.title.localeCompare(b.title, 'es');
      }).slice(0, 6);
    /* atención: caducadas primero, luego revisar; sin fecha al final si
       queda hueco. Máx 5. */
    var caducadas = rows.filter(function(r){ return r.state==='caducada'; });
    var revisar   = rows.filter(function(r){ return r.state==='revisar'; });
    var sinFecha  = rows.filter(function(r){ return r.state==='sin-fecha'; });
    var atencion  = caducadas.concat(revisar).concat(sinFecha).slice(0, 5);
    return { total: rows.length, latest: latest, recientes: recientes, atencion: atencion };
  }

  function chip(state, year){
    var lab = STATE_LABEL[state] || state;
    var suffix = year ? ' · ' + year : '';
    return '<span class="p1v-chip p1v-'+esc(state)+'">'+esc(lab)+esc(suffix)+'</span>';
  }
  function catBadge(cat){
    if(!cat) return '';
    var lab = CAT_LABEL[cat] || cat;
    return '<span class="p1v-cat">'+esc(lab)+'</span>';
  }
  function cardHTML(r){
    return '<button type="button" class="p1v-card" data-doc="'+esc(r.id)+'">'
      +   '<span class="p1v-card-top">'+catBadge(r.cat)+chip(r.state, r.year)+'</span>'
      +   '<span class="p1v-card-title">'+esc(r.title)+'</span>'
      +   '<span class="p1v-card-src">'+esc(r.source)+'</span>'
      + '</button>';
  }
  function attentionHTML(list){
    if(!list.length){
      return '<div class="p1v-empty">Sin fichas que requieran atención.</div>';
    }
    return list.map(function(r){
      return '<button type="button" class="p1v-att" data-doc="'+esc(r.id)+'">'
        + '<span class="p1v-att-title">'+esc(r.title)+'</span>'
        + '<span class="p1v-att-meta">'+esc(r.source||'')+' · '+chip(r.state,r.year)+'</span>'
        + '</button>';
    }).join('');
  }
  function sectionHTML(idx){
    var d = idx.latest ? String(idx.latest) : '—';
    return '<section class="p1v-wrap" aria-labelledby="p1vHead">'
      +   '<header class="p1v-head">'
      +     '<div>'
      +       '<h2 id="p1vHead">Actualizado recientemente</h2>'
      +       '<p class="p1v-sub">'+idx.total+' fichas · fuente más reciente: <b>'+esc(d)+'</b></p>'
      +     '</div>'
      +     '<time class="p1v-time" datetime="'+esc(new Date().toISOString().slice(0,10))+'">'
      +       'Sincronizado el '+esc(new Date().toLocaleDateString('es-ES',{year:'numeric',month:'long',day:'numeric'}))
      +     '</time>'
      +   '</header>'
      +   '<div class="p1v-grid">'+idx.recientes.map(cardHTML).join('')+'</div>'
      +   '<details class="p1v-att-wrap"'+(idx.atencion.length?' open':'')+'>'
      +     '<summary><span class="p1v-att-dot"></span>Requieren atención <span class="p1v-att-count">'+idx.atencion.length+'</span></summary>'
      +     '<div class="p1v-att-list">'+attentionHTML(idx.atencion)+'</div>'
      +   '</details>'
      + '</section>';
  }

  function tryOpenDoc(id){
    if(typeof window.openDoc === 'function'){ try{ window.openDoc(id); return; }catch(e){} }
    /* fallback: dispatch al buscador global */
    var q = (window.DOCS||[]).find(function(d){ return d && d.id===id; });
    if(q && typeof window.showGlobalResults === 'function'){ window.showGlobalResults(q.title); return; }
    /* último recurso: input principal si existe */
    var real = document.getElementById('search');
    if(real && q){ real.value = q.title; real.dispatchEvent(new Event('input',{bubbles:true})); }
  }

  function mount(wrap){
    if(!wrap || wrap.dataset.p1vMounted === '1') return;
    var docs = (window.DOCS && Array.isArray(window.DOCS)) ? window.DOCS : null;
    if(!docs) return;
    var pharma = wrap.querySelector('.nx-pharma');
    var hero   = wrap.querySelector('.nx-hero');
    if(!pharma && !hero) return;   /* home aún no está listo */
    var host = document.createElement('div');
    host.className = 'p1v-host';
    host.innerHTML = sectionHTML(buildIndex());
    var anchor = pharma || hero.nextSibling;
    if(pharma){ wrap.insertBefore(host, pharma); }
    else{ hero.parentNode.insertBefore(host, hero.nextSibling); }
    wrap.dataset.p1vMounted = '1';
    host.addEventListener('click', function(e){
      var btn = e.target.closest('[data-doc]');
      if(!btn) return;
      tryOpenDoc(btn.getAttribute('data-doc'));
    });
  }

  function boot(){
    /* observa el body hasta que aparezca .nx-wrap (el home se inyecta tarde). */
    var tries = 0;
    var timer = setInterval(function(){
      var wrap = document.querySelector('.nx-wrap');
      if(wrap){ mount(wrap); clearInterval(timer); return; }
      if(++tries > 60) clearInterval(timer);   /* ~30s de gracia */
    }, 500);
    /* Además: si el home se re-inyecta al volver desde otra vista, re-montar. */
    var mo = new MutationObserver(function(){
      var wrap = document.querySelector('.nx-wrap');
      if(wrap && wrap.dataset.p1vMounted !== '1') mount(wrap);
    });
    try{ mo.observe(document.body, {childList:true, subtree:true}); }catch(e){}
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
