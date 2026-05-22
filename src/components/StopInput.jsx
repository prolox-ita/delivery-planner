import { useState } from "react";
import AutocompleteInput from "./AutocompleteInput";
import { isDuplicate } from "../utils/geocoding";

export default function StopInput({ onAdd, stops }) {
  const [warning, setWarning] = useState("");

  function handleSelect(stopData) {
    if (isDuplicate(stopData, stops)) {
      setWarning("Questa fermata è già presente nella lista");
      return;
    }
    setWarning("");
    onAdd(stopData);
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <AutocompleteInput
        onSelect={handleSelect}
        placeholder="Es. Via Roma 12, Milano"
        showButton
      />
      {warning && (
        <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>⚠️ {warning}</div>
      )}
    </div>
  );
}
