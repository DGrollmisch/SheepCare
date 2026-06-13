# Mobile Web App – Projektvorlage

Erfahrungen aus dem Konsistenz-Projekt. Dient als Ausgangspunkt für ähnliche Single-File-PWAs, die über GitHub Pages gehostet und auf dem Handy als App installiert werden.

---

## Grundentscheidung: Single-File-PWA

**Warum keine native App, kein React Native, kein Next.js:**
- Kein Build-Schritt, kein Node.js auf dem Gerät
- Deployment = eine Datei hochladen
- Installierbar auf dem Homescreen wie eine native App
- GPS, Kamera, LocalStorage, Geolocation: alles verfügbar
- Kostenlos hostbar via GitHub Pages

**Kompromisse:**
- Babel kompiliert JSX im Browser (erster Ladevorgang ~1-2s langsamer)
- CDN-Abhängigkeit beim ersten Start (danach gecached)
- Kein Background-Sync, kein Background-GPS (iOS limitiert das)
- LocalStorage-Limit ~5-10 MB (für Fotos und große Datenmengen IndexedDB bevorzugen)

---

## Dateistruktur im GitHub-Repo

```
repo/
├── index.html       # Die gesamte App (HTML + JSX via Babel)
├── sw.js            # Service Worker (PWA-Installierbarkeit + Offline-Cache)
├── manifest.json    # PWA-Manifest (Name, Icons, Display-Modus)
├── icon-192.png     # App-Icon (PNG, nicht SVG – iOS und Chrome brauchen PNG)
├── icon-512.png     # App-Icon groß (für Maskable/Splash)
└── README.md
```

Fünf Dateien. Nicht mehr, nicht weniger für eine installierbare PWA.

---

## index.html Grundstruktur

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1,
        maximum-scale=1, user-scalable=no, viewport-fit=cover">
  <title>App-Name</title>
  <meta name="theme-color" content="#0a0a0a">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="App-Name">

  <link rel="manifest" href="./manifest.json">
  <link rel="apple-touch-icon" href="./icon-192.png">

  <!-- Tailwind Play CDN (kein Build nötig) -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- React 18 -->
  <script src="https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.production.min.js"></script>

  <!-- Babel Standalone (JSX im Browser) -->
  <script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.25.6/babel.min.js"></script>

  <!-- Recharts (optional, für Charts) -->
  <script src="https://cdn.jsdelivr.net/npm/prop-types@15.8.1/prop-types.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/recharts@2.12.7/umd/Recharts.js"></script>

  <!-- Service Worker -->
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js');
      });
    }
  </script>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel" data-presets="react">
    const { useState, useEffect, useMemo, useRef } = React;
    // Recharts global: const { LineChart, ... } = Recharts;

    // Icons inline als SVG-Komponenten (kein Lucide-CDN nötig, zuverlässiger)
    const Icon = ({ children, size = 24, className = '', ...props }) => ( /* ... */ );

    // App-Code hier

    function App() { /* ... */ }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(App));
  </script>
</body>
</html>
```

---

## sw.js Grundstruktur

```javascript
const CACHE_NAME = 'app-name-v1'; // Bei jedem Update hochzählen: v2, v3, ...

