
/* Enferix · rediseño de inicio (Fase 1): estructura, tarjetas y enganches */
(function(){
  function clickId(id){ var el=document.getElementById(id); if(el){ el.click(); return true; } return false; }
  function openIC(tabId){
    clickId("icFab");
    if(tabId){ setTimeout(function(){ var t=document.querySelector('.icTab[data-id="'+tabId+'"]'); if(t) t.click(); }, 180); }
    return true;
  }
  function fire(k){
    switch(k){
      case "biblioteca": if(window.EnferixVirtualLibrary&&window.EnferixVirtualLibrary.open){ window.EnferixVirtualLibrary.open(); return; } clickId("v29MenuBtn"); return;
      case "guias":      clickId("v29MenuBtn"); return;
      case "evidencia":  location.href="evidencia.html"; return;
      case "literatura": location.href="literatura.html"; return;
      case "patologias": if(window.openPatoSistemas){ window.openPatoSistemas(); return; } if(window.Enferix21&&window.Enferix21.organize){ window.Enferix21.organize("pathology","all"); return; } { var pb=document.querySelector('[data-in192-organize="pathology"]'); if(pb){ pb.click(); return; } } clickId("v29MenuBtn"); return;
      case "farmaco":    if(window.EnferixCima&&window.EnferixCima.open){ window.EnferixCima.open(); return; } clickId("vadeBtn"); return;
      case "calc":       if(typeof window.openCalcs==='function'){ window.openCalcs('perf'); return; } openIC("calc"); return;
      case "rx":         clickId("rxFab") || (window.openRx&&window.openRx()); return;
      case "ecg":        clickId("ecgFab") || (window.openEcg&&window.openEcg()); return;
      case "procedimientos": if(typeof window.openProc==='function'){ window.openProc(); return; } openIC("procedures"); return;
      case "algoritmos": if(typeof window.openAlg==='function'){ window.openAlg(); return; } openIC("alg"); return;
      case "cercanos":   if(typeof window.openNearby==='function'){ window.openNearby(); return; } return;
      case "sos":        if(typeof window.openSos==='function'){ window.openSos(); return; } return;
      case "proyectos":  if(window.EnferixProjects&&window.EnferixProjects.open){ window.EnferixProjects.open(); return; } { var b=document.querySelector("#in63HomeWrap .in63-home-card"); if(b) b.click(); } return;
      case "fuentes":    if(typeof window.EnferixOpenOfficialRepo==='function'){ window.EnferixOpenOfficialRepo(''); return; } return;
      case "perfusiones":if(typeof window.openCalcs==='function'){ window.openCalcs('perf'); return; } openIC("calc"); return;
      case "dosisped":   if(typeof window.openCalcs==='function'){ window.openCalcs('dosisPed'); return; } openIC("calc"); return;
      case "inicio":     window.scrollTo({top:0,behavior:"smooth"}); return;
      case "miturno":  if(window.EnferixTurno&&window.EnferixTurno.open){ window.EnferixTurno.open(); return; } return;
      case "ajustes":  openAjustes(); return;
    }
  }
  /* Menú desplegable del botón Inicio con todos los apartados */
  function buildHomeMenu(){
    var secs=window.INURSE_SECTIONS||[];
    var items=secs.map(function(s){ return '<button class="nx-hmenu-item" data-hmenu="'+s.id+'"><span class="ic">'+(s.em||'🔷')+'</span>'+esc(s.t)+'</button>'; }).join('');
    return '<div class="nx-hmenu" id="nxHomeMenu">'+items+'</div>';
  }
  function closeHomeMenu(){ var m=document.getElementById('nxHomeMenu'); if(m&&m.parentNode) m.parentNode.removeChild(m); }
  function toggleHomeMenu(btn){
    if(document.getElementById('nxHomeMenu')){ closeHomeMenu(); return; }
    var top=btn.closest('.nx-top')||document.querySelector('.nx-top'); if(!top) return;
    top.insertAdjacentHTML('beforeend', buildHomeMenu());
    var menu=document.getElementById('nxHomeMenu');
    if(menu){ menu.style.left=btn.offsetLeft+'px'; menu.style.top=(btn.offsetTop+btn.offsetHeight+8)+'px'; }
  }
  /* Exponer el lanzador de secciones y el registro para el buscador global y la voz */
  window.EnferixOpenSection=fire;
  window.INURSE_SECTIONS=[
    {id:'biblioteca',   t:'Biblioteca virtual',    em:'📚', kw:'biblioteca virtual libros manuales recursos referencia documentacion'},
    {id:'guias',        t:'Guías clínicas',        em:'📋', kw:'guias clinicas protocolos menu especialidad'},
    {id:'evidencia',    t:'Evidencia',             em:'🔬', kw:'evidencia literatura pubmed pmc preprints estudios papers investigacion articulos ciencia'},
    {id:'patologias',   t:'Patologías',            em:'🫁', kw:'patologias enfermedades sistemas alertas tratamiento clinica'},
    {id:'farmaco',      t:'Farmacología',          em:'💊', kw:'farmacologia farmacos vademecum medicamentos cima posologia dosis interacciones pharmacology'},
    {id:'calc',         t:'Calculadoras y cálculos',em:'🧮', kw:'calculadoras calculos escalas perfusiones dosis formulas'},
    {id:'rx',           t:'Rayos X y POCUS',       em:'🩻', kw:'rayos x radiografia imagen pocus ecografia radiologia'},
    {id:'ecg',          t:'Electro / ECG',         em:'📈', kw:'electro ecg electrocardiograma ritmo arritmia electros'},
    {id:'procedimientos',t:'Procedimientos',       em:'📝', kw:'procedimientos tecnicas enfermeria paso a paso material checklist'},
    {id:'algoritmos',   t:'Algoritmos',            em:'🔀', kw:'algoritmos protocolos criticos actuacion pauta emergencia'},
    {id:'cercanos',     t:'Servicios cercanos',    em:'📍', kw:'hospital cercano dea desfibrilador urgencias mas cercano donde puedo ir ubicacion mapa geolocalizacion'},
    {id:'proyectos',    t:'Proyectos ConVive',     em:'👥', kw:'proyectos convive documentos colaborativo trabajo equipo'}
  ];
  var SPECS = [
    {key:'cardio',    em:'❤️', t:'Cardiología',      sc:'#F43F5E'},
    {key:'intensiva', em:'🏥', t:'UCI',               sc:'#6366F1'},
    {key:'urgencias', em:'🚑', t:'Urgencias',         sc:'#FB923C'},
    {key:'neuro',     em:'🧠', t:'Neurología',        sc:'#A855F7'},
    {key:'trauma',    em:'🦴', t:'Trauma',            sc:'#DC2626'},
    {key:'otras',     em:'🩺', t:'Otras',             sc:'#0EA5E9'}
  ];
  var NAV = [
    {k:"inicio",   ic:"🏠", t:"Inicio"},
    {k:"miturno",  ic:"🌙", t:"Mi turno"},
    {k:"calc",     ic:"🧮", t:"Cálculo"},
    {k:"ecg",      ic:"📈", t:"Electros"},
    {k:"rx",       ic:"🩻", t:"Rayos X"},
    {k:"fuentes",  ic:"🏛️", t:"Fuentes"},
    {k:"ajustes",  ic:"⚙️", t:"Ajustes"}
  ];
  function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }
  function recentHTML(){
    var arr=[]; try{ arr=JSON.parse(localStorage.getItem("inurse_recent_v5")||"[]"); }catch(e){}
    arr=(arr||[]).slice(0,5);
    if(!arr.length) return '<div class="nx-empty">El historial se generará al abrir protocolos, fármacos o escalas.</div>';
    return arr.map(function(x){ var lab=x.type==="drug"?"Fármaco":x.type==="scale"?"Escala":"Protocolo"; return '<div class="nx-recent-item" data-q="'+esc(x.title)+'"><span>'+esc(x.title)+'</span><span class="t">'+lab+'</span></div>'; }).join("");
  }
  function javnyAvatar(){
    /* usa el avatar de Javny que ya existe en la app (variables CSS) */
    return '<span class="av" style="background-image:var(--javny-real-avatar,var(--javny-avatar-url));background-size:cover;background-position:center;background-repeat:no-repeat"></span>';
  }
  function specPanel(){
    var saved = '';
    try{ saved = localStorage.getItem('inurse_myspec_v1') || ''; }catch(e){}
    var btns = SPECS.map(function(s){
      return '<button class="nx-spec-btn'+(saved===s.key?' on':'')+'" data-spec="'+s.key+'" style="--sc:'+s.sc+'"><span class="sem">'+s.em+'</span>'+esc(s.t)+'</button>';
    }).join('');
    var specName = saved ? (SPECS.find(function(s){return s.key===saved;})||{}).t || '' : '';
    return '<div class="nx-spec-label"><h3>Mi especialidad</h3>'
      +'<span class="nx-spec-active'+(saved?' show':'') +'" id="nxSpecActive">'+(specName?specName:'')+'</span>'
      +'<button class="nx-spec-all" id="nxSpecAll" title="Todos los protocolos" style="font-size:11px;color:#7f93bd;background:none;border:none;cursor:pointer;padding:3px 6px">✕ Todos</button>'
      +'</div>'
      +'<div class="nx-spec-grid" id="nxSpecGrid">'+btns+'</div>';
  }
  function template(){
    return ''
      + '<div class="nx-wrap">'
      +   '<div class="nx-top">'
      +     '<div class="nx-brand"><div class="nx-logo">🩺</div><div><h1>Enferix</h1><small>Apoyo clínico rápido</small></div></div>'
      +     '<nav class="nx-nav">'+NAV.map(function(n,i){return '<button data-fire="'+n.k+'"'+(i===0?' class="on"':'')+'><span class="ic">'+n.ic+'</span>'+n.t+'</button>';}).join("")+'</nav>'
      +   '</div>'
      +   '<div class="nx-hero">'
      +     '<div class="nx-javny-hero">'
      +       '<button class="nx-javny-id" data-javny="1" title="Abrir la conversación con Javny">'+javnyAvatar()+'<b>Javny</b><small>Tu asistente clínico</small></button>'
      +       '<div class="nx-javny-ask">'
      +         '<textarea id="nxAsk" rows="1" placeholder="Escribe tu pregunta…" autocomplete="off"></textarea>'
      +         '<button class="qmic nx-ask-mic" id="nxAskMic" title="Dictar la pregunta">🎙️</button>'
      +         '<button class="nx-ask-send" id="nxAskSend" title="Enviar a Javny" aria-label="Enviar a Javny">➤</button>'
      +       '</div>'
      +     '</div>'
      +   '</div>'
      +   pharmaCard()
      + '</div>'
      + '<div class="in60-shell" style="display:none"></div>';
  }
  /* Bloque de Farmacología: buscador de medicamentos arriba (texto o voz) y,
     debajo, los tres apartados del área como iconos. */
  function pharmaCard(){
    var tiles=[
      {k:"farmaco",     cls:"vade",  t:"Vademécum",    d:"Fichas técnicas"},
      {k:"interacciones",cls:"inter", t:"Interacciones",d:"Comprobador"},
      {k:"perfusiones", cls:"perf",  t:"Perfusiones",  d:"Y diluciones"}
    ];
    return '<section class="nx-pharma">'
      +  '<div class="nx-pharma-head">'
      +    '<span class="nx-pharma-ico">'+pharmaIcon()+'</span>'
      +    '<span class="nx-pharma-copy"><b>Farmacología</b><small>Busca en la base oficial CIMA-AEMPS</small></span>'
      +  '</div>'
      +  '<div class="nx-pharma-search">'
      +    '<span class="nx-pharma-search-ic">🔎</span>'
      +    '<input id="nxPharmaQ" type="search" autocomplete="off" placeholder="Medicamento…">'
      +    '<button id="nxPharmaMic" class="nx-pharma-mic" title="Buscar por voz" aria-label="Buscar por voz">🎙️</button>'
      +    '<button id="nxPharmaGo" class="nx-pharma-go" title="Buscar en CIMA-AEMPS">Buscar</button>'
      +  '</div>'
      + '</section>';
  }
  function pharmaIcon(){
    return '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">'
      + '<defs><linearGradient id="nxPharmaGrad" x1="0" y1="0" x2="1" y2="1">'
      +   '<stop stop-color="#F472B6"/><stop offset=".5" stop-color="#A855F7"/><stop offset="1" stop-color="#6366F1"/>'
      + '</linearGradient></defs>'
      + '<g transform="rotate(-45 24 24)">'
      +   '<rect x="9" y="16" width="30" height="16" rx="8" fill="url(#nxPharmaGrad)"/>'
      +   '<path d="M24 16h7a8 8 0 0 1 0 16h-7z" fill="#fff" opacity=".3"/>'
      +   '<rect x="9" y="16" width="30" height="16" rx="8" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.5"/>'
      +   '<path d="M24 16v16" stroke="#fff" stroke-opacity=".6" stroke-width="1.6"/>'
      + '</g>'
      + '</svg>';
  }
  /* Lleva la pregunta escrita en el hero al chat de Javny: lo abre, rellena su
     campo y lo envía, para que escribir arriba no obligue a repetir la pregunta. */
  function askJavny(text){
    text=String(text||"").trim(); if(!text) return;
    try{ if(typeof window.openJavnyWithContext==='function'){ window.openJavnyWithContext(text); return; } }catch(e){}
    clickId("ccFab");
    var tries=0;
    (function fill(){
      var ta=document.getElementById("ccTa");
      if(!ta){ if(tries++<25) setTimeout(fill,80); return; }
      ta.value=text; ta.dispatchEvent(new Event("input",{bubbles:true})); ta.focus();
      var send=document.getElementById("ccSend");
      if(send) setTimeout(function(){ send.click(); },60);
    })();
  }
  function forwardSearch(q){
    var nxInp=document.getElementById("nxSearch");
    if(nxInp){ nxInp.value=q; nxInp.focus(); }
    if(typeof window.showGlobalResults==='function'){ window.showGlobalResults(q); return; }
    var real=document.getElementById("search");
    if(real){ real.value=q; real.dispatchEvent(new Event("input",{bubbles:true})); }
  }
  function goToSpec(spec){
    window.__INURSE_HOME = false;
    try{ query=''; activeCat='spec:'+spec; }catch(e){}
    var si=document.getElementById("search"); if(si) si.value='';
    var cb=document.getElementById("clearBtn"); if(cb) cb.style.display="none";
    var h=document.getElementById("in50Home"); if(h) h.style.display="none";
    if(typeof render==='function') render();
    window.scrollTo({top:0, behavior:'smooth'});
  }
  function wire(home){
    home.addEventListener("click",function(e){
      // Ítem del menú de Inicio → abre esa sección
      var hm=e.target.closest("[data-hmenu]"); if(hm){ var hid=hm.dataset.hmenu; closeHomeMenu(); if(window.EnferixOpenSection) window.EnferixOpenSection(hid); return; }
      var f=e.target.closest("[data-fire]"); if(f){
        // El botón "Inicio" despliega el menú de apartados en lugar de solo hacer scroll
        if(f.dataset.fire==='inicio'){ toggleHomeMenu(f); return; }
        closeHomeMenu();
        fire(f.dataset.fire);
        if(f.parentElement&&f.parentElement.classList.contains("nx-nav")){ home.querySelectorAll(".nx-nav button").forEach(function(b){b.classList.toggle("on",b===f);}); }
        return; }
      // Click fuera del menú lo cierra
      if(!e.target.closest("#nxHomeMenu")) closeHomeMenu();
      var v=e.target.closest("[data-javny]"); if(v){ clickId("ccFab"); return; }
      var r=e.target.closest(".nx-recent-item"); if(r){ forwardSearch(r.getAttribute("data-q")); return; }
      var sb=e.target.closest(".nx-spec-btn"); if(sb){
        var spec=sb.dataset.spec;
        home.querySelectorAll(".nx-spec-btn").forEach(function(b){ b.classList.toggle("on", b===sb); });
        var specInfo=SPECS.find(function(s){return s.key===spec;});
        var a=home.querySelector("#nxSpecActive");
        if(a){ a.textContent=specInfo?specInfo.t:''; a.classList.toggle("show", !!specInfo); }
        try{ localStorage.setItem("inurse_myspec_v1", spec); }catch(ex){}
        goToSpec(spec);
        return;
      }
      var sa=e.target.closest("#nxSpecAll"); if(sa){
        home.querySelectorAll(".nx-spec-btn").forEach(function(b){ b.classList.remove("on"); });
        var a2=home.querySelector("#nxSpecActive"); if(a2){ a2.textContent=''; a2.classList.remove("show"); }
        try{ localStorage.removeItem("inurse_myspec_v1"); }catch(ex){}
        window.__INURSE_HOME = false;
        try{ query=''; activeCat='all'; }catch(e){}
        var si2=document.getElementById("search"); if(si2) si2.value='';
        var cb2=document.getElementById("clearBtn"); if(cb2) cb2.style.display="none";
        var h2=document.getElementById("in50Home"); if(h2) h2.style.display="none";
        if(typeof render==='function') render();
        window.scrollTo({top:0, behavior:'smooth'});
        return;
      }
    });
    var ask=home.querySelector("#nxAsk");
    if(ask){
      var sendAsk=function(){
        var t=ask.value.trim(); if(!t) return;
        askJavny(t); ask.value=""; ask.style.height="";
      };
      // Enter envía; Mayús+Enter deja escribir varias líneas.
      ask.addEventListener("keydown",function(e){
        if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); sendAsk(); }
      });
      // El campo crece con la pregunta en vez de recortarla.
      ask.addEventListener("input",function(){
        ask.style.height="auto";
        ask.style.height=Math.min(ask.scrollHeight,132)+"px";
      });
      var sendBtn=home.querySelector("#nxAskSend");
      if(sendBtn) sendBtn.addEventListener("click",sendAsk);
    }
    wirePharmaSearch(home);
  }
  /* Buscador de medicamentos de la tarjeta de Farmacología: manda la consulta
     al Vademécum CIMA, por texto o dictada. */
  function wirePharmaSearch(home){
    var q=home.querySelector("#nxPharmaQ"); if(!q) return;
    function go(){
      var t=(q.value||"").trim(); if(t.length<2) return;
      if(window.EnferixCima&&window.EnferixCima.search){ window.EnferixCima.search(t,'name'); return; }
      fire("farmaco");
    }
    q.addEventListener("keydown",function(e){ if(e.key==="Enter"){ e.preventDefault(); go(); } });
    var goBtn=home.querySelector("#nxPharmaGo");
    if(goBtn) goBtn.addEventListener("click",go);
    var mic=home.querySelector("#nxPharmaMic");
    if(mic) mic.addEventListener("click",function(e){
      e.preventDefault();
      var V=window.EnferixVoiceManager;
      if(!V||!V.start){ q.focus(); return; }
      // Al cerrar el dictado se lanza la búsqueda sin tocar nada más.
      V.start(mic,function(t){ q.value=t; },function(t){ q.value=t; go(); });
    });
  }
  function build(){
    var home=document.getElementById("in50Home"); if(!home) return false;
    if(home.dataset.nx==="1" && home.querySelector(".nx-wrap")) return true;
    home.dataset.nx="1"; home.dataset.cleanV1="1";
    home.innerHTML=template();
    wire(home);
    return true;
  }
  function tick(n){ build(); if(n>0) setTimeout(function(){ tick(n-1); }, 400); }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",function(){ tick(14); });
  else tick(14);
  var obs=new MutationObserver(function(){ var h=document.getElementById("in50Home"); if(h && !(h.dataset.nx==="1" && h.querySelector(".nx-wrap"))) build(); });
  if(document.body) obs.observe(document.body,{childList:true,subtree:true});

  /* ═══════════ AJUSTES ═══════════ */
  function openAjustes(){
    var old=document.getElementById('nxAjustesOverlay');
    if(old) old.remove();

    var saved={}; try{ saved=JSON.parse(localStorage.getItem('inurse_profile_v1')||'{}'); }catch(e){}
    var javnySaved={}; try{ javnySaved=JSON.parse(localStorage.getItem('inurse_vivi_config_v1')||'{}'); }catch(e){}
    var curTheme=localStorage.getItem('guiaHJ23_theme')||'dark';

    var themeLabels={'light':'☀️ Modo claro','dark':'🌙 Modo oscuro','night':'🌚 Turno noche'};
    var themeNext={'light':'dark','dark':'night','night':'light'};

    var ov=document.createElement('div'); ov.id='nxAjustesOverlay'; ov.className='nx-aj-overlay';
    ov.innerHTML=''
      +'<div class="nx-aj-panel" role="dialog" aria-modal="true" aria-label="Ajustes">'
      +'<div class="nx-aj-header"><h2>Ajustes</h2><button class="nx-aj-close" id="nxAjClose" aria-label="Cerrar ajustes">✕</button></div>'
      +'<div class="nx-aj-body">'

      +'<div class="nx-aj-section">'
      +'<div class="nx-aj-section-title"><span class="ic">☁️</span>Cuenta y sincronización</div>'
      +'<div class="nx-aj-card" id="nxAccountBox"><div class="nx-aj-row"><span>Comprobando sesión…</span></div></div>'
      +'</div>'

      +'<div class="nx-aj-section">'
      +'<div class="nx-aj-section-title"><span class="ic">🌗</span>Apariencia</div>'
      +'<div class="nx-aj-card">'
      +'<div class="nx-aj-row"><span id="nxThemeLabel">'+(themeLabels[curTheme]||themeLabels.dark)+'</span><button class="nx-aj-theme-btn" id="nxThemeCycle">Cambiar</button></div>'
      +'</div>'
      +'</div>'

      +'<div class="nx-aj-section">'
      +'<div class="nx-aj-section-title"><span class="ic">🆘</span>Emergencia</div>'
      +'<div class="nx-aj-card">'
      +'<p style="font-size:12.5px;color:var(--text-dim,#94a3b8);line-height:1.5;margin:0 0 10px">Llama al 112, muestra tu ficha médica al personal que te atienda o avisa a tus contactos de emergencia con tu ubicación y el hospital más cercano.</p>'
      +'<div class="nx-aj-row"><span>Configura tu ficha y tus contactos aquí</span><button class="nx-aj-theme-btn" id="nxSosOpen" style="background:linear-gradient(135deg,#DC2626,#EF4444)">🆘 Abrir SOS</button></div>'
      +'</div>'
      +'</div>'

      +'<div class="nx-aj-section">'
      +'<div class="nx-aj-section-title"><span class="ic">📍</span>Ubicación</div>'
      +'<div class="nx-aj-card">'
      +'<p style="font-size:12.5px;color:var(--text-dim,#94a3b8);line-height:1.5;margin:0 0 10px">Permite tu ubicación para que Javny pueda indicarte, cuando lo preguntes por voz o por escrito, el hospital o desfibrilador (DEA) más cercano. Solo se usa en el momento de la consulta, no se guarda en ningún servidor.</p>'
      +'<div class="nx-aj-row"><span id="nxGeoStatus">'+((function(){try{return localStorage.getItem('inurse_geo_consent')==='1'}catch(e){return false}})()?'✅ Ubicación permitida':'⭕ Ubicación no compartida todavía')+'</span><button class="nx-aj-theme-btn" id="nxGeoOpen">📍 Servicios cercanos</button></div>'
      +'</div>'
      +'</div>'

      +'<div class="nx-aj-section">'
      +'<div class="nx-aj-section-title"><span class="ic">✨</span>Configurar Javny</div>'
      +'<div class="nx-aj-card">'
      +'<div class="nx-aj-field"><label for="nxJavnyName">Nombre del asistente</label><input type="text" id="nxJavnyName" value="'+esc(javnySaved.name||'Javny')+'" placeholder="Javny"></div>'
      +'<div class="nx-aj-field"><label for="nxJavnyDetail">Nivel de detalle</label><select id="nxJavnyDetail"><option value="breve"'+(javnySaved.detail==='breve'?' selected':'')+'>Breve</option><option value="normal"'+(javnySaved.detail==='normal'||!javnySaved.detail?' selected':'')+'>Normal</option><option value="detallado"'+(javnySaved.detail==='detallado'?' selected':'')+'>Detallado</option></select></div>'
      +'<div class="nx-aj-field"><label for="nxJavnyLang">Idioma de respuesta</label><select id="nxJavnyLang"><option value="es"'+((javnySaved.lang||'es')==='es'?' selected':'')+'>Español</option><option value="en"'+(javnySaved.lang==='en'?' selected':'')+'>English</option><option value="pt"'+(javnySaved.lang==='pt'?' selected':'')+'>Português</option></select></div>'
      +'<div class="nx-aj-field"><label for="nxJavnyKey">Clave API Gemini</label><input type="password" id="nxJavnyKey" value="'+esc(javnySaved.apiKey||'')+'" placeholder="AIza..."></div>'
      +'<button class="nx-aj-btn" id="nxJavnySave">Guardar configuración de Javny</button>'
      +'</div>'
      +'</div>'

      +'<div class="nx-aj-section">'
      +'<div class="nx-aj-section-title"><span class="ic">👤</span>Mi perfil</div>'
      +'<div class="nx-aj-card nx-aj-profile">'
      +'<div class="nx-aj-avatar-wrap"><div class="nx-aj-avatar" id="nxProfileAvatar">'+(saved.photo?'<img src="'+esc(saved.photo)+'" alt="Foto">':'<span class="nx-aj-avatar-placeholder">👤</span>')+'</div><button type="button" class="nx-aj-avatar-edit" id="nxPhotoBtn">📷 Cambiar foto</button><input type="file" id="nxPhotoInput" accept="image/*" style="display:none"></div>'
      +'<div class="nx-aj-profile-fields">'
      +'<div class="nx-aj-field"><label for="nxProfileName">Nombre</label><input type="text" id="nxProfileName" value="'+esc(saved.name||'')+'" placeholder="Tu nombre"></div>'
      +'<div class="nx-aj-field"><label for="nxProfileSurname">Apellidos</label><input type="text" id="nxProfileSurname" value="'+esc(saved.surname||'')+'" placeholder="Tus apellidos"></div>'
      +'<div class="nx-aj-field"><label for="nxProfileEmail">Email</label><input type="email" id="nxProfileEmail" value="'+esc(saved.email||'')+'" placeholder="tu@email.com"></div>'
      +'<div class="nx-aj-field"><label for="nxProfileHospital">Hospital / Centro</label><input type="text" id="nxProfileHospital" value="'+esc(saved.hospital||'')+'" placeholder="Hospital..."></div>'
      +'<div class="nx-aj-field"><label for="nxProfileSpec">Especialidad</label><input type="text" id="nxProfileSpec" value="'+esc(saved.spec||'')+'" placeholder="UCI, Urgencias, Pediatría..."></div>'
      +'</div>'
      +'<button class="nx-aj-btn" id="nxProfileSave">Guardar perfil</button>'
      +'</div>'
      +'</div>'

      +'</div>'
      +'</div>';

    document.body.appendChild(ov);

    var releaseAjustesFocusTrap=window.EnferixFocusTrap(ov.querySelector('.nx-aj-panel'));
    function closeAjustes(){ ov.remove(); document.removeEventListener('keydown',onAjustesEscape); if(releaseAjustesFocusTrap){releaseAjustesFocusTrap();releaseAjustesFocusTrap=null;} }
    function onAjustesEscape(e){ if(e.key==='Escape') closeAjustes(); }
    document.addEventListener('keydown',onAjustesEscape);
    document.getElementById('nxAjClose').onclick=closeAjustes;
    ov.addEventListener('click',function(e){ if(e.target===ov) closeAjustes(); });

    function renderAccountBox(){
      var box=document.getElementById('nxAccountBox');
      if(!box) return;
      window.EnferixCloud.whoami().then(function(user){
        if(user){
          box.innerHTML=''
            +'<div class="nx-aj-row"><span>✅ '+esc(user.email)+'</span><button class="nx-aj-theme-btn" id="nxLogoutBtn">Cerrar sesión</button></div>'
            +'<div class="nx-aj-field"><label style="text-transform:none;font-weight:400;color:#8aa0c8">Tu perfil, turnos, favoritos y ajustes se sincronizan automáticamente con la nube.</label></div>';
          document.getElementById('nxLogoutBtn').onclick=function(){
            window.EnferixCloud.logout().then(renderAccountBox);
          };
        } else {
          box.innerHTML=''
            +'<div class="nx-aj-field"><label for="nxAuthEmail">Email</label><input type="email" id="nxAuthEmail" placeholder="tu@email.com"></div>'
            +'<div class="nx-aj-field"><label for="nxAuthPassword">Contraseña</label><input type="password" id="nxAuthPassword" placeholder="Mínimo 8 caracteres"></div>'
            +'<div class="nx-aj-field"><label for="nxAuthName">Nombre (solo para crear cuenta)</label><input type="text" id="nxAuthName" placeholder="Tu nombre"></div>'
            +'<div class="nx-aj-row" style="gap:10px"><button class="nx-aj-btn" id="nxLoginBtn" style="flex:1;margin:0">Iniciar sesión</button><button class="nx-aj-btn" id="nxRegisterBtn" style="flex:1;margin:0;background:rgba(120,150,220,.15)">Crear cuenta</button></div>'
            +'<div id="nxAuthMsg" style="font-size:12px;color:#8aa0c8"></div>';
          var msg=document.getElementById('nxAuthMsg');
          document.getElementById('nxLoginBtn').onclick=function(){
            var email=document.getElementById('nxAuthEmail').value.trim();
            var pass=document.getElementById('nxAuthPassword').value;
            msg.textContent='Conectando…'; msg.style.color='#8aa0c8';
            window.EnferixCloud.login(email,pass).then(function(){
              msg.textContent='✓ Sesión iniciada. Sincronizando datos…'; msg.style.color='#4ade80';
              setTimeout(function(){ location.reload(); },700);
            }).catch(function(err){ msg.textContent=err.message; msg.style.color='#f87171'; });
          };
          document.getElementById('nxRegisterBtn').onclick=function(){
            var email=document.getElementById('nxAuthEmail').value.trim();
            var pass=document.getElementById('nxAuthPassword').value;
            var name=document.getElementById('nxAuthName').value.trim();
            msg.textContent='Creando cuenta…'; msg.style.color='#8aa0c8';
            window.EnferixCloud.register(email,pass,name).then(function(){
              msg.textContent='✓ Cuenta creada. Tus datos de este dispositivo ya están en la nube.'; msg.style.color='#4ade80';
              renderAccountBox();
            }).catch(function(err){ msg.textContent=err.message; msg.style.color='#f87171'; });
          };
        }
      });
    }
    renderAccountBox();

    document.getElementById('nxThemeCycle').onclick=function(){
      curTheme=themeNext[curTheme]||'dark';
      localStorage.setItem('guiaHJ23_theme',curTheme);
      document.documentElement.setAttribute('data-theme',curTheme);
      document.getElementById('nxThemeLabel').textContent=themeLabels[curTheme];
      var tb=document.getElementById('themeBtn');
      if(tb){ tb.textContent=curTheme==='light'?'☀️':curTheme==='night'?'🌚':'🌙'; }
    };

    var geoOpenBtn=document.getElementById('nxGeoOpen');
    if(geoOpenBtn)geoOpenBtn.onclick=function(){
      if(ov&&ov.parentNode)ov.remove();
      if(typeof window.openNearby==='function')window.openNearby();
    };

    var sosOpenBtn=document.getElementById('nxSosOpen');
    if(sosOpenBtn)sosOpenBtn.onclick=function(){
      if(ov&&ov.parentNode)ov.remove();
      if(typeof window.openSos==='function')window.openSos();
    };

    document.getElementById('nxJavnySave').onclick=function(){
      var cfg={ name:document.getElementById('nxJavnyName').value.trim()||'Javny', detail:document.getElementById('nxJavnyDetail').value, lang:document.getElementById('nxJavnyLang').value, apiKey:document.getElementById('nxJavnyKey').value.trim() };
      try{ localStorage.setItem('inurse_vivi_config_v1',JSON.stringify(cfg)); }catch(e){}
      if(cfg.apiKey) try{ localStorage.setItem('gemini_api_key',cfg.apiKey); }catch(e){}
      this.textContent='✓ Guardado'; var self=this; setTimeout(function(){ self.textContent='Guardar configuración de Javny'; },1500);
    };

    document.getElementById('nxPhotoBtn').onclick=function(){
      document.getElementById('nxPhotoInput').click();
    };

    document.getElementById('nxPhotoInput').onchange=function(e){
      var file=e.target.files[0]; if(!file) return;
      var reader=new FileReader();
      reader.onload=function(ev){
        var dataUrl=ev.target.result;
        var av=document.getElementById('nxProfileAvatar');
        av.innerHTML='<img src="'+dataUrl+'" alt="Foto">';
        av.dataset.photo=dataUrl;
      };
      reader.readAsDataURL(file);
    };

    document.getElementById('nxProfileSave').onclick=function(){
      var av=document.getElementById('nxProfileAvatar');
      var photo='';
      if(av){ photo=av.dataset.photo||''; if(!photo){ var img=av.querySelector('img'); if(img) photo=img.src; } }
      var profile={ name:document.getElementById('nxProfileName').value.trim(), surname:document.getElementById('nxProfileSurname').value.trim(), email:document.getElementById('nxProfileEmail').value.trim(), hospital:document.getElementById('nxProfileHospital').value.trim(), spec:document.getElementById('nxProfileSpec').value.trim(), photo:photo };
      try{ localStorage.setItem('inurse_profile_v1',JSON.stringify(profile)); }catch(e){}
      this.textContent='✓ Perfil guardado'; var self=this; setTimeout(function(){ self.textContent='Guardar perfil'; },1500);
    };
  }

})();
