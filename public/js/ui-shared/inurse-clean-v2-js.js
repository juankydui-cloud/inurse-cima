
(function(){
  'use strict';
  function qs(s){return document.querySelector(s)}
  function clickId(id){var e=document.getElementById(id);if(e){e.click();return true}return false}
  function setContentMode(){document.body.classList.add('in60-content-mode')}
  function closeDrawer(){
    var ov=document.getElementById('v29Ov'), p=document.getElementById('v29Panel');
    if(ov)ov.classList.remove('on'); if(p)p.classList.remove('on'); document.body.style.overflow='';
  }
  function activateChip(cat){
    document.querySelectorAll('.chip').forEach(function(c){c.classList.toggle('active',c.dataset.c===cat)});
  }
  function openPathologies(){
    closeDrawer(); setContentMode();
    try{ activeCat='patologias'; query=''; }catch(e){ window.activeCat='patologias'; window.query=''; }
    var s=document.getElementById('search');if(s)s.value='';
    activateChip('patologias');
    try{ if(typeof renderPatologias==='function')renderPatologias(); else if(typeof render==='function')render(); }
    catch(e){ clickId('v29Pato'); }
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function openVademecum(){
    closeDrawer();
    try{ if(typeof window.EnferixOpenFarmacos==='function'){window.EnferixOpenFarmacos();return} }catch(e){}
    try{ if(typeof openVade==='function'){openVade();return} }catch(e){}
    clickId('vadeBtn');
  }
  function openMore(){ if(clickId('v29MenuBtn'))return; }

  function enrichHome(){
    var shell=qs('#in50Home .in60-shell'); if(!shell)return;
    var recent=qs('#in50Home .in60-recent');
    var old=qs('#in50Home .in60-consult-wrap'); if(old)return;
    var wrap=document.createElement('section'); wrap.className='in60-consult-wrap';
    wrap.innerHTML=''+
      '<div class="in60-secondary-title">Consulta rápida</div><div class="in60-consult">'+
        '<button class="in60-action" data-in61="pathologies"><span class="ico">🗂️</span><b>Patologías</b><small>Por sistemas, definición, alertas, tratamiento y fármacos relacionados.</small></button>'+
        '<button class="in60-action" data-in61="vademecum"><span class="ico">💊</span><b>Vademécum</b><small>Fichas de medicación, administración, precauciones y lectura en voz alta.</small></button>'+
      '</div><div class="in60-more"><button data-in61="more">☰ Más herramientas y especialidades</button></div>';
    if(recent)shell.insertBefore(wrap,recent);else shell.appendChild(wrap);
    wrap.addEventListener('click',function(e){var b=e.target.closest('[data-in61]');if(!b)return;var k=b.dataset.in61;if(k==='pathologies')openPathologies();if(k==='vademecum')openVademecum();if(k==='more')openMore()});
  }

  /* Dock de lectura compatible con fichas, vademécum y Javny */
  function ensureSpeechDock(){
    var d=document.getElementById('in61SpeechDock'); if(d)return d;
    d=document.createElement('div');d.id='in61SpeechDock';d.setAttribute('role','region');d.setAttribute('aria-label','Controles de lectura');
    d.innerHTML='<span class="in61-wave">🔊</span><span class="in61-label">Lectura en voz alta</span><button data-sp="pause">⏸ Pausar</button><button data-sp="resume" style="display:none">▶ Continuar</button><button class="stop" data-sp="stop">⏹ Detener</button>';
    document.body.appendChild(d);
    d.addEventListener('click',function(e){var b=e.target.closest('[data-sp]');if(!b||!window.speechSynthesis)return;var a=b.dataset.sp;
      if(a==='pause'){speechSynthesis.pause(); syncSpeechDock()}
      if(a==='resume'){speechSynthesis.resume(); syncSpeechDock()}
      if(a==='stop'){try{ if(typeof stopSpeak==='function')stopSpeak(); else speechSynthesis.cancel(); }catch(x){speechSynthesis.cancel()} hideSpeechDock();}
    });
    return d;
  }
  function hideSpeechDock(){var d=ensureSpeechDock();d.classList.remove('on');}
  function syncSpeechDock(){
    var d=ensureSpeechDock(), ss=window.speechSynthesis;if(!ss)return;
    var active=ss.speaking||ss.pending||ss.paused;
    d.classList.toggle('on',!!active);
    var p=d.querySelector('[data-sp="pause"]'),r=d.querySelector('[data-sp="resume"]');
    if(p)p.style.display=ss.paused?'none':''; if(r)r.style.display=ss.paused?'':'none';
    if(!active)document.querySelectorAll('.tool.speaking,.ans-tool.speaking').forEach(function(b){b.classList.remove('speaking')});
  }
  function labelSpeechSource(target){
    var title='Lectura en voz alta';
    var card=target&&target.closest('.card,.vcard,.pato-drug,#ccWrap,.modal');
    if(card){var t=card.querySelector('.ctitle,.vc-name,.pd-name,.cc-brand h1,.modal-head h2');if(t)title=(t.textContent||'').trim()||title}
    var lab=ensureSpeechDock().querySelector('.in61-label');if(lab)lab.textContent=title;
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;var tx=(b.textContent||'').toLowerCase();
    if(tx.includes('escuchar')||tx.includes('leer')||tx.includes('parar')){labelSpeechSource(b);setTimeout(syncSpeechDock,80);setTimeout(syncSpeechDock,350)}
    if(b.closest('.modal-close,.vade-x,.pato-back')||b.id==='vadeClose')setTimeout(function(){try{speechSynthesis.cancel()}catch(x){}hideSpeechDock()},40);
  },true);
  setInterval(syncSpeechDock,1200);
  document.addEventListener('visibilitychange',function(){if(document.hidden){try{speechSynthesis.pause()}catch(e){}syncSpeechDock()}});
  window.addEventListener('beforeunload',function(){try{speechSynthesis.cancel()}catch(e){}});

  function boot(){enrichHome();ensureSpeechDock()}
  if(document.readyState!=='loading')boot();else document.addEventListener('DOMContentLoaded',boot);
  [100,450,1000,1800,2800].forEach(function(t){setTimeout(boot,t)});
  window.EnferixCleanV2={pathologies:openPathologies,vademecum:openVademecum,speech:syncSpeechDock};
})();
