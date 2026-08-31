/* P1.2 · Índice de escalas patrón MDCalc
   Componente aislado: NO toca inurse-escalas-clinicas-js.js. Añade tres
   capas por encima del catálogo actual sin cambiar su lógica:
     ⭐ Favoritas   — chips de las escalas marcadas con estrella.
     🕐 Frecuentes  — top 6 escalas más abiertas en este dispositivo.
     ⭐ Filtro       — botón para mostrar solo favoritas.
   Persistencia local: `inurse_escalas_fav_v1` (array de ids),
                       `inurse_escalas_freq_v1` (map {id: {n, ts}}).
   El monolito re-renderiza #esc35Groups en cada cambio; por eso usamos
   un MutationObserver que re-inyecta la capa a cada tick.
*/
(function(){
  'use strict';
  var FAV_KEY  = 'inurse_escalas_fav_v1';
  var FREQ_KEY = 'inurse_escalas_freq_v1';
  var TOP_FREQ = 6;

  function loadJSON(k, fb){
    try{ var v = JSON.parse(localStorage.getItem(k)||'null'); return v==null?fb:v; }
    catch(e){ return fb; }
  }
  function saveJSON(k, v){
    try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){}
  }
  function loadFavs(){
    var v = loadJSON(FAV_KEY, []);
    return Array.isArray(v) ? v : [];
  }
  function saveFavs(list){ saveJSON(FAV_KEY, list); }
  function loadFreq(){
    var v = loadJSON(FREQ_KEY, {});
    return (v && typeof v === 'object' && !Array.isArray(v)) ? v : {};
  }
  function saveFreq(m){ saveJSON(FREQ_KEY, m); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  }); }

  var state = {
    onlyFavs: false,
    mo: null           // MutationObserver activo
  };
  var MO_OPTS = { childList: true, subtree: true };

  function getData(){
    /* El módulo de escalas expone su data como `window.ENFERIX_ESCALAS_DATA`
       y también carga sus datos con un promise interno; probamos ambas rutas. */
    var d = window.ENFERIX_ESCALAS_DATA || window.ENFERIX_ESCALAS || null;
    if(d && d.CALCULATORS) return d;
    /* Fallback: barrer el DOM actual y usar los ids ya renderizados. */
    var seen = {};
    document.querySelectorAll('[data-esc35-id]').forEach(function(el){
      var id = el.getAttribute('data-esc35-id');
      if(!id || seen[id]) return;
      seen[id] = {
        id: id,
        name: (el.querySelector('b')||{}).textContent || id,
        description: (el.querySelector('small')||{}).textContent || ''
      };
    });
    return { CALCULATORS: Object.keys(seen).map(function(k){ return seen[k]; }) };
  }

  function findCalc(id){
    var d = getData();
    return (d.CALCULATORS || []).find(function(c){ return c.id === id; }) || null;
  }

  /* ── Tracking de uso ── */
  function bumpFreq(id){
    if(!id) return;
    var m = loadFreq();
    var cur = m[id] || { n: 0, ts: 0 };
    cur.n += 1;
    cur.ts = Date.now();
    m[id] = cur;
    saveFreq(m);
  }

  /* ── Toggle de favoritas ── */
  function toggleFav(id){
    if(!id) return;
    var favs = loadFavs();
    var i = favs.indexOf(id);
    if(i >= 0) favs.splice(i, 1);
    else favs.push(id);
    saveFavs(favs);
    reinjectAll();
  }
  function isFav(id){ return loadFavs().indexOf(id) >= 0; }

  /* ── Cabecera "Tus escalas" (favoritas + frecuentes) ── */
  function chip(c, kind){
    var favClass = isFav(c.id) ? ' on' : '';
    return '<button type="button" class="p12-chip p12-chip-'+kind+'" data-p12-open="'+esc(c.id)+'">'
      +   '<span class="p12-chip-star'+favClass+'" data-p12-fav="'+esc(c.id)+'" title="'+(favClass?'Quitar de favoritas':'Añadir a favoritas')+'" aria-label="'+(favClass?'Quitar de favoritas':'Añadir a favoritas')+'">'+(favClass?'★':'☆')+'</span>'
      +   '<span class="p12-chip-name">'+esc(c.name || c.id)+'</span>'
      + '</button>';
  }
  function topHeaderHTML(){
    var favIds = loadFavs();
    var freq = loadFreq();
    var freqIds = Object.keys(freq).sort(function(a,b){
      var A = freq[a] || {n:0, ts:0}, B = freq[b] || {n:0, ts:0};
      if(B.n !== A.n) return B.n - A.n;
      return (B.ts||0) - (A.ts||0);
    }).slice(0, TOP_FREQ);

    var favs = favIds.map(findCalc).filter(Boolean);
    var frecs = freqIds.map(findCalc).filter(Boolean);

    /* Si no hay ni favoritas ni frecuentes, no metemos ruido en pantalla. */
    if(!favs.length && !frecs.length) return '';

    var html = '<section class="p12-top" aria-label="Tus escalas">';
    if(favs.length){
      html += '<div class="p12-row">'
        +      '<h4><span class="p12-em">⭐</span>Favoritas <small>'+favs.length+'</small></h4>'
        +      '<div class="p12-chips">'+favs.map(function(c){return chip(c,'fav');}).join('')+'</div>'
        +    '</div>';
    }
    if(frecs.length){
      html += '<div class="p12-row">'
        +      '<h4><span class="p12-em">🕐</span>Frecuentes <small>'+frecs.length+'</small></h4>'
        +      '<div class="p12-chips">'+frecs.map(function(c){return chip(c,'freq');}).join('')+'</div>'
        +    '</div>';
    }
    html += '</section>';
    return html;
  }

  /* ── Filtro "Solo favoritas" ── */
  function filterToolbarHTML(){
    var favCount = loadFavs().length;
    var on = state.onlyFavs && favCount > 0;
    var disabled = favCount === 0 ? ' disabled' : '';
    return '<div class="p12-filter">'
      +   '<button type="button" class="p12-filter-btn'+(on?' on':'')+'" id="p12FavFilter"'+disabled+' title="'+(favCount?'Mostrar solo tus favoritas':'Marca alguna con ⭐ primero')+'">'
      +     '<span>'+(on?'★':'☆')+'</span> Solo favoritas'
      +     (favCount ? ' <em>'+favCount+'</em>' : '')
      +   '</button>'
      + '</div>';
  }

  /* ── Estrella sobre cada tarjeta ── */
  function addStarsToCards(root){
    root.querySelectorAll('.esc35-card[data-esc35-id]').forEach(function(card){
      if(card.querySelector('.p12-card-star')) return;
      var id = card.getAttribute('data-esc35-id');
      var star = document.createElement('span');
      star.className = 'p12-card-star' + (isFav(id) ? ' on' : '');
      star.setAttribute('data-p12-fav', id);
      star.setAttribute('role', 'button');
      star.setAttribute('tabindex', '0');
      star.setAttribute('aria-label', isFav(id) ? 'Quitar de favoritas' : 'Añadir a favoritas');
      star.textContent = isFav(id) ? '★' : '☆';
      card.appendChild(star);
      /* La card es un <button> — la estrella no debe abrir la escala. */
    });
  }

  /* ── Filtrado por favoritas: oculta las cards que no lo son ── */
  function applyOnlyFavs(root){
    if(!state.onlyFavs) return;
    var favs = loadFavs();
    /* Ocultar cards */
    root.querySelectorAll('.esc35-card[data-esc35-id]').forEach(function(card){
      var id = card.getAttribute('data-esc35-id');
      card.style.display = (favs.indexOf(id) >= 0) ? '' : 'none';
    });
    /* Ocultar tarjetas de especialidad vacías */
    root.querySelectorAll('.esc35-spec-card').forEach(function(sp){
      var visible = sp.querySelectorAll('.esc35-card[data-esc35-id]');
      var anyVis = false;
      visible.forEach(function(c){ if(c.style.display !== 'none') anyVis = true; });
      if(!anyVis) sp.style.display = 'none';
      else sp.style.display = '';
    });
  }

  /* ── Inyección principal ── */
  function reinject(root){
    var groups = root.querySelector('#esc35Groups');
    var tools  = root.querySelector('.esc35-tools');
    if(!groups) return;

    /* Toolbar del filtro justo dentro de `.esc35-tools`, al final. */
    if(tools && !tools.querySelector('.p12-filter')){
      tools.insertAdjacentHTML('beforeend', filterToolbarHTML());
      var btn = tools.querySelector('#p12FavFilter');
      if(btn){
        btn.addEventListener('click', function(){
          if(btn.disabled) return;
          state.onlyFavs = !state.onlyFavs;
          reinjectAll();
        });
      }
    } else if(tools){
      /* Actualiza el contador si ya existe */
      var slot = tools.querySelector('.p12-filter');
      if(slot){ slot.outerHTML = filterToolbarHTML(); }
      var btn2 = tools.querySelector('#p12FavFilter');
      if(btn2){
        if(state.onlyFavs && !btn2.disabled) btn2.classList.add('on');
        btn2.addEventListener('click', function(){
          if(btn2.disabled) return;
          state.onlyFavs = !state.onlyFavs;
          reinjectAll();
        });
      }
    }

    /* Cabecera "Tus escalas" al principio de #esc35Groups. */
    var existing = groups.querySelector(':scope > .p12-top');
    if(existing) existing.remove();
    var html = topHeaderHTML();
    if(html){ groups.insertAdjacentHTML('afterbegin', html); }

    /* Estrellita sobre cada tarjeta y filtrado. */
    addStarsToCards(groups);
    applyOnlyFavs(groups);
  }

  function reinjectAll(){
    var host = document.getElementById('esc35Body');
    if(!host) return;
    /* Silencia el observer mientras mutamos; si se dejaba con un flag,
       las mutaciones se encolaban en microtask y disparaban el callback
       DESPUÉS de reset del flag, provocando bucle infinito. */
    if(state.mo){ try{ state.mo.disconnect(); }catch(e){} }
    reinject(host);
    if(state.mo){ try{ state.mo.observe(host, MO_OPTS); }catch(e){} }
  }

  /* ── Listeners globales delegados en document.body ── */
  function onBodyClick(e){
    /* 1) Estrella (chip o card) → toggle favorita, no propaga */
    var star = e.target.closest('[data-p12-fav]');
    if(star){
      e.preventDefault(); e.stopPropagation();
      toggleFav(star.getAttribute('data-p12-fav'));
      return;
    }
    /* 2) Chip de "Tus escalas" → dispara la card correspondiente y trackea */
    var chip = e.target.closest('[data-p12-open]');
    if(chip){
      e.preventDefault();
      var id = chip.getAttribute('data-p12-open');
      bumpFreq(id);
      var card = document.querySelector('.esc35-card[data-esc35-id="'+CSS.escape(id)+'"]');
      if(card) card.click();
      return;
    }
    /* 3) Card real → registra frecuencia (el monolito se ocupa de abrir) */
    var card = e.target.closest('.esc35-card[data-esc35-id]');
    if(card){
      bumpFreq(card.getAttribute('data-esc35-id'));
    }
  }

  /* ── Observer que re-inyecta a cada renderGroups() del monolito ── */
  function startObserver(){
    var host = document.getElementById('esc35Body');
    if(!host) return false;
    if(state.mo){ try{ state.mo.disconnect(); }catch(e){} }
    state.mo = new MutationObserver(function(muts){
      /* Nos importa un renderGroups() del monolito, que reemplaza
         `#esc35Groups.innerHTML` entero — su childList es la señal. */
      var relevant = muts.some(function(m){
        return m.type === 'childList' && (m.target.id === 'esc35Groups' || m.target.id === 'esc35Body');
      });
      if(relevant){ reinjectAll(); }
    });
    reinjectAll();   // primer render (dispara disconnect/observe internamente)
    return true;
  }

  function boot(){
    document.body.addEventListener('click', onBodyClick, true);
    /* El overlay de escalas se monta perezosamente. Reintentar hasta que
       aparezca #esc35Body (cuando el user abre "Escalas"). */
    var tries = 0;
    var t = setInterval(function(){
      if(document.getElementById('esc35Body')){
        startObserver();
        clearInterval(t);
        return;
      }
      if(++tries > 240) clearInterval(t);
    }, 500);
    /* Además: si el overlay se destruye/recrea, un MutationObserver global
       lo vuelve a enganchar. */
    var gm = new MutationObserver(function(){
      if(document.getElementById('esc35Body')){ startObserver(); }
    });
    try{ gm.observe(document.body, { childList: true, subtree: true }); }catch(e){}
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
