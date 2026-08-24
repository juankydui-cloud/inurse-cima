
(function(){
 'use strict';
 var HISTK='inurse_v31_historial';
 function hget(){try{return JSON.parse(localStorage.getItem(HISTK)||'[]')}catch(e){return[]}}
 function hset(arr){try{localStorage.setItem(HISTK,JSON.stringify(arr))}catch(e){}}

 /* ---- v30: Compartir / Copiar / PDF ---- */
 function v30Toast(msg){
  var t=document.createElement('div');t.className='v30-toast';t.textContent=msg;
  document.body.appendChild(t);setTimeout(function(){t.remove()},2500);
 }

 function cleanText(t){
  return (t||'').replace(/\[(?:REF-\d+|NICE-\d+|Enferix-\w+|FDA|\d+)\]/g,'')
   .replace(/#{1,6}\s/g,'').replace(/\*\*(.*?)\*\*/g,'$1').replace(/\*(.*?)\*/g,'$1')
   .replace(/`([^`]+)`/g,'$1').replace(/https?:\/\/\S+/g,'').replace(/DOI:\s*\S+/g,'')
   .replace(/PMID:\s*\d+/g,'').trim();
 }

 window.v30Copy=function(content){
  var text=cleanText(content);
  if(navigator.clipboard&&navigator.clipboard.writeText){
   navigator.clipboard.writeText(text).then(function(){v30Toast('Copiado al portapapeles')})
    .catch(function(){fallbackCopy(text)});
  }else{fallbackCopy(text)}
 };
 function fallbackCopy(text){
  var ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.left='-9999px';
  document.body.appendChild(ta);ta.select();try{document.execCommand('copy');v30Toast('Copiado al portapapeles')}catch(e){v30Toast('No se pudo copiar')}document.body.removeChild(ta);
 }

 window.v30Share=function(content,btnEl){
  var old=document.getElementById('v30ShareMenu');
  if(old){ old.remove(); return; }
  var text=cleanText(content);
  var menu=document.createElement('div');menu.id='v30ShareMenu';menu.className='v30-share-menu';
  menu.innerHTML=''
   +'<button data-act="whatsapp">💬 WhatsApp</button>'
   +'<button data-act="email">📧 Email</button>'
   +'<button data-act="copy">📋 Copiar texto</button>'
   +'<button data-act="native">📤 Más opciones…</button>';
  menu.querySelector('[data-act="whatsapp"]').onclick=function(){
   var wa=text.length>2000?text.substring(0,2000)+'…':text;
   window.open('https://wa.me/?text='+encodeURIComponent(wa),'_blank');menu.remove();
  };
  menu.querySelector('[data-act="email"]').onclick=function(){
   var subject='Enferix — Consulta clínica';
   var body=text.length>4000?text.substring(0,4000)+'…':text;
   window.open('mailto:?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body));menu.remove();
  };
  menu.querySelector('[data-act="copy"]').onclick=function(){ window.v30Copy(content); menu.remove(); };
  menu.querySelector('[data-act="native"]').onclick=function(){
   if(navigator.share){ navigator.share({title:'Enferix — Consulta clínica',text:text}).catch(function(){}); }
   else{ window.v30Copy(content); }
   menu.remove();
  };
  if(btnEl&&btnEl.closest){
   var actions=btnEl.closest('.v30-actions');
   if(actions){ actions.style.position='relative'; actions.appendChild(menu); }
   else{ document.body.appendChild(menu); }
  }else{ document.body.appendChild(menu); }
  setTimeout(function(){ document.addEventListener('click',function dismiss(e){ if(!menu.contains(e.target)){menu.remove();document.removeEventListener('click',dismiss)} },{once:false}); },50);
 };

 window.v30PDF=function(content){
  var text=cleanText(content);
  var fecha=new Date().toLocaleDateString('es-ES',{day:'2-digit',month:'long',year:'numeric'});
  var firstLine=text.split(/[.\n]/)[0]||'Consulta clínica';
  var titulo=firstLine.length>60?firstLine.substring(0,60)+'…':firstLine;
  var w=window.open('','_blank');
  if(!w){v30Toast('Permite ventanas emergentes para exportar PDF');return}
  w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Enferix — '+titulo+'</title>'+
   '<style>body{font-family:Helvetica,Arial,sans-serif;max-width:680px;margin:40px auto;padding:20px;color:#1a1a1a;line-height:1.8;font-size:14px}'+
   '.header{text-align:center;margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #2DD4BF}'+
   '.header h1{color:#2DD4BF;margin:0;font-size:22px}.header p{color:#666;font-size:12px;margin:4px 0 0}'+
   '.content{white-space:pre-wrap}.footer{margin-top:40px;text-align:center;color:#999;font-size:10px;padding-top:20px;border-top:1px solid #eee}'+
   '@media print{body{margin:20px}}</style></head><body>'+
   '<div class="header"><h1>Enferix</h1><p>Consulta clínica — '+fecha+'</p></div>'+
   '<div class="content">'+text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')+'</div>'+
   '<div class="footer">Generado por Enferix · Herramienta de apoyo educativo · No sustituye el juicio clínico profesional</div>'+
   '</body></html>');
  w.document.close();
  setTimeout(function(){w.print()},400);
 };

 /* ---- v31: Historial con favoritos ---- */
 window.v31Save=function(pregunta,respuesta,fuentes){
  if(!pregunta)return;
  var h=hget();
  var src=[];
  if(fuentes&&fuentes.length){
   var seen={};
   fuentes.forEach(function(f){var s=f.source||f.src||'';if(s&&!seen[s]){seen[s]=1;src.push(s)}});
  }
  h.unshift({id:Date.now(),ts:new Date().toISOString(),q:pregunta,r:respuesta.substring(0,2000),src:src,fav:false});
  if(h.length>200)h=h.slice(0,200);
  hset(h);
 };

 function fmtDate(iso){
  try{var d=new Date(iso);return d.toLocaleDateString('es-ES',{day:'numeric',month:'short'})+' '+d.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}catch(e){return''}
 }

 function renderHistory(filter,favOnly){
  var list=document.getElementById('v31List');if(!list)return;
  var h=hget();
  var term=(filter||'').toLowerCase().trim();
  var items=h.filter(function(e){
   if(favOnly&&!e.fav)return false;
   if(!term)return true;
   return (e.q||'').toLowerCase().indexOf(term)>=0||(e.r||'').toLowerCase().indexOf(term)>=0;
  });
  if(!items.length){
   list.innerHTML='<div class="v31-empty">'+(favOnly?'No tienes consultas favoritas':'No hay consultas en el historial')+'</div>';
   return;
  }
  list.innerHTML=items.map(function(e){
   var preview=(e.r||'').replace(/\[(?:REF-\d+|NICE-\d+|Enferix-\w+|FDA|\d+)\]/g,'').replace(/#{1,6}\s/g,'').replace(/\*\*([^*]+)\*\*/g,'$1').substring(0,120);
   return '<div class="v31-item" data-v31id="'+e.id+'">'+
    '<div class="v31-item-head">'+
     '<div class="v31-item-q">'+((e.q||'').length>100?(e.q||'').substring(0,100)+'…':(e.q||''))+'</div>'+
     '<button class="v31-item-fav" data-v31fav="'+e.id+'" title="'+(e.fav?'Quitar de favoritos':'Marcar favorita')+'">'+(e.fav?'⭐':'☆')+'</button>'+
    '</div>'+
    '<div class="v31-item-meta">'+
     '<span>'+fmtDate(e.ts)+'</span>'+
     (e.src&&e.src.length?'<span>'+e.src.join(', ')+'</span>':'')+
    '</div>'+
    '<div class="v31-item-resp">'+preview+'</div>'+
    '<div class="v31-item-actions">'+
     '<button data-v31use="'+e.id+'">Usar pregunta</button>'+
     '<button data-v31cp="'+e.id+'">Copiar respuesta</button>'+
     '<button data-v31del="'+e.id+'">Eliminar</button>'+
    '</div>'+
   '</div>';
  }).join('');

  list.querySelectorAll('[data-v31fav]').forEach(function(btn){
   btn.onclick=function(ev){
    ev.stopPropagation();
    var id=Number(btn.getAttribute('data-v31fav'));
    var h2=hget();var e=h2.find(function(x){return x.id===id});
    if(e){e.fav=!e.fav;hset(h2);renderHistory(filter,favOnly)}
   };
  });
  list.querySelectorAll('[data-v31use]').forEach(function(btn){
   btn.onclick=function(ev){
    ev.stopPropagation();
    var id=Number(btn.getAttribute('data-v31use'));
    var e=hget().find(function(x){return x.id===id});
    if(e){
     var ta=document.getElementById('ccTa');
     if(ta){ta.value=e.q;ta.dispatchEvent(new Event('input',{bubbles:true}));ta.focus()}
     document.getElementById('v31Modal').classList.remove('on');
    }
   };
  });
  list.querySelectorAll('[data-v31cp]').forEach(function(btn){
   btn.onclick=function(ev){
    ev.stopPropagation();
    var id=Number(btn.getAttribute('data-v31cp'));
    var e=hget().find(function(x){return x.id===id});
    if(e)window.v30Copy(e.r);
   };
  });
  list.querySelectorAll('[data-v31del]').forEach(function(btn){
   btn.onclick=function(ev){
    ev.stopPropagation();
    var id=Number(btn.getAttribute('data-v31del'));
    var h2=hget();hset(h2.filter(function(x){return x.id!==id}));
    renderHistory(filter,favOnly);
   };
  });
 }

 var v31Tab='all';
 document.querySelectorAll('[data-v31tab]').forEach(function(btn){
  btn.onclick=function(){
   v31Tab=btn.getAttribute('data-v31tab');
   document.querySelectorAll('[data-v31tab]').forEach(function(b){b.classList.toggle('on',b===btn)});
   renderHistory(document.getElementById('v31Search').value,v31Tab==='fav');
  };
 });

 var v31SearchTimer;
 document.getElementById('v31Search').addEventListener('input',function(){
  clearTimeout(v31SearchTimer);
  var val=this.value;
  v31SearchTimer=setTimeout(function(){renderHistory(val,v31Tab==='fav')},200);
 });

 document.getElementById('v31History').onclick=function(){
  document.getElementById('v31Modal').classList.add('on');
  document.getElementById('v31Search').value='';
  v31Tab='all';
  document.querySelectorAll('[data-v31tab]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-v31tab')==='all')});
  renderHistory('',false);
 };
 document.getElementById('v31Bg').onclick=function(){document.getElementById('v31Modal').classList.remove('on')};
 document.getElementById('v31Close').onclick=function(){document.getElementById('v31Modal').classList.remove('on')};
 document.getElementById('v31Clear').onclick=function(){
  if(!confirm('¿Borrar todo el historial de consultas?'))return;
  hset([]);renderHistory('',v31Tab==='fav');v30Toast('Historial borrado');
 };
})();
