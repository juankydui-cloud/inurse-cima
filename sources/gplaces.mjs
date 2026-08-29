import { cacheGet, cacheSet } from "../cache.mjs";
import https from "node:https";

// Places API (New) — https://developers.google.com/maps/documentation/places/web-service/nearby-search
// Ventaja sobre Overpass: SLA industrial, datos ricos (nombre oficial, teléfono,
// horario, calificación) y no cae en picos como los mirrors públicos de OSM.
// Contrapartida: Google no cataloga desfibriladores (DEA), así que sigue
// haciendo falta OSM/Overpass para ese tipo — este módulo cubre sólo
// hospitales/clínicas y el consumidor combina las dos fuentes.
const PLACES_ENDPOINT = "https://places.googleapis.com/v1/places:searchNearby";
const TIMEOUT_MS = 15_000;

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function postJson(url, body, apiKey, fieldMask) {
  const payload = Buffer.from(JSON.stringify(body));
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const req = https.request({
      hostname: target.hostname,
      path: target.pathname + target.search,
      method: "POST",
      timeout: TIMEOUT_MS,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": payload.length,
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": fieldMask,
        "User-Agent": "Enferix-CIMA/28.1"
      }
    }, response => {
      const chunks = [];
      response.on("data", chunk => chunks.push(chunk));
      response.on("end", () => resolve({ status: response.statusCode, text: Buffer.concat(chunks).toString("utf8") }));
    });
    req.on("timeout", () => req.destroy(new Error("Timeout")));
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

export function isGooglePlacesEnabled() {
  return Boolean(process.env.GOOGLE_MAPS_API_KEY);
}

// Devuelve hospitales/clínicas cerca de una coordenada usando Google Places
// (New). El consumidor (server.mjs /api/nearby) llama a este módulo cuando
// hay API key configurada y cae a Overpass si aquí falla — Overpass es la
// red de seguridad y la única fuente de DEA.
export async function searchNearbyHospitals(lat, lon, { radius = 5000 } = {}) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_MAPS_API_KEY no configurada");

  // Redondeo a 2 decimales (~1,1 km) igual que hace overpass.mjs: usuarios del
  // mismo barrio comparten cache 10 min, la distancia mostrada sigue usando la
  // posición exacta del usuario.
  const qLat = Math.round(lat * 100) / 100;
  const qLon = Math.round(lon * 100) / 100;
  const cacheKey = `GPLACES:hospital:${qLat},${qLon}:${radius}`;
  const hit = cacheGet(cacheKey);
  if (hit) return hit;

  const body = {
    includedTypes: ["hospital"],
    maxResultCount: 20,
    languageCode: "es",
    regionCode: "ES",
    locationRestriction: {
      circle: { center: { latitude: qLat, longitude: qLon }, radius }
    }
  };
  const fieldMask = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.internationalPhoneNumber",
    "places.nationalPhoneNumber",
    "places.types",
    "places.googleMapsUri"
  ].join(",");

  const { status, text } = await postJson(PLACES_ENDPOINT, body, apiKey, fieldMask);
  if (status < 200 || status >= 300) {
    // Cuerpo de error de Google: { "error": { "code":..., "message":..., "status":... } }
    let msg = `Google Places respondió ${status}`;
    try {
      const parsed = JSON.parse(text);
      if (parsed?.error?.message) msg = `Google Places: ${parsed.error.message}`;
    } catch { /* deja el mensaje genérico */ }
    throw new Error(msg);
  }
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error("Google Places devolvió una respuesta no válida"); }

  const items = (data.places || []).map(p => {
    const c = p.location || {};
    const cLat = Number(c.latitude);
    const cLon = Number(c.longitude);
    return {
      id: `google/${p.id}`,
      kind: "hospital",
      name: p.displayName?.text || "Hospital / centro sanitario",
      lat: cLat,
      lon: cLon,
      address: p.formattedAddress || "",
      phone: p.internationalPhoneNumber || p.nationalPhoneNumber || "",
      emergency: Array.isArray(p.types) && p.types.includes("hospital"),
      distanceKm: Number.isFinite(cLat) && Number.isFinite(cLon)
        ? Math.round(haversineKm(lat, lon, cLat, cLon) * 10) / 10
        : null,
      mapsUrl: p.googleMapsUri || `https://www.google.com/maps/dir/?api=1&destination=${cLat},${cLon}`
    };
  }).filter(x => Number.isFinite(x.lat) && Number.isFinite(x.lon));

  items.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  const result = { items, source: "Google Places API" };
  cacheSet(cacheKey, result, 10 * 60 * 1000);
  return result;
}
