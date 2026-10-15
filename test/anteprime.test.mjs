/* Test dell'Edge Function delle anteprime (netlify/edge-functions/anteprime.js).
   Uso: npm test
   Netlify è simulato: context.next() restituisce la pagina finta qui sotto. */

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import anteprime, { config } from '../netlify/edge-functions/anteprime.js';

const env = new Map();
globalThis.Netlify = { env: { get: (k) => env.get(k) } };

const PAGINA = (scadenza) => `<!doctype html>
<html lang="it"><head>
<meta charset="utf-8">
${scadenza ? `<meta name="anteprima-scadenza" content="${scadenza}">` : ''}
<script>document.documentElement.classList.add('js');</script>
<script type="application/ld+json">{"@type":"Restaurant"}</script>
<script type="module" crossorigin src="/assets/pagina.js"></script>
</head><body><h1>Ciao</h1></body></html>`;

const FUTURO = '2999-12-31T23:59:59+01:00';
const PASSATO = '2000-01-01T00:00:00+01:00';

/* L'origine finta: come Netlify, risponde a un Range con un pezzo (206) e a un HEAD
   senza corpo. Ricorda la richiesta che ha ricevuto. */
function contesto(html, { tipo = 'text/html; charset=UTF-8', stato = 200, ignoraRichiesta = false } = {}) {
  let chiamate = 0;
  let ultima = null;
  return {
    get chiamate() { return chiamate; },
    get ultima() { return ultima; },
    next: async (richiesta) => {
      chiamate += 1;
      ultima = ignoraRichiesta ? null : richiesta || null;
      const headers = { 'content-type': tipo, 'x-robots-tag': 'noindex, nofollow', etag: '"abc"' };
      const range = ultima?.headers.get('range') ?? (ignoraRichiesta ? 'bytes=0-40' : null);
      if (range && stato === 200) return new Response(html.slice(0, 40), { status: 206, headers });
      return new Response(ultima?.method === 'HEAD' ? null : html, { status: stato, headers });
    },
  };
}
const req = (path, init = {}) => new Request(`https://prismalocale.it${path}`, init);

beforeEach(() => env.clear());

test('si applica a tutte le anteprime', () => {
  assert.equal(config.path, '/anteprime/*');
});

test('senza codice configurato la pagina si apre, con CSP e nonce sugli script in linea', async () => {
  const ctx = contesto(PAGINA(FUTURO));
  const r = await anteprime(req('/anteprime/anima-concept/'), ctx);
  assert.equal(r.status, 200);
  const csp = r.headers.get('content-security-policy');
  const n = csp.match(/'nonce-([^']+)'/)[1];
  assert.ok(n.length >= 20);
  const html = await r.text();
  assert.equal((html.match(new RegExp(`<script nonce="${n}"`, 'g')) || []).length, 3);
  assert.match(csp, /script-src 'self' 'nonce-/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.equal(r.headers.get('cache-control'), 'private, no-store');
  assert.equal(r.headers.get('etag'), null);
});

test('il nonce cambia a ogni richiesta', async () => {
  const a = await anteprime(req('/anteprime/anima-concept/'), contesto(PAGINA(FUTURO)));
  const b = await anteprime(req('/anteprime/anima-concept/'), contesto(PAGINA(FUTURO)));
  assert.notEqual(a.headers.get('content-security-policy'), b.headers.get('content-security-policy'));
});

test('le anteprime fuori dalla lista CSP non ricevono la CSP ma gli altri header sì', async () => {
  const r = await anteprime(req('/anteprime/borgo-spoltino/'), contesto(PAGINA(FUTURO)));
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('content-security-policy'), null);
  assert.equal(r.headers.get('strict-transport-security'), 'max-age=31536000');
  assert.doesNotMatch(await r.text(), /nonce=/);
});

test('dopo la scadenza risponde 410 e non invia la pagina', async () => {
  const r = await anteprime(req('/anteprime/anima-concept/'), contesto(PAGINA(PASSATO)));
  assert.equal(r.status, 410);
  const html = await r.text();
  assert.match(html, /Anteprima scaduta/);
  assert.doesNotMatch(html, /Ciao/);
});

