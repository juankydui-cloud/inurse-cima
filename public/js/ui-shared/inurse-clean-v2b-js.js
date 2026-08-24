
(function(){
  'use strict';
  function cleanText(root){
    if(!root)return '';
    var c=root.cloneNode(true);
    c.querySelectorAll('button,.in57-patho-inline-warn').forEach(function(e){e.remove()});
    return (c.innerText||c.textContent||'').replace(/\s+/g,' ').trim();
  }
  function toast2(msg){
    try{if(typeof toast==='function'){toast(msg);return}}catch(e){}
    var t=document.querySelector('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}
    t.textContent=msg;t.classList.add('on','show');clearTimeout(t._x);t._x=setTimeout(function(){t.classList.remove('on','show')},2100);
  }
  function readPanel(panel,btn){
    var title=panel.querySelector('.in57-patho-inline-title h3');
    var txt=(title?title.textContent+'. ':'')+cleanText(panel.querySelector('.in57-patho-inline-body'));
    if(!txt){toast2('No hay texto disponible para leer');return}
    btn._reset=function(){btn.textContent='🔊 Leer ficha'};
    try{
      if(typeof speak==='function'){btn.textContent='⏹ Detener lectura';speak(txt,btn);setTimeout(function(){window.EnferixCleanV2&&window.EnferixCleanV2.speech()},100);return}
    }catch(e){}
    if(!window.speechSynthesis){toast2('La lectura en voz alta no está disponible en este navegador');return}
    speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(txt);u.lang='es-ES';u.rate=1.02;
    btn.textContent='⏹ Detener lectura';btn.classList.add('speaking');
    u.onend=function(){btn.textContent='🔊 Leer ficha';btn.classList.remove('speaking')};
    speechSynthesis.speak(u);setTimeout(function(){window.EnferixCleanV2&&window.EnferixCleanV2.speech()},100);
  }
  async function sharePanel(panel){
    var title=panel.querySelector('.in57-patho-inline-title h3');
    var name=title?(title.textContent||'Patología').trim():'Patología';
    var text=name+'\n\n'+cleanText(panel.querySelector('.in57-patho-inline-body'))+'\n\nInformación de apoyo clínico. Prevalecen el protocolo local y el juicio profesional.';
    try{
      if(navigator.share){await navigator.share({title:name+' · Enferix',text:text});return}
      if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(text);toast2('Ficha copiada al portapapeles');return}
    }catch(e){if(e&&e.name==='AbortError')return}
    var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();
    try{document.execCommand('copy');toast2('Ficha copiada al portapapeles')}catch(e){toast2('No se ha podido compartir la ficha')}
    ta.remove();
  }
  function augment(panel){
    if(!panel||panel.dataset.readShare==='1')return;
    var actions=panel.querySelector('.in57-patho-inline-actions');if(!actions)return;
    panel.dataset.readShare='1';
    var read=document.createElement('button');read.dataset.read='1';read.innerHTML='🔊 Leer ficha';
    var share=document.createElement('button');share.dataset.share='1';share.innerHTML='📤 Compartir';
    actions.prepend(share);actions.prepend(read);
    read.onclick=function(e){e.preventDefault();e.stopPropagation();readPanel(panel,read)};
    share.onclick=function(e){e.preventDefault();e.stopPropagation();sharePanel(panel)};
    var close=panel.querySelector('.in57-patho-inline-close');if(close)close.addEventListener('click',function(){try{if(typeof stopSpeak==='function')stopSpeak();else speechSynthesis.cancel()}catch(e){}});
  }
  document.addEventListener('click',function(e){
    if(e.target.closest('.in56-pato-item'))setTimeout(function(){augment(document.querySelector('.in57-patho-inline'))},40);
  },true);
})();
