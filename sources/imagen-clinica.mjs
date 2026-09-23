/* ═══════════════════════════════════════════════════════════════════════════
   Lectura de imagen clínica · ECG y radiología
   ---------------------------------------------------------------------------
   Hasta ahora estas dos lecturas se hacían DESDE EL NAVEGADOR, llamando a
   Google con la API key que el usuario se hubiera pegado en Ajustes
   (`guiaHJ23_apikey`). Sin esa clave la app contestaba "Introduce tu Gemini
   API Key primero" y no analizaba nada: un usuario recién instalado no podía
   usar el lector de electros aunque el servidor tuviera claves de sobra.
   Ahora la llamada la hace el servidor, como el resto de Javny.

   Mismo patrón que proyectos-ia.mjs: Anthropic primero si hay clave y Gemini
   de reserva con la clave del servidor. No hay streaming que proteger a
   medias — es una respuesta entera o ninguna —, así que el fallback no lleva
   la restricción de "sólo si no se emitió texto" del chat.

   Los dos guiones son los MISMOS que estaban en el cliente, trasladados
   literalmente: son contenido clínico editorial (la sistemática de lectura y
   el repositorio de referencia de la radiografía), no prosa de apoyo, y
   reescribirlos al mover el código habría cambiado la respuesta sin que
   nadie lo hubiera pedido.
   ═══════════════════════════════════════════════════════════════════════════ */
import { anthropicCall, anthropicDisponible, ANTHROPIC_MODEL } from "./anthropic.mjs";
import { callGemini, GEMINI_MODEL } from "./orchestrator.mjs";

// Los únicos formatos que aceptan las dos APIs de visión. El laboratorio de
// imagen del cliente (inurse-rxecg-v04-js.js) reprocesa siempre a JPEG, pero
// la carga directa sin editar manda el tipo del fichero tal cual.
const MEDIA_VALIDOS = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

const GUION_ECG = `Eres Javny, asistente experta en lectura sistemática de electrocardiogramas para profesionales sanitarios. Analiza la imagen con profundidad, sin ser escueta y sin atribuir la información a ningún hospital. Utiliza todo el conocimiento clínico disponible y el contexto de Enferix. No inventes mediciones que no puedan estimarse en la imagen.

RESPUESTA OBLIGATORIA, POR APARTADOS:
1. Identificación, calidad y técnica: número de derivaciones visibles, artefactos, calibración y velocidad si se aprecian, y limitaciones de la fotografía.
2. Frecuencia: método utilizado y frecuencia aproximada.
3. Ritmo: regularidad, presencia de ondas P, relación P-QRS y conclusión razonada.
4. Eje eléctrico: orientación aproximada usando I y aVF cuando sean valorables.
5. Intervalos: PR, anchura del QRS y QT/QTc. Da valores aproximados solo si la calidad permite medirlos y señala si son normales o anómalos.
6. Morfología: ondas P, progresión de R, ondas Q patológicas, voltajes, hipertrofias, bloqueos de rama, hemibloqueos, preexcitación y marcapasos si procede.
7. ST y onda T: elevación o descenso, derivaciones afectadas, distribución territorial, cambios recíprocos y alteraciones de repolarización.
8. Arritmias y hallazgos especiales: extrasístoles, fibrilación/flutter, taquicardias, bradicardias, bloqueos AV y patrones compatibles con alteraciones electrolíticas u otros síndromes.
9. Impresión electrocardiográfica: conclusión principal y diagnósticos diferenciales, explicando qué hallazgos la sustentan.
10. Gravedad y actuación: signos que requieren valoración urgente, monitorización, ECG seriados, analítica o aviso inmediato.
11. Enfoque enfermero: comprobaciones técnicas, constantes, síntomas asociados, accesos, medicación relevante, vigilancia y comunicación estructurada.
12. Comparación con la hipótesis aportada: confirma, corrige o matiza con respeto y explica por qué.

Si una parte no es evaluable, escribe "no valorable en esta imagen" en lugar de omitirla. Responde en español, con títulos claros y suficiente detalle. No cierres la respuesta de forma prematura. Termina con: "Lectura orientativa y educativa. La interpretación definitiva requiere el trazado original, el contexto clínico y la valoración del profesional responsable."`;

