
(function(){
'use strict';

const $=s=>document.querySelector(s);
const norm=s=>String(s||'').toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[¿?¡!.,;:()[\]{}"']/g,' ')
  .replace(/\s+/g,' ').trim();

let toastTimer=null;
function vtoast(text){
  let el=$('#in18VoiceToast');
  if(!el){
    el=document.createElement('div');el.id='in18VoiceToast';el.setAttribute('role','status');document.body.appendChild(el);
  }
  el.textContent=text;el.classList.add('on');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('on'),2600);
}
function say(text){
  try{
    if(!('speechSynthesis' in window))return;
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.lang='es-ES';u.rate=1.03;u.pitch=1;
    speechSynthesis.speak(u);
  }catch(e){}
}
function acknowledge(text){vtoast(text);say(text.replace(/[📚💊🧰🩻📈🏠🤖🎙️✨⚙️🚨]/g,''));}

function clickFirst(selectors){
  for(const sel of selectors){
    const el=$(sel);if(el){el.click();return true}
  }
  return false;
}
function closeCurrent(){
  try{window.Enferix21?.close?.()}catch(e){}
  ['#v29X','#icClose','#ccClose','#vadeClose','#ecgClose','#rxClose','#calcClose','#triageClose','#trainClose','#sosClose']
    .some(sel=>{const el=$(sel);if(el&&el.offsetParent!==null){el.click();return true}return false});
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  acknowledge('Cerrando la pantalla actual');
  return true;
}
function showHome(){
  if(clickFirst(['#v29HomeBtn','#in50HomeDock'])){acknowledge('🏠 Inicio');return true}
  return false;
}
function openGuides(){
  showHome();
  setTimeout(()=>clickFirst(['#v29MenuBtn']),120);
  acknowledge('Abriendo Guías clínicas');
  return true;
}
function openMaster(tab,label){
  if(window.Enferix21?.open){
    window.Enferix21.open(tab);
    acknowledge('Abriendo '+label);
    return true;
  }
  if(window.EnferixVirtualLibrary?.open){
    window.EnferixVirtualLibrary.open();
    acknowledge('Abriendo Biblioteca virtual');
    return true;
  }
  return false;
}
function openJavny(prefill,sendNow){
  const wrap=$('#ccWrap');
  if(wrap){
    wrap.classList.remove('hide');wrap.classList.add('on');wrap.style.display='flex';
  }else clickFirst(['#ccFab','#javnyFab','#in50JavnyDock','#in54JavnyDock']);
  setTimeout(()=>{
    const input=$('#ccTa')||$('#in51AiInput')||$('#qinput');
    if(!input)return;
    if(prefill){
      input.value=prefill;
      input.dispatchEvent(new Event('input',{bubbles:true}));
      input.dispatchEvent(new Event('change',{bubbles:true}));
    }
    input.focus();
    if(sendNow&&prefill){
      const send=$('#ccSend')||$('#in51AiSend')||$('#qsendBtn');
      if(send){send.disabled=false;setTimeout(()=>send.click(),100)}
    }
  },180);
  return true;
}
window.EnferixVoiceAskJavny=function(question){
  const q=String(question||'').trim();
  if(!q){openJavny('',false);acknowledge('Javny está escuchando');return true}
  openJavny(q,true);
  acknowledge('✨ Consultando a Javny');
  return true;
};

function readVisible(){
  const candidate=
    $('#in21Detail.mobile-on')||
    ($('#in21Overlay.on')&&$('#in21Detail'))||
    $('.card.open .detail')||
    $('#ccChat')||
    $('main');
  if(!candidate){vtoast('No hay contenido visible para leer');return true}
  const text=(candidate.innerText||candidate.textContent||'').replace(/\s+/g,' ').trim().slice(0,8500);
  if(!text){vtoast('No hay texto visible para leer');return true}
  try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='es-ES';u.rate=Number(localStorage.getItem('guiaHJ23_rate')||1.03);speechSynthesis.speak(u);vtoast('🔊 Leyendo la pantalla')}catch(e){}
  return true;
}
function stopReading(){
  try{speechSynthesis.cancel()}catch(e){}
  vtoast('🔇 Lectura detenida');return true;
}
function openHelp(){
  $('#in18VoiceHelp')?.classList.add('on');
  vtoast('Aquí tienes los comandos disponibles');
  return true;
}
function closeHelp(){$('#in18VoiceHelp')?.classList.remove('on')}

function voiceSearchLibrary(q){
  q=String(q||'').trim();
  if(!q)return openMaster('all','Biblioteca virtual');
  if(window.Enferix21?.search){window.Enferix21.search(q);acknowledge('Buscando '+q+' en la biblioteca');return true}
  return false;
}
function handleEnhancedVoice(text){
  let raw=String(text||'').trim();
  let c=norm(raw);
  c=c.replace(/^(oye|hola|hey|ei|ok|okey)\s+javny\s*/,'').trim();
  if(!c)return false;

  if(/^(ayuda|comandos|que puedo decir|muestra los comandos|abre ayuda)$/.test(c))return openHelp();
  if(/^(inicio|ir al inicio|volver al inicio|abre inicio|abre la pantalla principal)$/.test(c))return showHome();
  if(/^(volver|atras|cerrar|cierra|salir de aqui|cierra esta pantalla)$/.test(c))return closeCurrent();

  if(/^(abre |abrir |muestra )?(la )?(biblioteca|biblioteca virtual|biblioteca clinica)$/.test(c))
    return openMaster('all','Biblioteca virtual');
  if(/^(abre |abrir |muestra )?(las )?(guias|guias clinicas|menu de guias)$/.test(c))
    return openGuides();
  if(/^(abre |abrir |muestra )?(las )?patologias$/.test(c))
    return openMaster('path','Patologías');
  if(/^(abre |abrir |muestra )?(el )?(vademecum|farmacos|medicamentos)$/.test(c)){
    if(typeof window.openVade==='function'){window.openVade();acknowledge('💊 Abriendo Vademécum');return true}
    return openMaster('vadem','Vademécum');
  }
  if(/^(abre |abrir |muestra )?(las )?(herramientas|escalas|checklists)$/.test(c))
    return openMaster('tools','Herramientas');
  if(/^(abre |abrir |muestra )?(las )?(calculadoras|calculos)$/.test(c)){
    if(typeof window.openCalcs==='function'){window.openCalcs('perf');acknowledge('🧮 Abriendo Calculadoras');return true}
    return openMaster('tools','Herramientas');
  }
  if(/^(abre |abrir |muestra )?(el )?(electro|ecg|electrocardiograma)$/.test(c)){
    if(typeof window.openEcg==='function'){window.openEcg();acknowledge('📈 Abriendo Electro');return true}
    return openMaster('electro','Electro');
  }
  if(/^(abre |abrir |muestra )?(los )?(rayos x|radiografias|imagen|pocus)$/.test(c)){
    if(typeof window.openRx==='function'){window.openRx();acknowledge('🩻 Abriendo Rayos X');return true}
    return openMaster('rx','Rayos X y POCUS');
  }
  if(/^(abre |abrir )?(a )?javny$/.test(c)||/^(asistente|abre el asistente)$/.test(c)){
    openJavny('',false);acknowledge('Javny está abierta');return true;
  }
  if(/^(abre |abrir )?(el )?triage$/.test(c)&&typeof window.openTriage==='function'){
    window.openTriage();acknowledge('Abriendo Triage');return true;
  }
  if(/^(abre |abrir )?(el )?(entrenamiento|modo entrenamiento)$/.test(c)&&typeof window.openTrain==='function'){
    window.openTrain();acknowledge('Abriendo Entrenamiento');return true;
  }
  if(/^(abre |abrir )?(el )?espacio clinico( inteligente)?$/.test(c)){
    if(clickFirst(['#icFab'])){acknowledge('Abriendo Espacio clínico inteligente');return true}
  }
  if(/^(abre |abrir )?(la )?configuracion$/.test(c)){
    if(clickFirst(['#in50SettingsDock'])){acknowledge('⚙️ Abriendo Configuración');return true}
  }

  let m=c.match(/^(busca|buscar)\s+(.+)$/);
  if(m){
    const q=raw.replace(/^(oye|hola|hey|ei|ok|okey)\s+javny[,:]?\s*/i,'')
               .replace(/^busca(r)?\s+/i,'').trim();
    if(typeof window.applyQuery==='function'){window.applyQuery(q);acknowledge('Buscando '+q);return true}
    return voiceSearchLibrary(q);
  }
  m=c.match(/^(busca|buscar)\s+(en )?(la )?biblioteca\s+(.+)$/);
  if(m){
    const q=m[4];return voiceSearchLibrary(q);
  }
  m=c.match(/^(pregunta|preguntale|consulta|dile)\s+(a )?javny\s+(.+)$/);
  if(m){
    const original=raw.replace(/^(oye|hola|hey|ei|ok|okey)\s+javny[,:]?\s*/i,'');
    const q=original.replace(/^(pregunta|pregúntale|preguntale|consulta|dile)\s+(a\s+)?javny\s+/i,'').trim();
    return window.EnferixVoiceAskJavny(q);
  }

  if(/^(lee|leer|lee esto|lee la pantalla|leer pantalla|empieza a leer)$/.test(c))return readVisible();
  if(/^(para de leer|deja de leer|deten la lectura|detener lectura|silencio|calla)$/.test(c))return stopReading();

  if(/^(activa|enciende) (el )?(modo )?(oye javny|manos libres|escucha)$/.test(c)){
    activateHandsFree();return true;
  }
  if(/^(desactiva|apaga|deten|para) (el )?(modo )?(oye javny|manos libres|escucha)$/.test(c)){
    window.HJ23HandsFree?.stop?.();syncVoiceButton();vtoast('🎙️ Oye Javny desactivado');return true;
  }

  // Secciones adicionales (evidencia, procedimientos, algoritmos, proyectos…) vía el lanzador global
  if(/^(abre |abrir |muestra |ve a |ir a )?(la )?(evidencia|literatura|estudios|pubmed|papers|articulos)$/.test(c)&&window.EnferixOpenSection){window.EnferixOpenSection('evidencia');acknowledge('🔬 Abriendo Evidencia');return true}
  if(/^(abre |abrir |muestra )?(los )?procedimientos$/.test(c)&&window.EnferixOpenSection){window.EnferixOpenSection('procedimientos');acknowledge('📝 Abriendo Procedimientos');return true}
  if(/^(abre |abrir |muestra )?(los )?algoritmos$/.test(c)&&window.EnferixOpenSection){window.EnferixOpenSection('algoritmos');acknowledge('🔀 Abriendo Algoritmos');return true}
  if(/^(abre |abrir |muestra )?(los )?(proyectos|proyectos convive|convive)$/.test(c)&&window.EnferixOpenSection){window.EnferixOpenSection('proyectos');acknowledge('👥 Abriendo Proyectos ConVive');return true}
  if(/^(abre |abrir |muestra )?(la )?(farmacologia|pharmacology)$/.test(c)&&window.EnferixOpenSection){window.EnferixOpenSection('farmaco');acknowledge('💊 Abriendo Farmacología');return true}
  // Fallback genérico: "abre/muestra/ve a <sección>" contra el registro de secciones
  if(/^(abre|abrir|muestra|muestrame|ve a|ir a|ensename|entra en)\b/.test(c)&&Array.isArray(window.INURSE_SECTIONS)){
    var _cmd=c.replace(/^(abre|abrir|muestra|muestrame|ve a|ir a|ensename|entra en)\s+(el |la |los |las )?/,'').trim();
    var _hit=window.INURSE_SECTIONS.filter(function(sec){ var kw=norm(sec.t+' '+sec.kw).split(' '); return _cmd&&kw.some(function(w){return w.length>3&&_cmd.indexOf(w)!==-1}); })[0];
    if(_hit&&window.EnferixOpenSection){window.EnferixOpenSection(_hit.id);acknowledge((_hit.em||'')+' Abriendo '+_hit.t);return true}
  }
  return false;
}

const originalHandle=window.handleVoiceCommand;
window.handleVoiceCommand=function(text){
  if(handleEnhancedVoice(text))return true;
  return originalHandle?originalHandle(text):false;
};

async function activateHandsFree(){
  if(!window.HJ23HandsFree){vtoast('El modo manos libres todavía no está disponible');return}
  if(window.HJ23HandsFree.isActive()){
    window.HJ23HandsFree.stop();syncVoiceButton();vtoast('🎙️ Oye Javny desactivado');return;
  }
  try{
    if(navigator.mediaDevices?.getUserMedia){
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      stream.getTracks().forEach(t=>t.stop());
    }
  }catch(e){
    vtoast('Micrófono bloqueado. Autoriza el acceso en Safari o en los ajustes del dispositivo.');
    return;
  }
  window.HJ23HandsFree.toggle();
  setTimeout(()=>{
    syncVoiceButton();
    if(window.HJ23HandsFree.isActive()){
      vtoast('👂 Activado. Di: “Oye Javny, abre la biblioteca”');
      say('Oye Javny está activo');
    }
  },250);
}
function syncVoiceButton(){
  const btn=$('#javnyVoiceBtn');if(!btn)return;
  const on=!!window.HJ23HandsFree?.isActive?.();
  btn.classList.toggle('on',on);
  btn.setAttribute('aria-pressed',on?'true':'false');
  btn.title=on?'Desactivar Oye Javny':'Activar Oye Javny';
  const mini=btn.querySelector('.in18-mini');if(mini)mini.textContent=on?'ON':'JAVNY';
}
function buildHelp(){
  if($('#in18VoiceHelp'))return;
  const ov=document.createElement('div');ov.id='in18VoiceHelp';ov.setAttribute('aria-hidden','true');
  ov.innerHTML=
    '<section class="in18-help-card" role="dialog" aria-modal="true" aria-label="Comandos de Oye Javny">'+
      '<div class="in18-help-head"><div class="in18-help-icon">🎙️</div><div><h2>Oye Javny · Control por voz</h2><p>Activa el micrófono una vez y habla con naturalidad.</p></div><button class="in18-help-x" id="in18HelpClose">✕</button></div>'+
      '<div class="in18-help-body">'+
        '<div class="in18-help-note"><b>Ejemplo:</b> “Oye Javny, abre patologías”. Una frase libre como “Oye Javny, explícamelo” se envía directamente al asistente.</div>'+
        '<div class="in18-command-grid">'+
          '<div class="in18-command"><b>Navegación</b>“Oye Javny, abre la biblioteca”<br>“Abre Guías clínicas”<br>“Vuelve al inicio”</div>'+
          '<div class="in18-command"><b>Áreas clínicas</b>“Abre patologías”<br>“Abre Vademécum”<br>“Abre herramientas”</div>'+
          '<div class="in18-command"><b>Electro e imagen</b>“Abre Electro”<br>“Abre Rayos X”<br>“Abre POCUS”</div>'+
          '<div class="in18-command"><b>Buscar</b>“Busca sepsis”<br>“Busca norepinefrina”<br>“Busca en la biblioteca delirium”</div>'+
          '<div class="in18-command"><b>Hablar con Javny</b>“Pregunta a Javny…”<br>O di directamente la pregunta después de “Oye Javny”.</div>'+
          '<div class="in18-command"><b>Lectura</b>“Lee la pantalla”<br>“Para de leer”<br>“Deja de escuchar”</div>'+
        '</div>'+
        '<div class="in18-help-actions"><button class="primary" id="in18HelpActivate">🎙️ Activar Oye Javny</button><button id="in18HelpClose2">Cerrar</button></div>'+
      '</div>'+
    '</section>';
  document.body.appendChild(ov);
  $('#in18HelpClose').onclick=closeHelp;$('#in18HelpClose2').onclick=closeHelp;
  $('#in18HelpActivate').onclick=()=>{activateHandsFree();closeHelp()};
  ov.addEventListener('click',e=>{if(e.target===ov)closeHelp()});
}
function injectHeaderButton(){
  const actions=$('.v29-actions');if(!actions||$('#javnyVoiceBtn'))return false;
  const btn=document.createElement('button');btn.id='javnyVoiceBtn';btn.type='button';
  btn.setAttribute('aria-label','Activar Oye Javny');btn.setAttribute('aria-pressed','false');
  btn.title='Activar Oye Javny';
  btn.innerHTML='<span aria-hidden="true">🎙️</span><span class="in18-mini">JAVNY</span>';
  btn.onclick=activateHandsFree;
  btn.addEventListener('contextmenu',e=>{e.preventDefault();openHelp()});
  btn.addEventListener('dblclick',openHelp);
  actions.insertBefore(btn,actions.firstChild);
  return true;
}
function boot(){
  buildHelp();
  if(!injectHeaderButton()){
    let tries=0;const timer=setInterval(()=>{tries++;if(injectHeaderButton()||tries>40)clearInterval(timer)},200);
  }
  setInterval(syncVoiceButton,600);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeHelp()});
  setTimeout(()=>{if(!localStorage.getItem('inurse18_voice_intro')){localStorage.setItem('inurse18_voice_intro','1');vtoast('🎙️ Pulsa el micrófono JAVNY para activar “Oye Javny”')}},1500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();

window.EnferixOyeJavny={
  activate:activateHandsFree,
  help:openHelp,
  command:handleEnhancedVoice,
  ask:window.EnferixVoiceAskJavny
};
})();
