export default function ActionButtons({
  canOptimize, canOpenMaps, isOptimizing, onOptimize, onOpenMaps, stopCount
}) {
  const clusterCount = Math.ceil(stopCount / 8);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {stopCount > 25 && (
        <div style={{ fontSize: 12, color: "#6b7280", textAlign: "center" }}>
          {stopCount} fermate → suddivise in {clusterCount} zone geografiche
        </div>
      )}
      <button
        onClick={onOptimize}
        disabled={!canOptimize || isOptimizing}
        style={{
          width: "100%", padding: 10, fontSize: 14, fontWeight: 500,
          background: "#fff", border: "1px solid #d1d5db", borderRadius: 8,
          cursor: canOptimize ? "pointer" : "not-allowed",
          opacity: canOptimize ? 1 : 0.4,
        }}
      >
        {isOptimizing ? "⏳ Ottimizzazione..." : "✨ Ottimizza percorso"}
      </button>
      <button
        onClick={onOpenMaps}
        disabled={!canOpenMaps}
        style={{
          width: "100%", padding: 10, fontSize: 14, fontWeight: 500,
          background: canOpenMaps ? "#16a34a" : "#d1d5db",
          border: "none", borderRadius: 8, color: "#fff",
          cursor: canOpenMaps ? "pointer" : "not-allowed",
        }}
      >
        🗺️ Apri in Google Maps
      </button>
    </div>
  );
}
