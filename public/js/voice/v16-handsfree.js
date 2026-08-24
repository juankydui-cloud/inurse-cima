
/* ================================================================
   CAPA v16 — Modo manos libres: escucha continua con wake word.
   Usa la Web Speech API. Se apoya en handleVoiceCommand() ya definido.
   ================================================================ */
(function(){
  'use strict';
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  /* ---- Elementos visuales ---- */
  const bar = Object.assign(document.createElement('div'), { id:'hfBar' });
  const chip = document.createElement('div');
  chip.id = 'hfChip';
  chip.setAttribute('role','status');
  chip.innerHTML = '<span class="dot"></span><span id="hfLabel">Escuchando…</span>';
  const flash = Object.assign(document.createElement('div'), { id:'hfFlash' });
  document.body.append(bar, chip, flash);

  /* ---- Normalización idéntica a la que usa la app ---- */
  const norm = s => (s||'').toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^\w\s]/g,' ').replace(/\s+/g,' ').trim();

  /* ---- Palabras de activación ---- */
  const WAKE = [
    'oye javny','hola javny','hey javny','ei javny','ok javny','okey javny',
    'javny escucha','escucha javny',
    'oye guia','hola guia'
  ];
  const stripWake = t => {
    for (const w of WAKE) {
      if (t.startsWith(w)) return t.slice(w.length).trim();
      const idx = t.indexOf(' ' + w + ' ');
      if (idx !== -1) return t.slice(idx + w.length + 2).trim();
      if (t.endsWith(' ' + w)) return '';
    }
    return null;
  };

  /* ---- Estado ---- */
  let rec = null, active = false, hearing = false, restartTimer = null;
  let lastFire = 0; /* anti-doble-disparo */

  function setChip(text, isHearing){
    document.getElementById('hfLabel').textContent = text;
    chip.classList.toggle('hearing', !!isHearing);
  }
  function showChip(on){ chip.classList.toggle('on', on); bar.classList.toggle('on', on); }

  function fire(cmd){
    const now = Date.now();
    if (now - lastFire < 800) return; /* evita ejecutar dos veces el mismo eco */
    lastFire = now;
    flash.classList.add('on'); setTimeout(()=>flash.classList.remove('on'), 800);
    setChip('✨ ' + cmd, true);
    setTimeout(()=>setChip('Escuchando…', false), 1400);
    try {
      /* Si no viene comando, abrimos el asistente para dictarlo */
      if (!cmd) { if (typeof openModal === 'function') openModal(); return; }
      const handled = window.handleVoiceCommand && window.handleVoiceCommand(cmd);
      if (!handled) {
        /* Una frase libre después de “Oye Javny” se envía al asistente. */
        if (typeof window.EnferixVoiceAskJavny === 'function') window.EnferixVoiceAskJavny(cmd);
        else if (typeof applyQuery === 'function') applyQuery(cmd);
      }
    } catch(e){ console.warn('HF fire error:', e); }
  }

  function processTranscript(text){
    const clean = norm(text);
    if (!clean) return;
    const after = stripWake(clean);
    if (after === null) return;      /* no había wake word */
    fire(after);                     /* after puede ser '' → solo despertar */
  }

  function start(){
    if (!SR){ toast && toast('Este navegador no soporta escucha continua'); return false; }
    if (rec) return true;
    try {
      rec = new SR();
      rec.lang = 'es-ES';
      rec.continuous = true;
      rec.interimResults = true;
      rec.onstart = () => { hearing = true; setChip('Escuchando…', false); };
      rec.onresult = e => {
        let finalText = '', interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++){
          const r = e.results[i];
          if (r.isFinal) finalText += r[0].transcript + ' ';
          else interim += r[0].transcript + ' ';
        }
        if (finalText) processTranscript(finalText);
        else if (interim && norm(interim).match(/\b(oye|hola|hey|ok|okey) guia\b/)){
          setChip('👂 …', true); /* feedback inmediato al oír la wake word */
        }
      };
      rec.onerror = e => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed'){
          active = false; save();
          toast && toast('🎙️ Permite el micrófono para el modo manos libres');
          stop(); return;
        }
        /* no-speech, network, aborted → dejamos que onend reinicie */
      };
      rec.onend = () => {
        hearing = false; rec = null;
        if (active){
          clearTimeout(restartTimer);
          restartTimer = setTimeout(start, 350); /* reinicio automático */
        }
      };
      rec.start();
      return true;
    } catch(e){
      console.warn('HF start error:', e);
      rec = null; return false;
    }
  }
  function stop(){
    active = false; save();
    clearTimeout(restartTimer);
    if (rec){ try{ rec.onend = null; rec.stop(); }catch(e){} rec = null; }
    showChip(false);
  }
  function save(){ try{ localStorage.setItem('guiaHJ23_handsfree', active ? '1':'0'); }catch(e){} }
  function toggle(){
    if (active){ stop(); toast && toast('👂 Manos libres desactivado'); }
    else {
      active = true; save();
      if (start()){
        showChip(true);
        toast && toast('👂 Di "Oye Javny" seguido del comando');
        if (typeof speak === 'function') speak('Manos libres activo. Di Oye Javny seguido del comando.');
      } else { active = false; save(); }
    }
  }

  /* Comando por voz "manos libres" para desactivar desde dentro */
  const origHVC = window.handleVoiceCommand;
  window.handleVoiceCommand = function(text){
    const c = norm(text);
    if (c === 'manos libres' || c === 'desactiva manos libres' || c === 'apaga manos libres' ||
        c === 'para de escuchar' || c === 'deja de escuchar'){
      stop(); toast && toast('👂 Manos libres desactivado'); return true;
    }
    if (c === 'activa manos libres' || c === 'enciende manos libres'){
      if (!active) toggle(); return true;
    }
    return origHVC ? origHVC(text) : false;
  };

  /* API pública por si quieres invocarlo desde otro sitio */
  window.HJ23HandsFree = { toggle, start, stop, isActive: ()=>active };
})();
