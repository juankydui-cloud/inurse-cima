/* ═══════════════════════════════════════════════════════════════════════════
   Llamada a Claude (Anthropic) en streaming, para /api/javny/chat/stream
   ---------------------------------------------------------------------------
   Usa el SDK oficial (@anthropic-ai/sdk). Su .stream() abre la conexión SSE y
   entrega los eventos según llegan; aquí se reenvía cada fragmento en el mismo
   momento, sin acumularlo: el texto completo se compone en el cliente. La
   variable `full` de abajo existe sólo para devolver la respuesta entera al
   terminar (el evento "done" la necesita), nunca para trocearla después.

   El guion clínico NO vive aquí: se importa de guion-clinico.mjs, el mismo que
   usa la llamada a Gemini, para que la respuesta no dependa del proveedor.
   ═══════════════════════════════════════════════════════════════════════════ */
import Anthropic from "@anthropic-ai/sdk";

export const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";

export function anthropicDisponible() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let cliente = null;
function getCliente() {
  if (!cliente) {
    // Una clave vinculada a identidad exige además el workspace: sin esta
    // cabecera la API responde 400 "anthropic-workspace-id is required when
    // authenticating with an identity-linked API key". Con una clave normal la
    // cabecera sobra, así que sólo se manda si la variable existe.
    const workspaceId = (process.env.ANTHROPIC_WORKSPACE_ID || "").trim();
    cliente = new Anthropic({
      // maxRetries bajo a propósito: este endpoint es de latencia crítica y ya
      // tiene su propio plan B (Gemini). Con los 2 reintentos por defecto, un
      // fallo de Claude tardaba ~2 s en caer al otro proveedor; con uno, la mitad.
      maxRetries: 1,                      // la clave sale del entorno
      ...(workspaceId ? { defaultHeaders: { "anthropic-workspace-id": workspaceId } } : {})
    });
    console.log(`[Anthropic] Cliente listo · workspace ${workspaceId ? "sí" : "no configurado"}`);
  }
  return cliente;
}

/**
 * Genera la respuesta con Claude y va entregando cada fragmento a onDelta.
 * Devuelve el texto completo al terminar.
 *
 * @param {(chunk: string) => void} onDelta  recibe SÓLO el fragmento nuevo
 */
export async function streamAnthropicCall(systemPrompt, userPrompt, {
  model, history, maxOutputTokens = 4096, conciso = false
} = {}, onDelta) {
  const client = getCliente();

  const messages = [];
  if (history?.length) {
    for (const m of history.slice(-10)) {
      messages.push({ role: m.role === "user" ? "user" : "assistant", content: m.content });
    }
  }
  messages.push({ role: "user", content: userPrompt });

  let full = "";
  let nFragmentos = 0, tPrimero = null, tUltimo = null;
  const t0 = Date.now();

  // .stream() = SSE nativo del SDK. El evento "text" llega por cada trozo de
  // texto que produce el modelo, no al final.
  const stream = client.messages.stream({
    model: model || ANTHROPIC_MODEL,
    max_tokens: maxOutputTokens,
    system: systemPrompt,
    messages,
    // La portada quiere una respuesta corta y rápida; el chat, desarrollo largo.
    // El esfuerzo bajo recorta el razonamiento previo, que es lo que retrasaba
    // el primer fragmento.
    output_config: { effort: conciso ? "low" : "high" }
  });

  stream.on("text", (fragmento) => {
    if (!fragmento) return;
    nFragmentos++;
    if (tPrimero === null) tPrimero = Date.now() - t0;
    tUltimo = Date.now() - t0;
    full += fragmento;
    if (onDelta) onDelta(fragmento);   // ← se emite YA, sin esperar al resto
  });

  const mensajeFinal = await stream.finalMessage();

  console.log(`[Anthropic stream] ${nFragmentos} fragmentos · primero a los ${tPrimero ?? "n/d"} ms · ` +
    `último a los ${tUltimo ?? "n/d"} ms · modelo ${mensajeFinal.model} · stop=${mensajeFinal.stop_reason}`);

  // Una negativa por seguridad llega con HTTP 200: hay que mirar stop_reason
  // antes de dar por buena la respuesta.
  if (mensajeFinal.stop_reason === "refusal") {
    const cat = mensajeFinal.stop_details?.category || "sin categoría";
    throw new Error(`Claude declinó responder a esta consulta (${cat}).`);
  }
  if (!full.trim()) {
    throw new Error(`Claude devolvió una respuesta vacía (motivo: ${mensajeFinal.stop_reason || "desconocido"}).`);
  }

  return full.trim();
}
