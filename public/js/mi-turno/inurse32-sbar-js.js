
(function(){
'use strict';
var ov = document.getElementById('in32SbarOverlay');
var inp = document.getElementById('in32Input');
var btn = document.getElementById('in32Generate');
var voiceBtn = document.getElementById('in32Voice');
var closeBtn = document.getElementById('in32Close');
var resultDiv = document.getElementById('in32Result');
var contentDiv = document.getElementById('in32SbarContent');
var loadingDiv = document.getElementById('in32Loading');
var copyBtn = document.getElementById('in32Copy');
var shareBtn = document.getElementById('in32Share');
var newBtn = document.getElementById('in32NewSbar');
var lastSbar = '';

function open() { ov.classList.add('on'); inp.focus(); }
function close() { ov.classList.remove('on'); resultDiv.style.display='none'; }

async function generateSbar() {
  var state = (inp.value || '').trim();
  if (state.length < 10) { alert('Describe el estado del paciente'); return; }

  loadingDiv.style.display='block';
  resultDiv.style.display='block';
  contentDiv.innerHTML='';
  btn.disabled=true;

  try {
    var res = await fetch('/api/sbar/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientState: state, apiKey: window.GEMINI_API_KEY||'' })
    });
    var data = await res.json();
    if (!res.ok) throw new Error(data.error||'Error generando SBAR');

    loadingDiv.style.display='none';
    lastSbar = data.sbar||'';
    var html = '<h3>Situación</h3><p>' + (data.sbar||'').split('## ').slice(1).map(function(s) {
      return s.split('\n').slice(0,1)[0];
    }).join('</p><h3>') + '</p>';
    contentDiv.innerHTML = html;
  } catch (err) {
    loadingDiv.style.display='none';
    contentDiv.innerHTML = '<p style="color:#f87171">❌ Error: ' + err.message + '</p>';
  } finally {
    btn.disabled=false;
  }
}

voiceBtn.onclick = function() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    alert('Tu navegador no soporta reconocimiento de voz');
    return;
  }
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var rec = new SR();
  rec.lang = 'es-ES';
  rec.onstart = function() { voiceBtn.textContent='🎤 Escuchando...'; voiceBtn.disabled=true; };
  rec.onresult = function(e) {
    var transcript = '';
    for (var i=e.resultIndex; i<e.results.length; i++) {
      transcript += e.results[i][0].transcript + ' ';
    }
    inp.value = (inp.value + ' ' + transcript).trim();
    voiceBtn.textContent='🎤 Dictar';
    voiceBtn.disabled=false;
  };
  rec.onerror = function(e) { alert('Error: ' + e.error); voiceBtn.textContent='🎤 Dictar'; voiceBtn.disabled=false; };
  rec.start();
};

copyBtn.onclick = function() {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(lastSbar).then(function() {
      alert('✅ Copiado al portapapeles');
    }).catch(function() { fallbackCopy(); });
  } else {
    fallbackCopy();
  }
};

function fallbackCopy() {
  var ta = document.createElement('textarea');
  ta.value = lastSbar;
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); alert('✅ Copiado'); } catch(e) { alert('Error al copiar'); }
  ta.remove();
}

shareBtn.onclick = function() {
  if (navigator.share) {
    navigator.share({ title: 'Parte de turno', text: lastSbar });
  } else {
    alert('Comparte: ' + lastSbar.slice(0,100) + '...');
  }
};

newBtn.onclick = function() { inp.value=''; resultDiv.style.display='none'; inp.focus(); };

btn.onclick = generateSbar;
closeBtn.onclick = close;

window.openSbar = open;
window.closeSbar = close;

// "Parte de turno" retirado de la home: eliminar cualquier tarjeta existente.
function addSbarCard() {
  ['in32NxCard','in32HomeCard'].forEach(function(id){ var el=document.getElementById(id); if(el&&el.parentNode) el.parentNode.removeChild(el); });
  return false;
}
// Añadir el card repetidamente para compensar los reloads
setInterval(addSbarCard, 500);
})();
