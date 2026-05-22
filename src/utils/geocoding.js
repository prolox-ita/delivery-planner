const BASE = "https://nominatim.openstreetmap.org";

export async function searchAddress(query) {
  const url = `${BASE}/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=it`;
  const res = await fetch(url, { headers: { "Accept-Language": "it" } });
  if (!res.ok) throw new Error("search failed");
  return res.json();
}

export function formatAddress(result) {
  const a = result.address || {};
  const road = a.road || a.pedestrian || a.footway || "";

  // Nominatim spesso non mette house_number negli indirizzi interpolati,
  // ma lo include nel display_name subito dopo il nome della via
  let num = a.house_number || "";
  if (!num && road && result.display_name) {
    const parts = result.display_name.split(",").map(p => p.trim());
    const roadIdx = parts.findIndex(p => p.toLowerCase() === road.toLowerCase());
    if (roadIdx >= 0 && /^\d+[a-zA-Z]?$/.test(parts[roadIdx + 1] || "")) {
      num = parts[roadIdx + 1];
    }
  }

  const city = a.city || a.town || a.village || a.municipality || "";
  // Il CAP di Nominatim è spesso quello del comune/area, non dell'indirizzo esatto → non mostrato
  let line = road + (num ? ` ${num}` : "");
  if (city) line += `, ${city}`;
  return line || result.display_name.split(",").slice(0, 3).join(",").trim();
}

function normalize(str) {
  return str.toLowerCase().replace(/[,\.]/g, " ").replace(/\s+/g, " ").trim();
}

export function isDuplicate(newStop, existingStops) {
  for (const s of existingStops) {
    if (newStop.placeId && s.placeId && newStop.placeId === s.placeId) return true;
    if (newStop.coords && s.coords) {
      const dlat = Math.abs(newStop.coords.lat - s.coords.lat);
      const dlng = Math.abs(newStop.coords.lng - s.coords.lng);
      if (dlat < 0.0003 && dlng < 0.0003) return true;
    }
    if (normalize(newStop.address) === normalize(s.address)) return true;
  }
  return false;
}
