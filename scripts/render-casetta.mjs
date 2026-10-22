/* Rigenera le immagini dell'anteprima "La Casetta di Paparill": le tavole
   illustrate provvisorie (dipinte su canvas in dev/casetta/, non foto), le
   icone del sito e il menu in PDF. Quando arrivano le foto vere si
   sostituiscono i file con lo stesso nome e la stessa misura.

   Uso:   npm run dev                                         (in un altro terminale)
          node scripts/render-casetta.mjs                     tutto
          node scripts/render-casetta.mjs tavole [nome…]      solo le tavole (o alcune)
          node scripts/render-casetta.mjs icone               favicon e icone PWA
          node scripts/render-casetta.mjs pdf                 il menu in PDF

   Richiede Playwright con Chromium e ffmpeg (con libwebp e libaom). */

import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Serve Playwright: npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

const base = process.env.CASETTA_URL || 'http://localhost:5173';
const [cosa = 'tutto', ...solo] = process.argv.slice(2);
const radice = fileURLToPath(new URL('../', import.meta.url));
const img = join(radice, 'public/assets/img/casetta');
const pubblica = join(radice, 'public/anteprime/casetta-paparill');

// [file di uscita, tavola, larghezza, altezza, misure in uscita]
const QUATTRO_TERZI = [1200, 600];
const piatti = ['chitarra-pallottine', 'mugnaia', 'scrippelle', 'timballo', 'chitarra-tartufo', 'ravioli', 'sagne-e-ceci',
  'pizza-e-foje', 'tagliere', 'formaggi', 'pallotte', 'arrosticini', 'agnello-diavola', 'grigliata', 'pizza-dolce', 'bocconotti'];
const sala = ['tavola-per-due', 'casetta-sera', 'tavolata', 'calici', 'pane-olio', 'cantina', 'luci', 'caffe'];
const cucina = ['farina-uova', 'sfoglia', 'chitarra', 'spiedini', 'brace', 'dolci-forno'];
const TAVOLE = [
  ...piatti.map((n) => [`piatti/${n}`, n, 1200, 900, QUATTRO_TERZI]),
  ...sala.map((n) => [`sala/${n}`, n, 1200, 900, QUATTRO_TERZI]),
  ...cucina.map((n) => [`cucina/${n}`, n, 1200, 900, QUATTRO_TERZI]),
  ['piatto-vuoto', 'piatto-vuoto', 1200, 900, QUATTRO_TERZI],
  ['hero', 'hero', 2048, 1152, [2048, 1280]],
  ['hero-v', 'hero', 1080, 1920, [1080, 750]],
];

const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args]);

async function tavole(browser) {
  const tmp = await mkdtemp(join(tmpdir(), 'casetta-'));
  const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
  page.on('pageerror', (e) => console.error('[pagina]', e.message));
  const lavori = solo.length ? TAVOLE.filter(([, nome, , , ]) => solo.includes(nome)) : TAVOLE;
  for (const [file, nome, w, h, misure] of lavori) {
    await page.goto(`${base}/dev/casetta/tavole.html?t=${nome}&w=${w}&h=${h}`);
    const handle = await page.waitForFunction(() => window.__still || window.__errore, null, { timeout: 300_000 });
    const valore = await handle.jsonValue();
    if (!valore.startsWith('data:')) throw new Error(`${nome}: ${valore}`);
    const png = join(tmp, `${nome}-${w}.png`);
    await writeFile(png, Buffer.from(valore.split(',')[1], 'base64'));
    for (const larghezza of misure) {
      const dest = join(img, `${file}-${larghezza}`);
      await mkdir(dirname(dest), { recursive: true });
      const scala = ['-vf', `scale=${larghezza}:-2:flags=lanczos`];
      ff(['-i', png, ...scala, '-c:v', 'libwebp', '-quality', file.startsWith('hero') ? '82' : '80', `${dest}.webp`]);
      ff(['-i', png, ...scala, '-c:v', 'libaom-av1', '-still-picture', '1', '-crf', '30', '-cpu-used', '6', '-pix_fmt', 'yuv420p', `${dest}.avif`]);
    }
    console.log('✓', file, misure.join(' / '));
  }
  // l'immagine per le anteprime social
  if (!solo.length || solo.includes('og')) {
    await page.goto(`${base}/dev/casetta/tavole.html?t=og&w=1200&h=630`);
    const handle = await page.waitForFunction(() => window.__still || window.__errore, null, { timeout: 300_000 });
    const png = join(tmp, 'og.png');
    await writeFile(png, Buffer.from((await handle.jsonValue()).split(',')[1], 'base64'));
    ff(['-i', png, '-q:v', '3', join(radice, 'public/assets/img/casetta-og.jpg')]);
    console.log('✓ casetta-og.jpg');
  }
  await rm(tmp, { recursive: true, force: true });
}

