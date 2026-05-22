import { useState } from "react";

const DEMO_STOPS = [
  "Via Garibaldi 3, Milano",
  "Corso Buenos Aires 45, Milano",
  "Via Torino 8, Milano",
  "Piazza Duomo 1, Milano",
  "Via Montenapoleone 12, Milano",
];

export default function StopInput({ onAdd, onLoadDemo }) {
  const [value, setValue] = useState("");

  function handleAdd() {
    const v = value.trim();
    if (!v) return;
    onAdd(v);
    setValue("");
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Es. Via Roma 12, Milano"
          style={{
            flex: 1, padding: "8px 12px", fontSize: 14,
            border: "1px solid #d1d5db", borderRadius: 8, outline: "none",
          }}
        />
        <button onClick={handleAdd} style={{
          padding: "0 16px", fontSize: 14, fontWeight: 500,
          background: "#fff", border: "1px solid #d1d5db",
          borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap",
        }}>
          + Aggiungi
        </button>
      </div>
      {onLoadDemo && (
        <button onClick={() => DEMO_STOPS.forEach(onAdd)} style={{
          marginTop: 6, background: "none", border: "none",
          fontSize: 12, color: "#9ca3af", cursor: "pointer", padding: 0,
        }}>
          ✨ Carica fermate di esempio
        </button>
      )}
    </div>
  );
}
