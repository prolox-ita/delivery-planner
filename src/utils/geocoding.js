const BASE = "https://nominatim.openstreetmap.org";

export async function searchAddress(query) {
  const url = `${BASE}/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=it`;
  const res = await fetch(url, { headers: { "Accept-Language": "it" } });
  if (!res.ok) throw new Error("search failed");
  return res.json();
}

export function formatAddress(result, originalQuery = "") {
  const a = result.address || {};
  const road = a.road || a.pedestrian || a.footway || "";

  let num = a.house_number || "";

  // Nominatim non mette house_number per indirizzi interpolati:
  // prova prima nel display_name subito dopo il nome della via
  if (!num && road && result.display_name) {
    const parts = result.display_name.split(",").map(p => p.trim());
    const roadIdx = parts.findIndex(p => p.toLowerCase() === road.toLowerCase());
    if (roadIdx >= 0 && /^\d+[a-zA-Z]?$/.test(parts[roadIdx + 1] || "")) {
      num = parts[roadIdx + 1];
    }
  }

  // Ultimo fallback: estrai il civico dalla query originale dell'utente.
  // Prende l'ultimo numero nella parte prima della virgola (evita di matchare
  // numeri civici nelle strade tipo "Via 4 Novembre 12" → prende 12).
  if (!num && originalQuery) {
    const streetPart = originalQuery.split(",")[0];
    const matches = streetPart.match(/\b(\d+[a-zA-Z]?)\b/g);
    if (matches) num = matches[matches.length - 1];
  }

  const city = a.city || a.town || a.village || a.municipality || "";
  let line = road + (num ? ` ${num}` : "");
  if (city) line += `, ${city}`;
  return line || result.display_name.split(",").slice(0, 3).join(",").trim();
}

function normalize(str) {
  return str.toLowerCase().replace(/[,\.]/g, " ").replace(/\s+/g, " ").trim();
}

export function isDuplicate(newStop, existingStops) {
  return existingStops.some(s => normalize(newStop.address) === normalize(s.address));
}
