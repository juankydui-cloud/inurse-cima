/* P2-A · Replacer de emojis → SVG en zonas de alto tráfico visual
   Observa el DOM y, cuando aparecen los contenedores conocidos, mete
   dentro el SVG del sistema (`window.EnferixIcons.get(name)`).
   Zonas cubiertas:
     · Barra de navegación superior:  `.nx-nav button .ic`
     · Botón de vuelta al Inicio en dropdown: `.nx-hmenu-item .ic`
     · Cards de especialidades en Escalas: `.esc35-spec-em`
     · Icono de la ficha (banner in54):    `.in54-proto-icon`
   Fuera de esto, no toca nada. Los componentes P2.1–P2.4 traen SVG
   propios en su propio código.
*/
(function(){
  'use strict';

  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function safeReplace(node){
    if(!node) return;
    if(node.dataset && node.dataset.p2aSvg === '1') return;
    /* Si el nodo trae `data-*-icon="name"` explícito, respetamos ese
       nombre (más fiable que adivinar por el emoji). */
    var forced = node.getAttribute && (
      node.getAttribute('data-p21-icon') || node.getAttribute('data-p22-icon') ||
      node.getAttribute('data-p23-icon') || node.getAttribute('data-p24-icon') ||
      node.getAttribute('data-p2a-icon')
    );
    var ok = false;
    if(forced && window.EnferixIcons && window.EnferixIcons.has(forced)){
      node.innerHTML = window.EnferixIcons.get(forced);
      node.classList.add('enfx-ic-slot');
      ok = true;
    } else {
      ok = window.EnferixIcons && window.EnferixIcons.replaceEmoji(node);
    }
    if(ok){ node.dataset.p2aSvg = '1'; }
  }

  function scan(root){
    if(!window.EnferixIcons) return;
    (root || document).querySelectorAll(
      '.nx-nav button .ic, .nx-hmenu-item .ic, .esc35-spec-em, .in54-proto-icon, '
      + '[data-p21-icon], [data-p22-icon], [data-p23-icon], [data-p24-icon], [data-p2a-icon]'
    ).forEach(safeReplace);
  }

  var mo = null;
  function boot(){
    scan(document);
    mo = new MutationObserver(function(muts){
      var relevant = false;
      for(var i=0;i<muts.length && !relevant;i++){
        var m = muts[i];
        if(m.type !== 'childList') continue;
        for(var j=0;j<m.addedNodes.length;j++){
          var n = m.addedNodes[j];
          if(n.nodeType !== 1) continue;
          if(n.matches && (n.matches('.nx-nav button .ic') || n.matches('.esc35-spec-em') || n.matches('.in54-proto-icon') || n.matches('.nx-hmenu-item .ic') || n.matches('[data-p21-icon],[data-p22-icon],[data-p23-icon],[data-p24-icon],[data-p2a-icon]'))){
            safeReplace(n); relevant = true;
          }
          if(n.querySelectorAll){ scan(n); }
        }
      }
    });
    try{ mo.observe(document.body, { childList:true, subtree:true }); }catch(e){}
  }
  ready(boot);
})();
