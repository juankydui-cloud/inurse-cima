import { requestJSON } from "../cache.mjs";

const OVERPASS_BASE = process.env.OVERPASS_BASE || "https://overpass-api.de/api/interpreter";

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function centerOf(el) {
  if (el.type === "node") return { lat: el.lat, lon: el.lon };
  if (el.center) return { lat: el.center.lat, lon: el.center.lon };
  return null;
}

function addressOf(tags = {}) {
  const parts = [
    tags["addr:street"] && (tags["addr:street"] + (tags["addr:housenumber"] ? " " + tags["addr:housenumber"] : "")),
    tags["addr:city"] || tags["addr:town"] || tags["addr:village"],
    tags["addr:postcode"]
  ].filter(Boolean);
  return parts.join(", ");
}

// Consulta Overpass (OpenStreetMap) por hospitales/clínicas de urgencias y
// desfibriladores (DEA) reales cerca de una coordenada. Nunca se inventan
// direcciones ni ubicaciones: si Overpass no devuelve nada, se devuelve una
// lista vacía y la app lo indica explícitamente.
export async function searchNearby(lat, lon, { radius = 5000, kinds = ["hospital", "aed"] } = {}) {
  const clauses = [];
  if (kinds.includes("hospital")) {
    clauses.push(`node["amenity"="hospital"](around:${radius},${lat},${lon});`);
    clauses.push(`way["amenity"="hospital"](around:${radius},${lat},${lon});`);
    clauses.push(`node["amenity"="clinic"]["emergency"="yes"](around:${radius},${lat},${lon});`);
  }
  if (kinds.includes("aed")) {
    clauses.push(`node["emergency"="defibrillator"](around:${radius},${lat},${lon});`);
  }
  const query = `[out:json][timeout:20];(${clauses.join("")});out center tags;`;

  // GET con la query como parámetro: requestJSON() serializa cualquier body
  // como JSON, lo que rompería la sintaxis de Overpass QL, así que se envía
  // como querystring en vez de como POST con cuerpo "data=...".
  const raw = await requestJSON(`${OVERPASS_BASE}?data=${encodeURIComponent(query)}`, {
    ttl: 10 * 60 * 1000,
    label: "OpenStreetMap (Overpass)"
  });

  const elements = raw?.elements || [];
  const items = [];
  for (const el of elements) {
    const c = centerOf(el);
    if (!c) continue;
    const tags = el.tags || {};
    const isAed = tags.emergency === "defibrillator";
    items.push({
      id: `${el.type}/${el.id}`,
      kind: isAed ? "aed" : "hospital",
      name: tags.name || (isAed ? "Desfibrilador (DEA)" : "Hospital / centro de urgencias"),
      lat: c.lat,
      lon: c.lon,
      address: addressOf(tags),
      phone: tags.phone || tags["contact:phone"] || "",
      emergency: tags.emergency === "yes" || tags.amenity === "hospital",
      distanceKm: Math.round(haversineKm(lat, lon, c.lat, c.lon) * 10) / 10,
      mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lon}`
    });
  }
  items.sort((a, b) => a.distanceKm - b.distanceKm);
  return { items, source: "OpenStreetMap (Overpass API)" };
}
