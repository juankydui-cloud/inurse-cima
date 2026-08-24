
/* ═══════════ v43 — Deep-links por hash (para el widget del iPhone) ═══════════ */
(function(){
 'use strict';
 function open(){
  var h=(location.hash||'').replace(/^#/,'').trim().toLowerCase();
  if(!h)return;
  if(h==='javny'){var v=document.querySelector('[data-javny],#ccFab,#javnyFab');if(v){v.click();}return;}
  var el=document.querySelector('.nx-card[data-fire="'+h+'"], .nx-nav button[data-fire="'+h+'"], [data-fire="'+h+'"]');
  if(el)el.click();
 }
 function schedule(){setTimeout(open,1400)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
 window.addEventListener('hashchange',open);
})();
