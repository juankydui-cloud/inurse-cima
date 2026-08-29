import { requestJSON } from "../cache.mjs";

// Mirrors públicos de Overpass, ordenados por fiabilidad observada:
// - kumi.systems: mejor SLA en la práctica, casi nunca satura.
// - overpass-api.de: el "oficial", más famoso y por eso más saturado.
// - openstreetmap.ru: se cae con cierta frecuencia pero cuando funciona va bien.
// Se prueba en paralelo con Promise.any() en lugar de secuencial: la primera
// respuesta buena gana, así el peor caso baja de ~3×timeout a 1×timeout.
const OVERPASS_MIRRORS = process.env.OVERPASS_BASE
  ? [process.env.OVERPASS_BASE]
  : [
      "https://overpass.kumi.systems/api/interpreter",
      "https://overpass-api.de/api/interpreter",
      "https://overpass.openstreetmap.ru/api/interpreter"
    ];

// El query lleva [timeout:25] internamente, así que Overpass puede tardar
// hasta 25 s en procesarlo. Dejamos 35 s de margen para DNS, TLS, latencia y
// posibles reintentos internos del mirror.
const MIRROR_TIMEOUT_MS = 35_000;

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
  // Redondear el centro del query a 2 decimales (~1,1 km de resolución) hace
  // que usuarios en el mismo barrio compartan cache. La lista de resultados
  // sigue mostrando la distancia real a la posición original del usuario
  // (haversineKm más abajo usa lat/lon sin redondear).
  const qLat = Math.round(lat * 100) / 100;
  const qLon = Math.round(lon * 100) / 100;

  const clauses = [];
  if (kinds.includes("hospital")) {
    clauses.push(`node["amenity"="hospital"](around:${radius},${qLat},${qLon});`);
    clauses.push(`way["amenity"="hospital"](around:${radius},${qLat},${qLon});`);
    clauses.push(`node["amenity"="clinic"]["emergency"="yes"](around:${radius},${qLat},${qLon});`);
  }
  if (kinds.includes("aed")) {
    clauses.push(`node["emergency"="defibrillator"](around:${radius},${qLat},${qLon});`);
  }
  const query = `[out:json][timeout:25];(${clauses.join("")});out center tags;`;

  // Fetch en paralelo con Promise.any: la primera respuesta válida gana; el
  // resto sigue en segundo plano hasta que su mirror responda o timeout, y
  // su resultado cae en cache por si el mismo query se repite en 10 min.
  // Las respuestas HTML de error de un mirror saturado hacen que requestJSON
  // lance ("respuesta no válida"), lo que Promise.any trata como fallo del
  // candidato y espera al siguiente — nunca corta la búsqueda.
  const attempts = OVERPASS_MIRRORS.map(mirror =>
    requestJSON(`${mirror}?data=${encodeURIComponent(query)}`, {
      ttl: 10 * 60 * 1000,
      label: "OpenStreetMap (Overpass)",
      timeout: MIRROR_TIMEOUT_MS
    })
  );
  let raw;
  try {
    raw = await Promise.any(attempts);
  } catch (aggregate) {
    // Promise.any rechaza con AggregateError sólo si TODOS fallan. Reportamos
    // el primer motivo concreto: suele ser "Timeout" o "respuesta no válida",
    // y ese texto es más útil en la UI que un genérico "ningún mirror".
    const firstErr = aggregate?.errors?.[0];
    throw firstErr || new Error("Ningún servidor de OpenStreetMap respondió");
  }

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
