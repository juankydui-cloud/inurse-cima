
(function(){
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const strip=(html)=>{const d=document.createElement('div');d.innerHTML=String(html||'');return (d.textContent||'').replace(/\s+/g,' ').trim()};
  const clip=(t,n=7000)=>String(t||'').slice(0,n);
  let currentReadBtn=null;

  function toast58(msg){
    try{ if(typeof window.toast==='function'){window.toast(msg);return;} }catch(e){}
    let t=$('#in58Toast');
    if(!t){t=document.createElement('div');t.id='in58Toast';t.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:16000;background:#111827;color:#fff;border:1px solid #334155;border-radius:12px;padding:10px 16px;font:600 13px system-ui;box-shadow:0 12px 35px rgba(0,0,0,.45)';document.body.appendChild(t)}
    t.textContent=msg;t.style.display='block';clearTimeout(t._tm);t._tm=setTimeout(()=>t.style.display='none',2200);
  }

  function titleFrom(root){
    return strip(root?.querySelector('h1,h2,h3,.ctitle,.vc-name,.pd-name,.in57-patho-title,.in57-patho-inline-title')?.textContent)||'Consulta clínica';
  }
  function textFrom(root){
    if(!root) return '';
    const clone=root.cloneNode(true);
    clone.querySelectorAll('button,nav,.in58-actions,.toolbar,.notes-wrap,script,style').forEach(x=>x.remove());
    return clip(strip(clone.innerHTML));
  }

  function openJavnyWithContext(title,content){
    const q=`Revisa esta ficha de GUÍAS CLÍNICAS de Enferix sobre «${title}». Para responder, contrasta su contenido con la BIBLIOTECA VIRTUAL integrada, manteniendo separada la procedencia de ambas fuentes. Resume los puntos clave, comprueba posibles alertas clínicas, explica el tratamiento y los cuidados de enfermería, y señala qué debe verificarse con el protocolo local.\n\nFUENTE A · GUÍA CLÍNICA CONSULTADA:\n${clip(content,6500)}`;
    const wrap=$('#ccWrap');
    if(wrap){
      wrap.classList.remove('hide');
      wrap.style.display='flex';
      try{localStorage.setItem('cc_open','1')}catch(e){}
    }else{
      const fab=$('#ccFab')||$('#javnyFab')||$('#in50JavnyDock')||$('#in54JavnyDock');
      if(fab) fab.click();
    }
    setTimeout(()=>{
      const input=$('#ccTa')||$('#in51AiInput')||$('#qinput');
      if(!input){toast58('No se ha encontrado el cuadro de Javny');return}
      input.value=q;
      input.dispatchEvent(new Event('input',{bubbles:true}));
      input.dispatchEvent(new Event('change',{bubbles:true}));
      const send=$('#ccSend')||$('#in51AiSend')||$('#qsendBtn');
      if(send) send.disabled=false;
      input.focus();
      try{input.setSelectionRange(0,0)}catch(e){}
      toast58('Ficha enviada a Javny para revisar');
    },120);
  }
  window.EnferixOpenJavnyContext=openJavnyWithContext;
  window.EnferixReadText=function(title,text,btn){readText(title,text,btn)};
  window.EnferixShareContent=function(title,text){return shareContent(title,text)};
  window.EnferixOpenVideo=function(title){openVideo(title)};

  function readText(title,text,btn){
    if(!('speechSynthesis' in window)){toast58('La lectura por voz no está disponible en este navegador');return}
    if(currentReadBtn===btn && speechSynthesis.speaking){
      speechSynthesis.cancel();btn.innerHTML='🔊 Leer';currentReadBtn=null;return;
    }
    speechSynthesis.cancel();
    if(currentReadBtn) currentReadBtn.innerHTML='🔊 Leer';
    const u=new SpeechSynthesisUtterance(`${title}. ${clip(text,12000)}`);
    u.lang='es-ES';u.rate=0.96;u.pitch=1;
    currentReadBtn=btn;btn.innerHTML='⏹ Detener';
    const reset=()=>{if(currentReadBtn===btn){btn.innerHTML='🔊 Leer';currentReadBtn=null}};
    u.onend=reset;u.onerror=reset;
    speechSynthesis.speak(u);
  }

  async function shareContent(title,text){
    const payload={title:`Enferix · ${title}`,text:clip(text,9000)};
    try{
      if(navigator.share){await navigator.share(payload);return}
      await navigator.clipboard.writeText(`${payload.title}\n\n${payload.text}`);toast58('Ficha copiada al portapapeles');
    }catch(e){if(e?.name!=='AbortError')toast58('No se ha podido compartir la ficha')}
  }

  function openVideo(title){
    const query=encodeURIComponent(`${title} procedimiento clínico enfermería formación sanitaria`);
    const w=window.open(`https://www.youtube.com/results?search_query=${query}`,'_blank','noopener,noreferrer');
    if(!w) toast58('El navegador ha bloqueado la pestaña de vídeo');
  }

  function makeBar(root,title,content,opts={}){
    if(!root||root.querySelector(':scope > .in58-actions')) return;
    const bar=document.createElement('div');bar.className='in58-actions';
    bar.innerHTML=`
      <button class="in58-action" data-kind="read">🔊 Leer</button>
      <button class="in58-action" data-kind="javny">✨ Verificar con Javny</button>
      <button class="in58-action" data-kind="video">🎬 Vídeo</button>
      <button class="in58-action" data-kind="share">📤 Compartir</button>`;
    const note=document.createElement('div');note.className='in58-context-note';note.textContent='Javny recibirá el contenido de esta ficha. El botón Vídeo abre una búsqueda educativa en una pestaña nueva.';
    const first=root.firstElementChild;
    if(opts.prepend && first){root.insertBefore(note,first);root.insertBefore(bar,note)}else{root.appendChild(bar);root.appendChild(note)}
    bar.querySelector('[data-kind="read"]').onclick=e=>{e.preventDefault();e.stopPropagation();readText(title,content,e.currentTarget)};
    bar.querySelector('[data-kind="javny"]').onclick=e=>{e.preventDefault();e.stopPropagation();openJavnyWithContext(title,content)};
    bar.querySelector('[data-kind="video"]').onclick=e=>{e.preventDefault();e.stopPropagation();openVideo(title)};
    bar.querySelector('[data-kind="share"]').onclick=e=>{e.preventDefault();e.stopPropagation();shareContent(title,content)};
  }

  function augmentProtocol(){
    const root=$('#in54ProtocolContent');
    if(!root||!root.querySelector('h1')) return;
    const title=titleFrom(root),content=textFrom(root);
    makeBar(root,title,content,{prepend:true});
  }

  function augmentPathology(root){
    if(!root) return;
    const title=titleFrom(root),content=textFrom(root);
    const actionBox=root.querySelector('.in57-patho-actions,.in57-patho-inline-actions');
    if(actionBox && !actionBox.querySelector('[data-in58-javny]')){
      const oldAsk=[...actionBox.querySelectorAll('button')].find(b=>/javny/i.test(b.textContent));
      if(oldAsk){
        oldAsk.dataset.in58Javny='1';oldAsk.textContent='✨ Verificar con Javny';
        oldAsk.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();openJavnyWithContext(title,content)};
      }
      if(!actionBox.querySelector('[data-in58-video]')){
        const vb=document.createElement('button');vb.dataset.in58Video='1';vb.textContent='🎬 Vídeo';vb.onclick=e=>{e.preventDefault();e.stopPropagation();openVideo(title)};actionBox.appendChild(vb);
      }
    }
  }

  function augmentVademecum(card){
    if(!card||card.dataset.in58==='1'||!card.classList.contains('open'))return;
    card.dataset.in58='1';
    const body=card.querySelector('.vc-body');if(!body)return;
    const title=titleFrom(card),content=textFrom(card);
    makeBar(body,title,content);
  }

  function scan(){
    augmentProtocol();
    document.querySelectorAll('.in57-patho-modal,.in57-patho-inline').forEach(augmentPathology);
    document.querySelectorAll('.vcard.open').forEach(augmentVademecum);
  }

  // Corrige cualquier botón antiguo de Preguntar/Verificar con Javny antes de que actúe su manejador viejo.
  document.addEventListener('click',function(e){
    const b=e.target.closest('button');if(!b||!/((preguntar|consultar|verificar).{0,12}javny|javny.{0,12}(preguntar|consultar|verificar))/i.test(b.textContent||''))return;
    if(b.closest('.in58-actions'))return;
    const root=b.closest('.in57-patho-modal,.in57-patho-inline,#in54ProtocolContent,.vcard,.card')||document.body;
    const title=titleFrom(root),content=textFrom(root);
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    openJavnyWithContext(title,content);
  },true);

  document.addEventListener('click',function(){setTimeout(scan,90)},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan);else scan();
  setTimeout(scan,400);setTimeout(scan,1200);setTimeout(scan,2500);
})();
