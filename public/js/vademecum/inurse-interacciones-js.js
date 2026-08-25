/* Enferix · Comprobador de interacciones
   ────────────────────────────────────────────────────────────────────────────
   Fundamento: la sección 4.5 de la ficha técnica ("Interacción con otros
   medicamentos y otras formas de interacción") de CIMA-AEMPS. Para cada pareja
   de fármacos se busca en la 4.5 de uno los principios activos del otro, en
   ambos sentidos, y se cita el párrafo oficial donde aparece.

   Lo que este módulo NO hace, deliberadamente:
   - No inventa interacciones ni las deduce: solo localiza y cita texto oficial.
   - No asigna gravedad (leve/moderada/grave). La ficha técnica no la codifica
     de forma uniforme, así que un semáforo sería información fabricada.
   - No afirma nunca que "no hay interacción". Si no encuentra nada dice que no
     halló mención directa en las fichas consultadas, que es cosa distinta:
     la ausencia de mención no prueba la ausencia de interacción.
*/
(function(){
'use strict';

/* ── Normalización y principios activos ─────────────────────────────────── */

function norm(s){
  return String(s||'')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g,'')  // fuera acentos
    .replace(/\s+/g,' ')
    .trim();
}

// La ficha técnica nombra la molécula ("enalapril"), mientras que CIMA devuelve
// el principio activo con su sal ("ENALAPRIL MALEATO"). Sin quitar la sal no
// habría coincidencia.
const SALES = new Set(['maleato','clorhidrato','hidrocloruro','sodico','sodica','calcico','calcica',
  'potasico','potasica','magnesico','sulfato','besilato','mesilato','tartrato','bitartrato',
  'succinato','fumarato','acetato','citrato','bromuro','cloruro','fosfato','nitrato','lactato',
  'gluconato','estearato','palmitato','valerato','propionato','dipropionato','furoato','tosilato',
  'oxalato','malato','embonato','pamoato','hemifumarato','trihidrato','dihidrato','monohidrato',
  'hemihidrato','anhidro','anhidra','hidratado','hidratada','micronizado','micronizada','de','del','y']);

/* De "ENALAPRIL MALEATO, HIDROCLOROTIAZIDA" saca ["enalapril","hidroclorotiazida"].
   Cada principio activo se conserva como frase completa: buscar "acido
   acetilsalicilico" entero evita que "acido" case con cualquier cosa. */
function principiosActivos(texto){
  return String(texto||'')
    .split(/[,;/+]| y (?=[a-zA-ZÁÉÍÓÚáéíóúÑñ])/)
    .map(parte => norm(parte)
      .replace(/\([^)]*\)/g,' ')                        // fuera paréntesis
      .split(' ')
      .filter(p => p && !SALES.has(p) && p.length > 3)   // fuera sales y ruido
      .join(' ')
      .trim())
    .filter(p => p.length >= 4)
    .filter((p,i,arr) => arr.indexOf(p) === i);
}

/* ── Localización de menciones ──────────────────────────────────────────── */

function escapeRe(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }

/* Busca el principio activo como palabra completa. Devuelve el párrafo que lo
   contiene, recortado, para poder citarlo tal cual. */
function buscarMencion(textoSeccion, principio){
  const texto = String(textoSeccion||'');
  if(!texto || !principio) return null;
  const re = new RegExp('(^|[^a-záéíóúñ0-9])(' + escapeRe(principio) + ')([^a-záéíóúñ0-9]|$)','i');
  const plano = norm(texto);
  const m = plano.match(re);
  if(!m) return null;

  // Se recorta sobre el texto original (con acentos y mayúsculas) usando la
  // posición hallada en el normalizado; ambos tienen la misma longitud porque
  // norm() solo sustituye caracteres uno a uno y colapsa espacios ya colapsados.
  const idx = plano.indexOf(m[2], m.index);
  const base = texto.length === plano.length ? texto : plano;
  let ini = base.lastIndexOf('.', idx);
  ini = ini === -1 ? Math.max(0, idx - 220) : ini + 1;
  let fin = base.indexOf('.', idx + principio.length);
  fin = fin === -1 ? Math.min(base.length, idx + 320) : fin + 1;
  let cita = base.slice(ini, fin).trim();
  if(cita.length > 460) cita = cita.slice(0, 460).trim() + '…';
  return { cita, termino: principio };
}

