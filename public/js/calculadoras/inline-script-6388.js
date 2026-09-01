
/* ---------- ESTADO Y HELPERS ---------- */
let calcCurrent = "gcs";
let calcHistory = [];
try { calcHistory = JSON.parse(store.get("guiaHJ23_calc_hist") || "[]"); } catch(e) { calcHistory = []; }
let perfPeso = parseFloat(store.get("guiaHJ23_perf_peso") || "70") || 70;

/* Fármacos de perfusión personalizados (guardados en el dispositivo) */
let PERF_CUSTOM = {};
try { PERF_CUSTOM = JSON.parse(store.get("inurse_perf_custom_v1") || "{}") || {}; } catch(e) { PERF_CUSTOM = {}; }
function allPerfDrugs(){ return Object.assign({}, DILUCIONES, PERF_CUSTOM); }
function savePerfCustomStore(){ try{ store.set("inurse_perf_custom_v1", JSON.stringify(PERF_CUSTOM)); }catch(e){} }

function pushCalcHistory(id, main, detail){
  const item = { id, title:(CALCS[id]||{}).title||"Perfusión", main, detail, ts:Date.now() };
  calcHistory = [item, ...calcHistory.filter(x=>x.id!==id || x.main!==main)].slice(0,15);
  try{ store.set("guiaHJ23_calc_hist", JSON.stringify(calcHistory)); }catch(e){}
  renderCalcHistory();
}

function renderCalcHistory(){
  const cont = document.getElementById("calcHistList");
  if(!cont) return;
  if(!calcHistory.length){
    cont.innerHTML = `<div class="calc-empty">Sin cálculos recientes.</div>`;
    return;
  }
  cont.innerHTML = calcHistory.map((h,i)=>{
    const time = new Date(h.ts);
    const hh = String(time.getHours()).padStart(2,"0")+":"+String(time.getMinutes()).padStart(2,"0");
    return `<div class="calc-hist-item"><div class="chi-top">
      <span class="chi-title">${escapeHtml(h.title)}</span>
      <span class="chi-time">${hh}</span></div>
      <div class="chi-main">${escapeHtml(h.main)}</div>
      ${h.detail?`<div class="chi-detail">${h.detail}</div>`:""}
    </div>`;
  }).join("");
}

/* ---------- RENDERIZADO DE CALCULADORAS ---------- */
function renderCalc(id){
  const c = CALCS[id]; if(!c) return "";
  calcCurrent = id;
  const inputs = c.fields.map(f=>{
    if(f.type==="number"){
      return `<div class="calc-field">
        <label for="calc-${f.id}">${escapeHtml(f.label)}</label> <input type="number" inputmode="decimal" id="calc-${f.id}"
          min="${f.min}" max="${f.max}" step="${f.step}" value="${f.def}"
          oninput="runCalc()">
      </div>`;
    } else {
      // select
      return `<div class="calc-field">
        <label for="calc-${f.id}">${escapeHtml(f.label)}</label> <select id="calc-${f.id}" onchange="runCalc()">
          ${f.options.map(o=>`<option value="${o.v}">${escapeHtml(o.l)}</option>`).join("")}
        </select>
      </div>`;
    }
  }).join("");

  return `<div class="calc-widget">
    <div class="calc-title"><span class="calc-icon">${c.icon}</span>${escapeHtml(c.title)}
      <span class="calc-tag">${escapeHtml(c.tag)}</span></div>
    <div class="calc-fields">${inputs}</div>
    <div class="calc-result" id="calcResult">—</div>
    <div class="calc-actions">
      <button class="btn-outline" onclick="resetCalc()">↻ Limpiar</button>
      <button class="btn-primary" onclick="saveCalc()">💾 Guardar</button>
    </div>
  </div>`;
}

function runCalc(){
  const c = CALCS[calcCurrent]; if(!c) return;
  const vals = {};
  for(const f of c.fields){
    const el = document.getElementById("calc-"+f.id);
    if(!el) return;
    const raw = el.value;
    vals[f.id] = f.type==="number" ? parseFloat(raw)||0 : (isNaN(parseFloat(raw))?raw:parseFloat(raw));
  }
  const r = c.compute(vals);
  const box = document.getElementById("calcResult");
  if(!box) return;
  box.innerHTML = `<div class="calc-main">${r.main}</div>
    ${r.detail?`<div class="calc-detail">${r.detail}</div>`:""}
    ${r.interp?`<div class="calc-interp">${r.interp}</div>`:""}`;
}

function resetCalc(){
  const c = CALCS[calcCurrent]; if(!c) return;
  for(const f of c.fields){
    const el = document.getElementById("calc-"+f.id);
    if(!el) continue;
    if(f.type==="number") el.value = f.def;
    else el.selectedIndex = 0;
  }
  runCalc();
}

function saveCalc(){
  const c = CALCS[calcCurrent]; if(!c) return;
  const box = document.getElementById("calcResult");
  const main = box?.querySelector(".calc-main")?.textContent || "—";
  const detail = box?.querySelector(".calc-detail")?.innerHTML || "";
  pushCalcHistory(calcCurrent, main, detail);
  toast("💾 Cálculo guardado");
}

/* ---------- WIDGET DE PERFUSIONES ---------- */
function renderPerf(){
  const customKeys = Object.keys(PERF_CUSTOM);
  const customOpts = customKeys.length
    ? `<optgroup label="Mis fármacos">${customKeys.map(k=>
        `<option value="${k}">★ ${escapeHtml(PERF_CUSTOM[k].n)}</option>`).join("")}</optgroup>`
    : "";
  const perfGrupos = [
    ["Vasopresores / Inotrópicos", ["noradrenalina","adrenalina","dopamina","dobutamina","milrinona","levosimendan","vasopresina","fenilefrina"]],
    ["Sedación / Analgesia", ["midazolam","propofol","ketamina","fentanilo","remifentanilo","dexmedetomidina","morfina"]],
    ["Relajantes neuromusculares", ["cisatracurio","rocuronio"]],
    ["Cardiovascular", ["nitroglicerina","nitroprusiato","labetalol","amiodarona","esmolol","clevidipino"]],
    ["Anticoagulación / Endocrino", ["heparina","insulina"]],
    ["Analgesia no opiácea", ["dexketoprofeno","metamizol"]],
    ["Otros", ["furosemida","sulfatoMg","oxitocina","pantoprazol"]]
  ];
  const baseOpts = perfGrupos.map(([label, keys]) => {
    const opts = keys.filter(k => DILUCIONES[k]).map(k =>
      `<option value="${k}">${escapeHtml(DILUCIONES[k].n)}</option>`).join("");
    return opts ? `<optgroup label="${label}">${opts}</optgroup>` : "";
  }).join("");
  const addOpt = `<option value="__new__">➕ Añadir fármaco personalizado…</option>`;
  return `<div class="calc-widget">
    <div class="calc-title"><span class="calc-icon">💉</span>Widget de Perfusiones HJ23
      <span class="calc-tag">Bomba mL/h</span></div>
    <div class="calc-fields">
      <div class="calc-field">
        <label for="perf-search">Fármaco</label> <input type="text" id="perf-search" placeholder="Buscar fármaco…" autocomplete="off"
          oninput="perfFilterDrugs(this.value)" onfocus="this.select()">
        <select id="perf-farm" aria-label="Seleccionar fármaco" onchange="onPerfFarm()">${customOpts}${baseOpts}${addOpt}</select>
      </div>
      <div class="calc-field">
        <label for="perf-peso">Peso paciente (kg)</label> <input type="number" inputmode="decimal" id="perf-peso"
          min="1" max="200" step="0.5" value="${perfPeso}" oninput="runPerf()">
      </div>
      <div class="calc-field">
        <label for="perf-dil">Dilución</label> <select id="perf-dil" onchange="runPerf()"></select>
      </div>
      <div class="calc-field">
        <label for="perf-dosis" id="perf-dosis-label">Dosis objetivo</label> <input type="number" inputmode="decimal" id="perf-dosis" oninput="runPerf()">
        <input type="range" id="perf-slider" aria-label="Dosis objetivo (deslizador)" oninput="document.getElementById('perf-dosis').value=this.value;runPerf()">
        <div class="perf-range" id="perf-range"></div>
      </div>
    </div>
    <div class="perf-reverse" id="perfReverse">
      <label>Cálculo inverso: mL/h → dosis</label>
      <div class="perf-row">
        <input type="number" inputmode="decimal" id="perf-mlh-inv" min="0" step="any" placeholder="mL/h" oninput="runPerfInverse()">
        <span id="perf-inv-result" class="perf-inv-out">—</span>
      </div>
    </div>
    <div id="perfCustomForm"></div>
    <div class="calc-result" id="perfResult">—</div>
    <div class="calc-actions" id="perfActions">
      <button class="btn-outline" onclick="perfReset()">↻ Limpiar</button>
      <button class="btn-outline" onclick="perfTitTable()">📊 Titulación</button>
      <button class="btn-outline" id="perfBoloBtn" onclick="perfBoloCalc()" style="display:none">💉 Bolo</button>
      <button class="btn-outline" onclick="perfPrint()">🖨 Resumen</button>
      <button class="btn-primary" onclick="perfSave()">💾 Guardar</button>
    </div>
    <div id="perfExtra"></div>
    <div class="calc-warn">⚠️ Verifica siempre con la ficha del fármaco y con farmacia. Diluciones habituales; pueden variar por servicio.</div>
    <div class="perf-multi-bar">
      <button class="btn-outline" onclick="perfMultiAdd()">➕ Añadir a perfusiones activas</button>
      <button class="btn-outline" onclick="perfMultiToggle()">📋 Ver perfusiones activas (<span id="perfMultiCount">0</span>)</button>
    </div>
    <div id="perfMultiPanel" class="perf-multi" style="display:none"></div>
  </div>`;
}

/* Formulario de fármaco personalizado */
function renderPerfCustomForm(){
  return `<div class="perf-custom" id="perfCustomBox">
    <div class="perf-custom-title">➕ Nuevo fármaco personalizado</div>
    <div class="calc-fields">
      <div class="calc-field">
        <label for="pc-name">Nombre del fármaco</label> <input type="text" id="pc-name" placeholder="Ej. Milrinona" oninput="pcPreview()">
      </div>
      <div class="calc-field">
        <label>Cantidad de fármaco en el suero</label>
        <div class="perf-row">
          <input type="number" inputmode="decimal" id="pc-amount" min="0" step="any" placeholder="Ej. 20" oninput="pcPreview()">
          <select id="pc-amount-unit" onchange="pcPreview()">
            <option value="mg">mg</option>
            <option value="mcg">mcg</option>
            <option value="UI">UI</option>
          </select>
        </div>
      </div>
      <div class="calc-field">
        <label for="pc-vol">Volumen total del suero (mL)</label> <input type="number" inputmode="decimal" id="pc-vol" min="1" step="any" placeholder="Ej. 100" oninput="pcPreview()">
      </div>
      <div class="calc-field">
        <label for="pc-unit">Tipo de dosificación</label> <select id="pc-unit" onchange="pcPreview()">
          <option value="mcg/kg/min">mcg/kg/min</option>
          <option value="mcg/kg/h">mcg/kg/h</option>
          <option value="mcg/min">mcg/min</option>
          <option value="mg/kg/h">mg/kg/h</option>
          <option value="mg/h">mg/h</option>
          <option value="UI/kg/h">UI/kg/h</option>
          <option value="UI/h">UI/h</option>
        </select>
      </div>
      <div class="calc-field">
        <label for="pc-dose">Dosis objetivo habitual</label> <input type="number" inputmode="decimal" id="pc-dose" min="0" step="any" placeholder="Ej. 0.5" oninput="pcPreview()">
      </div>
    </div>
    <div class="perf-custom-preview" id="pcPreview">Rellena los datos para ver la concentración.</div>
    <div class="calc-actions">
      <button class="btn-outline" onclick="onPerfFarm(true)">✕ Cancelar</button>
      <button class="btn-primary" onclick="savePerfCustom()">💾 Guardar fármaco</button>
    </div>
  </div>`;
}

