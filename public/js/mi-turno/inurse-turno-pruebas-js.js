/* Enferix · Pruebas del paciente en Mi turno
   ────────────────────────────────────────────────────────────────────────────
   Añade a cada habitación de Mi turno el acceso a las tres consultas
   (radiografía, electro y analítica) y guarda su lectura junto al paciente,
   para tenerlo todo a mano al dar el parte.

   Radiografía y electro ya existían como herramientas sueltas; aquí solo se
   enganchan a la habitación. La analítica no existía y se construye siguiendo
   el mismo patrón: foto + lectura con Gemini Vision.

   Qué se guarda y qué no:
   - Se guarda la LECTURA EN TEXTO, con su fecha y el tipo de prueba.
   - NO se guarda la imagen. Una placa o una analítica ocupan varios MB y el
     almacenamiento del navegador ronda los 5-10 MB en total: guardar
     imágenes lo agotaría con un par de pacientes.

   Los datos viven solo en este dispositivo. Ajustes → "Datos de este
   dispositivo" permite exportarlos o borrarlos.
*/
(function(){
'use strict';

var STORE_ROOMS='inurse_turno_rooms_v1';
var TIPOS={
  rx:  { em:'🩻', t:'Radiografía', overlay:'rxOverlay',  result:'rxResult'  },
  ecg: { em:'📈', t:'Electro',     overlay:'ecgOverlay', result:'ecgResult' },
  lab: { em:'🧪', t:'Analítica',   overlay:'labOverlay', result:'labResult' }
};

var destino=null;   // habitación que espera recibir la lectura

function loadRooms(){ try{ return JSON.parse(localStorage.getItem(STORE_ROOMS))||[]; }catch(e){ return []; } }
function saveRooms(v){ try{ localStorage.setItem(STORE_ROOMS, JSON.stringify(v)); }catch(e){} }
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
function pad(n){ return String(n).padStart(2,'0'); }
function fecha(ts){ var d=new Date(ts); return pad(d.getDate())+'/'+pad(d.getMonth()+1)+' '+pad(d.getHours())+':'+pad(d.getMinutes()); }
function toast(m){ try{ if(typeof window.toast==='function'){ window.toast(m); return; } }catch(e){} }

/* ── Guardar una lectura en la habitación ───────────────────────────────── */

function guardar(roomId, tipo, texto){
  var rooms=loadRooms();
  var r=rooms.find(function(x){ return String(x.id)===String(roomId); });
  if(!r) return false;
  if(!Array.isArray(r.pruebas)) r.pruebas=[];
  r.pruebas.unshift({
    id:'p'+Date.now()+Math.random().toString(36).slice(2,6),
    tipo:tipo,
    ts:Date.now(),
    texto:String(texto||'').slice(0,4000)   // la imagen no se guarda, solo la lectura
  });
  r.pruebas=r.pruebas.slice(0,12);
  saveRooms(rooms);
  return true;
}

function borrarPrueba(roomId, pruebaId){
  var rooms=loadRooms();
  var r=rooms.find(function(x){ return String(x.id)===String(roomId); });
  if(!r||!Array.isArray(r.pruebas)) return;
  r.pruebas=r.pruebas.filter(function(p){ return p.id!==pruebaId; });
  saveRooms(rooms);
}

/* ── Pintar los accesos y las lecturas dentro de cada habitación ────────── */

function pintarEnHabitaciones(){
  var rooms=loadRooms();
  document.querySelectorAll('.turno-room-item[data-room]').forEach(function(item){
    if(item.querySelector('.tp-bar')) { refrescarLista(item, rooms); return; }
    var id=item.dataset.room;
    var bar=document.createElement('div');
    bar.className='tp-bar';
    bar.innerHTML=Object.keys(TIPOS).map(function(k){
      return '<button type="button" data-tp="'+k+'" data-tp-room="'+esc(id)+'">'
        + TIPOS[k].em+' '+TIPOS[k].t+'</button>';
    }).join('');
    item.appendChild(bar);
    var lista=document.createElement('div');
    lista.className='tp-list';
    item.appendChild(lista);
    refrescarLista(item, rooms);
  });
}

function refrescarLista(item, rooms){
  var lista=item.querySelector('.tp-list'); if(!lista) return;
  var r=(rooms||loadRooms()).find(function(x){ return String(x.id)===String(item.dataset.room); });
  var pruebas=(r&&r.pruebas)||[];
  lista.innerHTML=pruebas.map(function(p){
    var tp=TIPOS[p.tipo]||{em:'📄',t:'Prueba'};
    return '<details class="tp-item">'
      + '<summary><span class="tp-em">'+tp.em+'</span><b>'+esc(tp.t)+'</b>'
      +   '<span class="tp-fecha">'+fecha(p.ts)+'</span>'
      +   '<button class="tp-del" data-tp-del="'+esc(p.id)+'" data-tp-room="'+esc(item.dataset.room)+'" title="Eliminar">🗑</button></summary>'
      + '<div class="tp-texto">'+esc(p.texto)+'</div>'
      + '</details>';
  }).join('');
}

/* ── Enganche con las herramientas ──────────────────────────────────────── */

function abrirPrueba(tipo, roomId){
  destino={ tipo:tipo, roomId:roomId };
  if(tipo==='rx'){ var rf=document.getElementById('rxFab'); if(rf) rf.click(); }
  else if(tipo==='ecg'){ var ef=document.getElementById('ecgFab'); if(ef) ef.click(); }
  else if(tipo==='lab'){ abrirLab(); }
  elevar(tipo);
}

/* El panel de Mi turno va a z-index 9700 y estos modales a 100, así que
   abiertos desde una habitación quedarían detrás y no se podrían usar. Se
   elevan mientras dure la consulta y se devuelven a su sitio al cerrarla,
   para no alterar su apilamiento en el uso normal. */
function elevar(tipo){
  var ov=document.getElementById(TIPOS[tipo].overlay);
  if(!ov) return;
  ov.classList.add('tp-encima');
  if(ov.__tpCierre) return;
  ov.__tpCierre=true;
  ov.addEventListener('click',function(e){
    if(e.target===ov || e.target.closest('.modal-close')){
      ov.classList.remove('tp-encima');
      destino=null;
    }
  });
}

/* Cuando una herramienta termina su lectura, se ofrece guardarla en la
   habitación desde la que se abrió. Se vigila el contenedor del resultado
   porque cada herramienta lo rellena a su manera. */
function vigilarResultados(){
  Object.keys(TIPOS).forEach(function(k){
    var caja=document.getElementById(TIPOS[k].result);
    if(!caja || caja.__tpVigilado) return;
    caja.__tpVigilado=true;
    new MutationObserver(function(){
      if(!destino || destino.tipo!==k) return;
      if(caja.querySelector('.tp-guardar')) return;
      var texto=(caja.textContent||'').trim();
      // Mientras está pensando aún no hay lectura que guardar.
      if(texto.length<80 || caja.querySelector('.thinking')) return;
      var rooms=loadRooms();
      var r=rooms.find(function(x){ return String(x.id)===String(destino.roomId); });
      if(!r) return;
      var b=document.createElement('button');
      b.className='tp-guardar';
      b.textContent='💾 Guardar en '+r.room;
      b.onclick=function(){
        if(guardar(destino.roomId, k, texto)){
          b.textContent='✓ Guardado en '+r.room;
          b.disabled=true;
          pintarEnHabitaciones();
          toast('Lectura guardada en '+r.room);
        }
      };
      caja.appendChild(b);
    }).observe(caja,{childList:true,subtree:true});
  });
}

/* ── Analítica: herramienta nueva, mismo patrón que Rx y ECG ────────────── */

var labImagen=null;

function apiKey(){
  try{
    return localStorage.getItem('guiaHJ23_apikey')
        || localStorage.getItem('inurse_gemini_api_key_v1')
        || localStorage.getItem('in51_gemini_key') || '';
  }catch(e){ return ''; }
}
function modelo(){
  try{ return localStorage.getItem('inurse_gemini_model_v1')||'gemini-3.5-flash'; }
  catch(e){ return 'gemini-3.5-flash'; }
}

function construirLab(){
  if(document.getElementById('labOverlay')) return;
  var ov=document.createElement('div');
  ov.className='overlay'; ov.id='labOverlay';
  ov.innerHTML=
    '<div class="modal" role="dialog" aria-modal="true" aria-label="Lectura de analítica">'
    + '<div class="modal-head">'
    +   '<div class="mh-ico" style="background:linear-gradient(135deg,#14B8A6,#0EA5E9)">🧪</div>'
    +   '<h2>Analítica <small>Lectura orientativa con Gemini Vision</small></h2>'
    +   '<button class="modal-close" id="labClose" aria-label="Cerrar">✕</button>'
    + '</div>'
    + '<div class="modal-body">'
    +   '<input type="file" id="labFile" accept="image/*" capture="environment" style="display:none">'
    +   '<div class="ecg-drop rx-camera" id="labDrop">'
    +     '<span class="di">📷</span>'
    +     '<span class="rx-camera-txt">Toca para fotografiar el informe de laboratorio<small>hemograma, bioquímica, coagulación, gasometría…</small></span>'
    +   '</div>'
    +   '<div class="ecg-step-label">Contexto del paciente (opcional)</div>'
    +   '<div class="qwrap" style="margin-bottom:12px">'
    +     '<textarea class="qinput" id="labGuess" placeholder="Ej: mujer 78 años, sepsis urinaria, en tratamiento con enoxaparina…" rows="1"></textarea>'
    +     '<button class="qmic" id="labMic">🎙️</button>'
    +   '</div>'
    +   '<button class="qsend" id="labSend" style="background:linear-gradient(135deg,#14B8A6,#0EA5E9)">Analizar analítica</button>'
    +   '<div id="labResult"></div>'
    +   '<div style="margin-top:12px;font-size:11px;line-height:1.5;color:var(--text-dim,#94a3b8)">'
    +     'Lectura orientativa a partir de una fotografía. Puede leer mal un valor: '
    +     'comprueba siempre contra el informe original antes de tomar cualquier decisión. '
    +     'No sustituye la valoración del profesional responsable.</div>'
    + '</div></div>';
  document.body.appendChild(ov);

  document.getElementById('labClose').onclick=cerrarLab;
  ov.addEventListener('click',function(e){ if(e.target===ov) cerrarLab(); });
  var file=document.getElementById('labFile');
  document.getElementById('labDrop').onclick=function(){ file.click(); };
  file.onchange=function(){
    var f=file.files&&file.files[0]; if(!f) return;
    var fr=new FileReader();
    fr.onload=function(){
      labImagen={ data:String(fr.result).split(',')[1], mime:f.type||'image/jpeg' };
      document.getElementById('labDrop').innerHTML=
        '<img src="'+fr.result+'" alt="" style="max-width:100%;border-radius:12px;display:block">';
    };
    fr.readAsDataURL(f);
  };
  document.getElementById('labSend').onclick=analizarLab;
  vigilarResultados();
}

function abrirLab(){ construirLab(); document.getElementById('labOverlay').classList.add('show','on'); }
function cerrarLab(){ var o=document.getElementById('labOverlay'); if(o) o.classList.remove('show','on'); }

async function analizarLab(){
  var out=document.getElementById('labResult');
  if(!labImagen){ toast('Primero haz la foto del informe'); return; }
  var key=apiKey();
  if(!key){ out.innerHTML='<div class="ix-error">Introduce tu clave de Gemini en Ajustes para usar esta lectura.</div>'; return; }
  var ctx=(document.getElementById('labGuess').value||'').trim();
  var btn=document.getElementById('labSend'); btn.disabled=true;
  out.innerHTML='<div class="thinking">Leyendo la analítica <span class="dots"><span></span><span></span><span></span></span></div>';

  var sys='Eres Javny, asistente clínica para profesionales sanitarios. Vas a leer la fotografía de un informe de laboratorio.\n\n'
    + 'REGLAS INNEGOCIABLES:\n'
    + '- Transcribe SOLO los valores que se lean con claridad en la imagen. Si un valor está borroso, cortado o dudoso, dilo expresamente y no lo inventes.\n'
    + '- No inventes parámetros que no aparezcan, ni rangos de referencia que no figuren en el informe. Si el informe trae sus propios rangos, úsalos; si no, indica que usas rangos habituales de adulto y que pueden variar entre laboratorios.\n'
    + '- No emites diagnóstico ni indicas tratamiento. Señalas hallazgos y su posible relevancia, para que decida el profesional.\n\n'
    + 'RESPUESTA POR APARTADOS:\n'
    + '1. Tipo de estudio y calidad de la imagen: qué informe es y si algo no se lee bien.\n'
    + '2. Valores alterados: cada uno con su cifra, su rango y si está alto o bajo. Ordena por relevancia clínica.\n'
    + '3. Valores dentro de rango que conviene destacar, si los hay.\n'
    + '4. Lectura conjunta: qué sugiere el patrón en su conjunto, en términos prudentes.\n'
    + '5. Qué vigilar: signos, controles o repeticiones razonables.\n'
    + '6. Limitaciones de esta lectura.\n'
    + (ctx ? '\nContexto aportado por el profesional: '+ctx : '');

  try{
    var r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(modelo())+':generateContent?key='+encodeURIComponent(key),{
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ contents:[{ parts:[
        { text:sys },
        { inline_data:{ mime_type:labImagen.mime, data:labImagen.data } }
      ]}]})
    });
    var data=await r.json();
    if(!r.ok) throw new Error((data&&data.error&&data.error.message)||('HTTP '+r.status));
    var texto=((data.candidates&&data.candidates[0]&&data.candidates[0].content&&data.candidates[0].content.parts)||[])
      .map(function(p){ return p.text||''; }).join('\n').trim();
    if(!texto) throw new Error('Respuesta vacía');
    out.innerHTML='<div style="font-weight:700;margin:18px 0 8px;color:#14B8A6;font-size:13px">LECTURA ORIENTATIVA</div>'
      + '<div class="ans">'+esc(texto).replace(/\n/g,'<br>')+'</div>';
  }catch(e){
    out.innerHTML='<div class="ix-error">No se pudo analizar: '+esc(e.message)+'</div>';
  }
  btn.disabled=false;
}

/* ── Arranque ───────────────────────────────────────────────────────────── */

document.addEventListener('click',function(e){
  var b=e.target.closest('[data-tp]');
  if(b){ e.preventDefault(); abrirPrueba(b.dataset.tp, b.dataset.tpRoom); return; }
  var d=e.target.closest('[data-tp-del]');
  if(d){ e.preventDefault(); e.stopPropagation(); borrarPrueba(d.dataset.tpRoom, d.dataset.tpDel); pintarEnHabitaciones(); return; }
  // Las habitaciones se repintan al abrir Mi turno o al añadir una.
  setTimeout(pintarEnHabitaciones,120);
},true);

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',vigilarResultados);
else vigilarResultados();
setTimeout(vigilarResultados,1200);

window.EnferixPruebas={ abrir:abrirPrueba, abrirAnalitica:abrirLab, pintar:pintarEnHabitaciones };
})();
