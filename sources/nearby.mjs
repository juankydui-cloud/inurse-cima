import { searchNearby as searchOverpass } from "./overpass.mjs";
import { searchHospitals as searchGoogle, hasGoogle } from "./googleplaces.mjs";

// Enrutador de "servicios sanitarios cercanos".
//
// Por qué hay dos proveedores y no uno:
//
//   · Hospitales y urgencias → Google Maps. La cobertura de OpenStreetMap en
//     España es desigual (centros sin nombre, sin dirección o sin registrar),
//     y además los mirrors públicos de Overpass se saturan y responden HTML
//     de error o tardan medio minuto. Google es la fuente que se pidió.
//
//   · Desfibriladores (DEA) → OpenStreetMap, siempre. Google Places no tiene
//     ninguna categoría de DEA: no es que dé peores resultados, es que no
//     tiene el dato. Migrar también esta parte sería quitar la función.
//
// Si no hay clave de Google configurada, todo vuelve a Overpass tal y como
// funcionaba antes: la app nunca se queda sin búsqueda por un ajuste que
// falte en el servidor.

export function nearbyProviders() {
  return { hospital: hasGoogle() ? "google" : "overpass", aed: "overpass" };
}

export async function searchNearby(lat, lon, { radius = 5000, kinds = ["hospital", "aed"] } = {}) {
  const wantsHospital = kinds.includes("hospital");
  const wantsAed = kinds.includes("aed");
  const useGoogle = wantsHospital && hasGoogle();

  const notices = [];
  let items = [];

  // Las dos consultas son independientes: se lanzan a la vez para no sumar
  // latencias, y se resuelven por separado para que el fallo de una no deje
  // al usuario sin la otra. En urgencias, media lista es mucho mejor que un
  // mensaje de error.
  // Las dos consultas van en paralelo, así que el orden de llegada es azaroso:
  // la atribución se ordenaría distinta en cada búsqueda. Se guarda por clave y
  // se compone al final en un orden fijo, con la fuente de los hospitales
  // primero, que es la que sostiene el grueso de la lista. De paso, cuando
  // Google falla y los hospitales acaban saliendo también de Overpass, la
  // misma fuente no se cita dos veces.
  const bySlot = {};
  const addSource = (slot, name) => { if (name) bySlot[slot] = name; };

  const jobs = [];

  if (wantsHospital) {
    jobs.push(
      (useGoogle
        ? searchGoogle(lat, lon, { radius }).catch(async err => {
            // Clave caducada, cuota agotada, facturación sin activar… Se
            // recurre a Overpass en vez de dejar la búsqueda en nada, y se
            // dice de dónde salen los datos para no aparentar precisión que
            // no se tiene.
            notices.push("Google Maps no ha respondido (" + err.message + "); hospitales obtenidos de OpenStreetMap.");
            return searchOverpass(lat, lon, { radius, kinds: ["hospital"] });
          })
        : searchOverpass(lat, lon, { radius, kinds: ["hospital"] })
      ).then(r => { items = items.concat(r.items); addSource("hospital", r.source); })
       .catch(err => { notices.push("No se han podido buscar hospitales: " + err.message); })
    );
  }

  if (wantsAed) {
    jobs.push(
      searchOverpass(lat, lon, { radius, kinds: ["aed"] })
        .then(r => { items = items.concat(r.items); addSource("aed", r.source); })
        .catch(err => { notices.push("No se han podido buscar desfibriladores: " + err.message); })
    );
  }

  await Promise.all(jobs);

  // Si no ha respondido ni un proveedor no se devuelve una lista vacía como
  // si el sitio estuviera desierto: eso induciría a pensar que no hay nada
  // cerca. Se propaga el fallo y la app muestra "no se ha podido buscar".
  const sources = [bySlot.hospital, bySlot.aed].filter((v, i, arr) => v && arr.indexOf(v) === i);

  if (!items.length && notices.length && !sources.length) {
    throw new Error(notices.join(" "));
  }

  items.sort((a, b) => a.distanceKm - b.distanceKm);
  return { items, source: sources.join(" · ") || "Sin fuente", notices };
}
