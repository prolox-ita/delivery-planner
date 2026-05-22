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
  const num = a.house_number || "";
  const city = a.city || a.town || a.village || a.municipality || "";
  const postcode = a.postcode || "";
  let line = road + (num ? ` ${num}` : "");
  if (city) line += `, ${city}`;
  if (postcode) line += ` (${postcode})`;
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
