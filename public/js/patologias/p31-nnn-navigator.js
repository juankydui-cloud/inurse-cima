/* P3.1 · Navegador NANDA-NOC-NIC (Prioridad 3)
   Overlay full-screen con tres columnas enlazadas en escritorio y tres
   pasos secuenciales con migas de pan en móvil.

   Regla férrea: SOLO se muestran los términos y vínculos presentes en
   `nnn_codes.json` con Estado=Verificado. Nada se infiere ni completa.
   Los términos pendientes se listan aparte con etiqueta "Pendiente" y
   no son navegables (la relación 3-a-3 aún no está confirmada).

   Datos: se cargan de `/api/terminology/dictionary` (fallback: sin datos
   → panel vacío con aviso).
*/
(function(){
  'use strict';

  var STATE = { dict:null, selectedKey:null, mobileStep:0, mobileMaxReached:0, filter:'' };
  var CACHE = null;

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
      title:'Navegador NANDA · NOC · NIC',
      subtitle:'Diagnósticos, resultados e intervenciones enfermeras enlazados',
      search:'Buscar diagnóstico por etiqueta o código…',
      colDx:'Diagnóstico (NANDA)', colNoc:'Resultado (NOC)', colNic:'Intervención (NIC)',
      pickDx:'Selecciona un diagnóstico', pickNoc:'Selecciona el diagnóstico para ver su NOC',
      pickNic:'Selecciona el NOC para ver sus NIC',
      verified:'Verificado', pending:'Pendiente', unverified:'Sin verificar',
      source:'Fuente', reviewed:'Revisado por', on:'el',
      pendingHead:'Pendientes de verificar', pendingHelp:'Vínculos aún no confirmados en NNNConsult. No se muestran para evitar inventar relaciones.',
      empty:'No hay diagnósticos que coincidan con la búsqueda.',
      loading:'Cargando diccionario NNN…',
      noData:'Diccionario NNN no disponible.',
      close:'Cerrar', back:'Atrás', code:'Código',
      breadcrumbsHome:'Diagnósticos',
      esOnly:'etiqueta disponible sólo en castellano'
    },
    ca: {
      title:'Navegador NANDA · NOC · NIC',
      subtitle:'Diagnòstics, resultats i intervencions infermeres enllaçats',
      search:'Cerca diagnòstic per etiqueta o codi…',
      colDx:'Diagnòstic (NANDA)', colNoc:'Resultat (NOC)', colNic:'Intervenció (NIC)',
      pickDx:'Selecciona un diagnòstic', pickNoc:'Selecciona el diagnòstic per veure el NOC',
      pickNic:'Selecciona el NOC per veure les seves NIC',
      verified:'Verificat', pending:'Pendent', unverified:'Sense verificar',
      source:'Font', reviewed:'Revisat per', on:'el',
      pendingHead:'Pendents de verificar', pendingHelp:'Vincles encara no confirmats a NNNConsult. No es mostren per evitar inventar relacions.',
      empty:'No hi ha diagnòstics que coincideixin amb la cerca.',
      loading:'Carregant diccionari NNN…',
      noData:'Diccionari NNN no disponible.',
      close:'Tancar', back:'Enrere', code:'Codi',
      breadcrumbsHome:'Diagnòstics',
      esOnly:'etiqueta disponible només en castellà'
    }
  };
  /* Devuelve la etiqueta original del campo y, si estamos en catalán y no
     hay `label_ca` en la tabla, marca `esOnly` para pintar la nota. Nunca
     traducimos automáticamente los términos de la taxonomía. */
  function dataLabel(field){
    if(!field) return { text:'—', esOnly:false };
    var lang = detectLang();
    if(lang === 'ca'){
      if(field.label_ca){ return { text: field.label_ca, esOnly:false }; }
      return { text: field.label || '—', esOnly: true };
    }
    return { text: field.label || '—', esOnly:false };
  }
  function t(){ return L[detectLang()] || L.es; }

  /* ── Carga del diccionario ── */
  function loadDict(){
    if(CACHE) return Promise.resolve(CACHE);
    return fetch('/api/terminology/dictionary', { cache:'no-store' })
      .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
      .then(function(json){
        var entries = [];
        var verif = (json && json.verificados) || {};
        Object.keys(verif).forEach(function(key){
          var v = verif[key];
          entries.push({
            key: key,
            nanda: v.nanda || {},
            noc: v.noc || {},
            nic: v.nic || {},
            fuente: v.fuente || '',
            fecha: v.fecha_verificacion || '',
            revisado_por: v.revisado_por || ''
          });
        });
        entries.sort(function(a,b){
          var ca = (a.nanda.code || '').toString();
          var cb = (b.nanda.code || '').toString();
          return ca.localeCompare(cb);
        });
        CACHE = {
          entries: entries,
          pendientes: (json && json.pendientes_de_verificar) || []
        };
        return CACHE;
      });
  }

  /* ── Overlay skeleton ── */
  function buildOverlay(){
    var host = document.getElementById('p31NnnOverlay');
    if(host) return host;
    host = document.createElement('div');
    host.id = 'p31NnnOverlay';
    host.className = 'p31-overlay';
    host.setAttribute('role','dialog');
    host.setAttribute('aria-modal','true');
    host.innerHTML =
      '<div class="p31-shell">'
      + '<header class="p31-head">'
      +   '<button type="button" class="p31-close" data-p31-close aria-label="cerrar">'
      +     '<span data-p2a-icon="close-x">✕</span>'
      +   '</button>'
      +   '<div class="p31-titles">'
      +     '<h2 class="p31-title"><span class="p31-title-ic" data-p2a-icon="nnn"></span><span class="p31-title-txt"></span></h2>'
      +     '<p class="p31-subtitle"></p>'
      +   '</div>'
      + '</header>'
      + '<div class="p31-search-wrap">'
      +   '<span class="p31-search-ic" data-p2a-icon="search"></span>'
      +   '<input type="search" class="p31-search" data-p31-q placeholder="" autocomplete="off">'
      + '</div>'
      + '<nav class="p31-crumbs" aria-label="ruta" hidden>'
      +   '<button type="button" class="p31-crumb" data-p31-step="0"></button>'
      +   '<span class="p31-crumb-sep" data-p2a-icon="chevron-r">›</span>'
      +   '<button type="button" class="p31-crumb" data-p31-step="1"></button>'
      +   '<span class="p31-crumb-sep" data-p2a-icon="chevron-r">›</span>'
      +   '<button type="button" class="p31-crumb" data-p31-step="2"></button>'
      + '</nav>'
      + '<div class="p31-body">'
      +   '<section class="p31-col p31-col-dx" data-p31-col="dx" data-active="1">'
      +     '<header class="p31-col-head"><span class="p31-col-badge">NANDA</span><span class="p31-col-title"></span></header>'
      +     '<div class="p31-col-body p31-list-dx"></div>'
      +   '</section>'
      +   '<section class="p31-col p31-col-noc" data-p31-col="noc">'
      +     '<header class="p31-col-head"><span class="p31-col-badge p31-badge-noc">NOC</span><span class="p31-col-title"></span></header>'
      +     '<div class="p31-col-body p31-list-noc"><p class="p31-empty"></p></div>'
      +   '</section>'
      +   '<section class="p31-col p31-col-nic" data-p31-col="nic">'
      +     '<header class="p31-col-head"><span class="p31-col-badge p31-badge-nic">NIC</span><span class="p31-col-title"></span></header>'
      +     '<div class="p31-col-body p31-list-nic"><p class="p31-empty"></p></div>'
      +   '</section>'
      + '</div>'
      + '</div>';
    document.body.appendChild(host);

    host.addEventListener('click', function(ev){
      if(ev.target === host) close();
      var closeBtn = ev.target.closest('[data-p31-close]');
      if(closeBtn){ close(); return; }
      var crumb = ev.target.closest('[data-p31-step]');
      if(crumb){ var s = parseInt(crumb.getAttribute('data-p31-step'),10); goStep(s); return; }
      var dxItem = ev.target.closest('[data-p31-dx]');
      if(dxItem){ selectDx(dxItem.getAttribute('data-p31-dx')); return; }
      var nocItem = ev.target.closest('[data-p31-noc]');
      if(nocItem){ goStep(2); return; }
    });
    host.querySelector('[data-p31-q]').addEventListener('input', function(ev){
      STATE.filter = (ev.target.value||'').trim().toLowerCase();
      renderDxList();
    });
    document.addEventListener('keydown', escToClose, false);
    return host;
  }
  function escToClose(ev){ if(ev.key === 'Escape' && document.body.classList.contains('p31-open')) close(); }

  function open(){
    var host = buildOverlay();
    applyI18n();
    document.body.classList.add('p31-open');
    host.classList.add('on');
    /* Reset visible state on each open */
    STATE.selectedKey = null;
    STATE.mobileStep = 0;
    STATE.mobileMaxReached = 0;
    STATE.filter = '';
    var q = host.querySelector('[data-p31-q]'); if(q){ q.value = ''; }
    renderLoading();
    loadDict()
      .then(function(){ renderAll(); setTimeout(function(){ if(q) q.focus(); }, 60); })
      .catch(function(){ renderNoData(); });
    /* Re-scan icons */
    if(window.EnferixIcons){
      host.querySelectorAll('[data-p2a-icon]').forEach(function(n){
        var name = n.getAttribute('data-p2a-icon');
        if(window.EnferixIcons.has(name)){
          n.innerHTML = window.EnferixIcons.get(name);
          n.classList.add('enfx-ic-slot');
        }
      });
    }
  }
  function close(){
    var host = document.getElementById('p31NnnOverlay');
    if(host){ host.classList.remove('on'); }
    document.body.classList.remove('p31-open');
  }

  function applyI18n(){
    var host = document.getElementById('p31NnnOverlay'); if(!host) return;
    var LL = t();
    host.querySelector('.p31-title-txt').textContent = LL.title;
    host.querySelector('.p31-subtitle').textContent = LL.subtitle;
    host.querySelector('[data-p31-q]').placeholder = LL.search;
    host.querySelector('[data-p31-col="dx"] .p31-col-title').textContent = LL.colDx;
    host.querySelector('[data-p31-col="noc"] .p31-col-title').textContent = LL.colNoc;
    host.querySelector('[data-p31-col="nic"] .p31-col-title').textContent = LL.colNic;
  }

  /* ── Renders ── */
  function renderLoading(){
    var host = document.getElementById('p31NnnOverlay'); if(!host) return;
    var LL = t();
    host.querySelector('.p31-list-dx').innerHTML = '<p class="p31-empty">'+esc(LL.loading)+'</p>';
    host.querySelector('.p31-list-noc').innerHTML = '<p class="p31-empty">'+esc(LL.pickNoc)+'</p>';
    host.querySelector('.p31-list-nic').innerHTML = '<p class="p31-empty">'+esc(LL.pickNic)+'</p>';
  }
  function renderNoData(){
    var host = document.getElementById('p31NnnOverlay'); if(!host) return;
    var LL = t();
    host.querySelector('.p31-list-dx').innerHTML = '<p class="p31-empty">'+esc(LL.noData)+'</p>';
  }
  function renderAll(){
    renderDxList();
    renderNoc();
    renderNic();
    renderCrumbs();
  }

  function match(entry, q){
    if(!q) return true;
    var t = String(entry.nanda.label||'').toLowerCase();
    var c = String(entry.nanda.code||'').toLowerCase();
    return t.indexOf(q) >= 0 || c.indexOf(q) >= 0;
  }

  function renderDxList(){
    var host = document.getElementById('p31NnnOverlay'); if(!host || !CACHE) return;
    var LL = t();
    var list = host.querySelector('.p31-list-dx');
    var q = STATE.filter;
    var visible = CACHE.entries.filter(function(e){ return match(e, q); });
    var html = '';
    if(visible.length){
      html += '<ul class="p31-items">' + visible.map(function(e){
        var isSel = e.key === STATE.selectedKey;
        var lbl = dataLabel(e.nanda);
        return '<li>'
          + '<button type="button" class="p31-item p31-item-dx'+(isSel?' on':'')+'" data-p31-dx="'+esc(e.key)+'">'
          +   '<span class="p31-item-code">'+esc(e.nanda.code||'—')+'</span>'
          +   '<span class="p31-item-labelwrap">'
          +     '<span class="p31-item-label">'+esc(lbl.text)+'</span>'
          +     (lbl.esOnly ? '<span class="p31-item-esonly">'+esc(LL.esOnly)+'</span>' : '')
          +   '</span>'
          +   '<span class="p31-item-badge p31-b-ok" title="'+esc(LL.verified)+'">'
          +     '<span data-p2a-icon="check" class="p31-b-ic"></span>'+esc(LL.verified)
          +   '</span>'
          + '</button>'
          + '</li>';
      }).join('') + '</ul>';
    } else if(q){
      html += '<p class="p31-empty">'+esc(LL.empty)+'</p>';
    } else {
      html += '<p class="p31-empty">'+esc(LL.pickDx)+'</p>';
    }
    /* Pendientes (no navegables) */
    if(!q && CACHE.pendientes && CACHE.pendientes.length){
      var esOnlyPending = detectLang() === 'ca';
      html += '<div class="p31-pending">'
        +   '<div class="p31-pending-head">'
        +     '<span class="p31-pending-title">'+esc(LL.pendingHead)+'</span>'
        +     '<span class="p31-pending-count">'+CACHE.pendientes.length+'</span>'
        +   '</div>'
        +   '<p class="p31-pending-help">'+esc(LL.pendingHelp)+'</p>'
        +   (esOnlyPending ? '<p class="p31-pending-esonly">'+esc(LL.esOnly)+'</p>' : '')
        +   '<ul class="p31-pending-list">'
        +     CACHE.pendientes.map(function(p){
                return '<li class="p31-pending-item">'
                  + '<span class="p31-b-ic" data-p2a-icon="clock"></span>'
                  + '<span class="p31-pending-label">'+esc(p)+'</span>'
                  + '<span class="p31-item-badge p31-b-pend">'+esc(LL.pending)+'</span>'
                  + '</li>';
              }).join('')
        +   '</ul>'
        + '</div>';
    }
    list.innerHTML = html;
    if(window.EnferixIcons){
      list.querySelectorAll('[data-p2a-icon]').forEach(function(n){
        var name = n.getAttribute('data-p2a-icon');
        if(window.EnferixIcons.has(name)){ n.innerHTML = window.EnferixIcons.get(name); n.classList.add('enfx-ic-slot'); }
      });
    }
  }

  function currentEntry(){
    if(!CACHE || !STATE.selectedKey) return null;
    for(var i=0;i<CACHE.entries.length;i++){ if(CACHE.entries[i].key === STATE.selectedKey) return CACHE.entries[i]; }
    return null;
  }

  function renderNoc(){
    var host = document.getElementById('p31NnnOverlay'); if(!host) return;
    var LL = t();
    var box = host.querySelector('.p31-list-noc');
    var e = currentEntry();
    if(!e){ box.innerHTML = '<p class="p31-empty">'+esc(LL.pickNoc)+'</p>'; return; }
    var lblNoc = dataLabel(e.noc);
    box.innerHTML = '<ul class="p31-items">'
      + '<li>'
      + '<button type="button" class="p31-item p31-item-noc on" data-p31-noc="'+esc(e.noc.code||'')+'">'
      +   '<span class="p31-item-code">'+esc(e.noc.code||'—')+'</span>'
      +   '<span class="p31-item-labelwrap">'
      +     '<span class="p31-item-label">'+esc(lblNoc.text)+'</span>'
      +     (lblNoc.esOnly ? '<span class="p31-item-esonly">'+esc(LL.esOnly)+'</span>' : '')
      +   '</span>'
      +   '<span class="p31-item-hint">'+esc(LL.code)+' NOC</span>'
      + '</button>'
      + '</li>'
      + '</ul>';
    if(window.EnferixIcons){
      box.querySelectorAll('[data-p2a-icon]').forEach(function(n){
        var name = n.getAttribute('data-p2a-icon');
        if(window.EnferixIcons.has(name)){ n.innerHTML = window.EnferixIcons.get(name); n.classList.add('enfx-ic-slot'); }
      });
    }
  }
  function renderNic(){
    var host = document.getElementById('p31NnnOverlay'); if(!host) return;
    var LL = t();
    var box = host.querySelector('.p31-list-nic');
    var e = currentEntry();
    if(!e){ box.innerHTML = '<p class="p31-empty">'+esc(LL.pickNic)+'</p>'; return; }
    var meta = '';
    if(e.fuente){ meta += '<div class="p31-meta"><span class="p31-meta-k">'+esc(LL.source)+':</span> '+esc(e.fuente)+'</div>'; }
    if(e.revisado_por || e.fecha){
      meta += '<div class="p31-meta"><span class="p31-meta-k">'+esc(LL.reviewed)+':</span> '+esc(e.revisado_por||'')+(e.fecha? ' — '+esc(e.fecha) : '')+'</div>';
    }
    var lblNic = dataLabel(e.nic);
    box.innerHTML = '<ul class="p31-items">'
      + '<li>'
      + '<div class="p31-item p31-item-nic on">'
      +   '<span class="p31-item-code">'+esc(e.nic.code||'—')+'</span>'
      +   '<span class="p31-item-labelwrap">'
      +     '<span class="p31-item-label">'+esc(lblNic.text)+'</span>'
      +     (lblNic.esOnly ? '<span class="p31-item-esonly">'+esc(LL.esOnly)+'</span>' : '')
      +   '</span>'
      +   '<span class="p31-item-hint">'+esc(LL.code)+' NIC</span>'
      + '</div>'
      + '</li>'
      + '</ul>'
      + (meta ? '<div class="p31-meta-block">'+meta+'</div>' : '');
  }

  function selectDx(key){
    STATE.selectedKey = key;
    renderDxList();
    renderNoc();
    renderNic();
    renderCrumbs();
    if(isMobile()){ goStep(1); }
  }

  function isMobile(){ return window.matchMedia && window.matchMedia('(max-width: 900px)').matches; }

  function goStep(n){
    var step = Math.max(0, Math.min(2, n|0));
    /* No permitas saltar a un paso que aún no ha sido habilitado */
    var e = currentEntry();
    if(step >= 1 && !e) step = 0;
    if(step >= 2 && STATE.mobileMaxReached < 2) step = Math.min(step, Math.max(1, STATE.mobileMaxReached));
    STATE.mobileStep = step;
    if(step > STATE.mobileMaxReached) STATE.mobileMaxReached = step;
    var host = document.getElementById('p31NnnOverlay'); if(!host) return;
    host.querySelectorAll('.p31-col').forEach(function(col, i){
      col.setAttribute('data-active', i === STATE.mobileStep ? '1' : '0');
    });
    renderCrumbs();
  }
  function renderCrumbs(){
    var host = document.getElementById('p31NnnOverlay'); if(!host) return;
    var LL = t();
    var nav = host.querySelector('.p31-crumbs');
    var e = currentEntry();
    var btns = nav.querySelectorAll('[data-p31-step]');
    /* Reglas de habilitación: paso 1 requiere diagnóstico seleccionado.
       Paso 2 requiere además haber navegado ya al NOC (max alcanzado ≥2). */
    var enabled = [true, !!e, !!e && STATE.mobileMaxReached >= 2];
    btns[0].textContent = LL.breadcrumbsHome;
    /* Mientras la miga está desactivada, no adelantamos el código;
       solo aparece cuando ya es navegable (y hay entrada seleccionada). */
    btns[1].textContent = enabled[1] ? ('NANDA '+(e.nanda.code||'—')) : 'NANDA —';
    btns[2].textContent = enabled[2] ? ('NOC '+(e.noc.code||'—')) : 'NOC —';
    btns.forEach(function(b, i){
      b.classList.toggle('on', i === STATE.mobileStep);
      b.disabled = !enabled[i];
      b.setAttribute('aria-disabled', b.disabled ? 'true' : 'false');
    });
    /* Mostrar solo en móvil */
    nav.hidden = !isMobile();
  }

  /* Registrar el disparador global de sección */
  window.EnferixNnnNavigator = { open: open, close: close };

  /* Extender el router de secciones */
  function hookSection(){
    var prev = window.EnferixOpenSection;
    if(typeof prev !== 'function'){ setTimeout(hookSection, 300); return; }
    if(prev.__p31Wrapped) return;
    var wrapped = function(k){
      if(k === 'nnn'){ open(); return; }
      return prev.apply(this, arguments);
    };
    wrapped.__p31Wrapped = true;
    window.EnferixOpenSection = wrapped;

    /* Añadir al índice de secciones si existe */
    try{
      var secs = window.INURSE_SECTIONS;
      if(Array.isArray(secs) && !secs.some(function(s){ return s.id === 'nnn'; })){
        secs.push({ id:'nnn', t:'NANDA · NOC · NIC', em:'🧭',
          kw:'nanda noc nic diagnostico enfermeria resultado intervencion nnn cuidados terminologia' });
      }
    }catch(e){}
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', hookSection);
  } else {
    hookSection();
  }
})();
