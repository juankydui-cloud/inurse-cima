
(function(){
  'use strict';
  var LOGO = '<img src="/icon-512-v2.png" alt="Enferix">';
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded',fn); }
  function setHtml(sel, html){ var el=document.querySelector(sel); if(el) el.innerHTML=html; }
  function setText(sel, txt){ var el=document.querySelector(sel); if(el) el.textContent=txt; }
  function clickId(id){ var el=document.getElementById(id); if(el) el.click(); }
  ready(function(){
    document.title='Enferix';
    var meta=document.querySelector('meta[name="apple-mobile-web-app-title"]'); if(meta) meta.setAttribute('content','Enferix');
    setText('#splashTitle','Enferix');
    setHtml('header .top .logo', LOGO);
    setHtml('header .top h1','Enferix <small>Asistente clínico de enfermería</small>');
    setHtml('.cc-logo', LOGO);
    setText('.cc-brand h1','Javny'); setText('.cc-brand p','Asistente clínica · Enferix');
    var foot=document.querySelector('.foot'); if(foot) foot.innerHTML='Enferix · Asistente clínico de enfermería<br>Protocolos, calculadoras, ECG, farmacología y Javny';
    // Hero principal adaptado a Guías dentro del menú
    setTimeout(function(){
      var hero=document.getElementById('javnyHero');
      if(hero){
        hero.querySelector('h2').textContent='Enferix';
        hero.querySelector('p').textContent='Tu asistente clínico de enfermería. Las guías clínicas están ahora dentro del menú, separadas por especialidades, para que la pantalla principal quede más limpia.';
        var actions=hero.querySelector('.javny-hero-actions');
        if(actions){
          actions.innerHTML='<button class="javny-action" data-act="guides"><span>📚</span>Guías clínicas</button><button class="javny-action" data-act="search"><span>🔎</span>Buscar</button><button class="javny-action" data-act="calc"><span>🧮</span>Calculadoras</button><button class="javny-action" data-act="chat"><span>✨</span>Hablar con Javny</button>';
          actions.addEventListener('click',function(e){var b=e.target.closest('button'); if(!b) return; var a=b.dataset.act; if(a==='guides') clickId('v29MenuBtn'); } , true);
        }
      }
      var main=document.querySelector('main');
      if(main && !document.getElementById('inurseHomeNote')){
        var note=document.createElement('div'); note.id='inurseHomeNote'; note.className='inurse-home-note';
        note.innerHTML='<b>Guías clínicas:</b> abre el menú superior y entra en el apartado Guías clínicas. Allí están organizadas por especialidades, incluida Farmacología de UCI dentro de UCI / Medicina Intensiva.';
        main.insertBefore(note, main.firstChild);
      }
    },350);

    // Ajustar menú v29 cuando exista
    setTimeout(function(){
      setHtml('.v29-head .mk', LOGO);
      setHtml('.v29-head h2','Enferix<small>Menú principal</small>');
      var firstSec=document.querySelector('#v29Panel .v29-sec');
      if(firstSec){ firstSec.textContent='Guías clínicas'; firstSec.classList.add('guides-title'); }
      // Renombrar especialidad UCI e incluir farmacología dentro de UCI/Medicina Intensiva
      if(window.__SPEC_SETS && Array.isArray(window.__SPEC_SETS.intensiva) && window.__SPEC_SETS.intensiva.indexOf('farm')<0) window.__SPEC_SETS.intensiva.push('farm');
      var specs=document.querySelectorAll('#v29Panel .v29-spec');
      specs.forEach(function(sp){
        if(sp.getAttribute('data-spec')==='intensiva'){
          var nm=sp.querySelector('.nm'); if(nm) nm.textContent='UCI / Medicina Intensiva';
        }
      });
      // Evitar duplicar farmacología fuera de UCI si apareciera como fila consulta
      var rows=document.querySelectorAll('#v29Panel .v29-row .nm');
      rows.forEach(function(nm){ if(/Farmacología de UCI/i.test(nm.textContent)) nm.closest('.v29-row').setAttribute('data-hide','1'); });
    },500);

    // Estado home: no mostrar todas las fichas por defecto
    window.__INURSE_HOME = true;
    var originalRender = window.render;
    if(typeof originalRender==='function' && !window.__INURSE_RENDER_WRAPPED){
      window.__INURSE_RENDER_WRAPPED = true;
      window.render = function(){
        var isHome = window.__INURSE_HOME && typeof activeCat!=='undefined' && activeCat==='all' && (!query);
        document.body.classList.toggle('inurse-home', !!isHome);
        if(isHome){
          var c=document.getElementById('count'); if(c) c.textContent='';
          var cont=document.getElementById('content'); if(cont) cont.innerHTML='';
          return;
        }
        document.body.classList.remove('inurse-home');
        return originalRender.apply(this, arguments);
      };
      window.render();
    }
    // Cualquier búsqueda o navegación a guías saca de la home
    var search=document.getElementById('search');
    if(search) search.addEventListener('input',function(){ window.__INURSE_HOME=false; }, true);
    document.addEventListener('click',function(e){
      if(e.target.closest('.v29-doc,.v29-seeall')) window.__INURSE_HOME=false;
      if(e.target.closest('#v29HomeBtn')){ window.__INURSE_HOME=true; setTimeout(function(){ if(typeof render==='function') render(); },40); }
    }, true);
    // Mejorar dock y garantizar cálculo dentro de barra inferior
    setTimeout(function(){
      var stack=document.querySelector('.fab-stack');
      if(stack){
        ['atlasFab','recFab','askFab'].forEach(function(id){var b=document.getElementById(id); if(b) b.style.display='none';});
        function lab(id,em,lbl){var b=document.getElementById(id); if(!b) return; b.innerHTML='<span class="dk-em">'+em+'</span><span class="dk-lbl">'+lbl+'</span>'; stack.appendChild(b);}
        lab('calcFab','🧮','Cálculo'); lab('rxFab','🩻','RX'); lab('ecgFab','📈','ECG');
        var javny=document.getElementById('javnyFab');
        if(!javny){javny=document.createElement('button');javny.id='javnyFab';javny.addEventListener('click',function(){var f=document.getElementById('ccFab'); if(f) f.click();});}
        javny.innerHTML='<span class="dk-em">✨</span><span class="dk-lbl">Javny</span>'; stack.appendChild(javny);
        var cf=document.getElementById('ccFab'); if(cf) cf.style.display='none';
      }
    },800);
  });
})();
