
(function(){
  const norm = s => String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9ñ\s]/g," ").replace(/\s+/g," ").trim();
  const esc = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const strip = s => String(s||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
  const docs = () => Array.isArray(window.DOCS) ? window.DOCS : (typeof DOCS !== "undefined" && Array.isArray(DOCS) ? DOCS : []);

  // Usa las fichas ya definidas en el parche anterior si existen dentro del HTML.
  // Si no existe una ficha cerrada, se cruza con protocolos Enferix.
  const BASE = {
    "Sepsis": {
      def: "Respuesta desregulada del organismo ante una infección, con disfunción orgánica potencialmente mortal. Puede evolucionar a shock séptico.",
      alarm: ["Hipotensión o mala perfusión", "Confusión o somnolencia", "FR elevada", "Fiebre o hipotermia", "Oliguria", "Piel moteada"],
      tx: ["ABCDE y reconocimiento precoz", "Oxígeno si hipoxemia", "Vía venosa, monitorización y fluidoterapia si hipoperfusión", "Antibiótico precoz según protocolo local", "Preaviso/código sepsis y traslado útil"],
      drugs: ["Oxígeno", "Cristaloides", "Antibióticos según foco/protocolo", "Noradrenalina si shock refractario por equipo entrenado"]
    },
    "Accidente cerebrovascular": {
      def: "Déficit neurológico agudo de origen vascular, isquémico o hemorrágico. Es una patología tiempo-dependiente.",
      alarm: ["Asimetría facial", "Pérdida de fuerza", "Alteración del habla", "Alteración visual", "Cefalea brusca intensa", "Bajo nivel de conciencia"],
      tx: ["ABCDE", "Hora de inicio o última vez visto bien", "Glucemia capilar", "SatO₂ y oxígeno si precisa", "Activar código ictus y traslado útil"],
      drugs: ["Oxígeno si hipoxemia", "Glucosa si hipoglucemia"]
    },
    "Parada cardiorrespiratoria": {
      def: "Cese brusco de circulación efectiva y/o respiración normal. Requiere RCP inmediata y desfibrilación si el ritmo lo permite.",
      alarm: ["No responde", "No respira normalmente", "Ausencia de signos de circulación"],
      tx: ["Activar emergencias/equipo", "RCP de calidad", "DEA/desfibrilación si FV/TV sin pulso", "Vía aérea y ventilación", "Adrenalina/antiarrítmicos según algoritmo", "Buscar 4H/4T"],
      drugs: ["Adrenalina", "Amiodarona", "Oxígeno", "Magnesio si torsade según protocolo"]
    },
    "Infarto agudo de miocardio": {
      def: "Necrosis miocárdica por isquemia aguda, generalmente por obstrucción coronaria.",
      alarm: ["Dolor torácico opresivo", "Disnea", "Sudoración", "Náuseas", "Síncope", "Elevación ST", "Inestabilidad"],
      tx: ["ABCDE", "ECG 12 derivaciones precoz", "Monitorización", "AAS si no contraindicado", "Nitroglicerina si TA adecuada", "Analgesia y activación de código IAM si criterios"],
      drugs: ["AAS", "Nitroglicerina", "Morfina/Fentanilo según protocolo", "Oxígeno si SatO₂ baja"]
    },
    "Crisis asmática": {
      def: "Empeoramiento agudo del asma con broncoconstricción, inflamación y aumento del trabajo respiratorio.",
      alarm: ["Disnea intensa", "Uso de musculatura accesoria", "SatO₂ baja", "Silencio auscultatorio", "Agotamiento", "Alteración de conciencia"],
      tx: ["ABCDE", "Oxígeno", "Salbutamol inhalado/nebulizado", "Ipratropio si moderada-grave", "Corticoide sistémico", "Valorar soporte ventilatorio si grave"],
      drugs: ["Oxígeno", "Salbutamol", "Ipratropio", "Corticoides", "Sulfato de magnesio si crisis grave según protocolo"]
    },
    "EPOC": {
      def: "Enfermedad respiratoria crónica con limitación persistente al flujo aéreo. En urgencias se valora sobre todo la exacerbación.",
      alarm: ["Disnea superior a la basal", "Somnolencia/confusión", "Cianosis", "SatO₂ baja", "FR muy alta o baja", "Silencio auscultatorio"],
      tx: ["Oxígeno controlado", "Broncodilatadores inhalados", "Corticoide sistémico", "Antibiótico si esputo purulento/neumonía/protocolo", "VMNI si insuficiencia respiratoria hipercápnica o fracaso inicial"],
      drugs: ["Oxígeno controlado", "Salbutamol", "Ipratropio", "Metilprednisolona/Prednisona", "Antibióticos según protocolo"]
    },
    "Hipoglucemia": {
      def: "Descenso de glucosa en sangre capaz de producir síntomas neurovegetativos o neuroglucopénicos.",
      alarm: ["Alteración de conciencia", "Convulsiones", "Glucemia baja", "Imposibilidad de vía oral"],
      tx: ["Glucemia capilar", "Si consciente: hidratos por vía oral", "Si bajo nivel de conciencia: glucosa IV o glucagón si no hay vía", "Reevaluar glucemia y causa"],
      drugs: ["Glucosa oral/IV", "Glucagón", "Suero glucosado según protocolo"]
    },
    "Convulsiones": {
      def: "Descarga neuronal anormal con manifestaciones motoras, sensitivas o alteración de conciencia.",
      alarm: ["Crisis >5 minutos", "Crisis repetidas", "Embarazo", "Trauma", "Hipoglucemia", "Fiebre/sepsis"],
      tx: ["Proteger de lesiones", "ABCDE", "Glucemia capilar", "Benzodiacepina si crisis prolongada/estatus", "Tratar causa y trasladar si criterios"],
      drugs: ["Midazolam", "Diazepam", "Glucosa si hipoglucemia", "Sulfato de magnesio si eclampsia"]
    },
    "Anafilaxia": {
      def: "Reacción alérgica sistémica grave y rápida con afectación respiratoria, cardiovascular o multiorgánica.",
      alarm: ["Disnea", "Estridor", "Angioedema lingual", "Hipotensión", "Síncope", "Urticaria generalizada"],
      tx: ["Adrenalina IM inmediata", "ABCDE", "Oxígeno", "Retirar desencadenante si posible", "Fluidoterapia si hipotensión", "Traslado y observación"],
      drugs: ["Adrenalina IM", "Oxígeno", "Cristaloides", "Antihistamínicos", "Corticoides", "Salbutamol si broncoespasmo"]
    }
  };

  function iconFor(name){
    const t = norm(name);
    if(/sepsis|infeccion|neumonia|mening/.test(t)) return "🦠";
    if(/cardio|infarto|coronario|arrit|shock/.test(t)) return "🫀";
    if(/ictus|cerebro|convul|coma|neurolog|craneo/.test(t)) return "🧠";
    if(/asma|epoc|resp|pulmon|disnea/.test(t)) return "🫁";
    if(/diabet|gluco|tiroid|endo/.test(t)) return "🧬";
    if(/trauma|fract|quemadura|herida/.test(t)) return "🚑";
    if(/hematur|orina|renal|uro/.test(t)) return "🚻";
    return "🩺";
  }

  function findBase(name){
    const n = norm(name);
    const key = Object.keys(BASE).find(k => norm(k) === n || n.includes(norm(k)) || norm(k).includes(n));
    return key ? BASE[key] : null;
  }

  function scoreDoc(d, term){
    const q = norm(term);
    const rel = d.relations ? JSON.stringify(d.relations) : "";
    const text = norm([d.title,d.summary,d.tags,d.cat,d.especialidad,rel,(d.sec||[]).map(s=>(s.h||"")+" "+strip(s.b||"")).join(" ")].join(" "));
    let score = 0;
    if(norm(d.title||"").includes(q)) score += 12;
    if(norm(d.tags||"").includes(q)) score += 8;
    if(norm(rel).includes(q)) score += 7;
    if(text.includes(q)) score += 4;
    q.split(" ").filter(x=>x.length>3).forEach(w => { if(text.includes(w)) score += 1; });
    return score;
  }

  function relatedDocs(name){
    return docs()
      .map(d => ({d, s: scoreDoc(d, name)}))
      .filter(x => x.s > 0)
      .sort((a,b) => b.s - a.s)
      .slice(0,5)
      .map(x => x.d);
  }

  function extractTreatment(ds){
    const wanted = /tratamiento|actuaci[oó]n|manejo|terap|f[aá]rmac|cuidados|algoritmo/i;
    const out = [];
    ds.forEach(d => {
      (d.sec||[]).forEach(sec => {
        if(out.length >= 5) return;
        if(wanted.test(sec.h||"")) {
          const txt = strip(sec.b||"");
          if(txt) out.push({title:d.title, section:sec.h, text:txt.slice(0,420)});
        }
      });
    });
    return out;
  }

  function collectDrugs(base, ds){
    const set = new Set();
    (base?.drugs||[]).forEach(x => set.add(x));
    ds.forEach(d => (d.relations?.farmacos || []).forEach(m => set.add(m)));
    return Array.from(set).slice(0,16);
  }

  function openDoc(id){
    if(window.openDoc) return window.openDoc(id);
    if(window.openDocId) return window.openDocId(id);
  }

  function askJavny(name){
    const fab = document.getElementById("ccFab") || document.getElementById("javnyFab") || document.getElementById("in50JavnyDock");
    if(fab) fab.click();
    setTimeout(() => {
      const input = document.getElementById("ccTa") || document.getElementById("in51AiInput");
      if(input){
        input.value = `Explícame ${name}: definición, signos de alarma, tratamiento recomendado y fármacos según Enferix.`;
        input.dispatchEvent(new Event("input", {bubbles:true}));
        input.focus();
      }
    }, 250);
  }

  function buildPanel(name){
    const base = findBase(name);
    const rel = relatedDocs(name);
    const txDocs = extractTreatment(rel);
    const drugs = collectDrugs(base, rel);
    const def = base?.def || "Ficha pendiente de definición específica. Enferix la relaciona con protocolos cargados para orientar la consulta clínica.";
    const alarms = base?.alarm || ["Valorar ABCDE", "Constantes alteradas", "Dolor intenso o progresivo", "Alteración del nivel de conciencia", "Signos de shock, sepsis o insuficiencia respiratoria"];
    const tx = base?.tx || [];

    const txHtml = tx.length
      ? `<ol>${tx.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>`
      : (txDocs.length
          ? `<ul>${txDocs.slice(0,4).map(x=>`<li><b>${esc(x.title)} · ${esc(x.section)}:</b> ${esc(x.text)}</li>`).join("")}</ul>`
          : `<p>No hay tratamiento específico precargado para esta patología. Usa los protocolos relacionados y consulta a Javny.</p>`);

    const panel = document.createElement("div");
    panel.className = "in57-patho-inline";
    panel.innerHTML = `
      <div class="in57-patho-inline-head">
        <div class="in57-patho-inline-ico">${iconFor(name)}</div>
        <div class="in57-patho-inline-title">
          <h3>${esc(name)}</h3>
          <p>Definición · tratamiento · fármacos · protocolos relacionados</p>
        </div>
        <button class="in57-patho-inline-close" title="Cerrar">×</button>
      </div>
      <div class="in57-patho-inline-body">
        <div class="in57-patho-inline-grid">
          <section class="in57-patho-inline-card">
            <h4>Qué es</h4>
            <p>${esc(def)}</p>
          </section>
          <section class="in57-patho-inline-card">
            <h4>Signos de alarma</h4>
            <ul>${alarms.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
          </section>
          <section class="in57-patho-inline-card">
            <h4>Tratamiento recomendado</h4>
            ${txHtml}
            <p class="in57-patho-inline-warn">Orientativo: validar con protocolo local vigente y situación clínica real.</p>
          </section>
          <section class="in57-patho-inline-card">
            <h4>Fármacos relacionados</h4>
            ${drugs.length ? `<ul>${drugs.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>` : "<p>Sin fármacos vinculados todavía.</p>"}
          </section>
          <section class="in57-patho-inline-card in57-patho-inline-related">
            <h4>Protocolos Enferix relacionados</h4>
            ${rel.length ? rel.map(d=>`<button data-doc="${esc(d.id)}"><b>${esc(d.title)}</b><br><small>${esc(d.especialidad||d.cat||"Enferix")}</small></button>`).join("") : "<p>No se han encontrado protocolos relacionados directos.</p>"}
          </section>
          <section class="in57-patho-inline-card">
            <h4>Acciones</h4>
            <div class="in57-patho-inline-actions">
              <button data-ask>Preguntar a Javny</button>
              <button data-search>Buscar en Enferix</button>
            </div>
          </section>
        </div>
      </div>`;

    panel.querySelector(".in57-patho-inline-close").onclick = () => {
      panel.previousElementSibling?.classList.remove("in57-selected");
      panel.remove();
    };
    panel.querySelectorAll("[data-doc]").forEach(b => b.onclick = () => openDoc(b.dataset.doc));
    panel.querySelector("[data-ask]").onclick = () => askJavny(name);
    panel.querySelector("[data-search]").onclick = () => {
      const s = document.getElementById("search");
      if(s){
        s.value = name;
        s.dispatchEvent(new Event("input", {bubbles:true}));
        s.focus();
        s.scrollIntoView({behavior:"smooth", block:"center"});
      }
    };
    return panel;
  }

  function installInline(){
    window.addEventListener("click", function(e){
      const item = e.target.closest(".in56-pato-item");
      if(!item) return;

      e.preventDefault();
      e.stopPropagation();
      if(e.stopImmediatePropagation) e.stopImmediatePropagation();

      const name = item.textContent.trim();
      if(!name) return;

      const existing = document.querySelector(".in57-patho-inline");
      if(existing && existing.previousElementSibling === item){
        item.classList.remove("in57-selected");
        existing.remove();
        return;
      }

      document.querySelectorAll(".in57-patho-inline").forEach(x => x.remove());
      document.querySelectorAll(".in56-pato-item.in57-selected").forEach(x => x.classList.remove("in57-selected"));

      item.classList.add("in57-selected");
      const panel = buildPanel(name);
      item.insertAdjacentElement("afterend", panel);
      panel.scrollIntoView({behavior:"smooth", block:"nearest"});
    }, true);
  }

  if(document.readyState !== "loading") installInline();
  else document.addEventListener("DOMContentLoaded", installInline);
})();
