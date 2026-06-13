# SheepCare – Implementierungsstrategie

*Erstellt auf Basis der Anforderungen.md. Enthält Architekturentscheidungen, offene Fragen, Self-Challenge und Bauplan.*

---

## Status offener Fragen

| # | Frage | Status |
|---|---|---|
| F1 | Das „Spiel" ist nicht spezifiziert | ✅ Gelöst: vollständig spezifiziert in Anforderungen.md §7 |
| F2 | Antworttyp Stressfrage | ✅ Gelöst: Skala |
| F3 | Gewicht-Abfrage | ✅ Gelöst: nur ja/nein |
| F4 | Push: iOS oder Android? | ✅ Gelöst: Android, echter Background-Push |
| F5 | Datenspeicherung | ✅ Gelöst: IndexedDB |
| F6 | Töne/Melodie | ✅ Gelöst: externe Audiodateien im Repo |

---

## 1. Offene Fragen

Alle Fragen geklärt – keine Blocker mehr. ✅

**F1 – Spiel:** Vollständig spezifiziert in Anforderungen.md §7. Schafwiese mit Drag-Pan/Zoom, Wollwachstum in 7 Stufen, wöchentliches Scheren (Sonntags), tägliche Aufgabe (Schafe in Stall treiben), Nacht-Animation, Stall-Stufen bei 50/500 Schafen.

---

## 2. Sound-Assets (recherchiert, CC0/Royalty-Free)

---

