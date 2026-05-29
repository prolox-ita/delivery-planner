// Aggiornamento DOM: lista consegne, tappe, KPI

function renderDeliveryList() {
  const el = document.getElementById('delivery-list');
  if (!deliveries.length) {
    el.innerHTML = `<div class="notice notice-muted">Nessuna consegna inserita.</div>`;
    return;
  }
  el.innerHTML = deliveries.map((d, i) => `
    <div class="delivery-item">
      <div class="rank">${i + 1}</div>
      <div>
        <div style="font-weight:700;font-size:var(--text-sm)">${escapeHtml(d.name)}</div>
        <div style="font-size:var(--text-xs);color:var(--color-text-muted)">${escapeHtml(d.address)}${d.city ? ', ' + escapeHtml(d.city) : ''}</div>
        <div class="meta">
          <span class="pill ${d.status === 'routed' ? 'inprogress' : 'pending'}">${escapeHtml(statusLabel[d.status] || 'Da fare')}</span>
          ${d.priority === 'alta' ? '<span class="pill high">Alta priorità</span>' : ''}
          ${d.time ? `<span class="pill pending">${escapeHtml(d.time)}</span>` : ''}
        </div>
      </div>
      <div class="actions">
        <button class="btn btn-secondary" onclick="editDelivery(${d.id})">Modifica</button>
        <button class="btn btn-secondary" onclick="deleteDelivery(${d.id})">Elimina</button>
      </div>
    </div>
  `).join('');
}

function renderSteps() {
  const el = document.getElementById('step-list');
  if (!deliveries.length) {
    el.innerHTML = `<div class="notice notice-muted">Aggiungi una consegna per vedere qui l'ordine del giro.</div>`;
    return;
  }
  const routeExists = routeLayer.getLayers().length > 0;
  el.innerHTML = `
    <div class="delivery-item">
      <div class="rank">P</div>
      <div>
        <div style="font-weight:700;font-size:var(--text-sm)">Deposito</div>
        <div style="font-size:var(--text-xs);color:var(--color-text-muted)">${escapeHtml(depot.address)}</div>
      </div>
      <div></div>
    </div>
    ${deliveries.map((d, i) => `
      <div class="delivery-item">
        <div class="rank">${i + 1}</div>
        <div>
          <div style="font-weight:700;font-size:var(--text-sm)">${escapeHtml(d.name)}</div>
          <div style="font-size:var(--text-xs);color:var(--color-text-muted)">${escapeHtml(d.label || d.address)}</div>
          <div class="meta">
            ${d.time ? `<span class="pill pending">${escapeHtml(d.time)}</span>` : ''}
            ${d.notes ? `<span class="pill inprogress">Note</span>` : ''}
          </div>
        </div>
        <div style="font-size:var(--text-xs);color:var(--color-text-muted)">${routeExists ? 'Nel percorso' : 'Pronta'}</div>
      </div>
    `).join('')}
  `;
}

function renderKpis() {
  const total    = deliveries.length;
  const geocoded = deliveries.filter(d => d.coords).length;
  const high     = deliveries.filter(d => d.priority === 'alta').length;
  const routed   = deliveries.filter(d => d.status === 'routed').length;
  document.getElementById('kpis').innerHTML = `
    <div class="kpi"><small>Consegne</small><strong>${total}</strong></div>
    <div class="kpi"><small>Indirizzi validi</small><strong>${geocoded}</strong></div>
    <div class="kpi"><small>Alta priorità</small><strong>${high}</strong></div>
    <div class="kpi"><small>Nel percorso</small><strong>${routed}</strong></div>
  `;
}

function renderAll() {
  renderDeliveryList();
  renderSteps();
  renderKpis();
  renderMapMarkers();
  lucide.createIcons();
}