/* Vista previa de la concentración mientras se rellena */
function pcPreview(){
  const box = document.getElementById("pcPreview");
  if(!box) return;
  const amount = parseFloat((document.getElementById("pc-amount")||{}).value) || 0;
  const vol = parseFloat((document.getElementById("pc-vol")||{}).value) || 0;
  const aUnit = (document.getElementById("pc-amount-unit")||{}).value || "mg";
  if(amount>0 && vol>0){
    const conc = amount/vol;
    box.innerHTML = `Concentración: <b>${conc.toFixed(conc<1?4:2)} ${aUnit}/mL</b>`;
  } else {
    box.textContent = "Rellena la cantidad y el volumen para ver la concentración.";
  }
}

/* Guardar un fármaco personalizado */
function savePerfCustom(){
  const name = (document.getElementById("pc-name").value||"").trim();
  const amount = parseFloat(document.getElementById("pc-amount").value) || 0;
  const aUnit = document.getElementById("pc-amount-unit").value;
  const vol = parseFloat(document.getElementById("pc-vol").value) || 0;
  const unidad = document.getElementById("pc-unit").value;
  const dose = parseFloat(document.getElementById("pc-dose").value) || 0;
  if(!name){ alert("Escribe el nombre del fármaco."); return; }
  if(amount<=0 || vol<=0){ alert("Indica la cantidad de fármaco y el volumen del suero."); return; }
  const conc = amount/vol; // en aUnit por mL (para mostrar)
  // Unidad base de la dosis y del fármaco
  const doseBase = unidad.startsWith("mcg") ? "mcg" : unidad.startsWith("mg") ? "mg" : "UI";
  const massUnits = (u)=> u==="mcg" || u==="mg";
  // UI y mg/mcg son incompatibles entre sí
  if((doseBase==="UI") !== (aUnit==="UI")){
    alert(`No se puede combinar dosis en ${doseBase} con un fármaco medido en ${aUnit}. Revisa las unidades.`);
    return;
  }
  // Concentración convertida a la unidad base de la dosis (mcg o mg)
  let concBase = conc;
  if(massUnits(doseBase) && massUnits(aUnit) && doseBase !== aUnit){
    concBase = aUnit==="mg" ? conc*1000 : conc/1000; // mg→mcg = ×1000 ; mcg→mg = ÷1000
  }
  const dilObj = { l: `${amount} ${aUnit} / ${vol} mL (${conc.toFixed(conc<1?4:2)} ${aUnit}/mL)` };
  if(doseBase==="mcg") dilObj.cMcgMl = concBase;
  else if(doseBase==="mg") dilObj.cMgMl = concBase;
  else dilObj.cUIMl = concBase;
  const isMg = doseBase==="mg", isUi = doseBase==="UI";
  const key = "custom_" + Date.now();
  PERF_CUSTOM[key] = {
    n: name,
    dosis: { unidad, min: 0, max: dose*10 || 9999, def: dose || 0, step: "any" },
    diluciones: [ dilObj ],
    ppw: unidad.includes("/kg"),
    tiempo: unidad.endsWith("/h") ? "h" : undefined,
    mg: isMg, ui: isUi,
    custom: true
  };
  savePerfCustomStore();
  // Re-renderizar el widget y seleccionar el nuevo fármaco
  const body = document.getElementById("calcBody");
  if(body){ body.innerHTML = renderPerf(); }
  const sel = document.getElementById("perf-farm");
  if(sel){ sel.value = key; onPerfFarm(); }
}

/* Borrar el fármaco personalizado seleccionado */
function deletePerfCustom(key){
  if(!PERF_CUSTOM[key]) return;
  if(!confirm(`¿Eliminar "${PERF_CUSTOM[key].n}" de tus fármacos guardados?`)) return;
  delete PERF_CUSTOM[key];
  savePerfCustomStore();
  const body = document.getElementById("calcBody");
  if(body){ body.innerHTML = renderPerf(); onPerfFarm(); }
}

function onPerfFarm(fromCancel){
  const sel = document.getElementById("perf-farm");
  const k = sel.value;
  const customForm = document.getElementById("perfCustomForm");
  const actions = document.getElementById("perfActions");
  const fields = document.querySelectorAll("#calcBody .calc-fields")[0];
  // Modo "añadir fármaco personalizado"
  if(k === "__new__"){
    if(customForm) customForm.innerHTML = renderPerfCustomForm();
    if(fields) fields.style.display = "none";
    if(actions) actions.style.display = "none";
    const res = document.getElementById("perfResult"); if(res) res.style.display = "none";
    pcPreview();
    return;
  }
  if(customForm) customForm.innerHTML = "";
  if(fields) fields.style.display = "";
  if(actions) actions.style.display = "";
  const res = document.getElementById("perfResult"); if(res) res.style.display = "";
  const drugs = allPerfDrugs();
  const f = drugs[k];
  if(!f) return;
  const dilSel = document.getElementById("perf-dil");
  dilSel.innerHTML = f.diluciones.map((d,i)=>`<option value="${i}">${escapeHtml(d.l)}</option>`).join("");
  const dosisInput = document.getElementById("perf-dosis");
  dosisInput.min = f.dosis.min; dosisInput.max = f.dosis.max;
  dosisInput.step = f.dosis.step; dosisInput.value = f.dosis.def;
  document.getElementById("perf-dosis-label").textContent = `Dosis objetivo (${f.dosis.unidad})`;
  const slider = document.getElementById("perf-slider");
  if(slider){ slider.min = f.dosis.min; slider.max = f.dosis.max; slider.step = f.dosis.step; slider.value = f.dosis.def; }
  const rangeEl = document.getElementById("perf-range");
  if(rangeEl) rangeEl.innerHTML = `<span>${f.dosis.min}</span><span>${f.dosis.max} ${f.dosis.unidad}</span>`;
  const invInput = document.getElementById("perf-mlh-inv");
  if(invInput) invInput.value = "";
  const boloBtn = document.getElementById("perfBoloBtn");
  if(boloBtn) boloBtn.style.display = f.bolo ? "" : "none";
  const extra = document.getElementById("perfExtra");
  if(extra) extra.innerHTML = "";
  // Botón de borrar para fármacos personalizados
  if(actions){
    const oldDel = document.getElementById("perfDelBtn");
    if(oldDel) oldDel.remove();
    if(f.custom){
      const del = document.createElement("button");
      del.id = "perfDelBtn"; del.className = "btn-outline"; del.textContent = "🗑 Borrar";
      del.onclick = function(){ deletePerfCustom(k); };
      actions.appendChild(del);
    }
  }
  runPerf();
}

function runPerf(){
  const k = document.getElementById("perf-farm").value;
  if(k === "__new__") return;
  const f = allPerfDrugs()[k];
  if(!f) return;
  const peso = parseFloat(document.getElementById("perf-peso").value) || 0;
  const dilIdx = parseInt(document.getElementById("perf-dil").value) || 0;
  const dosis = parseFloat(document.getElementById("perf-dosis").value) || 0;
  const dil = f.diluciones[dilIdx];
  if(peso>0) { perfPeso = peso; try{ store.set("guiaHJ23_perf_peso", String(peso)); }catch(e){} }

  // Calcular mL/h según tipo de dosis
  let mlH = 0, calcDetail = "";
  const unidad = f.dosis.unidad;

  // mcg-based por kg por min
  if(unidad.includes("mcg/kg/min")){
    const mcgMin = dosis * peso;
    const mcgH = mcgMin * 60;
    mlH = mcgH / (dil.cMcgMl || 1);
    calcDetail = `${mcgMin.toFixed(1)} mcg/min · ${Math.round(mcgH)} mcg/h`;
  }
  // mcg-based sin kg (nitroglicerina)
  else if(unidad === "mcg/min"){
    const mcgH = dosis * 60;
    mlH = mcgH / (dil.cMcgMl || 1);
    calcDetail = `${Math.round(mcgH)} mcg/h`;
  }
  // mcg/kg/h (fentanilo)
  else if(unidad.includes("mcg/kg/h")){
    const mcgH = dosis * peso;
    mlH = mcgH / (dil.cMcgMl || 1);
    calcDetail = `${Math.round(mcgH)} mcg/h`;
  }
  // mg/kg/h (midazolam, propofol, ketamina)
  else if(unidad.includes("mg/kg/h")){
    const mgH = dosis * peso;
    mlH = mgH / (dil.cMgMl || 1);
    calcDetail = `${mgH.toFixed(1)} mg/h`;
  }
  // mg/h (furosemida, labetalol, amiodarona)
  else if(unidad === "mg/h"){
    mlH = dosis / (dil.cMgMl || 1);
    calcDetail = `${dosis.toFixed(1)} mg/h`;
  }
  // UI/kg/h (heparina)
  else if(unidad === "UI/kg/h"){
    const uiH = dosis * peso;
    mlH = uiH / (dil.cUIMl || 1);
    calcDetail = `${Math.round(uiH)} UI/h`;
  }
  // UI/h (insulina)
  else if(unidad === "UI/h"){
    mlH = dosis / (dil.cUIMl || 1);
    calcDetail = `${dosis.toFixed(1)} UI/h`;
  }

  const slider = document.getElementById("perf-slider");
  if(slider) slider.value = dosis;

  const gttMacro = (mlH / 60 * 20).toFixed(1);
  const gttMicro = (mlH / 60 * 60).toFixed(1);
  const doseWarn = (dosis < f.dosis.min || dosis > f.dosis.max)
    ? `<div class="perf-dose-warn">⚠️ Fuera de rango habitual (${f.dosis.min}–${f.dosis.max} ${unidad})</div>` : "";

  let agotamiento = "";
  if(dil.volMl && mlH > 0){
    const horas = dil.volMl / mlH;
    const hh = Math.floor(horas); const mm = Math.round((horas - hh) * 60);
    agotamiento = `<div class="perf-agot">⏱ Duración bolsa (${dil.volMl} mL): <b>${hh}h ${mm}min</b></div>`;
  }

  const infoHtml = f.info ? `<div class="perf-info">
    <span class="perf-info-tag">⚡ ${escapeHtml(f.info.inicio)}</span>
    <span class="perf-info-tag">⏳ t½ ${escapeHtml(f.info.vida)}</span>
    <div class="perf-info-notas">${escapeHtml(f.info.notas)}</div></div>` : "";

  const box = document.getElementById("perfResult");
  if(!box) return;
  box.innerHTML = `<div class="calc-main">${mlH.toFixed(2)} mL/h en bomba</div>
    <div class="calc-detail"><b>${escapeHtml(f.n)}</b> · ${escapeHtml(dil.l)}<br>${calcDetail}</div>
    <div class="perf-gtt">Gravedad: ${gttMacro} gtt/min (macro) · ${gttMicro} µgtt/min (micro)</div>
    ${agotamiento}${doseWarn}
    <div class="calc-interp">Peso: ${peso} kg · Dosis: ${dosis} ${unidad}</div>
    ${infoHtml}`;
}

