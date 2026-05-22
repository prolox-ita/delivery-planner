export default function OriginCard({ status, label, errorMsg, onRetry }) {
  const isLoading = status === "loading";
  const isError = status === "error";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: "#fff", border: "1px solid #e5e7eb",
      borderRadius: 12, padding: "10px 12px", marginBottom: 12,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
        background: isError ? "#fee2e2" : "#dcfce7",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16,
      }}>
        {isLoading ? "⏳" : isError ? "📵" : "📍"}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "#9ca3af" }}>Partenza (posizione attuale)</div>
        <div style={{ fontSize: 13, fontWeight: 500, marginTop: 1 }}>
          {isLoading && "Rilevamento in corso..."}
          {isError && (errorMsg || "Posizione non disponibile")}
          {status === "ok" && label}
        </div>
      </div>
      {isError && (
        <button onClick={onRetry} style={{
          background: "none", border: "1px solid #d1d5db",
          borderRadius: 8, padding: "4px 8px", fontSize: 12,
          cursor: "pointer", color: "#6b7280", whiteSpace: "nowrap",
        }}>
          🔄 Riprova
        </button>
      )}
    </div>
  );
}
