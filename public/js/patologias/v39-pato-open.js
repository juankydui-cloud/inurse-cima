
(function(){
 'use strict';
 function build(){
  var o=document.getElementById('patoFullOv');
  if(o)return o;
  o=document.createElement('div');o.id='patoFullOv';
  o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','Patologías por sistemas');
  o.innerHTML='<div class="pfx-head"><div class="pfx-logo">🧭</div>'+
   '<div class="pfx-title"><b>Patologías por sistemas</b><small>Índice clínico por aparatos y sistemas</small></div>'+
   '<button class="pfx-close" aria-label="Cerrar">✕</button></div><div class="pfx-body"></div>';
  document.body.appendChild(o);
  o.querySelector('.pfx-close').onclick=close;
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&o.classList.contains('on'))close()});
  return o;
 }
 function close(){var o=document.getElementById('patoFullOv');if(o)o.classList.remove('on');document.body.style.overflow=''}
 window.openPatoSistemas=function(){
  var o=build();var body=o.querySelector('.pfx-body');
  var home=document.getElementById('in56PathologiesHome');
  if(home){
   if(home.parentElement!==body)body.appendChild(home);
   home.style.display='block';
  }else{
   body.innerHTML='<div style="text-align:center;color:#91a7c4;padding:60px 20px">No se pudo cargar el índice de patologías.</div>';
  }
  o.classList.add('on');document.body.style.overflow='hidden';
 };
})();
