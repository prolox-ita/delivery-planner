import { useState } from "react";
import Header from "./components/Header";
import OriginCard from "./components/OriginCard";
import StopInput from "./components/StopInput";
import StopsList from "./components/StopsList";
import ActionButtons from "./components/ActionButtons";
import useGeolocation from "./hooks/useGeolocation";
import { optimizeStops, buildMapsUrl } from "./utils/routing";

export default function App() {
  const [stops, setStops] = useState([]);
  const [optimizedOrder, setOptimizedOrder] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { coords, label: originLabel, status: gpsStatus, retry: retryGps } = useGeolocation();

  function addStop(address) {
    setStops(prev => [...prev, { address }]);
    setOptimizedOrder(null);
  }

  function removeStop(index) {
    setStops(prev => prev.filter((_, i) => i !== index));
    setOptimizedOrder(null);
  }

  async function handleOptimize() {
    if (stops.length < 2) return;
    setIsOptimizing(true);
    // TODO: sostituire con chiamata reale a Google Directions API
    // const order = await googleOptimize(stops, coords);
    const order = await optimizeStops(stops, coords);
    setOptimizedOrder(order);
    setIsOptimizing(false);
  }

  function handleOpenMaps() {
    const url = buildMapsUrl(stops, optimizedOrder, originLabel, coords);
    window.open(url, "_blank");
  }

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "1rem" }}>
      <Header />
      <OriginCard status={gpsStatus} label={originLabel} onRetry={retryGps} />
      <StopInput onAdd={addStop} />
      <StopsList
        stops={stops}
        optimizedOrder={optimizedOrder}
        onRemove={removeStop}
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
