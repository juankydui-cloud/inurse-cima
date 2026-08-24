
(function(){
  'use strict';
  var STORE_NOTES='inurse_ic_shift';
  var STORE_REM='inurse_turno_rem_v1';
  var STORE_ROOMS='inurse_turno_rooms_v1';
  var STORE_CHECK='inurse_turno_checklist_v1';
  var STORE_META='inurse_turno_meta_v1';
  var STORE_HIST='inurse_turno_history_v1';

  var DEFAULT_CHECK_START=['Revisar listado de pacientes y alergias','Comprobar bombas de perfusión y vías','Revisar medicación pendiente del turno','Verificar constantes basales registradas'];
  var DEFAULT_CHECK_END=['Registrar constantes y balance del turno','Actualizar pendientes para el siguiente turno','Comprobar material y carro de curas repuesto','Realizar el relevo (SBAR) al siguiente turno'];

  function loadJSON(key,def){ try{ var v=JSON.parse(localStorage.getItem(key)); return v==null?def:v; }catch(e){ return def; } }
  function saveJSON(key,v){ try{ localStorage.setItem(key, JSON.stringify(v)); }catch(e){} }
  function loadNotes(){ return loadJSON(STORE_NOTES,{notes:'',pending:''}); }
  function saveNotes(v){ saveJSON(STORE_NOTES,v); }
  function loadRem(){ return loadJSON(STORE_REM,[]); }
  function saveRem(v){ saveJSON(STORE_REM,v); }
  function loadRooms(){ return loadJSON(STORE_ROOMS,[]); }
  function saveRooms(v){ saveJSON(STORE_ROOMS,v); }
  function mkCheckItem(label){ return { id:'c'+Date.now()+Math.random().toString(36).slice(2,7), label:label, done:false }; }
  function loadCheck(){
    var c=loadJSON(STORE_CHECK,null);
    if(!c){ c={ start:DEFAULT_CHECK_START.map(mkCheckItem), end:DEFAULT_CHECK_END.map(mkCheckItem) }; saveJSON(STORE_CHECK,c); }
    return c;
  }
  function saveCheck(v){ saveJSON(STORE_CHECK,v); }
  function loadMeta(){
    var m=loadJSON(STORE_META,null);
    if(!m){ m={ startedAt:Date.now(), hours:8 }; saveJSON(STORE_META,m); }
    return m;
  }
  function saveMeta(v){ saveJSON(STORE_META,v); }
  function loadHist(){ return loadJSON(STORE_HIST,[]); }
  function saveHist(v){ saveJSON(STORE_HIST,v); }

  function toast(msg){ if(typeof window.toast==='function'){ window.toast(msg); return; } var t=document.createElement('div'); t.className='toast on'; t.textContent=msg; document.body.appendChild(t); setTimeout(function(){ t.remove(); },2200); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function pad(n){ return String(n).padStart(2,'0'); }
  function nowHM(){ var d=new Date(); return pad(d.getHours())+':'+pad(d.getMinutes()); }
  function todayKey(){ var d=new Date(); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
  function fmtDur(ms){ var neg=ms<0; ms=Math.abs(ms); var totalMin=Math.floor(ms/60000); var h=Math.floor(totalMin/60), m=totalMin%60; return (neg?'-':'')+h+'h '+pad(m)+'min'; }
  function fmtDateTime(ts){ var d=new Date(ts); return pad(d.getDate())+'/'+pad(d.getMonth()+1)+' '+pad(d.getHours())+':'+pad(d.getMinutes()); }

  var TABS_MAP={notas:'turnoViewNotas',pac:'turnoViewPac',rec:'turnoViewRec',check:'turnoViewCheck',sbar:'turnoViewSbar',hist:'turnoViewHist'};

  function open(tab){
    var ov=document.getElementById('turnoOverlay'); if(!ov) return;
    ov.classList.add('on'); ov.setAttribute('aria-hidden','false');
    var n=loadNotes();
    var notesEl=document.getElementById('turnoNotes'); if(notesEl) notesEl.value=n.notes||'';
    var pendEl=document.getElementById('turnoPending'); if(pendEl) pendEl.value=n.pending||'';
    renderCounter(); renderRooms(); renderReminders(); renderChecklist(); renderHistory();
    showTab(tab||'notas');
    requestNotifPermission();
  }
  function close(){
    var ov=document.getElementById('turnoOverlay'); if(!ov) return;
    ov.classList.remove('on'); ov.setAttribute('aria-hidden','true');
  }
  function showTab(tab){
    document.querySelectorAll('.turno-tab').forEach(function(b){ b.classList.toggle('active', b.dataset.turnoTab===tab); });
    document.querySelectorAll('.turno-view').forEach(function(v){ v.classList.remove('active'); });
    var el=document.getElementById(TABS_MAP[tab]); if(el) el.classList.add('active');
  }

  /* ---- Contador de turno ---- */
  var counterTimer=null;
  function renderCounter(){
    var meta=loadMeta();
    var elapsed=Date.now()-meta.startedAt;
    var remaining=meta.hours*3600000-elapsed;
    var timeEl=document.getElementById('turnoCounterTime'); if(timeEl) timeEl.textContent=fmtDur(elapsed);
    var labelEl=document.getElementById('turnoCounterLabel');
    if(labelEl) labelEl.textContent='transcurrido · quedan '+(remaining>0?fmtDur(remaining):'0h 00min')+' de '+meta.hours+'h';
    if(!counterTimer) counterTimer=setInterval(function(){ var ov=document.getElementById('turnoOverlay'); if(ov&&ov.classList.contains('on')) renderCounter(); },30000);
  }
  function saveCounterSettings(){
    var si=document.getElementById('turnoStartInput'), hi=document.getElementById('turnoHoursInput');
    var meta=loadMeta();
    if(si&&si.value){
      var parts=si.value.split(':'); var d=new Date();
      d.setHours(+parts[0],+parts[1],0,0);
      if(d.getTime()>Date.now()+60000) d.setDate(d.getDate()-1);
      meta.startedAt=d.getTime();
    }
    if(hi&&hi.value) meta.hours=parseFloat(hi.value)||8;
    saveMeta(meta);
    var setBox=document.getElementById('turnoCounterSet'); if(setBox) setBox.style.display='none';
    renderCounter();
    toast('🕒 Turno actualizado');
  }

  /* ---- Pacientes / habitaciones ---- */
  function renderRooms(){
    var list=document.getElementById('turnoRoomList'); if(!list) return;
    var rooms=loadRooms();
    if(!rooms.length){ list.innerHTML='<div class="turno-empty">Sin habitaciones añadidas todavía.</div>'; }
    else{
      list.innerHTML=rooms.map(function(r){
        return '<div class="turno-room-item" data-room="'+r.id+'">'
          +'<div class="turno-room-head"><b>🛏️ '+esc(r.room)+'</b><button class="turno-rem-del" data-room-del="'+r.id+'" title="Eliminar">🗑</button></div>'
          +'<textarea class="turno-room-notes" data-room-notes="'+r.id+'" placeholder="Notas de la habitación/paciente...">'+esc(r.notes||'')+'</textarea>'
          +'</div>';
      }).join('');
    }
    refreshReminderRoomOptions();
  }
  function addRoom(){
    var inp=document.getElementById('turnoRoomNum');
    var room=(inp.value||'').trim();
    if(!room){ toast('Indica número de habitación o cama'); return; }
    var rooms=loadRooms();
    rooms.push({ id:'h'+Date.now(), room:room, notes:'' });
    saveRooms(rooms); inp.value=''; renderRooms();
    toast('🛏️ Habitación añadida');
  }
  var roomSaveTimers={};
  function scheduleRoomSave(id,val){
    clearTimeout(roomSaveTimers[id]);
    roomSaveTimers[id]=setTimeout(function(){
      var rooms=loadRooms();
      rooms.forEach(function(r){ if(r.id===id) r.notes=val; });
      saveRooms(rooms);
    },500);
  }

  /* ---- Recordatorios ---- */
  function refreshReminderRoomOptions(){
    var sel=document.getElementById('turnoRemRoom'); if(!sel) return;
    var rooms=loadRooms(); var current=sel.value;
    sel.innerHTML='<option value="">Sin habitación</option>'+rooms.map(function(r){ return '<option value="'+r.id+'">'+esc(r.room)+'</option>'; }).join('');
    if(current) sel.value=current;
  }
  function roomLabel(id){ if(!id) return ''; var r=loadRooms().find(function(x){ return x.id===id; }); return r?r.room:''; }
  function renderReminders(){
    var list=document.getElementById('turnoRemList'); if(!list) return;
    var rem=loadRem().slice().sort(function(a,b){ return a.time.localeCompare(b.time); });
    if(!rem.length){ list.innerHTML='<div class="turno-empty">Sin recordatorios. Añade uno con hora y descripción.</div>'; return; }
    var now=nowHM();
    list.innerHTML=rem.map(function(r){
      var overdue = !r.done && r.time<=now;
      var rl=roomLabel(r.roomId);
      return '<div class="turno-rem-item'+(r.done?' done':'')+(overdue?' overdue':'')+'" data-id="'+r.id+'">'
        +'<span class="turno-rem-time">'+r.time+'</span>'
        +'<span class="turno-rem-label">'+(r.repeat?'🔁 ':'')+(rl?'<b>'+esc(rl)+':</b> ':'')+esc(r.label)+'</span>'
        +'<button class="turno-rem-del" data-toggle="'+r.id+'" title="'+(r.done?'Marcar pendiente':'Marcar hecho')+'">'+(r.done?'↺':'✓')+'</button>'
        +'<button class="turno-rem-del" data-del="'+r.id+'" title="Eliminar">🗑</button>'
        +'</div>';
    }).join('');
  }
  function addReminder(){
    var t=document.getElementById('turnoRemTime'), l=document.getElementById('turnoRemLabel'), rs=document.getElementById('turnoRemRoom'), rp=document.getElementById('turnoRemRepeat');
    var time=(t.value||'').trim(), label=(l.value||'').trim();
    if(!time||!label){ toast('Indica hora y descripción'); return; }
    var rem=loadRem();
    rem.push({ id:'r'+Date.now(), time:time, label:label, done:false, firedDate:'', repeat: rp?rp.checked:false, roomId: rs?rs.value:'' });
    saveRem(rem); l.value=''; if(rp) rp.checked=false; renderReminders();
    toast('⏰ Recordatorio añadido');
  }
  function notify(title,body){
    try{
      if('serviceWorker' in navigator && navigator.serviceWorker.ready){
        navigator.serviceWorker.ready.then(function(reg){
          if(reg&&reg.showNotification&&window.Notification&&Notification.permission==='granted'){
            reg.showNotification(title,{body:body,icon:'/icon-192.png',badge:'/icon-192.png',tag:'inurse-turno-'+Date.now()});
          } else if(window.Notification&&Notification.permission==='granted'){ new Notification(title,{body:body}); }
        }).catch(function(){ try{ if(window.Notification&&Notification.permission==='granted') new Notification(title,{body:body}); }catch(e){} });
      } else if(window.Notification&&Notification.permission==='granted'){ new Notification(title,{body:body}); }
    }catch(e){}
  }
  function requestNotifPermission(){
    try{ if(window.Notification&&Notification.permission==='default'){ Notification.requestPermission().catch(function(){}); } }catch(e){}
  }
  function checkReminders(){
    var rem=loadRem(); if(!rem.length) return;
    var now=nowHM(), today=todayKey(), changed=false;
    rem.forEach(function(r){
      if(!r.done && r.time<=now && r.firedDate!==today){
        r.firedDate=today; changed=true;
        toast('⏰ '+r.time+' — '+r.label);
        notify('Enferix · Mi turno', r.time+' — '+r.label);
      }
    });
    if(changed){ saveRem(rem); renderReminders(); }
  }
  setInterval(checkReminders, 20000);

  /* ---- Checklist ---- */
  function renderChecklist(){
    var c=loadCheck();
    ['start','end'].forEach(function(section){
      var host=document.getElementById(section==='start'?'turnoCheckStart':'turnoCheckEnd'); if(!host) return;
      var items=c[section]||[];
      if(!items.length){ host.innerHTML='<div class="turno-empty">Sin ítems.</div>'; return; }
      host.innerHTML=items.map(function(it){
        return '<label class="turno-check-item'+(it.done?' done':'')+'">'
          +'<input type="checkbox" data-check-toggle="'+section+':'+it.id+'"'+(it.done?' checked':'')+'>'
          +'<span>'+esc(it.label)+'</span>'
          +'<button class="turno-rem-del" data-check-del="'+section+':'+it.id+'" title="Eliminar">🗑</button>'
          +'</label>';
      }).join('');
    });
  }
  function toggleCheck(section,id){ var c=loadCheck(); (c[section]||[]).forEach(function(it){ if(it.id===id) it.done=!it.done; }); saveCheck(c); renderChecklist(); }
  function delCheck(section,id){ var c=loadCheck(); c[section]=(c[section]||[]).filter(function(it){ return it.id!==id; }); saveCheck(c); renderChecklist(); }
  function addCheck(section){
    var inp=document.getElementById(section==='start'?'turnoCheckStartNew':'turnoCheckEndNew');
    var label=(inp.value||'').trim(); if(!label) return;
    var c=loadCheck(); c[section]=c[section]||[]; c[section].push(mkCheckItem(label));
    saveCheck(c); inp.value=''; renderChecklist();
  }

  /* ---- Historial ---- */
  function renderHistory(){
    var host=document.getElementById('turnoHistList'); if(!host) return;
    var hist=loadHist();
    if(!hist.length){ host.innerHTML='<div class="turno-empty">Todavía no has finalizado ningún turno.</div>'; return; }
    host.innerHTML=hist.slice().reverse().map(function(h){
      return '<div class="turno-hist-item" data-hist="'+h.id+'">'
        +'<div class="turno-hist-head"><b>'+fmtDateTime(h.startedAt)+' → '+fmtDateTime(h.closedAt)+'</b>'
        +'<button class="turno-rem-del" data-hist-view="'+h.id+'" title="Ver resumen">👁</button>'
        +'<button class="turno-rem-del" data-hist-del="'+h.id+'" title="Eliminar">🗑</button></div>'
        +'<div class="turno-hist-summary" id="turnoHistSum-'+h.id+'" style="display:none"><pre>'+esc(h.summaryText)+'</pre></div>'
        +'</div>';
    }).join('');
  }
  function viewHistItem(id){ var el=document.getElementById('turnoHistSum-'+id); if(el) el.style.display = el.style.display==='none' ? 'block':'none'; }
  function delHistItem(id){ var hist=loadHist().filter(function(h){ return h.id!==id; }); saveHist(hist); renderHistory(); }

  /* ---- Resumen / Finalizar ---- */
  function buildSummaryText(){
    var n=loadNotes(), rooms=loadRooms(), rem=loadRem(), c=loadCheck(), meta=loadMeta();
    var lines=[];
    lines.push('PARTE DE TURNO — '+fmtDateTime(Date.now()));
    lines.push('Inicio: '+fmtDateTime(meta.startedAt)+' · Duración prevista: '+meta.hours+'h');
    lines.push(''); lines.push('NOTAS:'); lines.push(n.notes?n.notes:'Sin notas.');
    lines.push(''); lines.push('PENDIENTES:'); lines.push(n.pending?n.pending:'Sin pendientes.');
    lines.push(''); lines.push('PACIENTES / HABITACIONES:');
    if(rooms.length) rooms.forEach(function(r){ lines.push('- '+r.room+': '+(r.notes||'sin notas')); });
    else lines.push('Sin habitaciones registradas.');
    lines.push(''); lines.push('RECORDATORIOS:');
    if(rem.length){
      rem.slice().sort(function(a,b){return a.time.localeCompare(b.time);}).forEach(function(r){
        var rl=roomLabel(r.roomId);
        lines.push((r.done?'✓ ':'· ')+r.time+' — '+(rl?rl+': ':'')+r.label);
      });
    } else lines.push('Sin recordatorios.');
    lines.push(''); lines.push('CHECKLIST INICIO:');
    (c.start||[]).forEach(function(it){ lines.push((it.done?'✓ ':'· ')+it.label); });
    lines.push(''); lines.push('CHECKLIST FIN:');
    (c.end||[]).forEach(function(it){ lines.push((it.done?'✓ ':'· ')+it.label); });
    return lines.join('\n');
  }
  function copyText(text){
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(text).then(function(){ toast('📋 Resumen copiado'); }).catch(function(){ toast('No se ha podido copiar'); }); }
    else toast('No se ha podido copiar');
  }
  function exportSummary(){
    var text=buildSummaryText();
    if(navigator.share){ navigator.share({title:'Parte de turno · Enferix', text:text}).catch(function(e){ if(e&&e.name!=='AbortError') copyText(text); }); }
    else copyText(text);
  }
  function finishShift(){
    if(!confirm('¿Finalizar turno? Se archivará el resumen en el Historial y se reiniciarán notas, pacientes y checklist para el nuevo turno. Los recordatorios marcados para repetir se mantienen.')) return;
    var summary=buildSummaryText();
    var meta=loadMeta();
    var hist=loadHist();
    hist.push({ id:'s'+Date.now(), startedAt:meta.startedAt, closedAt:Date.now(), hours:meta.hours, summaryText:summary });
    if(hist.length>30) hist=hist.slice(hist.length-30);
    saveHist(hist);
    saveNotes({notes:'',pending:''});
    saveRooms([]);
    var c=loadCheck();
    (c.start||[]).forEach(function(it){ it.done=false; });
    (c.end||[]).forEach(function(it){ it.done=false; });
    saveCheck(c);
    var rem=loadRem().filter(function(r){ return r.repeat; });
    rem.forEach(function(r){ r.done=false; r.firedDate=''; });
    saveRem(rem);
    saveMeta({ startedAt:Date.now(), hours:meta.hours });
    toast('✅ Turno finalizado y archivado');
    var notesEl=document.getElementById('turnoNotes'); if(notesEl) notesEl.value='';
    var pendEl=document.getElementById('turnoPending'); if(pendEl) pendEl.value='';
    renderCounter(); renderRooms(); renderReminders(); renderChecklist(); renderHistory();
    showTab('hist');
  }

  document.addEventListener('click', function(e){
    if(e.target.closest('#turnoClose')){ close(); return; }
    if(e.target===document.getElementById('turnoOverlay')){ close(); return; }
    var tabBtn=e.target.closest('[data-turno-tab]'); if(tabBtn){ showTab(tabBtn.dataset.turnoTab); return; }
    if(e.target.closest('#turnoSave')){
      var notesEl=document.getElementById('turnoNotes'), pendEl=document.getElementById('turnoPending');
      saveNotes({ notes:notesEl?notesEl.value:'', pending:pendEl?pendEl.value:'' });
      toast('💾 Turno guardado');
      return;
    }
    if(e.target.closest('#turnoSummary')){
      var n=loadNotes();
      var q='Resume y prioriza este turno de enfermería. Notas: '+(n.notes||'')+'\nPendientes: '+(n.pending||'');
      close();
      if(typeof window.openJavnyWithContext==='function'){ window.openJavnyWithContext(q); }
      else if(typeof window.EnferixVoiceAskJavny==='function'){ window.EnferixVoiceAskJavny(q); }
      return;
    }
    if(e.target.closest('#turnoRoomAdd')){ addRoom(); return; }
    var roomDel=e.target.closest('[data-room-del]'); if(roomDel){ saveRooms(loadRooms().filter(function(r){ return r.id!==roomDel.dataset.roomDel; })); renderRooms(); return; }
    if(e.target.closest('#turnoRemAdd')){ addReminder(); return; }
    var toggleBtn=e.target.closest('[data-toggle]'); if(toggleBtn){
      var rem=loadRem(); rem.forEach(function(r){ if(r.id===toggleBtn.dataset.toggle) r.done=!r.done; });
      saveRem(rem); renderReminders(); return;
    }
    var delBtn=e.target.closest('[data-del]'); if(delBtn){ saveRem(loadRem().filter(function(r){ return r.id!==delBtn.dataset.del; })); renderReminders(); return; }
    if(e.target.closest('#turnoOpenSbar')){ close(); if(typeof window.openSbar==='function') window.openSbar(); return; }
    var checkAddBtn=e.target.closest('[data-check-add]'); if(checkAddBtn){ addCheck(checkAddBtn.dataset.checkAdd); return; }
    var checkDelBtn=e.target.closest('[data-check-del]'); if(checkDelBtn){ var p=checkDelBtn.dataset.checkDel.split(':'); delCheck(p[0],p[1]); return; }
    if(e.target.closest('#turnoCounterEdit')){
      var box=document.getElementById('turnoCounterSet');
      if(box){
        var willShow = box.style.display!=='flex';
        box.style.display = willShow ? 'flex':'none';
        if(willShow){
          var meta=loadMeta(); var d=new Date(meta.startedAt);
          var si=document.getElementById('turnoStartInput'); if(si) si.value=pad(d.getHours())+':'+pad(d.getMinutes());
          var hi=document.getElementById('turnoHoursInput'); if(hi) hi.value=meta.hours;
        }
      }
      return;
    }
    if(e.target.closest('#turnoCounterSave')){ saveCounterSettings(); return; }
    if(e.target.closest('#turnoExport')){ exportSummary(); return; }
    if(e.target.closest('#turnoFinish')){ finishShift(); return; }
    var histView=e.target.closest('[data-hist-view]'); if(histView){ viewHistItem(histView.dataset.histView); return; }
    var histDel=e.target.closest('[data-hist-del]'); if(histDel){ delHistItem(histDel.dataset.histDel); return; }
  });
  document.addEventListener('change', function(e){
    var chk=e.target.closest('[data-check-toggle]'); if(chk){ var p=chk.dataset.checkToggle.split(':'); toggleCheck(p[0],p[1]); }
  });
  document.addEventListener('input', function(e){
    var rn=e.target.closest('[data-room-notes]'); if(rn){ scheduleRoomSave(rn.dataset.roomNotes, rn.value); }
  });
  document.addEventListener('keydown', function(e){
    if(e.key==='Escape'){ var ov=document.getElementById('turnoOverlay'); if(ov&&ov.classList.contains('on')) close(); }
  });

  window.EnferixTurno={ open:open, close:close };
})();