test('una pagina senza meta di scadenza non scade', async () => {
  const r = await anteprime(req('/anteprime/destino/'), contesto(PAGINA(null)));
  assert.equal(r.status, 200);
});

test('con il codice configurato, senza codice né cookie: 403 e la pagina non viene chiesta', async () => {
  env.set('ANTEPRIMA_CODICI', JSON.stringify({ 'anima-concept': 'codice-di-prova-lungo' }));
  const ctx = contesto(PAGINA(FUTURO));
  const r = await anteprime(req('/anteprime/anima-concept/'), ctx);
  assert.equal(r.status, 403);
  assert.equal(ctx.chiamate, 0);
  assert.match(await r.text(), /Anteprima riservata/);
});

test('codice sbagliato: 403', async () => {
  env.set('ANTEPRIMA_CODICI', JSON.stringify({ 'anima-concept': 'codice-di-prova-lungo' }));
  const r = await anteprime(req('/anteprime/anima-concept/?k=sbagliato'), contesto(PAGINA(FUTURO)));
  assert.equal(r.status, 403);
  assert.equal(r.headers.get('set-cookie'), null);
});

test('codice giusto: cookie con l\'impronta (non il codice) e redirect all\'indirizzo pulito', async () => {
  env.set('ANTEPRIMA_CODICI', JSON.stringify({ 'anima-concept': 'codice-di-prova-lungo' }));
  const r = await anteprime(req('/anteprime/anima-concept/?k=codice-di-prova-lungo&x=1'), contesto(PAGINA(FUTURO)));
  assert.equal(r.status, 303);
  assert.equal(r.headers.get('location'), '/anteprime/anima-concept/?x=1');
  const cookie = r.headers.get('set-cookie');
  assert.match(cookie, /^anteprima-anima-concept=[0-9a-f]{64};/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /Path=\/anteprime\/anima-concept;/);
  assert.doesNotMatch(cookie, /codice-di-prova-lungo/);
});

test('con il cookie giusto la pagina si apre', async () => {
  env.set('ANTEPRIMA_CODICI', JSON.stringify({ 'anima-concept': 'codice-di-prova-lungo' }));
  const r1 = await anteprime(req('/anteprime/anima-concept/?k=codice-di-prova-lungo'), contesto(PAGINA(FUTURO)));
  const valore = r1.headers.get('set-cookie').split(';')[0];
  const r2 = await anteprime(req('/anteprime/anima-concept/', { headers: { cookie: `altro=1; ${valore}` } }), contesto(PAGINA(FUTURO)));
  assert.equal(r2.status, 200);
  assert.match(await r2.text(), /Ciao/);
});

test('il cookie di un\'anteprima non apre un\'altra', async () => {
  env.set('ANTEPRIMA_CODICI', JSON.stringify({ 'anima-concept': 'codice-di-prova-lungo', 'borgo-spoltino': 'altro-codice-lungo-123' }));
  const r1 = await anteprime(req('/anteprime/anima-concept/?k=codice-di-prova-lungo'), contesto(PAGINA(FUTURO)));
  const [, valore] = r1.headers.get('set-cookie').split(';')[0].split('=');
  const r2 = await anteprime(req('/anteprime/borgo-spoltino/', { headers: { cookie: `anteprima-borgo-spoltino=${valore}` } }), contesto(PAGINA(FUTURO)));
  assert.equal(r2.status, 403);
});

test('la scadenza vale anche con il codice giusto', async () => {
  env.set('ANTEPRIMA_CODICI', JSON.stringify({ 'anima-concept': 'codice-di-prova-lungo' }));
  const r1 = await anteprime(req('/anteprime/anima-concept/?k=codice-di-prova-lungo'), contesto(PAGINA(PASSATO)));
  const valore = r1.headers.get('set-cookie').split(';')[0];
  const r2 = await anteprime(req('/anteprime/anima-concept/', { headers: { cookie: valore } }), contesto(PAGINA(PASSATO)));
  assert.equal(r2.status, 410);
});

