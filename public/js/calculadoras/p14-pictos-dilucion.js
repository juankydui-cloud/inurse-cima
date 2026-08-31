/* P1.4 · Pictogramas de dilución (patrón Stabilis)
   Componente aislado: NO toca el JS del monolito. Observa el panel
   `#perfResult` de Perfusiones y, cuando aparece `.perf-info-notas`,
   analiza el texto libre para detectar propiedades clínicas comunes
   (vía central, luz, refrigerar, extravasación, incompatibilidades,
   antídoto, monitorización) y renderiza pictogramas SVG monolínea
   propios encima del texto original.

   NUNCA inventa datos: solo dibuja un pictograma si el texto de la ficha
   contiene la palabra clave. El texto original se conserva intacto.
*/
(function(){
  'use strict';

  /* Cada regla: { key, label, hint, test(txt), svg(size?) } */
  var RULES = [
    { key:'via-central', label:'Vía central', hint:'Requiere vía central',
      test: t => /v[ií]a central/i.test(t) || /obligatoria.*central/i.test(t),
      svg: viaCentralSVG },
    { key:'proteger-luz', label:'Proteger de la luz', hint:'Requiere protección lumínica',
      test: t => /(proteger|protecci[oó]n).*luz/i.test(t) || /fotosensible/i.test(t),
      svg: protegerLuzSVG },
    { key:'refrigerar', label:'Refrigerar', hint:'Conservar en frío 2-8 °C',
      test: t => /refriger|conservar en frío|2\s*[–-]\s*8\s*°?C/i.test(t),
      svg: refrigerarSVG },
    { key:'extravasacion', label:'Vigilar extravasación', hint:'Riesgo de necrosis por extravasación',
      test: t => /extravasaci[oó]n/i.test(t) || /necrosis.*extravas/i.test(t),
      svg: extravasacionSVG },
    { key:'no-mezclar', label:'No mezclar en Y', hint:'Incompatibilidades registradas',
      test: t => /no mezclar/i.test(t) || /incompatible/i.test(t),
      svg: noMezclarSVG },
    { key:'antidoto', label:'Antídoto disponible', hint:'Ver antídoto en la ficha',
      test: t => /ant[ií]doto\s*:?/i.test(t),
      svg: antidotoSVG },
    { key:'monitor', label:'Monitorización estricta', hint:'Requiere monitorización cercana',
      test: t => /monitoriza(r|ci[oó]n)/i.test(t) || /vigilar/i.test(t) && /(sedaci[oó]n|arritmi|hipotensi[oó]n|glucemi|ta|fc|pa)/i.test(t),
      svg: monitorSVG },
    { key:'bolo-lento', label:'Bolo IV lento', hint:'Administrar en bolo lento cuando aplique',
      test: t => /bolo.*lent[oa]/i.test(t) || /iv lento/i.test(t),
      svg: boloLentoSVG }
  ];

  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  }); }

  /* ── Librería de pictogramas SVG monolínea ─────────────────────
     Todos comparten viewBox 0 0 24 24, stroke=currentColor, no fill. */
  function svgWrap(inner){
    return '<svg class="p14-pico" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
      + 'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
      + inner + '</svg>';
  }
  function viaCentralSVG(){
    /* Torso con vena yugular estilizada y catéter */
    return svgWrap(
      '<path d="M12 2c1.6 0 3 1.2 3 3v3l3 2v3l-3 2v6H9v-6l-3-2V10l3-2V5c0-1.8 1.4-3 3-3z"/>'
      +'<line x1="15" y1="8" x2="20" y2="6"/><circle cx="20.5" cy="5.5" r="1.2"/>'
    );
  }
  function protegerLuzSVG(){
    /* Sol + tachadura */
    return svgWrap(
      '<circle cx="12" cy="12" r="3.6"/>'
      +'<line x1="12" y1="4" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="20"/>'
      +'<line x1="4"  y1="12" x2="6"  y2="12"/><line x1="18" y1="12" x2="20" y2="12"/>'
      +'<line x1="6.3" y1="6.3" x2="7.7" y2="7.7"/><line x1="16.3" y1="16.3" x2="17.7" y2="17.7"/>'
      +'<line x1="6.3" y1="17.7" x2="7.7" y2="16.3"/><line x1="16.3" y1="7.7" x2="17.7" y2="6.3"/>'
      +'<line x1="4"  y1="20" x2="20" y2="4" stroke-width="2"/>'
    );
  }
  function refrigerarSVG(){
    /* Copo de nieve */
    return svgWrap(
      '<line x1="12" y1="3" x2="12" y2="21"/>'
      +'<line x1="3" y1="12" x2="21" y2="12"/>'
      +'<line x1="5.5" y1="5.5" x2="18.5" y2="18.5"/>'
      +'<line x1="5.5" y1="18.5" x2="18.5" y2="5.5"/>'
      +'<path d="M9 5l3 2 3-2"/><path d="M9 19l3-2 3 2"/>'
      +'<path d="M5 9l2 3-2 3"/><path d="M19 9l-2 3 2 3"/>'
    );
  }
  function extravasacionSVG(){
    /* Triángulo de aviso con gota */
    return svgWrap(
      '<path d="M12 3l10 17H2z"/>'
      +'<path d="M12 10c1.5 2 3 3.6 3 5.4a3 3 0 0 1-6 0C9 13.6 10.5 12 12 10z"/>'
    );
  }
  function noMezclarSVG(){
    /* Dos jeringas cruzadas con tachadura */
    return svgWrap(
      '<path d="M4 8l6 6"/><path d="M3 9l2-2 4 4-2 2z"/><path d="M8 14l2-2"/>'
      +'<path d="M20 8l-6 6"/><path d="M21 9l-2-2-4 4 2 2z"/><path d="M16 14l-2-2"/>'
      +'<line x1="4" y1="20" x2="20" y2="4" stroke-width="2"/>'
    );
  }
  function antidotoSVG(){
    /* Escudo con cruz */
    return svgWrap(
      '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>'
      +'<line x1="12" y1="9" x2="12" y2="15"/><line x1="9" y1="12" x2="15" y2="12"/>'
    );
  }
  function monitorSVG(){
    /* Pantalla con onda ECG */
    return svgWrap(
      '<rect x="3" y="5" width="18" height="12" rx="2"/>'
      +'<path d="M6 12h3l1-3 2 6 2-4 1 1h3"/>'
      +'<line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="17" x2="12" y2="20"/>'
    );
  }
  function boloLentoSVG(){
    /* Reloj + gota */
    return svgWrap(
      '<circle cx="9" cy="12" r="6"/>'
      +'<path d="M9 8v4l2 2"/>'
      +'<path d="M18 15c1.5 1.5 1.5 3.5 0 5-1.5-1.5-1.5-3.5 0-5z"/>'
    );
  }

  function detectFromText(text){
    if(!text) return [];
    return RULES.filter(function(r){ return r.test(text); });
  }

  function ensurePictos(host){
    if(!host) return;
    var notas = host.querySelector('.perf-info-notas');
    if(!notas) return;
    if(host.querySelector(':scope > .p14-pictos')) return;   // ya inyectado
    var text = notas.textContent || '';
    var hits = detectFromText(text);
    if(!hits.length) return;
    var html = '<div class="p14-pictos" role="list">'
      + hits.map(function(r){
          return '<span class="p14-picto-item" role="listitem" title="'+esc(r.hint)+'">'
            +   r.svg()
            +   '<span class="p14-picto-label">'+esc(r.label)+'</span>'
            + '</span>';
        }).join('')
      + '</div>';
    /* Colocar antes del texto de notas para que ganen jerarquía visual. */
    notas.insertAdjacentHTML('beforebegin', html);
  }

  function scan(){
    document.querySelectorAll('.perf-info').forEach(ensurePictos);
  }

  function boot(){
    scan();
    var mo = new MutationObserver(function(muts){
      var touched = false;
      muts.forEach(function(m){
        if(m.type === 'childList'){
          m.addedNodes.forEach(function(n){
            if(n.nodeType !== 1) return;
            if(n.classList && n.classList.contains('perf-info')){ ensurePictos(n); touched = true; }
            n.querySelectorAll && n.querySelectorAll('.perf-info').forEach(function(el){ ensurePictos(el); touched = true; });
          });
        }
      });
      if(touched) scan();
    });
    try{
      mo.observe(document.body, { childList:true, subtree:true });
    }catch(e){}
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* Exponer para depuración y para el modo simplificado de Cálculo (P1-A). */
  window.EnferixPictos = {
    scan: scan,
    detect: detectFromText,
    library: RULES.map(function(r){ return { key:r.key, label:r.label, hint:r.hint, svg:r.svg() }; })
  };
})();
