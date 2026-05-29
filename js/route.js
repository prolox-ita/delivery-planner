// Ottimizzazione percorso e apertura Google Maps

function priorityWeight(priority) {
  return priority === 'alta' ? 0 : priority === 'media' ? 1 : 2;
}

function timeValue(t) {
  if (!t) return 9999;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

// Ordine ottimale tramite ORS /optimization (Vroom — tempi stradali reali)
async function optimizeOrderORS(items) {
  const jobs = items.map((d, i) => ({
    id: i,
    location: [d.coords[1], d.coords[0]], // [lon, lat]
    // time_windows opzionale: se l'utente ha messo un orario preferito usiamolo come finestra
    ...(d.time ? { time_windows: [[timeValue(d.time) * 60, timeValue(d.time) * 60 + 3600]] } : {}),
    // priorità come priority_factor (1 = alta, 2 = media, 3 = bassa)
    priority: priorityWeight(d.priority) + 1,
  }));

  const body = {
    jobs,
    vehicles: [{
      id: 0,
      profile: 'driving-car',
      start: [depot.coords[1], depot.coords[0]],
    }],
  };

  const res = await fetch('https://api.openrouteservice.org/optimization', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': orsApiKey },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('ORS optimization failed: ' + res.status);
  const data = await res.json();

  const steps = data.routes?.[0]?.steps ?? [];
  // steps ha tipo "start", "job", "end" — teniamo solo i job nell'ordine restituito
  const ordered = steps
    .filter(s => s.type === 'job')
    .map(s => items[s.id]);
  if (!ordered.length) throw new Error('Risposta optimization vuota');
  return ordered;
}

async function optimizeRoute() {
  if (!orsApiKey) {
    alert('Prima configura la API key ORS (bottone in alto).');
    return;
  }
  const valid = deliveries.filter(d => Array.isArray(d.coords));
  if (!valid.length) { alert('Aggiungi almeno una consegna valida.'); return; }

  setRouteSummary('Calcolo in corso…', 'Chiedo a ORS il percorso ottimale su strade reali…');

  try {
    let ordered;
    try {
      ordered = await optimizeOrderORS(valid);
    } catch (e) {
      console.warn('ORS optimization fallback al nearest-neighbour:', e.message);
      ordered = sortStopsHeuristicFallback(valid);
    }

    deliveries = [...ordered, ...deliveries.filter(d => !Array.isArray(d.coords))];
    const coords = [depot.coords, ...ordered.map(d => d.coords)];
    const geojson = await fetchRouteGeoJSON(coords);
    routeLayer.clearLayers();
    routeLayer.addData(geojson);
    const bounds = routeLayer.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [30, 30] });
    deliveries = deliveries.map(d => Array.isArray(d.coords) ? { ...d, status: 'routed' } : d);
    renderAll();
    const summary = geojson.features?.[0]?.properties?.summary || {};
    const km   = ((summary.distance || 0) / 1000).toFixed(1);
    const mins = Math.round((summary.duration || 0) / 60);
    setRouteSummary('Percorso ottimizzato', `${ordered.length} tappe · ${km} km · ${mins} min`);
  } catch {
    setRouteSummary('Errore nel calcolo', 'Controlla la key ORS o gli indirizzi inseriti.');
    alert('Non sono riuscito a calcolare il percorso. Controlla la API key o gli indirizzi inseriti.');
  }
}

// Fallback nearest-neighbour (usato solo se ORS /optimization è irraggiungibile)
function sortStopsHeuristicFallback(items) {
  function haversineKm(a, b) {
    const R = 6371;
    const dLat = (b[0] - a[0]) * Math.PI / 180;
    const dLon = (b[1] - a[1]) * Math.PI / 180;
    const s = Math.sin(dLat / 2) ** 2
      + Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  }
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

function buildGoogleMapsUrl() {
  if (!deliveries.length) return null;
  const stops = deliveries.filter(d => Array.isArray(d.coords)).slice(0, 10);
  if (!stops.length) return null;
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
