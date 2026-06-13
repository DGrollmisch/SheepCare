# SheepCare – Anforderungen

*Transkript der handschriftlichen Anforderungen (3 Seiten)*

---

## Legende: Antworttypen

| Typ                  | Beschreibung                                                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ja/nein**          | Binäre Auswahl                                                                                                                                       |
| **Textfeld**         | Offene Eingabe (Analyse später möglich über API Call. Zeitraum angeben => Analyseergebniss als Prosa)                                                |
| **Skala (5-stufig)** | ja, die ganze Zeit (100%) / ja, größten Teils (75%) / nein, mal ehrlich nur so halb (50%) / nein, größten Teils (25%) / nein, so gar nicht/kaum (0%) |

---
Generelle Anforderungen:
- Wenn versucht wird zu speichern, aber Textfelder noch leer sind bzw Antworten nicht gegen wurden soll ein kleines motivierendes PoppUp kommen. Jedes mal etwas anderes. Text soll über einen API call kommen (Haiku).
- Wenn das Program gestartet wird auch gerne ein motivierender Spruch über API.
- Der Fortschritt muss lokal auf dem Handy fortwährend gespeichert werden. Wenn ich eine neue Programmversion erstelle muss es abwärtskompatibel sein. Unter KEINEN Umständen dürfen Daten beim Update verloren gehen, z.b. wenn ich neue Fragen hinzufüge oder alte rausnehme. Oder zu Weihnachten das Spiel ändere. Vllt über eine auf dem Handy lokal gespeicherte csv oder so?
- Fragen sollen Nacheinander gestellt werden. Es soll also immer eine Frage angezeigt werden. Wenn es Folgefragen gibt wird die Folgefrage zusätzlich zur Hauptfrage eingeblendet.
	- man soll aber auch nochmal zurück gehen können oder eine Frage (beim Zwischenspeichern) überspringen können mit einem weiter und zurück Button unten.
	- Nachträgliches ändern endgültiger Speicherungen nicht möglich


## ① Baustein: Tägliche Abfrage

Fragen, die täglich gestellt werden:

- **War ich heute lieb zu mir?** *(Skala)*
- Habe ich mich heute im Spiegel angelächelt? (ja/nein)
- **War ich heute geduldig mit mir?** *(Skala)*
- **War ich geduldig mit anderen?** *(Skala)*
- *Habe ich mich heute nicht gestresst und meinen Zeitplan realistisch einschätzen können?* *(Skala)*

- **Habe ich auf ausgewogene & kleine Mahlzeiten geachtet?** *(Skala)*
  - Bei Antwort ≤ 50% → Folgefrage: *Bei welche(n) Mahlzeit(en) nicht?* (Textfeld)

- **Habe ich mir heute Zeit für mich genommen?** *(ja/nein)*
  - Bei **Ja** → Folgefragen:
    - *Wie viel?* => In Virtelstunden Schritten Eingabe möglich
    - *Für was?* (Textfeld)
  - Bei **Nein** → Folgefrage: *Warum nicht? ⚠ Nenne deine Ausreden (Gründe)!* (Textfeld)

- **Was hat mir heute wirklich Freude gemacht? Bzw. wann konnte ich wirklich lachen?** (Textfeld)

- **Worauf bin ich heute stolz?** (Textfeld)

---

## ② Baustein: Zusatzfragen am Sonntag

Nur sonntags zusätzlich zu den täglichen Fragen:

- **Was habe ich diese Woche (für die Familie) ohne Hilfe und ohne Einforderung von Meinung entschieden?** (Textfeld)
- **Habe ich mich mindestens 3× diese Woche auf die Waage gestellt?** (ja/nein)
- Konnte ich mich diese Woche von etwas trennen? (ja/nein)
	- bei Ja -> Von was? (Textfeld)

---

## ③ Baustein: Belohnung

