/* Rigenera le immagini statiche del prisma dalla scena Three.js vera:
   hero su mobile, movimento ridotto, fallback se WebGL manca o si perde.

   Uso:   npm run dev            (in un altro terminale)
          node scripts/render-stills.mjs [http://localhost:5173]

   Richiede Playwright con Chromium: npm i -D playwright && npx playwright install chromium */

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
const only = process.env.ONLY;

const jobs = [
  { name: 'prisma-tall-720', layout: 'tall', w: 720, h: 1280, q: 0.8 },
  { name: 'prisma-tall-1080', layout: 'tall', w: 1080, h: 1920, q: 0.78 },
  { name: 'prisma-wide-1600', layout: 'wide', w: 1600, h: 1000, q: 0.82 },
  { name: 'prisma-wide-2400', layout: 'wide', w: 2400, h: 1500, q: 0.8 },
].filter((job) => !only || job.name.includes(only));

const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage();
page.on('console', (msg) => msg.type() === 'error' && console.error('[pagina]', msg.text()));

for (const job of jobs) {
  const url = `${base}/dev/still.html?layout=${job.layout}&w=${job.w}&h=${job.h}&q=${job.q}`;
  await page.goto(url);
  const handle = await page.waitForFunction(() => window.__still, null, { timeout: 180_000 });
  const dataUrl = await handle.jsonValue();
  const file = new URL(`${job.name}.webp`, out);
  await writeFile(file, Buffer.from(dataUrl.split(',')[1], 'base64'));
  console.log('✓', job.name);
}

/* Immagine per i social e icone PNG, dagli stessi materiali. */
if (!only || only === 'social') {
  const social = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await social.goto(`${base}/dev/og.html`);
  await social.evaluate(() => document.fonts.ready);
  await social.waitForTimeout(300);
  await social.locator('#og').screenshot({ path: new URL('og-prisma-locale.jpg', out).pathname, type: 'jpeg', quality: 86 });
  console.log('✓ og-prisma-locale.jpg');

  for (const size of [32, 180]) {
    const icon = await browser.newPage({ viewport: { width: size, height: size } });
    await icon.goto(`${base}/favicon.svg`);
    const name = size === 32 ? 'favicon-32.png' : 'apple-touch-icon.png';
    await icon.screenshot({ path: new URL(`../../${name}`, out).pathname, omitBackground: true });
    console.log('✓', name);
  }
}

await browser.close();