/* Il marchio: la casetta oro su blu, col cuore corallo. */
const casetta = (colore, cuore) => `<g fill="none" stroke="${colore}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 15 16 5.5 27.5 15"/><path d="M21.5 9.6V6.2h3v6.2"/><path d="M7.5 12.8v13.7h17V12.8"/><path d="M13.6 26.5v-5a2.4 2.4 0 0 1 4.8 0v5"/><path d="M3.5 26.5h25"/></g><path fill="${cuore}" d="M16 18.6c-1.4-1-2.7-1.8-2.7-3 0-1.4 1.8-1.9 2.7-.8.9-1.1 2.7-.6 2.7.8 0 1.2-1.3 2-2.7 3Z"/>`;

function icona({ maschera = false } = {}) {
  // nella versione "maskable" il disegno sta nell'80% centrale
  const scala = maschera ? 0.62 : 0.78;
  const t = (32 - 32 * scala) / 2;
  const fondo = maschera ? '<rect width="32" height="32" fill="#1a3a52"/>' : '<rect width="32" height="32" rx="7" fill="#1a3a52"/>';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${fondo}<g transform="translate(${t.toFixed(2)} ${(t - 0.6).toFixed(2)}) scale(${scala})">${casetta('#c9a66b', '#e63946')}</g></svg>`;
}

async function icone(browser) {
  await mkdir(pubblica, { recursive: true });
  await writeFile(join(pubblica, 'favicon.svg'), `${icona()}\n`);
  const page = await browser.newPage();
  const lavori = [
    ['favicon-32.png', 32, false],
    ['apple-touch-icon.png', 180, true],
    ['icona-192.png', 192, false],
    ['icona-512.png', 512, false],
    ['icona-maskable-512.png', 512, true],
  ];
  for (const [nome, lato, maschera] of lavori) {
    await page.setViewportSize({ width: lato, height: lato });
    await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${lato}px;height:${lato}px}</style>${icona({ maschera })}`);
    await page.screenshot({ path: join(pubblica, nome), omitBackground: !maschera });
    console.log('✓', nome);
  }
}

async function pdf(browser) {
  const sito = JSON.parse(await readFile(join(radice, 'src/anteprime/casetta/contenuti/sito.json'), 'utf8'));
  const prima = sito.anteprima ? 'Menu d\'esempio · anteprima di Prisma Locale · ' : '';
  const page = await browser.newPage();
  await page.goto(`${base}/anteprime/casetta-paparill/menu/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: 'print' });
  await page.pdf({
    path: join(pubblica, 'menu-casetta-paparill.pdf'),
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: `<div style="width:100%;font:8px Arial,sans-serif;color:#5b6467;text-align:center;">${prima}La Casetta di Paparill · Via Salara 11, Roseto degli Abruzzi · 085 899 8167 · pagina <span class="pageNumber"></span> di <span class="totalPages"></span></div>`,
  });
  console.log('✓ menu-casetta-paparill.pdf');
}

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  if (cosa === 'tutto' || cosa === 'tavole') await tavole(browser);
  if (cosa === 'tutto' || cosa === 'icone') await icone(browser);
  if (cosa === 'tutto' || cosa === 'pdf') await pdf(browser);
} finally {
  await browser.close();
}
