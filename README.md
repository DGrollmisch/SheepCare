# SheepCare 🐑

Persönliche Self-Care-PWA für Android: ein täglicher Selbstfürsorge-Fragebogen mit
Schaf-Belohnung. Jeder abgeschlossene Tag bringt ein Schaf auf die Wiese; ein „Lauf"
(Streak) wächst, solange du dranbleibst.

## Funktionen
- **Täglicher Fragebogen** (Skala-, Ja/Nein-, Text- und Dauer-Fragen, Folgefragen, Sonntagsfragen) mit Zwischenspeichern, Überspringen und endgültigem Speichern.
- **Streak/Lauf** mit Rekord; Belohnungs-Animation (Schaf hüpft auf die Wiese) und Strafe-Animation (Schafe büxen aus, Schäfer repariert den Zaun).
- **Schafwiese (Spiel)** auf HTML5-Canvas: Pan/Zoom, niedliche Schafe mit 7 Wollstufen, Scheren, Tränke, Schafe in den Stall treiben → Nacht-Animation. Das Spiel ist eine **Belohnung** und nicht Teil des Laufs.
- **Auswertung**: Kalender-Heatmap, Balken- & Kuchendiagramme, KI-Textanalyse (Claude Sonnet).
- **Motivation**: Haiku-Tagesspruch & Ermutigungs-Pop-ups (mit lokalen Fallbacks).
- **Push-Erinnerungen** (optional, via Cloudflare Worker – siehe `worker/`).
- **Backup**: JSON-Export/Import in den Einstellungen.

## Stack
Single-File-PWA: `index.html` (React 18 + Babel + Tailwind + idb-keyval via CDN),
`sw.js` (Service Worker), `manifest.json`. Keine Build-Pipeline, IndexedDB für die Daten.

## Lokal testen
```bash
npx serve -l 3000 .
# → http://localhost:3000
```

## Deployment (GitHub Pages)
1. Repository ist öffentlich.
2. Settings → Pages → Source: „Deploy from a branch" → Branch `main`, Ordner `/ (root)` → Save.
3. Nach 1–2 Minuten erreichbar unter `https://<user>.github.io/SheepCare/`.
4. **Bei jedem Update** `CACHE_NAME` in `sw.js` hochzählen (sonst lädt das Handy die alte Version).

## Noch offen (bewusst ans Ende verschoben)
- **App-Icons** `icon-192.png` / `icon-512.png` und Titelbilder `img/title-*.png` fehlen noch
  (geplant als KI-Assets via Midjourney/DALL-E). Bis dahin greifen Inline-SVG-Fallbacks.
- **Push-Benachrichtigungen**: Cloudflare-Worker deployen – Schritt-für-Schritt in
  [`worker/README.md`](worker/README.md).

## Daten & Privatsphäre
Alle Antworten bleiben lokal auf dem Gerät (IndexedDB). Der optionale Claude-API-Schlüssel
wird nur lokal gespeichert. Regelmäßiger JSON-Export wird als Backup empfohlen.