/* ── Acceso a CIMA ──────────────────────────────────────────────────────── */

const cacheFichas = new Map();   // nregistro → { seccion45, nombre }

async function buscarMedicamentos(q){
  const params = new URLSearchParams({ mode:'name', q, page:'1', commercial:'1', authorized:'1' });
  const r = await fetch('/api/cima/search?' + params);
  const data = await r.json();
  if(!r.ok) throw new Error(data && data.error || 'No se pudo consultar CIMA');
  return (data.items || []).slice(0, 12);
}

function textoDeSecciones(detalle, prefijo){
  const raw = detalle && detalle.sections;
  const lista = Array.isArray(raw) ? raw
    : Array.isArray(raw && raw.resultados) ? raw.resultados
    : Array.isArray(raw && raw.secciones) ? raw.secciones : [];
  const trozos = lista
    .filter(s => String(s.seccion||'') === prefijo || String(s.seccion||'').startsWith(prefijo + '.'))
    .map(s => {
      const caja = document.createElement('div');
      caja.innerHTML = String(s.contenido || '');
      return (caja.textContent || '').replace(/\s+/g,' ').trim();
    })
    .filter(Boolean);
  return trozos.join(' ');
}

async function seccion45(nregistro){
  if(cacheFichas.has(nregistro)) return cacheFichas.get(nregistro);
  const r = await fetch('/api/cima/medicine/' + encodeURIComponent(nregistro));
  const data = await r.json();
  if(!r.ok) throw new Error(data && data.error || 'No se pudo leer la ficha técnica');
  const ficha = { texto: textoDeSecciones(data, '4.5') };
  cacheFichas.set(nregistro, ficha);
  return ficha;
}

/* ── Comprobación por parejas ───────────────────────────────────────────── */

/* Para cada pareja se mira en los dos sentidos: es habitual que solo una de las
   dos fichas recoja la interacción. */
async function comprobar(farmacos){
  for(const f of farmacos){
    if(f.seccion45 == null){
      try{ f.seccion45 = (await seccion45(f.nregistro)).texto; f.error = null; }
      catch(e){ f.seccion45 = ''; f.error = e.message; }
    }
  }
  const parejas = [];
  for(let i=0; i<farmacos.length; i++){
    for(let j=i+1; j<farmacos.length; j++){
      const a = farmacos[i], b = farmacos[j];
      const hallazgos = [];
      for(const pa of b.principios){
        const m = buscarMencion(a.seccion45, pa);
        if(m) hallazgos.push({ enFichaDe:a, mencionaA:b, ...m });
      }
      for(const pb of a.principios){
        const m = buscarMencion(b.seccion45, pb);
        if(m) hallazgos.push({ enFichaDe:b, mencionaA:a, ...m });
      }
      parejas.push({
        a, b, hallazgos,
        sinFicha: (!a.seccion45 && !b.seccion45)
      });
    }
  }
  return parejas;
}

/* ── Interfaz ───────────────────────────────────────────────────────────── */

const seleccion = [];   // {nregistro, nombre, pactivos, principios, seccion45}
let overlay = null;

function esc(s){
  return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}
function $(sel){ return overlay ? overlay.querySelector(sel) : null; }