function perfTitTable(){
  const k = document.getElementById("perf-farm").value;
  const f = allPerfDrugs()[k]; if(!f) return;
  const peso = parseFloat(document.getElementById("perf-peso").value) || 70;
  const dilIdx = parseInt(document.getElementById("perf-dil").value) || 0;
  const dil = f.diluciones[dilIdx];
  const u = f.dosis.unidad;
  const extra = document.getElementById("perfExtra");
  if(!extra) return;
  const steps = [];
  const range = f.dosis.max - f.dosis.min;
  const nSteps = Math.min(12, Math.max(6, Math.ceil(range / f.dosis.step)));
  const stepSize = range / nSteps;
  for(let i = 0; i <= nSteps; i++){
    let d = f.dosis.min + stepSize * i;
    d = Math.round(d / f.dosis.step) * f.dosis.step;
    if(d > f.dosis.max) d = f.dosis.max;
    if(steps.length && Math.abs(steps[steps.length-1].d - d) < f.dosis.step * 0.5) continue;
    let mlH = 0;
    if(u.includes("mcg/kg/min")) mlH = d * peso * 60 / (dil.cMcgMl||1);
    else if(u === "mcg/min") mlH = d * 60 / (dil.cMcgMl||1);
    else if(u.includes("mcg/kg/h")) mlH = d * peso / (dil.cMcgMl||1);
    else if(u.includes("mg/kg/h")) mlH = d * peso / (dil.cMgMl||1);
    else if(u === "mg/h") mlH = d / (dil.cMgMl||1);
    else if(u === "UI/kg/h") mlH = d * peso / (dil.cUIMl||1);
    else if(u === "UI/h") mlH = d / (dil.cUIMl||1);
    steps.push({ d, mlH });
  }
  const rows = steps.map(s =>
    `<tr><td>${s.d.toFixed(s.d<1?3:s.d<10?2:1)} ${u}</td><td><b>${s.mlH.toFixed(2)}</b> mL/h</td></tr>`).join("");
  extra.innerHTML = `<div class="perf-tit">
    <div class="perf-tit-title">📊 Tabla de titulación · ${escapeHtml(f.n)} · ${peso} kg</div>
    <div class="perf-tit-sub">${escapeHtml(dil.l)}</div>
    <table class="perf-tit-table"><thead><tr><th>Dosis</th><th>Bomba</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <button class="btn-outline" onclick="document.getElementById('perfExtra').innerHTML=''">✕ Cerrar</button>
  </div>`;
}

function perfBoloCalc(){
  const k = document.getElementById("perf-farm").value;
  const f = allPerfDrugs()[k]; if(!f || !f.bolo) return;
  const peso = parseFloat(document.getElementById("perf-peso").value) || 70;
  const b = f.bolo;
  const dTotal = b.dosisPorKg ? (b.dosisPorKg * peso) : b.dosis;
  const extra = document.getElementById("perfExtra");
  if(!extra) return;
  let volInfo = "";
  const dilIdx = parseInt(document.getElementById("perf-dil").value) || 0;
  const dil = f.diluciones[dilIdx];
  const conc = dil.cMcgMl || dil.cMgMl || dil.cUIMl || 0;
  if(conc > 0){
    let dosisEnConcUnit = dTotal;
    if(b.unidad === "mg" && dil.cMcgMl) dosisEnConcUnit = dTotal * 1000;
    else if(b.unidad === "mcg" && dil.cMgMl) dosisEnConcUnit = dTotal / 1000;
    const vol = dosisEnConcUnit / conc;
    volInfo = `<div class="perf-bolo-vol">Con la dilución actual: <b>${vol.toFixed(1)} mL</b></div>`;
  }
  extra.innerHTML = `<div class="perf-bolo">
    <div class="perf-bolo-title">💉 Bolo de carga · ${escapeHtml(f.n)}</div>
    <div class="perf-bolo-desc">${escapeHtml(b.desc)}</div>
    <div class="perf-bolo-dose">Dosis: <b>${dTotal.toFixed(dTotal<1?2:dTotal<10?1:0)} ${b.unidad}</b>${b.dosisPorKg ? ` (${b.dosisPorKg} ${b.unidad}/kg × ${peso} kg)` : ""}</div>
    ${volInfo}
    <button class="btn-outline" onclick="document.getElementById('perfExtra').innerHTML=''">✕ Cerrar</button>
  </div>`;
}

function perfPrint(){
  const k = document.getElementById("perf-farm").value;
  const f = allPerfDrugs()[k]; if(!f) return;
  const peso = parseFloat(document.getElementById("perf-peso").value) || 70;
  const dilIdx = parseInt(document.getElementById("perf-dil").value) || 0;
  const dil = f.diluciones[dilIdx];
  const dosis = parseFloat(document.getElementById("perf-dosis").value) || 0;
  const res = document.getElementById("perfResult");
  const mlH = res?.querySelector(".calc-main")?.textContent || "—";
  const detail = res?.querySelector(".calc-detail")?.textContent || "";
  const gtt = res?.querySelector(".perf-gtt")?.textContent || "";
  const agot = res?.querySelector(".perf-agot")?.textContent || "";
  const extra = document.getElementById("perfExtra");
  if(!extra) return;
  const now = new Date().toLocaleString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
  const lines = [
    `═══ PERFUSIÓN · ${f.n} ═══`,
    `Fecha: ${now}`,
    `Peso: ${peso} kg`,
    `Dilución: ${dil.l}`,
    `Dosis: ${dosis} ${f.dosis.unidad}`,
    `▸ ${mlH}`,
    detail, gtt, agot,
    `═══════════════════════════`
  ].filter(Boolean).join("\n");
  extra.innerHTML = `<div class="perf-print">
    <div class="perf-print-title">🖨 Resumen para copiar</div>
    <textarea class="perf-print-text" readonly onclick="this.select()">${escapeHtml(lines)}</textarea>
    <div class="calc-actions">
      <button class="btn-outline" onclick="document.getElementById('perfExtra').innerHTML=''">✕ Cerrar</button>
      <button class="btn-primary" onclick="navigator.clipboard.writeText(this.closest('.perf-print').querySelector('textarea').value);toast('📋 Copiado')">📋 Copiar</button>
    </div>
  </div>`;
}

