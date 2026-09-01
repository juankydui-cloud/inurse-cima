/* P1.3 · Carné de evidencia (patrón AMBOSS) — cabecera del card
   Componente aislado: NO toca el monolito de fichas. Observa el DOM y
   añade una fila "carné" dentro de `.card-body-title` (siempre visible,
   sin necesidad de expandir el detalle) con:
     · Chip semántico (vigente / revisar / caducada) por año.
     · Fuente + año (link oficial si `reference_url`).
     · Sello GRADE (A/B/C) si `doc.evidence_level`.
     · "Revisado por X el Y" si `doc.revisor` + `doc.fecha_revision`.
     · "Próxima revisión: Y" si `doc.proxima_revision`.
   Si un campo falta, se omite (nunca inventa).
   i18n castellano/catalán según `document.documentElement.lang`,
   `localStorage.inurse_lang` o `navigator.language`.

   Onboarding "Por qué fiarte de Enferix" (una sola vez) al abrir la
   primera ficha.
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

  /* ── i18n ── */
  var LANG = { es: {
    vigente:'Vigente', revisar:'Por revisar', caducada:'Caducada', 'sin-fecha':'Sin fecha',
    evidencia:'Evidencia', revisadoPor:'Revisado por', el:'el', proxima:'Próxima revisión',
    onbTitle:'Por qué fiarte de Enferix',
    onbIntro:'Cada ficha lleva un <b>carné de evidencia</b> en su cabecera con datos que nunca se inventan:',
    onbVigenteHint:'fuente ≤ 2 años.', onbRevisarHint:'3-4 años; contrastar.', onbCaducadaHint:'> 4 años; verificar en fuente oficial.',
    onbGrade:'El sello <span class="p13-grade p13-grade-a">Evidencia A</span> / <span class="p13-grade p13-grade-b">B</span> / <span class="p13-grade p13-grade-c">C</span> refleja el nivel <b>GRADE</b> según la fuente.',
    onbHint:'Enferix es apoyo formativo; siempre prevalecen los protocolos de tu centro y el juicio profesional.',
    onbOk:'Entendido',
    stateHintVigente:'Fuente actualizada dentro de los últimos 2 años.',
    stateHintRevisar:'Fuente de hace 3-4 años; contrastar con documento vigente.',
    stateHintCaducada:'Fuente de hace más de 4 años; verificar en fuente oficial.',
    stateHintSinFecha:'Sin año detectable en la fuente.'
  }, ca: {
    vigente:'Vigent', revisar:'Per revisar', caducada:'Caducada', 'sin-fecha':'Sense data',
    evidencia:'Evidència', revisadoPor:'Revisat per', el:'el', proxima:'Propera revisió',
    onbTitle:'Per què fiar-te d\'Enferix',
    onbIntro:'Cada fitxa porta un <b>carnet d\'evidència</b> a la seva capçalera amb dades que mai s\'inventen:',
    onbVigenteHint:'font ≤ 2 anys.', onbRevisarHint:'3-4 anys; contrastar.', onbCaducadaHint:'> 4 anys; verificar a la font oficial.',
    onbGrade:'El segell <span class="p13-grade p13-grade-a">Evidència A</span> / <span class="p13-grade p13-grade-b">B</span> / <span class="p13-grade p13-grade-c">C</span> reflecteix el nivell <b>GRADE</b> segons la font.',
    onbHint:'Enferix és suport formatiu; sempre prevalen els protocols del teu centre i el criteri professional.',
    onbOk:'Entès',
    stateHintVigente:'Font actualitzada dins dels darrers 2 anys.',
    stateHintRevisar:'Font de fa 3-4 anys; contrastar amb document vigent.',
    stateHintCaducada:'Font de fa més de 4 anys; verificar a la font oficial.',
    stateHintSinFecha:'Sense any detectable a la font.'
  }};
  function detectLang(){
    var htmlLang = (document.documentElement.lang||'').toLowerCase();
    if(htmlLang.startsWith('ca')) return 'ca';
    if(htmlLang.startsWith('es')) return 'es';
    var stored = '';
    try{ stored = (localStorage.getItem('inurse_lang')||'').toLowerCase(); }catch(e){}
    if(stored.startsWith('ca')) return 'ca';
    if(stored.startsWith('es')) return 'es';
    var nav = (navigator.language||'').toLowerCase();
    if(nav.startsWith('ca')) return 'ca';
    return 'es';
  }
  function t(){ return LANG[detectLang()] || LANG.es; }

  function findDoc(id){
    if(!id) return null;
    var docs = (window.DOCS && Array.isArray(window.DOCS)) ? window.DOCS : [];
    return docs.find(function(d){ return d && d.id === id; }) || null;
  }

  function stateChipHTML(st, y, L){
    var stateHintKey = 'stateHint' + st.charAt(0).toUpperCase() + st.slice(1).replace('-fecha','SinFecha').replace('-fech','SinFecha');
    /* mapa simple para evitar problemas con 'sin-fecha' */
    var hintMap = {
      'vigente':L.stateHintVigente, 'revisar':L.stateHintRevisar,
      'caducada':L.stateHintCaducada, 'sin-fecha':L.stateHintSinFecha
    };
    var hint = hintMap[st] || '';
    var label = L[st] || st;
    var yearBit = y ? ' · ' + y : '';
    return '<span class="p13-state p13-state-'+esc(st)+'" title="'+esc(hint)+'">'
      +   '<span class="p13-dot"></span>'
      +   esc(label + yearBit)
      + '</span>';
  }
  function gradeHTML(letter, L){
    if(!letter) return '';
    var l = String(letter).toUpperCase();
    if(l !== 'A' && l !== 'B' && l !== 'C') return '';
    return '<span class="p13-grade p13-grade-'+esc(l.toLowerCase())+'" title="'+esc(L.evidencia)+' GRADE '+esc(l)+'">'+esc(L.evidencia)+' '+esc(l)+'</span>';
  }
  function sourceHTML(doc){
    if(!doc.source) return '';
    if(doc.reference_url){
      return '<a class="p13-source p13-source-link" href="'+esc(doc.reference_url)+'" target="_blank" rel="noopener" onclick="event.stopPropagation()">'
        + esc(doc.source) + ' <span aria-hidden="true">↗</span></a>';
    }
    return '<span class="p13-source">'+esc(doc.source)+'</span>';
  }
  function reviewedHTML(doc, L){
    /* Solo si tiene revisor Y fecha_revision. Fecha se muestra tal cual (string libre). */
    if(!doc.revisor || !doc.fecha_revision) return '';
    return '<span class="p13-reviewed">'+esc(L.revisadoPor)+' <b>'+esc(doc.revisor)+'</b> '+esc(L.el)+' '+esc(doc.fecha_revision)+'</span>';
  }
  function nextReviewHTML(doc, L){
    if(!doc.proxima_revision) return '';
    return '<span class="p13-next">'+esc(L.proxima)+': '+esc(doc.proxima_revision)+'</span>';
  }

  function carneHTML(doc){
    var L = t();
    var y = docYear(doc);
    var st = docState(doc, y);
    var parts1 = [stateChipHTML(st, y, L), gradeHTML(doc.evidence_level, L)].filter(Boolean).join('');
    var srcBit = sourceHTML(doc);
    var revBit = reviewedHTML(doc, L);
    var nxtBit = nextReviewHTML(doc, L);
    var parts2 = [srcBit, revBit, nxtBit].filter(Boolean).join('<span class="p13-sep"> · </span>');
    var html = '<div class="p13-carne" data-p13-carne="1">';
    html += '<div class="p13-row1">'+parts1+'</div>';
    if(parts2) html += '<div class="p13-row2">'+parts2+'</div>';
    html += '</div>';
    return html;
  }

  function ensureCarneOldCard(card){
    if(!card) return;
    var id = card.id ? card.id.replace(/^card-/, '') : '';
    if(!id) return;
    var host = card.querySelector('.card-head .card-body-title');
    if(!host) return;
    if(host.querySelector(':scope > .p13-carne')) return;   // ya inyectado
    var doc = findDoc(id);
    if(!doc) return;
    host.insertAdjacentHTML('beforeend', carneHTML(doc));
    var oldBadges = card.querySelector('.detail-inner > .reliability-badges');
    if(oldBadges){ oldBadges.classList.add('p13-hidden'); }
    if(card.classList.contains('open')) maybeOnboarding();
  }

  /* Vista moderna «Clean redesign v54»: renderProtocol(d) mete el HTML en
     `#in54ProtocolContent` con un banner `.in54-proto-banner` que contiene
     `.in54-proto-icon` + `.in54-proto-meta > h1 + p`. Aquí inyectamos el
     carné al final de `.in54-proto-meta`, dentro del mismo card visual. */
  function ensureCarneIn54(banner){
    if(!banner) return;
    var meta = banner.querySelector('.in54-proto-meta');
    if(!meta) return;
    if(meta.querySelector(':scope > .p13-carne')) return;
    var title = (meta.querySelector('h1') && meta.querySelector('h1').textContent || '').trim();
    if(!title) return;
    var doc = (window.DOCS||[]).find(function(d){ return d && d.title && d.title.trim() === title; });
    if(!doc){
      /* fallback: buscar por texto de la fuente en algún hijo cercano */
      var src = (meta.querySelector('p') && meta.querySelector('p').textContent || '').trim();
      doc = (window.DOCS||[]).find(function(d){ return d && ((d.summary && src && d.summary.indexOf(src.slice(0,40))>=0)); });
    }
    if(!doc) return;
    meta.insertAdjacentHTML('beforeend', carneHTML(doc));
    maybeOnboarding();
  }

  function scan(root){
    var r = root || document;
    r.querySelectorAll('.card[id^="card-"]').forEach(ensureCarneOldCard);
    r.querySelectorAll('.in54-proto-banner').forEach(ensureCarneIn54);
  }

  /* ── Onboarding ── */
  function maybeOnboarding(){
    try{
      if(localStorage.getItem(ONB_KEY) === '1') return;
    }catch(e){ return; }
    if(document.getElementById('p13OnbOverlay')) return;
    var L = t();
    var ov = document.createElement('div');
    ov.className = 'p13-onb-overlay';
    ov.id = 'p13OnbOverlay';
    ov.innerHTML =
      '<div class="p13-onb-panel" role="dialog" aria-modal="true" aria-labelledby="p13OnbTitle">'
      + '<div class="p13-onb-head">'
      +   '<span class="p13-onb-em">🛡️</span>'
      +   '<h2 id="p13OnbTitle">'+esc(L.onbTitle)+'</h2>'
      + '</div>'
      + '<div class="p13-onb-body">'
      +   '<p>'+L.onbIntro+'</p>'
      +   '<ul>'
      +     '<li><span class="p13-state p13-state-vigente"><span class="p13-dot"></span>'+esc(L.vigente)+'</span> · '+esc(L.onbVigenteHint)+'</li>'
      +     '<li><span class="p13-state p13-state-revisar"><span class="p13-dot"></span>'+esc(L.revisar)+'</span> · '+esc(L.onbRevisarHint)+'</li>'
      +     '<li><span class="p13-state p13-state-caducada"><span class="p13-dot"></span>'+esc(L.caducada)+'</span> · '+esc(L.onbCaducadaHint)+'</li>'
      +   '</ul>'
      +   '<p>'+L.onbGrade+'</p>'
      +   '<p class="p13-onb-hint">'+esc(L.onbHint)+'</p>'
      + '</div>'
      + '<div class="p13-onb-actions">'
      +   '<button type="button" class="p13-onb-btn" id="p13OnbOk">'+esc(L.onbOk)+'</button>'
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

  /* ── Observer con disconnect durante mutaciones propias ── */
  var mo = null;
  var MO_OPTS = { childList: true, subtree: true };
  function safeScan(root){
    if(mo){ try{ mo.disconnect(); }catch(e){} }
    scan(root || document);
    if(mo){ try{ mo.observe(document.body, MO_OPTS); }catch(e){} }
  }

  function boot(){
    safeScan(document);
    mo = new MutationObserver(function(muts){
      /* Escanea sólo si aparecen `.card` nuevas o el banner de la vista
         moderna in54. */
      var relevant = false;
      for(var i=0;i<muts.length && !relevant;i++){
        var m = muts[i];
        if(m.type !== 'childList') continue;
        for(var j=0;j<m.addedNodes.length;j++){
          var n = m.addedNodes[j];
          if(n.nodeType !== 1) continue;
          if(n.classList && (
              n.classList.contains('card') ||
              n.classList.contains('in54-proto-banner') ||
              (n.querySelector && (n.querySelector('.card') || n.querySelector('.in54-proto-banner')))
          )){
            relevant = true; break;
          }
        }
      }
      if(relevant) safeScan(document);
    });
    try{ mo.observe(document.body, MO_OPTS); }catch(e){}
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
