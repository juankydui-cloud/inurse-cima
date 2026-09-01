/* P2.2 · Modo paso a paso para escalas largas
   Componente aislado: NO toca el JS del monolito de escalas. Observa
   la vista `.esc35-calc` y, cuando la escala tiene más de N campos,
   añade arriba un toggle Formulario/Paso a paso.

   En "paso a paso":
     · Se muestra un solo `.esc35-row` a la vez.
     · Barra de progreso con contador (n / total).
     · Botones Anterior / Siguiente. En el último paso, Siguiente pasa
       a "Ver resultado" que scrollea al `.esc35-result`.
   El propio motor de la escala re-renderiza los inputs si se cambia de
   escala; el observer re-inyecta el modo tras cada re-render.
*/
(function(){
  'use strict';
  var THRESHOLD = 6;   // solo escalas con más de N filas

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
    es: { form:'Formulario', paso:'Paso a paso', prev:'Anterior', next:'Siguiente', see:'Ver resultado', of:'de' },
    ca: { form:'Formulari',  paso:'Pas a pas',  prev:'Anterior', next:'Següent',    see:'Veure resultat', of:'de' }
  };
  function t(){ return LANG[detectLang()] || LANG.es; }

  function state(root){
    /* Guardamos el estado en dataset del calc para que sobreviva
       re-renders de otras escalas del mismo tipo. */
    return root.dataset;
  }

  function setupToggle(root, rows){
    var L = t();
    var mode = state(root).p22Mode || 'form';   // 'form' | 'step'
    var stepIdx = parseInt(state(root).p22Step || '0', 10);
    if(stepIdx < 0 || stepIdx >= rows.length) stepIdx = 0;

    /* Header con toggle + progreso */
    var tools = root.querySelector('.p22-tools');
    if(!tools){
      tools = document.createElement('div');
      tools.className = 'p22-tools';
      tools.innerHTML =
        '<div class="p22-modeswitch" role="tablist" aria-label="Modo de escala">'
        + '<button type="button" class="p22-mode" data-p22-mode="form" role="tab">🗒️ '+esc(L.form)+'</button>'
        + '<button type="button" class="p22-mode" data-p22-mode="step" role="tab">🪜 '+esc(L.paso)+'</button>'
        + '</div>'
        + '<div class="p22-progress" hidden>'
        +   '<div class="p22-progress-bar"><span class="p22-progress-fill"></span></div>'
        +   '<div class="p22-progress-text"><b class="p22-cur">1</b>/<span class="p22-total">'+rows.length+'</span></div>'
        + '</div>';
      /* Insertar justo antes de `#esc35Inputs` */
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
      /* Actualizar totales al reinyectar. */
      var tot = tools.querySelector('.p22-total');
      if(tot) tot.textContent = String(rows.length);
    }

    /* Botones de navegación al final del bloque de inputs */
    var nav = root.querySelector('.p22-nav');
    if(!nav){
      nav = document.createElement('div');
      nav.className = 'p22-nav';
      nav.innerHTML =
        '<button type="button" class="p22-btn p22-prev">← '+esc(L.prev)+'</button>'
        + '<button type="button" class="p22-btn p22-next">'+esc(L.next)+' →</button>';
      var inputs = root.querySelector('#esc35Inputs');
      if(inputs) inputs.parentNode.insertBefore(nav, inputs.nextSibling);
      nav.addEventListener('click', function(e){
        var b = e.target.closest('.p22-prev, .p22-next');
        if(!b) return;
        var rows = Array.from(root.querySelectorAll('#esc35Inputs > .esc35-row'));
        var cur = parseInt(state(root).p22Step || '0', 10);
        if(b.classList.contains('p22-prev')){
          cur = Math.max(0, cur - 1);
        } else {
          if(cur >= rows.length - 1){
            var res = root.querySelector('#esc35Result');
            if(res){ res.scrollIntoView({behavior:'smooth', block:'start'}); return; }
          }
          cur = Math.min(rows.length - 1, cur + 1);
        }
        state(root).p22Step = String(cur);
        apply(root);
      });
    }

    apply(root);
  }

  function apply(root){
    var L = t();
    var mode = state(root).p22Mode || 'form';
    var rows = Array.from(root.querySelectorAll('#esc35Inputs > .esc35-row'));
    var idx = parseInt(state(root).p22Step || '0', 10);
    if(idx < 0) idx = 0;
    if(idx >= rows.length) idx = rows.length - 1;

    var tools = root.querySelector('.p22-tools');
    var nav = root.querySelector('.p22-nav');
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
          var fill = prog.querySelector('.p22-progress-fill');
          if(cur) cur.textContent = String(idx + 1);
          if(fill) fill.style.width = ((idx + 1) / rows.length * 100).toFixed(1) + '%';
        } else {
          prog.hidden = true;
        }
      }
    }

    rows.forEach(function(row, i){
      if(mode === 'step'){
        row.classList.toggle('p22-current', i === idx);
        row.classList.toggle('p22-hidden', i !== idx);
      } else {
        row.classList.remove('p22-current');
        row.classList.remove('p22-hidden');
      }
    });

    if(nav){
      if(mode === 'step'){
        nav.classList.add('on');
        var prev = nav.querySelector('.p22-prev');
        var next = nav.querySelector('.p22-next');
        if(prev) prev.disabled = idx === 0;
        if(next) next.innerHTML = (idx >= rows.length - 1 ? esc(L.see) : esc(L.next) + ' →');
      } else {
        nav.classList.remove('on');
      }
    }
  }

  function ensureP22(root){
    if(!root) return;
    var rows = root.querySelectorAll('#esc35Inputs > .esc35-row');
    /* Elimina modo si ya no aplica (menos filas que el umbral). */
    if(!rows.length || rows.length <= THRESHOLD){
      root.classList.remove('p22-active');
      var toolsOld = root.querySelector('.p22-tools'); if(toolsOld) toolsOld.remove();
      var navOld = root.querySelector('.p22-nav'); if(navOld) navOld.remove();
      /* Restaurar visibilidad por si venía de una escala larga */
      root.querySelectorAll('.esc35-row').forEach(function(r){ r.classList.remove('p22-current','p22-hidden'); });
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
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
