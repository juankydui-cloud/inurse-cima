/* P2-A · Librería de iconos SVG monolínea del sistema Enferix
   Sustituye los emojis que se usaban como iconos por SVG stroke=1.5,
   viewBox 24×24, currentColor. El color y tamaño se controlan por CSS.
   API global:
     window.EnferixIcons.get(name)          → string SVG
     window.EnferixIcons.replaceEmoji(node) → si el nodo contiene solo
                                              un emoji reconocido, lo
                                              sustituye por el SVG.
*/
(function(){
  'use strict';

  function wrap(inner, opts){
    var extra = (opts && opts.extraClass) ? ' '+opts.extraClass : '';
    return '<svg class="enfx-ic'+extra+'" viewBox="0 0 24 24" fill="none" '
      + 'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" '
      + 'stroke-linejoin="round" aria-hidden="true" focusable="false">'
      + inner + '</svg>';
  }

  var ICONS = {
    /* ───── NAV bar ───── */
    'nav-inicio':  '<path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2z"/>',
    'nav-turno':   '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    'nav-calc':    '<rect x="5" y="3" width="14" height="18" rx="2"/>'
                 + '<line x1="8" y1="7" x2="16" y2="7"/>'
                 + '<circle cx="8.5" cy="12" r=".5" fill="currentColor"/>'
                 + '<circle cx="12"  cy="12" r=".5" fill="currentColor"/>'
                 + '<circle cx="15.5" cy="12" r=".5" fill="currentColor"/>'
                 + '<circle cx="8.5" cy="16" r=".5" fill="currentColor"/>'
                 + '<circle cx="12"  cy="16" r=".5" fill="currentColor"/>'
                 + '<circle cx="15.5" cy="16" r=".5" fill="currentColor"/>',
    'nav-escalas': '<path d="M3 3l6 6-6 6"/>'
                 + '<line x1="9" y1="21" x2="21" y2="21"/>'
                 + '<line x1="3" y1="21" x2="6" y2="21"/>'
                 + '<line x1="21" y1="14" x2="21" y2="8"/>'
                 + '<line x1="14" y1="14" x2="14" y2="18"/>'
                 + '<line x1="17" y1="14" x2="17" y2="16"/>',
    'nav-ecg':     '<path d="M3 12h4l2-7 4 14 2-7h6"/>',
    'nav-rx':      '<rect x="3" y="4" width="18" height="16" rx="2"/>'
                 + '<circle cx="12" cy="12" r="4"/>'
                 + '<circle cx="12" cy="12" r="1.4" fill="currentColor"/>',
    'nav-fuentes': '<path d="M4 21h16"/>'
                 + '<path d="M5 21V11l7-6 7 6v10"/>'
                 + '<line x1="9" y1="21" x2="9" y2="12"/>'
                 + '<line x1="12" y1="21" x2="12" y2="12"/>'
                 + '<line x1="15" y1="21" x2="15" y2="12"/>'
                 + '<line x1="6" y1="11" x2="18" y2="11"/>',
    'nav-ajustes': '<circle cx="12" cy="12" r="3"/>'
                 + '<path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 0 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06A2 2 0 1 1 4.14 16.9l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 0 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06A2 2 0 1 1 7.1 4.14l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1.04-1.56V3a2 2 0 0 1 4 0v.09a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.56 1.04H21a2 2 0 0 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.11z"/>',

    /* ───── 12 especialidades de escalas ───── */
    'spec-anestesia':   '<path d="M4 20l7-7"/><path d="M14 4l6 6-3 3-6-6z"/><path d="M11 7l6 6"/><path d="M4 20h3"/>',
    'spec-cardio':      '<path d="M12 20s-7-4.5-9-9.5A5 5 0 0 1 12 6a5 5 0 0 1 9 4.5C19 15.5 12 20 12 20z"/>',
    'spec-uci':         '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 12h6M12 9v6"/><path d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/>',
    'spec-farmacia':    '<rect x="4" y="9" width="16" height="6" rx="3"/><line x1="12" y1="9" x2="12" y2="15"/>',
    'spec-pediatria':   '<circle cx="12" cy="8" r="4"/><path d="M6 21c0-3 3-5 6-5s6 2 6 5"/><circle cx="10" cy="8" r=".5" fill="currentColor"/><circle cx="14" cy="8" r=".5" fill="currentColor"/>',
    'spec-neonatal':    '<circle cx="12" cy="8" r="3.5"/><path d="M12 4c1-1 2.5-1 3 0M12 4c-1-1-2.5-1-3 0"/><path d="M7 21c0-3 2.5-5 5-5s5 2 5 5"/>',
    'spec-neuro':       '<path d="M9 3a4 4 0 0 0-4 4v2a3 3 0 0 0-1 5 3 3 0 0 0 1 5v2a4 4 0 0 0 8 0V3z"/><path d="M15 3a4 4 0 0 1 4 4v2a3 3 0 0 1 1 5 3 3 0 0 1-1 5v2a4 4 0 0 1-8 0"/>',
    'spec-emergencias': '<rect x="3" y="8" width="14" height="8" rx="1"/><path d="M17 10h3l1 3v3h-4"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><path d="M10 12h3M11.5 10.5v3"/>',
    'spec-familiar':    '<path d="M4.8 13.5a3.5 3.5 0 1 1 6.4-2c0 4.5-3.2 5.5-3.2 7.5"/><path d="M8 19h.01"/><path d="M14 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/><path d="M20 15v-3a4 4 0 0 0-8 0v3"/>',
    'spec-cardiotoraci':'<path d="M12 3v6"/><path d="M9 6l3-3 3 3"/><path d="M4 12c0 5 4 8 8 8s8-3 8-8-4-8-8-8"/>',
    'spec-obstetricia': '<path d="M9 12a3 3 0 1 1 6 0"/><path d="M12 15c0 3 2 6 5 6-1-2 0-4 0-6"/><path d="M9 15c-1 3-3 6-6 6 1-2 0-4 0-6"/><circle cx="12" cy="9" r="3"/>',
    'spec-enfermeria':  '<path d="M6 4h12v6c0 4-3 8-6 8s-6-4-6-8V4z"/><path d="M9 8h6M12 5v6"/>',
    'spec-generic':     '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18"/><path d="M7 4h4l2 2"/>',

    /* ───── Ficha (in54 banner) ───── */
    'ficha':            '<path d="M6 3h9l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><polyline points="14 3 14 8 19 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/>',

    /* ───── P2 nuevos ───── */
    'key':              '<circle cx="7.5" cy="12" r="3.5"/><path d="M11 12h10"/><path d="M17 12v3"/><path d="M20 12v2.5"/>',
    'clipboard':        '<rect x="6" y="4" width="12" height="17" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="16" x2="13" y2="16"/>',
    'steps':            '<path d="M4 20h4v-4H4z"/><path d="M10 16h4v-4h-4z"/><path d="M16 12h4V8h-4z"/><line x1="4" y1="20" x2="20" y2="20"/>',
    'search':           '<circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.5" y1="15.5" x2="20" y2="20"/>',
    'algorithm':        '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>',
    'filter':           '<path d="M4 4h16l-6 8v7l-4-2v-5z"/>',
    'shield':           '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    'help':             '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5"/><line x1="12" y1="17" x2="12" y2="17.5"/>',
    /* Acciones de ficha (Leer / Vídeo / Compartir / Verificar) */
    'volume':           '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18 6a9 9 0 0 1 0 12"/>',
    'play':             '<rect x="3" y="5" width="18" height="14" rx="2"/><polygon points="10 9 15 12 10 15" fill="currentColor" stroke="none"/>',
    'share':            '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="10.6" x2="15.4" y2="6.4"/><line x1="8.6" y1="13.4" x2="15.4" y2="17.6"/>',
    'sparkles':         '<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M18 15l.9 2.4L21 18l-2.1.6L18 21l-.9-2.4L15 18l2.1-.6z"/>',
    /* Guardar / OK */
    'save':             '<path d="M5 4h11l3 3v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><rect x="7" y="4" width="8" height="5"/><rect x="7" y="13" width="10" height="7"/>',
    'check':            '<polyline points="5 12.5 10 17.5 19 7.5"/>',
    /* P3.1 navegador NNN */
    'nnn':              '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="12" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8.2 7.4l7.6 3.4"/><path d="M8.2 16.6l7.6-3.4"/>',
    'close-x':          '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>',
    'chevron-r':        '<polyline points="9 6 15 12 9 18"/>',
    'clock':            '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>'
  };

  function get(name, opts){
    var svg = ICONS[name];
    if(!svg) return '';
    return wrap(svg, opts);
  }
  function has(name){ return !!ICONS[name]; }
  function names(){ return Object.keys(ICONS); }

  /* Sustituye el contenido de `node` por un SVG si `node.textContent`
     coincide con un emoji conocido. Devuelve true si sustituye. */
  var EMOJI_MAP = {
    '🏠':'nav-inicio', '🌙':'nav-turno', '🧮':'nav-calc', '📐':'nav-escalas',
    '📈':'nav-ecg', '🩻':'nav-rx', '🏛️':'nav-fuentes', '🏛':'nav-fuentes',
    '⚙️':'nav-ajustes', '⚙':'nav-ajustes',
    '💉':'spec-anestesia', '❤️':'spec-cardio', '❤':'spec-cardio',
    '🏥':'spec-uci', '💊':'spec-farmacia', '👶':'spec-pediatria',
    '👼':'spec-neonatal', '🧠':'spec-neuro', '🚑':'spec-emergencias',
    '🩺':'spec-familiar', '🫀':'spec-cardiotoraci', '🤰':'spec-obstetricia',
    '🩹':'spec-enfermeria', '📁':'spec-generic',
    '📄':'ficha', '📋':'clipboard', '🔑':'key', '🪜':'steps',
    '🔍':'search', '🔎':'search', '⏱':'algorithm', '⏱️':'algorithm',
    '🧩':'algorithm', '🔧':'filter', '🛡️':'shield', '🛡':'shield',
    '🔊':'volume', '📢':'volume', '🎬':'play', '📤':'share', '✨':'sparkles',
    '💾':'save', '✓':'check', '✅':'check'
  };
  function replaceEmoji(node){
    if(!node) return false;
    var t = (node.textContent || '').trim();
    if(!t) return false;
    var name = EMOJI_MAP[t];
    if(!name) return false;
    node.innerHTML = get(name);
    node.classList.add('enfx-ic-slot');
    return true;
  }

  window.EnferixIcons = { get: get, has: has, names: names, replaceEmoji: replaceEmoji, EMOJI_MAP: EMOJI_MAP };
})();
