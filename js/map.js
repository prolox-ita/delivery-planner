// Inizializzazione Leaflet e rendering marker/percorso
let map, markersLayer, routeLayer;

function initMap() {
  map = L.map('map', { zoomControl: true }).setView(depot.coords, 11);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
  }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);
  routeLayer = L.geoJSON(null, { style: { color: '#01696f', weight: 5, opacity: .85 } }).addTo(map);
  renderMapMarkers();
}

function renderMapMarkers() {
  markersLayer.clearLayers();
  const depotMarker = L.marker(depot.coords)
    .bindPopup(`<strong>${escapeHtml(depot.name)}</strong><br>${escapeHtml(depot.address)}`);
  markersLayer.addLayer(depotMarker);
  deliveries.forEach((d, i) => {
    if (!d.coords) return;
    const marker = L.marker(d.coords)
      .bindPopup(`<strong>${escapeHtml(d.name)}</strong><br>${escapeHtml(d.label || d.address)}<br>Tappa ${i + 1}`);
    markersLayer.addLayer(marker);
  });
}

function setRouteSummary(title, text) {
  document.getElementById('route-summary').innerHTML =
    `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(text)}</span>`;
}

function toggleMap() {
  const wrap = document.querySelector('.map-wrap');
  const hidden = wrap.classList.toggle('map-hidden');
  const btn = document.getElementById('btn-map-toggle');
  if (btn) btn.classList.toggle('active', hidden);
  if (!hidden) map.invalidateSize();
}
