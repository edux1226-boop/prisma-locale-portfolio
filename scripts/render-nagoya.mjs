/* Rigenera le immagini statiche del nigiri dell'anteprima Nagoya Sushi,
   dalla stessa scena Three.js: telefono senza WebGL, movimento ridotto,
   ripiego se il 3D è troppo lento. Più l'immagine per le anteprime social.

   Uso:   npm run dev                                   (in un altro terminale)
          node scripts/render-nagoya.mjs [http://localhost:5173]

   Richiede Playwright con Chromium. */

import { writeFile } from 'node:fs/promises';

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Serve Playwright: npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

const base = process.argv[2] || 'http://localhost:5173';
const out = new URL('../public/assets/img/', import.meta.url);

const jobs = [
  { name: 'nagoya-nigiri-tall-900', w: 900, h: 1500, q: 0.8 },
  { name: 'nagoya-nigiri-wide-1600', w: 1600, h: 1000, q: 0.82 },
  { name: 'nagoya-nigiri-wide-2400', w: 2400, h: 1500, q: 0.8 },
];

const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage();
page.on('console', (msg) => msg.type() === 'error' && console.error('[pagina]', msg.text()));

for (const job of jobs) {
  await page.goto(`${base}/dev/nagoya-still.html?w=${job.w}&h=${job.h}&q=${job.q}&p=1`);
  const handle = await page.waitForFunction(() => window.__still, null, { timeout: 300_000 });
  const dataUrl = await handle.jsonValue();
  await writeFile(new URL(`${job.name}.webp`, out), Buffer.from(dataUrl.split(',')[1], 'base64'));
  console.log('✓', job.name);
}

/* Anteprima social (WhatsApp, Telegram...): il nigiri e il titolo. */
const social = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await social.goto(`${base}/dev/nagoya-og.html`);
await social.evaluate(() => document.fonts.ready);
await social.waitForFunction(() => document.querySelector('img').complete);
await social.waitForTimeout(300);
await social.screenshot({ path: new URL('nagoya-og.jpg', out).pathname, type: 'jpeg', quality: 84 });
console.log('✓ nagoya-og.jpg');

await browser.close();
