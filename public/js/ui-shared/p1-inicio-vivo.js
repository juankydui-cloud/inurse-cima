/* P1.1 · Panel "Novedades"
   Componente aislado: NO toca la pantalla principal. Registra un overlay
   propio con dos bloques ("Actualizado recientemente" + "Requieren
   atención") y una entrada nueva en `window.INURSE_SECTIONS` para que sea
   accesible desde el menú "Inicio" y el buscador global.

   Fuente de verdad: `window.DOCS` (cargado por /data/guias.js) + año
   detectado en `source`. No inventa contenido.
   Excepción de estado: las fichas cuyo `source` contiene "INGESA" cuentan
   como `vigente` sin importar el año — respeta la instrucción de no
   marcar caducadas las referencias institucionales aún vigentes.
*/
(function(){
  'use strict';
  var CURRENT_YEAR = new Date().getFullYear();
  var THRESHOLDS = { vigente: 2, revisar: 4 };   // años desde publicación

  function isInstitutionalVigente(src){
    return /INGESA/i.test(String(src||''));
  }
  function docYear(doc){
    if(!doc) return null;
    if(doc.last_updated){
      var n = parseInt(String(doc.last_updated).slice(0,4), 10);
      if(!isNaN(n)) return n;
    }
    var m = String(doc.source || '').match(/(19|20)\d{2}/);
    return m ? parseInt(m[0], 10) : null;
  }
  function docState(doc, y){
    if(isInstitutionalVigente(doc && doc.source)) return 'vigente';
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
        year: y, state: docState(d, y), grade: d.evidence_level || ''
      });
    }
    var recientes = rows.filter(function(r){ return r.year; })
      .sort(function(a,b){
        if(b.year !== a.year) return b.year - a.year;
        return a.title.localeCompare(b.title, 'es');
      }).slice(0, 12);
    var caducadas = rows.filter(function(r){ return r.state==='caducada'; });
    var revisar   = rows.filter(function(r){ return r.state==='revisar'; });
    var sinFecha  = rows.filter(function(r){ return r.state==='sin-fecha'; });
    var atencion  = caducadas.concat(revisar).concat(sinFecha).slice(0, 12);
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

  function overlayHTML(idx){
    var d = idx.latest ? String(idx.latest) : '—';
    return '<div class="p1v-overlay-panel" role="dialog" aria-modal="true" aria-label="Novedades">'
      +   '<header class="p1v-ohead">'
      +     '<div>'
      +       '<h2>🆕 Novedades</h2>'
      +       '<p class="p1v-osub">'+idx.total+' fichas · fuente más reciente: <b>'+esc(d)+'</b> · sincronizado el '+esc(new Date().toLocaleDateString('es-ES',{year:'numeric',month:'long',day:'numeric'}))+'</p>'
      +     '</div>'
      +     '<button type="button" class="p1v-close" id="p1vClose" aria-label="Cerrar">✕</button>'
      +   '</header>'
      +   '<div class="p1v-obody">'
      +     '<section class="p1v-block">'
      +       '<h3 class="p1v-block-title"><span class="p1v-dot p1v-dot-ok"></span>Actualizado recientemente <span class="p1v-count">'+idx.recientes.length+'</span></h3>'
      +       '<div class="p1v-grid">'+idx.recientes.map(cardHTML).join('')+'</div>'
      +     '</section>'
      +     '<section class="p1v-block">'
      +       '<h3 class="p1v-block-title"><span class="p1v-dot p1v-dot-warn"></span>Requieren atención <span class="p1v-count">'+idx.atencion.length+'</span></h3>'
      +       '<div class="p1v-att-list">'+attentionHTML(idx.atencion)+'</div>'
      +     '</section>'
      +   '</div>'
      + '</div>';
  }

  function tryOpenDoc(id){
    closeOverlay();
    if(typeof window.openDoc === 'function'){ try{ window.openDoc(id); return; }catch(e){} }
    var q = (window.DOCS||[]).find(function(d){ return d && d.id===id; });
    if(q && typeof window.showGlobalResults === 'function'){ window.showGlobalResults(q.title); return; }
    var real = document.getElementById('search');
    if(real && q){ real.value = q.title; real.dispatchEvent(new Event('input',{bubbles:true})); }
  }

  var _overlay = null;
  function closeOverlay(){
    if(_overlay && _overlay.parentNode){ _overlay.parentNode.removeChild(_overlay); }
    _overlay = null;
    document.removeEventListener('keydown', onEsc);
  }
  function onEsc(e){ if(e.key === 'Escape') closeOverlay(); }
  function openOverlay(){
    closeOverlay();
    _overlay = document.createElement('div');
    _overlay.className = 'p1v-overlay';
    _overlay.innerHTML = overlayHTML(buildIndex());
    document.body.appendChild(_overlay);
    document.addEventListener('keydown', onEsc);
    _overlay.addEventListener('click', function(e){
      if(e.target === _overlay){ closeOverlay(); return; }
      if(e.target.closest('#p1vClose')){ closeOverlay(); return; }
      var btn = e.target.closest('[data-doc]');
      if(btn) tryOpenDoc(btn.getAttribute('data-doc'));
    });
  }
  window.EnferixNovedades = { open: openOverlay, close: closeOverlay };

  /* Registrar en el catálogo de secciones para que aparezca en el menú
     "Inicio" y en el buscador global, sin tocar el monolito. */
  function registerSection(){
    if(!window.INURSE_SECTIONS){ window.INURSE_SECTIONS = []; }
    var already = window.INURSE_SECTIONS.some(function(s){ return s && s.id === 'novedades'; });
    if(!already){
      window.INURSE_SECTIONS.push({
        id:'novedades',
        t:'Novedades',
        em:'🆕',
        kw:'novedades actualizaciones fichas recientes atencion revisar caducadas cambios ultimos'
      });
    }
    /* Enrutar 'novedades' a través de EnferixOpenSection sin romper los
       otros casos del switch original. */
    var orig = window.EnferixOpenSection;
    if(orig && !orig.__p1vWrapped){
      var wrapped = function(id){
        if(id === 'novedades'){ openOverlay(); return; }
        return orig.apply(this, arguments);
      };
      wrapped.__p1vWrapped = true;
      window.EnferixOpenSection = wrapped;
    }
  }

  function boot(){
    /* El monolito define INURSE_SECTIONS y EnferixOpenSection dentro de un
       IIFE que corre inmediatamente al cargarse su <script>. Nosotros
       cargamos con `defer`, así que ya están disponibles — pero
       reintentamos por si aún no ha corrido. */
    var tries = 0;
    var t = setInterval(function(){
      if(window.INURSE_SECTIONS && window.EnferixOpenSection){
        registerSection();
        clearInterval(t);
        return;
      }
      if(++tries > 40) clearInterval(t);
    }, 250);
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
