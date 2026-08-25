/* Enferix · Preferencias de voz, accesibilidad y especialidad
   ────────────────────────────────────────────────────────────────────────────
   El idioma de voz estaba fijado a 'es-ES' en una decena de sitios repartidos
   por la app (reconocimiento y síntesis). En vez de editar los diez y arriesgar
   que uno se quede atrás —o que un script vuelva a pisar a otro, como ya pasó
   con el logo—, aquí se interceptan las dos APIs del navegador en un solo
   punto y se aplica la preferencia guardada justo antes de usarlas:

   - speechSynthesis.speak(): fija idioma, voz y velocidad en el enunciado.
   - SpeechRecognition.prototype.start(): fija el idioma de escucha. Se hace en
     start() y no en el constructor porque las llamadas existentes asignan
     .lang después de crear el objeto; en start() la preferencia llega la
     última y gana.

   Las claves que ya usaba la app (guiaHJ23_autovoice, guiaHJ23_rate) se
   conservan tal cual para no romper el código que las lee.
*/
(function(){
'use strict';

var K_LANG = 'enferix_voice_lang_v1';
var K_VOICE = 'enferix_voice_uri_v1';
var K_SCALE = 'enferix_text_scale_v1';
var K_RATE = 'guiaHJ23_rate';        // ya existente
var K_AUTO = 'guiaHJ23_autovoice';   // ya existente

function ls(k, def){ try{ var v = localStorage.getItem(k); return v == null ? def : v; }catch(e){ return def; } }
function save(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }

/* ── Idiomas ofrecidos ──────────────────────────────────────────────────── */
var IDIOMAS = [
  { id:'es-ES', label:'Español (España)' },
  { id:'es-MX', label:'Español (México)' },
  { id:'es-AR', label:'Español (Argentina)' },
  { id:'es-CO', label:'Español (Colombia)' },
  { id:'es-CL', label:'Español (Chile)' },
  { id:'es-US', label:'Español (Estados Unidos)' },
  { id:'ca-ES', label:'Català' },
  { id:'gl-ES', label:'Galego' },
  { id:'eu-ES', label:'Euskara' },
  { id:'en-US', label:'English (US)' },
  { id:'en-GB', label:'English (UK)' },
  { id:'pt-PT', label:'Português' }
];

function lang(){ return ls(K_LANG, 'es-ES') || 'es-ES'; }
function rate(){
  var r = parseFloat(ls(K_RATE, ''));
  return (isFinite(r) && r > 0) ? r : null;   // null = respeta lo que ponga cada sitio
}
function autoVoice(){ return ls(K_AUTO, '0') === '1'; }
function textScale(){
  var n = parseFloat(ls(K_SCALE, '1'));
  return (isFinite(n) && n >= 0.8 && n <= 1.6) ? n : 1;
}

/* Voces instaladas en el dispositivo. Chrome las carga de forma asíncrona, de
   ahí el evento voiceschanged. */
function voices(){
  try{ return (window.speechSynthesis && speechSynthesis.getVoices()) || []; }catch(e){ return []; }
}
function voicesForLang(l){
  var base = String(l || lang()).slice(0,2).toLowerCase();
  return voices().filter(function(v){ return String(v.lang||'').slice(0,2).toLowerCase() === base; });
}
/* Voz elegida por el usuario; si no hay o ya no existe, la mejor del idioma. */
function pickVoice(l){
  var want = ls(K_VOICE, '');
  var all = voices();
  if(want){
    var exact = all.find(function(v){ return v.voiceURI === want; });
    if(exact) return exact;
  }
  var target = String(l || lang()).toLowerCase();
  var same = all.find(function(v){ return String(v.lang||'').toLowerCase().replace('_','-') === target; });
  if(same) return same;
  var base = target.slice(0,2);
  return all.find(function(v){ return String(v.lang||'').slice(0,2).toLowerCase() === base; }) || null;
}

/* ── Intercepción de la síntesis de voz ─────────────────────────────────── */
(function patchSynthesis(){
  if(!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
  if(speechSynthesis.__enferixPatched) return;
  var orig = speechSynthesis.speak.bind(speechSynthesis);
  speechSynthesis.speak = function(u){
    try{
      if(u && typeof u === 'object'){
        var l = lang();
        u.lang = l;
        var v = pickVoice(l);
        if(v) u.voice = v;
        var r = rate();
        if(r) u.rate = r;
      }
    }catch(e){}
    return orig(u);
  };
  speechSynthesis.__enferixPatched = true;
})();

/* ── Intercepción del reconocimiento de voz ─────────────────────────────── */
(function patchRecognition(){
  ['SpeechRecognition','webkitSpeechRecognition'].forEach(function(k){
    var C = window[k];
    if(!C || !C.prototype || C.prototype.__enferixPatched) return;
    var origStart = C.prototype.start;
    if(typeof origStart !== 'function') return;
    C.prototype.start = function(){
      // Se aplica aquí, no en el constructor: las llamadas existentes asignan
      // .lang justo después de crear el objeto y pisarían la preferencia.
      try{ this.lang = lang(); }catch(e){}
      return origStart.apply(this, arguments);
    };
    C.prototype.__enferixPatched = true;
  });
})();

/* ── Tamaño de texto ────────────────────────────────────────────────────── */
/* Se expone como variable CSS; la hoja de accesibilidad la usa para escalar
   el texto sin tocar la maquetación. */
function applyTextScale(n){
  var v = (typeof n === 'number') ? n : textScale();
  try{
    document.documentElement.style.setProperty('--eux-text-scale', String(v));
    document.documentElement.classList.toggle('eux-text-scaled', v !== 1);
  }catch(e){}
}
applyTextScale();
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', function(){ applyTextScale(); });
}

/* ── Datos guardados en este dispositivo ────────────────────────────────── */
/* La app guarda en el navegador el perfil, los turnos, los favoritos, el
   historial, los proyectos y la clave de Gemini, y hasta ahora no había forma
   de verlo, sacarlo ni borrarlo desde la interfaz. */

/* Claves donde puede acabar la clave de API, sueltas o dentro de un JSON. */
var CLAVES_API = ['guiaHJ23_apikey','gemini_api_key','inurse_gemini_api_key_v1',
                  'in51_gemini_key','inurse52_gemini_api_key'];
var JSON_CON_CLAVE = ['inurse_vivi_config_v1','inurse52_javny_config'];

function todasLasClaves(){
  var out = [];
  try{ for(var i=0; i<localStorage.length; i++) out.push(localStorage.key(i)); }catch(e){}
  return out;
}

function resumen(){
  var claves = todasLasClaves(), bytes = 0;
  claves.forEach(function(k){
    try{ bytes += (k.length + String(localStorage.getItem(k)||'').length); }catch(e){}
  });
  var tieneClave = CLAVES_API.some(function(k){ return !!ls(k,''); }) ||
    JSON_CON_CLAVE.some(function(k){
      try{ return !!(JSON.parse(ls(k,'{}')||'{}').apiKey); }catch(e){ return false; }
    });
  return { claves: claves.length, kb: Math.max(1, Math.round(bytes/1024)), tieneClaveApi: tieneClave };
}

/* incluirClave=false (por defecto) deja fuera la clave de Gemini: el fichero
   acaba en Descargas y puede terminar compartido sin pensarlo. */
function exportar(incluirClave){
  var datos = {};
  todasLasClaves().forEach(function(k){
    if(!incluirClave && CLAVES_API.indexOf(k) >= 0) return;
    var v = ls(k, null);
    if(v == null) return;
    if(!incluirClave && JSON_CON_CLAVE.indexOf(k) >= 0){
      try{ var o = JSON.parse(v); delete o.apiKey; v = JSON.stringify(o); }catch(e){}
    }
    datos[k] = v;
  });
  return {
    app: 'Enferix',
    version: 1,
    exportadoEl: new Date().toISOString(),
    incluyeClaveApi: !!incluirClave,
    datos: datos
  };
}

/* Restaura sumando, sin vaciar antes: así una copia antigua no se lleva por
   delante lo que hayas hecho después y no esté en el fichero. */
function importar(texto){
  var obj;
  try{ obj = JSON.parse(texto); }
  catch(e){ throw new Error('El fichero no es un JSON válido.'); }
  if(!obj || obj.app !== 'Enferix' || !obj.datos || typeof obj.datos !== 'object'){
    throw new Error('Este fichero no es una copia de Enferix.');
  }
  var n = 0;
  Object.keys(obj.datos).forEach(function(k){
    var v = obj.datos[k];
    if(typeof v !== 'string') return;
    try{ localStorage.setItem(k, v); n++; }catch(e){}
  });
  return n;
}

function borrar(){
  var n = 0;
  todasLasClaves().forEach(function(k){ try{ localStorage.removeItem(k); n++; }catch(e){} });
  try{ sessionStorage.clear(); }catch(e){}
  return n;
}

window.EnferixData = { resumen: resumen, exportar: exportar, importar: importar, borrar: borrar };

/* ── API pública ────────────────────────────────────────────────────────── */
window.EnferixPrefs = {
  IDIOMAS: IDIOMAS,
  lang: lang,
  rate: rate,
  autoVoice: autoVoice,
  textScale: textScale,
  voicesForLang: voicesForLang,
  pickVoice: pickVoice,
  setLang: function(v){ save(K_LANG, v); save(K_VOICE, ''); },
  setVoice: function(uri){ save(K_VOICE, uri || ''); },
  setRate: function(n){ save(K_RATE, String(n)); },
  setAutoVoice: function(on){
    save(K_AUTO, on ? '1' : '0');
    // El interruptor del chat pinta su propio estado al pulsarse; se sincroniza
    // para que no quede desfasado respecto a Ajustes.
    try{
      var b = document.getElementById('voiceToggle');
      if(b) b.textContent = on ? '🔊' : '🔇';
    }catch(e){}
  },
  setTextScale: function(n){ save(K_SCALE, String(n)); applyTextScale(n); },
  onVoicesReady: function(cb){
    if(voices().length){ cb(); return; }
    try{ speechSynthesis.onvoiceschanged = function(){ cb(); }; }catch(e){}
  }
};
})();