function construir(){
  if(overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'ixOverlay';
  overlay.className = 'ix-overlay';
  overlay.innerHTML =
    '<div class="ix-panel" role="dialog" aria-modal="true" aria-label="Comprobador de interacciones">'
    + '<div class="ix-head">'
    +   '<span class="ix-head-ico">⚠️</span>'
    +   '<span class="ix-head-copy"><b>Comprobador de interacciones</b>'
    +     '<small>Busca en la ficha técnica oficial de CIMA-AEMPS (sección 4.5)</small></span>'
    +   '<button class="ix-close" id="ixClose" aria-label="Cerrar">✕</button>'
    + '</div>'
    + '<div class="ix-body">'
    +   '<div class="ix-search">'
    +     '<span>🔎</span>'
    +     '<input id="ixQuery" type="search" autocomplete="off" placeholder="Añade un medicamento…">'
    +     '<button id="ixMic" class="ix-mic" title="Dictar" aria-label="Dictar">🎙️</button>'
    +   '</div>'
    +   '<div id="ixResults" class="ix-results"></div>'
    +   '<div id="ixChips" class="ix-chips"></div>'
    +   '<button id="ixRun" class="ix-run" disabled>Comprobar interacciones</button>'
    +   '<div id="ixOut" class="ix-out"></div>'
    +   '<p class="ix-legal">Herramienta de apoyo. Localiza y cita literalmente lo que dice la ficha '
    +     'técnica autorizada; no valora la gravedad ni sustituye el criterio del profesional ni la '
    +     'consulta con Farmacia.</p>'
    + '</div></div>';
  document.body.appendChild(overlay);
  enlazar();
  return overlay;
}

function enlazar(){
  $('#ixClose').addEventListener('click', cerrar);
  overlay.addEventListener('click', e => { if(e.target === overlay) cerrar(); });

  const q = $('#ixQuery');
  let t = null;
  q.addEventListener('input', () => {
    clearTimeout(t);
    const v = q.value.trim();
    if(v.length < 2){ $('#ixResults').innerHTML=''; return; }
    t = setTimeout(() => lanzarBusqueda(v), 320);
  });
  q.addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); clearTimeout(t); lanzarBusqueda(q.value.trim()); } });

  const mic = $('#ixMic');
  mic.addEventListener('click', e => {
    e.preventDefault();
    const V = window.EnferixVoiceManager;
    if(!V || !V.start){ q.focus(); return; }
    V.start(mic, txt => { q.value = txt; }, txt => { q.value = txt; lanzarBusqueda(txt.trim()); });
  });

  $('#ixResults').addEventListener('click', e => {
    const b = e.target.closest('[data-nreg]'); if(!b) return;
    añadir({ nregistro:b.dataset.nreg, nombre:b.dataset.nombre, pactivos:b.dataset.pa });
  });
  $('#ixChips').addEventListener('click', e => {
    const b = e.target.closest('[data-quitar]'); if(!b) return;
    const i = seleccion.findIndex(f => f.nregistro === b.dataset.quitar);
    if(i >= 0){ seleccion.splice(i,1); pintarChips(); $('#ixOut').innerHTML=''; }
  });
  $('#ixRun').addEventListener('click', ejecutar);
}

async function lanzarBusqueda(q){
  if(q.length < 2) return;
  const caja = $('#ixResults');
  caja.innerHTML = '<div class="ix-info">Buscando en CIMA…</div>';
  try{
    const items = await buscarMedicamentos(q);
    if(!items.length){ caja.innerHTML = '<div class="ix-info">Sin resultados para «'+esc(q)+'».</div>'; return; }
    caja.innerHTML = items.map(m =>
      '<button class="ix-hit" data-nreg="'+esc(m.nregistro)+'" data-nombre="'+esc(m.nombre)+'" data-pa="'+esc(m.pactivos||'')+'">'
      + '<b>'+esc(m.nombre)+'</b>'
      + '<small>'+esc(m.pactivos || 'Principio activo no indicado')+'</small></button>'
    ).join('');
  }catch(e){
    caja.innerHTML = '<div class="ix-error">No se pudo consultar CIMA: '+esc(e.message)+'</div>';
  }
}

function añadir(m){
  if(seleccion.some(f => f.nregistro === m.nregistro)) return;
  const principios = principiosActivos(m.pactivos);
  seleccion.push({ ...m, principios, seccion45:null, error:null });
  $('#ixQuery').value = '';
  $('#ixResults').innerHTML = '';
  $('#ixOut').innerHTML = '';
  pintarChips();
}

