/* Rigenera le immagini dell'anteprima Anima Concept Pizza dalla stessa scena
   Three.js della pagina: l'apertura (telefono, tablet, desktop senza 3D),
   le sei forme degli impasti e l'immagine per le anteprime social.

   Uso:   npm run dev                                   (in un altro terminale)
          node anteprime/anima-concept/render.mjs [http://localhost:5173]

   Richiede Playwright con Chromium e ffmpeg (con libwebp e libaom). */

import { execFileSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Serve Playwright: npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

const base = process.argv[2] || 'http://localhost:5173';
const out = fileURLToPath(new URL('../../public/assets/img/anima/', import.meta.url));
const tmp = await mkdtemp(join(tmpdir(), 'anima-'));
const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args]);

/* tappa: 0 panetto, 1 tonda, 2 romana, 3 padellino, 4 pala, 5 teglia, 6 senza glutine */
const forme = [
  ['tonda', 1, 0.62],
  ['romana', 2, 0.62],
  ['padellino', 3, 0.5],
  ['pala', 4, 0.74],
  ['teglia', 5, 0.62],
  ['senza-glutine', 6, 0.5],
];
const jobs = [
  // apertura: su desktop il soggetto sta a destra, su telefono in alto
  { name: 'panetto-l', w: 2400, h: 1500, tappa: 0, cx: 0.7, cy: 0.5, zoom: 1, aria: 0.3 },
  { name: 'panetto-m', w: 1600, h: 1000, tappa: 0, cx: 0.7, cy: 0.5, zoom: 1, aria: 0.3 },
  { name: 'panetto-v', w: 1080, h: 810, tappa: 0, cx: 0.5, cy: 0.47, zoom: 0.62, aria: 0.2 },
  { name: 'panetto-s', w: 720, h: 540, tappa: 0, cx: 0.5, cy: 0.47, zoom: 0.62, aria: 0.2 },
  ...forme.flatMap(([name, tappa, zoom]) => [
    { name: `${name}-m`, w: 1200, h: 900, tappa, cx: 0.5, cy: 0.5, zoom, aria: 0 },
    { name: `${name}-s`, w: 720, h: 540, tappa, cx: 0.5, cy: 0.5, zoom, aria: 0 },
  ]),
];

const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage();
page.on('console', (msg) => msg.type() === 'error' && console.error('[pagina]', msg.text()));

async function rendi(job) {
  const q = new URLSearchParams({ ...job, fmt: 'image/png', t: '4' });
  q.delete('name');
  await page.goto(`${base}/anteprime/anima-concept/dev/impasto.html?${q}`);
  const handle = await page.waitForFunction(() => window.__still, null, { timeout: 300_000 });
  const dataUrl = await handle.jsonValue();
  const png = join(tmp, `${job.name}.png`);
  await writeFile(png, Buffer.from(dataUrl.split(',')[1], 'base64'));
  return png;
}

for (const job of jobs) {
  const png = await rendi(job);
  const dest = join(out, job.name);
  ff(['-i', png, '-c:v', 'libwebp', '-quality', '72', `${dest}.webp`]);
  ff(['-i', png, '-c:v', 'libaom-av1', '-still-picture', '1', '-crf', '30', '-cpu-used', '6', '-pix_fmt', 'yuv420p', `${dest}.avif`]);
  console.log('✓', job.name);
}

/* Anteprima social (WhatsApp, Telegram...): la tonda e il titolo. */
const fondoOg = await rendi({ name: 'og-fondo', w: 1200, h: 630, tappa: 1, cx: 0.7, cy: 0.5, zoom: 1, aria: 0.3 });
const ogDev = fileURLToPath(new URL('./dev/og-fondo.png', import.meta.url));
execFileSync('cp', [fondoOg, ogDev]);
const social = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await social.goto(`${base}/anteprime/anima-concept/dev/og.html`);
await social.evaluate(() => document.fonts.ready);
await social.waitForFunction(() => document.querySelector('img').complete);
await social.waitForTimeout(300);
await social.screenshot({ path: fileURLToPath(new URL('../../public/assets/img/anima-og.jpg', import.meta.url)), type: 'jpeg', quality: 84 });
await rm(ogDev);
console.log('✓ anima-og.jpg');

await browser.close();
await rm(tmp, { recursive: true, force: true });
