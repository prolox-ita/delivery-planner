import { useState, useEffect } from "react";

// Converte coordinate in indirizzo leggibile tramite OpenStreetMap (gratuito, no API key)
// In produzione puoi sostituire con Google Geocoding API per maggiore precisione
async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
  const res = await fetch(url, { headers: { "Accept-Language": "it" } });
  const data = await res.json();
  const a = data.address;
  const parts = [a.road, a.house_number, a.city || a.town || a.village].filter(Boolean);
  return parts.join(", ") || data.display_name.split(",").slice(0, 2).join(",");
}

export default function useGeolocation() {
  const [coords, setCoords] = useState(null);   // { lat, lng }
  const [label, setLabel] = useState(null);     // indirizzo in chiaro
  const [status, setStatus] = useState("loading"); // "loading" | "ok" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  function getLocation() {
    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMsg("GPS non disponibile su questo dispositivo");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        try {
          const addr = await reverseGeocode(c.lat, c.lng);
          setLabel(addr);
        } catch {
          setLabel(`${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}`);
        }
        setStatus("ok");
      },
      (err) => {
        const msgs = {
          1: "Permesso GPS negato — abilita la posizione",
          2: "Posizione non disponibile",
          3: "Timeout GPS — riprova",
        };
        setErrorMsg(msgs[err.code] || "Errore GPS sconosciuto");
        setStatus("error");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  useEffect(() => { getLocation(); }, []);

  return { coords, label, status, errorMsg, retry: getLocation };
}
