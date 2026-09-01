/* P2.2 · Modo paso a paso para escalas largas
   Componente aislado: NO toca el JS del monolito de escalas.

   Vista "Paso a paso":
     · Un solo `.esc35-row` visible por paso.
     · Selects con >5 opciones se transforman en botones de opción
       grandes, uno por tramo, con avance automático al siguiente.
     · Barra de progreso `n/total` + puntos acumulados en vivo.
     · En el último paso, cuando la escala tiene resultado calculable,
       se muestra el bloque final (puntuación, interpretación,
       referencia) sin salir del modo paso.
*/
(function(){
  'use strict';
  var THRESHOLD = 5;   // activa desde 6 items
  var ADVANCE_MS = 220;

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
    es: { form:'Formulario', paso:'Paso a paso', prev:'Anterior', next:'Siguiente', see:'Ver resultado', of:'de', points:'Puntos', restart:'Reiniciar' },
    ca: { form:'Formulari',  paso:'Pas a pas',  prev:'Anterior', next:'Següent',    see:'Veure resultat', of:'de', points:'Punts',  restart:'Reiniciar' }
  };
  function t(){ return LANG[detectLang()] || LANG.es; }

  function state(root){ return root.dataset; }

  function currentScore(){
    var el = document.querySelector('#esc35Result .esc35-result-main b');
    if(el){
      var n = parseInt((el.textContent||'').replace(/[^0-9-]/g,''), 10);
      if(!isNaN(n)) return n;
    }
    return null;
  }

  function setupToggle(root, rows){
    var L = t();

    /* Header con toggle + progreso + puntos acumulados */
    var tools = root.querySelector('.p22-tools');
    if(!tools){
      tools = document.createElement('div');
      tools.className = 'p22-tools';
      tools.innerHTML =
        '<div class="p22-modeswitch" role="tablist" aria-label="Modo de escala">'
        + '<button type="button" class="p22-mode" data-p22-mode="form" role="tab"><span class="p22-mode-em" data-p22-icon="clipboard">📋</span> '+esc(L.form)+'</button>'
        + '<button type="button" class="p22-mode" data-p22-mode="step" role="tab"><span class="p22-mode-em" data-p22-icon="steps">🪜</span> '+esc(L.paso)+'</button>'
        + '</div>'
        + '<div class="p22-progress" hidden>'
        +   '<div class="p22-progress-bar"><span class="p22-progress-fill"></span></div>'
        +   '<div class="p22-progress-text"><b class="p22-cur">1</b>/<span class="p22-total">'+rows.length+'</span></div>'
        +   '<div class="p22-score" hidden><span class="p22-score-lbl">'+esc(L.points)+'</span> <b class="p22-score-val">0</b></div>'
        + '</div>';
      var inputs = root.querySelector('#esc35Inputs');
      if(inputs) inputs.parentNode.insertBefore(tools, inputs);
      tools.addEventListener('click', function(e){
        var b = e.target.closest('[data-p22-mode]');
        if(!b) return;
        var m = b.getAttribute('data-p22-mode');
        state(root).p22Mode = m;
        if(m === 'step'){ state(root).p22Step = '0'; }
        apply(root);
      });
    } else {
      var tot = tools.querySelector('.p22-total');
      if(tot) tot.textContent = String(rows.length);
    }

    /* Botones de navegación */
    var nav = root.querySelector('.p22-nav');
    if(!nav){
      nav = document.createElement('div');
      nav.className = 'p22-nav';
      nav.innerHTML =
        '<button type="button" class="p22-btn p22-prev">← '+esc(L.prev)+'</button>'
        + '<button type="button" class="p22-btn p22-next">'+esc(L.next)+' →</button>';
      var inputs2 = root.querySelector('#esc35Inputs');
      if(inputs2) inputs2.parentNode.insertBefore(nav, inputs2.nextSibling);
      nav.addEventListener('click', function(e){
        var b = e.target.closest('.p22-prev, .p22-next');
        if(!b) return;
        var rows = Array.from(root.querySelectorAll('#esc35Inputs > .esc35-row'));
        var cur = parseInt(state(root).p22Step || '0', 10);
        if(b.classList.contains('p22-prev')){
          cur = Math.max(0, cur - 1);
        } else {
          cur = Math.min(rows.length, cur + 1);
        }
        state(root).p22Step = String(cur);
        apply(root);
      });
    }

    apply(root);
  }

  /* Convierte un <select> largo en botones grandes, uno por opción,
     con avance automático al siguiente paso al pulsar uno. */
  function selectToButtons(row, onPicked){
    if(row.dataset.p22Buttonified === '1') return;
    var sel = row.querySelector('select');
    if(!sel) return;
    /* Extraer opciones */
    var opts = Array.from(sel.options).map(function(o){ return { value:o.value, label:o.textContent }; });
    if(!opts.length) return;
    /* Crear grupo de botones */
    var group = document.createElement('div');
    group.className = 'p22-optgroup';
    var currentVal = String(sel.value);
    opts.forEach(function(o){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'p22-opt' + (String(o.value) === currentVal ? ' on' : '');
      b.setAttribute('data-p22-val', o.value);
      /* Separar label y puntos si vienen en formato "Label (X)" */
      var m = /^(.*)\s*\(([-+]?\d+)\)\s*$/.exec(o.label);
      if(m){
        b.innerHTML = '<span class="p22-opt-label">'+esc(m[1].trim())+'</span>'
          + '<span class="p22-opt-pts">'+esc(m[2])+' pt</span>';
      } else {
        b.innerHTML = '<span class="p22-opt-label">'+esc(o.label)+'</span>';
      }
      b.addEventListener('click', function(){
        /* Reflejar en el select nativo + dispatch change (el monolito
           recalcula state.values y renderResult) */
        sel.value = o.value;
        sel.dispatchEvent(new Event('change', {bubbles:true}));
        group.querySelectorAll('.p22-opt').forEach(function(x){
          x.classList.toggle('on', x === b);
        });
        if(typeof onPicked === 'function'){
          setTimeout(function(){ onPicked(); }, ADVANCE_MS);
        }
      });
      group.appendChild(b);
    });
    /* Ocultar el select nativo y colocar los botones */
    sel.style.display = 'none';
    sel.parentNode.insertBefore(group, sel.nextSibling);
    row.dataset.p22Buttonified = '1';
  }
  function restoreSelect(row){
    if(row.dataset.p22Buttonified !== '1') return;
    var sel = row.querySelector('select');
    if(sel){ sel.style.display = ''; }
    var group = row.querySelector('.p22-optgroup');
    if(group && group.parentNode) group.parentNode.removeChild(group);
    row.dataset.p22Buttonified = '';
  }

  /* Panel de resultado inline en el último paso */
  function ensureFinalPanel(root){
    var panel = root.querySelector('.p22-final');
    if(panel) return panel;
    panel = document.createElement('div');
    panel.className = 'p22-final';
    var inputs = root.querySelector('#esc35Inputs');
    if(inputs) inputs.parentNode.insertBefore(panel, inputs.nextSibling);
    return panel;
  }
  /* Devuelve la referencia como HTML con enlace a PubMed. Si el texto
     tiene un URL o DOI explícito, lo linkea directo; si no, añade un
     buscador de PubMed sobre la cita. NO reformula el texto. */
  function referenceToHTML(citation){
    var t = String(citation||'').trim();
    if(!t) return '';
    /* URL directa dentro del texto */
    var mUrl = t.match(/https?:\/\/[^\s]+/);
    if(mUrl){
      var url = mUrl[0].replace(/[.),;]+$/, '');
      return '<span class="p22-ref-text">'+esc(t)+'</span>'
        + ' <a class="p22-ref-link" href="'+esc(url)+'" target="_blank" rel="noopener">↗ Abrir</a>';
    }
    /* DOI (10.xxxx/...) */
    var mDoi = t.match(/\b10\.\d{4,9}\/[^\s"'<>]+/);
    if(mDoi){
      var doi = mDoi[0].replace(/[.),;]+$/, '');
      return '<span class="p22-ref-text">'+esc(t)+'</span>'
        + ' <a class="p22-ref-link" href="https://doi.org/'+encodeURIComponent(doi)+'" target="_blank" rel="noopener">↗ DOI</a>';
    }
    /* PMID (7-8 dígitos precedidos por PMID o pmid o al final) */
    var mPmid = t.match(/\bPMID\s*:?\s*(\d{6,9})/i);
    if(mPmid){
      return '<span class="p22-ref-text">'+esc(t)+'</span>'
        + ' <a class="p22-ref-link" href="https://pubmed.ncbi.nlm.nih.gov/'+encodeURIComponent(mPmid[1])+'/" target="_blank" rel="noopener">↗ PubMed</a>';
    }
    /* Fallback: buscador PubMed con la cita textual */
    var q = encodeURIComponent(t);
    return '<span class="p22-ref-text">'+esc(t)+'</span>'
      + ' <a class="p22-ref-link" href="https://pubmed.ncbi.nlm.nih.gov/?term='+q+'" target="_blank" rel="noopener"><span class="p22-ref-em" data-p22-icon="search">🔎</span> Buscar en PubMed</a>';
  }

  /* Lee del catálogo de escalas la definición del calculator visible.
     La info estructurada opcional que consumimos es:
       c.interpretationsByLevel = { alto: '…', intermedio: '…', bajo: '…' }
     rellenada solo desde fuentes validadas en el .ts del calculador; si
     no existe, seguimos usando el texto que devuelve c.compute(). */
  function currentCalc(){
    var titleEl = document.querySelector('.esc35-calc h3');
    var name = (titleEl && titleEl.textContent || '').trim();
    if(!name) return null;
    var d = window.ENFERIX_ESCALAS_DATA;
    if(!d || !Array.isArray(d.CALCULATORS)) return null;
    return d.CALCULATORS.find(function(c){ return c.name === name; }) || null;
  }
  function currentLevel(result){
    if(!result) return null;
    var m = String(result.className||'').match(/lvl-([a-z0-9-]+)/i);
    return m ? m[1] : null;
  }

  function saveResult(payload){
    try{
      var arr = JSON.parse(localStorage.getItem('inurse_p22_saved_v1') || '[]');
      arr.unshift(payload);
      arr = arr.slice(0, 40);
      localStorage.setItem('inurse_p22_saved_v1', JSON.stringify(arr));
    }catch(e){}
  }
  function shareResult(payload){
    var text = payload.title + '\n' + payload.score + ' puntos'
      + (payload.level ? ' · ' + payload.level.toUpperCase() : '')
      + (payload.interp ? '\n' + payload.interp : '')
      + '\n\n(vía Enferix)';
    try{
      if(navigator.share){
        navigator.share({ title: payload.title, text: text }).catch(function(){});
        return;
      }
    }catch(e){}
    try{
      navigator.clipboard && navigator.clipboard.writeText && navigator.clipboard.writeText(text);
    }catch(e){}
  }

  function renderFinalPanel(root){
    var panel = ensureFinalPanel(root);
    var result = root.querySelector('#esc35Result');
    var extra = root.querySelector('#esc35Extra');
    var refs = extra ? Array.from(extra.querySelectorAll('section')).find(function(s){
      var h = s.querySelector('h4');
      return h && /referencias/i.test(h.textContent||'');
    }) : null;
    if(!result || !result.querySelector('.esc35-result-main')){
      panel.innerHTML = '<div class="p22-final-empty">Todavía faltan pasos por completar.</div>';
      return;
    }
    var main = result.querySelector('.esc35-result-main');
    var interp = result.querySelector('.esc35-result-interp');
    var details = result.querySelector('.esc35-result-details');
    var pill = result.querySelector('.esc35-pill');
    /* Interpretación por tramo: si el calculator lo trae estructurado,
       lo usamos; si no, caemos al texto genérico del monolito. */
    var calc = currentCalc();
    var level = currentLevel(result);
    var byLevel = calc && calc.interpretationsByLevel;
    var interpHTML = '';
    if(byLevel && level && byLevel[level]){
      interpHTML = '<div class="p22-final-interp"><span class="p22-final-interp-tag">Tramo</span>'
        + esc(byLevel[level]) + '</div>';
    } else if(interp){
      interpHTML = '<div class="p22-final-interp">'+ interp.innerHTML +'</div>';
    }

    /* Referencias con enlaces */
    var refsHTML = '';
    if(refs){
      var items = Array.from(refs.querySelectorAll('li')).map(function(li){
        return '<li>'+ referenceToHTML(li.textContent || '') +'</li>';
      });
      if(items.length){
        refsHTML = '<div class="p22-final-refs"><b>Fuente:</b><ul>'+ items.join('') +'</ul></div>';
      }
    }

    /* Título de la escala para acciones */
    var calcName = (calc && calc.name) || (document.querySelector('.esc35-calc h3') || {}).textContent || '';
    var scoreNum = currentScore();

    panel.innerHTML =
      '<div class="p22-final-head">'
      +   (pill ? '<span class="p22-final-pill">'+esc(pill.textContent)+'</span>' : '')
      +   '<div class="p22-final-main">'+ (main ? main.innerHTML : '') +'</div>'
      + '</div>'
      + interpHTML
      + (details ? '<ul class="p22-final-details">'+ details.innerHTML +'</ul>' : '')
      + refsHTML
      + '<div class="p22-final-actions">'
      +   '<button type="button" class="p22-final-btn" data-p22-save>'
      +     '<span class="p22-final-btn-ic" data-p2a-icon="save"></span>'
      +     '<span class="p22-final-btn-lbl">Guardar</span>'
      +   '</button>'
      +   '<button type="button" class="p22-final-btn" data-p22-share>'
      +     '<span class="p22-final-btn-ic" data-p2a-icon="share"></span>'
      +     '<span class="p22-final-btn-lbl">Compartir</span>'
      +   '</button>'
      + '</div>';

    /* Enganchar acciones */
    var payload = {
      id: (calc && calc.id) || '',
      title: calcName,
      score: scoreNum,
      level: level,
      interp: interp ? interp.textContent.trim() : '',
      ts: Date.now()
    };
    var saveBtn = panel.querySelector('[data-p22-save]');
    var shareBtn = panel.querySelector('[data-p22-share]');
    if(saveBtn){
      saveBtn.addEventListener('click', function(){
        saveResult(payload);
        saveBtn.innerHTML =
          '<span class="p22-final-btn-ic" data-p2a-icon="check"></span>'
          + '<span class="p22-final-btn-lbl">Guardado</span>';
        if(window.EnferixIcons){
          var ic = saveBtn.querySelector('[data-p2a-icon]');
          if(ic){ ic.innerHTML = window.EnferixIcons.get('check'); ic.classList.add('enfx-ic-slot'); }
        }
        saveBtn.disabled = true;
      });
    }
    if(shareBtn){
      shareBtn.addEventListener('click', function(){ shareResult(payload); });
    }
  }

  function apply(root){
    var L = t();
    var mode = state(root).p22Mode || 'form';
    var rows = Array.from(root.querySelectorAll('#esc35Inputs > .esc35-row'));
    var totalSteps = rows.length + 1;   // +1 = paso final resultado
    var idx = parseInt(state(root).p22Step || '0', 10);
    if(idx < 0) idx = 0;
    if(idx > totalSteps - 1) idx = totalSteps - 1;

    var tools = root.querySelector('.p22-tools');
    var nav = root.querySelector('.p22-nav');

    /* Cabecera visual */
    if(tools){
      tools.querySelectorAll('[data-p22-mode]').forEach(function(b){
        b.classList.toggle('on', b.getAttribute('data-p22-mode') === mode);
        b.setAttribute('aria-selected', String(b.getAttribute('data-p22-mode') === mode));
      });
      var prog = tools.querySelector('.p22-progress');
      if(prog){
        if(mode === 'step'){
          prog.hidden = false;
          var cur = prog.querySelector('.p22-cur');
          var totEl = prog.querySelector('.p22-total');
          var fill = prog.querySelector('.p22-progress-fill');
          var scoreWrap = prog.querySelector('.p22-score');
          var scoreVal = prog.querySelector('.p22-score-val');
          if(cur) cur.textContent = String(Math.min(idx + 1, totalSteps));
          if(totEl) totEl.textContent = String(totalSteps);
          if(fill) fill.style.width = ((idx + 1) / totalSteps * 100).toFixed(1) + '%';
          var s = currentScore();
          if(scoreWrap && scoreVal){
            if(s != null){ scoreWrap.hidden = false; scoreVal.textContent = String(s); }
            else{ scoreWrap.hidden = true; }
          }
        } else {
          prog.hidden = true;
        }
      }
    }

    /* Mostrar/ocultar rows y panel final */
    var isFinal = mode === 'step' && idx >= rows.length;
    rows.forEach(function(row, i){
      if(mode === 'step'){
        var showThis = (i === idx);
        row.classList.toggle('p22-current', showThis && !isFinal);
        row.classList.toggle('p22-hidden', !showThis || isFinal);
        if(showThis && !isFinal){
          /* Convertir select largo en botones + auto-advance */
          selectToButtons(row, function(){
            var next = Math.min(totalSteps - 1, idx + 1);
            state(root).p22Step = String(next);
            apply(root);
          });
        } else {
          restoreSelect(row);
        }
      } else {
        row.classList.remove('p22-current','p22-hidden');
        restoreSelect(row);
      }
    });

    /* Panel final */
    var finalPanel = root.querySelector('.p22-final');
    if(isFinal){
      renderFinalPanel(root);
      finalPanel = root.querySelector('.p22-final');
      if(finalPanel) finalPanel.hidden = false;
    } else if(finalPanel){
      finalPanel.hidden = true;
    }

    /* Nav buttons */
    if(nav){
      if(mode === 'step'){
        nav.classList.add('on');
        var prev = nav.querySelector('.p22-prev');
        var next = nav.querySelector('.p22-next');
        if(prev) prev.disabled = idx === 0;
        if(next){
          if(isFinal){
            next.innerHTML = '↻ ' + esc(L.restart);
            next.classList.add('p22-restart');
            next.onclick = function(){
              /* En vez de re-render, solo volver al paso 0. */
              state(root).p22Step = '0';
              apply(root);
            };
          } else {
            next.innerHTML = (idx >= rows.length - 1 ? esc(L.see) : esc(L.next) + ' →');
            next.classList.remove('p22-restart');
            next.onclick = null;   /* usa el listener delegado */
          }
        }
      } else {
        nav.classList.remove('on');
      }
    }
  }

  function ensureP22(root){
    if(!root) return;
    var rows = root.querySelectorAll('#esc35Inputs > .esc35-row');
    if(!rows.length || rows.length <= THRESHOLD){
      root.classList.remove('p22-active');
      var toolsOld = root.querySelector('.p22-tools'); if(toolsOld) toolsOld.remove();
      var navOld = root.querySelector('.p22-nav'); if(navOld) navOld.remove();
      var finalOld = root.querySelector('.p22-final'); if(finalOld) finalOld.remove();
      root.querySelectorAll('.esc35-row').forEach(function(r){
        r.classList.remove('p22-current','p22-hidden');
        restoreSelect(r);
      });
      return;
    }
    root.classList.add('p22-active');
    setupToggle(root, Array.from(rows));
  }

  function scan(){
    document.querySelectorAll('.esc35-calc').forEach(ensureP22);
  }

  var mo = null;
  function safeScan(){
    if(mo){ try{ mo.disconnect(); }catch(e){} }
    scan();
    if(mo){ try{ mo.observe(document.body, { childList:true, subtree:true }); }catch(e){} }
  }
  function boot(){
    safeScan();
    mo = new MutationObserver(function(muts){
      var relevant = false;
      for(var i=0;i<muts.length && !relevant;i++){
        var m = muts[i];
        if(m.type !== 'childList') continue;
        for(var j=0;j<m.addedNodes.length;j++){
          var n = m.addedNodes[j];
          if(n.nodeType !== 1) continue;
          if(n.classList && (n.classList.contains('esc35-calc') ||
              (n.querySelector && n.querySelector('.esc35-calc, #esc35Inputs > .esc35-row')))){
            relevant = true; break;
          }
        }
      }
      if(relevant) safeScan();
    });
    try{ mo.observe(document.body, { childList:true, subtree:true }); }catch(e){}

    /* Refrescar puntos acumulados cuando cambie el resultado. */
    var scoreMo = new MutationObserver(function(){
      var root = document.querySelector('.esc35-calc.p22-active');
      if(!root) return;
      var tools = root.querySelector('.p22-tools');
      if(!tools) return;
      var scoreWrap = tools.querySelector('.p22-score');
      var scoreVal = tools.querySelector('.p22-score-val');
      if(!scoreWrap || !scoreVal) return;
      var s = currentScore();
      if(s != null){ scoreWrap.hidden = false; scoreVal.textContent = String(s); }
      else{ scoreWrap.hidden = true; }
    });
    try{
      var resultEl = document.getElementById('esc35Result');
      if(resultEl) scoreMo.observe(resultEl, { childList:true, subtree:true, characterData:true });
    }catch(e){}
    /* Reintenta enganchar el observer del resultado cuando aparezca. */
    var interval = setInterval(function(){
      var resultEl = document.getElementById('esc35Result');
      if(resultEl){
        try{ scoreMo.observe(resultEl, { childList:true, subtree:true, characterData:true }); }catch(e){}
        clearInterval(interval);
      }
    }, 800);
    setTimeout(function(){ clearInterval(interval); }, 30000);
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
