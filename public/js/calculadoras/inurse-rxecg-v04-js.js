
(function(){
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const tools={};
  function toast62(msg){
    try{if(typeof window.toast==='function'){window.toast(msg);return}}catch(e){}
    let t=$('#in62Toast');if(!t){t=document.createElement('div');t.id='in62Toast';t.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:18000;background:#111827;color:#fff;border:1px solid #334155;border-radius:12px;padding:10px 16px;font:600 13px system-ui;box-shadow:0 12px 35px rgba(0,0,0,.45)';document.body.appendChild(t)}
    t.textContent=msg;t.style.display='block';clearTimeout(t._x);t._x=setTimeout(()=>t.style.display='none',2200);
  }
  const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function dataURLtoFile(dataurl,filename){
    const a=dataurl.split(','),mime=(a[0].match(/:(.*?);/)||[])[1]||'image/jpeg',b=atob(a[1]),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return new File([u],filename,{type:mime});
  }
  function humanBytes(n){if(!n)return '';const u=['B','KB','MB'];let i=0,v=n;while(v>=1024&&i<u.length-1){v/=1024;i++}return `${v.toFixed(i?1:0)} ${u[i]}`}
  function openVideo(q){const w=window.open('https://www.youtube.com/results?search_query='+encodeURIComponent(q),'_blank','noopener,noreferrer');if(!w)toast62('El navegador ha bloqueado la pestaña de vídeo')}
  function shareText(title,text){
    const payload={title:'Enferix · '+title,text:String(text||'').slice(0,9000)};
    if(navigator.share){navigator.share(payload).catch(e=>{if(e&&e.name!=='AbortError')toast62('No se ha podido compartir')});return}
    if(navigator.clipboard){navigator.clipboard.writeText(payload.title+'\n\n'+payload.text).then(()=>toast62('Contenido copiado')).catch(()=>toast62('No se ha podido copiar'));return}
    toast62('Compartir no está disponible en este navegador');
  }
  function relatedGuides(q,overlay){
    if(overlay)overlay.classList.remove('show');
    document.body.classList.add('in60-content-mode');
    try{activeCat='all'}catch(e){}
    document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('active',c.dataset.c==='all'));
    const input=$('#search');if(input){input.value=q;try{if(typeof applyQuery==='function')applyQuery(q);else input.dispatchEvent(new Event('input',{bubbles:true}))}catch(e){input.dispatchEvent(new Event('input',{bubbles:true}))}}
    window.scrollTo({top:0,behavior:'smooth'});toast62('Mostrando guías relacionadas');
  }
  function openAtlasFrom(overlay){
    if(overlay)overlay.classList.remove('show');
    setTimeout(()=>{try{if(typeof openAtlas==='function'){openAtlas();return}}catch(e){}const b=$('#atlasFab');if(b)b.click();else toast62('Atlas ECG no disponible')},80);
  }
  function openJavnyImage(state){
    if(!state.src){toast62('Primero añade una imagen');return}
    const f=$('#ccFab'),wrap=$('#ccWrap');if(f)f.click();else if(wrap){wrap.classList.remove('hide');wrap.style.display='flex'}
    setTimeout(async()=>{
      const ta=$('#ccTa')||$('#qinput');
      const prompt=state.kind==='ecg'
        ?`Analiza esta imagen de ECG de forma sistemática. Contexto o hipótesis: ${state.guess.value.trim()||'no indicada'}. Explica frecuencia, ritmo, eje, intervalos, ST-T, hallazgos clave y cuidados de enfermería. Es una herramienta educativa.`
        :`Revisa esta imagen radiológica de forma sistemática. Contexto o sospecha: ${state.guess.value.trim()||'no indicada'}. Describe calidad, hallazgos objetivos, orientación y vigilancia de enfermería. Es una lectura orientativa y educativa.`;
      if(ta){ta.value=prompt;ta.dispatchEvent(new Event('input',{bubbles:true}));ta.focus()}
      try{
        const processed=await state.process();const file=dataURLtoFile(processed,state.kind==='ecg'?'ecg_Enferix.jpg':'radiografia_Enferix.jpg');const input=$('#ccFile');
        if(input&&typeof DataTransfer!=='undefined'){const dt=new DataTransfer();dt.items.add(file);input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));toast62('Imagen preparada en Javny')}
        else toast62('Javny abierta con el contexto de la imagen');
      }catch(e){toast62('Javny abierta; no se pudo adjuntar automáticamente la imagen')}
    },260);
  }
  function addResultActions(state){
    const root=state.result;if(!root||!root.textContent.trim()||root.querySelector('.in62-result-actions')||root.querySelector('.thinking,.placeholder-ans'))return;
    const bar=document.createElement('div');bar.className='in62-result-actions';bar.innerHTML='<button data-a="javny">✨ Revisar con Javny</button><button data-a="video">🎬 Vídeo relacionado</button><button data-a="guide">📚 Guías relacionadas</button><button data-a="share">📤 Compartir</button>';
    root.appendChild(bar);
    bar.onclick=e=>{const b=e.target.closest('button');if(!b)return;const text=root.innerText.replace(bar.innerText,'').trim();const title=state.kind==='ecg'?'Interpretación de ECG':'Lectura radiológica';
      if(b.dataset.a==='javny'){if(window.EnferixOpenJavnyContext)window.EnferixOpenJavnyContext(title,text);else openJavnyImage(state)}
      if(b.dataset.a==='video')openVideo((state.guess.value.trim()||title)+' formación enfermería');
      if(b.dataset.a==='guide')relatedGuides(state.kind==='ecg'?'ECG electrocardiograma arritmias síndrome coronario':'radiografía tórax imagen neumotórax derrame',state.overlay);
      if(b.dataset.a==='share')shareText(title,text);
    };
  }
  function buildLab(cfg){
    const file=$('#'+cfg.file),drop=$('#'+cfg.drop),result=$('#'+cfg.result),send=$('#'+cfg.send),guess=$('#'+cfg.guess),overlay=$('#'+cfg.overlay);if(!file||!drop||!send||!guess||!overlay)return;
    file.removeAttribute('capture');
    const originalDrop=drop.innerHTML;
    const lab=document.createElement('div');lab.className='in62-lab';lab.id='in62-'+cfg.kind+'-lab';
    lab.innerHTML=`<div class="in62-viewer" tabindex="0"><span class="in62-badge">${cfg.kind==='ecg'?'ECG':'RAYOS X'}</span><div class="in62-empty">Añade una imagen para activar el visor</div><img alt="Vista de ${cfg.kind==='ecg'?'electrocardiograma':'imagen radiológica'}"><span class="in62-zoom-note">Arrastra para mover · rueda o pellizco para ampliar</span></div>
      <div class="in62-tools">
        <div class="in62-tool-row"><span class="in62-tool-label">Vista</span><button class="in62-tool" data-c="zoomout">➖ Zoom</button><span class="in62-tool-value" data-v="zoom">100%</span><button class="in62-tool" data-c="zoomin">➕ Zoom</button><button class="in62-tool" data-c="left">↶ Girar</button><button class="in62-tool" data-c="right">↷ Girar</button><button class="in62-tool primary" data-c="full">⛶ Pantalla</button></div>
        <div class="in62-tool-row"><span class="in62-tool-label">Imagen</span><button class="in62-tool" data-c="bd">☀− Brillo</button><span class="in62-tool-value" data-v="brightness">100%</span><button class="in62-tool" data-c="bu">☀+ Brillo</button><button class="in62-tool" data-c="cd">◐− Contraste</button><span class="in62-tool-value" data-v="contrast">100%</span><button class="in62-tool" data-c="cu">◐+ Contraste</button></div>
        <div class="in62-tool-row"><span class="in62-tool-label">Archivo</span><button class="in62-tool primary" data-c="change">📷 Cambiar</button><button class="in62-tool" data-c="reset">↺ Restablecer</button><button class="in62-tool danger" data-c="clear">🗑 Quitar</button></div>
      </div><div class="in62-meta"><span data-meta="file">Sin imagen</span><span><b>Nota:</b> zoom y desplazamiento son solo de visualización; giro, brillo y contraste sí se aplican al análisis.</span></div>`;
    drop.insertAdjacentElement('afterend',lab);
    const tip=document.createElement('div');tip.className='in62-tip';tip.innerHTML=cfg.kind==='ecg'?'<b>Consejo:</b> fotografía el ECG completo, sin reflejos y lo más perpendicular posible. Si aparecen velocidad y calibración, inclúyelas.':'<b>Consejo:</b> fotografía toda la radiografía, evita reflejos y añade el contexto clínico. La app no sustituye el informe radiológico.';lab.insertAdjacentElement('afterend',tip);
    const acts=document.createElement('div');acts.className='in62-actions';acts.innerHTML=cfg.kind==='ecg'
      ?'<button class="in62-action" data-x="atlas"><span>🫀</span>Atlas ECG</button><button class="in62-action" data-x="video"><span>🎬</span>Vídeo ECG</button>'
      :'<button class="in62-action" data-x="video"><span>🎬</span>Vídeo de lectura</button><button class="in62-action" data-x="system"><span>🩻</span>Sistemática</button>';
    send.insertAdjacentElement('beforebegin',acts);
    const img=$('img',lab),viewer=$('.in62-viewer',lab),empty=$('.in62-empty',lab),meta=$('[data-meta="file"]',lab);let original=null,src='',fileObj=null,scale=1,rot=0,bright=100,contrast=100,x=0,y=0,processing=null;
    const state={kind:cfg.kind,overlay,guess,result,lab,get src(){return src},async process(){return processImage()}};tools[cfg.kind]=state;
    function syncView(){img.style.transform=`translate(calc(-50% + ${x}px),calc(-50% + ${y}px)) scale(${scale}) rotate(${rot}deg)`;img.style.filter=`brightness(${bright}%) contrast(${contrast}%)`;lab.querySelector('[data-v="zoom"]').textContent=Math.round(scale*100)+'%';lab.querySelector('[data-v="brightness"]').textContent=bright+'%';lab.querySelector('[data-v="contrast"]').textContent=contrast+'%'}
    function reset(visualOnly=false){scale=1;rot=0;bright=100;contrast=100;x=0;y=0;syncView();if(!visualOnly&&src)queueProcess()}
    async function processImage(){
      if(!original||!src)throw new Error('sin imagen');if(processing)return processing;
      processing=new Promise((resolve,reject)=>{try{const angle=((rot%360)+360)%360,swap=angle===90||angle===270,max=2048,k=Math.min(1,max/Math.max(original.naturalWidth,original.naturalHeight)),w=Math.max(1,Math.round(original.naturalWidth*k)),h=Math.max(1,Math.round(original.naturalHeight*k)),c=document.createElement('canvas');c.width=swap?h:w;c.height=swap?w:h;const ctx=c.getContext('2d');ctx.save();ctx.filter=`brightness(${bright}%) contrast(${contrast}%)`;ctx.translate(c.width/2,c.height/2);ctx.rotate(angle*Math.PI/180);ctx.drawImage(original,-w/2,-h/2,w,h);ctx.restore();resolve(c.toDataURL('image/jpeg',.9))}catch(e){reject(e)}}).finally(()=>processing=null);return processing;
    }
    async function syncPayload(){const data=await processImage(),payload={data:data.split(',')[1],media:'image/jpeg'};try{if(cfg.kind==='ecg')ecgImage=payload;else rxImage=payload}catch(e){}return data}
    let qtm;function queueProcess(){clearTimeout(qtm);qtm=setTimeout(()=>syncPayload().catch(()=>{}),180)}
    async function load(f){
      if(!f||!String(f.type).startsWith('image/')){toast62('Selecciona un archivo de imagen');return}if(f.size>25*1024*1024){toast62('La imagen supera 25 MB');return}
      fileObj=f;const r=new FileReader();r.onload=()=>{src=r.result;original=new Image();original.onload=()=>{img.src=src;empty.style.display='none';lab.classList.add('on');drop.classList.add('in62-compact');drop.innerHTML='📷 Cambiar imagen';meta.innerHTML=`<b>${esc(f.name||'Imagen')}</b> · ${original.naturalWidth} × ${original.naturalHeight} · ${humanBytes(f.size)}`;reset(true);syncPayload().catch(()=>{});send.textContent=cfg.kind==='ecg'?'Analizar ECG editado con Gemini':'Analizar imagen editada con Gemini'};original.src=src};r.readAsDataURL(f)
    }
    file.onchange=()=>{const f=file.files&&file.files[0];if(f)load(f)};
    const oldSend=send.onclick;send.onclick=async function(e){if(src){try{await syncPayload()}catch(x){toast62('No se ha podido preparar la imagen');return}}if(typeof oldSend==='function')return oldSend.call(this,e)};
    acts.onclick=e=>{const b=e.target.closest('[data-x]');if(!b)return;const a=b.dataset.x;if(a==='javny')openJavnyImage(state);if(a==='atlas')openAtlasFrom(overlay);if(a==='video')openVideo(cfg.kind==='ecg'?(guess.value.trim()||'interpretación ECG sistemática enfermería'):(guess.value.trim()||'lectura sistemática radiografía tórax enfermería'));if(a==='guide')relatedGuides(cfg.kind==='ecg'?'ECG electrocardiograma arritmias síndrome coronario':'radiografía tórax imagen neumotórax derrame',overlay);if(a==='system')relatedGuides('radiografía sistemática ABCDE tórax imagen',overlay)};
    lab.onclick=e=>{const b=e.target.closest('[data-c]');if(!b)return;const c=b.dataset.c;if(c==='zoomin')scale=Math.min(4,scale+.15);if(c==='zoomout')scale=Math.max(.35,scale-.15);if(c==='left')rot-=90;if(c==='right')rot+=90;if(c==='bd')bright=Math.max(40,bright-10);if(c==='bu')bright=Math.min(180,bright+10);if(c==='cd')contrast=Math.max(40,contrast-10);if(c==='cu')contrast=Math.min(220,contrast+10);if(c==='reset')reset();if(c==='change')file.click();if(c==='clear'){src='';original=null;fileObj=null;img.removeAttribute('src');empty.style.display='grid';lab.classList.remove('on','full');drop.classList.remove('in62-compact');drop.innerHTML=originalDrop;file.value='';meta.textContent='Sin imagen';result.innerHTML='';send.textContent=cfg.kind==='ecg'?'Analizar trazado con Gemini':'Analizar imagen con Gemini';try{if(cfg.kind==='ecg')ecgImage=null;else rxImage=null}catch(x){}return}if(c==='full'){const full=!lab.classList.contains('full');document.querySelectorAll('.in62-lab.full').forEach(l=>l.classList.remove('full'));lab.classList.toggle('full',full);backdrop.classList.toggle('on',full);document.body.style.overflow=full?'hidden':'';b.textContent=full?'✕ Cerrar':'⛶ Pantalla'}syncView();if(['left','right','bd','bu','cd','cu'].includes(c))queueProcess()};
    viewer.addEventListener('wheel',e=>{if(!src)return;e.preventDefault();scale=Math.max(.35,Math.min(4,scale+(e.deltaY<0?.12:-.12)));syncView()},{passive:false});
    const pts=new Map();let dragStart=null,pinch=null;
    viewer.addEventListener('pointerdown',e=>{if(!src)return;viewer.setPointerCapture(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pts.size===1)dragStart={px:e.clientX,py:e.clientY,x,y};if(pts.size===2){const a=[...pts.values()];pinch={d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),s:scale}}});
    viewer.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pts.size===1&&dragStart){x=dragStart.x+e.clientX-dragStart.px;y=dragStart.y+e.clientY-dragStart.py;syncView()}else if(pts.size===2&&pinch){const a=[...pts.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);scale=Math.max(.35,Math.min(4,pinch.s*d/pinch.d));syncView()}});
    function end(e){pts.delete(e.pointerId);if(pts.size<2)pinch=null;if(pts.size===1){const a=[...pts.values()][0];dragStart={px:a.x,py:a.y,x,y}}else dragStart=null}viewer.addEventListener('pointerup',end);viewer.addEventListener('pointercancel',end);viewer.addEventListener('dblclick',()=>{scale=1;x=0;y=0;syncView()});
    viewer.addEventListener('paste',e=>{const it=[...(e.clipboardData?.items||[])].find(i=>i.type.startsWith('image/'));if(it)load(it.getAsFile())});
    const mo=new MutationObserver(()=>setTimeout(()=>addResultActions(state),50));mo.observe(result,{childList:true,subtree:true});
  }
  const backdrop=document.createElement('div');backdrop.className='in62-backdrop';document.body.appendChild(backdrop);backdrop.onclick=()=>{document.querySelectorAll('.in62-lab.full').forEach(l=>l.classList.remove('full'));backdrop.classList.remove('on');document.body.style.overflow='';document.querySelectorAll('[data-c="full"]').forEach(b=>b.textContent='⛶ Pantalla')};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&backdrop.classList.contains('on'))backdrop.click()});
  function boot(){if(!tools.ecg)buildLab({kind:'ecg',file:'ecgFile',drop:'ecgDrop',result:'ecgResult',send:'ecgSend',guess:'ecgGuess',overlay:'ecgOverlay'});if(!tools.rx)buildLab({kind:'rx',file:'rxFile',drop:'rxDrop',result:'rxResult',send:'rxSend',guess:'rxGuess',overlay:'rxOverlay'})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();setTimeout(boot,500);setTimeout(boot,1600);
  window.EnferixImageLab=tools;
})();
