// Chiamate alle API di OpenRouteService + gestione persistenza key

async function geocodeAddress(addressText) {
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${encodeURIComponent(orsApiKey)}&text=${encodeURIComponent(addressText)}&size=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Errore geocoding');
  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) throw new Error('Indirizzo non trovato');
  const [lon, lat] = feature.geometry.coordinates;
  return { lat, lon, label: feature.properties?.label || addressText };
}

async function fetchRouteGeoJSON(coords) {
  const res = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': orsApiKey },
    body: JSON.stringify({ coordinates: coords.map(c => [c[1], c[0]]) }),
  });
  if (!res.ok) throw new Error('Errore directions');
  return res.json();
}

// Salva la key in memoria e in localStorage, aggiorna UI
function saveApiKey(key) {
  orsApiKey = key.trim();
  if (orsApiKey) {
    localStorage.setItem('orsApiKey', orsApiKey);
  } else {
    localStorage.removeItem('orsApiKey');
  }
  updateApiKeyButton();
  updateKeyStatus(
    orsApiKey ? 'Key salvata nel browser.' : 'Nessuna key salvata.',
    !!orsApiKey
  );
}

// Chiamata dal bottone "Salva" nel modal impostazioni
function saveApiKeyFromModal() {
  saveApiKey(document.getElementById('ors-key-modal').value);
  closeModal();
}

function updateKeyStatus(msg, ok = false) {
  const el = document.getElementById('key-status');
  if (!el) return;
  el.className = 'notice ' + (ok ? 'notice-info' : 'notice-muted');
  el.textContent = msg;
}

// Aggiorna il bottone API key nella topbar (verde se key presente)
function updateApiKeyButton() {
  const btn = document.getElementById('btn-api-key');
  if (!btn) return;
  btn.className = orsApiKey ? 'btn btn-key-active' : 'btn btn-secondary';
}

async function testApiKey() {
  if (!orsApiKey) {
    updateKeyStatus('Incolla prima la API key e salvala.', false);
    return;
  }
  updateKeyStatus('Sto verificando la key...', true);
  try {
    const url = `https://api.openrouteservice.org/geocode/search?api_key=${encodeURIComponent(orsApiKey)}&text=${encodeURIComponent('Bari')}&size=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (!data.features?.length) throw new Error();
    updateKeyStatus('Key valida: ORS risponde correttamente.', true);
  } catch {
    updateKeyStatus('Key non valida o quota esaurita.', false);
  }
}
