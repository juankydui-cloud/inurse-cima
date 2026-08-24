
(function(){
  function openVademecum(){
    const vadeBtn = document.getElementById("vadeBtn");
    if (vadeBtn) {
      vadeBtn.click();
      return true;
    }

    // Fallback por si el botón existe con otro nombre en alguna versión.
    const candidates = [
      "#vademFab",
      "#drugFab",
      "#farmacosFab",
      "#medsFab",
      "[title*='Vadem']",
      "[title*='fármaco']",
      "[title*='Fármaco']",
      "[data-action='vademecum']",
      "[data-action='farmacos']"
    ];

    for (const sel of candidates) {
      const el = document.querySelector(sel);
      if (el) {
        el.click();
        return true;
      }
    }

    // Último recurso: buscador global.
    const search = document.getElementById("search");
    if (search) {
      search.value = "fármacos vademécum medicación dosis";
      search.dispatchEvent(new Event("input", {bubbles:true}));
      search.focus();
      search.scrollIntoView({behavior:"smooth", block:"center"});
      return true;
    }

    return false;
  }

  // Captura el clic antes de que lo recoja el código antiguo que lo mandaba a RX.
  document.addEventListener("click", function(e){
    const btn = e.target.closest('[data-in57="farmacos"], .in57-action');
    if (!btn) return;

    const text = (btn.textContent || "").toLowerCase();
    const isFarmacos = btn.dataset.in57 === "farmacos" || text.includes("fármac") || text.includes("farmac") || text.includes("vadem");

    if (isFarmacos) {
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      openVademecum();
    }
  }, true);

  window.EnferixOpenFarmacos = openVademecum;
})();
