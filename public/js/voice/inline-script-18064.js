
(function(){
 'use strict';
 var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 var synth=window.speechSynthesis;

 /* ═══════ 1. VOZ UNIVERSAL EN BUSCADORES ═══════ */
 var SEARCH_TARGETS=[
  {id:'vadeSearch',  after:'vadeClear'},
  {id:'in56PatoSearch'},
  {id:'in21Search',  after:'in21Clear'},
  {id:'in195Search'},
  {id:'in196Search'},
  {id:'v27AlgSearch'},
  {id:'v28CimaQuery'},
  {id:'nxSearch'},
  {id:'esc35Search', after:'esc35Clear'}
 ];

 function addMicToField(cfg){
  var inp=document.getElementById(cfg.id);
  if(!inp||inp.dataset.v29mic)return;
  inp.dataset.v29mic='1';
  var btn=document.createElement('button');
  btn.className='v29-mic';
  btn.innerHTML='🎤';
  btn.setAttribute('aria-label','Buscar por voz');
  btn.type='button';
  var rec=null,on=false;
  btn.onclick=function(){
   if(!SR){return}
   if(on&&rec){rec.stop();return}
   rec=new SR();rec.lang='es-ES';rec.interimResults=true;rec.continuous=false;
   var final='';on=true;
   btn.classList.add('listening');btn.innerHTML='🔴';
   rec.onresult=function(e){
    var interim='';
    for(var i=e.resultIndex;i<e.results.length;i++){
     if(e.results[i].isFinal)final+=e.results[i][0].transcript;
     else interim+=e.results[i][0].transcript;
    }
    inp.value=(final+interim).trim();
    inp.dispatchEvent(new Event('input',{bubbles:true}));
   };
   rec.onend=function(){
    on=false;btn.classList.remove('listening');btn.innerHTML='🎤';rec=null;
    if(final.trim()){
     inp.value=final.trim();
     inp.dispatchEvent(new Event('input',{bubbles:true}));
     var form=inp.closest('form');if(form)form.dispatchEvent(new Event('submit',{bubbles:true}));
     var enter=new KeyboardEvent('keydown',{key:'Enter',keyCode:13,bubbles:true});
     inp.dispatchEvent(enter);
    }
   };
   rec.onerror=function(){on=false;btn.classList.remove('listening');btn.innerHTML='🎤';rec=null};
   rec.start();
  };
  if(cfg.after){
   var ref=document.getElementById(cfg.after);
   if(ref&&ref.parentNode){ref.parentNode.insertBefore(btn,ref);return}
  }
  var parent=inp.parentNode;
  if(parent){
   var clear=parent.querySelector('button.clear,button.vx,.clear');
   if(clear)parent.insertBefore(btn,clear);
   else parent.appendChild(btn);
  }
 }

 function patchAllSearchFields(){
  SEARCH_TARGETS.forEach(addMicToField);
 }

 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(patchAllSearchFields,800)});
 else setTimeout(patchAllSearchFields,800);
 var obs29=new MutationObserver(function(){patchAllSearchFields()});
 if(document.body)obs29.observe(document.body,{childList:true,subtree:true});

 /* ═══════ 2. SPEAK MEJORADO CON CHUNKING (iOS FIX) ═══════ */
 function cleanForTTS(text){
  return String(text||'')
   .replace(/\[(?:REF-\d+|NICE-\d+|Enferix-\w+|FDA|\d+)\]/g,'')
   .replace(/#{1,6}\s/g,'').replace(/\*\*(.*?)\*\*/g,'$1').replace(/\*(.*?)\*/g,'$1')
   .replace(/`[^`]*`/g,'').replace(/https?:\/\/\S+/g,'')
   .replace(/DOI:\s*\S+/g,'').replace(/PMID:\s*\d+/g,'')
   .replace(/[*#`_~|]/g,'').replace(/\s+/g,' ').trim();
 }
 function splitChunks(text,max){
  var sentences=text.match(/[^.!?]+[.!?]+/g)||[text];
  var chunks=[],cur='';
  for(var i=0;i<sentences.length;i++){
   if((cur+sentences[i]).length>max&&cur){chunks.push(cur.trim());cur=sentences[i]}
   else cur+=sentences[i];
  }
  if(cur.trim())chunks.push(cur.trim());
  return chunks;
 }
 function speakChunked(text,onEnd){
  if(!synth){if(onEnd)onEnd();return}
  synth.cancel();
  var clean=cleanForTTS(text);
  if(!clean){if(onEnd)onEnd();return}
  var chunks=splitChunks(clean,250);
  var idx=0;
  var voices=synth.getVoices();
  var esVoice=voices.find(function(v){return /es(-|_)ES/i.test(v.lang)})||voices.find(function(v){return /^es/i.test(v.lang)});
  function next(){
   if(idx>=chunks.length){if(onEnd)onEnd();return}
   var u=new SpeechSynthesisUtterance(chunks[idx]);
   u.lang='es-ES';u.rate=1.02;u.pitch=1;u.volume=1;
   if(esVoice)u.voice=esVoice;
   u.onend=function(){idx++;next()};
   u.onerror=function(){idx++;next()};
   synth.speak(u);
  }
  if(voices.length===0&&synth.onvoiceschanged!==undefined){
   synth.onvoiceschanged=function(){
    voices=synth.getVoices();
    esVoice=voices.find(function(v){return /es(-|_)ES/i.test(v.lang)})||voices.find(function(v){return /^es/i.test(v.lang)});
    next();
   };
  }else next();
 }
 window.speakChunked=speakChunked;

 /* ═══════ 3. JAVNY LIFE — MODO MANOS LIBRES MEJORADO ═══════ */
 var vlOverlay=document.getElementById('v29JavnyLifeOverlay');
 var vlOrb=document.getElementById('v29Orb');
 var vlLabel=document.getElementById('v29Label');
 var vlTranscript=document.getElementById('v29Transcript');
 var vlResponse=document.getElementById('v29Response');
 var vlClose=document.getElementById('v29vlClose');
 var vlFab=document.getElementById('v29Fab');
 var vlActive=false,vlState='idle',vlWakeLock=null;
 var vlStream=null,vlCtx=null,vlSource=null,vlProc=null,vlSampleRate=48000;
 var vlChunks=[],vlSpeaking=false,vlSpeechMs=0,vlSilenceMs=0,vlHist=[];
 // Detección de voz (VAD)
 var VL_RMS_ON=0.018, VL_RMS_OFF=0.012, VL_SILENCE_MS=1200, VL_MIN_SPEECH_MS=350, VL_MAX_SPEECH_MS=15000, VL_OUT_RATE=16000;

 function vlSetState(s){
  vlState=s;
  vlOrb.className='v29vl-orb '+s;
  var labels={idle:'Javny Life lista. Habla cuando quieras.',listening:'🎤 Escuchando...',processing:'🔍 Transcribiendo y buscando evidencia...',speaking:'🔊 Javny responde...'};
  vlLabel.textContent=labels[s]||labels.idle;
 }

 function vlDownsample(buf,inRate,outRate){
  if(outRate>=inRate)return buf;
  var ratio=inRate/outRate,newLen=Math.round(buf.length/ratio);
  var out=new Float32Array(newLen),oR=0,oB=0;
  while(oR<newLen){
   var next=Math.round((oR+1)*ratio),acc=0,cnt=0;
   for(var i=oB;i<next&&i<buf.length;i++){acc+=buf[i];cnt++}
   out[oR]=cnt?acc/cnt:0;oR++;oB=next;
  }
  return out;
 }
 function vlEncodeWAV(samples,rate){
  var buffer=new ArrayBuffer(44+samples.length*2),view=new DataView(buffer);
  function ws(off,str){for(var i=0;i<str.length;i++)view.setUint8(off+i,str.charCodeAt(i))}
  ws(0,'RIFF');view.setUint32(4,36+samples.length*2,true);ws(8,'WAVE');
  ws(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);
  view.setUint32(24,rate,true);view.setUint32(28,rate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);
  ws(36,'data');view.setUint32(40,samples.length*2,true);
  var off=44;
  for(var i=0;i<samples.length;i++){var s=Math.max(-1,Math.min(1,samples[i]));view.setInt16(off,s<0?s*0x8000:s*0x7FFF,true);off+=2}
  return buffer;
 }
 function vlToBase64(buf){
  var bytes=new Uint8Array(buf),bin='',CH=0x8000;
  for(var i=0;i<bytes.length;i+=CH)bin+=String.fromCharCode.apply(null,bytes.subarray(i,i+CH));
  return btoa(bin);
 }

 function vlResetCapture(){vlChunks=[];vlSpeaking=false;vlSpeechMs=0;vlSilenceMs=0}

 function vlOnAudio(e){
  if(!vlActive||vlState!=='listening')return;
  var input=e.inputBuffer.getChannelData(0);
  var sum=0;for(var i=0;i<input.length;i++)sum+=input[i]*input[i];
  var rms=Math.sqrt(sum/input.length);
  var frameMs=(input.length/vlSampleRate)*1000;
  if(rms>VL_RMS_ON){
   if(!vlSpeaking){vlSpeaking=true;vlSpeechMs=0}
   vlSilenceMs=0;vlSpeechMs+=frameMs;
   vlChunks.push(new Float32Array(input));
   if(vlSpeechMs>VL_MAX_SPEECH_MS)vlFinalizeUtterance();
  }else if(vlSpeaking){
   vlChunks.push(new Float32Array(input));
   if(rms<VL_RMS_OFF){
    vlSilenceMs+=frameMs;
    if(vlSilenceMs>=VL_SILENCE_MS){
     if(vlSpeechMs>=VL_MIN_SPEECH_MS)vlFinalizeUtterance();
     else vlResetCapture();
    }
   }else{vlSilenceMs=0;vlSpeechMs+=frameMs}
  }
 }

 function vlFinalizeUtterance(){
  if(!vlChunks.length){vlResetCapture();return}
  var total=0;for(var i=0;i<vlChunks.length;i++)total+=vlChunks[i].length;
  var merged=new Float32Array(total),off=0;
  for(var j=0;j<vlChunks.length;j++){merged.set(vlChunks[j],off);off+=vlChunks[j].length}
  vlResetCapture();
  var ds=vlDownsample(merged,vlSampleRate,VL_OUT_RATE);
  var wav=vlEncodeWAV(ds,VL_OUT_RATE);
  var b64=vlToBase64(wav);
  vlTranscribeAndAnswer(b64);
 }

 function vlBackend(){
  var b=(window.localStorage&&localStorage.getItem('inurse_v20_backend_url')||'').trim().replace(/\/$/,'');
  return b||location.origin;
 }

 async function vlTranscribeAndAnswer(audioB64){
  vlSetState('processing');
  vlTranscript.textContent='Transcribiendo...';
  try{
   var tr=await fetch(vlBackend()+'/api/javny/transcribe',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({audio:audioB64,mimeType:'audio/wav'})
   });
   var trData=await tr.json().catch(function(){return{}});
   if(!tr.ok)throw new Error((typeof trData.error==='string'?trData.error:JSON.stringify(trData.error||''))||('Transcripción HTTP '+tr.status));
   var pregunta=(trData.text||'').trim();
   if(!pregunta){vlTranscript.textContent='(No te he entendido, repite por favor)';if(vlActive){vlSetState('listening')}return}
   vlTranscript.textContent='«'+pregunta+'»';
   await vlAnswer(pregunta);
  }catch(err){
   vlResponse.innerHTML='<strong>Error:</strong> '+(err&&err.message?err.message:String(err));
   vlSetState('speaking');
   await new Promise(function(r){speakChunked('Lo siento, ha habido un problema. Inténtalo de nuevo.',r)});
   if(vlActive)vlSetState('listening');
  }
 }

 async function vlAnswer(pregunta){
  vlSetState('processing');
  try{
   var res=await fetch(vlBackend()+'/api/javny/chat',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({question:pregunta,context:{},history:vlHist.slice(-6),caseMemory:[],route:{}})
   });
   var data=await res.json().catch(function(){return{}});
   if(!res.ok)throw new Error((typeof data.error==='string'?data.error:JSON.stringify(data.error||''))||('Servidor HTTP '+res.status));
   var answer=data.answer||data.text||'No he podido obtener una respuesta.';
   vlHist.push({role:'user',content:pregunta});vlHist.push({role:'model',content:answer});
   var preview=answer.length>700?answer.substring(0,700)+'...':answer;
   vlResponse.innerHTML='<strong>Pregunta:</strong> '+pregunta+'<br><br>'+preview.replace(/\n/g,'<br>');
   vlSetState('speaking');
   await new Promise(function(resolve){speakChunked(answer,resolve)});
  }catch(err){
   vlResponse.innerHTML='<strong>Error:</strong> '+(err&&err.message?err.message:String(err));
   vlSetState('speaking');
   await new Promise(function(resolve){speakChunked('Lo siento, ha habido un error al buscar la información.',resolve)});
  }
  if(vlActive)vlSetState('listening');
 }

 async function vlActivate(){
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
   vlOverlay.classList.add('on');vlLabel.textContent='Este dispositivo no permite acceder al micrófono.';return;
  }
  vlActive=true;vlFab.classList.add('on');vlFab.innerHTML='⏹';
  vlOverlay.classList.add('on');vlTranscript.textContent='';vlResponse.innerHTML='';
  vlSetState('idle');vlHist=[];vlResetCapture();
  try{
   vlStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1}});
   var Ctx=window.AudioContext||window.webkitAudioContext;
   vlCtx=new Ctx();
   if(vlCtx.state==='suspended')try{await vlCtx.resume()}catch(e){}
   vlSampleRate=vlCtx.sampleRate;
   vlSource=vlCtx.createMediaStreamSource(vlStream);
   vlProc=vlCtx.createScriptProcessor(4096,1,1);
   vlProc.onaudioprocess=vlOnAudio;
   vlSource.connect(vlProc);vlProc.connect(vlCtx.destination);
   vlSetState('listening');
   if('wakeLock'in navigator){try{vlWakeLock=await navigator.wakeLock.request('screen')}catch(e){}}
  }catch(err){
   vlLabel.textContent=err&&err.name==='NotAllowedError'?'Permiso de micrófono denegado. Actívalo en los ajustes.':'No se pudo iniciar el micrófono: '+(err&&err.message||err);
   vlActive=false;vlFab.classList.remove('on');vlFab.innerHTML='🎙️';
  }
 }

 function vlDeactivate(){
  vlActive=false;vlFab.classList.remove('on');vlFab.innerHTML='🎙️';
  if(synth)synth.cancel();
  try{if(vlProc){vlProc.disconnect();vlProc.onaudioprocess=null}}catch(e){}
  try{if(vlSource)vlSource.disconnect()}catch(e){}
  try{if(vlCtx&&vlCtx.state!=='closed')vlCtx.close()}catch(e){}
  try{if(vlStream)vlStream.getTracks().forEach(function(t){t.stop()})}catch(e){}
  vlProc=null;vlSource=null;vlCtx=null;vlStream=null;vlResetCapture();
  vlOverlay.classList.remove('on');vlSetState('idle');
  if(vlWakeLock){try{vlWakeLock.release()}catch(e){}vlWakeLock=null}
 }

 vlFab.onclick=function(){
  // El botón verde ahora abre Javny Live (conversación clínica continua),
  // en lugar del modo manos libres que no funcionaba.
  var b=document.getElementById('v26LiveHeaderBtn')||document.getElementById('v26LiveChatBtn');
  if(b){b.click();return;}
  // Respaldo: si Javny Live no está disponible, usa el modo manos libres.
  vlActive?vlDeactivate():vlActivate();
 };
 vlClose.onclick=vlDeactivate;
 document.addEventListener('visibilitychange',function(){
  if(document.visibilityState==='visible'&&vlActive&&'wakeLock'in navigator){
   navigator.wakeLock.request('screen').then(function(w){vlWakeLock=w}).catch(function(){});
  }
 });
})();
