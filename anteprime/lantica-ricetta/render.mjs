/* Rigenera l'immagine per le anteprime social (WhatsApp, Telegram...)
   dell'anteprima L'Antica Ricetta: la pala disegnata e il titolo.
   La pala nella pagina si disegna dal vivo, quindi non servono altre immagini.

   Uso:   npm run dev                                   (in un altro terminale)
          node anteprime/lantica-ricetta/render.mjs [http://localhost:5173]

   Richiede Playwright con Chromium. */

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('Serve Playwright: npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

const base = process.argv[2] || 'http://localhost:5173';
const out = new URL('../../public/assets/img/', import.meta.url);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
page.on('console', (msg) => msg.type() === 'error' && console.error('[pagina]', msg.text()));
await page.goto(`${base}/anteprime/lantica-ricetta/dev/og.html`);
await page.waitForFunction(() => window.__pronta);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
await page.screenshot({ path: new URL('ricetta-og.jpg', out).pathname, type: 'jpeg', quality: 84 });
console.log('✓ ricetta-og.jpg');

await browser.close();