test('ANTEPRIMA_CODICI scritto male chiude invece di aprire', async () => {
  env.set('ANTEPRIMA_CODICI', '{non json');
  const ctx = contesto(PAGINA(FUTURO));
  assert.equal((await anteprime(req('/anteprime/anima-concept/'), ctx)).status, 503);
  assert.equal((await anteprime(req('/anteprime/borgo-spoltino/'), ctx)).status, 503);
  assert.equal(ctx.chiamate, 0);
  env.set('ANTEPRIMA_CODICI', '["anima-concept"]');
  assert.equal((await anteprime(req('/anteprime/anima-concept/'), contesto(PAGINA(FUTURO)))).status, 503);
});

test('un codice troppo corto chiude solo la sua anteprima', async () => {
  env.set('ANTEPRIMA_CODICI', JSON.stringify({ 'anima-concept': 'corto' }));
  assert.equal((await anteprime(req('/anteprime/anima-concept/?k=corto'), contesto(PAGINA(FUTURO)))).status, 503);
  assert.equal((await anteprime(req('/anteprime/borgo-spoltino/'), contesto(PAGINA(FUTURO)))).status, 200);
});

test('le risorse non HTML passano con gli header ma senza essere toccate', async () => {
  const r = await anteprime(req('/anteprime/anima-concept/foto.webp'), contesto('BINARIO', { tipo: 'image/webp' }));
  assert.equal(r.status, 200);
  assert.equal(await r.text(), 'BINARIO');
  assert.equal(r.headers.get('content-security-policy'), null);
});

test('una pagina inesistente resta 404', async () => {
  const r = await anteprime(req('/anteprime/anima-concept/nulla/'), contesto('non trovato', { stato: 404 }));
  assert.equal(r.status, 404);
});

test('fuori da /anteprime/ o con un nome strano non fa nulla', async () => {
  const ctx = contesto('x');
  const r = await anteprime(req('/anteprime/../index.html'), ctx);
  assert.equal(ctx.chiamate, 1);
  assert.equal(r.headers.get('cache-control'), null);
});

test('le anteprime si possono solo leggere: POST → 405', async () => {
  const ctx = contesto(PAGINA(FUTURO));
  const r = await anteprime(req('/anteprime/anima-concept/', { method: 'POST' }), ctx);
  assert.equal(r.status, 405);
  assert.equal(r.headers.get('allow'), 'GET, HEAD');
  assert.equal(ctx.chiamate, 0);
});

test('indirizzi scritti in altro modo tornano alla forma canonica, senza saltare i controlli', async () => {
  env.set('ANTEPRIMA_CODICI', JSON.stringify({ 'anima-concept': 'codice-di-prova-lungo' }));
  for (const [da, a] of [
    ['/anteprime/anima%2Dconcept/', '/anteprime/anima-concept/'],
    ['/anteprime/%61nima-concept/?x=1', '/anteprime/anima-concept/?x=1'],
    ['/anteprime//anima-concept/', '/anteprime/anima-concept/'],
    ['/anteprime/anima-concept//index.html', '/anteprime/anima-concept/index.html'],
  ]) {
    const ctx = contesto(PAGINA(FUTURO));
    const r = await anteprime(req(da), ctx);
    assert.equal(r.status, 308, da);
    assert.equal(r.headers.get('location'), a, da);
    assert.equal(ctx.chiamate, 0, da);
  }
  // e all'indirizzo canonico il codice si chiede ancora
  assert.equal((await anteprime(req('/anteprime/anima-concept/index.html'), contesto(PAGINA(FUTURO)))).status, 403);
});

test('un nome di anteprima non valido è 404, senza giri di redirect', async () => {
  for (const da of ['/anteprime/x%20y/', '/anteprime/Anima-Concept/', '/anteprime/']) {
    const ctx = contesto(PAGINA(FUTURO));
    const r = await anteprime(req(da), ctx);
    assert.equal(r.status, 404, da);
    assert.equal(ctx.chiamate, 0, da);
  }
  assert.equal((await anteprime(req('/anteprime/%E0%A4%A/'), contesto(PAGINA(FUTURO)))).status, 400);
});

