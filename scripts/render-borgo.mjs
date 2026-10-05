/* Rigenera le tavole provvisorie dell'anteprima Borgo Spoltino (dipinti
   generati, non fotografie) in AVIF e WebP, nelle misure usate dalla pagina.
   Quando arrivano le foto vere si sostituiscono i file con lo stesso nome.

   Uso:   npm run dev                                   (in un altro terminale)
          node scripts/render-borgo.mjs [http://localhost:5173] [solo-questo-nome]

   Richiede Playwright con Chromium e ffmpeg (con libwebp e libaom). */

import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Serve Playwright: npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

const base = process.argv[2] || 'http://localhost:5173';
const solo = process.argv[3];
const out = fileURLToPath(new URL('../public/assets/img/borgo/', import.meta.url));

// [nome, scena, parametri, misure [larghezza, altezza, suffisso], alfa]
const colle = { zoom: 0.8, cx: 0.24, cy: 0.47 };
const colleAlto = { zoom: 0.8, cx: 0.3, cy: 0.47 };
const largo = [[2400, 1350, 'l'], [1400, 788, 'm']];
const alto = [[900, 1600, 'v']];
const jobs = [
  // la hero, in tre piani per la parallasse
  ...[1, 2, 3].flatMap((strato) => [
    [`hero-${strato}`, 'aperitivo', { strato }, [[2560, 1440, 'l'], [1600, 900, 'm']], strato > 1],
    [`hero-${strato}`, 'aperitivo', { strato, cx: 0.16 }, [[1080, 1920, 'v'], [720, 1280, 's']], strato > 1],
  ]),
  // la giornata
  ...['cerimonia', 'aperitivo', 'ricevimento', 'festa', 'notte'].flatMap((ora) => [
    [`giorno-${ora}`, ora, colle, largo],
    [`giorno-${ora}`, ora, colleAlto, alto],
  ]),
  ['viale', 'viale', {}, largo],
  ['viale', 'viale', {}, [[1080, 1620, 'v']]],
  ['luci', 'luci', {}, [[1600, 1200, 'l'], [900, 1200, 'v']]],
  ['lino', 'lino', {}, [[1200, 1500, 'v']]],
  ['luna', 'notte', { zoom: 0.42, cx: -0.42, cy: 0.66 }, [[960, 1200, 'v']]],
  ['monte', 'aperitivo', { zoom: 0.36, cx: -0.25, cy: 0.4 }, [[1600, 1000, 'l']]],
  ['borgo-sera', 'ricevimento', { zoom: 0.4, cx: 0.36, cy: 0.44 }, [[1600, 1000, 'l']]],
  ['borgo-notte', 'festa', { zoom: 0.5, cx: 0.36, cy: 0.5 }, [[960, 1200, 'v']]],
  // il plastico statico (telefoni, movimento ridotto, niente WebGL): è una
  // fotografia della pagina di servizio, con le etichette
  ['plastico', 'plastico', { p: 0 }, [[1600, 1000, 'l']]],
  ['plastico', 'plastico', { p: 0, v: '' }, [[900, 1200, 'v']]],
  // l'immagine per le anteprime social (va in public/assets/img/borgo-og.jpg)
  ['og', 'og', {}, [[1200, 630, '']]],
];

const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args]);
const tmp = await mkdtemp(join(tmpdir(), 'borgo-'));
const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage();
page.on('pageerror', (e) => console.error('[pagina]', e.message));

for (const [nome, scena, opz, misure, alfa = false] of jobs) {
  if (solo && nome !== solo) continue;
  for (const [w, h, suff] of misure) {
    const png = join(tmp, `${nome}-${suff}.png`);
    if (scena === 'plastico' || scena === 'og') {
      await page.setViewportSize({ width: w, height: h });
      await page.goto(`${base}/dev/borgo/${scena}.html?${new URLSearchParams({ w, h, ...opz })}`);
      await page.waitForFunction(() => window.__pronto, null, { timeout: 300_000 });
      await page.screenshot({ path: png });
    } else {
      const q = new URLSearchParams({ t: scena, w, h, ...opz });
      await page.goto(`${base}/dev/borgo/tavole.html?${q}`);
      const handle = await page.waitForFunction(() => window.__still, null, { timeout: 300_000 });
      await writeFile(png, Buffer.from((await handle.jsonValue()).split(',')[1], 'base64'));
    }
    const dest = join(out, `${nome}-${suff}`);
    if (scena === 'og') {
      ff(['-i', png, '-q:v', '3', fileURLToPath(new URL('../public/assets/img/borgo-og.jpg', import.meta.url))]);
    } else if (alfa) {
      ff(['-i', png, '-c:v', 'libwebp', '-pix_fmt', 'yuva420p', '-quality', '82', `${dest}.webp`]);
    } else {
      ff(['-i', png, '-c:v', 'libwebp', '-quality', '80', `${dest}.webp`]);
      ff(['-i', png, '-c:v', 'libaom-av1', '-still-picture', '1', '-crf', '30', '-cpu-used', '6', '-pix_fmt', 'yuv420p', `${dest}.avif`]);
    }
    console.log('✓', suff ? `${nome}-${suff}` : nome, `${w}×${h}`);
  }
}

await browser.close();
await rm(tmp, { recursive: true, force: true });
