# Startprompt für Claude Code – Phase 1

Diesen Text komplett in Claude Code einfügen (im Repo-Verzeichnis starten: `cd Development/SheepCare && claude`).

---

Lies zuerst vollständig und in dieser Reihenfolge:
1. `CLAUDE.md` – Projektüberblick, Stack, Regeln
2. `Anforderungen.md` – alle Anforderungen inkl. Fragekatalog und Spielbeschreibung
3. `Strategie.md` – Architekturentscheidungen, Datenstrategie, Bauplan
4. `pwa-vorlage-altprojekt.md` – bewährte Vorlage für dateKey(), Service Worker, Babel-Setup

Dann starte **Phase 1 – Kern-MVP**. Baue alles in dieser Reihenfolge, Schritt für Schritt, und frage wenn etwas unklar ist:

**1. Projektstruktur**
- `index.html` (React 18 + Babel Standalone + Tailwind – alle via CDN, kein Build-Schritt)
- `sw.js` (Service Worker, basierend auf Vorlage)
- `manifest.json` (PWA, display: standalone, theme_color passend zum Comic-Stil)
- `icon-192.png` und `icon-512.png` (Platzhalter SVG → PNG, Schaf-Gesicht Front-Ansicht, grüner Hintergrund)
- Ordner `sounds/` und `img/` anlegen (leer, werden später befüllt)

**2. IndexedDB-Layer**
- `idb-keyval` via CDN einbinden
- Datenschema exakt wie in `Strategie.md §4` implementieren (ein Key `sheepcare-data`, JSON-Objekt mit `schemaVersion`, `entries`, `streak`, `settings`)
- `appSchemaVersion` pro Eintrag
- Migration-Funktion: beim Laden prüfen ob `schemaVersion` veraltet, fehlende Fragen-Keys mit `null` auffüllen, niemals Daten löschen

**3. Fragebogen-Screen**
- Alle 9 Tagesfragen aus `Anforderungen.md §①` sequenziell (eine Frage pro View)
- Folgefragen erscheinen zusätzlich zur Hauptfrage wenn ausgelöst (nicht als eigene Seite, sondern darunter eingeblendet)
- Antworttypen: ja/nein (Toggle), Skala 5-stufig (0/25/50/75/100%), Textfeld, Dauer (Viertelstunden-Schritte)
- Navigation: [Zurück] [Weiter / Zwischenspeichern] unten, [Endgültig speichern] nur wenn alle Fragen beantwortet
- Sonntags: Zusatzfragen aus `Anforderungen.md §②` am Ende anhängen

**4. Speicher-Logik**
- Zwischenspeichern: speichert `draft: true`, zählt nicht als Lauf
- Endgültig speichern: nur wenn alle Pflichtfelder ausgefüllt, setzt `completed: true`, `draft: false`
- Nach endgültigem Speichern: kein Editieren mehr möglich
- Haiku-API-Popup bei Speicherversuch mit leeren Feldern (wenn API-Key gesetzt, sonst lokaler Fallback-Text)

**5. Streak-Logik**
- `dateKey()` IMMER mit lokalem Datum (nie `toISOString()`), exakt wie in `pwa-vorlage-altprojekt.md`
- Lauf = aufeinanderfolgende Tage mit `completed: true`
- Beim App-Start prüfen: wenn letzter completed-Tag > 1 Tag zurück liegt → Streak-Reset auf 0, Strafe-Flag setzen
- Best-Streak mitführen

**6. Startscreen**
Drei Zustände (siehe `Anforderungen.md §⑤`):
- **Zustand A** (Lauf > 0, heute noch nicht beantwortet): Bild aus `img/title-streak.png` (Platzhalter: SVG-Schaf auf Wiese), Text „Du willst heute noch ein Schaf sammeln", Streak-Anzeige, [Auf geht's!]-Button
- **Zustand B** (Lauf = 0 oder Strafe-Flag): Bild aus `img/title-broken.png` (Platzhalter: SVG-Schäfer am Zaun), Strafe-Animation wenn Flag gesetzt (Schafe büxen aus: SVG-Elemente translateX nach rechts, Tor dreht auf)
- **Zustand C** (heute bereits fertig): Motivationsbild, Streak-Anzeige, Buttons für Wiese / Auswertung

Navigation unten (auch Startscreen): [Start] [Wiese] [Auswertung] [Einstellungen]

**Qualitätsregeln für den ganzen Code:**
- Kommentare auf Deutsch
- Alle Komponenten als React functional components
- State-Management nur mit useState/useReducer (kein Redux)
- Kein localStorage – ausschließlich IndexedDB via idb-keyval
- SVG-Grafiken (Schaf, Wiese, Zaun) direkt als JSX-Komponenten im Code, nicht als externe Dateien
- CSS-Animationen als `<style>`-Block in index.html (kein externes CSS-File)
- Tailwind nur für Layout/Spacing/Farben; komplexe Animationen per CSS-Keyframes

Starte mit Schritt 1 und zeige mir den Stand nach jedem Schritt.
