import { useState, useRef, useEffect } from "react";
import { searchAddress, formatAddress } from "../utils/geocoding";

// Riutilizzabile: input con autocomplete Nominatim.
// onSelect({ address, coords, placeId }) — selezione da dropdown o testo libero
// onCancel() — Escape (opzionale)
// showButton — mostra bottone "+ Aggiungi" affiancato
export default function AutocompleteInput({ onSelect, onCancel, placeholder, showButton, autoFocus }) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const timerRef = useRef(null);
  const containerRef = useRef(null);
  const queryRef = useRef(""); // ref per avere sempre la query più recente nelle closure

  useEffect(() => {
    function onClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
        setFocusedIdx(-1);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleChange(e) {
    const v = e.target.value;
    setValue(v);
    queryRef.current = v;
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

  function confirm(stopData) {
    setValue("");
    setSuggestions([]);
    setShowDropdown(false);
    setFocusedIdx(-1);
    onSelect(stopData);
  }

  function handleSelectResult(result) {
    confirm({
      address: formatAddress(result, queryRef.current),
      coords: { lat: parseFloat(result.lat), lng: parseFloat(result.lon) },
      placeId: result.place_id,
    });
  }

  function handleConfirmText() {
    const v = value.trim();
    if (!v) return;
    confirm({ address: v, coords: null, placeId: null });
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      setShowDropdown(false);
      setFocusedIdx(-1);
      onCancel?.();
      return;
    }
    if (!showDropdown) {
      if (e.key === "Enter") handleConfirmText();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIdx(i => (i <= 0 ? -1 : i - 1));
    } else if (e.key === "Enter") {
      if (focusedIdx >= 0) handleSelectResult(suggestions[focusedIdx]);
      else handleConfirmText();
    }
  }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: showButton ? 8 : 0 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Cerca indirizzo..."}
            autoFocus={autoFocus}
            style={{
              width: "100%", padding: "8px 12px",
              paddingRight: isSearching ? 32 : 12,
              fontSize: 14, border: "1px solid #d1d5db",
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
        {showButton && (
          <button onClick={handleConfirmText} style={{
            padding: "0 16px", fontSize: 14, fontWeight: 500,
            background: "#fff", border: "1px solid #d1d5db",
            borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap",
          }}>+ Aggiungi</button>
        )}
      </div>

      {showDropdown && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)", zIndex: 200, overflow: "hidden",
        }}>
          {suggestions.map((r, idx) => {
            const main = formatAddress(r, queryRef.current);
            const a = r.address || {};
            const secondary = [a.county, a.state].filter(Boolean).join(", ");
            return (
              <button
                key={r.place_id}
                onMouseDown={(e) => { e.preventDefault(); handleSelectResult(r); }}
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