Belohnung soll über zwei Mechanismen Stattfinden:
- einen "Lauf" aufbauen. so viele Tage wie möglich hintereinander nutzen und das tracken
- nach Abschluss des Fragebogens soll ein süßes Spiel gespielt werden können
- 
Nachdem alle Fragen beantwortet und gespeichert wurden:
- Als Intro: Ein **neues Schaf hüpft auf die Wiese mit den schon gesammelten Schafen** (mit Ton: fröhliches und motivierendes „Mäh!", wenn Ton an). Dann soll eine lustige Melodie im Hintergrund spielen die Jinglich ist und gute Laune macht und zu dem Thema passt. Jedes Schaf soll alle paar Sekunden mäh machen. Alle Schafe durcheinander, in unterschiedlichen Rythmen und Tonhöhen. mehr dazu später bei der Spielbeschreibung
- Unter der Wiese steht: **„Du hast X Schafe gesammelt."**
  - X = Anzahl der Tage **am Stück**, an denen die Fragen beantwortet wurden (Streak/Lauf).
  - Zusatzanzeige: *„Dein bisheriger Rekord: XX Schafe."*
- Die Wiese **füllt sich nach und nach mit Schafen**, bis zu einer bestimmten maximalen Anzahl.

---

## ④ Baustein: Strafe

Wird **ein Tag** ausgelassen (keine Antworten gespeichert):

- Mitteilung: **„Oh nein! Alle Schafe sind ausgebüxt!"** Mit Animation wie im Spiel das Tor aufgeht und die Schafe alle raus laufen.
- Beim Laden der App, das erste mal nachdem der Lauf gerissen ist: Die Wiese wird wieder leer (Streak-Reset auf 0). Und der Schäfer kommt und repariert erstmal den Zaun oder schließt das Tor. Vllt ist also eine Abfrage des Laufes beim Starten des Spiels nötig.
- Benachrichtigung aufs Handy mit einer Warnung´, falls man drauf und dran ist seinen Lauf durch nichteintragen zu verlieren. 23:00

---

## ⑤ Grafik & UI

**Stil:** Generell eher helleres und lustiges Design. Eher fröhlicher aber detaillierter Comic-Stil.

### Startbildschirm (Skizze):

```
┌──────────────────────────────────┐
│  "Du willst heute noch           │
│   ein Schaf sammeln"             │
│                                  │
│[Bei Lauf Lustiges Bild von       │
│              grasendem Schaf]    │
│[Bei Lauf = 0 trauriges Bild von  │
│Schäfer der ein Tor oder Zaun repariert]│
│                                  │
│       [ Auf geht's! ]            │
│         → zu den Fragen          │
│                                  │
│[Kleinere Buttons für Einstellungen,│
│Auswertung, Wiese ansehen (interaktion inGame erst möglich wenn Fragen beantwortet, sonst aber wenigstens schon die Schafwiese einsehbar)│
└──────────────────────────────────┘
```

### Einstellungen:
- Android!!!
- Echter Background Push, auch wenn die App nicht offen ist.
- Push-Mitteilung (Reminder) an/aus (für jede Pushoption einzeln)
- Push-Mitteilung (Reminder) Zeiten einstellbar.
- Default: Push 20:00 falls Fragen noch nicht beantwortet an dem Tag => Du musst noch Schafpflege betreiben!
- Default: Push 23:00 falls Fragen noch nicht beantwortet an dem Tag => Ohne Schafpflege laufen die XX Schafe weck!!
- API Einstellungen

### Auswertung (sehr komplexe Optionen):
- Kalenderübersicht, Tage an denen Fragen beantwortet wurden grün eingefärbt.
- Filtermöglichkeiten: separate Fragen auswählbar aus Katalog und dann den Verlauf über ColorCode auf Kalenderübersicht sichtbar. Zusätzlich Balkendiagramm anziehbar (einstellbar ob letzter Monat in Tagen oder letztes Jahr in Tagen oder in Wochen oder in Monaten (dann Durchschnitt))
- Übersicht: wie wurde/n die ausgewählte Frage/n durchschnittlich beantwortet unter Angabe von Zeitraum? Bei Textfeldern soll hier ein API Call (Sonnet, mit der Zeitraum aus der CSV(?) Datei gesendet werden und eine Analyse in längerer Prosa zurück kommen. Genereller Ton hier: Motivierend und Supportend, aber Fakten nicht verschleiern.)
- Da wo möglich: mit Diagrammen und/oder Prozentzahlen arbeiten

Generell soll hier sehr vielfältig gefiltert, ausgewertet und analysiert werden können.

---

## ⑥ Regeln

### Bearbeitung & Speichern
- Antworten sind **bis zum endgültigen Speichern** vorwärts & rückwärts bearbeitbar.
- Endgültig gespeichert werden kann nur, wenn **alle Fragen beantwortet** sind.
- Nach dem endgültigen Speichern: **nicht mehr korrigierbar**, auch kein nachträgliches Hinzufügen.
- **Zwischenspeichern** wäre wünschenswert wenn technisch möglich. Das zählt dann aber nicht als Lauf, erst wenn dann endgültig gespeichert wird und alle Fragen beantwortet wurden. Sollten später neue Fragen dazu kommen, so gelten die Tage bis zum Versionsupdate trotzdem aus vollständig (falls sie auch vollständig waren)

### Auswertung
- Wo immer möglich: Darstellung mit **Diagrammen oder Prozentzahlen** oder Kuchendiagram.

## 7: Spiel
Das Spiel soll eine Schafwiese darstellen, mit Bäumen, Steinen, Hügeln, See, Hecken etc. Man soll über Drag Swipen auch über die Wiese navigieren können, reinzoomen und rauszoomen. Es ist recht einfach: Mit jedem "Lauf" soll ein weiteres Schaf auf die Schafwiese hinzukommen. Die Schafe müssen aber gepflegt werden. Für jeden Tag auf der Wiese wächst logischer weise das Fell. Das muss visuell in 7 Schritten darstellbar sein. Also gäbe es folgende Aufgaben:
- Es gibt einen kleinen Schafunterstand.
- Die Schafe müssen Wasser haben. Also muss täglich Wasser in einer Tränke nachgefüllt werden.
- Grasen sollen sie auf der Wiese (niedlich annimiert), oder liegen wahlweise faul rum oder laufen rum.
- Die Schafe müssen wöchentlich geschoren werden (Sonntags) (Tool anklicken und dann auf das Schaf klicken => Schafwolle wird auf Anfangsstatus und Darstellung zurückgesetzt (mit einem niedlichen "Mähhh" als Ton)
- Maximal 50 Schafe auf der Wiese. Sollte es mehr Schafe geben weil der Lauf größer ist wird der Schafunterstand zu einem kleinen Schafstall. Bei >500 Schafe gibt es stattdessen einen großen Schafstall. Dieser Schafstall soll alle anderen nicht dargestellten Schafe beherbergen (die müssen nicht geschoren werden). Mit einem Klich auf den Stall kann man alle Schafe rauslassen, die dann die Wiese fluten. Nach 2 Minuten gehen sie von selbst zurück.
- tägliche Aufgabe: Alle Schafe(nach Scheeren falls nötig) müssen in den Schafstall getrieben werden. Hält man einen Finger länger als eine Sekunde an einer Stelle so laufen Schafe entsprechend dem Winkel von dem Finger weck. Berühren sie den Unterstand/Stall so verschwinden sie darin. Ziel ist es alle Schafe abends in den Unterstand zu bringen.
- Wenn alle Schafe in Stall/Unterstand sind gibt es eine kleine Animation wie alles Dunkel wird und Nachts wird. Alles geht schlafen. Die Schafe und du auch. Damit Schließt sich die Ansicht. 
- Sollte man die Ansicht nochmal betrachten über entsprechenden Button aus dem Hauptmenü so muss man aus dem Spiel wieder rauskommen können.
- Das Abschließen des Spieles gilt als Bestandteil des Laufes.