test('nessun redirect esce dalle anteprime (niente open redirect)', async () => {
  for (const da of [
    '/anteprime/%2e%2e%2f%5cevil.com',
    '/anteprime/%2E%2E%2F%5Cevil.com/x?y=1',
    '/anteprime/..%2f%5cevil.com',
    '/anteprime/..%5c/evil.com/%3fx',
    '/anteprime/x%2f..%2f..%2f%5cevil.com',
    '/anteprime/%2e%2e%2f%5c%5cevil.com',
    '/anteprime/%5c%5cevil.com',
    '/anteprime/%2e%2e%2findex.html',
    '/anteprime/anima-concept/%2e%2e%2f%2e%2e%2f',
    '/anteprime/%2f%2fevil.com',
  ]) {
    const ctx = contesto(PAGINA(FUTURO));
    const r = await anteprime(req(da), ctx);
    const dove = r.headers.get('location');
    assert.ok(!dove || (dove.startsWith('/anteprime/') && !dove.startsWith('//')), `${da} → ${dove}`);
    assert.ok([400, 404, 308].includes(r.status), `${da} → ${r.status}`);
    assert.equal(ctx.chiamate, 0, da);
  }
});

test('il redirect canonico arriva in un passo, mai a un indirizzo da correggere ancora', async () => {
  for (const da of ['/anteprime/anima-concept/%25', '/anteprime/anima-concept/%2525', '/anteprime/anima-concept/%2525%2532']) {
    const r = await anteprime(req(da), contesto(PAGINA(FUTURO)));
    if (r.status === 308) {
      const dopo = await anteprime(req(r.headers.get('location')), contesto(PAGINA(FUTURO)));
      assert.notEqual(dopo.status, 308, `${da} → ${r.headers.get('location')}`);
      assert.notEqual(dopo.status, 400, `${da} → ${r.headers.get('location')}`);
    } else {
      assert.equal(r.status, 400, da);
    }
  }
});

test('la cartella senza barra finale si apre con la barra, codice compreso', async () => {
  env.set('ANTEPRIMA_CODICI', JSON.stringify({ 'anima-concept': 'codice-di-prova-lungo' }));
  const r = await anteprime(req('/anteprime/anima-concept?k=codice-di-prova-lungo'), contesto(PAGINA(FUTURO)));
  assert.equal(r.status, 308);
  assert.equal(r.headers.get('location'), '/anteprime/anima-concept/?k=codice-di-prova-lungo');
});

test('Range e richieste condizionali non arrivano all\'origine: la scadenza si legge sempre', async () => {
  const ctx = contesto(PAGINA(PASSATO));
  const r = await anteprime(req('/anteprime/anima-concept/', { headers: { range: 'bytes=0-40', 'if-none-match': '"abc"' } }), ctx);
  assert.equal(r.status, 410);
  assert.equal(ctx.ultima.headers.get('range'), null);
  assert.equal(ctx.ultima.headers.get('if-none-match'), null);
});

test('se l\'origine risponde comunque con un pezzo di pagina, non lo inoltra', async () => {
  const r = await anteprime(req('/anteprime/anima-concept/', { headers: { range: 'bytes=0-40' } }), contesto(PAGINA(FUTURO), { ignoraRichiesta: true }));
  assert.equal(r.status, 416);
});

test('anche un HEAD rispetta la scadenza', async () => {
  const ctx = contesto(PAGINA(PASSATO));
  const r = await anteprime(req('/anteprime/anima-concept/', { method: 'HEAD' }), ctx);
  assert.equal(r.status, 410);
  assert.equal(ctx.ultima.method, 'GET');
  const ok = await anteprime(req('/anteprime/anima-concept/', { method: 'HEAD' }), contesto(PAGINA(FUTURO)));
  assert.equal(ok.status, 200);
  assert.equal(await ok.text(), '');
});
