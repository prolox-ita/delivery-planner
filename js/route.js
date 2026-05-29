// Ottimizzazione percorso e apertura Google Maps

function priorityWeight(priority) {
  return priority === 'alta' ? 0 : priority === 'media' ? 1 : 2;
}

function timeValue(t) {
  if (!t) return 9999;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function haversineKm(a, b) {
  const R = 6371;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLon = (b[1] - a[1]) * Math.PI / 180;
  const s = Math.sin(dLat / 2) ** 2
    + Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

// Nearest-neighbour greedy con peso su priorità e orario
function sortStopsHeuristic(items) {
  const remaining = [...items].sort(
    (a, b) => priorityWeight(a.priority) - priorityWeight(b.priority) || timeValue(a.time) - timeValue(b.time)
  );
  const result = [];
  let current = depot.coords;
  while (remaining.length) {
    let bestIdx = 0, bestScore = Infinity;
    remaining.forEach((d, i) => {
      const score = haversineKm(current, d.coords)
        + priorityWeight(d.priority) * 1.2
        + timeValue(d.time) / 2000;
      if (score < bestScore) { bestScore = score; bestIdx = i; }
    });
    const chosen = remaining.splice(bestIdx, 1)[0];
    result.push(chosen);
    current = chosen.coords;
  }
  return result;
}

async function optimizeRoute() {
  if (!orsApiKey) {
    alert('Prima configura la API key ORS (bottone in alto).');
    return;
  }
  const valid = deliveries.filter(d => Array.isArray(d.coords));
  if (!valid.length) { alert('Aggiungi almeno una consegna valida.'); return; }
  setRouteSummary('Calcolo in corso…', 'Sto geocodificando e chiedendo il percorso reale a ORS.');
  try {
    const ordered = sortStopsHeuristic(valid);
    deliveries = [...ordered];
    const coords = [depot.coords, ...ordered.map(d => d.coords)];
    const geojson = await fetchRouteGeoJSON(coords);
    routeLayer.clearLayers();
    routeLayer.addData(geojson);
    const bounds = routeLayer.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [30, 30] });
    deliveries = deliveries.map(d => ({ ...d, status: 'routed' }));
    renderAll();
    const summary = geojson.features?.[0]?.properties?.summary || {};
    const km   = ((summary.distance || 0) / 1000).toFixed(1);
    const mins = Math.round((summary.duration || 0) / 60);
    setRouteSummary('Percorso ottimizzato', `${deliveries.length} tappe · ${km} km · ${mins} minuti stimati`);
  } catch {
    setRouteSummary('Errore nel calcolo', 'Controlla la key ORS o prova con indirizzi più precisi.');
    alert('Non sono riuscito a calcolare il percorso reale. Controlla la API key o gli indirizzi inseriti.');
  }
}

function buildGoogleMapsUrl() {
  if (!deliveries.length) return null;
  const stops = deliveries.slice(0, 10);
  const destination = stops[stops.length - 1];
  const waypoints = stops.slice(0, -1).map(d => [d.address, d.city].filter(Boolean).join(', '));
  const params = new URLSearchParams({
    api: '1',
    origin: depot.address,
    destination: [destination.address, destination.city].filter(Boolean).join(', '),
    travelmode: 'driving',
  });
  if (waypoints.length) params.set('waypoints', waypoints.join('|'));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function openInGoogleMaps() {
  const url = buildGoogleMapsUrl();
  if (!url) { alert('Nessuna consegna disponibile.'); return; }
  window.open(url, '_blank', 'noopener,noreferrer');
}
