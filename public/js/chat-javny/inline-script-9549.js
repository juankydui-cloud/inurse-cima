
/* ================= JAVNY · conexión Gemini directa y robusta =================
   - Elimina el proxy antiguo que estaba devolviendo errores OAuth en inglés.
   - Usa la autenticación oficial x-goog-api-key.
   - Unifica la API key entre todos los módulos de Enferix.
   - Reintenta errores temporales 429/5xx y traduce los errores al español.
========================================================================== */
(function(){
  'use strict';

  var NATIVE_FETCH = window.fetch.bind(window);
  var KEY_NAMES = [
    'guiaHJ23_apikey',
    'inurse_gemini_api_key_v1',
    'in51_gemini_key',
    'inurse52_gemini_api_key'
  ];
  var DEFAULT_MODEL = 'gemini-3.5-flash';
  var FALLBACK_MODEL = 'gemini-3.1-flash-lite';
  var MODEL_CHAIN = [DEFAULT_MODEL,FALLBACK_MODEL,'gemini-3.1-pro-preview'];
  window.JAVNY_BACKEND = '';

  function readKey(){
    try{
      for(var i=0;i<KEY_NAMES.length;i++){
        var v=(localStorage.getItem(KEY_NAMES[i])||'').trim();
        if(v)return v;
      }
    }catch(e){}
    return '';
  }
  function saveKeyEverywhere(v){
    v=String(v||'').trim();
    try{
      KEY_NAMES.forEach(function(k){
        if(v)localStorage.setItem(k,v); else localStorage.removeItem(k);
      });
    }catch(e){}
    return v;
  }
  function syncExistingKey(){
    var k=readKey();
    if(k)saveKeyEverywhere(k);
  }
  function sleep(ms){return new Promise(function(resolve){setTimeout(resolve,ms);});}
  function isGeminiUrl(url){return typeof url==='string' && url.indexOf('generativelanguage.googleapis.com')!==-1;}
  function modelFromUrl(url){var m=String(url||'').match(/\/models\/([^:]+):/);return m?decodeURIComponent(m[1]):DEFAULT_MODEL;}
  function replaceModel(url,model){return String(url).replace(/\/models\/([^:]+):/, '/models/'+encodeURIComponent(model)+':');}

  function spanishError(status, raw){
    var msg=String(raw||'').trim();
    var low=msg.toLowerCase();
    if(status===401 || low.indexOf('invalid authentication credentials')>=0 || low.indexOf('expected oauth 2')>=0){
      return 'La solicitud se estaba enviando con un método de autenticación incorrecto. Esta versión ya usa la API key oficial de Gemini. Guarda de nuevo la clave y pulsa «Probar conexión».';
    }
    if(status===403 || low.indexOf('permission_denied')>=0 || low.indexOf('permission denied')>=0){
      if(low.indexOf('api key')>=0 || low.indexOf('key')>=0){
        return 'Google ha rechazado la API key. Comprueba que sea una clave creada en Google AI Studio, que no esté bloqueada y que sus restricciones permitan usarla desde este archivo local.';
      }
      return 'Google ha rechazado la solicitud por falta de permisos. Revisa la API key y el proyecto asociado.';
    }
    if(status===400 && (low.indexOf('api key not valid')>=0 || low.indexOf('invalid api key')>=0)){
      return 'La API key no es válida. Cópiala de nuevo desde Google AI Studio sin espacios antes ni después.';
    }
    if(status===404 || low.indexOf('no longer available')>=0 || low.indexOf('model not found')>=0 || low.indexOf('is not found')>=0){
      return 'El modelo de Gemini configurado ya no está disponible para esta clave. Enferix ha intentado cambiar automáticamente a un modelo actual. Abre Ajustes y pulsa «Probar conexión».';
    }
    if(status===429 || low.indexOf('resource_exhausted')>=0 || low.indexOf('rate limit')>=0){
      return 'Se ha alcanzado temporalmente el límite de solicitudes de Gemini. Espera un momento y vuelve a intentarlo.';
    }
    if(status===503 || low.indexOf('high demand')>=0 || low.indexOf('unavailable')>=0 || low.indexOf('capacity')>=0){
      return 'Gemini está temporalmente saturado. Enferix ya ha reintentado la consulta y ha probado un modelo alternativo. Vuelve a intentarlo dentro de unos segundos.';
    }
    if(status===504 || low.indexOf('deadline_exceeded')>=0){
      return 'La consulta ha tardado demasiado. Prueba con una pregunta algo más concreta o elimina adjuntos muy pesados.';
    }
    if(low.indexOf('failed to fetch')>=0 || low.indexOf('networkerror')>=0 || low.indexOf('load failed')>=0){
      return 'No se ha podido conectar con Gemini. Comprueba la conexión a Internet y que Safari no esté bloqueando la solicitud.';
    }
    if(low.indexOf('api key was reported as leaked')>=0){
      return 'Google ha bloqueado esta API key porque se detectó como expuesta. Crea una nueva en Google AI Studio y no la compartas.';
    }
    return msg || ('Error de Gemini ('+status+').');
  }

  function preparePayload(opts){
    var next=Object.assign({},opts||{});
    var payload=null;
    try{payload=JSON.parse(next.body||'{}');}catch(e){payload=null;}
    if(payload && Array.isArray(payload.contents)){
      var instruction='INSTRUCCIÓN OBLIGATORIA: responde siempre en español de España, con frases completas, títulos claros y sin mostrar mensajes técnicos en inglés. Contesta todos los puntos de la pregunta y no termines a mitad de una explicación. ';
      var inserted=false;
      for(var i=0;i<payload.contents.length&&!inserted;i++){
        var parts=payload.contents[i]&&payload.contents[i].parts;
        if(!Array.isArray(parts))continue;
        for(var j=0;j<parts.length;j++){
          if(typeof parts[j].text==='string'){
            if(parts[j].text.indexOf('INSTRUCCIÓN OBLIGATORIA: responde siempre en español')===-1){parts[j].text=instruction+parts[j].text;}
            inserted=true;break;
          }
        }
      }
      if(!inserted){payload.contents.unshift({role:'user',parts:[{text:instruction}]});}
      payload.generationConfig=payload.generationConfig||{};
      var current=Number(payload.generationConfig.maxOutputTokens||0);
      if(!current || current<2400)payload.generationConfig.maxOutputTokens=2400;
      next.body=JSON.stringify(payload);
    }
    return next;
  }

  async function directGemini(url,opts){
    var originalUrl=String(url);
    var key='';
    try{
      var u=new URL(originalUrl);
      key=(u.searchParams.get('key')||readKey()).trim();
      u.searchParams.delete('key');
      originalUrl=u.toString();
    }catch(e){key=readKey();}
    if(!key){
      return new Response(JSON.stringify({error:{message:'Falta la API key de Gemini. Ábrela en Ajustes, guárdala y pulsa «Probar conexión».'}}),{status:401,headers:{'Content-Type':'application/json'}});
    }
    saveKeyEverywhere(key);
    var prepared=preparePayload(opts);
    var headers=new Headers(prepared.headers||{});
    headers.set('Content-Type','application/json');
    headers.set('x-goog-api-key',key);
    delete prepared.headers;

    async function attempt(targetUrl,n,usedModels){
      usedModels=usedModels||[];
      var currentModel=modelFromUrl(targetUrl);
      if(usedModels.indexOf(currentModel)<0)usedModels.push(currentModel);
      try{
        var res=await NATIVE_FETCH(targetUrl,Object.assign({},prepared,{headers:headers}));
        var raw='';
        if(!res.ok){
          try{var j=await res.clone().json();raw=(j&&j.error&&j.error.message)||JSON.stringify(j);}catch(e){try{raw=await res.clone().text();}catch(_e){}}
        }
        var low=String(raw||'').toLowerCase();
        var retired=(res.status===404 || low.indexOf('no longer available')>=0 || low.indexOf('model not found')>=0 || low.indexOf('is not found')>=0 || low.indexOf('not supported')>=0);
        if(retired){
          for(var mi=0;mi<MODEL_CHAIN.length;mi++){
            var candidate=MODEL_CHAIN[mi];
            if(usedModels.indexOf(candidate)<0){
              try{
                localStorage.setItem('inurse_gemini_model_v1',candidate);
                var cRaw=localStorage.getItem('inurse52_javny_config');
                if(cRaw){var cObj=JSON.parse(cRaw);cObj.model=candidate;localStorage.setItem('inurse52_javny_config',JSON.stringify(cObj));}
              }catch(_m){}
              return attempt(replaceModel(targetUrl,candidate),0,usedModels);
            }
          }
        }
        if((res.status===429 || res.status===500 || res.status===502 || res.status===503 || res.status===504) && n<2){
          await sleep((900*Math.pow(2,n))+Math.floor(Math.random()*350));
          return attempt(targetUrl,n+1,usedModels);
        }
        if((res.status===429 || res.status===503) && usedModels.indexOf(FALLBACK_MODEL)<0){
          await sleep(700+Math.floor(Math.random()*250));
          return attempt(replaceModel(targetUrl,FALLBACK_MODEL),0,usedModels);
        }
        if(!res.ok){
          var friendly=spanishError(res.status,raw);
          return new Response(JSON.stringify({error:{code:res.status,message:friendly,status:'ERROR'}}),{status:res.status,headers:{'Content-Type':'application/json'}});
        }
        try{
          localStorage.setItem('inurse_gemini_model_v1',currentModel);
          var cfgRaw=localStorage.getItem('inurse52_javny_config');
          if(cfgRaw){var cfgObj=JSON.parse(cfgRaw);cfgObj.model=currentModel;localStorage.setItem('inurse52_javny_config',JSON.stringify(cfgObj));}
        }catch(_save){}
        return res;
      }catch(err){
        if(n<2){await sleep((900*Math.pow(2,n))+Math.floor(Math.random()*350));return attempt(targetUrl,n+1,usedModels);}
        var friendly=spanishError(503,err&&err.message);
        return new Response(JSON.stringify({error:{code:503,message:friendly,status:'UNAVAILABLE'}}),{status:503,headers:{'Content-Type':'application/json'}});
      }
    }
    return attempt(originalUrl,0,[]);
  }

  window.fetch=function(url,opts){
    if(isGeminiUrl(url))return directGemini(url,opts||{});
    return NATIVE_FETCH(url,opts);
  };

  window.javnyAsk=async function(question,context){
    var key=readKey();
    if(!key)return {error:'Falta la API key de Gemini. Guárdala en Ajustes y prueba la conexión.'};
    var prompt=[
      'Eres Javny, asistente de Enferix. Responde siempre en español de España.',
      'Da una respuesta completa, clara, práctica y bien organizada.',
      'En temas clínicos distingue información general, prioridades, signos de alarma y límites de seguridad.',
      'No inventes fuentes ni afirmes que has navegado por Internet. Usa el contexto local aportado y recomienda abrir las fuentes oficiales integradas cuando corresponda.',
      context?'Contexto local de Enferix:\n'+String(context).slice(0,10000):'',
      'Pregunta:\n'+String(question||'')
    ].filter(Boolean).join('\n\n');
    var url='https://generativelanguage.googleapis.com/v1beta/models/'+DEFAULT_MODEL+':generateContent?key='+encodeURIComponent(key);
    var res=await window.fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{temperature:0.35,maxOutputTokens:3200}})});
    var data=await res.json().catch(function(){return {};});
    if(!res.ok)return {error:(data.error&&data.error.message)||('Error '+res.status)};
    var answer='';
    try{answer=(data.candidates[0].content.parts||[]).map(function(p){return p.text||'';}).join('\n').trim();}catch(e){}
    return {answer:answer||'No he recibido texto de respuesta.',sources:[]};
  };

  window.__javnySrc=function(sources){
    if(!sources||!sources.length)return '';
    var s='\n\nFuentes consultadas:\n';
    sources.forEach(function(f){s+='('+f.n+') '+f.title+' — '+(f.journal||f.source||'')+(f.year?' ('+f.year+')':'')+'.\n';});
    return s;
  };

  window.__javnyNet=false;
  function wireNet(){
    var b=document.getElementById('ccNet');
    if(!b)return;
    b.onclick=function(){
      window.__javnyNet=!window.__javnyNet;
      b.classList.toggle('on',window.__javnyNet);
      b.style.background=window.__javnyNet?'linear-gradient(135deg,#22D3EE,#A855F7)':'';
      b.style.color=window.__javnyNet?'#fff':'';
      var msg=window.__javnyNet?'🏛️ Javny usará también el repositorio oficial integrado':'🏛️ Repositorio adicional desactivado';
      try{if(typeof toast==='function')toast(msg);}catch(e){}
    };
  }

  function bindKeyButtons(){
    syncExistingKey();
    document.addEventListener('click',function(e){
      var btn=e.target&&e.target.closest&&e.target.closest('#in51SaveGemini,#in52Save,#ccSaveKey,#ccSave,#saveApiKey');
      if(!btn)return;
      setTimeout(function(){
        var inputs=['#in51GeminiKey','#in52ApiKey','#ccKey','.api-key-input'];
        for(var i=0;i<inputs.length;i++){
          var el=document.querySelector(inputs[i]);
          if(el&&el.value&&el.value.trim()){saveKeyEverywhere(el.value);break;}
        }
      },50);
    },true);
  }

  if(document.readyState!=='loading'){wireNet();bindKeyButtons();}
  else document.addEventListener('DOMContentLoaded',function(){wireNet();bindKeyButtons();});
  setTimeout(function(){wireNet();syncExistingKey();},700);

  window.EnferixGemini={getKey:readKey,saveKey:saveKeyEverywhere,translateError:spanishError};
})();