function pintarChips(){
  const caja = $('#ixChips');
  caja.innerHTML = seleccion.map(f =>
    '<span class="ix-chip"><b>'+esc(f.nombre)+'</b>'
    + '<small>'+esc(f.principios.join(', ') || '—')+'</small>'
    + '<button data-quitar="'+esc(f.nregistro)+'" aria-label="Quitar">✕</button></span>'
  ).join('');
  const run = $('#ixRun');
  run.disabled = seleccion.length < 2;
  run.textContent = seleccion.length < 2
    ? 'Añade al menos dos medicamentos'
    : 'Comprobar ' + seleccion.length + ' medicamentos';
}

async function ejecutar(){
  const out = $('#ixOut');
  const run = $('#ixRun');
  run.disabled = true;
  out.innerHTML = '<div class="ix-info">Leyendo las fichas técnicas…</div>';
  try{
    const parejas = await comprobar(seleccion);
    out.innerHTML = pintarResultado(parejas);
  }catch(e){
    out.innerHTML = '<div class="ix-error">No se pudo completar la comprobación: '+esc(e.message)+'</div>';
  }
  run.disabled = seleccion.length < 2;
}

function pintarResultado(parejas){
  const conHallazgo = parejas.filter(p => p.hallazgos.length);
  const sinHallazgo = parejas.filter(p => !p.hallazgos.length);
  const fallos = seleccion.filter(f => f.error);

  let html = '';

  if(fallos.length){
    html += '<div class="ix-error">No se pudo leer la ficha técnica de: '
      + fallos.map(f => esc(f.nombre)).join(', ')
      + '. Esas parejas no se han podido comprobar.</div>';
  }

  html += '<div class="ix-resumen">'
    + '<b>' + conHallazgo.length + '</b> de <b>' + parejas.length + '</b> parejas con mención directa en la ficha técnica'
    + '</div>';

  conHallazgo.forEach(p => {
    html += '<article class="ix-par hit">'
      + '<header><span class="ix-par-ico">⚠️</span><b>'+esc(p.a.nombre)+'</b> <em>+</em> <b>'+esc(p.b.nombre)+'</b></header>'
      + p.hallazgos.map(h =>
          '<div class="ix-cita">'
          + '<div class="ix-cita-src">Ficha técnica de <b>'+esc(h.enFichaDe.nombre)+'</b>, sección 4.5 · menciona <b>'+esc(h.termino)+'</b></div>'
          + '<blockquote>'+esc(h.cita)+'</blockquote>'
          + '</div>'
        ).join('')
      + '</article>';
  });

  sinHallazgo.forEach(p => {
    html += '<article class="ix-par miss">'
      + '<header><span class="ix-par-ico">·</span><b>'+esc(p.a.nombre)+'</b> <em>+</em> <b>'+esc(p.b.nombre)+'</b></header>'
      + '<p>'+(p.sinFicha
          ? 'No se ha podido leer la sección 4.5 de ninguno de los dos.'
          : 'Sin mención directa en la sección 4.5 de ninguna de las dos fichas.')
      + '</p></article>';
  });

  // Este aviso es el que impide leer "sin mención" como un alta verde.
  html += '<div class="ix-aviso"><b>Que no aparezca no significa que no exista.</b> '
    + 'Esta comprobación solo busca si una ficha técnica nombra al principio activo de la otra. '
    + 'No detecta interacciones descritas por grupo terapéutico (AINE, IECA, anticoagulantes…), '
    + 'ni las que no estén recogidas en la ficha. Ante la duda, consulta con Farmacia.</div>';

  return html;
}

function abrir(){
  construir();
  overlay.classList.add('on');
  document.body.style.overflow = 'hidden';
  pintarChips();
  setTimeout(() => { const q = $('#ixQuery'); if(q) q.focus(); }, 80);
}
function cerrar(){
  if(!overlay) return;
  overlay.classList.remove('on');
  document.body.style.overflow = '';
}

window.EnferixInteracciones = { open:abrir, close:cerrar };
// Expuesto para poder probar la lógica de coincidencia sin depender de la red.
window.EnferixInteraccionesTest = { principiosActivos, buscarMencion, norm };
})();
