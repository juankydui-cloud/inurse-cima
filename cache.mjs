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

export function requestJSON(urlString, { method = "GET", body = null, ttl = 10 * 60 * 1000, label = "La fuente externa" } = {}) {
  const bodyText = body ? JSON.stringify(body) : "";
  const key = `${method}:${urlString}:${bodyText}`;
  const hit = cacheGet(key);
  if (hit) return Promise.resolve(hit);

  return new Promise((resolve, reject) => {
    const target = new URL(urlString);
    const transport = target.protocol === "http:" ? http : https;
    const req = transport.request({
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || (target.protocol === "http:" ? 80 : 443),
      path: target.pathname + target.search,
      method,
      timeout: 18000,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "iNurse-CIMA/28.1",
        ...(bodyText ? { "Content-Length": Buffer.byteLength(bodyText) } : {})
      }
    }, response => {
      const chunks = [];
      response.on("data", chunk => chunks.push(chunk));
      response.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        let data;
        try { data = text ? JSON.parse(text) : null; }
        catch { reject(new Error(`${label} devolvió una respuesta no válida`)); return; }
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(data?.error || data?.message || `${label} respondió ${response.statusCode}`));
          return;
        }
        cacheSet(key, data, ttl);
        resolve(data);
      });
    });
    req.on("timeout", () => req.destroy(new Error(`${label} tardó demasiado en responder`)));
    req.on("error", reject);
    if (bodyText) req.write(bodyText);
    req.end();
  });
}

export const cache_obj = cache;
