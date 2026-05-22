export default function CurrentStop({ stops, optimizedOrder, onMark }) {
  if (!optimizedOrder) return null;

  const origIdx = optimizedOrder.find(i => stops[i]?.status === null);
  if (origIdx === undefined) return null;

  const stop = stops[origIdx];
  const position = optimizedOrder.indexOf(origIdx) + 1;
  const total = optimizedOrder.length;
  const done = optimizedOrder.filter(i => stops[i]?.status !== null).length;

  return (
    <div style={{
      background: "#1d4ed8", borderRadius: 14,
      padding: "14px 16px", marginBottom: 12, color: "#fff",
    }}>
      <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 4 }}>
        Fermata corrente · {position} di {total} · {done} completate
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, lineHeight: 1.3 }}>
        📦 {stop.address}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => onMark(origIdx, "delivered")}
          style={{
            flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
            background: "#16a34a", color: "#fff", fontSize: 15,
            fontWeight: 600, cursor: "pointer",
          }}
        >✓ Consegnato</button>
        <button
          onClick={() => onMark(origIdx, "standby")}
          style={{
            flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
            background: "#d97706", color: "#fff", fontSize: 15,
            fontWeight: 600, cursor: "pointer",
          }}
        >⏸ Assente</button>
      </div>
    </div>
  );
}