const REPOSITORIO_RX = `REPOSITORIO DE REFERENCIA (síntesis para orientar la lectura):
- Rx de tórax, sistemática: técnica (penetración, inspiración, rotación) y recorrido A-vía aérea/tráquea, B-mediastino y silueta cardíaca (índice cardiotorácico), C-parénquima por tercios comparando lados, D-pleura y senos, E-hueso y partes blandas, y dispositivos.
- Patrón alveolar: opacidad algodonosa con broncograma aéreo (neumonía, edema, hemorragia). Patrón intersticial: retículo o vidrio deslustrado (edema intersticial, fibrosis, infección atípica).
- Atelectasia: pérdida de volumen, cisuras y mediastino desviados HACIA la lesión. Hemitórax opaco: si el mediastino va hacia el opaco, atelectasia; si va al lado contrario, derrame masivo o masa.
- Derrame pleural: borramiento del seno costofrénico, menisco; masivo desvía mediastino al lado sano.
- Neumotórax: línea de pleura visceral con ausencia de trama por fuera; a tensión desvía el mediastino al lado contrario (urgencia).
- Nódulo solitario: benigno si bordes lisos y calcio central y estable; maligno si espiculado, grande o crece.
- Insuficiencia cardíaca/edema: cardiomegalia, redistribución, líneas B de Kerley, alas de mariposa, derrame.
- Condensación neumónica: consolidación lobar con broncograma; signo de la silueta localiza el lóbulo.
- Abdomen simple: neumoperitoneo (aire libre subdiafragmático, signo de Rigler) = perforación; obstrucción (asas dilatadas, niveles; delgado central con válvulas conniventes, colon periférico con haustras).
- Rx ósea: revisar cortical, línea de fractura, alineación y partes blandas; en niños vigilar fisis; dos proyecciones.
- Dispositivos: TET 2-4 cm sobre carina; vía central en cava superior; SNG en cámara gástrica; buscar neumotórax tras vía central.`;

const GUION_RX = `Eres Javny, asistente experta en análisis sistemático de imágenes radiológicas para profesionales sanitarios. Realiza una lectura completa, estructurada y prudente. No atribuyas la información a ningún hospital. Integra el repositorio de Enferix y tu conocimiento clínico general. Describe únicamente lo que sea visible; no inventes hallazgos ni datos clínicos.
${REPOSITORIO_RX}

RESPUESTA OBLIGATORIA, POR APARTADOS:
1. Tipo de estudio y región anatómica: modalidad, proyección, lateralidad y posición si pueden determinarse.
2. Calidad técnica: penetración/exposición, inspiración, rotación, centrado, artefactos y limitaciones.
3. Revisión sistemática completa:
- En tórax: vía aérea y tráquea; mediastino e hilios; silueta cardíaca; campos pulmonares por zonas; pleura y senos costofrénicos; diafragma; huesos y partes blandas; dispositivos.
- En abdomen: patrón gaseoso, dilatación, niveles, aire libre, calcificaciones, masas, estructuras óseas y dispositivos.
- En aparato locomotor: alineación, cortical, trabeculado, articulaciones, partes blandas y signos de fractura/luxación.
- En otras imágenes: aplica la sistemática apropiada al estudio visible.
4. Hallazgos positivos: localización, extensión, distribución y signos asociados.
5. Hallazgos negativos relevantes: menciona los signos urgentes que no se observan cuando puedan valorarse.
6. Impresión diagnóstica: posibilidad principal y diagnóstico diferencial razonado.
7. Gravedad: hallazgos que exigen valoración inmediata o comunicación urgente.
8. Correlación clínica: síntomas, antecedentes, analítica o pruebas que ayudarían a confirmar o descartar.
9. Enfoque enfermero: monitorización, observación, preparación, medidas de seguridad y cuándo avisar al equipo médico.
10. Comparación con la sospecha aportada: confirma, corrige o matiza explicando los motivos.

Si la imagen no permite valorar un apartado, indícalo expresamente. Responde en español con títulos claros y suficiente detalle; no seas escueta ni termines a mitad. Termina con: "Lectura orientativa y educativa. No sustituye el informe radiológico, la imagen original ni la valoración clínica del equipo responsable."`;

