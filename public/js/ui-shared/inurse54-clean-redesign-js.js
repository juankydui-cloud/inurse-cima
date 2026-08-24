
(function(){
  "use strict";

  const STETHO = `<img src="/icon-512-v2.png" alt="Enferix" style="width:100%;height:100%;display:block;object-fit:cover;border-radius:inherit">`;

  const JAVNY_FACE = `<svg class="in54-javny-face" viewBox="0 0 96 96" aria-hidden="true">
    <defs>
      <linearGradient id="in54vg" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#22D3EE"/><stop offset=".45" stop-color="#8B5CF6"/><stop offset="1" stop-color="#EC4899"/>
      </linearGradient>
      <radialGradient id="skin" cx=".45" cy=".35" r=".7">
        <stop stop-color="#FFE3D2"/><stop offset="1" stop-color="#E9A886"/>
      </radialGradient>
    </defs>
    <rect width="96" height="96" rx="28" fill="url(#in54vg)"/>
    <circle cx="48" cy="50" r="31" fill="#101827" opacity=".45"/>
    <path d="M27 47c0-18 10-30 22-30 14 0 22 12 22 30 0 18-9 33-22 33S27 65 27 47z" fill="#33233A"/>
    <path d="M31 50c0-15 8-24 18-24s18 9 18 24c0 17-8 27-18 27S31 67 31 50z" fill="url(#skin)"/>
    <path d="M28 45c7-2 17-8 24-17 5 8 12 14 18 16-1-17-10-28-22-28-13 0-21 12-20 29z" fill="#2A1D35"/>
    <circle cx="40" cy="52" r="3.2" fill="#111827"/>
    <circle cx="58" cy="52" r="3.2" fill="#111827"/>
    <path d="M42 65c4 4 11 4 15 0" fill="none" stroke="#A84664" stroke-width="3" stroke-linecap="round"/>
    <path d="M25 76c7-9 38-9 46 0v12H25z" fill="#0EA5E9"/>
    <path d="M39 77l9 9 9-9" fill="#fff"/>
    <path d="M26 79c4-7 10-10 17-11l5 18 5-18c8 1 14 4 18 11v9H26z" fill="#123451" opacity=".92"/>
    <circle cx="71" cy="24" r="6" fill="#fff" opacity=".18"/>
    <circle cx="78" cy="33" r="3" fill="#fff" opacity=".20"/>
  </svg>`;

  function ready(fn){ document.readyState !== "loading" ? fn() : document.addEventListener("DOMContentLoaded", fn); }
  function $(sel, root=document){ return root.querySelector(sel); }
  function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
  function esc(s){ return String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function stripTags(s){ return String(s || "").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim(); }

  function iconForDoc(d){
    const text = ((d?.title||"")+" "+(d?.cat||"")+" "+(d?.tags||"")).toLowerCase();
    if(/pcr|parada|rcp/.test(text)) return "❤️";
    if(/ictus|neurolog/.test(text)) return "🧠";
    if(/iam|infarto|cardio|taqui|bradi|ecg/.test(text)) return "🫀";
    if(/sepsis|shock|infecc/.test(text)) return "🦠";
    if(/trauma|fractura|politrauma/.test(text)) return "🚑";
    if(/resp|ventil|asma|epoc|oxigen/.test(text)) return "🫁";
    if(/farm|medic|dosis|perfus/.test(text)) return "💊";
    return "📄";
  }

  function replaceBranding(){
    $all("header .top .logo, .logo").forEach(el => {
      if(el.closest(".cc-head") || el.closest(".cc-logo")) return;
      el.innerHTML = STETHO;
    });

    const h1 = $("header .top h1");
    if(h1) h1.innerHTML = `Enferix <small>Apoyo clínico rápido</small>`;

    const splash = $("#splashTitle");
    if(splash) splash.textContent = "Enferix";

    document.title = "Enferix V5.4 · Diseño limpio";
  }

  function tuneJavny(){
    $all(".cc-logo,.javny-tab-avatar,.in54-javny-avatar").forEach(el => el.innerHTML = JAVNY_FACE);

    const ccTitle = $(".cc-brand h1");
    if(ccTitle) ccTitle.textContent = "Javny";

    const ccSub = $(".cc-brand p");
    if(ccSub) ccSub.textContent = "Asistente clínica · Enferix";

    // Botón Javny del dock, si existe
    const vf = $("#javnyFab");
    if(vf){
      vf.innerHTML = `<span class="dk-em" style="width:34px;height:34px;border-radius:999px;overflow:hidden;display:block">${JAVNY_FACE}</span><span class="dk-lbl">Javny</span>`;
    }
  }

  function makeProtocolScreen(){
    if($("#in54ProtocolScreen")) return;

    const screen = document.createElement("section");
    screen.id = "in54ProtocolScreen";
    screen.innerHTML = `
      <div class="in54-proto-head">
        <div class="in54-proto-head-inner">
          <button class="in54-back" type="button" title="Volver">←</button>
          <div class="in54-proto-title">
            <h2>Protocolo</h2>
            <small>Enferix</small>
          </div>
          <div class="in54-proto-actions">
            <button type="button" id="in54ProtoFav" title="Favorito">☆</button>
            <button type="button" id="in54ProtoShare" title="Compartir">↗</button>
          </div>
        </div>
      </div>
      <div class="in54-proto-shell">
        <div id="in54ProtocolContent"></div>
      </div>
    `;
    document.body.appendChild(screen);

    screen.querySelector(".in54-back").onclick = closeProtocolScreen;
    screen.querySelector("#in54ProtoShare").onclick = () => {
      const title = $("#in54ProtocolContent h1")?.textContent || "Protocolo Enferix";
      if(navigator.share) navigator.share({title, text:title}).catch(()=>{});
      else if(typeof toast === "function") toast("Compartir preparado");
    };
  }

  function closeProtocolScreen(){
    $("#in54ProtocolScreen")?.classList.remove("on");
    document.body.classList.remove("in54-protocol-open");
  }

  function renderProtocol(d){
    makeProtocolScreen();

    const source = d.source || "Enferix";
    const sections = Array.isArray(d.sec) ? d.sec : [];
    const firstSummary = d.summary || (sections[0] ? stripTags(sections[0].b).slice(0,220) : "");
    const icon = iconForDoc(d);

    const tabs = ["Resumen"].concat(sections.slice(0,4).map(s => s.h)).concat(["Referencias"]);

    const secHtml = sections.length
      ? sections.map((s, i) => `
          <article class="in54-section" data-in54-section="${esc(s.h)}">
            <h3>${esc(s.h || "Sección")}</h3>
            <div>${s.b || ""}</div>
          </article>
        `).join("")
      : `<article class="in54-section"><h3>Contenido</h3><p>${esc(firstSummary || "Sin contenido disponible.")}</p></article>`;

    const html = `
      <section class="in54-proto-banner">
        <div class="in54-proto-icon">${icon}</div>
        <div class="in54-proto-meta">
          <h1>${esc(d.title || "Protocolo")}</h1>
          <p>${esc(firstSummary || "Consulta rápida del protocolo clínico.")}</p>
        </div>
      </section>

      <nav class="in54-tabs">
        ${tabs.map((t,i)=>`<button class="in54-tab ${i===0?"on":""}" data-in54-tab="${esc(t)}">${esc(t)}</button>`).join("")}
      </nav>

      <article class="in54-section" data-in54-section="Resumen">
        <h3>Resumen</h3>
        <p>${esc(firstSummary || "Resumen no disponible.")}</p>
      </article>

      ${secHtml}

      <article class="in54-section" data-in54-section="Referencias">
        <h3>Referencias</h3>
        <p>${esc(source)}</p>
        <div class="in54-ref">Material orientativo. Prevalecen los protocolos locales vigentes, la valoración presencial y el juicio clínico profesional.</div>
      </article>
    `;

    $("#in54ProtocolContent").innerHTML = html;

    const headTitle = $(".in54-proto-title h2");
    const headSub = $(".in54-proto-title small");
    if(headTitle) headTitle.textContent = d.title || "Protocolo";
    if(headSub) headSub.textContent = source;

    $all(".in54-tab").forEach(btn => {
      btn.onclick = () => {
        $all(".in54-tab").forEach(b=>b.classList.remove("on"));
        btn.classList.add("on");
        const label = btn.getAttribute("data-in54-tab");
        const target = $all(".in54-section").find(s => s.getAttribute("data-in54-section") === label);
        if(target) target.scrollIntoView({behavior:"smooth", block:"start"});
      };
    });

    $("#in54ProtocolScreen").classList.add("on");
    document.body.classList.add("in54-protocol-open");
    $("#in54ProtocolScreen").scrollTop = 0;
  }

  function patchOpenDoc(){
    makeProtocolScreen();
    const oldOpenDoc = window.openDoc;
    window.__in54OldOpenDoc = oldOpenDoc;

    window.openDoc = function(id){
      const docs = window.DOCS || [];
      const d = docs.find(x => x.id === id);
      if(!d){
        if(typeof oldOpenDoc === "function") return oldOpenDoc.apply(this, arguments);
        return;
      }
      try{
        if(typeof addHistory === "function") addHistory(id);
      }catch(e){}
      renderProtocol(d);
    };

    // Redirige clics de tarjetas antiguas a la nueva pantalla
    document.addEventListener("click", function(e){
      const card = e.target.closest(".card[id^='card-']");
      if(!card) return;
      if(e.target.closest(".star,.tool,.notes-btn,.notes-editor")) return;
      const id = card.id.replace(/^card-/,"");
      if((window.DOCS || []).some(d => d.id === id)){
        e.preventDefault();
        e.stopPropagation();
        window.openDoc(id);
      }
    }, true);
  }

  function removeDuplicateHome(){
    // La fila crítica duplicada queda anulada. También limpiamos textos repetidos.
    const in50 = $("#in50Home");
    if(in50){
      const crit = in50.querySelector(".in50-critical");
      if(crit) crit.remove();

      const hero = in50.querySelector(".in50-hero");
      if(hero) hero.remove();
    }
  }

  function patchMenuProtocolClicks(){
    // Los botones del menú lateral suelen llamar a openDoc; al haberlo sobrescrito ya abrirán pantalla nueva.
    document.addEventListener("click", function(e){
      const docBtn = e.target.closest("[data-inurse-doc]");
      if(!docBtn) return;
      const id = docBtn.getAttribute("data-inurse-doc");
      if(id && (window.DOCS || []).some(d => d.id === id)){
        e.preventDefault();
        e.stopPropagation();
        const ov = $("#v29Ov"), pan = $("#v29Panel");
        if(ov) ov.classList.remove("on");
        if(pan) pan.classList.remove("on");
        document.body.style.overflow = "";
        window.openDoc(id);
      }
    }, true);
  }

  function patchDockJavny(){
    // Añade Javny al dock con avatar humano si no existe visible.
    setTimeout(() => {
      const stack = $(".fab-stack");
      if(!stack) return;

      let btn = $("#in54JavnyDock");
      if(!btn){
        btn = document.createElement("button");
        btn.id = "in54JavnyDock";
        btn.className = "in50-dock-btn";
        btn.innerHTML = `<span class="dk-em" style="width:34px;height:34px;border-radius:999px;overflow:hidden;display:block">${JAVNY_FACE}</span><span class="dk-lbl">Javny</span>`;
        btn.onclick = () => ($("#ccFab") || $("#javnyFab"))?.click();
        stack.appendChild(btn);
      }
    }, 700);
  }

  ready(function(){
    replaceBranding();

    tuneJavny();
    removeDuplicateHome();
    patchOpenDoc();
    patchMenuProtocolClicks();
    patchDockJavny();

    // Reaplicar después de capas antiguas que se ejecutan con timeout.
    setTimeout(() => {
      replaceBranding();
  
      tuneJavny();
      removeDuplicateHome();
    }, 1000);
  });
})();
