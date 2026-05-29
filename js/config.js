// Stato globale condiviso tra tutti i moduli
let orsApiKey = '';
let deliveries = [];
let editingId = null;
let nextId = 1;

const depot = { name: 'Deposito', address: 'Bari', coords: [41.1171, 16.8719] };
const statusLabel = { pending: 'Da fare', geocoded: 'Geocodificata', routed: 'In percorso' };

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
