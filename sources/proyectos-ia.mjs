/* ═══════════════════════════════════════════════════════════════════════════
   Proyectos con Javny · propuesta de estructura
   ---------------------------------------------------------------------------
   "Proponer estructura" es la única llamada a un modelo que este módulo hace
   por ahora: parte de la plantilla del tipo elegido (plantillas-proyectos.mjs)
   y le pide al modelo que la ADAPTE a la descripción, no que la invente. El
   resto de acciones del editor (desarrollar, mejorar, ampliar, bibliografía,
   borrador completo, elevar a excelencia…) siguen llamando a Gemini desde el
   navegador con la clave del usuario — deuda pendiente para la fase 2,
   anotada en CLAUDE.md.

   Mismo patrón que /api/javny/chat/stream: Anthropic primero si hay clave, y
   si falla ANTES de tener nada útil, Gemini de reserva con la clave del
   servidor. Aquí no hay streaming que proteger a medias, así que el fallback
   no tiene la restricción de "solo si no se emitió texto" del chat: una
   llamada entera o falla entera o no falla.
   ═══════════════════════════════════════════════════════════════════════════ */
import { anthropicCall, anthropicDisponible, ANTHROPIC_MODEL } from "./anthropic.mjs";
import { callGemini, GEMINI_MODEL } from "./orchestrator.mjs";
import { plantillaDe, etiquetaDeTipo } from "./plantillas-proyectos.mjs";

const SISTEMA = "Eres Javny Proyectos, la asistente de Enferix para organizar documentos "
  + "profesionales de enfermería (protocolos, procedimientos, planes de cuidados, proyectos "
  + "de mejora, trabajos académicos, sesiones clínicas, informes). En esta tarea SOLO propones "
  + "un índice de apartados; no redactas contenido. Respondes exclusivamente con el JSON pedido, "
  + "sin explicaciones, sin bloques de código, sin texto antes ni después.";

function construirPrompt(datos) {
  const plantilla = plantillaDe(datos.tipo);
  const etiqueta = etiquetaDeTipo(datos.tipo);
  return `PLANTILLA BASE para "${etiqueta}" — parte de ella, no la inventes. Puedes añadir, ` +
    `quitar o renombrar apartados SOLO si la descripción concreta lo justifica, sin perder su ` +
    `función (por ejemplo, un protocolo siempre necesita su apartado de indicadores, aunque lo ` +
    `renombres):\n` +
    plantilla.map((titulo, i) => `${i + 1}. ${titulo}`).join("\n") +
    `\n\nDESCRIPCIÓN DEL PROYECTO: ${datos.descripcion}\n` +
    `IDIOMA: ${datos.idioma}\n` +
    `TONO: ${datos.tono}\n` +
    `DESTINATARIOS: ${datos.destinatario || "No indicados"}\n` +
    `NORMAS DE CITACIÓN: ${datos.normasCitacion}\n` +
    `EXTENSIÓN OBJETIVO: ${datos.extensionObjetivo || "No indicada"}\n` +
    `INSTITUCIÓN / TUTOR: ${datos.institucionTutor || "No indicado"}\n\n` +
    `Devuelve EXCLUSIVAMENTE este JSON, sin nada más:\n` +
    `{"sections": ["Título del apartado 1", "Título del apartado 2", "..."]}\n` +
    `Entre ${plantilla.length} y ${plantilla.length + 6} apartados, en el idioma pedido.`;
}

// El modelo puede envolver el JSON en una frase o en ```json — se toma el
// primer bloque {...} que aparezca, en vez de exigir que la respuesta sea
// JSON puro carácter a carácter.
function extraerJSON(texto) {
  const limpio = String(texto || "").trim();
  const inicio = limpio.indexOf("{");
  const fin = limpio.lastIndexOf("}");
  if (inicio < 0 || fin < inicio) {
    throw new Error("El modelo no devolvió una estructura reconocible.");
  }
  return JSON.parse(limpio.slice(inicio, fin + 1));
}

/**
 * @param {object} datos { descripcion, tipo, idioma, tono, destinatario, normasCitacion, extensionObjetivo, institucionTutor }
 * @returns {Promise<string[]>} títulos de apartado, en orden
 */
export async function generarEstructura(datos) {
  const prompt = construirPrompt(datos);
  let texto;

  if (anthropicDisponible()) {
    try {
      texto = await anthropicCall(SISTEMA, prompt, { model: ANTHROPIC_MODEL, maxOutputTokens: 1400 });
    } catch (err) {
      const motivo = err instanceof Error ? err.message : String(err);
      console.error(`[Proyectos] Claude falló (${motivo}); se reintenta con Gemini.`);
      texto = await conGemini(prompt);
    }
  } else {
    texto = await conGemini(prompt);
  }

  const obj = extraerJSON(texto);
  const sections = Array.isArray(obj.sections)
    ? obj.sections.map(s => String(s || "").trim()).filter(Boolean).slice(0, 24)
    : [];
  if (!sections.length) throw new Error("La estructura devuelta por el modelo estaba vacía.");
  return sections;
}

function conGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) throw new Error("No hay ningún proveedor de IA configurado en el servidor (falta ANTHROPIC_API_KEY o GEMINI_API_KEY).");
  return callGemini(SISTEMA, prompt, { apiKey, model: GEMINI_MODEL, maxOutputTokens: 1400, temperature: 0.2 });
}
