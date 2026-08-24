
(function(){
  'use strict';
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded',fn); }
  ready(function(){ setTimeout(init, 120); });

  var SPECIALTIES = [
    {key:'cardio',    name:'Cardiología',          em:'❤️', color:'#F43F5E', cats:['cardio']},
    {key:'intensiva', name:'Medicina Intensiva',   em:'🏥', color:'#6366F1', cats:['uci','resp','enfoqueuci','anest']},
    {key:'trauma',    name:'Traumatología',        em:'🦴', color:'#DC2626', cats:['trauma','reuma']},
    {key:'urgencias', name:'Urgencias',            em:'🚑', color:'#FB923C', cats:['emer','extra','dolor','alergia','antidoto']},
    {key:'neuro',     name:'Neurología',           em:'🧠', color:'#A855F7', cats:['neuro','ictus']},
    {key:'otras',     name:'Otras especialidades', em:'🩺', color:'#0EA5E9', cats:['onco','infec','endo','gi','gineco','hemat','oftalmo','nefro','derma','ped','obst','orl','imagen','esp']}
  ];
  window.__SPEC_SETS = {};
  SPECIALTIES.forEach(function(s){ window.__SPEC_SETS[s.key] = s.cats; });

  var LOGO_SVG = '<img src="/icon-512-v2.png" alt="Enferix" style="width:100%;height:100%;display:block;object-fit:cover;border-radius:inherit">';

  function docsOf(cats){
    if(typeof DOCS==='undefined') return [];
    return DOCS.filter(function(d){
      var dc = Array.isArray(d.cat)?d.cat:[d.cat];
      return cats.some(function(c){ return dc.indexOf(c)>=0; });
    });
  }

  function init(){
    if(document.getElementById('v29MenuBtn')) return;

    /* --- Logo nuevo en cabecera --- */
    var logo = document.querySelector('.top .logo');
    if(logo){ logo.textContent=''; logo.innerHTML = LOGO_SVG; }

    /* --- Botones de acción (Inicio + Menú) --- */
    var top = document.querySelector('header .top');
    if(top){
      var acts = document.createElement('div');
      acts.className = 'v29-actions';
      var hb = document.createElement('button');
      hb.id='v29HomeBtn'; hb.setAttribute('aria-label','Inicio'); hb.title='Inicio';
      hb.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></svg>';
      var mb = document.createElement('button');
      mb.id='v29MenuBtn'; mb.setAttribute('aria-haspopup','true'); mb.setAttribute('aria-expanded','false');
      mb.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg><span class="lbl">Menú</span>';
      acts.appendChild(hb); acts.appendChild(mb);
      top.appendChild(acts);
      hb.addEventListener('click', resetToHome);
      mb.addEventListener('click', function(e){ e.stopPropagation(); openDrawer(); });
    }

    buildDrawer();
    fixDock();
  }

  /* ============ DRAWER ============ */
  var ov, panel;
  function buildDrawer(){
    ov = document.createElement('div'); ov.id='v29Ov';
    panel = document.createElement('div'); panel.id='v29Panel'; panel.setAttribute('role','navigation'); panel.setAttribute('aria-label','Menú de guías clínicas por especialidad');

    var head = '<div class="v29-head"><span class="mk">'+LOGO_SVG+'</span>'+
      '<h2>Enferix<small>Guías clínicas por especialidad</small></h2>'+
      '<button class="v29-x" id="v29Close" aria-label="Cerrar">✕</button></div>';

    var body = '<div class="v29-body">';

    /* Especialidades (shells vacíos; se pueblan al abrir el menú) */
    body += '<div class="v29-sec">Especialidades</div>';
    SPECIALTIES.forEach(function(s){
      body += '<div class="v29-spec" data-spec="'+s.key+'" style="--sc:'+s.color+'">'+
        '<div class="v29-sh" role="button" tabindex="0">'+
          '<span class="em">'+s.em+'</span>'+
          '<div style="flex:1"><div class="nm">'+esc(s.name)+'</div><div class="ct" data-ct="'+s.key+'">…</div></div>'+
          '<span class="chev">▼</span></div>'+
        '<div class="v29-slist"><div data-list="'+s.key+'"></div></div>'+
      '</div>';
    });

    /* Consulta */
    body += '<div class="v29-sec">Consulta</div>';
    body += '<button class="v29-row" id="v29Vade" style="--sc:#EC4899"><span class="em">💊</span>'+
      '<span class="nm">Vademécum<small>Todos los fármacos</small></span><span class="go">›</span></button>';
    body += '<button class="v29-row" id="v29Pato" style="--sc:#14B8A6"><span class="em">🗂️</span>'+
      '<span class="nm">Patologías<small>Por capítulos (CIE-10)</small></span><span class="go">›</span></button>';

    /* Herramientas */
    body += '<div class="v29-sec">Herramientas</div><div class="v29-tools">';
    body += toolRow('v29Atlas','🫀','Atlas ECG','#F43F5E');
    body += toolRow('v29Triage','🤖','Triage IA','#22D3EE');
    body += toolRow('v29Train','🎓','Entrenamiento','#FACC15');
    body += toolRow('v29Sos','🆘','SOS','#EF4444');
    body += toolRow('v29Share','📤','Compartir','#14B8A6');
    body += toolRow('v29Theme','🌓','Tema','#8B5CF6');
    body += '</div>';

    body += '</div>';

    panel.innerHTML = head + body;
    document.body.appendChild(ov);
    document.body.appendChild(panel);

    ov.addEventListener('click', closeDrawer);
    document.getElementById('v29Close').addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeDrawer(); });

    /* Acordeón */
    panel.querySelectorAll('.v29-spec .v29-sh').forEach(function(sh){
      var toggleAcc = function(){ sh.parentNode.classList.toggle('open'); };
      sh.addEventListener('click', toggleAcc);
      sh.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggleAcc(); } });
    });
    /* Consulta y herramientas → disparan los nodos originales */
    wire('v29Vade', 'vadeBtn');
    document.getElementById('v29Pato').addEventListener('click', function(){ goToPatologias(); });
    wire('v29Atlas','atlasFab'); wire('v29Triage','triageBtn'); wire('v29Train','trainBtn');
    wire('v29Sos','sosBtn'); wire('v29Share','shareAllBtn');
    document.getElementById('v29Theme').addEventListener('click', function(){
      var t=document.getElementById('themeBtn'); if(t) t.click(); /* el tema no cierra el menú */
    });
  }

  function toolRow(id, em, name, color){
    return '<button class="v29-row" id="'+id+'" style="--sc:'+color+'"><span class="em">'+em+'</span><span class="nm">'+name+'</span></button>';
  }
  function wire(myId, origId){
    var el = document.getElementById(myId);
    if(!el) return;
    el.addEventListener('click', function(){
      var orig = document.getElementById(origId);
      if(orig) orig.click();
      closeDrawer();
    });
  }
  var _populated=false;
  function populateSpecs(retries){
    if(_populated) return;
    if(typeof DOCS==='undefined'){ if((retries||0)<20){ setTimeout(function(){populateSpecs((retries||0)+1);},200); } return; }
    SPECIALTIES.forEach(function(s){
      var docs = docsOf(s.cats);
      var ct = panel.querySelector('[data-ct="'+s.key+'"]');
      if(ct) ct.textContent = docs.length + ' ' + (docs.length===1?'guía':'guías');
      var host = panel.querySelector('[data-list="'+s.key+'"]');
      if(!host) return;
      var preview = docs.slice(0,8);
      var html = preview.map(function(d){
        return '<button class="v29-doc" data-spec="'+s.key+'" data-doc="'+esc(d.id)+'"><b>'+esc(d.title)+'</b></button>';
      }).join('');
      if(docs.length>8){
        html += '<button class="v29-seeall" data-spec="'+s.key+'">Ver las '+docs.length+' guías de '+esc(s.name)+' →</button>';
      }
      if(!docs.length){
        html = '<button class="v29-seeall" data-spec="'+s.key+'">Abrir esta especialidad →</button>';
      }
      host.innerHTML = html;
      host.querySelectorAll('.v29-doc').forEach(function(b){
        b.addEventListener('click', function(){ goToDoc(b.dataset.spec, b.dataset.doc); });
      });
      host.querySelectorAll('.v29-seeall').forEach(function(b){
        b.addEventListener('click', function(){ goToSpec(b.dataset.spec); });
      });
    });
    _populated=true;
  }
  function openDrawer(){ populateSpecs(0); ov.classList.add('on'); panel.classList.add('on'); document.body.style.overflow='hidden';
    var b=document.getElementById('v29MenuBtn'); if(b) b.setAttribute('aria-expanded','true'); }
  function closeDrawer(){ ov.classList.remove('on'); panel.classList.remove('on'); document.body.style.overflow='';
    var b=document.getElementById('v29MenuBtn'); if(b) b.setAttribute('aria-expanded','false'); }

  /* ============ NAVEGACIÓN A LA GUÍA ============ */
  function resetToHome(){
    try{ closeDrawer(); }catch(e){}
    var ccw=document.getElementById('ccWrap'); if(ccw) ccw.classList.add('hide');
    var ccf=document.getElementById('ccFab'); if(ccf) ccf.classList.add('on');
    try{ localStorage.setItem('guiaHJ23_home_v3','0'); }catch(e){}
    resetView();
    if(typeof render==='function') render();
    window.scrollTo({top:0, behavior:'smooth'});
  }
  function resetView(){
    query=''; activeCat='all';
    var s=document.getElementById('search'); if(s) s.value='';
    var cb=document.getElementById('clearBtn'); if(cb) cb.style.display='none';
  }
  function goToSpec(specKey){
    closeDrawer(); resetView();
    activeCat='spec:'+specKey;
    if(typeof render==='function') render();
    window.scrollTo({top:0, behavior:'smooth'});
  }
  function goToDoc(specKey, id){
    closeDrawer(); resetView();
    activeCat='spec:'+specKey;
    if(typeof render==='function') render();
    setTimeout(function(){
      var el=document.getElementById('card-'+id);
      if(el){ if(typeof toggle==='function') toggle(id); el.scrollIntoView({behavior:'smooth', block:'center'}); }
    }, 90);
  }
  function goToPatologias(){
    closeDrawer(); resetView();
    activeCat='patologias';
    if(typeof render==='function') render();
    window.scrollTo({top:0, behavior:'smooth'});
  }

  /* ============ DOCK DE 4 ICONOS ============ */
  function fixDock(){
    var stack = document.querySelector('.fab-stack');
    if(!stack) return;
    ['atlasFab','recFab','askFab'].forEach(function(id){
      var b=document.getElementById(id); if(b) b.style.display='none';
    });
    relabel('rxFab','🩻','Radiografía');
    relabel('ecgFab','📈','ECG');
    relabel('calcFab','🧮','Cálculo');
    /* Orden: Cálculo · Radiografía · ECG · Javny */
    ['calcFab','rxFab','ecgFab'].forEach(function(id){
      var b=document.getElementById(id); if(b) stack.appendChild(b);
    });
    if(!document.getElementById('javnyFab')){
      var javny=document.createElement('button'); javny.id='javnyFab';
      javny.innerHTML='<span class="dk-em">✨</span><span class="dk-lbl">Javny</span>';
      javny.addEventListener('click', function(){ var f=document.getElementById('ccFab'); if(f) f.click(); });
      stack.appendChild(javny);
    }
    var cf=document.getElementById('ccFab'); if(cf) cf.style.display='none';
  }
  function relabel(id, em, lbl){
    var b=document.getElementById(id); if(!b) return;
    b.innerHTML='<span class="dk-em">'+em+'</span><span class="dk-lbl">'+lbl+'</span>';
  }

  function esc(s){ return (s||'').replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
})();
