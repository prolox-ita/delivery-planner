import { useState, useRef, useEffect } from "react";
import { searchAddress, formatAddress, isDuplicate } from "../utils/geocoding";

export default function StopInput({ onAdd, stops }) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const [warning, setWarning] = useState("");
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
        setFocusedIdx(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(e) {
    const v = e.target.value;
    setValue(v);
    setWarning("");
    setFocusedIdx(-1);
    clearTimeout(timerRef.current);
    if (v.trim().length < 5) {
      setSuggestions([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    timerRef.current = setTimeout(async () => {
      try {
        const results = await searchAddress(v);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch {
        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    }, 600);
  }

  function tryAdd(stopData) {
    if (isDuplicate(stopData, stops)) {
      setWarning("Questa fermata è già presente nella lista");
      return;
    }
    onAdd(stopData);
    setValue("");
    setSuggestions([]);
    setShowDropdown(false);
    setFocusedIdx(-1);
    setWarning("");
  }

  function handleSelect(result) {
    tryAdd({
      address: formatAddress(result),
      coords: { lat: parseFloat(result.lat), lng: parseFloat(result.lon) },
      placeId: result.place_id,
    });
  }

  function handleAdd() {
    const v = value.trim();
    if (!v) return;
    tryAdd({ address: v, coords: null, placeId: null });
  }

  function handleKeyDown(e) {
    if (!showDropdown) {
      if (e.key === "Enter") handleAdd();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIdx(i => (i <= 0 ? -1 : i - 1));
    } else if (e.key === "Enter") {
      if (focusedIdx >= 0) handleSelect(suggestions[focusedIdx]);
      else handleAdd();
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setFocusedIdx(-1);
    }
  }

  return (
    <div ref={containerRef} style={{ marginBottom: 12, position: "relative" }}>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Es. Via Roma 12, Milano"
            style={{
              width: "100%", padding: "8px 12px",
              paddingRight: isSearching ? 32 : 12,
              fontSize: 14,
              border: `1px solid ${warning ? "#fca5a5" : "#d1d5db"}`,
              borderRadius: 8, outline: "none", boxSizing: "border-box",
            }}
          />
          {isSearching && (
            <span style={{
              position: "absolute", right: 10, top: "50%",
              transform: "translateY(-50%)", fontSize: 12, color: "#9ca3af",
            }}>⏳</span>
          )}
        </div>
        <button onClick={handleAdd} style={{
          padding: "0 16px", fontSize: 14, fontWeight: 500,
          background: "#fff", border: "1px solid #d1d5db",
          borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap",
        }}>+ Aggiungi</button>
      </div>

      {warning && (
        <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>⚠️ {warning}</div>
      )}

      {showDropdown && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)", zIndex: 200, overflow: "hidden",
        }}>
          {suggestions.map((r, idx) => {
            const main = formatAddress(r);
            const a = r.address || {};
            const secondary = [a.county, a.state].filter(Boolean).join(", ");
            return (
              <button
                key={r.place_id}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(r); }}
                style={{
                  width: "100%", textAlign: "left", padding: "10px 12px",
                  background: focusedIdx === idx ? "#f9fafb" : "none",
                  border: "none",
                  borderBottom: idx < suggestions.length - 1 ? "1px solid #f3f4f6" : "none",
                  cursor: "pointer", display: "block",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500 }}>📍 {main}</div>
                {secondary && (
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{secondary}</div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
