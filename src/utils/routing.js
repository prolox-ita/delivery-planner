// ─────────────────────────────────────────────
//  OTTIMIZZAZIONE PERCORSO
// ─────────────────────────────────────────────

// TODO: sostituire questa funzione con la chiamata reale a Google Directions API
// Documentazione: https://developers.google.com/maps/documentation/directions/get-directions
// Parametro chiave: &waypoints=optimize:true|addr1|addr2|...
// La risposta include `geocoded_waypoints[].waypoint_order` con l'ordine ottimale

// Simulazione locale: divide in cluster da MAX_CLUSTER fermate,
// ottimizza ogni cluster separatamente (gestisce 25+ fermate)
const MAX_CLUSTER = 8;

function shuffleArray(arr) {
  const s = [...arr];
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [s[i], s[j]] = [s[j], s[i]];
  }
  return s;
}

export async function optimizeStops(stops, originCoords) {
  // Simula un piccolo delay come se chiamasse un'API
  await new Promise((r) => setTimeout(r, 800));

  const indices = stops.map((_, i) => i);

  if (stops.length <= 25) {
    // Sotto 25 fermate: ottimizza tutto insieme
    return shuffleArray(indices);
  } else {
    // Sopra 25 fermate: clustering geografico → ottimizza ogni cluster
    // TODO: ordinare i cluster per direzione geografica usando originCoords
    const clusters = [];
    for (let i = 0; i < indices.length; i += MAX_CLUSTER) {
      clusters.push(indices.slice(i, i + MAX_CLUSTER));
    }
    return clusters.flatMap((c) => shuffleArray(c));
  }
}

// ─────────────────────────────────────────────
//  COSTRUZIONE URL GOOGLE MAPS
// ─────────────────────────────────────────────

export function buildMapsUrl(stops, optimizedOrder, originLabel, originCoords) {
  const ordered = optimizedOrder.map((i) => stops[i].address);

  // Punto di partenza: posizione GPS reale > indirizzo rilevato > prima fermata
  let origin;
  if (originCoords) {
    origin = `${originCoords.lat},${originCoords.lng}`;
  } else if (originLabel) {
    origin = encodeURIComponent(originLabel);
  } else {
    origin = encodeURIComponent(ordered[0]);
  }

  const destination = encodeURIComponent(ordered[ordered.length - 1]);
  const waypoints = ordered
    .slice(0, -1)
    .map((a) => encodeURIComponent(a))
    .join("|");

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  if (waypoints) url += `&waypoints=${waypoints}`;
  url += "&travelmode=driving";

  return url;
}