function perfFilterDrugs(q){
  const sel = document.getElementById("perf-farm");
  if(!sel) return;
  q = (q||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
  const opts = sel.querySelectorAll("option, optgroup");
  if(!q){ opts.forEach(o => o.style.display = ""); return; }
  sel.querySelectorAll("optgroup").forEach(g => g.style.display = "none");
  let firstMatch = null;
  sel.querySelectorAll("option").forEach(o => {
    if(o.value === "__new__"){ o.style.display = ""; return; }
    const text = o.textContent.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
    const match = text.includes(q) || o.value.toLowerCase().includes(q);
    o.style.display = match ? "" : "none";
    if(match){
      if(!firstMatch) firstMatch = o.value;
      const g = o.closest("optgroup");
      if(g) g.style.display = "";
    }
  });
  if(firstMatch && sel.value !== firstMatch){ sel.value = firstMatch; onPerfFarm(); }
}

const perfMultiList = [];

function perfMultiAdd(){
  const k = document.getElementById("perf-farm").value;
  if(k === "__new__") return;
  const f = allPerfDrugs()[k]; if(!f) return;
  const peso = parseFloat(document.getElementById("perf-peso").value) || 70;
  const dilIdx = parseInt(document.getElementById("perf-dil").value) || 0;
  const dil = f.diluciones[dilIdx];
  const dosis = parseFloat(document.getElementById("perf-dosis").value) || 0;
  const u = f.dosis.unidad;
  let mlH = 0;
  if(u.includes("mcg/kg/min")) mlH = dosis * peso * 60 / (dil.cMcgMl||1);
  else if(u === "mcg/min") mlH = dosis * 60 / (dil.cMcgMl||1);
  else if(u.includes("mcg/kg/h")) mlH = dosis * peso / (dil.cMcgMl||1);
  else if(u.includes("mg/kg/h")) mlH = dosis * peso / (dil.cMgMl||1);
  else if(u === "mg/h") mlH = dosis / (dil.cMgMl||1);
  else if(u === "UI/kg/h") mlH = dosis * peso / (dil.cUIMl||1);
  else if(u === "UI/h") mlH = dosis / (dil.cUIMl||1);
  const existing = perfMultiList.findIndex(e => e.key === k);
  if(existing >= 0) perfMultiList[existing] = { key: k, name: f.n, dosis, unidad: u, mlH, dil: dil.l };
  else perfMultiList.push({ key: k, name: f.n, dosis, unidad: u, mlH, dil: dil.l });
  document.getElementById("perfMultiCount").textContent = perfMultiList.length;
  perfMultiRender();
  const panel = document.getElementById("perfMultiPanel");
  if(panel) panel.style.display = "";
  toast("➕ " + f.n + " añadida");
}

function perfMultiRemove(idx){
  perfMultiList.splice(idx, 1);
  document.getElementById("perfMultiCount").textContent = perfMultiList.length;
  perfMultiRender();
  if(!perfMultiList.length){
    const panel = document.getElementById("perfMultiPanel");
    if(panel) panel.style.display = "none";
  }
}

function perfMultiToggle(){
  const panel = document.getElementById("perfMultiPanel");
  if(!panel) return;
  panel.style.display = panel.style.display === "none" ? "" : "none";
  if(panel.style.display !== "none") perfMultiRender();
}

function perfMultiRender(){
  const panel = document.getElementById("perfMultiPanel");
  if(!panel) return;
  if(!perfMultiList.length){
    panel.innerHTML = '<div class="perf-multi-empty">No hay perfusiones activas. Pulsa "➕ Añadir" para registrar la perfusión actual.</div>';
    return;
  }
  const totalMlH = perfMultiList.reduce((s,e) => s + e.mlH, 0);
  const rows = perfMultiList.map((e,i) =>
    `<tr>
      <td><b>${escapeHtml(e.name)}</b></td>
      <td>${e.dosis} ${e.unidad}</td>
      <td><b>${e.mlH.toFixed(1)}</b></td>
      <td><button class="perf-multi-del" onclick="perfMultiRemove(${i})">✕</button></td>
    </tr>`).join("");
  panel.innerHTML = `<div class="perf-multi-title">📋 Perfusiones activas</div>
    <table class="perf-multi-table">
      <thead><tr><th>Fármaco</th><th>Dosis</th><th>mL/h</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="2"><b>Total volumen/h</b></td><td><b>${totalMlH.toFixed(1)}</b></td><td></td></tr>
        <tr><td colspan="2">Volumen/24h</td><td><b>${(totalMlH*24).toFixed(0)} mL</b></td><td></td></tr></tfoot>
    </table>`;
}

function runPerfInverse(){
  const mlhIn = parseFloat(document.getElementById("perf-mlh-inv")?.value) || 0;
  const out = document.getElementById("perf-inv-result");
  if(!out) return;
  if(mlhIn <= 0){ out.textContent = "—"; return; }
  const k = document.getElementById("perf-farm").value;
  const f = allPerfDrugs()[k]; if(!f) return;
  const peso = parseFloat(document.getElementById("perf-peso").value) || 70;
  const dilIdx = parseInt(document.getElementById("perf-dil").value) || 0;
  const dil = f.diluciones[dilIdx];
  const u = f.dosis.unidad;
  let dosis = 0;
  if(u.includes("mcg/kg/min")){ dosis = (mlhIn * (dil.cMcgMl||1)) / (60 * peso); }
  else if(u === "mcg/min"){ dosis = (mlhIn * (dil.cMcgMl||1)) / 60; }
  else if(u.includes("mcg/kg/h")){ dosis = (mlhIn * (dil.cMcgMl||1)) / peso; }
  else if(u.includes("mg/kg/h")){ dosis = (mlhIn * (dil.cMgMl||1)) / peso; }
  else if(u === "mg/h"){ dosis = mlhIn * (dil.cMgMl||1); }
  else if(u === "UI/kg/h"){ dosis = (mlhIn * (dil.cUIMl||1)) / peso; }
  else if(u === "UI/h"){ dosis = mlhIn * (dil.cUIMl||1); }
  const warn = (dosis < f.dosis.min || dosis > f.dosis.max) ? " ⚠️" : "";
  out.innerHTML = `<b>${dosis.toFixed(dosis<1?3:2)}</b> ${u}${warn}`;
}

function perfReset(){
  const k = document.getElementById("perf-farm").value;
  if(k === "__new__") return;
  const f = allPerfDrugs()[k];
  if(!f) return;
  document.getElementById("perf-dosis").value = f.dosis.def;
  document.getElementById("perf-dil").selectedIndex = 0;
  const invInput = document.getElementById("perf-mlh-inv");
  if(invInput) invInput.value = "";
  const invOut = document.getElementById("perf-inv-result");
  if(invOut) invOut.textContent = "—";
  runPerf();
}

function perfSave(){
  const box = document.getElementById("perfResult");
  const main = box?.querySelector(".calc-main")?.textContent || "—";
  const detail = box?.querySelector(".calc-detail")?.innerHTML || "";
  const k = document.getElementById("perf-farm").value;
  pushCalcHistory("perf-"+k, main, detail);
  toast("💾 Perfusión guardada");
}

/* ---------- PANEL DE CALCULADORAS (modal) ---------- */
function reorderCalcTabs(){
  const SPEC_PRIORITY = {
    cardio:    ['cha2ds2','hasbled','wellsTvp','wellsTep','pafi','gcs'],
    intensiva: ['qsofa','sofa','pafi','gcs','perf'],
    urgencias: ['qsofa','wellsTvp','wellsTep','gcs','pafi','perf'],
    neuro:     ['gcs','nihss','qsofa'],
    trauma:    ['gcs','parkland','qsofa','dosisPed']
  };
  let spec=''; try{ spec=localStorage.getItem('inurse_myspec_v1')||''; }catch(e){}
  const container = document.querySelector('.calc-tabs');
  if(!container) return;
  // Remove existing spec-match highlights
  container.querySelectorAll('.calc-tab').forEach(t=>t.classList.remove('spec-match'));
  if(!spec || !SPEC_PRIORITY[spec]) return;
  const priority = SPEC_PRIORITY[spec];
  // Highlight matching tabs
  priority.forEach(function(key){
    const tab = container.querySelector('[data-c="'+key+'"]');
    if(tab) tab.classList.add('spec-match');
  });
  // Move priority tabs (in reverse order) right after the first tab
  const algTab = container.querySelector('.v27-calc-alg-tab');
  priority.slice().reverse().forEach(function(key){
    const tab = container.querySelector('[data-c="'+key+'"]');
    if(tab) container.insertBefore(tab, container.firstChild);
  });
  // Re-append the algoritmos tab at the end
  if(algTab) container.appendChild(algTab);
}

function openCalcs(id){
  const overlay = document.getElementById("calcOverlay");
  overlay.classList.add("on");
  reorderCalcTabs();
  showCalc(id || "perf");
  renderCalcHistory();
}
function closeCalcs(){
  const overlay = document.getElementById("calcOverlay");
  overlay.classList.remove("on");
}
document.addEventListener('click',function(e){ if(e.target && e.target.id==='calcOverlay') closeCalcs(); });
document.addEventListener('keydown',function(e){ if(e.key==='Escape'){ var ov=document.getElementById('calcOverlay'); if(ov && ov.classList.contains('on')) closeCalcs(); } });
function renderNnnValidator(){
  return `<div class="calc-widget">
    <div class="calc-title"><span class="calc-icon">📋</span>Validador de diagnósticos enfermeros
      <span class="calc-tag">NANDA-I · NIC · NOC</span></div>
    <p style="font-size:12.5px;color:var(--text-dim);margin:0 0 14px;line-height:1.45">Escribe un diagnóstico enfermero y valida si tiene código verificado en NNNConsult. Solo devuelve códigos confirmados manualmente — nunca inventa.</p>
    <div class="calc-fields" style="grid-template-columns:1fr">
      <div class="calc-field">
        <label for="calc-nnn-input">Diagnóstico enfermero</label>
        <input type="text" id="calc-nnn-input" placeholder="Ej: riesgo de deterioro de la integridad cutánea" autocomplete="off">
      </div>
    </div>
    <div class="calc-actions" style="justify-content:flex-start;margin-bottom:14px">
      <button class="btn-primary" id="calcNnnBtn">🔍 Validar</button>
    </div>
    <div class="calc-result" id="calcNnnResult" style="min-height:60px">Escribe un diagnóstico y pulsa Validar.</div>
    <div class="calc-warn">Solo se devuelven códigos verificados manualmente en NNNConsult (Elsevier). Los términos pendientes o desconocidos se indican como tales — nunca se fabrica un código.</div>
  </div>
  <div class="calc-widget" style="margin-top:14px">
    <div class="calc-title"><span class="calc-icon">📚</span>Diagnósticos frecuentes (UCI / hospitalización)</div>
    <p style="font-size:12px;color:var(--text-dim);margin:0 0 10px">Pulsa un diagnóstico para validarlo.</p>
    <div id="calcNnnQuickList" style="display:flex;flex-wrap:wrap;gap:6px"></div>
  </div>`;
}
function bindNnnValidator(){
  const inp=document.getElementById('calc-nnn-input');
  const btn=document.getElementById('calcNnnBtn');
  const out=document.getElementById('calcNnnResult');
  const quickList=document.getElementById('calcNnnQuickList');
  if(!btn||!inp||!out) return;
  const NANDA_QUICK=typeof NANDA_DATA!=='undefined'?NANDA_DATA:[];
  if(quickList){quickList.innerHTML=NANDA_QUICK.map(n=>'<button class="btn-outline nnn-quick" style="font-size:11px;padding:5px 10px" data-nnn-q="'+escapeHtml(n.title)+'">'+escapeHtml(n.title)+'</button>').join('');quickList.addEventListener('click',function(e){const b=e.target.closest('[data-nnn-q]');if(b){inp.value=b.dataset.nnnQ;doValidate()}})}
  async function doValidate(){
    const v=inp.value.trim();
    if(v.length<2){out.innerHTML='<div class="calc-detail" style="color:#F59E0B">Escribe al menos 2 caracteres.</div>';return}
    btn.disabled=true;btn.textContent='Validando…';
    out.innerHTML='<div class="calc-detail">Consultando diccionario NNN…</div>';
    try{
      const r=await fetch('/api/terminology/validate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({valor:v,via:'nnn'})});
      const d=await r.json();
      if(!r.ok){out.innerHTML='<div class="calc-detail" style="color:#F59E0B">'+(d.error||'Error')+'</div>';return}
      if(d.code_status==='coded'){
        out.innerHTML='<div class="calc-main" style="font-size:16px">✓ Código verificado</div>'+
          '<div class="calc-detail"><b style="color:#14B8A6">NANDA-I '+escapeHtml(d.nanda.code)+'</b> — '+escapeHtml(d.nanda.label)+'</div>'+
          '<div class="calc-detail"><b style="color:#A855F7">NIC '+escapeHtml(d.nic.code)+'</b> — '+escapeHtml(d.nic.label)+'</div>'+
          '<div class="calc-detail"><b style="color:#A855F7">NOC '+escapeHtml(d.noc.code)+'</b> — '+escapeHtml(d.noc.label)+'</div>'+
          '<div class="calc-interp">Fuente: '+escapeHtml(d.fuente)+' · Verificado: '+escapeHtml(d.fecha_verificacion)+' · Por: '+escapeHtml(d.revisado_por)+'</div>';
      }else{
        out.innerHTML='<div class="calc-main" style="font-size:16px;color:#F59E0B">⚠ Sin código verificado</div>'+
          '<div class="calc-detail">'+escapeHtml(d.reason||'Término no encontrado.')+'</div>';
      }
    }catch(e){out.innerHTML='<div class="calc-detail" style="color:#F59E0B">Error de conexión: '+e.message+'</div>'}
    finally{btn.disabled=false;btn.textContent='🔍 Validar'}
  }
  btn.onclick=doValidate;
  inp.addEventListener('keydown',function(e){if(e.key==='Enter')doValidate()});
}
function showCalc(id){
  const body = document.getElementById("calcBody");
  if(!body) return;
  document.querySelectorAll(".calc-tab").forEach(t=>t.classList.toggle("active", t.dataset.c===id));
  if(id==="perf"){
    body.innerHTML = renderPerf();
    setTimeout(()=>{ onPerfFarm(); }, 30);
  } else if(id==="nnn"){
    body.innerHTML = renderNnnValidator();
    setTimeout(()=>bindNnnValidator(), 30);
  } else {
    body.innerHTML = renderCalc(id);
    setTimeout(()=>runCalc(), 30);
  }
}



/* ============================================================================
   FASE 3 — Búsqueda por síntoma con IA, Modo Entrenamiento, SOS + Ficha personal
   ============================================================================ */

/* ---------- HELPER GENERAL PARA GEMINI ---------- */
async function callGemini(prompt, opts){
  opts = opts || {};
  const apiKey = store.get("guiaHJ23_apikey") || "";
  if(!apiKey){ throw new Error("NO_API_KEY"); }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body = { contents: [{ parts: [{ text: prompt }] }] };
  if(opts.json){
    body.generationConfig = { responseMimeType: "application/json" };
  }
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if(!resp.ok){
    let msg = "Error " + resp.status;
    try{ const j = await resp.json(); msg = j.error?.message || msg; }catch(e){}
    throw new Error(msg);
  }
  const data = await resp.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

/* ---------- ÍNDICE COMPACTO DE FICHAS para enviar a Gemini ---------- */
function buildDocsIndex(){
  // Enviamos id, title, cat, summary (mucho más económico que todo el contenido)
  return DOCS.map(d=>({
    id: d.id,
    cat: d.cat,
    title: d.title,
    resumen: (d.summary||"").slice(0,180)
  }));
}

/* ============================================================================
   MÓDULO 1 — TRIAGE / BÚSQUEDA POR SÍNTOMA CON IA
   ============================================================================ */
let triageOpen = false;
function openTriage(prefillText){
  document.getElementById("triageOverlay").classList.add("on");
  triageOpen = true;
  if(prefillText){
    document.getElementById("triageInput").value = prefillText;
    runTriage();
  }
}
function closeTriage(){
  document.getElementById("triageOverlay").classList.remove("on");
  triageOpen = false;
  stopSpeak && stopSpeak();
}

async function runTriage(){
  const input = document.getElementById("triageInput");
  const results = document.getElementById("triageResults");
  const btn = document.getElementById("triageRunBtn");
  const q = input.value.trim();
  if(!q){ toast("Describe el paciente o los síntomas primero"); return; }
  if(!store.get("guiaHJ23_apikey")){
    results.innerHTML = `<div class="triage-empty">⚠️ Necesitas configurar tu <b>API Key de Gemini</b> en el asistente (botón principal) para usar el triage con IA.</div>`;
    return;
  }
  btn.disabled = true; btn.textContent = "🤖 Analizando…";
  results.innerHTML = `<div class="triage-loading">
    <div class="triage-spinner"></div>
    <div>Gemini está evaluando los síntomas contra las 189 fichas…</div>
  </div>`;

  const idx = buildDocsIndex();
  const prompt = `Eres un asistente clínico de apoyo al triage para profesionales de enfermería en UCI, urgencias y hospitalización. Recibirás una descripción de un paciente o de una situación clínica, y un índice de ${idx.length} fichas clínicas disponibles.

Tu tarea es identificar entre 3 y 6 fichas MÁS RELEVANTES para orientar la actuación del profesional. NO haces diagnóstico, solo sugieres qué protocolos consultar.

Devuelve tu respuesta en formato JSON con esta estructura exacta:
{
  "sospecha": "sospecha clínica principal en 1 frase corta (máx 15 palabras)",
  "prioridad": "vital|urgente|preferente|demorable",
  "fichas": [
    {"id":"id-de-la-ficha","razon":"por qué es relevante en 1 línea (máx 15 palabras)","peso":90}
  ],
  "actuacion_inmediata": ["3-5 acciones prácticas de enfermería en orden de prioridad"]
}

REGLAS ESTRICTAS:
- El campo "id" DEBE coincidir exactamente con uno de los IDs del índice de fichas.
- "peso" es un número 0-100 que refleja la relevancia (mayor = más relevante).
- Ordena las fichas de mayor a menor peso.
- Máximo 6 fichas.
- Si la situación es vital, marca prioridad "vital" y ponlo también en actuacion_inmediata.
- Si no hay ninguna ficha relevante, devuelve fichas:[] y sospecha explicándolo.
- No añadas texto fuera del JSON.

DESCRIPCIÓN DEL PACIENTE:
"${q}"

ÍNDICE DE FICHAS DISPONIBLES:
${JSON.stringify(idx)}`;

  try{
    const raw = await callGemini(prompt, {json:true});
    let data;
    try{ data = JSON.parse(raw); }
    catch(e){
      // intentar limpiar backticks
      const clean = raw.replace(/^```json\s*/i,"").replace(/```\s*$/,"").trim();
      data = JSON.parse(clean);
    }
    renderTriageResults(data);
  }catch(e){
    if(e.message==="NO_API_KEY"){
      results.innerHTML = `<div class="triage-empty">⚠️ Configura tu API Key de Gemini primero.</div>`;
    } else {
      results.innerHTML = `<div class="triage-empty">❌ Error: ${escapeHtml(e.message)}</div>`;
    }
  } finally {
    btn.disabled = false; btn.textContent = "🤖 Analizar con IA";
  }
}

function renderTriageResults(data){
  const results = document.getElementById("triageResults");
  const prioColors = { vital:"#DC2626", urgente:"#F97316", preferente:"#FACC15", demorable:"#22C55E" };
  const prioLabel = { vital:"🚨 VITAL", urgente:"⚠️ URGENTE", preferente:"🟡 PREFERENTE", demorable:"🟢 DEMORABLE" };
  const p = data.prioridad || "preferente";
  const color = prioColors[p] || "#64748B";

  const fichasHtml = (data.fichas||[]).map((f,i)=>{
    const doc = DOCS.find(d=>d.id===f.id);
    if(!doc) return "";
    const catInfo = CATS[Array.isArray(doc.cat)?doc.cat[0]:doc.cat] || {color:"#475569", icon:"🩺"};
    return `<div class="triage-match" style="--ac:${catInfo.color}" onclick="closeTriage();openDoc('${doc.id}')">
      <div class="triage-match-top">
        <span class="triage-match-ico">${catInfo.icon}</span>
        <div class="triage-match-meta">
          <div class="triage-match-title">${escapeHtml(doc.title)}</div>
          <div class="triage-match-reason">${escapeHtml(f.razon||"")}</div>
        </div>
        ${i===0?'<span class="triage-badge">Prioritaria</span>':''}
      </div>
      <div class="triage-barwrap"><div class="triage-bar" style="width:${f.peso||50}%"></div></div>
    </div>`;
  }).join("");

  const acciones = (data.actuacion_inmediata||[]).map(a=>`<li>${escapeHtml(a)}</li>`).join("");

  results.innerHTML = `
    <div class="triage-summary" style="border-left-color:${color}">
      <div class="triage-prio" style="color:${color}">${prioLabel[p]||"🟡 PREFERENTE"}</div>
      <div class="triage-sospecha">${escapeHtml(data.sospecha||"—")}</div>
    </div>
    ${acciones?`<div class="triage-actions"><div class="triage-actions-title">▸ Actuación inmediata sugerida</div><ol>${acciones}</ol></div>`:""}
    ${fichasHtml?`<div class="triage-fichas-title">▸ Fichas relevantes</div>${fichasHtml}`:'<div class="triage-empty">No se han identificado fichas relevantes.</div>'}
    <div class="triage-warn">🩺 Sugerencia de apoyo al triage. Prevalecen el protocolo local y el juicio del profesional.</div>
  `;
}

function triageVoice(){
  const input = document.getElementById("triageInput");
  const btn = document.getElementById("triageVoiceBtn");
  dictate(btn,
    v=>{ input.value = v; },
    final=>{ input.value = final; setTimeout(runTriage, 400); }
  );
}

/* ============================================================================
   MÓDULO 2 — MODO ENTRENAMIENTO (test tipo pregunta con Gemini)
   ============================================================================ */
let trainCurrent = null; // {questions, index, answers}
let trainCat = "all";

function openTrain(){
  document.getElementById("trainOverlay").classList.add("on");
  renderTrainStart();
}
function closeTrain(){
  document.getElementById("trainOverlay").classList.remove("on");
  stopSpeak && stopSpeak();
}

function renderTrainStart(){
  const cats = Object.entries(CATS)
    .filter(([k])=> !["all","fav","recent"].includes(k))
    .map(([k,c])=> `<option value="${k}">${c.icon} ${escapeHtml(c.name)}</option>`).join("");
  document.getElementById("trainBody").innerHTML = `
    <div class="train-start">
      <div class="train-hero">
        <div class="train-hero-ico">🎓</div>
        <h4>Modo entrenamiento</h4>
        <p>Practica con preguntas tipo test generadas por IA a partir de tus 189 fichas. Ideal para residentes o enfermería de nueva incorporación.</p>
      </div>
      <div class="train-cfg">
        <label for="trainCatSel">Área temática</label> <select id="trainCatSel">
          <option value="all">📚 Cualquier categoría</option>
          ${cats}
        </select>
        <label for="trainNumSel" style="margin-top:10px">Número de preguntas</label> <select id="trainNumSel">
          <option value="3">3 preguntas (rápido)</option>
          <option value="5" selected>5 preguntas</option>
          <option value="8">8 preguntas</option>
          <option value="10">10 preguntas (completo)</option>
        </select>
        <button class="train-start-btn" onclick="startTrain()">▶ Empezar</button>
      </div>
    </div>
  `;
}

async function startTrain(){
  if(!store.get("guiaHJ23_apikey")){
    document.getElementById("trainBody").innerHTML = `<div class="triage-empty">⚠️ Necesitas configurar tu API Key de Gemini primero (asistente principal).</div>`;
    return;
  }
  const cat = document.getElementById("trainCatSel").value;
  const num = parseInt(document.getElementById("trainNumSel").value) || 5;
  trainCat = cat;

  // Filtrar fichas por categoría
  let pool = DOCS;
  if(cat!=="all"){
    pool = DOCS.filter(d=>{
      const dc = Array.isArray(d.cat)?d.cat:[d.cat];
      if(cat==="uci") return dc.includes("uci") || dc.includes("enfoqueuci");
      return dc.includes(cat);
    });
  }
  if(!pool.length){
    document.getElementById("trainBody").innerHTML = `<div class="triage-empty">No hay fichas en esa categoría.</div>`;
    return;
  }
  // Escoger hasta 8 fichas al azar como base
  const sample = [...pool].sort(()=>Math.random()-0.5).slice(0, Math.min(8, pool.length));

  document.getElementById("trainBody").innerHTML = `<div class="triage-loading">
    <div class="triage-spinner"></div>
    <div>Generando ${num} preguntas basadas en tus fichas…</div>
  </div>`;

  // Preparar contenido reducido
  const context = sample.map(d=>({
    id: d.id, title: d.title, source: d.source,
    contenido: d.sec.map(s=> s.h + ": " + s.b.replace(/<[^>]+>/g,"").slice(0,400)).join(" | ").slice(0,1500)
  }));

  const prompt = `Eres un docente clínico. Genera EXACTAMENTE ${num} preguntas tipo test (opción múltiple con 4 respuestas cada una) para evaluar los conocimientos de enfermería de UCI/urgencias del Hospital .

Las preguntas DEBEN basarse ESTRICTAMENTE en el contenido de las fichas facilitadas abajo. NO uses información externa.

Devuelve un JSON con esta estructura EXACTA:
{
  "preguntas": [
    {
      "enunciado": "pregunta clara y directa (máx 30 palabras)",
      "opciones": ["opción A", "opción B", "opción C", "opción D"],
      "correcta": 0,
      "explicacion": "razón corta de por qué esa es la correcta (máx 40 palabras)",
      "ficha_id": "id-de-la-ficha-de-origen"
    }
  ]
}

REGLAS:
- correcta es el índice (0-3) de la opción correcta en el array "opciones".
- Las 4 opciones deben ser plausibles pero solo 1 correcta.
- Variar dificultad y tipos: dosis, signos, protocolos, contraindicaciones, cuidados.
- Preguntas claras, con vocabulario clínico natural.
- ficha_id DEBE coincidir con un id del listado.
- No añadas texto fuera del JSON.

FICHAS DISPONIBLES:
${JSON.stringify(context)}`;

  try{
    const raw = await callGemini(prompt, {json:true});
    let data;
    try{ data = JSON.parse(raw); }
    catch(e){
      const clean = raw.replace(/^```json\s*/i,"").replace(/```\s*$/,"").trim();
      data = JSON.parse(clean);
    }
    if(!data.preguntas || !data.preguntas.length) throw new Error("No se generaron preguntas");
    trainCurrent = {
      questions: data.preguntas,
      index: 0,
      answers: [],
      score: 0
    };
    renderTrainQuestion();
  }catch(e){
    document.getElementById("trainBody").innerHTML = `<div class="triage-empty">❌ Error generando preguntas: ${escapeHtml(e.message)}</div>
      <div style="text-align:center;margin-top:12px"><button class="train-start-btn" onclick="renderTrainStart()">↩ Volver</button></div>`;
  }
}

function renderTrainQuestion(){
  if(!trainCurrent) return;
  const q = trainCurrent.questions[trainCurrent.index];
  const total = trainCurrent.questions.length;
  const pct = Math.round(((trainCurrent.index)/total)*100);
  const opciones = (q.opciones||[]).map((o,i)=>`
    <button class="train-opt" onclick="answerTrain(${i})">
      <span class="train-opt-letter">${String.fromCharCode(65+i)}</span>
      <span>${escapeHtml(o)}</span>
    </button>`).join("");
  document.getElementById("trainBody").innerHTML = `
    <div class="train-progress">
      <div class="train-progress-bar"><div style="width:${pct}%"></div></div>
      <div class="train-progress-txt">Pregunta ${trainCurrent.index+1} de ${total}</div>
    </div>
    <div class="train-question">
      <div class="train-q-text">${escapeHtml(q.enunciado)}</div>
      <div class="train-opts">${opciones}</div>
    </div>
  `;
}

function answerTrain(idx){
  const q = trainCurrent.questions[trainCurrent.index];
  const correct = idx === q.correcta;
  if(correct) trainCurrent.score++;
  trainCurrent.answers.push({idx, correct});
  // Marcar respuestas visualmente
  const opts = document.querySelectorAll(".train-opt");
  opts.forEach((o,i)=>{
    o.disabled = true;
    if(i===q.correcta) o.classList.add("correct");
    else if(i===idx) o.classList.add("wrong");
  });
  // Añadir explicación
  const box = document.createElement("div");
  box.className = "train-explain " + (correct?"ok":"ko");
  box.innerHTML = `<div class="train-explain-head">${correct?"✅ Correcto":"❌ Incorrecto"}</div>
    <div class="train-explain-body">${escapeHtml(q.explicacion||"")}</div>
    ${q.ficha_id?`<button class="train-see" onclick="closeTrain();openDoc('${q.ficha_id}')">📖 Ver ficha completa</button>`:""}
    <button class="train-next" onclick="nextTrain()">${trainCurrent.index+1<trainCurrent.questions.length?"Siguiente →":"Ver resultados"}</button>`;
  document.querySelector(".train-question").appendChild(box);
  box.scrollIntoView({behavior:"smooth", block:"center"});
}

function nextTrain(){
  if(trainCurrent.index+1 < trainCurrent.questions.length){
    trainCurrent.index++;
    renderTrainQuestion();
  } else {
    renderTrainResults();
  }
}

function renderTrainResults(){
  const total = trainCurrent.questions.length;
  const score = trainCurrent.score;
  const pct = Math.round((score/total)*100);
  let msg, emoji;
  if(pct>=80){ msg="Excelente"; emoji="🌟"; }
  else if(pct>=60){ msg="Bien"; emoji="👍"; }
  else if(pct>=40){ msg="Aprobado"; emoji="🙂"; }
  else { msg="Sigue practicando"; emoji="📚"; }
  document.getElementById("trainBody").innerHTML = `
    <div class="train-result">
      <div class="train-result-emoji">${emoji}</div>
      <div class="train-result-score">${score} / ${total}</div>
      <div class="train-result-pct">${pct}% — ${msg}</div>
      <div class="train-result-actions">
        <button class="btn-outline" onclick="renderTrainStart()">↩ Volver</button>
        <button class="btn-primary" onclick="startTrain()">🔄 Otro test</button>
      </div>
    </div>
  `;
}

/* ============================================================================
   MÓDULO 3 — SOS + FICHA PERSONAL
   ============================================================================ */
function getSosData(){
  try{ return JSON.parse(store.get("guiaHJ23_sos") || "{}"); }catch(e){ return {}; }
}
function saveSosData(d){
  try{ store.set("guiaHJ23_sos", JSON.stringify(d)); }catch(e){}
}

function openSos(){
  document.getElementById("sosOverlay").classList.add("on");
  renderSos();
}
function closeSos(){
  document.getElementById("sosOverlay").classList.remove("on");
}

function renderSos(){
  const d = getSosData();
  const nombre = d.nombre || "";
  const dni = d.dni || "";
  const nac = d.nac || "";
  const grupo = d.grupo || "";
  const alergias = d.alergias || "";
  const medicacion = d.medicacion || "";
  const antecedentes = d.antecedentes || "";
  const contactos = d.contactos || [];

  const contactosHtml = contactos.map((c,i)=>`
    <div class="sos-contacto">
      <div>
        <div class="sos-c-nombre">${escapeHtml(c.nombre)}</div>
        <div class="sos-c-tel">${escapeHtml(c.tel)}</div>
      </div>
      <div class="sos-c-actions">
        <a href="tel:${escapeHtml(c.tel)}" class="sos-c-call">📞</a>
        <button onclick="delSosContacto(${i})" class="sos-c-del">✕</button>
      </div>
    </div>
  `).join("");

  document.getElementById("sosBody").innerHTML = `
    <div class="sos-emergency">
      <button class="sos-big" onclick="sosCall112()">
        <div class="sos-big-emoji">🚨</div>
        <div class="sos-big-txt">LLAMAR 112</div>
      </button>
      <button class="sos-med" onclick="sosLocation()">
        <div>📍 Enviar mi ubicación y pedir ayuda</div>
        <small>Por WhatsApp a todos tus contactos, con el hospital más cercano</small>
      </button>
      <button class="sos-med" onclick="sosShowCard()">
        <div>🆔 Mostrar mi ficha en pantalla</div>
        <small>Para que el sanitario que llegue la vea</small>
      </button>
    </div>

    <details class="sos-details" open>
      <summary>🩺 Mi ficha médica personal</summary>
      <div class="sos-form">
        <label for="sos-nombre">Nombre completo</label> <input type="text" id="sos-nombre" value="${escapeHtml(nombre)}" placeholder="Ej. Juan Val">
        <div class="sos-row">
          <div>
            <label for="sos-dni">DNI</label> <input type="text" id="sos-dni" value="${escapeHtml(dni)}">
          </div>
          <div>
            <label for="sos-nac">Nacimiento</label> <input type="date" id="sos-nac" value="${escapeHtml(nac)}">
          </div>
        </div>
        <label for="sos-grupo">Grupo sanguíneo</label> <select id="sos-grupo">
          ${["","A+","A-","B+","B-","AB+","AB-","O+","O-","Desconocido"].map(g=>
            `<option value="${g}" ${g===grupo?"selected":""}>${g||"— Selecciona —"}</option>`).join("")}
        </select>
        <label for="sos-alergias">Alergias (incluye a fármacos)</label> <textarea id="sos-alergias" rows="2" placeholder="Penicilina, AINE, látex…">${escapeHtml(alergias)}</textarea>
        <label for="sos-medicacion">Medicación actual</label> <textarea id="sos-medicacion" rows="3" placeholder="Sintrom 4 mg L-M-V, Enalapril 20…">${escapeHtml(medicacion)}</textarea>
        <label for="sos-antecedentes">Antecedentes relevantes</label> <textarea id="sos-antecedentes" rows="2" placeholder="HTA, DM2, FA en tratamiento…">${escapeHtml(antecedentes)}</textarea>
        <button class="btn-primary" onclick="saveSosFicha()" style="margin-top:12px">💾 Guardar mi ficha</button>
      </div>
    </details>

    <details class="sos-details">
      <summary>👨‍👩‍👧 Contactos de emergencia (${contactos.length})</summary>
      <div class="sos-contactos-list">${contactosHtml || '<div class="triage-empty">Sin contactos</div>'}</div>
      <div class="sos-form">
        <div class="sos-row">
          <div><label for="sos-newc-name">Nombre</label> <input type="text" id="sos-newc-name" placeholder="Ej. Marta"></div>
          <div><label for="sos-newc-tel">Teléfono</label> <input type="tel" id="sos-newc-tel" placeholder="+34 6..."></div>
        </div>
        <button class="btn-primary" onclick="addSosContacto()" style="margin-top:8px">➕ Añadir contacto</button>
      </div>
    </details>

    <div class="sos-warn">🔒 Todos los datos se guardan solo en este dispositivo. No se envían a ningún servidor.</div>
  `;
}

function saveSosFicha(){
  const d = getSosData();
  d.nombre = document.getElementById("sos-nombre").value.trim();
  d.dni = document.getElementById("sos-dni").value.trim();
  d.nac = document.getElementById("sos-nac").value;
  d.grupo = document.getElementById("sos-grupo").value;
  d.alergias = document.getElementById("sos-alergias").value.trim();
  d.medicacion = document.getElementById("sos-medicacion").value.trim();
  d.antecedentes = document.getElementById("sos-antecedentes").value.trim();
  saveSosData(d);
  toast("💾 Ficha guardada en este dispositivo");
}

function addSosContacto(){
  const name = document.getElementById("sos-newc-name").value.trim();
  const tel = document.getElementById("sos-newc-tel").value.trim();
  if(!name || !tel){ toast("Rellena nombre y teléfono"); return; }
  const d = getSosData();
  d.contactos = d.contactos || [];
  d.contactos.push({nombre:name, tel:tel});
  saveSosData(d);
  toast("➕ Contacto añadido");
  renderSos();
}

function delSosContacto(idx){
  if(!confirm("¿Eliminar este contacto?")) return;
  const d = getSosData();
  d.contactos = d.contactos || [];
  d.contactos.splice(idx,1);
  saveSosData(d);
  renderSos();
}

function sosCall112(){
  if(confirm("¿Llamar al 112 ahora?")){
    location.href = "tel:112";
  }
}

async function sosLocation(){
  const d = getSosData();
  if(!d.contactos || !d.contactos.length){
    toast("Añade al menos un contacto de emergencia primero");
    return;
  }
  if(!navigator.geolocation){
    toast("Este dispositivo no soporta geolocalización");
    return;
  }
  toast("📍 Obteniendo tu ubicación GPS…");
  try{
    const pos = await new Promise((res, rej)=>{
      navigator.geolocation.getCurrentPosition(res, rej, {
        enableHighAccuracy: true, timeout: 15000, maximumAge: 0
      });
    });
    const lat = pos.coords.latitude.toFixed(6);
    const lon = pos.coords.longitude.toFixed(6);
    const acc = Math.round(pos.coords.accuracy);
    const gmap = `https://maps.google.com/?q=${lat},${lon}`;
    const nombre = d.nombre || "";

    // Hospital/DEA más cercano (OpenStreetMap): best-effort, nunca bloquea el
    // envío del SOS si tarda o falla — la ubicación propia ya es lo esencial.
    let hospitalLine = "";
    try{
      const nearbyRes = await Promise.race([
        fetch(`/api/nearby?lat=${lat}&lon=${lon}&type=all&radius=8000`).then(r=>r.ok?r.json():null),
        new Promise(res=>setTimeout(()=>res(null),6000))
      ]);
      const nearest = nearbyRes && Array.isArray(nearbyRes.items) ? nearbyRes.items[0] : null;
      if(nearest){
        hospitalLine = `%0A%0A${nearest.kind==='aed'?'⚡ DEA':'🏥 Hospital'} más cercano: ${encodeURIComponent(nearest.name)} (a ${nearest.distanceKm} km)%0A${encodeURIComponent(nearest.mapsUrl)}`;
      }
    }catch(e){}

    const msg = `🚨 NECESITO AYUDA${nombre?" — "+nombre:""}%0ALlámame si puedes.%0A%0AMi ubicación actual (±${acc}m):%0A${encodeURIComponent(gmap)}${hospitalLine}`;

    let sent=0;
    d.contactos.forEach(function(c,i){
      const tel=(c.tel||"").replace(/[^0-9+]/g,"").replace("+","");
      if(!tel)return;
      const wa=`https://wa.me/${tel}?text=${msg}`;
      setTimeout(function(){window.open(wa,"_blank")},i*350);
      sent++;
    });
    if(sent){toast(`📤 Mensaje de SOS preparado para ${sent} contacto${sent>1?'s':''} (confirma el envío en cada chat)`);}
    else{toast("Los contactos no tienen un teléfono válido");}
  }catch(e){
    toast("❌ No se pudo obtener la ubicación: " + (e.message||""));
  }
}

function sosShowCard(){
  const d = getSosData();
  if(!d.nombre){ toast("Rellena tu ficha personal primero"); return; }
  const html = `<div class="sos-card-view">
    <div class="sos-card-title">🆔 Ficha médica de emergencia</div>
    <div class="sos-card-name">${escapeHtml(d.nombre)}</div>
    ${d.dni?`<div class="sos-card-row"><b>DNI:</b> ${escapeHtml(d.dni)}</div>`:""}
    ${d.nac?`<div class="sos-card-row"><b>Nacimiento:</b> ${escapeHtml(d.nac)}</div>`:""}
    ${d.grupo?`<div class="sos-card-row sos-card-blood"><b>Grupo sanguíneo:</b> <span>${escapeHtml(d.grupo)}</span></div>`:""}
    ${d.alergias?`<div class="sos-card-block"><b>⚠️ ALERGIAS</b><br>${escapeHtml(d.alergias)}</div>`:""}
    ${d.medicacion?`<div class="sos-card-block"><b>💊 Medicación</b><br>${escapeHtml(d.medicacion)}</div>`:""}
    ${d.antecedentes?`<div class="sos-card-block"><b>📋 Antecedentes</b><br>${escapeHtml(d.antecedentes)}</div>`:""}
    ${d.contactos && d.contactos.length ? `<div class="sos-card-block"><b>👨‍👩‍👧 Contactos de emergencia</b><br>${d.contactos.map(c=>`${escapeHtml(c.nombre)}: <a href="tel:${escapeHtml(c.tel)}">${escapeHtml(c.tel)}</a>`).join("<br>")}</div>`:""}
    <button class="sos-card-close" onclick="closeSosCard()">Cerrar</button>
  </div>`;
  const layer = document.createElement("div");
  layer.className = "sos-card-layer";
  layer.id = "sosCardLayer";
  layer.innerHTML = html;
  document.body.appendChild(layer);
  // Bloqueo del sueño (si se soporta)
  if("wakeLock" in navigator){
    navigator.wakeLock.request("screen").then(w=>{ layer._wake = w; }).catch(()=>{});
  }
}
function closeSosCard(){
  const layer = document.getElementById("sosCardLayer");
  if(layer){
    if(layer._wake) { try{ layer._wake.release(); }catch(e){} }
    layer.remove();
  }
}



/* ============================================================================
   DIAGRAMAS INTERACTIVOS + SPLASH + POLISH VISUAL
   ============================================================================ */

const DIAGRAMS = {
  /* ---------- RCP: metrónomo + ciclo 2 min + contador ---------- */
  "uci-rcp-algoritmo": {
    icon: "🫀",
    title: "Metrónomo RCP · Ciclo de 2 minutos",
    render() {
      return `<div class="diag" id="diag-rcp">
        <div class="diag-hdr">
          <div class="diag-clock"><div id="rcpTime">02:00</div><small>Restante</small></div>
          <div class="diag-metronome" id="rcpMet">
            <svg viewBox="0 0 200 200" width="140" height="140">
              <circle cx="100" cy="100" r="88" fill="none" stroke="var(--border)" stroke-width="6"/>
              <circle cx="100" cy="100" r="88" fill="none" stroke="#F43F5E" stroke-width="6"
                stroke-dasharray="553" stroke-dashoffset="553"
                transform="rotate(-90 100 100)" id="rcpProgress"
                stroke-linecap="round"/>
              <circle cx="100" cy="100" r="52" fill="#F43F5E" opacity=".85" id="rcpBeat"/>
              <text x="100" y="106" text-anchor="middle" fill="#fff" font-size="26" font-weight="800" id="rcpBpm">100</text>
              <text x="100" y="124" text-anchor="middle" fill="#fff" font-size="9" opacity=".85">lpm</text>
            </svg>
          </div>
        </div>
        <div class="diag-stats">
          <div><span id="rcpComp">0</span><small>Compresiones</small></div>
          <div><span id="rcpVent">0</span><small>Ventilaciones</small></div>
          <div><span id="rcpCycles">0</span><small>Ciclos 30:2</small></div>
        </div>
        <div class="diag-note" id="rcpNote">Pulsa ▶ para iniciar. Sigue el ritmo del punto rojo (100 lpm).</div>
        <div class="diag-actions">
          <button class="diag-btn primary" id="rcpPlay" onclick="rcpToggle()">▶ Iniciar</button>
          <button class="diag-btn" onclick="rcpReset()">↻ Reiniciar</button>
          <select class="diag-select" id="rcpBpmSel" onchange="rcpChangeBpm()">
            <option value="100">100 lpm</option>
            <option value="110" selected>110 lpm</option>
            <option value="120">120 lpm</option>
          </select>
        </div>
      </div>`;
    },
    init() {
      window._rcp = { running:false, comp:0, vent:0, cycles:0, start:0, phase:"comp", inPhase:0, bpm:110, timer:null };
      rcpUpdateBpm();
    }
  },

  /* ---------- SEPSIS 1h Bundle ---------- */
  "uci-sepsis-bundle-1h": {
    icon: "⏱",
    title: "Sepsis 1-Hour Bundle · Reloj de progreso",
    render() {
      /* Los objetivos intermedios por medida (5/15/30/45 min) NO están
         en el Surviving Sepsis Campaign 1-Hour Bundle: la guía marca
         un único objetivo global «dentro de la primera hora» para todos
         los elementos. Por eso el campo `min` desaparece y solo queda
         el reloj global de 60 min. Se prepara un campo opcional
         `tiempoLocal` (string, ej. "≤15 min") que SOLO se muestra si la
         ficha lo tiene relleno; en ese caso, se etiqueta como
         "Protocolo local" para no confundirlo con la recomendación
         internacional. */
      const items = [
        {k:"lac",   l:"Lactato sérico (repetir si >2)"},
        {k:"cul",   l:"Hemocultivos ANTES de antibiótico"},
        {k:"atb",   l:"Antibiótico de amplio espectro"},
        {k:"crist", l:"30 mL/kg cristaloide si hipoTA o lactato ≥4"},
        {k:"vaso",  l:"Vasopresores si TAM <65 tras fluidos"}
      ];
      const list = items.map(i=>{
        const localTag = i.tiempoLocal
          ? `<small class="sep-local">Protocolo local · ${i.tiempoLocal}</small>`
          : '';
        return `<div class="sep-item" data-k="${i.k}" onclick="sepToggle('${i.k}')">
          <div class="sep-check"></div>
          <div class="sep-txt">${i.l}${localTag}</div>
          <div class="sep-time" id="sepT-${i.k}">—</div>
        </div>`;
      }).join("");
      return `<div class="diag" id="diag-sep">
        <div class="diag-hdr">
          <div class="sep-clock">
            <svg viewBox="0 0 200 200" width="150" height="150">
              <circle cx="100" cy="100" r="86" fill="none" stroke="var(--border)" stroke-width="8"/>
              <circle cx="100" cy="100" r="86" fill="none" stroke="url(#sepGrad)" stroke-width="8"
                stroke-dasharray="540" stroke-dashoffset="540" id="sepProgress"
                transform="rotate(-90 100 100)" stroke-linecap="round"/>
              <defs><linearGradient id="sepGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#F97316"/><stop offset="1" stop-color="#DC2626"/></linearGradient></defs>
              <text x="100" y="94" text-anchor="middle" fill="var(--text)" font-size="34" font-weight="800" id="sepMin">60</text>
              <text x="100" y="118" text-anchor="middle" fill="var(--text-dim)" font-size="11">min restantes</text>
            </svg>
          </div>
          <div class="sep-legend">
            <div class="sep-legend-row"><span class="sep-dot ok"></span>Completado</div>
            <div class="sep-legend-row"><span class="sep-dot pend"></span>Pendiente</div>
            <div class="sep-legend-row"><span class="sep-dot late"></span>Fuera de tiempo</div>
          </div>
        </div>
        <div class="sep-items">${list}</div>
        <div class="diag-actions">
          <button class="diag-btn primary" id="sepPlay" onclick="sepStart()">▶ Iniciar reloj</button>
          <button class="diag-btn" onclick="sepReset()">↻ Reiniciar</button>
        </div>
        <div class="diag-note">Al iniciar el reloj se activa la cuenta atrás de 60 min. Marca cada acción al completarla.</div>
      </div>`;
    },
    init() {
      window._sep = { running:false, elapsed:0, done:{}, timer:null };
    }
  },

  /* ---------- ICTUS: ventana temporal ---------- */
  "uci-acv-codigo-ictus": {
    icon: "⏰",
    title: "Ventana terapéutica · Código Ictus",
    render() {
      return `<div class="diag" id="diag-ictus">
        <div class="diag-input-row">
          <label for="ictusHora">Hora de inicio de los síntomas</label> <input type="time" id="ictusHora" onchange="ictusUpdate()">
          <button class="diag-btn small" onclick="ictusAhora()">Ahora</button>
        </div>
        <div class="ictus-svg">
          <svg viewBox="0 0 320 320" width="100%" style="max-width:320px;margin:0 auto;display:block">
            <!-- Anillos: 4.5h (rt-PA), 6h (trombectomía), 24h (casos seleccionados) -->
            <circle cx="160" cy="160" r="140" fill="none" stroke="#22C55E" stroke-width="18" opacity=".18"/>
            <circle cx="160" cy="160" r="110" fill="none" stroke="#FACC15" stroke-width="18" opacity=".22"/>
            <circle cx="160" cy="160" r="80"  fill="none" stroke="#EF4444" stroke-width="18" opacity=".25"/>
            <text x="160" y="35"  text-anchor="middle" fill="#22C55E" font-weight="700" font-size="12">24 h · Casos seleccionados</text>
            <text x="160" y="65"  text-anchor="middle" fill="#FACC15" font-weight="700" font-size="12">6 h · Trombectomía</text>
            <text x="160" y="97"  text-anchor="middle" fill="#EF4444" font-weight="700" font-size="12">4.5 h · rt-PA IV</text>
            <!-- Reloj central -->
            <circle cx="160" cy="160" r="60" fill="var(--card-solid)" stroke="var(--border)" stroke-width="2"/>
            <text x="160" y="152" text-anchor="middle" fill="var(--text-dim)" font-size="10">Tiempo transcurrido</text>
            <text x="160" y="180" text-anchor="middle" fill="var(--text)" font-size="24" font-weight="800" id="ictusElapsed">—</text>
            <text x="160" y="200" text-anchor="middle" fill="var(--text-dim)" font-size="10" id="ictusUnit"></text>
            <!-- Puntero -->
            <line x1="160" y1="160" x2="160" y2="30" stroke="var(--text)" stroke-width="3" stroke-linecap="round"
              id="ictusPointer" transform="rotate(0 160 160)" style="transition:transform .5s"/>
            <circle cx="160" cy="160" r="6" fill="var(--text)"/>
          </svg>
        </div>
        <div class="ictus-status" id="ictusStatus">
          Introduce la hora de inicio para calcular la ventana disponible.
        </div>
      </div>`;
    },
    init(){ window._ictus = {}; }
  },

  /* ---------- ANAFILAXIA: adrenalina IM ---------- */
  "uci-anafilaxia": {
    icon: "💉",
    title: "Anafilaxia · Adrenalina IM por peso",
    render() {
      return `<div class="diag" id="diag-anaf">
        <div class="anaf-hero">
          <div class="anaf-cta">
            <div class="anaf-cta-label">ADRENALINA IM</div>
            <div class="anaf-cta-dose"><span id="anafDose">0.30</span> mg</div>
            <div class="anaf-cta-sub">= <span id="anafMl">0.30</span> mL de 1:1000 en muslo (vasto lateral)</div>
          </div>
        </div>
        <div class="diag-input-row" style="margin-top:14px">
          <label for="anafPeso">Peso (kg)</label> <input type="range" min="3" max="120" step="1" value="70" id="anafPeso" oninput="anafUpdate()">
          <span id="anafPesoVal" class="anaf-peso-val">70</span>
        </div>
        <div class="anaf-flow">
          <div class="anaf-step"><div class="anaf-num">1</div><div><b>Retirar el desencadenante</b> · Posición decúbito con piernas elevadas (o sedestación si disnea)</div></div>
          <div class="anaf-step"><div class="anaf-num">2</div><div><b>Adrenalina IM</b> · Repetir cada 5-15 min si no respuesta</div></div>
          <div class="anaf-step"><div class="anaf-num">3</div><div><b>Oxígeno alto flujo</b> · Vía IV/IO · Cristaloide 20 mL/kg</div></div>
          <div class="anaf-step"><div class="anaf-num">4</div><div><b>Adyuvantes</b> · Antihistamínicos IV · Metilprednisolona 1-2 mg/kg · Salbutamol</div></div>
          <div class="anaf-step warn"><div class="anaf-num">!</div><div><b>Refractaria</b> → Perfusión de adrenalina (revisar ficha) · Glucagón si β-bloqueado</div></div>
        </div>
      </div>`;
    },
    init() { setTimeout(anafUpdate, 30); }
  },

  /* ---------- DERMATOMAS: cuerpo interactivo ---------- */
  "trauma-medular": {
    icon: "🧍",
    title: "Mapa interactivo de dermatomas",
    render() {
      const D = [
        {k:"C2",  l:"C2 · Occipucio", cx:120, cy:36},
        {k:"C4",  l:"C4 · Hombros / clavícula", cx:120, cy:80},
        {k:"C6",  l:"C6 · Pulgar", cx:60, cy:135},
        {k:"C7",  l:"C7 · Dedo medio", cx:52, cy:158},
        {k:"C8",  l:"C8 · Meñique", cx:44, cy:180},
        {k:"T4",  l:"T4 · Mamilas (línea intermamilar)", cx:120, cy:126},
        {k:"T10", l:"T10 · Ombligo", cx:120, cy:170},
        {k:"L1",  l:"L1 · Ingle", cx:120, cy:202},
        {k:"L3",  l:"L3 · Cara medial rodilla", cx:100, cy:255},
        {k:"L4",  l:"L4 · Cara medial pierna / maléolo interno", cx:100, cy:305},
        {k:"L5",  l:"L5 · Dorso pie / 1er dedo", cx:100, cy:360},
        {k:"S1",  l:"S1 · Cara lateral pie / 5º dedo", cx:140, cy:360},
        {k:"S3",  l:"S3-S5 · Periné", cx:120, cy:220}
      ];
      const points = D.map(p=>
        `<circle class="derm-p" cx="${p.cx}" cy="${p.cy}" r="7"
          data-k="${p.k}" data-l="${p.l.replace(/"/g,'&quot;')}"
          onclick="dermPick(this)"/>`).join("");
      return `<div class="diag" id="diag-derm">
        <div class="derm-wrap">
          <svg viewBox="0 0 240 400" width="100%" style="max-width:280px;display:block;margin:0 auto">
            <!-- Silueta esquemática -->
            <ellipse cx="120" cy="34" rx="22" ry="26" fill="none" stroke="var(--text-dim)" stroke-width="1.5"/>
            <path d="M105,62 L105,74 Q120,84 135,74 L135,62" fill="none" stroke="var(--text-dim)" stroke-width="1.5"/>
            <path d="M75,90 L165,90 Q180,105 175,145 L165,200 Q158,215 155,240 L145,320 Q140,360 138,385
                     L102,385 Q100,360 95,320 L85,240 Q82,215 75,200 L65,145 Q60,105 75,90 Z"
                  fill="var(--card-solid)" stroke="var(--text-dim)" stroke-width="1.5"/>
            <!-- Brazos -->
            <path d="M75,95 L52,140 L40,190 L38,205" fill="none" stroke="var(--text-dim)" stroke-width="1.5"/>
            <path d="M165,95 L188,140 L200,190 L202,205" fill="none" stroke="var(--text-dim)" stroke-width="1.5"/>
            ${points}
          </svg>
          <div class="derm-legend" id="dermLegend">
            <div class="derm-hint">👆 Toca un punto para ver el dermatoma correspondiente</div>
          </div>
        </div>
      </div>`;
    },
    init() {}
  }
};

/* ---------- CONTROLADORES DE CADA DIAGRAMA ---------- */

/* RCP */
function rcpToggle(){
  const s = window._rcp; if(!s) return;
  s.running = !s.running;
  const btn = document.getElementById("rcpPlay");
  const met = document.getElementById("rcpMet");
  if(s.running){
    if(!s.start) s.start = Date.now();
    else s.start = Date.now() - s.elapsed;
    btn.textContent = "⏸ Pausar"; btn.classList.remove("primary");
    rcpTick();
    met.classList.add("beating");
    // Vibración cada compresión
  } else {
    s.elapsed = Date.now() - s.start;
    clearTimeout(s.timer);
    btn.textContent = "▶ Reanudar"; btn.classList.add("primary");
    met.classList.remove("beating");
  }
}
function rcpTick(){
  const s = window._rcp; if(!s || !s.running) return;
  const totalMs = 120000;
  const elapsed = Date.now() - s.start;
  const remain = Math.max(0, totalMs - elapsed);
  const mm = String(Math.floor(remain/60000)).padStart(2,"0");
  const ss = String(Math.floor((remain%60000)/1000)).padStart(2,"0");
  document.getElementById("rcpTime").textContent = `${mm}:${ss}`;
  document.getElementById("rcpProgress").style.strokeDashoffset = 553 * (remain/totalMs);
  if(remain <= 0){
    s.running = false;
    document.getElementById("rcpNote").innerHTML = "⚠️ <b>2 minutos completados</b> · Comprobar ritmo, cambiar rescatador de compresiones";
    document.getElementById("rcpPlay").textContent = "▶ Nuevo ciclo";
    document.getElementById("rcpMet").classList.remove("beating");
    if(navigator.vibrate) navigator.vibrate([200,100,200]);
    return;
  }
  s.timer = setTimeout(rcpTick, 100);
}
function rcpReset(){
  clearTimeout((window._rcp||{}).timer);
  DIAGRAMS["uci-rcp-algoritmo"].init();
  document.getElementById("rcpTime").textContent = "02:00";
  document.getElementById("rcpProgress").style.strokeDashoffset = "553";
  document.getElementById("rcpComp").textContent = "0";
  document.getElementById("rcpVent").textContent = "0";
  document.getElementById("rcpCycles").textContent = "0";
  document.getElementById("rcpNote").textContent = "Pulsa ▶ para iniciar. Sigue el ritmo del punto rojo.";
  document.getElementById("rcpPlay").textContent = "▶ Iniciar";
  document.getElementById("rcpPlay").classList.add("primary");
  document.getElementById("rcpMet").classList.remove("beating");
}
function rcpUpdateBpm(){
  const s = window._rcp; if(!s) return;
  document.getElementById("rcpBpm").textContent = s.bpm;
  // La animación se hace por CSS: --bpm afecta la duración
  document.documentElement.style.setProperty("--rcp-beat", (60/s.bpm) + "s");
}
function rcpChangeBpm(){
  const s = window._rcp; if(!s) return;
  s.bpm = parseInt(document.getElementById("rcpBpmSel").value) || 110;
  rcpUpdateBpm();
}

/* SEPSIS */
function sepStart(){
  const s = window._sep; if(!s) return;
  if(!s.running){
    s.running = true; s.startTs = Date.now();
    document.getElementById("sepPlay").textContent = "⏸ Pausar";
    sepTick();
  } else {
    s.running = false;
    clearTimeout(s.timer);
    document.getElementById("sepPlay").textContent = "▶ Reanudar";
  }
}
function sepTick(){
  const s = window._sep; if(!s || !s.running) return;
  s.elapsed = (Date.now() - s.startTs)/1000/60;
  const remain = Math.max(0, 60 - s.elapsed);
  document.getElementById("sepMin").textContent = Math.ceil(remain);
  document.getElementById("sepProgress").style.strokeDashoffset = 540 * (remain/60);
  s.timer = setTimeout(sepTick, 1000);
}
function sepToggle(k){
  const s = window._sep; if(!s) return;
  const el = document.querySelector(`.sep-item[data-k="${k}"]`);
  if(!el) return;
  if(s.done[k]) {
    delete s.done[k];
    el.classList.remove("ok","late");
    document.getElementById("sepT-"+k).textContent = "—";
  } else {
    const m = s.elapsed || 0;
    s.done[k] = m;
    const limits = {lac:5,cul:15,atb:30,crist:45,vaso:60};
    if(m <= limits[k]) el.classList.add("ok");
    else el.classList.add("late");
    document.getElementById("sepT-"+k).textContent = "@"+m.toFixed(0)+"m";
    if(navigator.vibrate) navigator.vibrate(30);
  }
}
function sepReset(){
  clearTimeout((window._sep||{}).timer);
  DIAGRAMS["uci-sepsis-bundle-1h"].init();
  document.querySelectorAll(".sep-item").forEach(e=>e.classList.remove("ok","late"));
  document.querySelectorAll(".sep-time").forEach(e=>e.textContent = "—");
  document.getElementById("sepMin").textContent = "60";
  document.getElementById("sepProgress").style.strokeDashoffset = "540";
  document.getElementById("sepPlay").textContent = "▶ Iniciar reloj";
}

/* ICTUS */
function ictusAhora(){
  const d = new Date();
  document.getElementById("ictusHora").value = String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");
  ictusUpdate();
}
function ictusUpdate(){
  const t = document.getElementById("ictusHora").value;
  if(!t) return;
  const [h,m] = t.split(":").map(Number);
  const now = new Date();
  let start = new Date(now); start.setHours(h,m,0,0);
  if(start > now) start.setDate(start.getDate()-1); // ayer si es futuro
  const diffMin = Math.floor((now - start)/60000);
  const hh = Math.floor(diffMin/60), mm = diffMin%60;
  const label = hh>0 ? `${hh}h ${mm}m` : `${mm} min`;
  document.getElementById("ictusElapsed").textContent = hh>0 ? `${hh}h ${String(mm).padStart(2,"0")}` : `${mm}`;
  document.getElementById("ictusUnit").textContent = hh>0 ? "horas" : "minutos";

  // Puntero: 24h = 360°
  const angle = Math.min(360, (diffMin/(24*60))*360);
  document.getElementById("ictusPointer").setAttribute("transform", `rotate(${angle} 160 160)`);

  // Interpretación
  const st = document.getElementById("ictusStatus");
  if(diffMin <= 270){
    st.className = "ictus-status green";
    st.innerHTML = `🟢 <b>Ventana rt-PA IV vigente</b> (≤4.5 h) · Restan ${270-diffMin} min. También trombectomía si oclusión grandes vasos.`;
  } else if(diffMin <= 360){
    st.className = "ictus-status yellow";
    st.innerHTML = `🟡 <b>Ventana trombectomía</b> (≤6 h) · Restan ${360-diffMin} min. Fuera de ventana rt-PA IV estándar.`;
  } else if(diffMin <= 1440){
    st.className = "ictus-status orange";
    st.innerHTML = `🟠 <b>Casos seleccionados</b> (6-24 h) con imagen mismatch (RAPID) · Valorar por Neurología.`;
  } else {
    st.className = "ictus-status red";
    st.innerHTML = `🔴 <b>Fuera de ventana</b> aguda (>24 h) · Enfoque en prevención secundaria y neurorrehabilitación.`;
  }
}

/* ANAFILAXIA */
function anafUpdate(){
  const peso = parseFloat(document.getElementById("anafPeso").value) || 0;
  document.getElementById("anafPesoVal").textContent = peso;
  // 0.01 mg/kg IM máx 0.5 mg (adultos)
  let dose = peso*0.01;
  if(peso >= 50) dose = Math.min(0.5, dose); else dose = Math.min(0.3, dose);
  const mgs = dose.toFixed(2);
  document.getElementById("anafDose").textContent = mgs;
  document.getElementById("anafMl").textContent = mgs; // 1:1000 → 1 mg/mL
}

/* DERMATOMAS */
function dermPick(el){
  document.querySelectorAll(".derm-p").forEach(p=>p.classList.remove("on"));
  el.classList.add("on");
  document.getElementById("dermLegend").innerHTML = `<div class="derm-selected">
    <div class="derm-code">${el.dataset.k}</div>
    <div class="derm-label">${el.dataset.l.split("·")[1]||el.dataset.l}</div>
  </div>`;
  if(navigator.vibrate) navigator.vibrate(15);
}


/* ==== SPLASH DE BIENVENIDA ==== */
(function(){
  try{
    var sos = JSON.parse(localStorage.getItem("guiaHJ23_sos")||"{}");
    if(sos.nombre){
      var nombre = sos.nombre.split(" ")[0];
      var t = document.getElementById("splashTitle");
      var s = document.getElementById("splashSub");
      if(t) t.textContent = "Hola, " + nombre;
      if(s) s.textContent = "Enferix · 189 fichas clínicas listas";
    }
  }catch(e){}
  setTimeout(function(){
    var sp = document.getElementById("splash");
    if(sp) sp.classList.add("gone");
    setTimeout(function(){ if(sp && sp.parentNode) sp.parentNode.removeChild(sp); }, 700);
  }, 1400);
})();

