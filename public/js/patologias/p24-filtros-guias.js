/* P2.4 · Filtros en el listado de guías (patrón NICE)
   Componente aislado: NO toca inurse56-js.js. Observa el DOM y, cuando
   aparece `#in56GuidesHost` (panel lateral de guías clínicas), inyecta
   una barra de filtros por chips:
     · Estado semántico (Vigente / Revisar / Caducada).
     · Fuente (ESC, AHA, NICE, GINA, GOLD, INGESA, KDIGO...) — familias
       de instituciones detectadas en `doc.source`.
     · Área (especialidad) — coincide con los grupos ya visibles.
   Aplicación: oculta los `.in56-guide-doc` que no coinciden y colapsa
   los grupos que quedan vacíos. Los filtros activos aparecen además
   como una barra de "aplicados" arriba, cada uno con ✕ para quitarlo.
*/
(function(){
  'use strict';

  var CURRENT_YEAR = new Date().getFullYear();

  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  }); }
  function detectLang(){
    var htmlLang = (document.documentElement.lang||'').toLowerCase();
    if(htmlLang.startsWith('ca')) return 'ca';
    try{ var s = (localStorage.getItem('inurse_lang')||'').toLowerCase(); if(s.startsWith('ca')) return 'ca'; }catch(e){}
    var nav = (navigator.language||'').toLowerCase();
    if(nav.startsWith('ca')) return 'ca';
    return 'es';
  }
  var LANG = {
    es: {
      title:'Filtrar', estado:'Estado', fuente:'Fuente', area:'Área',
      all:'Todas', reset:'Restablecer', applied:'Aplicados',
      vigente:'Vigente', revisar:'Por revisar', caducada:'Caducada', sinFecha:'Sin fecha',
      counter:'{n} guías', expand:'Mostrar filtros', collapse:'Ocultar filtros'
    },
    ca: {
      title:'Filtrar', estado:'Estat', fuente:'Font', area:'Àrea',
      all:'Totes', reset:'Restablir', applied:'Aplicats',
      vigente:'Vigent', revisar:'Per revisar', caducada:'Caducada', sinFecha:'Sense data',
      counter:'{n} guies', expand:'Mostrar filtres', collapse:'Amagar filtres'
    }
  };

  /* Nombres legibles bilingües + fusión de duplicados. La clave son las
     `doc.cat` que se ven en la base actual (ped/pedia, farm/farmaco…);
     se apuntan al MISMO grupo humano en ambos idiomas. La lista
     canónica de nombres es la que la UI enseña; internamente seguimos
     agrupando por la clave canónica (p. ej. pedia). */
  var AREA_MAP = {
    /* clave-fuente : { canonical, es, ca } */
    'ped':       { c:'pedia',   es:'Pediatría',           ca:'Pediatria' },
    'pedia':     { c:'pedia',   es:'Pediatría',           ca:'Pediatria' },
    'farm':      { c:'farma',   es:'Farmacia',            ca:'Farmàcia' },
    'farmaco':   { c:'farma',   es:'Farmacia',            ca:'Farmàcia' },
    'farma':     { c:'farma',   es:'Farmacia',            ca:'Farmàcia' },
    'cardio':    { c:'cardio',  es:'Cardiología',         ca:'Cardiologia' },
    'derma':     { c:'derma',   es:'Dermatología',        ca:'Dermatologia' },
    'digest':    { c:'digest',  es:'Digestivo',           ca:'Digestiu' },
    'emer':      { c:'urgen',   es:'Urgencias',           ca:'Urgències' },
    'urgen':     { c:'urgen',   es:'Urgencias',           ca:'Urgències' },
    'endo':      { c:'endo',    es:'Endocrinología',      ca:'Endocrinologia' },
    'endocrino': { c:'endo',    es:'Endocrinología',      ca:'Endocrinologia' },
    'enfoqueuci':{ c:'uci',     es:'UCI',                 ca:'UCI' },
    'uci':       { c:'uci',     es:'UCI',                 ca:'UCI' },
    'esp':       { c:'esp',     es:'Especialidades',      ca:'Especialitats' },
    'extra':     { c:'extra',   es:'Extrahospitalaria',   ca:'Extrahospitalària' },
    'imagen':    { c:'imagen',  es:'Imagen (Rx/POCUS)',   ca:'Imatge (Rx/POCUS)' },
    'nefro':     { c:'nefro',   es:'Nefrología',          ca:'Nefrologia' },
    'neuro':     { c:'neuro',   es:'Neurología',          ca:'Neurologia' },
    'obst':      { c:'obst',    es:'Obstetricia',         ca:'Obstetrícia' },
    'oft':       { c:'oft',     es:'Oftalmología',        ca:'Oftalmologia' },
    'onco':      { c:'onco',    es:'Oncología',           ca:'Oncologia' },
    'orl':       { c:'orl',     es:'ORL',                 ca:'ORL' },
    'paliativos':{ c:'palia',   es:'Cuidados paliativos', ca:'Cures pal·liatives' },
    'palia':     { c:'palia',   es:'Cuidados paliativos', ca:'Cures pal·liatives' },
    'psiq':      { c:'psiq',    es:'Psiquiatría',         ca:'Psiquiatria' },
    'resp':      { c:'resp',    es:'Respiratorio',        ca:'Respiratori' },
    'resus':     { c:'resus',   es:'Reanimación',         ca:'Reanimació' },
    'sepsis':    { c:'infec',   es:'Infecciosas',         ca:'Infeccioses' },
    'infec':     { c:'infec',   es:'Infecciosas',         ca:'Infeccioses' },
    'toxico':    { c:'toxico',  es:'Toxicología',         ca:'Toxicologia' },
    'trauma':    { c:'trauma',  es:'Trauma',              ca:'Trauma' },
    'ictus':     { c:'neuro',   es:'Neurología',          ca:'Neurologia' },
    'farmacia':  { c:'farma',   es:'Farmacia',            ca:'Farmàcia' },
    'otros':     { c:'otros',   es:'Otros / General',     ca:'Altres / General' }
  };
  function normalizeArea(cat){
    var k = String(cat||'otros').toLowerCase();
    if(AREA_MAP[k]) return AREA_MAP[k];
    return { c:k, es:k, ca:k };
  }
  function areaLabel(cat){
    var m = normalizeArea(cat);
    return detectLang() === 'ca' ? m.ca : m.es;
  }
  function areaCanonical(cat){ return normalizeArea(cat).c; }
  function t(){ return LANG[detectLang()] || LANG.es; }

  /* Familias de fuentes reconocidas — orden importa para priorizar */
  var FAMILIES = [
    'INGESA','ESC','AHA','ACC','NICE','GINA','GOLD','KDIGO','ADA',
    'ERC','SEMES','SEMICYUC','WHO','OMS','EULAR','ACR','ATS','SEEN',
    'SEMFYC','SEIMC','ACLS','PALS','ILCOR','SEPAR','SEAP','SEC'
  ];
  function docFamily(source){
    var s = String(source||'');
    for(var i=0;i<FAMILIES.length;i++){
      if(new RegExp('\\b'+FAMILIES[i]+'\\b','i').test(s)) return FAMILIES[i];
    }
    return 'Otras';
  }
  function docYear(doc){
    if(!doc) return null;
    if(doc.last_updated){
      var n = parseInt(String(doc.last_updated).slice(0,4), 10);
      if(!isNaN(n)) return n;
    }
    var m = String(doc.source||'').match(/(19|20)\d{2}/);
    return m ? parseInt(m[0], 10) : null;
  }
  function docState(doc){
    if(/INGESA/i.test(String(doc && doc.source || ''))) return 'vigente';
    var y = docYear(doc);
    if(!y) return 'sin-fecha';
    var age = CURRENT_YEAR - y;
    if(age <= 2) return 'vigente';
    if(age <= 4) return 'revisar';
    return 'caducada';
  }
  /* Estado del filtro persistido en localStorage */
  var STATE_KEY = 'inurse_p24_filters_v1';
  var state = { estado:'all', fuente:'all', area:'all', _exp:false };
  function load(){
    try{
      var s = JSON.parse(localStorage.getItem(STATE_KEY)||'null');
      if(s && typeof s === 'object'){
        state.estado = s.estado || 'all';
        state.fuente = s.fuente || 'all';
        state.area = s.area || 'all';
        state._exp = !!s._exp;
      }
    }catch(e){}
  }
  function save(){
    try{ localStorage.setItem(STATE_KEY, JSON.stringify(state)); }catch(e){}
  }
  function hasActive(){
    return state.estado !== 'all' || state.fuente !== 'all' || state.area !== 'all';
  }
  function activeChipsList(){
    var L = t();
    var out = [];
    if(state.estado !== 'all'){
      var lab = { vigente:L.vigente, revisar:L.revisar, caducada:L.caducada, 'sin-fecha':L.sinFecha }[state.estado] || state.estado;
      out.push({ key:'estado', val:state.estado, label:L.estado+': '+lab });
    }
    if(state.fuente !== 'all') out.push({ key:'fuente', val:state.fuente, label:L.fuente+': '+state.fuente });
    if(state.area !== 'all')   out.push({ key:'area',   val:state.area,   label:L.area+': '+(AREA_MAP[state.area]?(detectLang()==='ca'?AREA_MAP[state.area].ca:AREA_MAP[state.area].es):state.area) });
    return out;
  }

  function buildChips(){
    var L = t();
    var docs = (window.DOCS||[]);
    var famMap = {};
    var areaMap = {};   /* clave canónica → cuenta */
    var areaLabelMap = {};   /* clave canónica → etiqueta bilingüe */
    docs.forEach(function(d){
      var f = docFamily(d.source);
      famMap[f] = (famMap[f]||0) + 1;
      var can = areaCanonical(d.cat);
      areaMap[can] = (areaMap[can]||0) + 1;
      areaLabelMap[can] = areaLabel(d.cat);
    });
    var famChips = [['all', L.all]].concat(
      Object.keys(famMap).sort(function(a,b){ return famMap[b]-famMap[a]; })
        .map(function(k){ return [k, k + ' (' + famMap[k] + ')']; })
    );
    var areaChips = [['all', L.all]].concat(
      Object.keys(areaMap).sort(function(a,b){
        return (areaLabelMap[a]||'').localeCompare(areaLabelMap[b]||'','es');
      }).map(function(k){ return [k, (areaLabelMap[k]||k) + ' (' + areaMap[k] + ')']; })
    );
    /* Fila de "filtros aplicados" arriba, cada uno con ✕ para quitar */
    var active = activeChipsList();
    var appliedHTML = active.length
      ? '<div class="p24-applied">'
        + '<span class="p24-applied-lbl">'+esc(L.applied)+':</span> '
        + active.map(function(a){
            return '<span class="p24-applied-chip" data-p24-clear="'+esc(a.key)+'">'
              + esc(a.label)
              + ' <button type="button" class="p24-x" aria-label="Quitar">✕</button>'
              + '</span>';
          }).join('')
        + '</div>'
      : '';

    /* Panel plegado por defecto (persistido). Solo la fila de
       "Filtrar + Restablecer + Aplicados + contador" queda visible; los
       chips de dimensiones se ocultan hasta expandir. */
    var expanded = !!state._exp;
    return '<div class="p24-filters'+(expanded?' expanded':' collapsed')+'">'
      + '<div class="p24-head">'
      +   '<span class="p24-title">🔧 '+esc(L.title)+'</span>'
      +   '<div class="p24-head-actions">'
      +     '<button class="p24-reset" type="button"'+(active.length?'':' hidden')+'>↺ '+esc(L.reset)+'</button>'
      +     '<button class="p24-toggle" type="button" data-p24-toggle>'+ (expanded ? '▲ '+esc(L.collapse) : '▼ '+esc(L.expand)) +'</button>'
      +   '</div>'
      + '</div>'
      + appliedHTML
      + '<div class="p24-counter" data-p24-counter></div>'
      + '<div class="p24-body"'+(expanded?'':' hidden')+'>'
      +   chipRow(L.estado, 'estado', [
            ['all', L.all],
            ['vigente', L.vigente + ' ●'],
            ['revisar', L.revisar + ' ●'],
            ['caducada', L.caducada + ' ●']
          ])
      +   chipRow(L.fuente, 'fuente', famChips)
      +   chipRow(L.area,   'area',   areaChips)
      + '</div>'
      + '</div>';
  }
  function chipRow(label, key, options){
    var cur = state[key];
    return '<div class="p24-row" data-p24-row="'+esc(key)+'">'
      + '<div class="p24-row-label">'+esc(label)+'</div>'
      + '<div class="p24-row-chips">'
      + options.map(function(o){
          var val = o[0], txt = o[1];
          var cls = 'p24-chip' + (val === cur ? ' on' : '');
          if(key === 'estado' && val !== 'all') cls += ' p24-chip-'+val;
          return '<button type="button" class="'+cls+'" data-p24-val="'+esc(val)+'">'+esc(txt)+'</button>';
        }).join('')
      + '</div>'
      + '</div>';
  }

  function docPasses(doc){
    if(state.estado !== 'all' && docState(doc) !== state.estado) return false;
    if(state.fuente !== 'all' && docFamily(doc.source) !== state.fuente) return false;
    if(state.area !== 'all' && areaCanonical(doc.cat || 'otros') !== state.area) return false;
    return true;
  }

  function apply(host){
    if(!host) return;
    var docsIndex = {};
    (window.DOCS||[]).forEach(function(d){ docsIndex[d.id] = d; });
    var visibleCount = 0;
    host.querySelectorAll('.in56-guide-group').forEach(function(group){
      var buttons = group.querySelectorAll('[data-in56-doc]');
      var anyVis = false;
      buttons.forEach(function(btn){
        var id = btn.getAttribute('data-in56-doc');
        var d = docsIndex[id];
        var pass = d ? docPasses(d) : false;
        btn.style.display = pass ? '' : 'none';
        if(pass){ anyVis = true; visibleCount++; }
      });
      group.style.display = anyVis ? '' : 'none';
    });
    /* Contador */
    var counter = host.querySelector('[data-p24-counter]');
    if(counter){
      var L = t();
      counter.textContent = L.counter.replace('{n}', visibleCount);
    }
    /* Estado visual de chips activos */
    host.querySelectorAll('[data-p24-row]').forEach(function(row){
      var k = row.getAttribute('data-p24-row');
      row.querySelectorAll('.p24-chip').forEach(function(c){
        c.classList.toggle('on', c.getAttribute('data-p24-val') === state[k]);
      });
    });
  }

  function ensureFilters(host){
    if(!host) return;
    if(host.querySelector(':scope > .p24-filters')) return;
    load();
    var wrap = document.createElement('div');
    wrap.innerHTML = buildChips();
    host.insertBefore(wrap.firstElementChild, host.firstChild);
    function refresh(){
      var old = host.querySelector(':scope > .p24-filters');
      if(old) old.remove();
      var w = document.createElement('div');
      w.innerHTML = buildChips();
      host.insertBefore(w.firstElementChild, host.firstChild);
      apply(host);
    }
    host.addEventListener('click', function(e){
      var toggle = e.target.closest('[data-p24-toggle]');
      if(toggle){
        state._exp = !state._exp;
        save(); refresh();
        return;
      }
      var clearBtn = e.target.closest('[data-p24-clear]');
      if(clearBtn){
        var k = clearBtn.getAttribute('data-p24-clear');
        state[k] = 'all';
        save(); refresh();
        return;
      }
      var chip = e.target.closest('.p24-chip');
      if(chip){
        var row = chip.closest('[data-p24-row]');
        if(!row) return;
        var key = row.getAttribute('data-p24-row');
        state[key] = chip.getAttribute('data-p24-val');
        save(); refresh();
        return;
      }
      var reset = e.target.closest('.p24-reset');
      if(reset){
        state = { estado:'all', fuente:'all', area:'all', _exp:state._exp };
        save(); refresh();
      }
    });
    apply(host);
  }

  function scan(){
    var host = document.getElementById('in56GuidesHost');
    if(host) ensureFilters(host);
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
          if(n.id === 'in56GuidesHost' ||
             (n.querySelector && n.querySelector('#in56GuidesHost')) ||
             (n.classList && n.classList.contains('in56-guide-group'))){
            relevant = true; break;
          }
        }
      }
      if(relevant){
        try{ mo.disconnect(); }catch(e){}
        scan();
        try{ mo.observe(document.body, { childList:true, subtree:true }); }catch(e){}
      }
    });
    try{ mo.observe(document.body, { childList:true, subtree:true }); }catch(e){}
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
