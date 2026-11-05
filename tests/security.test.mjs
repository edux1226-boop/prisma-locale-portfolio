// Test di regressione sicurezza: richiedono `npm run build` precedente.
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { start } from '../scripts/serve-dist.mjs';
import { scanDist } from '../scripts/scan-dist.mjs';

let srv, base;
before(async () => {
  process.env.PORT = '0';
  srv = await start();
  base = `http://127.0.0.1:${srv.address().port}`;
});
after(() => { srv.closeAllConnections(); srv.close(); });

const REQUIRED = ['content-security-policy', 'strict-transport-security', 'x-content-type-options', 'x-frame-options', 'referrer-policy', 'permissions-policy', 'cross-origin-opener-policy', 'cross-origin-resource-policy'];

for (const path of ['/', '/menu/', '/allergeni/', '/pagina-che-non-esiste/']) {
  test(`header di sicurezza presenti su ${path}`, async () => {
    const r = await fetch(base + path);
    for (const h of REQUIRED) assert.ok(r.headers.get(h), `manca ${h}`);
    assert.equal(r.headers.get('x-powered-by'), null);
    assert.equal(r.headers.get('server'), null);
  });
}

test('CSP rigorosa', async () => {
  const csp = (await fetch(base + '/')).headers.get('content-security-policy');
  assert.ok(csp.startsWith("default-src 'none'"));
  assert.ok(!/unsafe-inline|unsafe-eval/.test(csp));
  for (const d of ["frame-ancestors 'none'", "base-uri 'none'", "object-src 'none'", "script-src 'self'"]) assert.ok(csp.includes(d), d);
});

test('asset hashati immutable, HTML sempre rivalidato', async () => {
  const html = await (await fetch(base + '/')).text();
  const asset = html.match(/\/_astro\/[^"]+\.(?:js|webp|woff2)/)[0];
  assert.match((await fetch(base + asset)).headers.get('cache-control'), /immutable/);
  assert.match((await fetch(base + '/')).headers.get('cache-control'), /must-revalidate/);
});

for (const p of ['/.git/HEAD', '/.env', '/_headers', '/package.json', '/../package.json', '/%2e%2e/package.json', '/_astro/', '/admin/', '/api/', '/index.js.map']) {
  test(`non esposto: ${p}`, async () => {
    const r = await fetch(base + p);
    assert.equal(r.status, 404);
    const body = await r.text();
    assert.ok(!/node|astro|express|stack|at .*\(/i.test(body.replace(/<[^>]+>/g, ' ').slice(0, 2000)) || !/Error:/.test(body));
  });
}

test('security.txt e robots disponibili', async () => {
  assert.equal((await fetch(base + '/.well-known/security.txt')).status, 200);
  assert.equal((await fetch(base + '/robots.txt')).status, 200);
});

test('scansione dist: nessun segreto, source map, EXIF, inline, terze parti', async () => {
  const { findings } = await scanDist();
  assert.deepEqual(findings, []);
});

test('metodi diversi da GET/HEAD rifiutati', async () => {
  for (const m of ['POST', 'PUT', 'DELETE', 'OPTIONS']) assert.equal((await fetch(base + '/', { method: m })).status, 405, m);
});

test('input in query string non riflesso nella pagina', async () => {
  const html = await (await fetch(base + '/?q=%3Cscript%3Ealert(1)%3C/script%3E')).text();
  assert.ok(!html.includes('alert(1)'));
});
