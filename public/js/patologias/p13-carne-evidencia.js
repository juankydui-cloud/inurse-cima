/* P1.3 · Carné de evidencia (patrón AMBOSS)
   Componente aislado: NO toca el monolito de fichas. Observa el DOM y
   añade una cabecera "carné" al abrir cualquier `.card` (ficha clínica):
     · Chip de estado semántico (vigente / revisar / caducada) por año.
     · Fuente completa + link oficial si existe.
     · Sello GRADE (A/B/C) tomado de `doc.evidence_level`.
     · Fecha (`doc.last_updated`).
   NO inventa contenido: si un dato falta, se omite. Sin campo `revisor`
   por decisión del usuario (opción A del plan).

   Onboarding: la primera vez que se abre una ficha muestra una tarjeta
   "Por qué fiarte de Enferix" que explica los estados y las fuentes.
   Se descarta con "Entendido" y se persiste en localStorage.
*/
(function(){
  'use strict';
  var CURRENT_YEAR = new Date().getFullYear();
  var THRESHOLDS = { vigente: 2, revisar: 4 };
  var ONB_KEY = 'inurse_p13_onboarding_v1';

  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  }); }
  function isInstitutionalVigente(src){ return /INGESA/i.test(String(src||'')); }
  function docYear(doc){
    if(!doc) return null;
    if(doc.last_updated){
      var n = parseInt(String(doc.last_updated).slice(0,4), 10);
      if(!isNaN(n)) return n;
    }
    var m = String(doc.source||'').match(/(19|20)\d{2}/);
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
  var STATE_LABEL = {
    'vigente':   'Vigente',
    'revisar':   'Revisar',
    'caducada':  'Caducada',
    'sin-fecha': 'Sin fecha'
  };
  var STATE_HINT = {
    'vigente':   'Fuente actualizada dentro de los últimos 2 años.',
    'revisar':   'Fuente de hace 3-4 años; contrastar con documento vigente.',
    'caducada':  'Fuente de hace más de 4 años; verificar en fuente oficial.',
    'sin-fecha': 'Sin año detectable en la fuente.'
  };

  function findDoc(id){
    if(!id) return null;
    var docs = (window.DOCS && Array.isArray(window.DOCS)) ? window.DOCS : [];
    return docs.find(function(d){ return d && d.id === id; }) || null;
  }

  function grade(letter){
    if(!letter) return '';
    var l = String(letter).toUpperCase();
    if(l !== 'A' && l !== 'B' && l !== 'C') return '';
    return '<span class="p13-grade p13-grade-'+esc(l.toLowerCase())+'" title="Nivel de evidencia GRADE">Evidencia '+esc(l)+'</span>';
  }

  function carneHTML(doc){
    var y = docYear(doc);
    var st = docState(doc, y);
    var stateChip =
      '<span class="p13-state p13-state-'+esc(st)+'" title="'+esc(STATE_HINT[st]||'')+'">'
      +  '<span class="p13-dot"></span>'
      +  esc(STATE_LABEL[st] || st)
      + '</span>';
    var yearBit  = y ? '<span class="p13-year">'+esc(String(y))+'</span>' : '';
    var srcBit   = doc.source
      ? (doc.reference_url
          ? '<a class="p13-source p13-source-link" href="'+esc(doc.reference_url)+'" target="_blank" rel="noopener" onclick="event.stopPropagation()">'+esc(doc.source)+' <span aria-hidden="true">↗</span></a>'
          : '<span class="p13-source">'+esc(doc.source)+'</span>')
      : '';
    return '<div class="p13-carne" data-p13-carne="1">'
      +   '<div class="p13-row1">'+ stateChip + yearBit + grade(doc.evidence_level) +'</div>'
      +   (srcBit ? '<div class="p13-row2">'+ srcBit +'</div>' : '')
      + '</div>';
  }

  function ensureCarne(card){
    if(!card) return;
    var id = card.id ? card.id.replace(/^card-/, '') : '';
    if(!id) return;
    var inner = card.querySelector('.detail .detail-inner');
    if(!inner) return;
    if(inner.querySelector(':scope > .p13-carne')) return;   // ya inyectado
    var doc = findDoc(id);
    if(!doc) return;
    inner.insertAdjacentHTML('afterbegin', carneHTML(doc));
    /* Ocultar el mini `reliability-badges` original porque el carné
       muestra el mismo dato con mejor jerarquía visual. */
    var oldBadges = inner.querySelector(':scope > .reliability-badges');
    if(oldBadges){ oldBadges.classList.add('p13-hidden'); }
    /* Cuando la card se abre, la altura del `.detail` se calcula en JS del
       monolito con `scrollHeight`. Como hemos añadido el carné DESPUÉS de
       ese cálculo, hay que corregir la altura para que no queden clips. */
    var detail = card.querySelector('.detail');
    if(detail && card.classList.contains('open')){
      requestAnimationFrame(function(){
        try{ detail.style.maxHeight = (inner.scrollHeight + 40) + 'px'; }catch(e){}
      });
    }
    /* Onboarding solo la primera vez que se abre una ficha. */
    maybeOnboarding();
  }

  function scan(root){
    var cards = (root || document).querySelectorAll('.card.open');
    cards.forEach(ensureCarne);
  }

  /* ── Onboarding "Por qué fiarte de Enferix" ── */
  function maybeOnboarding(){
    try{
      if(localStorage.getItem(ONB_KEY) === '1') return;
    }catch(e){ return; }
    if(document.getElementById('p13OnbOverlay')) return;
    var ov = document.createElement('div');
    ov.className = 'p13-onb-overlay';
    ov.id = 'p13OnbOverlay';
    ov.innerHTML =
      '<div class="p13-onb-panel" role="dialog" aria-modal="true" aria-labelledby="p13OnbTitle">'
      + '<div class="p13-onb-head">'
      +   '<span class="p13-onb-em">🛡️</span>'
      +   '<h2 id="p13OnbTitle">Por qué fiarte de Enferix</h2>'
      + '</div>'
      + '<div class="p13-onb-body">'
      +   '<p>Cada ficha lleva un <b>carné de evidencia</b> arriba con tres datos que nunca se inventan:</p>'
      +   '<ul>'
      +     '<li><span class="p13-state p13-state-vigente"><span class="p13-dot"></span>Vigente</span> · fuente ≤ 2 años.</li>'
      +     '<li><span class="p13-state p13-state-revisar"><span class="p13-dot"></span>Revisar</span> · 3-4 años; contrastar.</li>'
      +     '<li><span class="p13-state p13-state-caducada"><span class="p13-dot"></span>Caducada</span> · &gt; 4 años; verificar en fuente oficial.</li>'
      +   '</ul>'
      +   '<p>El sello <span class="p13-grade p13-grade-a">Evidencia A</span> / <span class="p13-grade p13-grade-b">B</span> / <span class="p13-grade p13-grade-c">C</span> refleja el nivel <b>GRADE</b> según la fuente (guía oficial, algoritmo, protocolo local).</p>'
      +   '<p class="p13-onb-hint">Enferix es apoyo formativo; siempre prevalecen los protocolos de tu centro y el juicio profesional.</p>'
      + '</div>'
      + '<div class="p13-onb-actions">'
      +   '<button type="button" class="p13-onb-btn" id="p13OnbOk">Entendido</button>'
      + '</div>'
      + '</div>';
    document.body.appendChild(ov);
    var close = function(){
      try{ localStorage.setItem(ONB_KEY, '1'); }catch(e){}
      if(ov.parentNode) ov.parentNode.removeChild(ov);
    };
    ov.addEventListener('click', function(e){ if(e.target === ov) close(); });
    var ok = ov.querySelector('#p13OnbOk');
    if(ok) ok.addEventListener('click', close);
  }

  function boot(){
    scan(document);
    var mo = new MutationObserver(function(muts){
      var touched = false;
      muts.forEach(function(m){
        if(m.type === 'attributes' && m.target && m.target.classList && m.target.classList.contains('card')){
          if(m.target.classList.contains('open')) ensureCarne(m.target);
          touched = true;
        }
        if(m.type === 'childList'){
          m.addedNodes.forEach(function(n){
            if(n.nodeType !== 1) return;
            if(n.classList && n.classList.contains('card') && n.classList.contains('open')) ensureCarne(n);
            n.querySelectorAll && n.querySelectorAll('.card.open').forEach(ensureCarne);
          });
          touched = true;
        }
      });
      if(touched) scan(document);
    });
    try{
      mo.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:['class'] });
    }catch(e){}
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
