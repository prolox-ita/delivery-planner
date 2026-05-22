const STATUS_STYLE = {
  delivered: { background: "#f0fdf4", border: "1px solid #bbf7d0" },
  standby:   { background: "#fffbeb", border: "1px solid #fde68a" },
  default:   { background: "#fff",    border: "1px solid #e5e7eb" },
};

function StopCard({ s, isOptimized, onRemove, onMark }) {
  const st = s.status;
  const style = STATUS_STYLE[st] || STATUS_STYLE.default;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "8px 10px", borderRadius: 8, marginBottom: 4,
      ...style,
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

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13,
          textDecoration: st === "delivered" ? "line-through" : "none",
          color: st === "delivered" ? "#86efac" : st === "standby" ? "#92400e" : "inherit",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {s.address}
        </div>
        {isOptimized && (
          <div style={{ fontSize: 11, color: "#9ca3af" }}>Originale: #{s.origIdx + 1}</div>
        )}
        {st === "delivered" && (
          <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 500 }}>✓ Consegnato</div>
        )}
        {st === "standby" && (
          <div style={{ fontSize: 11, color: "#d97706", fontWeight: 500 }}>⏸ Assente</div>
        )}
      </div>

      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
        <button
          onClick={() => onMark(s.origIdx, st === "delivered" ? null : "delivered")}
          title="Consegnato"
          style={{
            width: 28, height: 28, borderRadius: 6, border: "none",
            cursor: "pointer", fontSize: 14,
            background: st === "delivered" ? "#16a34a" : "#f3f4f6",
            color: st === "delivered" ? "#fff" : "#6b7280",
          }}
        >✓</button>
        <button
          onClick={() => onMark(s.origIdx, st === "standby" ? null : "standby")}
          title="Destinatario assente"
          style={{
            width: 28, height: 28, borderRadius: 6, border: "none",
            cursor: "pointer", fontSize: 14,
            background: st === "standby" ? "#d97706" : "#f3f4f6",
            color: st === "standby" ? "#fff" : "#6b7280",
          }}
        >⏸</button>
        <button
          onClick={() => onRemove(s.origIdx)}
          title="Rimuovi"
          style={{
            width: 28, height: 28, borderRadius: 6, border: "none",
            cursor: "pointer", fontSize: 13,
            background: "none", color: "#d1d5db",
          }}
        >✕</button>
      </div>
    </div>
  );
}

export default function StopsList({ stops, optimizedOrder, onRemove, onMark }) {
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

  const delivered = stops.filter(s => s.status === "delivered").length;
  const standby   = stops.filter(s => s.status === "standby").length;

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        {isOptimized && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            background: "#dcfce7", color: "#15803d",
            fontSize: 11, padding: "3px 8px", borderRadius: 6,
          }}>✓ Percorso ottimizzato</span>
        )}
        {delivered > 0 && (
          <span style={{
            fontSize: 11, padding: "3px 8px", borderRadius: 6,
            background: "#f0fdf4", color: "#16a34a",
          }}>✓ {delivered} consegnate</span>
        )}
        {standby > 0 && (
          <span style={{
            fontSize: 11, padding: "3px 8px", borderRadius: 6,
            background: "#fffbeb", color: "#d97706",
          }}>⏸ {standby} assenti</span>
        )}
      </div>

      <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {isOptimized ? "Ordine ottimale" : "Fermate inserite"} ({stops.length})
      </div>

      {display.map((s, idx) => (
        <div key={s.origIdx}>
          <StopCard s={s} isOptimized={isOptimized} onRemove={onRemove} onMark={onMark} />
          {idx < display.length - 1 && (
            <div style={{ textAlign: "center", color: "#d1d5db", fontSize: 11, marginBottom: 4 }}>↓</div>
          )}
        </div>
      ))}
    </div>
  );
}
