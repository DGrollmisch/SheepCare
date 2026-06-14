# SheepCare Push-Worker (Cloudflare)

Sendet die Reminder-Pushes (20:00 / 23:00) auch dann, wenn die App geschlossen ist.
Kostenlos im Cloudflare-Free-Tier. Einmalig einzurichten.

## Voraussetzungen
- Cloudflare-Account (kostenlos)
- Node.js installiert (`npx` verfügbar)

## 1. VAPID-Keys erzeugen (einmalig)
```bash
npx web-push generate-vapid-keys
```
Du bekommst einen **Public Key** und einen **Private Key** (beide Base64URL).

## 2. KV-Namespace anlegen
```bash
cd worker
npx wrangler kv namespace create SUBS
```
Die ausgegebene `id` in `wrangler.toml` bei `[[kv_namespaces]]` eintragen.

## 3. wrangler.toml ausfüllen
- `VAPID_PUBLIC_KEY` = dein Public Key
- `VAPID_SUBJECT`    = `mailto:deine@mail.de`
- `PUSH_TOKEN`       = ein selbst gewähltes Geheimnis (Buchstaben/Zahlen)

## 4. Private Key als Secret setzen
```bash
npx wrangler secret put VAPID_PRIVATE_KEY
# Private Key aus Schritt 1 einfügen
```

## 5. Deployen
```bash
npx wrangler deploy
```
Du erhältst eine URL wie `https://sheepcare-push.<name>.workers.dev`.

## 6. Die PWA verbinden
In `../index.html` oben im Skript diese drei Konstanten setzen
(müssen zu Schritt 1/3 passen):
```js
const VAPID_PUBLIC_KEY = '<dein Public Key>';
const PUSH_WORKER_URL  = 'https://sheepcare-push.<name>.workers.dev';
const PUSH_TOKEN       = '<dein PUSH_TOKEN>';
```
Danach `CACHE_NAME` in `../sw.js` hochzählen und auf GitHub Pages deployen.

---

## Android-Test-Checkliste
1. Seite auf dem Android-Handy öffnen (GitHub-Pages-HTTPS-URL) und **als App zum Startbildschirm hinzufügen** (PWA installieren).
2. App öffnen → **Einstellungen → „Push auf diesem Gerät aktivieren"** → Berechtigung erlauben.
   → „Push aktiviert! 🔔" erscheint.
3. **Sofort-Test** (am Rechner), ersetzt `<TOKEN>` und die URL:
   ```bash
   curl -X POST https://sheepcare-push.<name>.workers.dev/test \
     -H "x-sheepcare-token: <TOKEN>"
   ```
   → Eine Benachrichtigung erscheint auf dem Handy – auch bei geschlossener App.
4. **Zeitgesteuert:** Push-Zeit in den Einstellungen auf „in ein paar Minuten" stellen, speichern, App schließen. Zur vollen Viertelstunde feuert der Cron – der Reminder kommt nur, wenn der Tag noch **nicht** abgeschlossen ist.

## Hinweise
- Die Pushes kommen **ohne Payload**; der Service Worker (`../sw.js`) wählt den Text
  anhand der lokalen Uhrzeit (ab ~22 Uhr „Letzte-Chance"-Variante).
- Zeitzonen/Sommerzeit werden pro Gerät korrekt über `Intl` berechnet.
- Subscriptions, die der Push-Dienst mit 404/410 ablehnt, werden automatisch aus KV gelöscht.
