/* ═══════════════════════════════════════════════════════════════════════════
   Proyectos con Javny · acceso a datos (Postgres)
   ---------------------------------------------------------------------------
   Todo colgado de user_id: cada consulta lleva el id del usuario de la sesión
   y sólo toca sus propias filas — nunca se confía en el id de proyecto solo,
   siempre `WHERE id=$1 AND user_id=$2`, para que un usuario no pueda leer ni
   tocar el proyecto de otro cambiando el id en la URL.
   ═══════════════════════════════════════════════════════════════════════════ */
import crypto from "node:crypto";
import { pool } from "./db.mjs";

const ESTADOS = new Set(["borrador", "revision", "terminado"]);
const ESTADOS_APARTADO = new Set(["pendiente", "redactado"]);

function estadoValido(v) { return ESTADOS.has(String(v || "")) ? v : "borrador"; }

function normalizarEstructura(lista) {
  if (!Array.isArray(lista)) return [];
  return lista.slice(0, 60).map((s, i) => {
    const contenido = String(s?.contenido || "");
    return {
      id: String(s?.id || crypto.randomUUID()),
      titulo: String(s?.titulo || s?.title || `Apartado ${i + 1}`).slice(0, 300),
      orden: i,
      estado: ESTADOS_APARTADO.has(s?.estado) ? s.estado : (contenido.trim() ? "redactado" : "pendiente"),
      contenido: contenido.slice(0, 200000)
    };
  });
}

function progresoDe(estructura) {
  const total = estructura.length;
  const redactados = estructura.filter(s => s.estado === "redactado").length;
  return { redactados, total };
}

// Fila completa → objeto de API. Postgres ya devuelve jsonb como objeto/array
// parseado (el driver `pg` lo hace por nosotros), así que no hace falta
// JSON.parse aquí.
function filaAProyecto(row) {
  const estructura = Array.isArray(row.estructura) ? row.estructura : [];
  return {
    id: row.id,
    titulo: row.titulo,
    tipo: row.tipo,
    descripcion: row.descripcion || "",
    idioma: row.idioma,
    tono: row.tono || "",
    destinatario: row.destinatario || "",
    normasCitacion: row.normas_citacion || "",
    extensionObjetivo: row.extension_objetivo || "",
    institucionTutor: row.institucion_tutor || "",
    fuentes: row.fuentes || {},
    estado: row.estado,
    estructura,
    progreso: progresoDe(estructura),
    version: row.version,
    creado: row.creado,
    actualizado: row.actualizado
  };
}

const COLUMNAS = `id, titulo, tipo, descripcion, idioma, tono, destinatario, normas_citacion,
  extension_objetivo, institucion_tutor, fuentes, estado, estructura, version, creado, actualizado`;

export async function listarProyectos(userId) {
  const r = await pool.query(
    `SELECT ${COLUMNAS} FROM proyectos WHERE user_id=$1 ORDER BY actualizado DESC`,
    [userId]
  );
  return r.rows.map(filaAProyecto);
}

export async function crearProyecto(userId, datos) {
  const id = crypto.randomUUID();
  const estructura = normalizarEstructura(datos.estructura);
  const r = await pool.query(
    `INSERT INTO proyectos
      (id, user_id, titulo, tipo, descripcion, idioma, tono, destinatario, normas_citacion,
       extension_objetivo, institucion_tutor, fuentes, estado, estructura, version)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,1)
     RETURNING ${COLUMNAS}`,
    [
      id, userId,
      String(datos.titulo || "Proyecto sin título").slice(0, 300),
      String(datos.tipo || "libre").slice(0, 40),
      String(datos.descripcion || "").slice(0, 4000),
      String(datos.idioma || "Castellano").slice(0, 40),
      String(datos.tono || "").slice(0, 40),
      String(datos.destinatario || "").slice(0, 300),
      String(datos.normasCitacion || "").slice(0, 40),
      String(datos.extensionObjetivo || "").slice(0, 200),
      String(datos.institucionTutor || "").slice(0, 300),
      JSON.stringify(datos.fuentes && typeof datos.fuentes === "object" ? datos.fuentes : {}),
      "borrador",
      JSON.stringify(estructura)
    ]
  );
  return filaAProyecto(r.rows[0]);
}

export async function obtenerProyecto(userId, id) {
  const r = await pool.query(
    `SELECT ${COLUMNAS} FROM proyectos WHERE id=$1 AND user_id=$2`,
    [id, userId]
  );
  return r.rows[0] ? filaAProyecto(r.rows[0]) : null;
}

// Actualización parcial: solo se tocan los campos presentes en `cambios`,
// para que el guardado automático (título, apartados) no tenga que reenviar
// el proyecto entero ni pueda pisar un campo que no venía a cambiar.
export async function actualizarProyecto(userId, id, cambios) {
  const existe = await obtenerProyecto(userId, id);
  if (!existe) return null;

  const campos = [];
  const valores = [];
  let n = 1;
  function set(columna, valor) { campos.push(`${columna}=$${++n}`); valores.push(valor); }

  if (cambios.titulo !== undefined) set("titulo", String(cambios.titulo || "Proyecto sin título").slice(0, 300));
  if (cambios.tipo !== undefined) set("tipo", String(cambios.tipo || "libre").slice(0, 40));
  if (cambios.descripcion !== undefined) set("descripcion", String(cambios.descripcion || "").slice(0, 4000));
  if (cambios.idioma !== undefined) set("idioma", String(cambios.idioma || "Castellano").slice(0, 40));
  if (cambios.tono !== undefined) set("tono", String(cambios.tono || "").slice(0, 40));
  if (cambios.destinatario !== undefined) set("destinatario", String(cambios.destinatario || "").slice(0, 300));
  if (cambios.normasCitacion !== undefined) set("normas_citacion", String(cambios.normasCitacion || "").slice(0, 40));
  if (cambios.extensionObjetivo !== undefined) set("extension_objetivo", String(cambios.extensionObjetivo || "").slice(0, 200));
  if (cambios.institucionTutor !== undefined) set("institucion_tutor", String(cambios.institucionTutor || "").slice(0, 300));
  if (cambios.fuentes !== undefined) set("fuentes", JSON.stringify(cambios.fuentes && typeof cambios.fuentes === "object" ? cambios.fuentes : {}));
  if (cambios.estado !== undefined) set("estado", estadoValido(cambios.estado));
  if (cambios.estructura !== undefined) set("estructura", JSON.stringify(normalizarEstructura(cambios.estructura)));

  if (!campos.length) return existe;

  campos.push("actualizado=now()");
  const r = await pool.query(
    `UPDATE proyectos SET ${campos.join(", ")} WHERE id=$1 AND user_id=$${++n} RETURNING ${COLUMNAS}`,
    [id, ...valores, userId]
  );
  return r.rows[0] ? filaAProyecto(r.rows[0]) : null;
}

export async function borrarProyecto(userId, id) {
  const r = await pool.query("DELETE FROM proyectos WHERE id=$1 AND user_id=$2", [id, userId]);
  return r.rowCount > 0;
}