### Schaf-Mäh-Sounds
- **Primärempfehlung:** [sheep.wav von Gitanki auf freesound.org](https://freesound.org/people/Gitanki/sounds/172712/) – CC0 (Public Domain), 3,3 Sek., WAV. Kein Login nötig zum Download. Kein Credit erforderlich.
- Für verschiedene Tonhöhen: Dieselbe Datei mit Web Audio API in unterschiedlichen `playbackRate`-Werten abspielen (0.8×, 1.0×, 1.2×, 1.5× etc.). So klingen alle Schafe verschieden ohne mehrere Dateien.
- Alternativ: [freesoundslibrary.com – Sheep Baa](https://www.freesoundslibrary.com/sheep-baa-sound-effect-free/) – CC BY 4.0, kostenlos, Attribution nötig.

### Hintergrundmelodie (Spiel / Wiesenscreen)
- **Primärempfehlung (kostenlos, CC0):** [OpenGameArt.org – CC0 Calm/Relaxing Collection](https://opengameart.org/content/cc0-calm-relaxing-music) – enthält u.a.:
  - „Gone Fishin'" von Memoraphile – entspannt, rustikaler Charakter, CC0
  - „A New Town (RPG Theme)" – warmer RPG-Townsound, CC0
  - „JRPG Pack 2 Towns – Home Town" – gemütlich, loopbar, CC0
  - „Champ de tournesol" von Komiku – sehr pastoral, CC0
- **Kostenpflichtig ($4.99), aber am besten geeignet:** [Farm Life Acoustic BGM Pack von SunnyMelodyLab (itch.io)](https://sunnymelodylab.itch.io/farm-life-bgm) – 9 Tracks, loop-ready, exakt der gewünschte Cozy-Farm-Stil, royalty-free, kein Credit nötig. Empfehlung: „Sunlit Meadows" (80 BPM) oder „Morning Dew" (79 BPM) für die Wiese.

**Implementierung:** Die Audiodateien kommen als separate `.mp3`-Dateien ins Repo (z.B. `sounds/maeh.mp3`, `sounds/melody.mp3`). Service Worker cached sie automatisch mit. Kein Bruch des Single-File-Prinzips – die Vorlage erlaubt bereits mehrere Dateien.

---

## 3. Architekturentscheidung: Single-File PWA (bestätigt)

Basierend auf der Altprojekt-Vorlage wird die bewährte Architektur übernommen:

| Datei | Inhalt |
|---|---|
| `index.html` | Gesamte App (HTML + React/JSX via Babel) |
| `sw.js` | Service Worker (Offline-Cache + ggf. Push) |
| `manifest.json` | PWA-Manifest |
| `icon-192.png` | App-Icon |
| `icon-512.png` | App-Icon groß |
| `sounds/maeh.mp3` | Schaf-Sound (falls Audiodateien-Entscheid fällt) |
| `sounds/melody.mp3` | Jingle (optional) |

**Warum nicht React Native / Flutter?**
Wäre installierbare native App → App Store Veröffentlichung nötig → Apple-Entwicklerkonto (99 $/Jahr) → Build-Pipeline nötig → deutlich mehr Aufwand. Für eine persönliche App nicht verhältnismäßig.

**Warum nicht Next.js / Vite?**
Braucht Node.js und Build-Pipeline. Deployment wäre komplizierter als „Datei hochladen". Kein Mehrwert für diesen Use Case.

---

## 4. Datenstrategie: IndexedDB mit versioniertem Schema

### Warum IndexedDB statt LocalStorage?
- LocalStorage-Limit: ~5 MB. Bei langen Textantworten über Monate wird das eng.
- IndexedDB: 50–500 MB, strukturierter, migrationsfähiger.
- Wrapper-Bibliothek `idb-keyval` (CDN) macht die API so einfach wie LocalStorage.

### Datenstruktur

```json
{
  "schemaVersion": 2,
  "entries": {
    "2026-06-13": {
      "appSchemaVersion": 1,
      "completed": true,
      "draft": false,
      "completedAt": "2026-06-13T21:34:00",
      "answers": {
        "q_lieb_zu_mir":        { "type": "scale", "value": 75 },
        "q_spiegel":            { "type": "bool",  "value": true },
        "q_geduldig_mit_mir":   { "type": "scale", "value": 50 },
        "q_geduldig_mit_anderen":{ "type": "scale", "value": 75 },
        "q_stress":             { "type": "scale", "value": 100 },
        "q_mahlzeiten":         { "type": "scale", "value": 25,
          "followUp": { "q_welche_mahlzeit": { "type": "text", "value": "Mittag" } }
        },
        "q_zeit_fuer_mich":     { "type": "bool",  "value": true,
          "followUp": {
            "q_wie_viel":  { "type": "duration", "value": 0.75 },
            "q_fuer_was":  { "type": "text", "value": "Spaziergang" }
          }
        },
        "q_freude":             { "type": "text",  "value": "..." },
        "q_stolz":              { "type": "text",  "value": "..." },
        "q_sonntag_entscheidung": null,
        "q_waage":              null,
        "q_trennung":           null
      }
    }
  },
  "streak": {
    "current": 5,
    "best": 12,
    "lastCompletedDate": "2026-06-12"
  },
  "settings": {
    "soundEnabled": true,
    "push20Enabled": true,
    "push23Enabled": true,
    "push20Time": "20:00",
    "push23Time": "23:00",
    "apiKey": ""
  }
}
```

### Migrations-Philosophie
- Jeder Eintrag speichert `appSchemaVersion` (die Fragenversion zum Zeitpunkt des Eintrags).
- Wenn neue Fragen hinzukommen → `appSchemaVersion` erhöhen.
- Beim Laden: alte Einträge bekommen `null` für neue Fragen-Keys – und gelten trotzdem als vollständig (für Streak), weil sie unter einem anderen Schema ausgefüllt wurden.
- Beim Auswerten: `null`-Werte bei Fragen werden als „nicht vorhanden in diesem Zeitraum" behandelt, nicht als unbeantwortete Frage.
- **Daten gehen unter keinen Umständen verloren.**

---

## 5. Screen-Übersicht

```
App
├── Startscreen (Home)
│   ├── Zustand A: Heute noch nicht beantwortet, Lauf > 0 → grasendes Schaf
│   ├── Zustand B: Heute noch nicht beantwortet, Lauf = 0 → Schäfer repariert Zaun
│   ├── Zustand C: Heute beantwortet → Motivationsbild / Wiese
│   └── Buttons: [Auf geht's!] | [Wiese] | [Auswertung] | [Einstellungen]
│
├── Fragebogen (sequenziell)
│   ├── Fortschrittsbalken oben
│   ├── Eine Frage groß im Zentrum
│   ├── Folgefrage(n) erscheinen darunter wenn ausgelöst
│   ├── [Zurück] [Weiter / Zwischenspeichern] unten
│   └── [Endgültig speichern] nur sichtbar wenn alle Fragen beantwortet
│
├── Belohnungs-Screen (nach Speichern)
│   ├── Animation: Schaf hüpft auf Wiese
│   ├── Streak-Anzeige
│   └── [Zur Wiese] Button
│
├── Wiese / Spiel-Screen
│   ├── Interaktiv wenn heute beantwortet, sonst read-only
│   ├── Schafe auf Wiese, jedes macht ab und zu „Mäh"
│   └── [Spiel starten] → TBD (F1)
│
├── Auswertung
│   ├── Kalenderansicht (Heatmap)
│   ├── Fragenfilter
│   ├── Diagramm (Balken/Kuchen)
│   └── KI-Analyse (Textfragen via Sonnet)
│
└── Einstellungen
    ├── Push-Notifications (an/aus + Zeiten)
    ├── API Key Eingabe (Haiku + Sonnet)
    ├── Export (JSON/CSV Download)
    └── Import (JSON Upload)
```

---

## 6. API-Strategie

Drei API-Einsatzpunkte, alle direkt aus dem Browser (kein Backend):

| Einsatz | Modell | Trigger | Prompt-Idee |
|---|---|---|---|
| Motivations-Spruch beim Start | Haiku | App-Öffnen (max. 1x/Tag) | „Gib einen kurzen (1–2 Sätze) liebevollen und lustigen Motivationsspruch für den Tag. Thema: Selbstfürsorge und Schafe." |
| Motivations-Pop-up bei unvollständigem Speichern | Haiku | Klick auf Speichern mit leeren Feldern | „Gib eine freundliche, spielerische Ermutigung (1 Satz), jetzt den Self-Care-Fragebogen vollständig auszufüllen. Keine Floskeln." |
| Textfeld-Analyse in Auswertung | Sonnet | Nutzer klickt „Analyse starten" | Alle Textantworten des gewählten Zeitraums + Prompt für Prosa-Analyse |

**API-Key-Verwaltung:** Key liegt in IndexedDB (bzw. als `apiKey` im Settings-Objekt), niemals im Code. Eingabe über Passwortfeld in den Einstellungen. Ohne Key werden API-Features deaktiviert (Fallback-Texte lokal hinterlegt).

---

## 7. Bauplan / Phasen

### Phase 1 – Kern (MVP)
- [ ] Projektstruktur (5 Dateien)
- [ ] Datenschema + IndexedDB-Layer mit Migrations-Engine
- [ ] Fragebogen (sequenziell, alle Fragen, Folgefragen, Vor/Zurück)
- [ ] Zwischenspeichern + Endgültig Speichern
- [ ] Streak-Logik (Lauf-Berechnung, Reset bei Auslassung)
- [ ] Startscreen (Zustände A/B/C, statische Grafiken)

### Phase 2 – Gamification
- [ ] Wiese-Screen mit Schafen (CSS-Animationen)
- [ ] Schaf-Sound (Mäh) + optionale Melodie
- [ ] Belohnungs-Animation nach Speichern
- [ ] Strafe-Animation (Schafe büxen aus, Schäfer repariert)

### Phase 3 – Auswertung
- [ ] Kalender-Heatmap
- [ ] Fragenfilter + Balkendiagramm (Recharts)
- [ ] Kuchendiagramm
- [ ] KI-Textanalyse (Sonnet)

### Phase 4 – API-Integration & Push
- [ ] Haiku-Motivationssprüche
- [ ] Push-Notifications (soweit technisch möglich ohne Backend)
- [ ] Einstellungen-Screen vollständig

### Phase 5 – Spiel (TBD)
- [ ] Spielbeschreibung abwarten (F1)
- [ ] Implementation

---

## 8. Self-Challenge: Was könnte schiefgehen?

### 🔴 Kritisch

**Challenge A – Push Notifications: Cloudflare Worker nötig** *(Update: Android bestätigt)*
*Problem:* Echter Background-Push auf Android in einer PWA funktioniert über den Web Push Standard + Google FCM. Der Service Worker kann Pushes empfangen und anzeigen – aber nur wenn ein Server (VAPID) die Pushes tatsächlich abschickt. Ohne Server: App muss offen sein, damit etwas angezeigt wird. Das ist für einen 23:00-Alarm unbrauchbar.
*Lösung (Empfehlung):* **Kleiner Cloudflare Worker als Push-Backend** – kostenlos im Free Tier, ~2–3h Aufwand. Ablauf:
  1. PWA registriert Push-Subscription im Service Worker → schickt sie an den Cloudflare Worker
  2. Cloudflare Worker hat Cron Trigger: läuft täglich um 20:00 und 23:00
  3. Worker schickt Web Push an alle registrierten Subscriptions (da nur ein Nutzer: trivial)
  4. Vereinfachung: Notifications immer schicken (nicht konditionell ob Fragen beantwortet) – App öffnet sich beim Tippen und zeigt den richtigen Zustand
*Risiko:* Der Cloudflare Worker-Endpoint muss irgendwo gespeichert sein (im Code oder Settings). Da das Repo public ist: URL ist sichtbar, aber ohne den privaten VAPID-Key kann niemand anderes Pushes schicken.

**Challenge B – Animationen + Sounds** *(Update: externe Audiodateien entschieden)*
*Problem:* Komplexe CSS-Animationen (Schafe laufen, Tor geht auf, Schäfer) + gleichzeitige Mäh-Töne in verschiedenen Tonhöhen. Performance auf älteren Android-Geräten könnte leiden.
*Lösung:* Externe `sounds/maeh.mp3` (CC0 von freesound.org) via Web Audio API in verschiedenen `playbackRate`-Werten für jedes Schaf (0.8×, 1.0×, 1.2×, 1.5×). Animationen als CSS Keyframe Animations – GPU-accelerated, performant. Fallback mit `prefers-reduced-motion`.

**Challenge C – Komplexität der Auswertung**
*Problem:* Kalender-Heatmap + Fragenfilter + mehrere Diagrammtypen + KI-Analyse ist sehr viel für Phase 3. Einzeln einfach, aber alle zusammen in einer Single-File gut wartbar zu halten wird eng.
*Lösung:* Die Auswertung in einem separaten Tab/View mit eigenem State kapseln. Recharts ist im Stack bereits vorhanden.

### 🟡 Mittleres Risiko

**Challenge D – Babel/JSX Performance**
*Problem:* Babel kompiliert beim ersten Laden JSX im Browser. Bei einer sehr großen App (komplexe Auswertung + Animationen + Spiel) kann das 2–4s dauern.
*Mitigation:* Service Worker cached die kompilierte Version nach dem ersten Laden. Bleibt aber ein schlechter Ersteindruck.
*Alternative bei Problem:* Auf Preact + HTM umstellen (kein Babel nötig, 3x kleiner, API kompatibel).

**Challenge E – IndexedDB auf Android** *(iOS nicht mehr relevant)*
*Problem:* Auf Android löscht Chrome IndexedDB wenn „Websitedaten löschen" im Browser ausgelöst wird, ODER wenn der Nutzer die PWA deinstalliert. Als installierte PWA (Homescreen-App) ist der Storage stabil.
*Mitigation:* Beim ersten Start deutlichen Hinweis einblenden: App als PWA auf dem Homescreen installieren. Export-Funktion (JSON) als Backup ist Pflicht und prominent platzieren.

**Challenge F – "Abwärtskompatibilität zu Weihnachten"**
*Problem:* „Zu Weihnachten das Spiel ändern" – das klingt nach saisonalen Themes (Weihnachtsschafe? Rentiere?). Das muss bei der Designarchitektur berücksichtigt werden, damit das Theme austauschbar ist ohne Datenverlust.
*Lösung:* Theme-Objekt als separates Konfigurationsobjekt im Code (nicht im State). Daten bleiben unberührt, nur visuelle Layer wird ausgetauscht.

### 🟢 Gut beherrschbar

**Challenge G – F2, F3 gelöst** ✅
Stressfrage → Skala. Waage → ja/nein. Beide im Fragekatalog fix eingetragen.

**Challenge H – API-Kosten**
Haiku-Aufrufe (Start + Pop-up) sind Mikrotransaktionen (~0,001 $ pro Call). Bei täglicher Nutzung: ~0,03 $/Monat. Sonnet für Auswertung: abhängig von Datenmenge, aber mit Ausgabelimit in der Anthropic Console problemlos kontrollierbar. Kein Risiko.

---

## 9. Grafik-Strategie & Rendering

### 9.1 Rendering-Ansatz: HTML5 Canvas für die Spielwiese

Das Spiel (Phase 5) braucht Pan/Zoom, viele bewegte Schafe und flüssige Animationen – das ist mit reinem SVG/HTML nicht sauber machbar.

**Empfehlung: HTML5 Canvas + requestAnimationFrame Game Loop** (kein Extra-CDN nötig):
- `<canvas>`-Element innerhalb der React `<MeadowScreen>`-Komponente
- Eigene `GameEngine`-Klasse (ca. 200 Zeilen) mit Game Loop, Sprite-System und Input-Handler
- Pan via Touch-Drag, Zoom via Pinch-to-Zoom (Touch Events)
- Sprites als PNG-Dateien in `img/game/` (geladen via `Image()`-Objekt)

**Dateistruktur Assets:**
```
img/
├── game/
│   ├── bg-meadow.png       ← KI: Wiesenlandschaft (2048×1024, tileable)
│   ├── sheep-wool-1.png    ← KI: Schaf Wollstufe 1 (frisch geschoren)
│   ├── sheep-wool-2.png    ← … Stufe 2
│   ├── sheep-wool-3.png    ← … Stufe 3
│   ├── sheep-wool-4.png    ← … Stufe 4
│   ├── sheep-wool-5.png    ← … Stufe 5
│   ├── sheep-wool-6.png    ← … Stufe 6
│   ├── sheep-wool-7.png    ← … Stufe 7 (voll bewollt)
│   ├── sheep-walk-1.png    ← Walk-Animation Frame 1
│   ├── sheep-walk-2.png    ← Walk-Animation Frame 2
│   ├── sheep-idle.png      ← Idle (grast / liegt)
│   ├── barn-small.png      ← Unterstand (<50 Schafe)
│   ├── barn-large.png      ← Großer Stall (>500 Schafe)
│   ├── water-trough.png    ← Tränke
│   └── shear-tool.png      ← Schermesser (Tool-Icon)
├── title-streak.png        ← KI: Grasendes Schaf (Startscreen Zustand A)
└── title-broken.png        ← KI: Schäfer repariert Zaun (Zustand B)
```

Alle Assets können bis Phase 5 fehlen – der Code prüft ob das Bild geladen wurde und fällt sonst auf ein geometrisches Fallback zurück. Die Spiellogik ist so immer testbar.

---

### 9.2 KI-Asset-Generierung: Welches Tool für was

| Asset | Tool | Prompt-Stil | Format |
|---|---|---|---|
| `title-streak.png` / `title-broken.png` | DALL-E oder Midjourney | „cute cartoon sheep grazing on a green meadow, digital illustration, pastel colors, children's book style" | 512×512 PNG |
| `icon-192.png` / `icon-512.png` | DALL-E | „minimalist cartoon sheep face, round icon, white wool, green background, flat design" | PNG (quadratisch) |
| `bg-meadow.png` | Midjourney oder BlackForest/FLUX | „top-down view of a green pastoral meadow, trees, hills, small pond, cartoon style, warm colors, tileable" | 2048×1024 PNG |
| Schaf-Sprites (7 Wollstufen) | Midjourney oder BlackForest/FLUX | Sprite Sheet oder Einzelframes – Woll-Level 1–7 von kahl bis fluffig | PNG mit transparentem Hintergrund |
| Barn / Tränke / Objekte | Midjourney oder BlackForest/FLUX | Einzelne Objekte, top-down, gleicher Stil wie Hintergrund | PNG mit transparentem Hintergrund |

**Empfohlene Reihenfolge:**
1. `title-streak.png` + `title-broken.png` (sofort auf Startscreen sichtbar, kleiner Aufwand)
2. `icon-192.png` / `icon-512.png` (für PWA-Installation nötig)
3. Erst in Phase 5: Schaf-Sprites + Hintergrund + Objekte

---

### 9.3 Übergangs-Strategie: Ugly SVGs → KI-Assets

**Layering-Prinzip** – Logik wird nie durch fehlende Assets blockiert:

```
Phase 1–4:   Code-Logik fertig, SVG-Platzhalter aktiv
Phase 5a:    Canvas-Engine & Spiellogik mit geometrischem Fallback
Phase 5b:    KI-Assets generieren (parallel oder am Ende)
Phase 5c:    Assets einsetzen – ein Asset nach dem anderen, kein Breaking Change
```

Implementierungsprinzip im Canvas-Code:

```javascript
// Asset Loader – gibt null zurück wenn Datei fehlt
const loadSprite = (src) => new Promise(resolve => {
  const img = new Image();
  img.onload  = () => resolve(img);
  img.onerror = () => resolve(null);
  img.src = src;
});

// Im Draw-Call:
if (sheep.sprite) {
  ctx.drawImage(sheep.sprite, x, y, w, h);
} else {
  // Geometrisches Fallback (immer sichtbar, auch ohne Assets)
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}
```

---

### 9.4 UI-Grafiken außerhalb des Spiels

Für React-Screens (Start, Reward, Streak-Broken) außerhalb des Canvas:
- `SheepSVG` und `ShepherdSVG` bleiben Platzhalter bis KI-Assets bereit sind
- Startscreen: `img`-Tag mit `onError`-Fallback auf SVG ist bereits eingebaut
- Reward-Screen: Wenn `img/game/sheep-idle.png` vorhanden → dieses Bild statt SVG verwenden