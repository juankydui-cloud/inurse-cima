import { requestJSON } from "../cache.mjs";

// Google Places API (New) — búsqueda de hospitales y centros de urgencias
// cercanos. Sustituye a Overpass/OpenStreetMap para los centros sanitarios,
// donde la cobertura de OSM en España es irregular: muchos hospitales están
// sin nombre, sin dirección o directamente sin registrar.
//
// Google NO publica desfibriladores (DEA): no existe ningún tipo de lugar
// equivalente a "emergency=defibrillator". Esa parte se sigue resolviendo con
// Overpass — ver sources/nearby.mjs. No se sustituye a ciegas porque perder la
// búsqueda de DEA sería perder una función clínica real.
// Igual que CIMA_BASE o EPMC_BASE en el resto del proyecto: se puede apuntar a
// otro extremo para poder probar el camino completo sin gastar cuota real.
const PLACES_URL = process.env.GOOGLE_PLACES_URL ||
  "https://places.googleapis.com/v1/places:searchNearby";

// Solo se piden los campos que la app muestra. El coste de Places se factura
// por campos solicitados, así que pedir de más se paga de más.
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.googleMapsUri",
  "places.primaryType",
  "places.currentOpeningHours.openNow"
].join(",");

export function googleKey() {
  const k = (process.env.GOOGLE_MAPS_API_KEY || "").trim();
  return k || null;
}

export function hasGoogle() {
  return Boolean(googleKey());
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Places acepta como mucho 50 km de radio y 20 resultados por consulta.
const MAX_RADIUS_M = 50000;
const MAX_RESULTS = 20;

export async function searchHospitals(lat, lon, { radius = 5000, language = "es", region = "ES" } = {}) {
  const key = googleKey();
  if (!key) throw new Error("Falta la clave de Google Maps (GOOGLE_MAPS_API_KEY)");

  const body = {
    includedTypes: ["hospital"],
    maxResultCount: MAX_RESULTS,
    // Por distancia, no por "relevancia": para urgencias lo único que importa
    // es cuál está más cerca, no cuál es más popular.
    rankPreference: "DISTANCE",
    languageCode: language,
    regionCode: region,
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lon },
        radius: Math.min(MAX_RADIUS_M, Math.max(1, radius))
      }
    }
  };

  const raw = await requestJSON(PLACES_URL, {
    method: "POST",
    body,
    ttl: 10 * 60 * 1000,
    label: "Google Maps (Places)",
    timeout: 15000,
    headers: {
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": FIELD_MASK
    }
  });

  const places = raw?.places || [];
  const items = [];
  for (const p of places) {
    const c = p.location;
    if (!c || !Number.isFinite(c.latitude) || !Number.isFinite(c.longitude)) continue;
    items.push({
      id: p.id ? `google/${p.id}` : `google/${c.latitude},${c.longitude}`,
      kind: "hospital",
      name: p.displayName?.text || "Hospital / centro de urgencias",
      lat: c.latitude,
      lon: c.longitude,
      address: p.formattedAddress || "",
      phone: p.nationalPhoneNumber || p.internationalPhoneNumber || "",
      emergency: true,
      openNow: typeof p.currentOpeningHours?.openNow === "boolean" ? p.currentOpeningHours.openNow : null,
      distanceKm: Math.round(haversineKm(lat, lon, c.latitude, c.longitude) * 10) / 10,
      // Se prefiere el enlace canónico de Google al lugar; el de direcciones
      // como respaldo cuando Places no lo devuelve.
      mapsUrl: p.googleMapsUri || `https://www.google.com/maps/dir/?api=1&destination=${c.latitude},${c.longitude}`
    });
  }
  items.sort((a, b) => a.distanceKm - b.distanceKm);
  return { items, source: "Google Maps (Places API)" };
}
