
(function(){
  'use strict';
  var rendering=false;
  function click(id){var el=document.getElementById(id);if(el){el.click();return true}return false}
  function openTool(kind){
    if(kind==='guides'){ if(click('v29MenuBtn')) return; }
    if(kind==='calc'){ if(typeof window.openCalcs==='function'){window.openCalcs('perf');return} if(click('calcFab'))return; }
    if(kind==='rx'){ var ro=document.getElementById('rxOverlay'); if(ro){ro.classList.add('show');try{if(typeof window.checkApiKeyUI==='function')window.checkApiKeyUI()}catch(e){}return} if(typeof window.openRx==='function'){window.openRx();return} if(click('rxFab'))return; }
    if(kind==='ecg'){ var eo=document.getElementById('ecgOverlay'); if(eo){eo.classList.add('show');try{if(typeof window.checkApiKeyUI==='function')window.checkApiKeyUI()}catch(e){}return} if(typeof window.openEcg==='function'){window.openEcg();return} if(click('ecgFab'))return; }
    if(kind==='evidencia'){ location.href='evidencia.html'; return; }
    if(kind==='literatura'){ location.href='literatura.html'; return; }
    if(kind==='javny'){
      var f=document.getElementById('ccFab'); if(f){f.click();return}
      var w=document.getElementById('ccWrap'); if(w){w.classList.remove('hide');w.classList.add('on');w.style.display='flex'}
    }
  }
  function forceSplashOff(){
    var sp=document.getElementById('splash'); if(!sp)return;
    sp.classList.add('inurse-force-hide');
    setTimeout(function(){if(sp&&sp.parentNode)sp.parentNode.removeChild(sp)},180);
  }
  function cleanBrand(){
    document.title='Enferix · Guía clínica interactiva';
    document.querySelectorAll('.cc-brand p').forEach(function(e){e.textContent='Asistente clínica · Enferix'});
    var mh=document.querySelector('#v29Panel .v29-head h2');
    if(mh)mh.innerHTML='Enferix<small>Guías clínicas por especialidad</small>';
    var foot=document.querySelector('.foot'); if(foot)foot.innerHTML='Enferix · Asistente clínico de enfermería<br>Guías, calculadoras, imagen, ECG, farmacología y Javny';
  }
  function recentMarkup(){
    var old=document.getElementById('in50Recent');
    if(old && old.innerHTML.trim()) return old.innerHTML;
    return '<div class="in60-empty">Tus últimas consultas aparecerán aquí.</div>';
  }
  function renderHome(){
    if(rendering)return;
    var home=document.getElementById('in50Home'); if(!home)return;
    if(home.dataset.cleanV1==='1' && home.querySelector('.in60-shell'))return;
    rendering=true;
    var rec=recentMarkup();
    home.innerHTML=''+
      '<div class="in60-shell">'+
        '<section class="in60-panel">'+
          '<div class="in60-head">'+
            '<div class="in60-logo">🩺</div>'+
            '<div class="in60-title"><h2>Enferix</h2><p>Guías clínicas, cálculo, imagen y electrocardiografía en una pantalla clara y rápida.</p></div>'+
            '<button class="in60-javny" data-in60="javny" aria-label="Abrir Javny"><span class="in60-javny-face"></span><b>Javny</b></button>'+
          '</div>'+
          '<div class="in60-actions">'+
            '<button class="in60-action" data-in60="guides"><span class="ico">📚</span><b>Guías clínicas</b><small>Protocolos organizados por especialidades.</small></button>'+
            '<button class="in60-action" data-in60="calc"><span class="ico">🧮</span><b>Cálculo</b><small>Dosis, perfusiones y escalas clínicas.</small></button>'+
            '<button class="in60-action" data-in60="rx"><span class="ico">🩻</span><b>Rayos X</b><small>Apoyo visual para imágenes radiológicas.</small></button>'+
            '<button class="in60-action" data-in60="ecg"><span class="ico">📈</span><b>Electro</b><small>Lectura de ECG, análisis y entrenamiento.</small></button>'+
            '<button class="in60-action" data-in60="evidencia"><span class="ico">📚</span><b>Biblioteca de Evidencia</b><small>Literatura clínica de Europe PMC (PubMed, PMC y preprints).</small></button>'+
            '<button class="in60-action" data-in60="literatura"><span class="ico">🔬</span><b>Literatura Científica</b><small>Búsqueda en PubMed + Crossref (140M+ artículos).</small></button>'+
          '</div>'+
        '</section>'+
        '<section class="in60-recent"><div class="in60-recent-head">Últimos consultados</div><div id="in50Recent">'+rec+'</div></section>'+
      '</div>';
    home.dataset.cleanV1='1';
    home.onclick=function(e){var b=e.target.closest('[data-in60]');if(b)openTool(b.dataset.in60)};
    rendering=false;
  }
  function removeDuplicates(){
    ['javnyHero','in52Critical'].forEach(function(id){var e=document.getElementById(id);if(e)e.remove()});
    document.querySelectorAll('.in57-quick-grid,.in57-mini-grid,.in50-quick-grid,.in50-shortcuts').forEach(function(e){e.remove()});
  }
  function apply(){forceSplashOff();cleanBrand();removeDuplicates();renderHome()}
  if(document.readyState!=='loading')apply(); else document.addEventListener('DOMContentLoaded',apply);
  [60,350,900,1600,2600].forEach(function(ms){setTimeout(apply,ms)});
  var obs=new MutationObserver(function(){
    var h=document.getElementById('in50Home');
    if(h && (!h.querySelector('.in60-shell') || h.dataset.cleanV1!=='1')){h.dataset.cleanV1='';renderHome()}
    forceSplashOff();
  });
  if(document.documentElement)obs.observe(document.documentElement,{childList:true,subtree:true});
  window.EnferixCleanV1={home:renderHome,open:openTool};
})();
