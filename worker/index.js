// SheepCare Push-Worker (Cloudflare)
// Sendet VAPID-signierte Web-Pushes OHNE Payload (keine aes128gcm-Verschlüsselung
// nötig). Der Service Worker der PWA wählt die Nachricht anhand der lokalen Uhrzeit.
//
// Endpoints:
//   POST /subscribe  { subscription, prefs }   – Gerät registrieren (Token-geschützt)
//   POST /sync       { endpoint, prefs }        – Prefs/Erledigt-Status aktualisieren
//   POST /test                                  – sofortiger Test-Push an alle Geräte
// Cron (*/15): sendet Reminder, wenn lokale Zeit passt und Tag nicht erledigt ist.

// ── Base64URL Helpers ───────────────────────────────────────────────────────
function b64urlToBytes(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = s.length % 4 ? 4 - (s.length % 4) : 0;
  s += '='.repeat(pad);
  const bin = atob(s);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}
function bytesToB64url(bytes) {
  const arr = new Uint8Array(bytes);
  let bin = '';
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function strToB64url(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function hashKey(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── VAPID (ES256 JWT via WebCrypto) ─────────────────────────────────────────
async function importVapidKey(publicKeyB64, privateKeyB64) {
  const pub = b64urlToBytes(publicKeyB64); // 65 Bytes: 0x04 || x(32) || y(32)
  const jwk = {
    kty: 'EC', crv: 'P-256',
    x: bytesToB64url(pub.slice(1, 33)),
    y: bytesToB64url(pub.slice(33, 65)),
    d: privateKeyB64, // bereits base64url (aus `web-push generate-vapid-keys`)
    ext: true, key_ops: ['sign'],
  };
  return crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
}

async function makeVapidJWT(endpoint, env) {
  const url = new URL(endpoint);
  const payload = {
    aud: `${url.protocol}//${url.host}`,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: env.VAPID_SUBJECT || 'mailto:admin@example.com',
  };
  const signingInput =
    strToB64url(JSON.stringify({ typ: 'JWT', alg: 'ES256' })) + '.' +
    strToB64url(JSON.stringify(payload));
  const key = await importVapidKey(env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' }, key,
    new TextEncoder().encode(signingInput)
  );
  return signingInput + '.' + bytesToB64url(sig);
}

async function sendPush(endpoint, env) {
  const jwt = await makeVapidJWT(endpoint, env);
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'TTL': '86400',
      'Urgency': 'normal',
      'Authorization': `vapid t=${jwt}, k=${env.VAPID_PUBLIC_KEY}`,
    },
  });
}

// ── Lokale Zeit je Zeitzone (DST-korrekt via Intl) ──────────────────────────
function localInfo(tz) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz || 'Europe/Berlin', hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
  const p = Object.fromEntries(
    fmt.formatToParts(new Date()).filter(x => x.type !== 'literal').map(x => [x.type, x.value])
  );
  let hour = parseInt(p.hour, 10); if (hour === 24) hour = 0;
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: hour * 60 + parseInt(p.minute, 10) };
}
const timeToMin = (t) => { const [h, m] = String(t).split(':').map(Number); return h * 60 + m; };

// ── HTTP-Handler ────────────────────────────────────────────────────────────
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type,x-sheepcare-token',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
};
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json', ...CORS } });

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

    const authed = () => req.headers.get('x-sheepcare-token') === env.PUSH_TOKEN;

    if (req.method === 'POST' && url.pathname === '/subscribe') {
      if (!authed()) return json({ error: 'forbidden' }, 403);
      const { subscription, prefs } = await req.json().catch(() => ({}));
      if (!subscription || !subscription.endpoint) return json({ error: 'missing subscription' }, 400);
      await env.SUBS.put(await hashKey(subscription.endpoint), JSON.stringify({ subscription, prefs: prefs || {} }));
      return json({ ok: true });
    }

    if (req.method === 'POST' && url.pathname === '/sync') {
      if (!authed()) return json({ error: 'forbidden' }, 403);
      const { endpoint, prefs } = await req.json().catch(() => ({}));
      if (!endpoint) return json({ error: 'missing endpoint' }, 400);
      const key = await hashKey(endpoint);
      const raw = await env.SUBS.get(key);
      if (!raw) return json({ error: 'not found' }, 404);
      const obj = JSON.parse(raw);
      obj.prefs = prefs || obj.prefs;
      await env.SUBS.put(key, JSON.stringify(obj));
      return json({ ok: true });
    }

    if (req.method === 'POST' && url.pathname === '/test') {
      if (!authed()) return json({ error: 'forbidden' }, 403);
      const list = await env.SUBS.list();
      let sent = 0, failed = 0;
      for (const k of list.keys) {
        const raw = await env.SUBS.get(k.name);
        if (!raw) continue;
        const { subscription } = JSON.parse(raw);
        const res = await sendPush(subscription.endpoint, env);
        if (res.ok || res.status === 201) sent++;
        else { failed++; if (res.status === 404 || res.status === 410) await env.SUBS.delete(k.name); }
      }
      return json({ ok: true, sent, failed });
    }

    return json({ ok: true, service: 'sheepcare-push' });
  },

  async scheduled(event, env) {
    const list = await env.SUBS.list();
    for (const k of list.keys) {
      const raw = await env.SUBS.get(k.name);
      if (!raw) continue;
      const { subscription, prefs } = JSON.parse(raw);
      const { date, minutes } = localInfo(prefs && prefs.tz);
      if (prefs && prefs.lastCompletedDate === date) continue; // heute schon erledigt
      const hit = (enabled, t) => enabled && t && minutes >= timeToMin(t) && minutes < timeToMin(t) + 15;
      if (hit(prefs.push20Enabled, prefs.push20Time) || hit(prefs.push23Enabled, prefs.push23Time)) {
        const res = await sendPush(subscription.endpoint, env);
        if (res.status === 404 || res.status === 410) await env.SUBS.delete(k.name);
      }
    }
  },
};
