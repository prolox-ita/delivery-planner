import { useState } from "react";
import AutocompleteInput from "./AutocompleteInput";

export default function OriginCard({ status, label, errorMsg, onRetry, manualOrigin, onSetManualOrigin }) {
  const [editing, setEditing] = useState(false);
  const isLoading = status === "loading";
  const isError = status === "error";

  if (editing) {
    return (
      <div style={{
        background: "#fff", border: "1px solid #3b82f6",
        borderRadius: 12, padding: "10px 12px", marginBottom: 12,
      }}>
        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>
          Inserisci punto di partenza
        </div>
        <AutocompleteInput
          onSelect={(data) => { onSetManualOrigin(data); setEditing(false); }}
          onCancel={() => setEditing(false)}
          placeholder="Es. Deposito, Via Roma 1, Milano"
          autoFocus
        />
        <button onClick={() => setEditing(false)} style={{
          marginTop: 6, background: "none", border: "none",
          fontSize: 12, color: "#9ca3af", cursor: "pointer", padding: 0,
        }}>Annulla</button>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: "#fff", border: "1px solid #e5e7eb",
      borderRadius: 12, padding: "10px 12px", marginBottom: 12,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
        background: manualOrigin ? "#eff6ff" : isError ? "#fee2e2" : "#dcfce7",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16,
      }}>
        {manualOrigin ? "✏️" : isLoading ? "⏳" : isError ? "📵" : "📍"}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: "#9ca3af" }}>
          Partenza {manualOrigin ? "(manuale)" : "(posizione attuale)"}
        </div>
        <div style={{
          fontSize: 13, fontWeight: 500, marginTop: 1,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {manualOrigin
            ? manualOrigin.address
            : isLoading ? "Rilevamento in corso..."
            : isError ? (errorMsg || "Posizione non disponibile")
            : label}
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
        {!manualOrigin && isError && (
          <button onClick={onRetry} style={{
            background: "none", border: "1px solid #d1d5db",
            borderRadius: 8, padding: "4px 8px", fontSize: 12,
            cursor: "pointer", color: "#6b7280", whiteSpace: "nowrap",
          }}>🔄 Riprova</button>
        )}
        {manualOrigin && (
          <button onClick={() => onSetManualOrigin(null)} style={{
            background: "none", border: "1px solid #d1d5db",
            borderRadius: 8, padding: "4px 8px", fontSize: 12,
            cursor: "pointer", color: "#6b7280", whiteSpace: "nowrap",
          }}>📍 GPS</button>
        )}
        <button onClick={() => setEditing(true)} style={{
          background: "none", border: "1px solid #d1d5db",
          borderRadius: 8, padding: "4px 8px", fontSize: 12,
          cursor: "pointer", color: "#6b7280", whiteSpace: "nowrap",
        }}>✏️ Manuale</button>
      </div>
    </div>
  );
}
