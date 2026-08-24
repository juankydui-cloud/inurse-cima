
/* ═══════════ v35 — Iconos multicolor SVG en las tarjetas del home ═══════════ */
(function(){
 'use strict';
 var I={
  biblioteca:'<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9"><path d="M3 9.5 12 4l9 5.5" stroke="#fbbf24"/><path d="M5 10.5V17" stroke="#34d399"/><path d="M9.5 10.5V17" stroke="#22d3ee"/><path d="M14.5 10.5V17" stroke="#818cf8"/><path d="M19 10.5V17" stroke="#f472b6"/><path d="M3.5 20h17" stroke="#fbbf24"/><path d="M4.5 17h15" stroke="#e7ecff" opacity=".8"/></svg>',
  guias:'<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"><rect x="5" y="4" width="14" height="17" rx="2.2" stroke="#22d3ee"/><rect x="9" y="2.6" width="6" height="3.2" rx="1.2" fill="#fbbf24" stroke="#fbbf24"/><path d="M8.5 10h7" stroke="#34d399"/><path d="M8.5 13.5h7" stroke="#818cf8"/><path d="M8.5 17h4" stroke="#f472b6"/></svg>',
  evidencia:'<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"><path d="M5 3.5h7l3 3v6.5" stroke="#38bdf8"/><path d="M5 3.5v17h5.5" stroke="#38bdf8"/><path d="M12 3.5v3h3" stroke="#818cf8"/><path d="M7.5 9h5" stroke="#34d399"/><path d="M7.5 12h4" stroke="#fbbf24"/><path d="M7.5 15h2.5" stroke="#a78bfa"/><circle cx="15" cy="15.5" r="3.7" stroke="#f472b6" fill="#0a1224"/><path d="m17.7 18.2 2.6 2.6" stroke="#f472b6"/></svg>',
  patologias:'<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"><path d="M12 4v6" stroke="#e7ecff"/><path d="M11 10c0-2-1.5-3-3-3-1 3-1 7-2.5 9.5-.8 1.4 0 3.5 1.8 3.5 1.6 0 2.7-1.2 2.7-3V10Z" stroke="#22d3ee"/><path d="M13 10c0-2 1.5-3 3-3 1 3 1 7 2.5 9.5.8 1.4 0 3.5-1.8 3.5-1.6 0-2.7-1.2-2.7-3V10Z" stroke="#f472b6"/></svg>',
  farmaco:'<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><g transform="rotate(-40 12 12.25)"><path d="M12 9H7.25A3.25 3.25 0 0 0 7.25 15.5H12Z" fill="#fbbf24" opacity=".9"/><path d="M12 9h4.75a3.25 3.25 0 0 1 0 6.5H12Z" fill="#a78bfa" opacity=".9"/><rect x="4" y="9" width="16" height="6.5" rx="3.25" stroke="#e7ecff" stroke-width="1.5"/><path d="M12 9v6.5" stroke="#0a1224" stroke-width="1.3"/></g></svg>',
  calc:'<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"><rect x="5" y="3.5" width="14" height="17" rx="2.4" stroke="#f59e0b"/><rect x="7.5" y="6" width="9" height="3" rx="1" stroke="#e7ecff"/><circle cx="8.5" cy="12.5" r="1" fill="#34d399"/><circle cx="12" cy="12.5" r="1" fill="#22d3ee"/><circle cx="15.5" cy="12.5" r="1" fill="#818cf8"/><circle cx="8.5" cy="16.5" r="1" fill="#f472b6"/><circle cx="12" cy="16.5" r="1" fill="#fbbf24"/><circle cx="15.5" cy="16.5" r="1" fill="#f43f5e"/></svg>',
  rx:'<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"><rect x="4.5" y="3.5" width="15" height="17" rx="2.4" stroke="#8b5cf6"/><path d="M12 5v14" stroke="#e7ecff" opacity=".6"/><path d="M12 7c-2 1-3.5 1-4.5.5M12 7c2 1 3.5 1 4.5.5" stroke="#34d399"/><path d="M12 11c-2 1-3.5 1-4.5.5M12 11c2 1 3.5 1 4.5.5" stroke="#22d3ee"/><path d="M12 15c-2 1-3.5 1-4.5.5M12 15c2 1 3.5 1 4.5.5" stroke="#f472b6"/></svg>',
  ecg:'<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9"><path d="M3 12h3l2-5 3 10 2.5-7 1.5 2h6" stroke="#ef4444"/></svg>',
  procedimientos:'<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"><path d="M9.5 5.5 11 7l2.5-2.5" stroke="#34d399"/><path d="M9.5 12 11 13.5l2.5-2.5" stroke="#22d3ee"/><path d="M9.5 18.5 11 20l2.5-2.5" stroke="#f472b6"/><path d="M16 5.5h3.5" stroke="#fbbf24"/><path d="M16 12h3.5" stroke="#818cf8"/><path d="M16 18.5h3.5" stroke="#f59e0b"/><path d="M5 4v16" stroke="#e7ecff" opacity=".5"/></svg>',
  algoritmos:'<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"><rect x="9" y="3.5" width="6" height="4.5" rx="1.3" stroke="#fbbf24"/><rect x="3.5" y="15.5" width="6" height="4.5" rx="1.3" stroke="#34d399"/><rect x="14.5" y="15.5" width="6" height="4.5" rx="1.3" stroke="#f472b6"/><path d="M12 8v3.5M12 11.5H6.5v4M12 11.5h5.5v4" stroke="#22d3ee"/></svg>',
  proyectos:'<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"><circle cx="8.5" cy="8.5" r="2.6" stroke="#34d399"/><circle cx="16" cy="9.5" r="2.2" stroke="#f472b6"/><path d="M4 19c0-2.6 2-4.5 4.5-4.5S13 16.4 13 19" stroke="#22d3ee"/><path d="M14.5 18.5c0-2 1.4-3.4 3.2-3.4 1.6 0 2.8 1 3.3 2.6" stroke="#fbbf24"/></svg>',
  inicio:'<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9"><path d="M4 11 12 4l8 7" stroke="#fbbf24"/><path d="M6 10v9h12v-9" stroke="#34d399"/><path d="M10 19v-5h4v5" stroke="#f472b6"/></svg>'
 };
 function apply(){
  var cards=document.querySelectorAll('.nx-card[data-fire], .nx-nav button[data-fire], .nx-hmenu-item[data-hmenu]');
  cards.forEach(function(c){
   var k=c.getAttribute('data-fire')||c.getAttribute('data-hmenu');var ic=c.querySelector('.ic');
   if(ic&&I[k]&&ic.getAttribute('data-svg')!=='1'){ic.innerHTML=I[k];ic.setAttribute('data-svg','1')}
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
 [200,600,1200,2200,3200].forEach(function(ms){setTimeout(apply,ms)});
 var home=document.getElementById('in50Home')||document.body;
 var obs=new MutationObserver(function(){apply()});
 if(home)obs.observe(home,{childList:true,subtree:true});
})();
