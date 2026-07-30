import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { pool } from "./db.mjs";

const SESSION_DAYS = 30;

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function normEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function cleanName(name) {
  return String(name || "").trim().slice(0, 120);
}

export function parseCookies(req) {
  const header = req.headers.cookie || "";
  const out = {};
  header.split(";").forEach(part => {
    const idx = part.indexOf("=");
    if (idx < 0) return;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  });
  return out;
}

export function isSecureReq(req) {
  return req.headers["x-forwarded-proto"] === "https" || !!req.socket.encrypted;
}

export function setSessionCookie(res, token, secure) {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  const parts = [`sid=${token}`, "Path=/", "HttpOnly", `Max-Age=${maxAge}`, "SameSite=Lax"];
  if (secure) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}

export function clearSessionCookie(res, secure) {
  const parts = ["sid=", "Path=/", "HttpOnly", "Max-Age=0", "SameSite=Lax"];
  if (secure) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}

export async function registerUser({ email, password, name }) {
  email = normEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw httpError(400, "Email no válido");
  if (!password || String(password).length < 8) throw httpError(400, "La contraseña debe tener al menos 8 caracteres");
  const existing = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
  if (existing.rows.length) throw httpError(409, "Ya existe una cuenta con ese email");
  const hash = await bcrypt.hash(String(password), 10);
  const id = crypto.randomUUID();
  await pool.query(
    "INSERT INTO users (id, email, password_hash, name) VALUES ($1,$2,$3,$4)",
    [id, email, hash, cleanName(name)]
  );
  return { id, email, name: cleanName(name) };
}

export async function loginUser({ email, password }) {
  email = normEmail(email);
  const r = await pool.query("SELECT id, email, password_hash, name FROM users WHERE email=$1", [email]);
  if (!r.rows.length) throw httpError(401, "Email o contraseña incorrectos");
  const user = r.rows[0];
  const ok = await bcrypt.compare(String(password || ""), user.password_hash);
  if (!ok) throw httpError(401, "Email o contraseña incorrectos");
  return { id: user.id, email: user.email, name: user.name };
}

export async function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await pool.query("INSERT INTO sessions (token, user_id, expires_at) VALUES ($1,$2,$3)", [token, userId, expires]);
  return token;
}

export async function getUserBySession(token) {
  if (!token) return null;
  const r = await pool.query(
    `SELECT u.id, u.email, u.name FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token=$1 AND s.expires_at > now()`,
    [token]
  );
  return r.rows[0] || null;
}

export async function destroySession(token) {
  if (!token) return;
  await pool.query("DELETE FROM sessions WHERE token=$1", [token]);
}
