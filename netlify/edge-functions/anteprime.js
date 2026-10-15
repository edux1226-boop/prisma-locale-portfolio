/* Protezione delle anteprime per i clienti, lato server (Netlify Edge Function).
 *
 * Gira prima che la pagina arrivi al browser, su ogni richiesta sotto /anteprime/.
 * Fa tre cose, nell'ordine:
 *
 * 1. CODICE NEL LINK (facoltativo). Se nella variabile d'ambiente ANTEPRIMA_CODICI
 *    c'è un codice per l'anteprima, la pagina si apre solo con ?k=<codice> nel link.
 *    Il codice giusto lascia un cookie (solo un'impronta SHA-256, mai il codice) e
 *    reindirizza all'indirizzo pulito; senza codice o cookie si vede un avviso (403).
 *    Esempio di valore: {"anima-concept":"un-codice-lungo-e-casuale"}
 *    Senza variabile, o senza codice per quell'anteprima, non si chiede nulla.
 *
 * 2. SCADENZA. Legge il meta "anteprima-scadenza" della pagina: dopo quella data
 *    risponde 410 con l'avviso "anteprima scaduta", e la pagina non parte più.
 *    Prima era solo JavaScript nel browser: bastava disattivarlo per aggirarla.
 *
 * 3. HEADER DI SICUREZZA. Su tutte le anteprime: niente cache condivisa, HSTS,
 *    isolamento della finestra. Sulle anteprime elencate in CSP anche una
 *    Content-Security-Policy stretta, con un nonce nuovo a ogni richiesta per gli
 *    script in linea della pagina.
 *
 * Solo API web standard (fetch, crypto, TextEncoder): gira su Netlify (Deno) e si
 * prova in Node con test/anteprime.test.mjs. */

/* Anteprime con la Content-Security-Policy. Una pagina entra qui solo dopo averla
   provata: niente script o stili in linea senza nonce, niente risorse esterne. */
const CSP = new Set(['anima-concept']);

const COOKIE_GIORNI = 60;
const CONTATTI = {
  whatsapp: 'https://wa.me/393758350800',
  email: 'info@prismalocale.it',
};

function leggiEnv(nome) {
  try {
    return globalThis.Netlify?.env?.get(nome) ?? undefined;
  } catch {
    return undefined;
  }
}

/* {"anima-concept": "codice"} → Map. Un valore malformato non apre nulla:
   si considera "nessun codice" ma lo si segnala nei log. */
function codici() {
  const grezzo = leggiEnv('ANTEPRIMA_CODICI');
  if (!grezzo) return new Map();
  try {
    const dati = JSON.parse(grezzo);
    return new Map(Object.entries(dati).filter(([, v]) => typeof v === 'string' && v.length >= 12));
  } catch {
    console.error('ANTEPRIMA_CODICI non è un JSON valido: nessun codice applicato');
    return new Map();
  }
}

