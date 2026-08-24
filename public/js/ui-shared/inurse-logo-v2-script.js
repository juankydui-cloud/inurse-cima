
/* Enferix · Sincronización de la API key de Gemini.
   La app ha acumulado 4 nombres históricos para la misma clave y distintos paneles
   escribían en unos u otros, así que al cambiar la clave podía seguir usándose la
   antigua. Se replica cualquier escritura/borrado a todos los alias, de modo que
   todos los lectores vean siempre el mismo valor, venga del panel que venga. */
(function(){
  try{
    var ALIASES=['guiaHJ23_apikey','inurse_gemini_api_key_v1','in51_gemini_key','inurse52_gemini_api_key'];
    var LS=window.localStorage, set=LS.setItem.bind(LS), rem=LS.removeItem.bind(LS), syncing=false;
    Storage.prototype.setItem=function(k,v){
      set(k,v);
      if(!syncing && this===LS && ALIASES.indexOf(k)!==-1){
        syncing=true;
        try{ ALIASES.forEach(function(a){ if(a!==k) set(a,v); }); } finally { syncing=false; }
      }
    };
    Storage.prototype.removeItem=function(k){
      rem(k);
      if(!syncing && this===LS && ALIASES.indexOf(k)!==-1){
        syncing=true;
        try{ ALIASES.forEach(function(a){ if(a!==k) rem(a); }); } finally { syncing=false; }
      }
    };
    /* Arranque: si algún alias tiene valor y otros no, se propaga el que exista. */
    var found=''; ALIASES.forEach(function(a){ if(!found){ var v=LS.getItem(a); if(v) found=v; } });
    if(found) ALIASES.forEach(function(a){ if(LS.getItem(a)!==found) set(a,found); });
  }catch(e){}
})();

(function() {
  const ICON = '/icon-512-v2.png';

  function setBrand() {
    document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach(el => {
      el.href = ICON;
    });

    const headerLogo = document.querySelector('header .top .logo');
    if (headerLogo) {
      headerLogo.innerHTML = '<img src="' + ICON + '" alt="Logo Enferix">';
      headerLogo.setAttribute('aria-label', 'Logo Enferix');
      headerLogo.setAttribute('title', 'Enferix');
    }

    const splash = document.querySelector('.splash-logo');
    if (splash) {
      splash.innerHTML = '<img src="' + ICON + '" alt="Logo Enferix">';
    }

    document.querySelectorAll('.cc-logo, .cc-wl').forEach(el => {
      el.innerHTML = '<img src="' + ICON + '" alt="Logo Enferix">';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setBrand);
  } else {
    setBrand();
  }
})();
