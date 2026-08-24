
(function(){
  'use strict';
  var KEY_CFG='inurse52_javny_config', KEY_CACHE='inurse52_web_cache';
  var DEFAULT={enabled:true,smart:true,showRefs:true,repos:true,cache:true,safety:true,model:'gemini-3.5-flash',backendUrl:'',reposList:[
    {id:'erc',name:'European Resuscitation Council',url:'https://www.erc.edu',enabled:true},
    {id:'semicyuc',name:'SEMICYUC',url:'https://semicyuc.org',enabled:true},
    {id:'semes',name:'SEMES',url:'https://www.semes.org',enabled:true},
    {id:'who',name:'OMS / WHO',url:'https://www.who.int',enabled:true},
    {id:'msc',name:'Ministerio de Sanidad',url:'https://www.sanidad.gob.es',enabled:true},
    {id:'pubmed',name:'PubMed',url:'https://pubmed.ncbi.nlm.nih.gov',enabled:true}
  ]};
  function $(id){return document.getElementById(id)}
  function esc(s){return String(s||'').replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})}
  function strip(html){var d=document.createElement('div');d.innerHTML=String(html||'').replace(/<br\s*\/?/gi,'\n').replace(/<\/li>/gi,'. ').replace(/<\/p>/gi,'\n');return (d.textContent||'').replace(/\s+/g,' ').trim()}
  function getStore(k){try{return localStorage.getItem(k)||''}catch(e){return ''}}
  function setStore(k,v){try{localStorage.setItem(k,v)}catch(e){}}
  function getJSON(k,f){try{return JSON.parse(getStore(k))||f}catch(e){return f}}
  function setJSON(k,v){setStore(k,JSON.stringify(v))}
  function cfg(){var c=Object.assign({},DEFAULT,getJSON(KEY_CFG,{})); if(!Array.isArray(c.reposList))c.reposList=DEFAULT.reposList; if(!c.model||/^gemini-2\./i.test(c.model)){c.model='gemini-3.5-flash'; try{setJSON(KEY_CFG,c)}catch(e){}} return c}
  function saveCfg(c){setJSON(KEY_CFG,c)}
  function apiKey(){return getStore('guiaHJ23_apikey') || getStore('inurse_gemini_api_key_v1') || getStore('in51_gemini_key') || getStore('inurse52_gemini_api_key') || ''}
  function saveApiKeyAll(v){v=(v||'').trim(); if(!v)return; setStore('guiaHJ23_apikey',v); setStore('inurse_gemini_api_key_v1',v); setStore('in51_gemini_key',v); setStore('inurse52_gemini_api_key',v); try{document.querySelectorAll('.api-key-input,#in51GeminiKey,#in52ApiKey').forEach(function(i){i.value=v})}catch(e){} }
  function toast(msg){ if(window.toast){try{window.toast(msg);return}catch(e){}} var t=document.createElement('div');t.className='toast on';t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.remove()},2200); }

  var _localIndex=null;
  function buildLocalIndex(){
    if(_localIndex)return _localIndex;
    var docs=(typeof DOCS!=='undefined'&&Array.isArray(DOCS)?DOCS:[]);
    _localIndex=docs.map(function(d){
      var sec=(d.sec||[]).map(function(x){return (x.h||'')+' '+strip(x.b||'')}).join(' ').slice(0,2200);
      var raw=[d.title,d.source,d.tags,d.summary,sec].join(' ');
      return {d:d,norm:raw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')};
    });
    return _localIndex;
  }
  function localMatches(q){
    var terms=String(q||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').split(/\W+/).filter(function(w){return w.length>3});
    if(!terms.length)return[];
    var scored=[];
    buildLocalIndex().forEach(function(x){
      var score=0;
      terms.forEach(function(t){var p=x.norm.indexOf(t);if(p>=0)score+=p<180?4:1;});
      if(score>0)scored.push({d:x.d,score:score});
    });
    scored.sort(function(a,b){return b.score-a.score});
    return scored.slice(0,5).map(function(x){return x.d});
  }
  function repoLinks(q){
    var c=cfg();if(!c.repos)return[];
    var terms=String(q||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').split(/\W+/).filter(function(w){return w.length>3});
    var official=(Array.isArray(window.EnferixOfficialSources)?window.EnferixOfficialSources:[]);
    if(official.length){
      return official.map(function(x){
        var text=[x.title,x.org,x.year,x.tags,x.desc].join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
        var score=0;terms.forEach(function(t){if(text.indexOf(t)>=0)score++});
        return {name:x.title,org:x.org||'',year:x.year||'',url:x.url,desc:x.desc||'',score:score};
      }).filter(function(x){return x.score>0}).sort(function(a,b){return b.score-a.score}).slice(0,6);
    }
    return (c.reposList||[]).filter(function(r){return r.enabled}).slice(0,6).map(function(r){
      var u=r.url;if(r.id==='pubmed')u=r.url+'/?term='+encodeURIComponent(q);else if(r.id==='who')u=r.url+'/search?query='+encodeURIComponent(q);
      return {name:r.name,url:u,org:r.name,year:'',desc:''};
    });
  }
  function localKB(matches){
    return matches.map(function(d,i){
      var content=(d.sec||[]).map(function(s){return (s.h||'')+': '+strip(s.b||'')}).join('\n').slice(0,1500);
      return 'Fuente local '+(i+1)+': '+(d.title||'')+' ('+(d.source||'')+')\nResumen: '+(d.summary||'')+'\nContenido: '+content;
    }).join('\n\n').slice(0,9000);
  }
  async function callGemini(prompt){ var key=apiKey(); if(!key)throw new Error('Falta la API Key de Gemini'); var c=cfg(); var model=c.model||'gemini-3.5-flash'; var url='https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent?key='+encodeURIComponent(key); var r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.22,topP:0.88,maxOutputTokens:3600}})}); var data=await r.json(); if(!r.ok)throw new Error((data&&data.error&&data.error.message)||('HTTP '+r.status)); return (data.candidates&&data.candidates[0]&&data.candidates[0].content&&data.candidates[0].content.parts||[]).map(function(p){return p.text||''}).join('\n').trim(); }
  async function fetchBackend(q){ var c=cfg(); if(!c.backendUrl)return null; var url=c.backendUrl.replace(/\/$/,'')+'?q='+encodeURIComponent(q); var r=await fetch(url,{headers:{'Accept':'application/json'}}); if(!r.ok)throw new Error('Backend HTTP '+r.status); return await r.json(); }
  async function askHybrid(q){
    var c=cfg(),matches=localMatches(q),repos=repoLinks(q),backend=null;
    var localText=matches.length?localKB(matches):'Sin coincidencias locales claras.';
    var bUrl=String(c.backendUrl||'').trim();
    var localBackend=/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(bUrl);
    var runningLocal=/^(localhost|127\.0\.0\.1)$/i.test(location.hostname||'');
    if(c.smart&&bUrl&&(!localBackend||runningLocal)){
      try{
        var url=bUrl.replace(/\/$/,'')+'/api/javny';
        var r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,mode:'smart',topK:6})});
        if(!r.ok)throw new Error('Backend HTTP '+r.status);
        var br=await r.json();
        if(br&&br.answer){
          return {answer:br.answer,matches:matches,repos:repos,backend:br.sources||null,cfg:c};
        }
      }catch(e){backend={error:e.message};}
    }
    if(c.smart&&window.__javnyNet&&typeof window.javnyAsk==='function'){
      try{
        var wr=await window.javnyAsk(q,localText.slice(0,10000));
        if(wr&&(wr.answer||wr.text)){
          var ws=wr.sources||[];
          return {answer:wr.answer||wr.text,matches:matches,repos:repos,backend:ws,cfg:c};
        }
      }catch(e){backend=backend||{error:e.message};}
    }
    var clinical=/\b(paciente|ta\b|tensión|frecuencia cardiaca|sat(?:o2)?|glasgow|disnea|dolor|fiebre|hipotensi|shock|convulsi|hemorrag|urgencia|dosis|administrar|tratamiento)\b/i.test(q);
    var sourceTxt=repos.map(function(r,i){return (i+1)+'. '+r.name+(r.org?' — '+r.org:'')+(r.year?' ('+r.year+')':'')+'\n'+(r.desc||'')+'\n'+r.url;}).join('\n\n');
    var structure=clinical
      ? 'Si se trata de un caso clínico, organiza en: Situación, Antecedentes relevantes, Valoración, Actuación priorizada y Reevaluación/transferencia. No fuerces SBART si la pregunta es teórica.'
      : 'Organiza la respuesta con títulos claros, pasos y apartados. Responde como asistente general y de proyectos, no solo como asistente clínica.';
    var prompt=[
      'Eres Javny, asistente de Enferix para profesionales sanitarios y creación de proyectos.',
      'Responde en español claro, completo, práctico y bien organizado.',
      structure,
      'Contesta todos los puntos solicitados. No termines a mitad de una frase. Si el tema es amplio, ofrece una síntesis completa y señala qué podría ampliarse.',
      'Distingue hechos, recomendaciones y aspectos que deben verificarse. No inventes dosis, datos ni referencias.',
      'Las fuentes oficiales incluidas abajo son metadatos y enlaces: no afirmes haber leído el documento completo salvo que su contenido aparezca en el contexto.',
      'En urgencias vitales prioriza seguridad, protocolo local y aviso al equipo responsable.',
      '', 'PREGUNTA:',q,
      '', 'CONTEXTO LOCAL Enferix:',localText,
      '', 'FUENTES OFICIALES RELACIONADAS:',sourceTxt||'No se han encontrado fuentes oficiales específicas para esta consulta.',
      '', 'Cierra con una conclusión útil. En contenido clínico añade: Apoyo a la decisión clínica; prevalecen el protocolo local y el juicio profesional.'
    ].join('\n');
    var answer='';
    if(c.enabled){answer=await callGemini(prompt);}
    else answer=matches.length?matches.map(function(d,i){return (i+1)+'. '+d.title+' — '+d.source+'\n'+d.summary}).join('\n\n'):'No he encontrado una coincidencia local clara. Activa Gemini para obtener una síntesis completa.';
    return {answer:answer,matches:matches,repos:repos,backend:backend,cfg:c};
  }
  function renderHybrid(q,res){ var chips='<span class="in52-ai-chip local">🟢 Enferix local · '+res.matches.length+'</span>'+(res.cfg.repos?'<span class="in52-ai-chip web">🔵 Repositorios · '+res.repos.length+'</span>':'<span class="in52-ai-chip warn">🌐 Repositorios desactivados</span>')+(res.cfg.enabled?'<span class="in52-ai-chip ai">🟣 Gemini · '+esc(res.cfg.model)+'</span>':'<span class="in52-ai-chip warn">IA desactivada</span>'); var refs=''; if(res.cfg.showRefs){ refs='<div class="in52-refbox"><h5>Referencias y origen</h5>'+res.matches.map(function(d,i){return '<a href="#" data-in52-doc="'+esc(d.id)+'">🟢 '+esc(d.title)+' · '+esc(d.source)+'</a>';}).join('')+res.repos.map(function(r){return '<a href="'+esc(r.url)+'" target="_blank" rel="noopener">🔵 '+esc(r.name)+' · '+esc(r.url)+'</a>';}).join('')+(res.backend&&res.backend.error?'<div class="in52-warn">No se pudo consultar el backend externo: '+esc(res.backend.error)+'</div>':'')+'</div>'; }
    return '<div style="font-weight:700;margin-bottom:12px;color:var(--text-dim);font-size:13px">PREGUNTA</div><div style="font-weight:800;margin-bottom:14px">'+esc(q)+'</div>'+chips+'<div style="font-weight:700;margin:14px 0 8px;color:var(--ictus);font-size:13px">RESPUESTA JAVNY 2.0</div><div class="ans" id="answerText">'+esc(res.answer)+'</div>'+refs+(res.cfg.safety?'<div class="in52-warn">⚠️ Javny es apoyo a la decisión clínica. En pacientes reales prevalecen protocolos locales, fichas técnicas, valoración presencial y juicio profesional.</div>':'')+'<div class="ans-tools"><button class="ans-tool" id="answerSpeak">🔊 Escuchar</button><button class="ans-tool" id="answerShare">📤 Compartir</button><button class="ans-tool" id="answerExpand">➕ Ampliar</button></div>'; }

  function installInterceptor(){ var btn=$('qsendBtn'), inp=$('qinput'), body=$('modalBody'); if(!btn||!inp||!body||btn.dataset.in52)return; btn.dataset.in52='1'; btn.addEventListener('click',async function(ev){ var c=cfg(); if(!c.smart)return; var q=inp.value.trim(); if(!q)return; ev.preventDefault(); ev.stopImmediatePropagation(); if(!apiKey()&&c.enabled){toast('⚠️ Introduce tu Gemini API Key primero'); return;} btn.disabled=true; body.innerHTML='<div style="font-weight:700;margin-bottom:12px">'+esc(q)+'</div><div class="thinking">Javny revisa Enferix, repositorios y Gemini <span class="dots"><span></span><span></span><span></span></span></div>'; try{ var res=await askHybrid(q); body.innerHTML=renderHybrid(q,res); attachAnswerTools(q,res.answer); }catch(e){body.innerHTML='<div class="placeholder-ans">❌ Error en Javny 2.0: '+esc(e.message)+'</div>';} finally{btn.disabled=false;} },true);
    inp.addEventListener('keydown',function(ev){ if(ev.key==='Enter'&&!ev.shiftKey&&cfg().smart){ev.preventDefault();btn.click();}},true);
  }
  function attachAnswerTools(q,answer){
    var sb=$('answerSpeak'),sh=$('answerShare'),ex=$('answerExpand');
    if(sb&&window.speak){sb._reset=function(){sb.textContent='🔊 Escuchar'};sb.onclick=function(){window.speak(answer,sb)}}
    if(sh){sh.onclick=function(){var t='Pregunta: '+q+'\n\n'+answer;if(navigator.share)navigator.share({title:'Enferix · Javny',text:t}).catch(function(){});else navigator.clipboard&&navigator.clipboard.writeText(t).then(function(){toast('Respuesta copiada')});};}
    if(ex){ex.onclick=async function(){
      var old=ex.textContent;ex.disabled=true;ex.textContent='Ampliando…';
      try{
        var more=await callGemini(['Amplía y completa la siguiente respuesta sin repetir innecesariamente.','Responde los puntos que puedan faltar, añade matices útiles y termina de forma cerrada.','Pregunta original: '+q,'Respuesta anterior: '+answer].join('\n\n'));
        var box=$('answerText');if(box){box.textContent=answer+'\n\nAMPLIACIÓN\n'+more;answer=answer+'\n\nAMPLIACIÓN\n'+more;}
        ex.textContent='✅ Ampliada';setTimeout(function(){ex.textContent='➕ Ampliar más';ex.disabled=false},900);
      }catch(e){toast('No se pudo ampliar: '+e.message);ex.textContent=old;ex.disabled=false;}
    };}
    document.querySelectorAll('[data-in52-doc]').forEach(function(a){a.onclick=function(e){e.preventDefault();var id=a.getAttribute('data-in52-doc');var card=document.querySelector('[data-id="'+CSS.escape(id)+'"]');if(card){card.scrollIntoView({behavior:'smooth',block:'center'});card.click&&card.click();}else toast('Referencia local: '+id);}});
  }

  function settingsHTML(){ var c=cfg(); return '<div class="in52-grid"><div class="in52-card"><h4>🔑 Gemini</h4><p>Usa la misma clave que ya tenía Enferix V5. Para una app publicada, lo ideal es protegerla con backend.</p><label for="in52ApiKey" class="in52-label">API Key</label> <input id="in52ApiKey" class="in52-input" type="password" placeholder="AIzaSy..." value="'+esc(apiKey())+'"><label for="in52Model" class="in52-label">Modelo</label> <input id="in52Model" class="in52-input" value="'+esc(c.model)+'"><label for="in52Backend" class="in52-label">Backend opcional de búsqueda/grounding</label> <input id="in52Backend" class="in52-input" placeholder="https://tu-servidor/search" value="'+esc(c.backendUrl||'')+'"><p>Sin backend, Javny no scrapea internet directamente por CORS/seguridad; deja repositorios como lista blanca y referencias. Con backend puedes devolver resultados reales en JSON.</p><div class="in52-row" style="margin-top:10px"><button class="in52-btn" id="in52Save">Guardar</button><button class="in52-btn secondary" id="in52Test">Probar Gemini</button><button class="in52-btn danger" id="in52Clear">Borrar clave</button></div><div id="in52Status" class="in52-answer" style="display:none"></div></div><div class="in52-card"><h4>🧠 Javny 2.0</h4>'+toggle('enabled','Activar Gemini',c.enabled)+toggle('smart','Modo inteligente híbrido',c.smart)+toggle('showRefs','Mostrar referencias',c.showRefs)+toggle('repos','Repositorios clínicos permitidos',c.repos)+toggle('cache','Caché de búsquedas externas',c.cache)+toggle('safety','Aviso de seguridad clínica',c.safety)+'<div class="in52-warn">Modo híbrido: primero consulta Enferix local, después repositorios permitidos/backend y finalmente Gemini sintetiza.</div></div></div><div class="in52-card" style="margin-top:12px"><h4>🌐 Repositorios fiables</h4><p>Lista blanca para evitar búsquedas genéricas poco fiables.</p><div class="in52-repos">'+c.reposList.map(function(r){return '<label class="in52-repo"><input type="checkbox" data-in52-repo="'+esc(r.id)+'" '+(r.enabled?'checked':'')+'><b>'+esc(r.name)+'</b><small>'+esc(r.url.replace(/^https?:\/\//,''))+'</small></label>';}).join('')+'</div></div><div class="in52-card" style="margin-top:12px"><h4>🧪 Prueba rápida</h4><textarea id="in52Prompt" class="in52-textarea" placeholder="Ejemplo: paciente febril, TA 85/50 y lactato elevado. ¿Actuación inicial?"></textarea><div class="in52-row" style="margin-top:10px"><button class="in52-btn" id="in52Ask">Preguntar a Javny</button></div><div id="in52Answer" class="in52-answer" style="display:none"></div></div>'; }
  function toggle(k,label,on){return '<label class="in52-toggle"><span>'+esc(label)+'</span><input id="in52_'+k+'" type="checkbox" '+(on?'checked':'')+'></label>'}
  function openSettings(){ var ov=$('in52Overlay'); if(!ov){ov=document.createElement('div'); ov.id='in52Overlay'; ov.className='in52-overlay'; ov.innerHTML='<div class="in52-panel"><div class="in52-head"><div class="ico">✨</div><h3>Enferix V5.2 · Javny híbrida<small>Gemini, repositorios, referencias y modo local/inteligente</small></h3><button class="in52-close" id="in52Close">✕</button></div><div class="in52-body" id="in52Body"></div></div>'; document.body.appendChild(ov); ov.onclick=function(e){if(e.target===ov)ov.classList.remove('on')}; }
    $('in52Body').innerHTML=settingsHTML(); ov.classList.add('on'); $('in52Close').onclick=function(){ov.classList.remove('on')}; bindSettings(); }
  function bindSettings(){ function status(t){var el=$('in52Status'); if(el){el.style.display='block'; el.textContent=t;}} $('in52Save').onclick=function(){ var c=cfg(); saveApiKeyAll($('in52ApiKey').value); c.model=$('in52Model').value.trim()||'gemini-3.5-flash'; c.backendUrl=$('in52Backend').value.trim(); ['enabled','smart','showRefs','repos','cache','safety'].forEach(function(k){c[k]=$('in52_'+k).checked}); c.reposList=c.reposList.map(function(r){var cb=document.querySelector('[data-in52-repo="'+r.id+'"]'); return Object.assign({},r,{enabled:cb?cb.checked:r.enabled});}); saveCfg(c); status('Configuración guardada en este dispositivo.'); toast('Javny V5.2 guardada');}; $('in52Clear').onclick=function(){localStorage.removeItem('guiaHJ23_apikey');localStorage.removeItem('inurse_gemini_api_key_v1');localStorage.removeItem('in51_gemini_key');localStorage.removeItem('inurse52_gemini_api_key');$('in52ApiKey').value='';status('Clave borrada.');}; $('in52Test').onclick=async function(){$('in52Save').click(); status('Probando Gemini…'); try{var a=await callGemini('Responde únicamente: Conexión correcta con Javny V5.2.'); status(a||'Conexión realizada sin texto.');}catch(e){status('Error: '+e.message)}}; $('in52Ask').onclick=async function(){var q=$('in52Prompt').value.trim(); if(!q){toast('Escribe una pregunta');return} var out=$('in52Answer'); out.style.display='block'; out.textContent='Consultando Javny V5.2…'; try{var res=await askHybrid(q); out.innerHTML=renderHybrid(q,res); attachAnswerTools(q,res.answer);}catch(e){out.textContent='Error: '+e.message}}; }
  function installFab(){ if($('in52SettingsFab'))return; var b=document.createElement('button'); b.id='in52SettingsFab'; b.className='in52-settings-fab'; b.title='Ajustes Javny V5.2'; b.textContent='⚙️'; b.onclick=openSettings; document.body.appendChild(b); }
  function installCritical(){ if($('in52Critical'))return; var main=document.querySelector('main'); if(!main)return; var div=document.createElement('div'); div.id='in52Critical'; div.className='in52-critical'; var items=[['🫀','PCR','parada cardiorrespiratoria rcp sva'],['🧠','Ictus','código ictus acv'],['❤️','IAM','infarto agudo miocardio scacest'],['🦠','Sepsis','sepsis shock séptico lactato'],['🚑','Trauma','politrauma trauma grave abcde']]; div.innerHTML=items.map(function(i){return '<button data-q="'+esc(i[2])+'"><span>'+i[0]+'</span>'+i[1]+'</button>'}).join(''); var count=$('count'); if(count)count.insertAdjacentElement('afterend',div); else main.insertBefore(div,main.firstChild); div.onclick=function(e){var b=e.target.closest('button'); if(!b)return; var q=b.getAttribute('data-q'); var search=document.querySelector('.search'); if(search){search.value=q; search.dispatchEvent(new Event('input',{bubbles:true})); search.focus();} toast('Búsqueda crítica: '+b.textContent.trim());}; }
  function decorateModal(){ var note=document.querySelector('.mini-note'); if(note&&!note.dataset.in52){note.dataset.in52='1'; note.innerHTML='Javny 2.0 combina Enferix local + repositorios fiables + Gemini. Prevalecen protocolo local y juicio profesional.';} var ph=document.querySelector('.placeholder-ans'); if(ph&&!ph.dataset.in52){ph.dataset.in52='1'; ph.innerHTML='<span class="ico">🩺</span>Describe un caso clínico, sospecha o pregunta sobre guías.<br>Javny responderá en <b>SBART</b>, indicando origen local, repositorios y síntesis IA.<div style="margin-top:14px;display:flex;flex-wrap:wrap;justify-content:center;gap:6px"><span class="ex">Sepsis con hipotensión</span><span class="ex">Sospecha de código ictus</span><span class="ex">Politrauma ABCDE</span></div>'; }}
  window.EnferixV52={openSettings:openSettings,askHybrid:askHybrid,config:cfg,localMatches:localMatches,repoLinks:repoLinks};
  document.addEventListener('DOMContentLoaded',function(){installFab();installCritical();decorateModal();installInterceptor();});
  setTimeout(function(){installFab();installCritical();decorateModal();installInterceptor();},600);
})();
