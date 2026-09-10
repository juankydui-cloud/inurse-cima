/* ═══════════════════════════════════════════════════════════════════════════
   Proyectos con Javny — Fase 1
   ---------------------------------------------------------------------------
   Reescrito de arriba abajo para esta fase. Antes se llamaba "Proyectos
   ConVive" (restos: menú, comando de voz, clave de localStorage
   `inurse_vivi_projects_v1`) y todo vivía solo en el dispositivo.

   Qué cambia:
   - Nombre: "Proyectos con Javny" en todas partes (el menú y la voz se
     actualizaron en sus propios archivos).
   - Pantalla de proyectos rehecha según el prototipo de referencia, con la
     paleta de tokens de Enferix (ver inurse-projects-v1-css.css).
   - "Proponer estructura" ya NO llama a Gemini desde el navegador: llama a
     POST /api/proyectos/estructura, que en el servidor usa Anthropic con
     Gemini de reserva (sources/proyectos-ia.mjs) y parte de la plantilla del
     tipo elegido (sources/plantillas-proyectos.mjs), no la inventa.
   - Persistencia: si hay sesión iniciada (EnferixCloud/auth), los proyectos
     viven en Postgres vía /api/proyectos (proyectos-db.mjs). Sin sesión, se
     sigue guardando en localStorage bajo la clave `enferix_proyectos_v2`, con
     migración automática desde la clave antigua y, al iniciar sesión, subida
     al servidor.
   - Dictado: el botón de la descripción no implementa su propio
     reconocimiento de voz — lleva id `in63Dict*` dentro de un `.in63-field`,
     que es el patrón que ya intercepta el gestor de voz compartido
     (`window.EnferixVoiceManager`, ver inurse21-master-js.js). Es el mismo
     mecanismo que ya usaba (sin saberlo) el dictado del título en la versión
     anterior.

   Qué NO cambia en esta fase (deuda técnica anotada en CLAUDE.md):
   - El editor de apartados (pantalla 2: redactar, mejorar, ampliar, resumir,
     bibliografía, borrador completo, elevar a excelencia, evidencia) sigue
     llamando a Gemini DIRECTAMENTE DESDE EL NAVEGADOR con la clave del propio
     usuario (callAI more abajo). Se migra a Anthropic/servidor en la fase 2.
   - Adjuntos de sesión y versiones/historial son solo locales: no hay columna
     para ellos en la tabla `proyectos` (fuera de alcance de esta fase), así
     que no sobreviven a un cambio de dispositivo cuando el proyecto está en
     la nube. Sí sobreviven mientras el proyecto vive solo en localStorage.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  const STORAGE = 'enferix_proyectos_v2';
  const STORAGE_OLD = 'inurse_vivi_projects_v1';
  const SESSION_FILES = new Map();
  let currentId = null, currentSectionId = null, saveTimer = null;
  let proyectoActual = null;
  let cloudUser = null, cloudChecked = false;
  let TIPOS_CACHE = null;
  let filtroEstado = 'todos';
  let borradorEnCurso = null; // { ajustes, secciones:[{id,titulo}] } mientras se revisa la estructura propuesta

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const now = () => new Date().toISOString();
  const fmt = d => { try { return new Date(d).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }); } catch (e) { return d || ''; } };
  const cleanName = s => (String(s || 'proyecto').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 70) || 'proyecto');

  function toast(msg) {
    try { if (typeof window.toast === 'function') { window.toast(msg); return; } } catch (e) {}
    let t = $('#in63Toast');
    if (!t) { t = document.createElement('div'); t.id = 'in63Toast'; t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on', 'show'); clearTimeout(t._x); t._x = setTimeout(() => t.classList.remove('on', 'show'), 2200);
  }

  /* ── Catálogo de tipos: se pide una vez al servidor, no se copia aquí ──────
     sources/plantillas-proyectos.mjs es la única fuente. Si la petición
     falla (sin red, servidor caído), se cae a un único tipo para no dejar el
     selector vacío; el usuario puede seguir creando el proyecto como "Libre". */
  const TIPOS_FALLBACK = [{ id: 'libre', label: 'Libre' }];
  async function obtenerTipos() {
    if (TIPOS_CACHE) return TIPOS_CACHE;
    try {
      const r = await fetch('/api/proyectos/tipos');
      if (r.ok) { const d = await r.json(); if (Array.isArray(d.tipos) && d.tipos.length) { TIPOS_CACHE = d.tipos; return TIPOS_CACHE; } }
    } catch (e) {}
    TIPOS_CACHE = TIPOS_FALLBACK;
    return TIPOS_CACHE;
  }
  function etiquetaTipo(id) { return (TIPOS_CACHE || []).find(t => t.id === id)?.label || id || 'Documento'; }

  /* ── Quién es el usuario, y migración del localStorage antiguo ───────────── */
  async function detectarUsuario() {
    try {
      const r = await fetch('/api/auth/me', { credentials: 'include' });
      const d = r.ok ? await r.json() : { user: null };
      cloudUser = d.user || null;
    } catch (e) { cloudUser = null; }
    cloudChecked = true;
  }

  // El tipo de documento cambió de catálogo (8 tipos → 11): se traduce lo más
  // parecido, sabiendo que ya no hay un equivalente exacto para "informe" ni
  // "presentación" — quedan como "Libre" antes que etiquetados con un tipo que
  // no son. El contenido ya redactado no se toca, solo la etiqueta de tipo.
  const MAPA_TIPOS_ANTIGUOS = {
    mejora: 'mejora', protocolo: 'procedimiento', formacion: 'sesion',
    investigacion: 'investigacion', cuidados: 'cuidados',
    informe: 'libre', presentacion: 'libre', libre: 'libre'
  };
  function migrarFormatoLocal() {
    if (localStorage.getItem(STORAGE) != null) return;
    let antiguos = [];
    try { antiguos = JSON.parse(localStorage.getItem(STORAGE_OLD) || '[]'); } catch (e) {}
    if (!Array.isArray(antiguos) || !antiguos.length) { localStorage.setItem(STORAGE, '[]'); return; }
    const nuevos = antiguos.map(p => {
      const estructura = (p.sections || []).map((s, i) => ({
        id: s.id || crypto.randomUUID(),
        titulo: s.title || `Apartado ${i + 1}`,
        orden: i,
        estado: (s.content && s.content.trim()) ? 'redactado' : 'pendiente',
        contenido: s.content || ''
      }));
      return {
        id: p.id || crypto.randomUUID(),
        titulo: p.title || 'Proyecto sin título',
        tipo: MAPA_TIPOS_ANTIGUOS[p.type] || 'libre',
        descripcion: p.objective || '',
        idioma: p.language || 'Castellano',
        tono: p.tone || 'Profesional',
        destinatario: p.audience || '',
        normasCitacion: '', extensionObjetivo: '', institucionTutor: '',
        fuentes: { fichas: true, pubmed: true, guias: true, internet: true },
        estado: 'borrador',
        estructura,
        progreso: { redactados: estructura.filter(s => s.estado === 'redactado').length, total: estructura.length },
        version: 1,
        creado: p.createdAt || now(), actualizado: p.updatedAt || now(),
        attachments: p.attachments || [], versions: p.versions || []
      };
    });
    localStorage.setItem(STORAGE, JSON.stringify(nuevos));
    localStorage.removeItem(STORAGE_OLD);
    console.log(`[Proyectos con Javny] ${nuevos.length} proyecto(s) migrados de ${STORAGE_OLD} a ${STORAGE}.`);
  }

  function cargarLocal() { try { const x = JSON.parse(localStorage.getItem(STORAGE) || '[]'); return Array.isArray(x) ? x : []; } catch (e) { return []; } }
  function guardarListaLocal(lista) { try { localStorage.setItem(STORAGE, JSON.stringify(lista)); } catch (e) { toast('No queda espacio para guardar más proyectos'); } }
  function guardarLocal(proyecto) {
    const lista = cargarLocal();
    const i = lista.findIndex(p => p.id === proyecto.id);
    if (i >= 0) lista[i] = proyecto; else lista.unshift(proyecto);
    guardarListaLocal(lista);
  }
  function borrarLocal(id) { guardarListaLocal(cargarLocal().filter(p => p.id !== id)); }

  // Solo los campos que el servidor sabe guardar. attachments/versions se
  // quedan fuera a propósito: no hay columna para ellos (deuda de fase 3).
  function paraGuardar(p) {
    return {
      titulo: p.titulo, tipo: p.tipo, descripcion: p.descripcion, idioma: p.idioma,
      tono: p.tono, destinatario: p.destinatario, normasCitacion: p.normasCitacion,
      extensionObjetivo: p.extensionObjetivo, institucionTutor: p.institucionTutor,
      fuentes: p.fuentes, estado: p.estado, estructura: p.estructura
    };
  }

  // Sube a la nube los proyectos que se crearon en este dispositivo antes de
  // iniciar sesión. Se marca cada uno con `_migrado` en el propio localStorage
  // según se va subiendo, para no reintentar (ni duplicar) los que ya
  // llegaron si una subida a mitad falla y hay que reintentar en el próximo
  // inicio de sesión. Solo se borra el localStorage cuando TODOS lo consiguen.
  async function migrarNubeSiHaceFalta() {
    if (!cloudUser) return;
    const lista = cargarLocal();
    const pendientes = lista.filter(p => !p._migrado);
    if (!pendientes.length) return;
    setHeader(`Sincronizando ${pendientes.length} proyecto(s) con tu cuenta…`);
    let subidos = 0;
    for (const p of pendientes) {
      try {
        const r = await fetch('/api/proyectos', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paraGuardar(p))
        });
        if (r.ok) { p._migrado = true; subidos++; }
      } catch (e) {}
    }
    guardarListaLocal(lista);
    if (lista.every(p => p._migrado)) {
      localStorage.removeItem(STORAGE);
      if (subidos) toast(`${subidos} proyecto(s) sincronizados con tu cuenta`);
    } else if (subidos) {
      toast(`${subidos} de ${pendientes.length} proyecto(s) sincronizados; el resto se reintentará`);
    }
  }

  async function listaProyectos() {
    if (cloudUser) {
      try {
        const r = await fetch('/api/proyectos', { credentials: 'include' });
        if (r.ok) { const d = await r.json(); return d.proyectos || []; }
      } catch (e) {}
    }
    return cargarLocal();
  }

  /* ── Overlay ───────────────────────────────────────────────────────────── */
  function ensureOverlay() {
    let ov = $('#in63Overlay');
    if (!ov) {
      ov = document.createElement('div'); ov.id = 'in63Overlay'; ov.className = 'in63-overlay';
      ov.innerHTML = `<div class="in63-panel" role="dialog" aria-modal="true" aria-label="Proyectos con Javny">
        <div class="in63-head">
          <div class="in63-head-icon">✨</div>
          <div class="in63-head-title"><h2>Proyectos con Javny</h2><p id="in63HeadSub">Crea, organiza, redacta y exporta tus documentos</p></div>
          <div class="in63-head-actions">
            <button class="in63-btn in63-hide-mobile" id="in63Import" disabled title="Próximamente">📥 Importar documento</button>
            <button class="in63-btn in63-hide-mobile" id="in63New">＋ Nuevo proyecto</button>
            <button class="in63-btn in63-hide-mobile" id="in63Save">💾 Guardar</button>
            <button class="in63-btn" id="in63Preview">👁 Vista previa</button>
            <button class="in63-btn primary" id="in63Export">Exportar ▾</button>
            <button class="in63-btn in63-close" id="in63Close" aria-label="Cerrar">×</button>
          </div>
        </div>
        <div class="in63-body" id="in63Body"></div>
        <div class="in63-dialog" id="in63Dialog"></div>
      </div>`;
      document.body.appendChild(ov);
      $('#in63Close', ov).onclick = close;
      $('#in63New', ov).onclick = () => showStart(true);
      $('#in63Save', ov).onclick = manualSave;
      $('#in63Export', ov).onclick = showExportDialog;
      $('#in63Preview', ov).onclick = showPreview;
      ov.addEventListener('click', e => { if (e.target === ov) close(); });
    }
    return ov;
  }
  async function open() { ensureOverlay().classList.add('on'); document.body.style.overflow = 'hidden'; await showStart(false); }
  function close() { const ov = $('#in63Overlay'); if (ov) ov.classList.remove('on'); document.body.style.overflow = ''; try { speechSynthesis.cancel(); } catch (e) {} }
  function setHeader(text) { const e = $('#in63HeadSub'); if (e) e.textContent = text || 'Crea, organiza, redacta y exporta tus documentos'; }
  function setStatus(text, busy = false) { const e = $('#in63Status'); if (!e) return; e.classList.toggle('busy', busy); e.innerHTML = busy ? `<span class="in63-spinner"></span>${esc(text)}` : esc(text); }

  /* ── Pantalla 1 · Proyectos ────────────────────────────────────────────── */
  function plantillaInicio() {
    return `<div class="in63-start"><div class="in63-start-grid">
      <section class="in63-card" id="in63NewCard"></section>
      <section class="in63-card">
        <div class="in63-list-head"><h3 style="margin:0;font-size:16px">Mis proyectos</h3>
          <div class="in63-filters" id="in63Filters">
            <button data-f="todos" class="on">Todos</button>
            <button data-f="borrador">Borrador</button>
            <button data-f="revision">En revisión</button>
            <button data-f="terminado">Terminados</button>
          </div>
        </div>
        <div id="in63ProjectList"></div>
      </section>
    </div></div>`;
  }

  async function showStart(focusNew) {
    currentId = null; currentSectionId = null; borradorEnCurso = null;
    setHeader('Crea, organiza, redacta y exporta tus documentos');
    $('#in63Export').style.display = 'none'; $('#in63Save').style.display = 'none';
    const pv = $('#in63Preview'); if (pv) pv.style.display = 'none';
    $('#in63Body').innerHTML = plantillaInicio();
    $('#in63Filters').onclick = e => {
      const b = e.target.closest('[data-f]'); if (!b) return;
      filtroEstado = b.dataset.f;
      $$('#in63Filters button').forEach(x => x.classList.toggle('on', x === b));
      renderProjectList();
    };
    if (!cloudChecked) await detectarUsuario();
    await migrarNubeSiHaceFalta();
    setHeader('Crea, organiza, redacta y exporta tus documentos');
    await renderNewCard();
    await renderProjectList();
    if (focusNew) setTimeout(() => $('#in63FDescripcion')?.focus(), 60);
  }

  async function renderNewCard() {
    const host = $('#in63NewCard'); if (!host) return;
    host.innerHTML = `
      <h3>Nuevo proyecto</h3>
      <p>Describe el documento. Javny propone la estructura y la revisáis antes de redactar nada.</p>
      <div class="in63-new-grid">
        <div class="in63-new-left">
          <div class="in63-field full">
            <label>Describe el documento</label>
            <div class="in63-describe-row">
              <textarea id="in63FDescripcion" placeholder="Ej.: Protocolo de traslado intrahospitalario del paciente crítico, para el comité de calidad, basado en las recomendaciones de SEMICYUC y ERC…"></textarea>
              <button class="in63-mic" id="in63DictDescripcion" title="Dictar">🎙</button>
            </div>
          </div>
          <div class="in63-create-actions">
            <button class="in63-btn primary" id="in63Proponer">Proponer estructura</button>
          </div>
          <div class="in63-hint">Tipo, idioma y el resto de ajustes se eligen en la columna de la derecha.</div>
        </div>
        <div class="in63-new-right">
          <h4>Ajustes</h4>
          <div class="in63-form-grid">
            <div class="in63-field"><label for="in63FTipo">Tipo de documento</label><select id="in63FTipo"></select></div>
            <div class="in63-field"><label for="in63FIdioma">Idioma</label><select id="in63FIdioma"><option>Castellano</option><option>Català</option><option>Bilingüe</option></select></div>
            <div class="in63-field"><label for="in63FCitacion">Normas de citación</label><select id="in63FCitacion"><option>Vancouver</option><option>APA 7ª</option><option>Harvard</option></select></div>
            <div class="in63-field"><label for="in63FExtension">Extensión objetivo</label><input id="in63FExtension" placeholder="Ej.: 12.000–15.000 palabras"></div>
            <div class="in63-field"><label for="in63FInstitucion">Institución / tutor</label><input id="in63FInstitucion" placeholder="URV · Facultad de Enfermería · Dra. …"></div>
            <div class="in63-field"><label for="in63FDestinatario">Destinatarios</label><input id="in63FDestinatario" placeholder="Tribunal, comité, equipo…"></div>
            <div class="in63-field full"><label for="in63FTono">Tono</label><select id="in63FTono"><option>Profesional</option><option>Académico</option><option>Divulgativo</option><option>Ejecutivo</option><option>Cercano</option></select></div>
          </div>
          <div class="in63-field full" style="margin-top:12px">
            <label>Fuentes que puede usar Javny</label>
            <div class="in63-srcs" id="in63Srcs">
              <div class="in63-src"><button class="in63-sw on" data-src="fichas" title="Activada"></button><div><b>Fichas de Enferix</b><small>Guías clínicas y vademécum validados</small></div></div>
              <div class="in63-src"><button class="in63-sw on" data-src="pubmed" title="Activada"></button><div><b>PubMed · Europe PMC</b><small>Literatura indexada</small></div></div>
              <div class="in63-src"><button class="in63-sw on" data-src="guias" title="Activada"></button><div><b>Guías clínicas</b><small>NICE y sociedades científicas</small></div></div>
              <div class="in63-src"><button class="in63-sw on" data-src="internet" title="Activada"></button><div><b>Internet</b><small>Organismos oficiales y sociedades científicas</small></div></div>
            </div>
            <div class="in63-hint">De momento son solo la preferencia guardada del proyecto; se usarán al redactar en una fase próxima.</div>
          </div>
        </div>
      </div>`;
    const sel = $('#in63FTipo');
    const tipos = await obtenerTipos();
    sel.innerHTML = tipos.map(t => `<option value="${esc(t.id)}">${esc(t.label)}</option>`).join('');
    $('#in63Srcs').onclick = e => { const b = e.target.closest('[data-src]'); if (!b) return; b.classList.toggle('on'); };
    $('#in63Proponer').onclick = proponerEstructura;
  }

  function leerAjustes() {
    const activo = sel => !!$(sel) && $(sel).classList.contains('on');
    return {
      descripcion: ($('#in63FDescripcion')?.value || '').trim(),
      tipo: $('#in63FTipo')?.value || 'libre',
      idioma: $('#in63FIdioma')?.value || 'Castellano',
      tono: $('#in63FTono')?.value || 'Profesional',
      destinatario: ($('#in63FDestinatario')?.value || '').trim(),
      normasCitacion: $('#in63FCitacion')?.value || 'Vancouver',
      extensionObjetivo: ($('#in63FExtension')?.value || '').trim(),
      institucionTutor: ($('#in63FInstitucion')?.value || '').trim(),
      fuentes: {
        fichas: activo('[data-src="fichas"]'),
        pubmed: activo('[data-src="pubmed"]'),
        guias: activo('[data-src="guias"]'),
        internet: activo('[data-src="internet"]')
      }
    };
  }

  async function proponerEstructura() {
    const ajustes = leerAjustes();
    if (ajustes.descripcion.length < 10) { toast('Describe el proyecto con un poco más de detalle'); return; }
    const btn = $('#in63Proponer'); const textoOriginal = btn?.textContent;
    if (btn) { btn.disabled = true; btn.textContent = 'Javny está pensando…'; }
    try {
      const r = await fetch('/api/proyectos/estructura', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ajustes)
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'No se pudo proponer la estructura.');
      borradorEnCurso = { ajustes, secciones: (data.sections || []).map(t => ({ id: crypto.randomUUID(), titulo: t })) };
      renderOutlinePanel();
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e));
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = textoOriginal; }
    }
  }

  function tituloAutomatico(descripcion) {
    let t = String(descripcion || '').split(/[.!?\n]/)[0].trim();
    if (t.length > 90) t = t.slice(0, 90).replace(/\s+\S*$/, '') + '…';
    return t || 'Proyecto sin título';
  }

  function renderOutlinePanel() {
    const card = $('#in63NewCard'); if (!card) return;
    card.innerHTML = `
      <h3>Estructura propuesta</h3>
      <p>Revisa el índice antes de crear el proyecto: añade, quita, renombra o reordena los apartados que haga falta.</p>
      <div class="in63-field full"><label>Título del documento</label><input id="in63OutlineTitulo" value="${esc(tituloAutomatico(borradorEnCurso.ajustes.descripcion))}"></div>
      <div class="in63-outline" id="in63Outline"></div>
      <div class="in63-outline-add"><input id="in63OutlineNuevo" placeholder="Añadir apartado…"><button class="in63-btn" id="in63OutlineAddBtn">＋</button></div>
      <div class="in63-outline-actions">
        <button class="in63-btn" id="in63Volver">← Volver</button>
        <button class="in63-btn primary" id="in63CrearDefinitivo">Crear proyecto</button>
      </div>`;
    renderOutlineList();
    $('#in63Volver').onclick = () => { borradorEnCurso = null; renderNewCard(); };
    $('#in63OutlineAddBtn').onclick = () => {
      const input = $('#in63OutlineNuevo'); const v = (input.value || '').trim(); if (!v) return;
      borradorEnCurso.secciones.push({ id: crypto.randomUUID(), titulo: v });
      input.value = ''; renderOutlineList();
    };
    $('#in63OutlineNuevo').onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); $('#in63OutlineAddBtn').click(); } };
    $('#in63CrearDefinitivo').onclick = crearProyectoDefinitivo;
  }

  function renderOutlineList() {
    const box = $('#in63Outline'); if (!box) return;
    box.innerHTML = borradorEnCurso.secciones.map((s, i) => `
      <div class="in63-outline-row" data-i="${i}">
        <span class="in63-outline-num">${i + 1}</span>
        <input value="${esc(s.titulo)}">
        <button class="in63-icobtn" data-up title="Subir" ${i === 0 ? 'disabled' : ''}>↑</button>
        <button class="in63-icobtn" data-down title="Bajar" ${i === borradorEnCurso.secciones.length - 1 ? 'disabled' : ''}>↓</button>
        <button class="in63-icobtn rm" data-rm title="Quitar apartado">×</button>
      </div>`).join('');
    box.oninput = e => { const row = e.target.closest('[data-i]'); if (!row) return; borradorEnCurso.secciones[+row.dataset.i].titulo = e.target.value; };
    box.onclick = e => {
      const row = e.target.closest('[data-i]'); if (!row) return;
      const i = +row.dataset.i;
      if (e.target.closest('[data-up]') && i > 0) {
        [borradorEnCurso.secciones[i - 1], borradorEnCurso.secciones[i]] = [borradorEnCurso.secciones[i], borradorEnCurso.secciones[i - 1]];
        renderOutlineList();
      } else if (e.target.closest('[data-down]') && i < borradorEnCurso.secciones.length - 1) {
        [borradorEnCurso.secciones[i + 1], borradorEnCurso.secciones[i]] = [borradorEnCurso.secciones[i], borradorEnCurso.secciones[i + 1]];
        renderOutlineList();
      } else if (e.target.closest('[data-rm]')) {
        if (borradorEnCurso.secciones.length <= 1) { toast('El proyecto debe conservar al menos un apartado'); return; }
        borradorEnCurso.secciones.splice(i, 1); renderOutlineList();
      }
    };
  }

  function construirProyectoLocal(datos) {
    const estructura = (datos.estructura || []).map((s, i) => ({ id: s.id || crypto.randomUUID(), titulo: s.titulo, orden: i, estado: 'pendiente', contenido: '' }));
    return {
      id: crypto.randomUUID(), titulo: datos.titulo, tipo: datos.tipo, descripcion: datos.descripcion || '',
      idioma: datos.idioma, tono: datos.tono, destinatario: datos.destinatario, normasCitacion: datos.normasCitacion,
      extensionObjetivo: datos.extensionObjetivo, institucionTutor: datos.institucionTutor, fuentes: datos.fuentes || {},
      estado: 'borrador', estructura, progreso: { redactados: 0, total: estructura.length },
      version: 1, creado: now(), actualizado: now(), attachments: [], versions: []
    };
  }

  async function crearProyectoDefinitivo() {
    if (!borradorEnCurso.secciones.length) { toast('Añade al menos un apartado'); return; }
    const titulo = ($('#in63OutlineTitulo')?.value || '').trim() || 'Proyecto sin título';
    const datos = { titulo, ...borradorEnCurso.ajustes, estructura: borradorEnCurso.secciones };
    const btn = $('#in63CrearDefinitivo'); if (btn) btn.disabled = true;
    try {
      let proyecto;
      if (cloudUser) {
        const r = await fetch('/api/proyectos', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'No se pudo crear el proyecto.');
        proyecto = d.proyecto;
      } else {
        proyecto = construirProyectoLocal(datos);
        const lista = cargarLocal(); lista.unshift(proyecto); guardarListaLocal(lista);
      }
      borradorEnCurso = null;
      currentId = proyecto.id; proyectoActual = proyecto;
      currentSectionId = proyecto.estructura[0]?.id || null;
      showEditor();
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e));
      if (btn) btn.disabled = false;
    }
  }

  /* ── Lista "Mis proyectos" ─────────────────────────────────────────────── */
  function subtituloDe(p) {
    const partes = [];
    if (p.destinatario) partes.push(p.destinatario);
    partes.push('v' + (p.version || 1));
    return partes.join(' · ');
  }
  function tagEstado(estado) {
    const etiquetas = { borrador: 'Borrador', revision: 'En revisión', terminado: 'Terminado' };
    return `<span class="in63-tag ${esc(estado)}">${esc(etiquetas[estado] || estado)}</span>`;
  }
  function barraProgreso(progreso) {
    const total = progreso?.total || 0, redactados = progreso?.redactados || 0;
    const pct = total ? Math.round(100 * redactados / total) : 0;
    return `<span class="in63-progress"><span class="in63-pb"><i style="width:${pct}%"></i></span><small>${redactados} / ${total}</small></span>`;
  }

  async function renderProjectList() {
    const box = $('#in63ProjectList'); if (!box) return;
    const todos = (await listaProyectos()).slice().sort((a, b) => (b.actualizado || '').localeCompare(a.actualizado || ''));
    const filtrados = filtroEstado === 'todos' ? todos : todos.filter(p => p.estado === filtroEstado);
    if (!filtrados.length) {
      box.innerHTML = `<div class="in63-empty">${todos.length ? 'Ningún proyecto en este estado.' : 'Todavía no hay proyectos. Descríbelo arriba y pulsa «Proponer estructura».'}</div>`;
      return;
    }
    box.innerHTML = `<div class="in63-table-wrap"><table class="in63-table">
      <thead><tr><th>Documento</th><th>Tipo</th><th>Estado</th><th>Progreso</th><th>Última edición</th><th></th></tr></thead>
      <tbody>${filtrados.map(p => `<tr>
        <td><div class="in63-doc-name" title="${esc(p.titulo)}">${esc(p.titulo)}</div><div class="in63-doc-sub">${esc(subtituloDe(p))}</div></td>
        <td>${esc(etiquetaTipo(p.tipo))}</td>
        <td>${tagEstado(p.estado)}</td>
        <td>${barraProgreso(p.progreso)}</td>
        <td>${fmt(p.actualizado)}</td>
        <td class="r"><button class="in63-btn" data-abrir="${esc(p.id)}">Abrir</button><button class="in63-row-del" data-borrar="${esc(p.id)}" title="Eliminar">🗑</button></td>
      </tr>`).join('')}</tbody>
    </table></div>`;
    box.onclick = e => {
      const del = e.target.closest('[data-borrar]'); if (del) { e.stopPropagation(); eliminarProyecto(del.dataset.borrar); return; }
      const abrir = e.target.closest('[data-abrir]'); if (abrir) openProject(abrir.dataset.abrir);
    };
  }

  async function eliminarProyecto(id) {
    const p = (await listaProyectos()).find(x => x.id === id); if (!p) return;
    if (!confirm('¿Eliminar el proyecto "' + p.titulo + '"?')) return;
    if (cloudUser) { try { await fetch('/api/proyectos/' + id, { method: 'DELETE', credentials: 'include' }); } catch (e) {} }
    else borrarLocal(id);
    renderProjectList();
    toast('Proyecto eliminado');
  }

  async function openProject(id) {
    let proyecto = null;
    if (cloudUser) {
      try { const r = await fetch('/api/proyectos/' + id, { credentials: 'include' }); if (r.ok) { const d = await r.json(); proyecto = d.proyecto; } } catch (e) {}
    }
    if (!proyecto) proyecto = cargarLocal().find(p => p.id === id) || null;
    if (!proyecto) { toast('No se pudo abrir el proyecto'); return; }
    proyectoActual = proyecto; currentId = id;
    currentSectionId = proyecto.estructura?.[0]?.id || null;
    showEditor();
  }

  /* ── Persistencia del proyecto abierto ─────────────────────────────────── */
  function getProject() { return proyectoActual; }
  function setProject(project) {
    project.actualizado = now();
    proyectoActual = project;
    guardarProyecto(project); // en segundo plano: la UI no espera a la red
    return project;
  }
  async function guardarProyecto(project) {
    if (cloudUser) {
      try {
        const r = await fetch('/api/proyectos/' + project.id, {
          method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(paraGuardar(project))
        });
        if (r.ok) { const d = await r.json(); Object.assign(project, d.proyecto); return; }
      } catch (e) {}
      // Sin red o con el servidor caído, no se pierde el cambio: cae al
      // localStorage de esta sesión como red de seguridad.
    }
    guardarLocal(project);
  }

  /* ── IA del editor (deuda técnica): Gemini directo desde el navegador ─────
     Ver la cabecera del archivo. Se mantiene igual que antes, solo con los
     nombres de campo nuevos (titulo/estructura/contenido en vez de
     title/sections/content). */
  function getApiKey() { return localStorage.getItem('guiaHJ23_apikey') || localStorage.getItem('inurse_gemini_api_key_v1') || localStorage.getItem('in51_gemini_key') || localStorage.getItem('inurse52_gemini_api_key') || ''; }
  function apiModel() { try { return (window.EnferixV52 && window.EnferixV52.config && window.EnferixV52.config().model) || 'gemini-3.5-flash'; } catch (e) { return 'gemini-3.5-flash'; } }
  async function callAI(prompt, opts = {}) {
    const key = getApiKey(); if (!key) throw new Error('Falta la API Key de Gemini. Ábrela desde los ajustes de Javny.');
    const parts = [{ text: prompt }];
    const files = SESSION_FILES.get(currentId) || [];
    files.slice(0, 3).forEach(f => { if (f.text) parts.push({ text: '\nDOCUMENTO ADJUNTO: ' + f.name + '\n' + f.text.slice(0, 30000) }); else if (f.data) parts.push({ inlineData: { mimeType: f.type, data: f.data } }); });
    const body = { contents: [{ parts }], generationConfig: { temperature: opts.temperature ?? 0.35, topP: .9, maxOutputTokens: opts.maxTokens || 5000 } };
    if (opts.json) body.generationConfig.responseMimeType = 'application/json';
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(apiModel()) + ':generateContent?key=' + encodeURIComponent(key);
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }), data = await r.json();
    if (!r.ok) throw new Error(data?.error?.message || ('Error ' + r.status));
    return (data?.candidates?.[0]?.content?.parts || []).map(x => x.text || '').join('\n').trim();
  }
  function projectContext(p) { return `TÍTULO: ${p.titulo}\nTIPO: ${etiquetaTipo(p.tipo)}\nDESCRIPCIÓN: ${p.descripcion || 'No indicada'}\nDESTINATARIOS: ${p.destinatario || 'No indicados'}\nIDIOMA: ${p.idioma}\nTONO: ${p.tono}\nEXTENSIÓN: ${p.extensionObjetivo || 'No indicada'}\nÍNDICE: ${p.estructura.map((s, i) => `${i + 1}. ${s.titulo}`).join('\n')}`; }
  function backendBaseP() { return (localStorage.getItem('inurse_v20_backend_url') || '').trim().replace(/\/$/, '') || location.origin; }
  function buildEvidenceBlock(external, internal) {
    let s = '';
    if (internal) s += `\n\n[BIBLIOTECA INTERNA Enferix — fichas y vademécum propios]\n${internal}`;
    if (external && external.length) {
      s += `\n\n[EVIDENCIA EXTERNA DISPONIBLE — PubMed, Crossref, NICE. Fundamenta y CITA estas fuentes como [E1], [E2]…; no inventes otras referencias]\n` +
        external.map((e, i) => `[E${i + 1}] ${e.title} (${e.source}${e.year ? ', ' + e.year : ''})${e.authors ? ' — ' + e.authors : ''}${e.url ? ' — ' + e.url : ''}`).join('\n');
    }
    return s;
  }
  function evidenceBlock(p) { return buildEvidenceBlock(p.evidence, p.evidenceInternal); }
  async function fetchEvidence(query, litN = 5, niceN = 3) {
    const q = encodeURIComponent(String(query || '').slice(0, 180));
    const external = [];
    try {
      const [lit, nice] = await Promise.all([
        fetch(backendBaseP() + '/api/literature/search?q=' + q + '&limit=' + litN).then(r => r.json()).catch(() => ({ items: [] })),
        fetch(backendBaseP() + '/api/nice/search?q=' + q + '&limit=' + niceN).then(r => r.json()).catch(() => ({ items: [] }))
      ]);
      (lit.items || []).forEach(a => external.push({ source: a.source || 'PubMed', title: a.title, authors: Array.isArray(a.authors) ? a.authors.slice(0, 3).join(', ') : (a.authors || ''), year: a.year || '', url: a.url || (a.doi ? 'https://doi.org/' + a.doi : ''), summary: (a.abstract || a.summary || '').slice(0, 300) }));
      (nice.items || []).forEach(g => external.push({ source: 'NICE', title: g.title, year: g.date || '', url: g.url || '', summary: (g.summary || '').slice(0, 300) }));
    } catch (e) {}
    let internal = '';
    try { if (typeof window.EnferixLibraryRetrieve === 'function') { const ctx = window.EnferixLibraryRetrieve(String(query || ''), 6) || ''; if (ctx) internal = String(ctx).slice(0, 3500); } } catch (e) {}
    return { external, internal };
  }
  function basePromptEv(p, evStr) { return `Eres Javny Proyectos, una asistente experta en organizar, redactar y revisar proyectos profesionales, sanitarios, docentes y de investigación, con el máximo nivel de excelencia. Responde con lenguaje claro, riguroso y bien estructurado. Adapta la redacción al idioma, tono, destinatarios y extensión solicitados. Cuando dispongas de EVIDENCIA o BIBLIOTECA INTERNA más abajo, fundaméntate en ellas y cítalas; no inventes datos, resultados, normas ni referencias bibliográficas. Cuando falte información, usa marcadores claros como [PENDIENTE DE COMPLETAR] o formula una propuesta que el usuario pueda validar. No uses bloques de código ni expliques tu proceso interno.\n\n${projectContext(p)}${evStr != null ? evStr : evidenceBlock(p)}`; }
  function basePrompt(p) { return basePromptEv(p); }

  async function aiEvidence() {
    let p = readEditor() || getProject(); if (!p) return;
    setStatus('Buscando evidencia en PubMed, NICE y biblioteca interna…', true);
    try {
      const { external, internal } = await fetchEvidence(p.titulo + ' ' + (p.descripcion || ''));
      p.evidence = external; p.evidenceInternal = internal; setProject(p);
      setStatus(`Evidencia lista: ${external.length} fuente(s) externas${internal ? ' + biblioteca interna' : ''}`);
      toast('Evidencia añadida al contexto de Javny');
    } catch (e) { setStatus('No se pudo buscar evidencia: ' + e.message); }
  }

  async function aiOutline() {
    let p = readEditor() || getProject(); if (!p) return;
    setStatus('Javny está reorganizando el índice…', true);
    try {
      snapshot(p, 'Antes de reorganizar el índice');
      const prompt = basePrompt(p) + `\n\nCrea un índice profesional y lógico para este proyecto. Conserva los apartados necesarios y adapta la estructura al objetivo. Devuelve exclusivamente JSON válido con esta forma: {"sections":["Título 1","Título 2"]}. Entre 7 y 18 apartados.`;
      let txt = await callAI(prompt, { json: true, maxTokens: 1600, temperature: .2 }), obj = JSON.parse(txt);
      if (!Array.isArray(obj.sections) || !obj.sections.length) throw new Error('Respuesta de índice no válida');
      const antiguo = new Map(p.estructura.map(s => [s.titulo.toLowerCase(), s.contenido]));
      p.estructura = obj.sections.map((t, i) => { const titulo = String(t).trim(); const contenido = antiguo.get(titulo.toLowerCase()) || ''; return { id: crypto.randomUUID(), titulo, orden: i, estado: contenido.trim() ? 'redactado' : 'pendiente', contenido }; });
      currentSectionId = p.estructura[0].id; setProject(p); showEditor();
      setStatus('Índice reorganizado por Javny'); toast('Índice creado');
    } catch (e) { setStatus('No se pudo crear el índice: ' + e.message); toast(e.message); }
  }

  async function aiSection(action) {
    let p = readEditor(); if (!p) return;
    const s = p.estructura.find(x => x.id === currentSectionId); if (!s) return;
    const custom = $('#in63CustomPrompt')?.value.trim();
    const instructions = {
      develop: 'Redacta por completo este apartado con contenido útil, coherente y listo para incorporar al documento.',
      improve: 'Mejora la redacción, la claridad, la coherencia y el nivel profesional del texto sin cambiar su significado ni inventar datos.',
      expand: 'Amplía el contenido con explicaciones, propuestas prácticas, ejemplos y conexiones con el resto del proyecto. Mantén cualquier dato existente.',
      shorten: 'Resume y depura el contenido, conservando todas las ideas importantes y una estructura profesional.',
      bibliography: 'Propón una sección de bibliografía y fuentes que deberían consultarse. Prioriza y cita las fuentes de EVIDENCIA proporcionadas; para las demás usa [VERIFICAR REFERENCIA]. No inventes referencias concretas.',
      custom: custom || 'Mejora este apartado de forma profesional.'
    };
    if (action !== 'develop' && !s.contenido.trim()) { toast('Este apartado está vacío; usa "Desarrollar"'); return; }
    setStatus('Javny está trabajando en "' + s.titulo + '"…', true);
    try {
      const prompt = basePrompt(p) + `\n\nAPARTADO ACTUAL: "${s.titulo}"\nCONTENIDO ACTUAL: ${s.contenido || '[VACÍO]'}\n\nTAREA: ${instructions[action] || instructions.custom}\n\nDevuelve SOLO el texto final de este apartado, sin repetir el título ni añadir comentarios.`;
      const texto = await callAI(prompt, { maxTokens: 3200, temperature: action === 'develop' ? .35 : .3 });
      snapshot(p, 'Antes de "' + (action === 'custom' ? custom : action) + '" en ' + s.titulo);
      s.contenido = texto; s.estado = texto.trim() ? 'redactado' : 'pendiente';
      if (action === 'custom' && $('#in63CustomPrompt')) $('#in63CustomPrompt').value = '';
      setProject(p); showEditor();
      setStatus('Apartado actualizado'); toast('Apartado actualizado');
    } catch (e) { setStatus('Error: ' + e.message); toast(e.message); }
  }

  async function aiDraftAll() {
    let p = readEditor(); if (!p) return;
    if (!confirm('Javny redactará un borrador completo y conservará una versión anterior. ¿Continuar?')) return;
    setStatus('Javny está creando el borrador completo…', true);
    try {
      snapshot(p, 'Antes del borrador completo');
      const markers = p.estructura.map(s => `[[SECTION:${s.titulo}]]`).join('\n');
      const prompt = basePrompt(p) + `\n\nRedacta un borrador completo del proyecto siguiendo exactamente el índice. Usa estos marcadores, sin cambiarlos, antes de cada apartado:\n${markers}\n\nTras cada marcador escribe el contenido correspondiente. No añadas texto fuera de los apartados. Mantén [PENDIENTE DE COMPLETAR] para datos que el usuario no haya aportado.`;
      const out = await callAI(prompt, { maxTokens: 12000, temperature: .3 });
      let changed = 0;
      p.estructura.forEach((s, i) => {
        const marker = '[[SECTION:' + s.titulo + ']]'; const start = out.indexOf(marker); if (start < 0) return;
        let end = out.length;
        for (let j = 0; j < p.estructura.length; j++) { if (j === i) continue; const pos = out.indexOf('[[SECTION:' + p.estructura[j].titulo + ']]', start + marker.length); if (pos >= 0 && pos < end) end = pos; }
        const txt = out.slice(start + marker.length, end).trim();
        if (txt) { s.contenido = txt; s.estado = 'redactado'; changed++; }
      });
      if (!changed) { p.estructura[0].contenido = out; p.estructura[0].estado = 'redactado'; changed = 1; }
      setProject(p); showEditor();
      setStatus('Borrador generado: ' + changed + ' apartados actualizados'); toast('Borrador completo creado');
    } catch (e) { setStatus('Error: ' + e.message); toast(e.message); }
  }

  async function aiExcellence() {
    let p = readEditor(); if (!p) return;
    const written = p.estructura.filter(s => s.contenido && s.contenido.trim());
    if (!written.length) { toast('Primero desarrolla o redacta algún apartado'); return; }
    if (!confirm('Javny revisará y elevará TODO el proyecto a máxima excelencia (coherencia entre apartados, tono uniforme, citas y nivel profesional), conservando una versión anterior. ¿Continuar?')) return;
    setStatus('Javny está elevando el proyecto a excelencia…', true);
    try {
      snapshot(p, 'Antes de elevar a excelencia');
      const markers = p.estructura.map(s => `[[SECTION:${s.titulo}]]`).join('\n');
      const current = p.estructura.map(s => `[[SECTION:${s.titulo}]]\n${s.contenido || '[VACÍO]'}`).join('\n\n');
      const prompt = basePrompt(p) + `\n\nREVISA Y ELEVA A MÁXIMA EXCELENCIA todo el proyecto siguiente. Objetivos: coherencia y transiciones fluidas entre apartados, terminología y tono uniformes, eliminar repeticiones, máximo rigor y precisión, y aprovechar la EVIDENCIA/BIBLIOTECA para fundamentar y citar donde proceda. Conserva los datos aportados por el usuario y los marcadores [PENDIENTE DE COMPLETAR]; no inventes datos ni referencias. Mantén exactamente los mismos apartados y marcadores.\n\nCONTENIDO ACTUAL:\n${current}\n\nDevuelve el proyecto completo usando EXACTAMENTE estos marcadores antes de cada apartado, sin texto fuera de ellos:\n${markers}`;
      const out = await callAI(prompt, { maxTokens: 14000, temperature: .25 });
      let changed = 0;
      p.estructura.forEach((s, i) => {
        const marker = '[[SECTION:' + s.titulo + ']]'; const start = out.indexOf(marker); if (start < 0) return;
        let end = out.length;
        for (let j = 0; j < p.estructura.length; j++) { if (j === i) continue; const pos = out.indexOf('[[SECTION:' + p.estructura[j].titulo + ']]', start + marker.length); if (pos >= 0 && pos < end) end = pos; }
        const txt = out.slice(start + marker.length, end).trim();
        if (txt) { s.contenido = txt; s.estado = 'redactado'; changed++; }
      });
      setProject(p); showEditor();
      setStatus('Proyecto elevado a excelencia: ' + changed + ' apartados pulidos'); toast('Proyecto elevado a excelencia');
    } catch (e) { setStatus('Error: ' + e.message); toast(e.message); }
  }

  /* ── Editor de apartados (pantalla 2) — sin rediseñar en esta fase ────────── */
  function stripH(h) { return (h || '').replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim(); }
  function readEditor() {
    const p = getProject(); if (!p) return null;
    const tituloEl = $('#in63ProjectTitle'); if (tituloEl) p.titulo = tituloEl.value.trim() || 'Proyecto sin título';
    const sec = p.estructura.find(s => s.id === currentSectionId);
    if (sec) {
      const st = $('#in63SectionTitle'), tx = $('#in63SectionText');
      if (st) sec.titulo = st.value.trim() || 'Apartado';
      if (tx) { sec.contenido = tx.value; sec.estado = sec.contenido.trim() ? 'redactado' : 'pendiente'; }
    }
    return p;
  }
  function manualSave() { const p = readEditor(); if (!p) { toast('No hay proyecto abierto'); return; } setProject(p); setStatus('Proyecto guardado · ' + fmt(p.actualizado)); toast('Proyecto guardado'); }
  function scheduleSave() { clearTimeout(saveTimer); saveTimer = setTimeout(() => { const p = readEditor(); if (p) { setProject(p); setStatus('Guardado automáticamente'); } }, 450); }
  function iconType(t) { return ({ mejora: '📈', procedimiento: '📋', cuidados: '🩺', sesion: '🎓', investigacion: '🔬', tfg: '🎓', tfm: '🎓', revision: '📚', evento_adverso: '⚠️', protocolo: '📋', libre: '📝' })[t] || '📝'; }

  function showEditor() {
    const p = getProject(); if (!p) { showStart(); return; }
    if (!currentSectionId && p.estructura.length) currentSectionId = p.estructura[0].id;
    $('#in63Export').style.display = ''; $('#in63Save').style.display = '';
    const pv2 = $('#in63Preview'); if (pv2) pv2.style.display = '';
    setHeader(p.titulo + ' · ' + p.estructura.length + ' apartados');
    const body = $('#in63Body');
    body.innerHTML = `<div class="in63-editor"><aside class="in63-side"><div class="in63-side-top"><input class="in63-project-title-input" id="in63ProjectTitle" value="${esc(p.titulo)}"><div class="in63-project-sub">${iconType(p.tipo)} ${esc(etiquetaTipo(p.tipo))} · ${esc(p.idioma)} · ${esc(p.destinatario || 'Sin destinatario definido')}</div><div class="in63-side-tools"><button class="in63-btn" id="in63Evidence">🔬 Buscar evidencia</button><button class="in63-btn" id="in63OutlineAI">✨ Reorganizar índice</button><button class="in63-btn" id="in63DraftAll">🪄 Borrador completo</button><button class="in63-btn" id="in63Excellence">⭐ Elevar a excelencia</button><button class="in63-btn" id="in63Files">📎 Fuentes</button><button class="in63-btn" id="in63Versions">🕘 Versiones</button></div><input type="file" id="in63FileInput" accept=".txt,.md,.html,.csv,.json,.pdf,image/*" multiple hidden><div class="in63-attach-list" id="in63AttachList"></div></div><div class="in63-sections" id="in63Sections"></div><div class="in63-side-foot"><button class="in63-btn" id="in63AddSection">＋ Apartado</button><button class="in63-btn danger" id="in63DeleteSection">Eliminar</button></div></aside><div class="in63-work"><div class="in63-work-toolbar"><button class="in63-btn primary" data-ai="develop">✨ Desarrollar</button><button class="in63-btn" data-ai="improve">Mejorar</button><button class="in63-btn" data-ai="expand">Ampliar</button><button class="in63-btn" data-ai="shorten">Resumir</button><button class="in63-btn" data-ai="bibliography">Bibliografía</button><select class="in63-select" id="in63Insert"><option value="">＋ Insertar bloque…</option><option value="dafo">Matriz DAFO</option><option value="came">Matriz CAME</option><option value="kpi">Tabla de KPI</option><option value="cronograma">Cronograma</option><option value="slides">Esquema de diapositivas</option><option value="script">Guion oral</option></select><button class="in63-btn" id="in63AskJavny">💬 Hablar con Javny</button><button class="in63-btn" id="in63Read">🔊 Leer</button></div><div class="in63-work-main"><input class="in63-section-title-input" id="in63SectionTitle"><textarea class="in63-section-text" id="in63SectionText" placeholder="Escribe aquí o pide a Javny que desarrolle este apartado…"></textarea><div class="in63-custom"><textarea id="in63CustomPrompt" placeholder="Pide un cambio concreto: añade ejemplos, adapta al tribunal, conviértelo en catalán, crea una tabla…"></textarea><button class="in63-btn cyan" id="in63CustomSend">Enviar a Javny</button></div></div><div class="in63-status" id="in63Status">Guardado local automático activado.</div></div></div>`;
    bindEditor(); renderSections(); renderAttachments(); selectSection(currentSectionId);
  }

  function mdLite(t) { return esc(t || '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/^\s*#{1,3}\s*(.+)$/gm, '<strong>$1</strong>').replace(/^\s*[-•*]\s+(.+)$/gm, '&nbsp;&nbsp;• $1').replace(/\n{2,}/g, '<br><br>').replace(/\n/g, '<br>'); }
  function showPreview() {
    const p = readEditor() || getProject(); if (!p) { showStart(); return; }
    setProject(p); setHeader(p.titulo + ' · vista previa');
    const done = p.estructura.filter(s => s.contenido && s.contenido.trim()).length;
    const body = $('#in63Body');
    body.innerHTML = `<div class="in63-preview"><div class="in63-preview-bar"><button class="in63-btn" id="in63PrevBack">← Volver al editor</button><span class="in63-preview-meta">${done}/${p.estructura.length} apartados redactados</span><button class="in63-btn primary" id="in63PrevExport">Exportar ▾</button></div><div class="in63-preview-scroll"><article class="in63-preview-doc"><h1>${esc(p.titulo)}</h1><div class="in63-preview-sub">${iconType(p.tipo)} ${esc(etiquetaTipo(p.tipo))} · ${esc(p.idioma)}${p.destinatario ? ' · ' + esc(p.destinatario) : ''}</div>${p.estructura.map((s, i) => `<section class="in63-preview-sec"><h2><span class="in63-preview-num">${i + 1}</span>${esc(s.titulo)}</h2>${s.contenido && s.contenido.trim() ? `<div class="in63-preview-text">${mdLite(s.contenido)}</div>` : '<div class="in63-preview-empty">— Apartado aún sin redactar —</div>'}</section>`).join('')}</article></div></div>`;
    $('#in63PrevBack').onclick = () => showEditor(); $('#in63PrevExport').onclick = showExportDialog;
  }

  function bindEditor() {
    $('#in63ProjectTitle').addEventListener('input', () => { setHeader($('#in63ProjectTitle').value); scheduleSave(); });
    $('#in63SectionTitle').addEventListener('input', () => { scheduleSave(); const p = readEditor(); if (p) renderSections(false); });
    $('#in63SectionText').addEventListener('input', scheduleSave);
    $('#in63Sections').onclick = e => { const row = e.target.closest('[data-sec]'); if (row) { const p = readEditor(); if (p) setProject(p); selectSection(row.dataset.sec); } };
    $$('.in63-work-toolbar [data-ai]').forEach(b => b.onclick = () => aiSection(b.dataset.ai));
    $('#in63Evidence').onclick = aiEvidence; $('#in63OutlineAI').onclick = aiOutline; $('#in63DraftAll').onclick = aiDraftAll; $('#in63Excellence').onclick = aiExcellence;
    $('#in63Files').onclick = () => $('#in63FileInput').click(); $('#in63FileInput').onchange = e => attachFiles(e.target.files);
    $('#in63Versions').onclick = showVersions; $('#in63AddSection').onclick = addSection; $('#in63DeleteSection').onclick = deleteSection;
    $('#in63CustomSend').onclick = () => aiSection('custom'); $('#in63AskJavny').onclick = openInJavny; $('#in63Read').onclick = readSection;
    $('#in63Insert').onchange = e => { if (e.target.value) { insertBlock(e.target.value); e.target.value = ''; } };
  }
  function renderSections(select = true) {
    const p = getProject(); if (!p) return; const box = $('#in63Sections'); if (!box) return;
    box.innerHTML = p.estructura.map((s, i) => `<div class="in63-section-row ${s.id === currentSectionId ? 'active' : ''}" data-sec="${esc(s.id)}"><span class="in63-section-num">${i + 1}</span><span class="in63-section-name">${esc(s.titulo)}</span>${s.contenido?.trim() ? '<span class="in63-section-done">●</span>' : ''}</div>`).join('');
    if (select) selectSection(currentSectionId);
  }
  function selectSection(id) {
    const p = getProject(); if (!p) return; const s = p.estructura.find(x => x.id === id) || p.estructura[0]; if (!s) return;
    currentSectionId = s.id;
    $$('.in63-section-row').forEach(r => r.classList.toggle('active', r.dataset.sec === s.id));
    $('#in63SectionTitle').value = s.titulo; $('#in63SectionText').value = s.contenido || '';
    setStatus('Apartado ' + (p.estructura.indexOf(s) + 1) + ' de ' + p.estructura.length + ' · guardado automático');
  }
  function addSection() {
    const p = readEditor(); if (!p) return;
    const s = { id: crypto.randomUUID(), titulo: 'Nuevo apartado', orden: p.estructura.length, estado: 'pendiente', contenido: '' };
    const idx = Math.max(0, p.estructura.findIndex(x => x.id === currentSectionId));
    p.estructura.splice(idx + 1, 0, s); setProject(p); currentSectionId = s.id; renderSections(); selectSection(s.id); $('#in63SectionTitle').select();
  }
  function deleteSection() {
    const p = readEditor(); if (!p || p.estructura.length <= 1) { toast('El proyecto debe conservar al menos un apartado'); return; }
    const s = p.estructura.find(x => x.id === currentSectionId); if (!s || !confirm('¿Eliminar el apartado "' + s.titulo + '"?')) return;
    const idx = p.estructura.indexOf(s); snapshot(p, 'Antes de eliminar ' + s.titulo);
    p.estructura.splice(idx, 1); currentSectionId = p.estructura[Math.min(idx, p.estructura.length - 1)].id;
    setProject(p); showEditor();
  }
  function insertBlock(kind) {
    const p = readEditor(); if (!p) return;
    const blocks = {
      dafo: { titulo: 'Matriz DAFO', contenido: 'FORTALEZAS\n• \n\nDEBILIDADES\n• \n\nOPORTUNIDADES\n• \n\nAMENAZAS\n• ' },
      came: { titulo: 'Matriz CAME', contenido: 'CORREGIR DEBILIDADES\n• \n\nAFRONTAR AMENAZAS\n• \n\nMANTENER FORTALEZAS\n• \n\nEXPLOTAR OPORTUNIDADES\n• ' },
      kpi: { titulo: 'Indicadores KPI', contenido: 'Indicador | Definición | Fórmula | Fuente | Frecuencia | Meta | Responsable\n--- | --- | --- | --- | --- | --- | ---\n[PENDIENTE] |  |  |  |  |  | ' },
      cronograma: { titulo: 'Cronograma', contenido: 'Actividad | Responsable | Inicio | Fin | Entregable | Estado\n--- | --- | --- | --- | --- | ---\n[PENDIENTE] |  |  |  |  | ' },
      slides: { titulo: 'Esquema de diapositivas', contenido: '1. Portada\n2. Problema u oportunidad\n3. Justificación\n4. Objetivos\n5. Propuesta\n6. Plan de implantación\n7. Indicadores\n8. Conclusiones' },
      script: { titulo: 'Guion oral', contenido: 'APERTURA\n\nDESARROLLO\n\nMENSAJES CLAVE\n\nCIERRE\n\nPREGUNTAS PREVISIBLES' }
    };
    const b = blocks[kind]; if (!b) return;
    const s = { id: crypto.randomUUID(), titulo: b.titulo, orden: p.estructura.length, estado: 'redactado', contenido: b.contenido };
    p.estructura.push(s); setProject(p); currentSectionId = s.id; renderSections(); selectSection(s.id); toast('Bloque añadido');
  }

  // Sólo local: no hay columna `versions` en la tabla proyectos (fuera de
  // alcance de esta fase, ver cabecera). Se conserva mientras el proyecto no
  // pase por el servidor; al guardar en la nube, paraGuardar() la descarta sin
  // fallar.
  function snapshot(p, label) {
    p.versions = p.versions || [];
    p.versions.unshift({ id: crypto.randomUUID(), date: now(), label: label || 'Versión guardada', titulo: p.titulo, estructura: p.estructura.map(s => ({ id: s.id, titulo: s.titulo, contenido: s.contenido })) });
    p.versions = p.versions.slice(0, 12);
  }
  function showVersions() {
    const p = readEditor(); if (!p) return; setProject(p);
    const d = $('#in63Dialog');
    d.innerHTML = `<div class="in63-dialog-card"><h3>Versiones del proyecto</h3>${p.versions?.length ? p.versions.map(v => `<div class="in63-version"><span><b>${esc(v.label)}</b><small>${fmt(v.date)}</small></span><button class="in63-btn" data-restore="${esc(v.id)}">Restaurar</button></div>`).join('') : '<div class="in63-empty">Todavía no hay versiones anteriores. Se crean antes de cambios realizados por Javny.</div>'}<div class="in63-dialog-actions"><button class="in63-btn" data-close-dialog>Cerrar</button></div></div>`;
    d.classList.add('on');
    d.onclick = e => { if (e.target === d || e.target.closest('[data-close-dialog]')) d.classList.remove('on'); const b = e.target.closest('[data-restore]'); if (b) restoreVersion(b.dataset.restore); };
  }
  function restoreVersion(id) {
    const p = getProject(), v = p?.versions?.find(x => x.id === id); if (!p || !v) return;
    snapshot(p, 'Antes de restaurar ' + v.label);
    p.titulo = v.titulo; p.estructura = v.estructura.map(s => ({ ...s, orden: 0, estado: s.contenido?.trim() ? 'redactado' : 'pendiente' })).map((s, i) => ({ ...s, orden: i }));
    currentSectionId = p.estructura[0]?.id;
    setProject(p); $('#in63Dialog').classList.remove('on'); showEditor(); toast('Versión restaurada');
  }

  function documentHTML(p) {
    const meta = `<p><b>Tipo:</b> ${esc(etiquetaTipo(p.tipo))} &nbsp; <b>Idioma:</b> ${esc(p.idioma)} &nbsp; <b>Destinatarios:</b> ${esc(p.destinatario || 'No indicados')}</p>${p.descripcion ? `<p><b>Descripción:</b> ${esc(p.descripcion)}</p>` : ''}`;
    const toc = '<h2>Índice</h2><ol>' + p.estructura.map(s => '<li>' + esc(s.titulo) + '</li>').join('') + '</ol>';
    const sections = p.estructura.map((s, i) => `<section><h2>${i + 1}. ${esc(s.titulo)}</h2>${esc(s.contenido || '[PENDIENTE DE COMPLETAR]').replace(/\n/g, '<br>')}</section>`).join('');
    return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(p.titulo)}</title><style>@page{margin:2.2cm}body{font-family:Arial,sans-serif;color:#111827;line-height:1.55;font-size:11pt}h1{font-size:24pt;margin:0 0 24px;color:#172554}h2{font-size:15pt;margin:24px 0 10px;color:#1e3a8a;page-break-after:avoid}section{page-break-inside:auto}p{margin:7px 0}ol{line-height:1.7}.cover{min-height:70vh;display:flex;flex-direction:column;justify-content:center;border-left:12px solid #1f8a7c;padding-left:28px;margin-bottom:50px}.cover small{color:#64748b}.footer{margin-top:35px;border-top:1px solid #cbd5e1;padding-top:8px;color:#64748b;font-size:9pt}</style></head><body><div class="cover"><h1>${esc(p.titulo)}</h1>${meta}<small>Documento creado con Enferix · Proyectos con Javny</small></div>${toc}${sections}<div class="footer">Generado el ${new Date().toLocaleDateString('es-ES')}. Revisar datos, referencias y requisitos antes de su uso o presentación.</div></body></html>`;
  }
  function downloadBlob(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1200); }
  function exportWord() { const p = readEditor(); if (!p) return; setProject(p); const html = '﻿' + documentHTML(p); downloadBlob(new Blob([html], { type: 'application/msword;charset=utf-8' }), cleanName(p.titulo) + '.doc'); toast('Documento Word creado'); }
  function exportPDF() { const p = readEditor(); if (!p) return; setProject(p); const w = window.open('', '_blank'); if (!w) { toast('Permite ventanas emergentes para crear el PDF'); return; } w.document.open(); w.document.write(documentHTML(p)); w.document.close(); setTimeout(() => { w.focus(); w.print(); }, 500); }
  function exportText() { const p = readEditor(); if (!p) return; const txt = p.titulo + '\n' + '='.repeat(p.titulo.length) + '\n\n' + p.estructura.map((s, i) => `${i + 1}. ${s.titulo}\n\n${s.contenido || '[PENDIENTE DE COMPLETAR]'}`).join('\n\n'); downloadBlob(new Blob([txt], { type: 'text/plain;charset=utf-8' }), cleanName(p.titulo) + '.txt'); }
  function shareProject() { const p = readEditor(); if (!p) return; const txt = p.titulo + '\n\n' + p.estructura.map(s => s.titulo + '\n' + (s.contenido || '')).join('\n\n'); if (navigator.share) navigator.share({ title: p.titulo, text: txt.slice(0, 45000) }).catch(() => {}); else navigator.clipboard?.writeText(txt).then(() => toast('Proyecto copiado')); }
  function showExportDialog() {
    const p = readEditor(); if (!p) { toast('Abre un proyecto primero'); return; } setProject(p);
    const d = $('#in63Dialog');
    d.innerHTML = `<div class="in63-dialog-card"><h3>Exportar "${esc(p.titulo)}"</h3><p style="color:#8aa0c8;font-size:12px;line-height:1.5">Word crea un archivo .doc compatible con Microsoft Word. PDF abre una versión preparada para imprimir y guardar como PDF.</p><div class="in63-dialog-actions" style="justify-content:flex-start"><button class="in63-btn primary" data-exp="word">📘 Crear Word</button><button class="in63-btn cyan" data-exp="pdf">📄 Crear PDF</button><button class="in63-btn" data-exp="text">📝 Texto</button><button class="in63-btn" data-exp="share">📤 Compartir</button><button class="in63-btn" data-close-dialog>Cerrar</button></div></div>`;
    d.classList.add('on');
    d.onclick = e => { if (e.target === d || e.target.closest('[data-close-dialog]')) { d.classList.remove('on'); return; } const b = e.target.closest('[data-exp]'); if (!b) return; d.classList.remove('on'); if (b.dataset.exp === 'word') exportWord(); if (b.dataset.exp === 'pdf') exportPDF(); if (b.dataset.exp === 'text') exportText(); if (b.dataset.exp === 'share') shareProject(); };
  }

  function openInJavny() {
    const p = readEditor(); if (!p) return; setProject(p);
    const s = p.estructura.find(x => x.id === currentSectionId);
    const text = `Estoy trabajando en este proyecto y quiero que me ayudes como asistente de redacción y organización.\n\nPROYECTO: ${p.titulo}\nAPARTADO ACTUAL: ${s?.titulo || ''}\nCONTENIDO ACTUAL:\n${s?.contenido || '[VACÍO]'}\n\n¿Qué quieres que haga?`;
    close();
    try { if (typeof window.openJavnyWithContext === 'function') { window.openJavnyWithContext(text); return; } } catch (e) {}
    const fab = document.querySelector('.fab,#javnyBtn,[data-javny]'); if (fab) fab.click();
    setTimeout(() => { const q = document.querySelector('#qinput,.qinput,textarea[placeholder*="Javny"],textarea[placeholder*="Pregunta"]'); if (q) { q.value = text; q.dispatchEvent(new Event('input', { bubbles: true })); q.focus(); } }, 300);
  }
  function readSection() {
    const p = readEditor(); if (!p) return;
    const s = p.estructura.find(x => x.id === currentSectionId), text = (s?.titulo || '') + '. ' + (s?.contenido || '');
    if (!s?.contenido?.trim()) { toast('El apartado está vacío'); return; }
    try { if (typeof window.speak === 'function') { window.speak(text, $('#in63Read')); return; } } catch (e) {}
    if (!speechSynthesis) { toast('Lectura no disponible'); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = p.idioma === 'Català' ? 'ca-ES' : p.idioma === 'English' ? 'en-US' : 'es-ES';
    speechSynthesis.speak(u);
  }

  async function attachFiles(fileList) {
    const arr = SESSION_FILES.get(currentId) || [], p = getProject(); if (!p) return;
    for (const f of Array.from(fileList || []).slice(0, 3)) {
      if (f.size > 12 * 1024 * 1024) { toast(f.name + ' supera 12 MB'); continue; }
      const item = { id: crypto.randomUUID(), name: f.name, type: f.type || 'application/octet-stream', size: f.size };
      try {
        if (/^text\//.test(item.type) || /\.(txt|md|csv|json|html)$/i.test(f.name)) { item.text = (await f.text()).slice(0, 35000); }
        else { item.data = (await fileBase64(f)).split(',')[1]; }
        arr.push(item); p.attachments = p.attachments || []; p.attachments.push({ id: item.id, name: item.name, type: item.type, size: item.size, sessionOnly: !item.text });
      } catch (e) { toast('No se pudo leer ' + f.name); }
    }
    SESSION_FILES.set(currentId, arr); setProject(p); renderAttachments(); toast('Fuentes añadidas');
  }
  function fileBase64(f) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); }); }
  function renderAttachments() {
    const p = getProject(), box = $('#in63AttachList'); if (!p || !box) return;
    const live = SESSION_FILES.get(currentId) || [];
    const list = (p.attachments || []).map(a => ({ ...a, live: live.some(x => x.id === a.id) }));
    box.innerHTML = list.map(a => `<span class="in63-chip" title="${a.sessionOnly && !a.live ? 'Vuelve a adjuntarlo para enviarlo a Javny' : ''}">📎 ${esc(a.name)}${a.sessionOnly && !a.live ? ' ⚠' : ''}<button data-rmfile="${esc(a.id)}">×</button></span>`).join('');
    box.onclick = e => { const b = e.target.closest('[data-rmfile]'); if (!b) return; p.attachments = (p.attachments || []).filter(x => x.id !== b.dataset.rmfile); SESSION_FILES.set(currentId, live.filter(x => x.id !== b.dataset.rmfile)); setProject(p); renderAttachments(); };
  }

  /* ── Enganche en el inicio y arranque ──────────────────────────────────── */
  function enrichHome() {
    const shell = $('#in50Home .in60-shell'); if (!shell || $('#in63HomeWrap')) return;
    const recent = $('#in50Home .in60-recent');
    const wrap = document.createElement('section'); wrap.id = 'in63HomeWrap'; wrap.className = 'in63-home-wrap';
    wrap.innerHTML = '<div class="in63-home-title">Crear y organizar</div><button class="in63-home-card"><span class="in63-home-icon">✨</span><span class="in63-home-copy"><b>Proyectos con Javny</b><small>Convierte una idea en un proyecto organizado, trabaja por apartados y expórtalo a Word o PDF.</small></span><span class="in63-home-arrow">›</span></button>';
    wrap.querySelector('button').onclick = open;
    if (recent) shell.insertBefore(wrap, recent); else shell.appendChild(wrap);
  }
  function boot() { migrarFormatoLocal(); enrichHome(); ensureOverlay(); }
  if (document.readyState !== 'loading') boot(); else document.addEventListener('DOMContentLoaded', boot);
  [120, 500, 1200, 2400].forEach(t => setTimeout(boot, t));

  window.EnferixProjects = { open, close, list: cargarLocal, newProject: async () => { await open(); await showStart(true); } };
})();
