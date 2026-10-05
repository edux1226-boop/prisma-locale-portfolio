/* Rigenera le lastre provvisorie dell'anteprima Vecchia Marina (studi di
   mare generati, non fotografie) in AVIF e WebP, nelle misure della pagina.
   Quando arrivano le foto vere si sostituiscono i file con lo stesso nome.

   Uso:   npm run dev                                   (in un altro terminale)
          node scripts/render-marina.mjs [http://localhost:5173] [solo-questo-nome]

   Richiede Playwright con Chromium e ffmpeg (con libwebp e libaom). */

import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
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
const out = fileURLToPath(new URL('../public/assets/img/marina/', import.meta.url));
await mkdir(out, { recursive: true });

const largo = [[2400, 1350, 'l'], [1400, 788, 'm']];
const alto = [[1080, 1620, 'v']];
// [nome, scena, parametri, misure [larghezza, altezza, suffisso]]
const jobs = [
  ['superficie', 'superficie', {}, [[2560, 1440, 'l'], [1600, 900, 'm']]],
  ['superficie', 'superficie', { uPitch: 0.62 }, [[1080, 1920, 'v'], [828, 1472, 's']]],
  ...['alba', 'notte', 'piombo', 'sera', 'risacca', 'battigia'].flatMap((n) => [
    [n, n, {}, largo],
    [n, n, {}, alto],
  ]),
  ['og', 'og', {}, [[1200, 630, '']]],
];

const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args]);
const tmp = await mkdtemp(join(tmpdir(), 'marina-'));
const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage();
page.on('pageerror', (e) => console.error('[pagina]', e.message));

for (const [nome, scena, opz, misure] of jobs) {
  if (solo && nome !== solo) continue;
  for (const [w, h, suff] of misure) {
    const png = join(tmp, `${nome}-${suff}.png`);
    if (scena === 'og') {
      await page.setViewportSize({ width: w, height: h });
      await page.goto(`${base}/dev/marina/og.html`);
      await page.waitForFunction(() => window.__pronto, null, { timeout: 300_000 });
      await page.screenshot({ path: png });
      ff(['-i', png, '-q:v', '3', fileURLToPath(new URL('../public/assets/img/marina-og.jpg', import.meta.url))]);
    } else {
      const q = new URLSearchParams({ t: scena, w, h, ...opz });
      await page.goto(`${base}/dev/marina/lastre.html?${q}`);
      const handle = await page.waitForFunction(() => window.__still, null, { timeout: 300_000 });
      await writeFile(png, Buffer.from((await handle.jsonValue()).split(',')[1], 'base64'));
      const dest = join(out, `${nome}-${suff}`);
      ff(['-i', png, '-c:v', 'libwebp', '-quality', '80', `${dest}.webp`]);
      ff(['-i', png, '-c:v', 'libaom-av1', '-still-picture', '1', '-crf', '30', '-cpu-used', '6', '-pix_fmt', 'yuv420p', `${dest}.avif`]);
    }
    console.log('✓', suff ? `${nome}-${suff}` : nome, `${w}×${h}`);
  }
}

await browser.close();
await rm(tmp, { recursive: true, force: true });
