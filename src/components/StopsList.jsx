export default function StopsList({ stops, optimizedOrder, onRemove }) {
  if (stops.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem 1rem", color: "#9ca3af", fontSize: 13 }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>📦</div>
        <p>Nessuna fermata aggiunta.<br />Inserisci gli indirizzi qui sopra.</p>
      </div>
    );
  }

  const isOptimized = !!optimizedOrder;
  const display = isOptimized
    ? optimizedOrder.map((origIdx, pos) => ({ ...stops[origIdx], origIdx, pos: pos + 1 }))
    : stops.map((s, i) => ({ ...s, origIdx: i, pos: i + 1 }));

  return (
    <div style={{ marginBottom: 12 }}>
      {isOptimized && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          background: "#dcfce7", color: "#15803d",
          fontSize: 11, padding: "3px 8px", borderRadius: 6, marginBottom: 10,
        }}>
          ✓ Percorso ottimizzato
        </div>
      )}
      <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {isOptimized ? "Ordine ottimale" : "Fermate inserite"} ({stops.length})
      </div>
      {display.map((s, idx) => (
        <div key={s.origIdx}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 10px", background: "#fff",
            border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 4,
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
              background: isOptimized ? "#dcfce7" : "#f3f4f6",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 600,
              color: isOptimized ? "#15803d" : "#6b7280",
            }}>
              {s.pos}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13 }}>{s.address}</div>
              {isOptimized && (
                <div style={{ fontSize: 11, color: "#9ca3af" }}>Originale: #{s.origIdx + 1}</div>
              )}
            </div>
            <button onClick={() => onRemove(s.origIdx)} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#d1d5db", fontSize: 16, padding: 2,
            }}>✕</button>
          </div>
          {idx < display.length - 1 && (
            <div style={{ textAlign: "center", color: "#d1d5db", fontSize: 11, marginBottom: 4 }}>↓</div>
          )}
        </div>
      ))}
    </div>
  );
}
