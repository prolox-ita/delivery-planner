// Chiamate alle API di OpenRouteService

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

function saveApiKey() {
  orsApiKey = document.getElementById('ors-key').value.trim();
  updateKeyStatus(
    orsApiKey ? 'Key inserita. Ora puoi testarla o usare subito l\'app.' : 'Nessuna key inserita.',
    !!orsApiKey
  );
}

function saveApiKeyFromModal() {
  const val = document.getElementById('ors-key-modal').value.trim();
  document.getElementById('ors-key').value = val;
  saveApiKey();
  closeModal();
}

function updateKeyStatus(msg, ok = false) {
  const el = document.getElementById('key-status');
  el.className = 'notice ' + (ok ? 'notice-info' : 'notice-muted');
  el.textContent = msg;
}

async function testApiKey() {
  if (!document.getElementById('ors-key').value.trim()) {
    updateKeyStatus('Incolla prima la API key.', false);
    return;
  }
  saveApiKey();
  updateKeyStatus('Sto verificando la key...', true);
  try {
    const url = `https://api.openrouteservice.org/geocode/search?api_key=${encodeURIComponent(orsApiKey)}&text=${encodeURIComponent('Bari')}&size=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (!data.features?.length) throw new Error();
    updateKeyStatus('Key valida: ORS risponde correttamente.', true);
  } catch {
    updateKeyStatus('Non riesco a usare la key: controlla di averla copiata bene.', false);
  }
}