const MODOS = {
  ecg: {
    sistema: GUION_ECG,
    conContexto: ctx => `Hipótesis o contexto aportado: "${ctx}". Realiza el análisis completo del electrocardiograma.`,
    sinContexto: "Realiza el análisis completo de este electrocardiograma."
  },
  rx: {
    sistema: GUION_RX,
    conContexto: ctx => `Contexto o sospecha aportada: "${ctx}". Realiza el análisis radiológico completo.`,
    sinContexto: "Realiza el análisis radiológico completo de esta imagen."
  }
};

export function tiposDeImagen() {
  return Object.keys(MODOS);
}

export function imagenDisponible() {
  return anthropicDisponible() || Boolean(process.env.GEMINI_API_KEY);
}

/**
 * @param {object} peticion
 * @param {"ecg"|"rx"} peticion.tipo
 * @param {string} peticion.data       imagen en base64, SIN el prefijo data:
 * @param {string} peticion.media      image/jpeg, png, gif o webp
 * @param {string} [peticion.contexto] hipótesis o sospecha que aporta quien consulta
 * @returns {Promise<{answer:string, proveedor:string}>}
 */
export async function analizarImagen({ tipo, data, media, contexto }) {
  const modo = MODOS[tipo];
  if (!modo) throw new Error(`Tipo de imagen no reconocido: ${tipo}`);
  if (!data) throw new Error("Falta la imagen.");

  const mediaType = MEDIA_VALIDOS.has(media) ? media : "image/jpeg";
  const ctx = String(contexto || "").trim();
  const instruccion = ctx ? modo.conContexto(ctx) : modo.sinContexto;
  const t0 = Date.now();

  if (anthropicDisponible()) {
    try {
      const answer = await anthropicCall(modo.sistema, [
        { type: "image", source: { type: "base64", media_type: mediaType, data } },
        { type: "text", text: instruccion }
      ], { model: ANTHROPIC_MODEL, maxOutputTokens: 5000 });
      console.log(`[Imagen ${tipo}] Claude · ${answer.length} caracteres · ${Date.now() - t0} ms`);
      return { answer, proveedor: "anthropic" };
    } catch (err) {
      const motivo = err instanceof Error ? err.message : String(err);
      console.error(`[Imagen ${tipo}] Claude falló (${motivo}); se reintenta con Gemini.`);
    }
  }

  const answer = await conGemini(modo.sistema, instruccion, data, mediaType);
  console.log(`[Imagen ${tipo}] Gemini · ${answer.length} caracteres · ${Date.now() - t0} ms`);
  return { answer, proveedor: "gemini" };
}

// callGemini() del orquestador sólo manda texto, así que la parte de visión se
// arma aquí con la misma forma que usaba el cliente (inlineData + texto).
async function conGemini(sistema, instruccion, data, mediaType) {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    throw new Error("No hay ningún proveedor de IA configurado en el servidor (falta ANTHROPIC_API_KEY o GEMINI_API_KEY).");
  }
  const base = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com";
  const url = `${base}/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: sistema }] },
      contents: [{ parts: [
        { inlineData: { mimeType: mediaType, data } },
        { text: instruccion }
      ] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 5000 }
    })
  });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(json?.error?.message || `Gemini respondió HTTP ${resp.status}`);
  }
  const texto = (json?.candidates?.[0]?.content?.parts || [])
    .map(p => p.text || "").join("").trim();
  if (!texto) throw new Error("Gemini devolvió una respuesta vacía.");
  return texto;
}
