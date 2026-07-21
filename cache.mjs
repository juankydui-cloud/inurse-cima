import http from "node:http";
import https from "node:https";
import { URL } from "node:url";

const cache = new Map();

export function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (hit.expires < Date.now()) { cache.delete(key); return null; }
  return hit.data;
}

export function cacheSet(key, data, ttl = 10 * 60 * 1000) {
  if (cache.size > 1000) cache.delete(cache.keys().next().value);
  cache.set(key, { data, expires: Date.now() + ttl });
}

function httpRequest(urlString, { method = "GET", body = null, timeout = 18000, accept = "application/json", contentType = "application/json" } = {}) {
  const bodyText = body ? JSON.stringify(body) : "";
  return new Promise((resolve, reject) => {
    const target = new URL(urlString);
    const transport = target.protocol === "http:" ? http : https;
    const req = transport.request({
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || (target.protocol === "http:" ? 80 : 443),
      path: target.pathname + target.search,
      method,
      timeout,
      headers: {
        "Accept": accept,
        "Content-Type": contentType,
        "User-Agent": "iNurse-CIMA/28.1",
        ...(bodyText ? { "Content-Length": Buffer.byteLength(bodyText) } : {})
      }
    }, response => {
      const chunks = [];
      response.on("data", chunk => chunks.push(chunk));
      response.on("end", () => {
        resolve({ status: response.statusCode, text: Buffer.concat(chunks).toString("utf8") });
      });
    });
    req.on("timeout", () => req.destroy(new Error("Timeout")));
    req.on("error", reject);
    if (bodyText) req.write(bodyText);
    req.end();
  });
}

export function requestJSON(urlString, { method = "GET", body = null, ttl = 10 * 60 * 1000, label = "La fuente externa" } = {}) {
  const bodyText = body ? JSON.stringify(body) : "";
  const key = `${method}:${urlString}:${bodyText}`;
  const hit = cacheGet(key);
  if (hit) return Promise.resolve(hit);

  return httpRequest(urlString, { method, body }).then(({ status, text }) => {
    let data;
    try { data = text ? JSON.parse(text) : null; }
    catch { throw new Error(`${label} devolvió una respuesta no válida`); }
    if (status < 200 || status >= 300) {
      throw new Error(data?.error || data?.message || `${label} respondió ${status}`);
    }
    cacheSet(key, data, ttl);
    return data;
  });
}

export function requestText(urlString, { method = "GET", ttl = 10 * 60 * 1000, label = "La fuente externa", accept = "application/xml" } = {}) {
  const key = `TEXT:${method}:${urlString}`;
  const hit = cacheGet(key);
  if (hit) return Promise.resolve(hit);

  return httpRequest(urlString, { method, accept }).then(({ status, text }) => {
    if (status < 200 || status >= 300) {
      throw new Error(`${label} respondió ${status}`);
    }
    cacheSet(key, text, ttl);
    return text;
  });
}

export const cache_obj = cache;