const URLS_TO_CACHE = [
  './', './index.html', './manifest.json',
  './icon-192.png', './icon-512.png',
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(URLS_TO_CACHE).catch(() => {})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    ),
  ]));
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request)
        .then(res => {
          if (res && res.ok && res.type === 'basic') {
            caches.open(CACHE_NAME).then(c => c.put(e.request, res.clone()));
          }
          return res;
        }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
```

**Wichtig:** Bei jedem App-Update `CACHE_NAME` hochzählen (`v1` → `v2`). Nur so lädt das Handy die neue Version, andernfalls bleibt der alte Cache aktiv.

---

## manifest.json

```json
{
  "name": "App-Name",
  "short_name": "App-Name",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#0a0a0a",
  "theme_color": "#0a0a0a",
  "lang": "de",
  "icons": [
    { "src": "./icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "./icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "./icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

---

## Deployment: GitHub Pages

1. Neues Repository anlegen (Public – GitHub Pages ist bei privaten Repos kostenpflichtig)
2. Alle fünf Dateien hochladen
3. Settings → Pages → Source: "Deploy from a branch" → Branch: main, Folder: / (root) → Save
4. Nach 1-2 Minuten: `https://USERNAME.github.io/REPO-NAME/`

**Updates einspielen:**
- Datei im Repo ersetzen (löschen + neu hochladen oder Edit)
- `CACHE_NAME` in `sw.js` hochzählen
- Handy: App schließen, neu öffnen. Service Worker erkennt neue Cache-Version automatisch.

---

## Datumsfalle: UTC vs. lokale Zeit

**Problem:** `new Date().toISOString().slice(0, 10)` gibt das Datum in UTC zurück. In Deutschland (UTC+2 im Sommer) kann ein Eintrag um 23:30 Uhr lokaler Zeit dem nächsten Tag in UTC zugeordnet werden.

**Lösung:** Immer lokale Zeit für Datums-Keys verwenden:

```javascript
const dateKey = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Datum-Strings beim Parsen mit T12:00 neutralisieren (vermeidet Zeitzonen-Kippen)
const parseKey = (key) => new Date(key + 'T12:00:00');
```

Diese beiden Funktionen überall statt `toISOString().slice(0,10)` verwenden.

---

## Icons: Inline statt CDN

Lucide-Icons via UMD-CDN sind fehleranfällig (Format ändert sich zwischen Versionen). Besser: Icons als einfache SVG-Komponenten direkt im Code:

```jsx
const Icon = ({ children, size = 24, className = '', ...props }) => (
  React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: 2,
    strokeLinecap: 'round', strokeLinejoin: 'round',
    className, ...props,
  }, children)
);

// Hilfsfunktionen
const Pth = (d, key) => React.createElement('path', { key, d });
const Cir = (cx, cy, r, key) => React.createElement('circle', { key, cx, cy, r });
const Ln = (x1, y1, x2, y2, key) => React.createElement('line', { key, x1, y1, x2, y2 });
const Rct = (x, y, w, h, key, extra = {}) =>
  React.createElement('rect', { key, x, y, width: w, height: h, ...extra });

// Beispiel-Icon
const Check = (p) => <Icon {...p}>{Pth('M20 6 9 17l-5-5', 1)}</Icon>;
```

SVG-Pfade für alle gängigen Icons auf lucide.dev nachschlagen.

---

## Datenspeicherung

### LocalStorage (einfach, bis ~5 MB)

```javascript
const STORAGE_KEY = 'app-name-v1';

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
};

const saveState = (state) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (e) { console.error('Speichern fehlgeschlagen', e); }
};

const initialState = () => {
  const loaded = loadState();
  if (loaded) {
    // Migrations-Logik hier (neue Felder mit Defaults ergänzen)
    return loaded;
  }
  return { /* Default-State */ };
};
```

**Wichtig:** Migrations-Logik in `initialState` einbauen, damit bestehende Nutzerdaten erhalten bleiben wenn neue Felder dazukommen.

### Wenn LocalStorage nicht reicht

Für Fotos oder große Datenmengen: `idb-keyval` (IndexedDB-Wrapper). API ähnlich wie LocalStorage, aber async und bis zu mehreren hundert MB.

---

## Claude API Integration (optional)

Wenn die App einen API-Call machen soll, aber kein Backend vorhanden ist:

```javascript
const callClaude = async (apiKey, systemPrompt, userMessage, maxTokens = 500) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true', // Pflicht für Browser-Aufrufe
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });
  if (!response.ok) throw new Error(`API ${response.status}`);
  const data = await response.json();
  return data.content.filter(c => c.type === 'text').map(c => c.text).join('').trim();
};
```

**API-Key-Verwaltung ohne Backend:**
- Key im `localStorage` speichern (niemals in den Code eintragen)
- Eingabefeld mit `type="password"` in den Einstellungen
- Ausgabelimit in der Anthropic Console setzen (z.B. 5 $/Monat als Schutz)
- Repo muss public bleiben für GitHub Pages → Key im Code wäre für alle sichtbar

```javascript
// Key laden/speichern
const APIKEY_KEY = 'app-name-apikey';
const loadApiKey = () => { try { return localStorage.getItem(APIKEY_KEY) || ''; } catch (e) { return ''; } };
const saveApiKey = (key) => { try { localStorage.setItem(APIKEY_KEY, key); } catch (e) {} };
```

**Wenn öffentlicher Zugang geplant ist:** Cloudflare Worker als Proxy (Key liegt serverseitig, App ruft Worker auf). Setup ~1 Stunde, kostenlos im Free Tier.

---

## GPS / Geolocation

```javascript
// Nur über HTTPS (GitHub Pages liefert das automatisch)
// Nicht über http:// im lokalen Netz (Browser blockiert Geolocation)

const startTracking = () => {
  if (!navigator.geolocation) { setError('GPS nicht verfügbar'); return; }

  watchIdRef.current = navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude, speed, accuracy } = pos.coords;
      if (accuracy > 30) return; // Schlechte Punkte verwerfen
      // ...Punkt verarbeiten
    },
    (err) => setError(`GPS Fehler: ${err.message}`),
    { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
  );
};

const stopTracking = () => {
  if (watchIdRef.current !== null) {
    navigator.geolocation.clearWatch(watchIdRef.current);
  }
};
```

**Wake Lock (Display bleibt an):**
```javascript
const requestWakeLock = async () => {
  try {
    if ('wakeLock' in navigator) {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
    }
  } catch (e) { console.warn('Wake Lock fehlgeschlagen', e); }
};
```

**Hinweise:**
- iOS Safari beendet GPS wenn App in den Hintergrund geht
- Wake Lock funktioniert zuverlässig nur wenn App als PWA vom Homescreen gestartet wird
- Genauigkeit: Browser-GPS ist schlechter als native Apps. Punkte mit `accuracy > 30` filtern.

---

## Design-Grundsätze (aus Konsistenz übernehmen oder anpassen)

```javascript
// Dark Mode Basis
// bg-neutral-950  Hintergrund (fast schwarz)
// bg-neutral-900  Karten
// bg-neutral-800  Buttons, Inputs
// text-neutral-100 Primärtext
// text-neutral-500 Sekundärtext
// text-neutral-600 Placeholder / Inaktiv

// Akzentfarbe frei wählbar, in Konsistenz: lime-400 (#a3e635)

// Universelle Card-Komponente
const Card = ({ children, className = '' }) => (
  <div className={`bg-neutral-900 border border-neutral-800 rounded-2xl p-5 ${className}`}>
    {children}
  </div>
);

// Button mit Varianten
const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const variants = {
    primary: 'bg-lime-400 text-neutral-950 hover:bg-lime-300',
    secondary: 'bg-neutral-800 text-neutral-100 hover:bg-neutral-700',
    danger: 'bg-red-950 text-red-300 hover:bg-red-900',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`font-medium rounded-xl px-5 py-3 text-base transition-all active:scale-95 disabled:opacity-40 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};
```

---

## Stolpersteine und gelernte Lektionen

| Problem | Ursache | Lösung |
|---|---|---|
| Datum springt um einen Tag | `toISOString()` gibt UTC zurück | Eigene `dateKey()`-Funktion mit lokaler Zeit |
| GPS zeigt 0.00 km | Standort-Berechtigung für Chrome fehlt, oder "Genauer Standort" deaktiviert | Android: Einstellungen → Apps → Chrome → Berechtigungen → Standort → "Bei Nutzung" + "Genauer Standort" aktivieren |
| GPS funktioniert nicht über HTTP | Browser blockiert Geolocation ohne HTTPS | Nur über GitHub Pages (HTTPS) oder localhost testen |
| PWA-Install zeigt "Link hinzufügen" statt "App installieren" | Service Worker fehlt oder nicht registriert | `sw.js` muss als echte Datei vorhanden und registriert sein, nicht als Blob-URL |
| Alte Version nach Update | Browser-Cache | `CACHE_NAME` in `sw.js` hochzählen erzwingt Reload |
| Daten weg nach "Websitedaten löschen" | Das löscht LocalStorage | Regelmäßig JSON-Export aus den Einstellungen, nie den "Daten löschen"-Dialog bestätigen |
| Lucide Icons über CDN kaputt | UMD-Format ändert sich | Icons als inline SVG-Komponenten schreiben |
| CORS-Fehler bei API-Call | Browser blockiert Cross-Origin-Requests ohne CORS-Header | Anthropic-API: `anthropic-dangerous-direct-browser-access: true` Header mitschicken |

---

## Empfohlener Entwicklungs-Workflow

Da der Code direkt im Browser ausgeführt wird, gibt es keinen lokalen Dev-Server, der nötig wäre. Aber nützlich zum Testen:

```bash
# Einfacher lokaler HTTP-Server zum Testen am Rechner
python3 -m http.server 8080
# → http://localhost:8080

# Für GPS-Tests am Handy: ngrok-Tunnel (HTTPS)
npx ngrok http 8080
# → https://xyz.ngrok-free.app (am Handy aufrufen)
```

**Syntax prüfen ohne Browser:**
```bash
npm install @babel/core @babel/preset-react
node -e "
const babel = require('@babel/core');
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/<script type=\"text\/babel\"[^>]*>([\s\S]*?)<\/script>/);
babel.transformSync(m[1], { presets: [['@babel/preset-react', { runtime: 'classic' }]], babelrc: false, configFile: false });
console.log('OK');
"
```

---

## Checkliste neues Projekt

- [ ] Repository auf GitHub als Public anlegen
- [ ] Fünf Dateien erstellen: `index.html`, `sw.js`, `manifest.json`, `icon-192.png`, `icon-512.png`
- [ ] GitHub Pages aktivieren (Settings → Pages → main / root)
- [ ] `CACHE_NAME` in `sw.js` setzen (z.B. `app-name-v1`)
- [ ] `dateKey()`-Funktion verwenden, nicht `toISOString().slice(0,10)`
- [ ] Icons als inline SVG, nicht via CDN
- [ ] Migrations-Logik in `initialState` von Anfang an einplanen
- [ ] API-Key niemals in den Code, nur in LocalStorage via Einstellungen
- [ ] Bei jedem Deployment: `CACHE_NAME` hochzählen
- [ ] JSON-Export in den Einstellungen implementieren (Nutzer-Backup)
