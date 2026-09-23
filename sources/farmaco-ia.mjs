/* ═══════════════════════════════════════════════════════════════════════════
   "Explícame el fármaco" del Vademécum
   ---------------------------------------------------------------------------
   Otro sitio donde la llamada salía del NAVEGADOR con la clave del usuario:
   sin clave, el panel decía "Introduce tu Gemini API Key para que te explique
   el fármaco" y no explicaba nada. Ahora la atiende el servidor, como la
   lectura de imagen.

   El guion farmacológico se traslada LITERAL del cliente: es contenido
   editorial —qué apartados tiene que cubrir una explicación de fármaco y qué
   no puede inventarse—, no prosa de apoyo.

   La ficha del fármaco la manda el cliente porque el vademécum (VADEM) es un
   dataset del navegador, no del servidor. Cada campo va recortado: lo que
   entra en el prompt es tan de fiar como la pregunta que escribe quien
   consulta, así que se acota en vez de confiarse.
   ═══════════════════════════════════════════════════════════════════════════ */
import { generarConFallback, proveedorDisponible } from "./ia-fallback.mjs";

const SISTEMA = `Eres Javny, asistente experta en farmacología para profesionales sanitarios. Explica el fármaco de forma completa y práctica, usando la ficha integrada y conocimiento farmacológico general fiable. No atribuyas la información a ningún hospital.

Incluye, cuando proceda:
- Grupo farmacológico y mecanismo de acción.
- Indicaciones principales y usos relevantes.
- Presentaciones, vías y administración.
- Posología orientativa solo cuando conste de forma fiable; diferencia adulto, pediatría, insuficiencia renal/hepática y situaciones especiales si aplica.
- Preparación, dilución, compatibilidad, velocidad y estabilidad si son relevantes para enfermería y están disponibles.
- Contraindicaciones, precauciones e interacciones importantes.
- Reacciones adversas frecuentes y graves.
- Monitorización antes, durante y después.
- Signos de toxicidad, actuación ante incidentes y educación al paciente.
- Puntos críticos de seguridad y consejo enfermero práctico.

Distingue claramente lo que procede de la ficha integrada de lo que es orientación general. No inventes dosis ni diluciones. Responde en español, con títulos y listas, y no seas escueta.
Finaliza con: "Información farmacológica de apoyo. Verifica siempre la ficha técnica vigente, la prescripción, la compatibilidad, el protocolo local y la situación clínica del paciente."`;

const CAMPOS = [
  ["nombre", "Nombre", 200],
  ["accion", "Acción", 2000],
  ["indicaciones", "Indicaciones", 4000],
  ["posologia", "Posología", 4000],
  ["contraindicaciones", "Contraindicaciones", 4000],
  ["reacciones", "Reacciones adversas", 4000],
  ["fuente", "Fuente", 300]
];

export function farmacoDisponible() {
  return proveedorDisponible();
}

/**
 * @param {object} ficha  {nombre, accion, indicaciones, posologia, contraindicaciones, reacciones, fuente}
 * @returns {Promise<{answer:string, proveedor:string}>}
 */
export async function explicarFarmaco(ficha) {
  const nombre = String(ficha?.nombre || "").trim().slice(0, 200);
  if (!nombre) throw new Error("Falta el nombre del fármaco.");

  const integrada = CAMPOS
    .map(([clave, etiqueta, tope]) => `${etiqueta}: ${String(ficha?.[clave] || "").trim().slice(0, tope)}`)
    .join("\n");

  const { texto, proveedor } = await generarConFallback({
    sistema: `${SISTEMA}\n\nFICHA INTEGRADA DEL FÁRMACO:\n${integrada}`,
    contenido: `Explica de forma completa el fármaco ${nombre}.`,
    maxOutputTokens: 4096,
    etiqueta: "Fármaco"
  });
  return { answer: texto, proveedor };
}
