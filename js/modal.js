// Gestione modal e CRUD consegne

function openModal(type) {
  const settingsView = document.getElementById('settings-view');
  const deliveryView = document.getElementById('delivery-view');
  const saveBtn = document.getElementById('modal-save-btn');

  if (type === 'settings') {
    document.getElementById('modal-title').textContent = 'Configura API key';
    document.getElementById('modal-subtitle').textContent = 'Incolla la tua key gratuita di openrouteservice.';
    settingsView.style.display = 'flex';
    deliveryView.style.display = 'none';
    saveBtn.onclick = saveApiKeyFromModal;
    saveBtn.innerHTML = '<i data-lucide="save"></i> Salva key';
    document.getElementById('ors-key-modal').value = orsApiKey;
  } else {
    document.getElementById('modal-title').textContent = editingId ? 'Modifica consegna' : 'Nuova consegna';
    document.getElementById('modal-subtitle').textContent = 'Inserisci un indirizzo reale da geocodificare.';
    settingsView.style.display = 'none';
    deliveryView.style.display = 'flex';
    saveBtn.onclick = saveDelivery;
    saveBtn.innerHTML = '<i data-lucide="save"></i> Salva';
  }
  document.getElementById('modal').classList.add('open');
  lucide.createIcons();
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

function closeModalOnBackdrop(e) {
  if (e.target.id === 'modal') closeModal();
}

function fillForm(delivery = null) {
  document.getElementById('f-name').value     = delivery?.name     || '';
  document.getElementById('f-priority').value = delivery?.priority || 'media';
  document.getElementById('f-address').value  = delivery?.address  || '';
  document.getElementById('f-city').value     = delivery?.city     || '';
  document.getElementById('f-time').value     = delivery?.time     || '';
  document.getElementById('f-notes').value    = delivery?.notes    || '';
}

async function saveDelivery() {
  const name    = document.getElementById('f-name').value.trim();
  const address = document.getElementById('f-address').value.trim();
  const city    = document.getElementById('f-city').value.trim();
  if (!name || !address) { alert('Inserisci almeno nome e indirizzo.'); return; }
  if (!orsApiKey && !document.getElementById('ors-key').value.trim()) {
    alert('Prima incolla la API key gratuita ORS.');
    return;
  }
  saveApiKey();
  const fullAddress = [address, city].filter(Boolean).join(', ');
  try {
    const geo = await geocodeAddress(fullAddress);
    const payload = {
      name,
      priority: document.getElementById('f-priority').value,
      address, city,
      time:  document.getElementById('f-time').value,
      notes: document.getElementById('f-notes').value.trim(),
      status: 'geocoded',
      coords: [geo.lat, geo.lon],
      label: geo.label,
    };
    if (editingId) {
      const idx = deliveries.findIndex(d => d.id === editingId);
      deliveries[idx] = { ...deliveries[idx], ...payload };
    } else {
      deliveries.push({ id: nextId++, ...payload });
    }
    editingId = null;
    closeModal();
    renderAll();
    map.flyTo([geo.lat, geo.lon], 13, { duration: 1.2 });
  } catch {
    alert('Non sono riuscito a trovare questo indirizzo. Prova a scriverlo in modo più completo, es.: Via X 12, Bari.');
  }
}

function editDelivery(id) {
  const d = deliveries.find(x => x.id === id);
  if (!d) return;
  editingId = id;
  fillForm(d);
  openModal('delivery');
}

function newDelivery() {
  editingId = null;
  fillForm();
  openModal('delivery');
}

function deleteDelivery(id) {
  deliveries = deliveries.filter(d => d.id !== id);
  renderAll();
}

function addDemoData() {
  deliveries = [
    { id: nextId++, name: 'Farmacia Centrale',    priority: 'alta',  address: 'Via Sparano da Bari 139', city: 'Bari', time: '09:00', notes: 'Consegna prioritaria', status: 'pending', coords: null },
    { id: nextId++, name: 'Studio Legale Rossi',  priority: 'media', address: 'Corso Cavour 53',         city: 'Bari', time: '10:30', notes: '',                   status: 'pending', coords: null },
    { id: nextId++, name: 'Panificio San Nicola', priority: 'bassa', address: 'Via Nicolai 75',          city: 'Bari', time: '12:00', notes: 'Scarico sul retro',   status: 'pending', coords: null },
  ];
}
