# RoutOpt — Guida per Claude Code

## Cos'è questo progetto
App mobile-first per corrieri: inserisci le fermate di consegna, ottimizza l'ordine, apri Google Maps con il percorso pronto. Gestisce anche più di 25 fermate tramite clustering geografico.

## Stack
- **React + Vite** (web app, poi convertibile in app nativa con Expo/React Native)
- **OpenStreetMap Nominatim** per reverse geocoding (gratuito, no API key)
- **Google Maps URL API** per aprire la navigazione
- Ottimizzazione vera: **Google Directions API** (da implementare)

## Struttura
```
src/
  App.jsx                  # componente radice, gestisce tutto lo stato
  main.jsx                 # entry point React
  hooks/
    useGeolocation.js      # GPS + reverse geocoding
  utils/
    routing.js             # logica ottimizzazione + costruzione URL Maps
  components/
    Header.jsx             # titolo app
    OriginCard.jsx         # card posizione attuale con stati loading/ok/error
    StopInput.jsx          # input aggiunta fermata
    StopsList.jsx          # lista fermate (normale e ottimizzata)
    ActionButtons.jsx      # bottoni ottimizza + apri maps
```

## Come avviare
```bash
npm install
npm run dev
```

## Prossimi passi (da implementare con Claude Code)

### 1. Google Directions API (PRIORITÀ ALTA)
Nel file `src/utils/routing.js`, la funzione `optimizeStops()` è una simulazione.
Sostituirla con una chiamata reale:
- Endpoint: `https://maps.googleapis.com/maps/api/directions/json`
- Parametro chiave: `waypoints=optimize:true|addr1|addr2|...`
- Risposta utile: `routes[0].waypoint_order`
- Serve una API key Google Cloud con Directions API abilitata
- Limite: 25 waypoint per chiamata → il clustering è già implementato per gestirlo

### 2. OCR etichette (PRIORITÀ MEDIA)
Aggiungere scansione etichette con la fotocamera:
- Libreria consigliata: `tesseract.js` (browser) o ML Kit (React Native)
- Flusso: scatta foto → estrai testo → parse indirizzo → aggiungi alla lista
- File da creare: `src/utils/ocr.js` + `src/components/ScanButton.jsx`

### 3. Import lista da file (PRIORITÀ MEDIA)
Permettere upload di CSV/Excel con gli indirizzi:
- Libreria: `papaparse` per CSV
- Flusso: carica file → parse → aggiungi tutti alla lista
- File da creare: `src/components/ImportButton.jsx`

### 4. Salvataggio lista (PRIORITÀ BASSA)
Usare `localStorage` per non perdere le fermate se si chiude l'app:
- Salva automaticamente a ogni modifica
- Ripristina all'apertura
- Modifica: `src/App.jsx` (useState → useLocalStorage)

### 5. Conversione React Native / Expo (FASE SUCCESSIVA)
Quando la web app è stabile, convertire per iOS e Android:
- `npx create-expo-app routopt-native`
- Sostituire `window.open` con `Linking.openURL`
- Sostituire `navigator.geolocation` con `expo-location`
- Sostituire `fetch` Nominatim con `expo-location` reverseGeocodeAsync

## Note importanti
- L'app è già mobile-first (max-width 420px)
- Il GPS funziona solo su HTTPS o localhost
- OpenStreetMap Nominatim ha un rate limit: max 1 req/sec, non usare per produzione pesante
- Per produzione sostituire Nominatim con Google Geocoding API
