/* Escalas clínicas · sección propia
   ────────────────────────────────────────────────────────────────────────────
   Las escalas vivían dentro de "Calculadoras clínicas", en una tira horizontal
   que llegó a tener 22 pestañas: para llegar a Braden había que arrastrar la
   fila a ciegas, y una escala de valoración quedaba mezclada con el cálculo de
   una perfusión, que no tiene nada que ver.

   Aquí las escalas tienen su propio sitio, agrupadas por el motivo por el que
   se buscan (piel, neuro, deterioro, trombosis, funcional), no por orden de
   llegada al código.

   Lo que NO se toca: el cálculo. Cada escala sigue siendo la misma entrada de
   CALCS y se abre con la calculadora de siempre (openCalcs), así que el
   resultado, el historial y el guardado no cambian, y la búsqueda global
   —que ya llamaba a openCalcs— sigue funcionando igual. */
(function(){
  "use strict";

  // El orden importa: primero lo que se usa en el pase de cada turno, luego lo
  // que se consulta ante un problema concreto.
  var GRUPOS = [
    { t:"Riesgo en cuidados", ic:"🛏️",
      d:"Lo que se valora al ingreso y en cada turno",
      escalas:["norton","braden","emina","bradenQ","morse","downton","tinetti"] },
    { t:"Neurología, sedación y delirio", ic:"🧠",
      d:"Conciencia, sedación, déficit neurológico y estado cognitivo",
      escalas:["gcs","rass","ramsay","nihss","camicu","pfeiffer"] },
    { t:"Deterioro clínico y sepsis", ic:"📈",
      d:"Alerta precoz a partir de constantes",
      escalas:["mews","news2","qsofa","sofa","indiceShock"] },
    { t:"Dolor", ic:"🤕",
      d:"Con el paciente comunicativo y sin él",
      escalas:["dolor","escid","campbell"] },
    { t:"Anestesia y preoperatorio", ic:"💤",
      d:"Estado físico, vía aérea y riesgo perioperatorio",
      escalas:["asa","mallampati","cormack","stopbang","apfel","rcri","aldrete"] },
    { t:"Cardiología", ic:"❤️",
      d:"Clase funcional, síndrome coronario y anticoagulación",
      escalas:["nyha","killip","heart","timiScasest","cha2ds2","hasbled"] },
    { t:"Trombosis", ic:"🩸",
      d:"Probabilidad de trombosis venosa y embolia pulmonar",
      escalas:["wellsTvp","wellsTep"] },
    { t:"Situación funcional", ic:"🚶",
      d:"Autonomía en la vida diaria y estado general",
      escalas:["barthel","lawton","karnofsky","ecog"] },
    { t:"Nutrición y deglución", ic:"🍽️",
      d:"Cribado de desnutrición y de disfagia",
      escalas:["mnasf","must","eat10"] }
  ];

  // La tira de pestañas de Calculadoras adelantaba las escalas de la
  // especialidad elegida en Ajustes. Al sacarlas de allí esa ayuda se habría
  // perdido en silencio, así que se reproduce aquí: si hay especialidad, sus
  // escalas encabezan la pantalla. Solo escalas — las calculadoras (PaFi,
  // Parkland, perfusiones) siguen priorizándose en su propio panel.
  var POR_ESPECIALIDAD = {
    cardio:    ["nyha","killip","heart","timiScasest","cha2ds2","hasbled"],
    intensiva: ["sofa","qsofa","rass","camicu","escid","indiceShock"],
    urgencias: ["qsofa","news2","heart","wellsTvp","wellsTep","indiceShock"],
    neuro:     ["gcs","nihss","rass","camicu","pfeiffer"],
    trauma:    ["gcs","indiceShock","dolor","morse","asa"],
    anestesia: ["asa","mallampati","cormack","apfel","rcri","stopbang","aldrete"]
  };
  var NOMBRE_ESPECIALIDAD = {
    cardio:"Cardiología", intensiva:"Cuidados intensivos",
    urgencias:"Urgencias", neuro:"Neurología", trauma:"Traumatología",
    anestesia:"Anestesiología"
  };
  function especialidad(){
    try{ return localStorage.getItem("inurse_myspec_v1") || ""; }catch(e){ return ""; }
  }

  // Buscar por el nombre propio de la escala sirve de poco: en planta se busca
  // por el motivo ("conciencia", "caidas", "ulceras"). Los sinonimos ya existen
  // en el indice SCALES del buscador global, asi que se reutilizan en vez de
  // duplicarlos; alli la escala de Glasgow se llama "glasgow" y en CALCS "gcs".
  var ALIAS = { glasgow:"gcs" };
  // Lo que ese indice no cubre.
  var SINONIMOS_EXTRA = {
    emina:       "emina upp ulceras presion piel riesgo encamado",
    bradenQ:     "braden q pediatrica niños upp ulceras presion piel pediatria",
    downton:     "downton caidas riesgo caida seguridad ancianos medicacion",
    tinetti:     "tinetti equilibrio marcha caidas poma deambulacion ancianos",
    pfeiffer:    "pfeiffer spmsq cognitivo deterioro memoria demencia cribado orientacion",
    camicu:      "camicu cam icu delirio confusion agitacion critico inatencion",
    lawton:      "lawton brody aivd instrumentales actividades vida diaria autonomia dependencia",
    karnofsky:   "karnofsky estado funcional oncologia paliativos actividad",
    ecog:        "ecog performance status oncologia estado funcional paliativos",
    mnasf:       "mna nutricional desnutricion cribado peso apetito ancianos nutricion",
    must:        "must desnutricion nutricional cribado imc perdida de peso",
    ramsay:      "ramsay sedacion nivel sedado uci critico",
    escid:       "escid dolor no comunicativo ventilacion mecanica critico conductas",
    campbell:    "campbell dolor no comunicativo demencia conductas",
    eat10:       "eat10 eat 10 disfagia deglucion tragar atragantamiento cribado",
    asa:         "asa estado fisico preanestesico anestesia riesgo quirofano preoperatorio",
    mallampati:  "mallampati via aerea intubacion dificil anestesia laringoscopia boca",
    cormack:     "cormack lehane laringoscopia glotis via aerea intubacion dificil",
    stopbang:    "stopbang stop bang apnea sueño saos ronquido preoperatorio",
    apfel:       "apfel nvpo nauseas vomitos postoperatorio profilaxis anestesia",
    rcri:        "rcri lee riesgo cardiaco perioperatorio cirugia infarto anestesia",
    nyha:        "nyha clase funcional insuficiencia cardiaca disnea cardiologia",
    killip:      "killip kimball infarto iam insuficiencia cardiaca shock cardiogenico sca",
    heart:       "heart dolor toracico urgencias troponina sca riesgo",
    timiScasest: "timi scasest sca sin elevacion st angina inestable riesgo",
    indiceShock: "indice de shock fc pas hipovolemia sangrado sepsis hemodinamico",
    qsofa:    "qsofa sepsis cribado shock septico infeccion confusion taquipnea",
    wellsTvp: "wells tvp trombosis venosa profunda pierna edema miembro inferior",
    wellsTep: "wells tep embolia pulmonar tromboembolismo disnea",
    cha2ds2:  "cha2ds2 vasc chadsvasc fibrilacion auricular fa anticoagulacion riesgo embolico ictus",
    hasbled:  "hasbled riesgo sangrado hemorragia anticoagulacion",
    sofa:     "sofa fallo organico multiorganico uci sepsis"
  };
  var _sinonimos = null;
  function sinonimos(id){
    if(!_sinonimos){
      _sinonimos = {};
      try{
        if(typeof SCALES !== "undefined" && Array.isArray(SCALES)){
          SCALES.forEach(function(x){
            var k = ALIAS[x.id] || x.id;
            // Morse aparece dos veces en el indice con etiquetas distintas: se
            // acumulan en vez de pisarse.
            _sinonimos[k] = (_sinonimos[k] ? _sinonimos[k] + " " : "") + (x.tags||"") + " " + (x.summary||"");
          });
        }
      }catch(e){}
      Object.keys(SINONIMOS_EXTRA).forEach(function(k){
        _sinonimos[k] = (_sinonimos[k] ? _sinonimos[k] + " " : "") + SINONIMOS_EXTRA[k];
      });
    }
    return _sinonimos[id] || "";
  }

  function calcs(){ try{ return (typeof CALCS!=="undefined"&&CALCS)?CALCS:null; }catch(e){ return null; } }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }
  function $(s){ return document.querySelector(s); }

  function norm(s){
    return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  }

  // Fuente única: los metadatos salen de CALCS, no se duplican aquí. Si mañana
  // se corrige el título o el icono de una escala, esta pantalla lo hereda.
  function ficha(id){
    var C = calcs(); if(!C || !C[id]) return null;
    return { id:id, title:C[id].title||id, icon:C[id].icon||"📊", tag:C[id].tag||"" };
  }

  function tarjeta(f){
    return '<button type="button" class="esc-card" data-escala="'+esc(f.id)+'">'
      +   '<span class="esc-card-ico">'+f.icon+'</span>'
      +   '<span class="esc-card-txt"><b>'+esc(f.title)+'</b>'
      +     (f.tag?'<small>'+esc(f.tag)+'</small>':'')+'</span>'
      + '</button>';
  }

  function render(filtro){
    var q = norm(filtro||"").trim();
    var html = "", total = 0;

    var spec = especialidad();
    var grupos = GRUPOS;
    if(spec && POR_ESPECIALIDAD[spec]){
      // Se antepone el grupo de la especialidad, sin quitar las escalas de su
      // sitio original: quien busque Glasgow en "Neurología" lo sigue
      // encontrando ahí, aunque también salga arriba.
      grupos = [{
        t:"Para "+(NOMBRE_ESPECIALIDAD[spec]||spec), ic:"⭐",
        d:"Las que más usas según tu especialidad, configurada en Ajustes",
        escalas:POR_ESPECIALIDAD[spec]
      }].concat(GRUPOS);
    }

    grupos.forEach(function(g){
      var fichas = g.escalas.map(ficha).filter(Boolean).filter(function(f){
        if(!q) return true;
        return norm(f.title+" "+f.tag+" "+f.id+" "+sinonimos(f.id)).indexOf(q) !== -1;
      });
      if(!fichas.length) return;
      total += fichas.length;
      html += '<section class="esc-grupo">'
        +   '<h3><span class="esc-grupo-ico">'+g.ic+'</span>'+esc(g.t)
        +     '<small>'+esc(g.d)+'</small></h3>'
        +   '<div class="esc-grid">'+fichas.map(tarjeta).join("")+'</div>'
        + '</section>';
    });
    if(!total){
      html = q
        ? '<p class="esc-vacio">Ninguna escala coincide con «'+esc(filtro)+'».</p>'
        // Si CALCS no ha cargado, decirlo: mejor que una pantalla en blanco que
        // parezca que la app no tiene escalas.
        : '<p class="esc-vacio">No se han podido cargar las escalas. Recarga la página.</p>';
    }
    var body = $("#escBody"); if(body) body.innerHTML = html;
  }

  function abrirEscala(id){
    // Se cierra esta hoja antes de abrir la calculadora: dos paneles
    // superpuestos dejarían el de detrás capturando clics.
    cerrar();
    if(typeof window.openCalcs === "function"){ window.openCalcs(id); return; }
    if(typeof window.toast === "function") window.toast("No se ha podido abrir la escala");
  }

  var soltarFoco = null;

  function abrir(id){
    if(id){ abrirEscala(id); return; }
    var ov = $("#escOverlay"); if(!ov) return;
    ov.classList.add("on");
    ov.setAttribute("aria-hidden","false");
    var buscador = $("#escSearch");
    if(buscador) buscador.value = "";
    render("");
    if(soltarFoco) soltarFoco();
    if(typeof window.EnferixFocusTrap === "function") soltarFoco = window.EnferixFocusTrap($("#escPanel"));
  }

  function cerrar(){
    var ov = $("#escOverlay"); if(!ov) return;
    ov.classList.remove("on");
    ov.setAttribute("aria-hidden","true");
    if(soltarFoco){ soltarFoco(); soltarFoco = null; }
  }

  function wire(){
    var ov = $("#escOverlay"); if(!ov) return;
    ov.addEventListener("click", function(e){
      if(e.target === ov){ cerrar(); return; }
      var cerrarBtn = e.target.closest && e.target.closest("#escClose");
      if(cerrarBtn){ cerrar(); return; }
      var card = e.target.closest && e.target.closest("[data-escala]");
      if(card){ abrirEscala(card.getAttribute("data-escala")); }
    });
    var buscador = $("#escSearch");
    if(buscador) buscador.addEventListener("input", function(){ render(buscador.value); });
    document.addEventListener("keydown", function(e){
      if(e.key === "Escape" && ov.classList.contains("on")) cerrar();
    });
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();

  window.EnferixEscalas = { open:abrir, close:cerrar, grupos:GRUPOS };
  window.openEscalas = abrir;
})();
