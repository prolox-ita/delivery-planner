import { useState, useEffect } from "react";
import Header from "./components/Header";
import OriginCard from "./components/OriginCard";
import StopInput from "./components/StopInput";
import StopsList from "./components/StopsList";
import CurrentStop from "./components/CurrentStop";
import ActionButtons from "./components/ActionButtons";
import useGeolocation from "./hooks/useGeolocation";
import { optimizeStops, buildMapsUrl } from "./utils/routing";

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

export default function App() {
  const [stops, setStops] = useState(() => load("stops", []));
  const [optimizedOrder, setOptimizedOrder] = useState(() => load("optimizedOrder", null));
  const [manualOrigin, setManualOrigin] = useState(() => load("manualOrigin", null));
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { coords, label: originLabel, status: gpsStatus, errorMsg: gpsError, retry: retryGps } = useGeolocation();

  const effectiveCoords = manualOrigin?.coords ?? coords;
  const effectiveLabel = manualOrigin?.address ?? originLabel;

  useEffect(() => { localStorage.setItem("stops", JSON.stringify(stops)); }, [stops]);
  useEffect(() => { localStorage.setItem("optimizedOrder", JSON.stringify(optimizedOrder)); }, [optimizedOrder]);
  useEffect(() => { localStorage.setItem("manualOrigin", JSON.stringify(manualOrigin)); }, [manualOrigin]);

  function addStop(stopData) {
    setStops(prev => [...prev, { ...stopData, status: null }]);
    setOptimizedOrder(null);
  }

  function removeStop(index) {
    setStops(prev => prev.filter((_, i) => i !== index));
    setOptimizedOrder(null);
  }

  function markStop(index, status) {
    setStops(prev => prev.map((s, i) => i === index ? { ...s, status } : s));
  }

  async function handleOptimize() {
    if (stops.length < 2) return;
    setIsOptimizing(true);
    // TODO: sostituire con chiamata reale a Google Directions API
    const order = await optimizeStops(stops, effectiveCoords);
    setOptimizedOrder(order);
    setIsOptimizing(false);
  }

  function handleOpenMaps() {
    const url = buildMapsUrl(stops, optimizedOrder, effectiveLabel, effectiveCoords);
    window.open(url, "_blank");
  }

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "1rem" }}>
      <Header />
      <OriginCard
        status={gpsStatus}
        label={originLabel}
        errorMsg={gpsError}
        onRetry={retryGps}
        manualOrigin={manualOrigin}
        onSetManualOrigin={setManualOrigin}
      />
      <CurrentStop stops={stops} optimizedOrder={optimizedOrder} onMark={markStop} />
      <StopInput onAdd={addStop} stops={stops} />
      <StopsList
        stops={stops}
        optimizedOrder={optimizedOrder}
        onRemove={removeStop}
        onMark={markStop}
      />
      <ActionButtons
        canOptimize={stops.length >= 2}
        canOpenMaps={!!optimizedOrder}
        isOptimizing={isOptimizing}
        onOptimize={handleOptimize}
        onOpenMaps={handleOpenMaps}
        stopCount={stops.length}
      />
    </div>
  );
}
