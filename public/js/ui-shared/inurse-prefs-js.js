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
