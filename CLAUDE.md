# SheepCare – Kontext für Claude Code

Persönliche Self-Care PWA für Android, installierbar via Homescreen. Deployment: GitHub Pages.

## Pflichtlektüre vor jeder Session

1. `Anforderungen.md` – vollständiger Fragekatalog, alle Bausteine, Spielbeschreibung (§7)
2. `Strategie.md` – Architektur, Datenstrategie, Grafik-Entscheidungen, Bauplan (Phasen 1–5)
3. `pwa-vorlage-altprojekt.md` – bewährte Vorlage: dateKey(), Service Worker, Manifest, Babel-Setup

## Stack

- **Single-File PWA**: `index.html` enthält gesamte App (React 18 + JSX via Babel Standalone CDN)
- **Styling**: Tailwind CDN (utility classes, kein Build-Schritt)
- **Datenpersistenz**: IndexedDB via `idb-keyval` CDN
- **Diagramme**: Recharts CDN (Phase 3)
- **Audio**: Web Audio API, externe `.mp3`-Dateien in `sounds/`
- **Animationen**: CSS Keyframe Animations auf SVG-Elementen

## Dateistruktur (Ziel)

```
/
├── index.html          ← gesamte App
├── sw.js               ← Service Worker
├── manifest.json       ← PWA-Manifest
├── icon-192.png        ← App-Icon
├── icon-512.png        ← App-Icon groß
├── img/
│   ├── title-streak.png   ← DALL-E: Schaf grast (Startscreen Zustand A)
│   └── title-broken.png   ← DALL-E: Schäfer repariert Zaun (Zustand B)
├── sounds/
│   ├── maeh.mp3        ← CC0 Schaf-Sound (freesound.org/Gitanki/172712)
│   └── melody.mp3      ← CC0 Melodie (OpenGameArt oder itch.io)
├── CLAUDE.md           ← diese Datei
├── Anforderungen.md
├── Strategie.md
└── pwa-vorlage-altprojekt.md
```

## Kritische Implementierungsregeln

- **dateKey()** immer mit lokalem Datum, NIE `new Date().toISOString()` (UTC-Bug um Mitternacht). Vorlage beachten.
- **appSchemaVersion** in jedem Eintrag speichern – Migration-Pflicht (nie Daten löschen, alte Einträge bei neuen Fragen mit `null` befüllen und als vollständig werten)
- **Kein Post-Save-Editing** – nach endgültigem Speichern unveränderlich
- **Animierte Grafiken**: SVG inline im React-Code (CSS Keyframes). Titelscreen-Hintergründe: DALL-E PNG aus `img/`
- **Spiel (`<SheepGame>`)**: separate Komponente, Schnittstelle: `sheepCount` prop + `onComplete` callback. Erst in Phase 5 integrieren.

## API-Keys

Werden vom Nutzer in den Einstellungen eingegeben und in IndexedDB gespeichert. Nie im Code hardcoden. Ohne Key: lokale Fallback-Texte.

## Aktueller Stand

Phase 1 – Kern-MVP (noch nicht gestartet). Alle Anforderungen und Architekturentscheidungen sind final.
