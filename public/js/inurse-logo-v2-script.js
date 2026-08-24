
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
  const ICON = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2IiByb2xlPSJpbWciIGFyaWEtbGFiZWw9ImlOdXJzZSBsb2dvIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMThDNkM4Ii8+CiAgICAgIDxzdG9wIG9mZnNldD0iNTAlIiBzdG9wLWNvbG9yPSIjMEZBOERBIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzBBNTZENiIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjI1NiIgaGVpZ2h0PSIyNTYiIHJ4PSI1NiIgZmlsbD0iI0YyRjVGOSIvPgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI4IDI4KSI+CiAgICA8cGF0aCBkPSJNNzIgMGg1NmM4LjggMCAxNiA3LjIgMTYgMTZ2NTZoNTZjOC44IDAgMTYgNy4yIDE2IDE2djU2YzAgOC44LTcuMiAxNi0xNiAxNmgtNTZ2NTZjMCA4LjgtNy4yIDE2LTE2IDE2SDcyYy04LjggMC0xNi03LjItMTYtMTZ2LTU2SDBjLTguOCAwLTE2LTcuMi0xNi0xNlY4OGMwLTguOCA3LjItMTYgMTYtMTZoNTZWMTZDNTYgNy4yIDYzLjIgMCA3MiAweiIgZmlsbD0idXJsKCNnKSIvPgogICAgPHBhdGggZD0iTTAgMTA4aDU0bDE2LTI4IDE3IDYzIDIwLTQ1IDE0IDEwaDc5IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMTIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgogIDwvZz4KPC9zdmc+';
  const WORDMARK = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MjAgMTcwIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9ImlOdXJzZSI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzE4QzZDOCIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iIzBGQThEQSIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwQTU2RDYiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI3MjAiIGhlaWdodD0iMTcwIiByeD0iMjgiIGZpbGw9InRyYW5zcGFyZW50Ii8+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTAgMTIpIj4KICAgIDxwYXRoIGQ9Ik00NCAwaDQwYzYuNiAwIDEyIDUuNCAxMiAxMnY0MGg0MGM2LjYgMCAxMiA1LjQgMTIgMTJ2NDBjMCA2LjYtNS40IDEyLTEyIDEySDk2djQwYzAgNi42LTUuNCAxMi0xMiAxMkg0NGMtNi42IDAtMTItNS40LTEyLTEydi00MEgtOGMtNi42IDAtMTItNS40LTEyLTEyVjY0YzAtNi42IDUuNC0xMiAxMi0xMmg0MFYxMkMzMiA1LjQgMzcuNCAwIDQ0IDB6IiBmaWxsPSJ1cmwoI2cpIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMCwwKSBzY2FsZSgxLjEpIi8+CiAgICA8cGF0aCBkPSJNNiA3OGg1NGwxNi0yOCAxNyA2MyAyMC00NSAxNCAxMGg3OSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIyLDApIHNjYWxlKDEuMDUpIi8+CiAgPC9nPgogIDx0ZXh0IHg9IjIyNSIgeT0iMTA2IiBmb250LWZhbWlseT0iQXJpYWwsIEhlbHZldGljYSwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMDQiIGZvbnQtd2VpZ2h0PSI3MDAiIGZpbGw9IiMwQjFEM0QiPmlOdXJzZTwvdGV4dD4KPC9zdmc+';

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

    const h1 = document.querySelector('header .top h1');
    if (h1) {
      const small = h1.querySelector('small');
      const subtitle = small ? small.textContent : 'Asistente clínico de enfermería';
      h1.innerHTML = '<img class="inurse-wordmark" src="' + WORDMARK + '" alt="Enferix"><small>' + subtitle + '</small>';
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