async function impronta(testo) {
  const dati = new TextEncoder().encode(testo);
  const hash = await crypto.subtle.digest('SHA-256', dati);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* Confronto a tempo costante fra due stringhe esadecimali della stessa lunghezza. */
function uguali(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function leggiCookie(request, nome) {
  const intestazione = request.headers.get('cookie') || '';
  for (const parte of intestazione.split(';')) {
    const i = parte.indexOf('=');
    if (i === -1) continue;
    if (parte.slice(0, i).trim() === nome) return parte.slice(i + 1).trim();
  }
  return null;
}

function nonce() {
  const byte = crypto.getRandomValues(new Uint8Array(18));
  return btoa(String.fromCharCode(...byte)).replace(/[+/=]/g, (c) => ({ '+': '-', '/': '_', '=': '' })[c]);
}

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/* Le intestazioni comuni a ogni risposta delle anteprime. */
function sicurezza(headers) {
  headers.set('Cache-Control', 'private, no-store');
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  headers.set('Strict-Transport-Security', 'max-age=31536000');
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-Frame-Options', 'DENY');
  return headers;
}

/* Pagina d'avviso (codice mancante o anteprima scaduta): niente script, stile in linea
   autorizzato solo da questa CSP. */
function avviso(stato, titolo, testo) {
  const html = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${escapeHtml(titolo)} · Prisma Locale</title>
<style>
  html { background: #F1E7C8; color: #26170F; font: 17px/1.6 system-ui, -apple-system, "Segoe UI", sans-serif; }
  body { margin: 0; min-height: 100svh; display: grid; place-content: center; padding: 24px; }
  main { max-width: 34rem; }
  h1 { font: 700 clamp(1.9rem, 1.2rem + 3vw, 2.8rem)/1.05 Georgia, serif; margin: 0 0 16px; }
  p { margin: 0 0 14px; }
  a { color: inherit; font-weight: 650; }
</style>
</head>
<body>
<main>
  <h1>${escapeHtml(titolo)}</h1>
  <p>${escapeHtml(testo)}</p>
  <p><a href="${CONTATTI.whatsapp}" rel="noopener">Scrivi su WhatsApp</a> oppure <a href="mailto:${CONTATTI.email}">${CONTATTI.email}</a></p>
</main>
</body>
</html>`;
  const headers = sicurezza(new Headers({ 'Content-Type': 'text/html; charset=utf-8' }));
  headers.set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
  return new Response(html, { status: stato, headers });
}

function politica(n) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${n}'`,
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

/* La data del meta "anteprima-scadenza", se c'è. È sempre nella testa della pagina. */
function scadenza(html) {
  const testa = html.slice(0, 200_000);
  const m = testa.match(/<meta\s+name=["']anteprima-scadenza["']\s+content=["']([^"']+)["']/i)
    || testa.match(/<meta\s+content=["']([^"']+)["']\s+name=["']anteprima-scadenza["']/i);
  if (!m) return null;
  const t = Date.parse(m[1]);
  return Number.isFinite(t) ? t : null;
}

/* L'anteprima della richiesta: /anteprime/<nome>/... → <nome>. */
function nomeAnteprima(url) {
  const parti = url.pathname.split('/');
  return parti[1] === 'anteprime' && /^[a-z0-9-]+$/.test(parti[2] || '') ? parti[2] : null;
}

export default async function anteprime(request, context) {
  const url = new URL(request.url);
  const nome = nomeAnteprima(url);
  if (!nome || (request.method !== 'GET' && request.method !== 'HEAD')) return context.next();

  /* 1. codice nel link */
  const codice = codici().get(nome);
  const nomeCookie = `anteprima-${nome}`;
  if (codice) {
    const atteso = await impronta(`${nome}:${codice}`);
    const dato = url.searchParams.get('k');
    if (dato !== null) {
      if (!uguali(await impronta(`${nome}:${dato}`), atteso)) {
        return avviso(403, 'Anteprima riservata', 'Il codice nel link non è valido. Usa il link che ti abbiamo mandato, così com\'è.');
      }
      // codice giusto: cookie e indirizzo pulito, il codice non resta nella barra né nella cronologia
      url.searchParams.delete('k');
      const headers = sicurezza(new Headers({ Location: url.pathname + url.search + url.hash }));
      headers.append('Set-Cookie', `${nomeCookie}=${atteso}; Path=/anteprime/${nome}/; Max-Age=${COOKIE_GIORNI * 86400}; HttpOnly; Secure; SameSite=Lax`);
      return new Response(null, { status: 303, headers });
    }
    if (!uguali(leggiCookie(request, nomeCookie), atteso)) {
      return avviso(403, 'Anteprima riservata', 'Questa pagina è un\'anteprima privata. Aprila dal link che ti abbiamo mandato.');
    }
  }

  const risposta = await context.next();
  const tipo = risposta.headers.get('content-type') || '';
  if (!risposta.ok || !tipo.includes('text/html')) {
    const headers = sicurezza(new Headers(risposta.headers));
    return new Response(risposta.body, { status: risposta.status, statusText: risposta.statusText, headers });
  }

  let html = await risposta.text();

  /* 2. scadenza */
  const fine = scadenza(html);
  if (fine !== null && Date.now() > fine) {
    return avviso(410, 'Anteprima scaduta', 'Il periodo di prova di questa anteprima è finito. Contatta Prisma Locale per riaverla.');
  }

  /* 3. header, e CSP con nonce dove è stata provata */
  const headers = sicurezza(new Headers(risposta.headers));
  headers.delete('content-length');
  headers.delete('etag');
  if (CSP.has(nome)) {
    const n = nonce();
    html = html.replace(/<script\b(?![^>]*\bnonce=)/gi, `<script nonce="${n}"`);
    headers.set('Content-Security-Policy', politica(n));
  }
  return new Response(request.method === 'HEAD' ? null : html, { status: risposta.status, headers });
}

export const config = {
  path: '/anteprime/*',
};
