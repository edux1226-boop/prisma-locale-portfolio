/* Genera public/assets/img/morsi-og.jpg (1200×630) dalla pagina dev/morsi/og.html:
   logo su blu + Morsi Melt. Richiede Playwright con Chromium e sharp.
   Uso:  npm i --no-save sharp playwright && node scripts/render-morsi-og.mjs */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const { default: sharp } = await import('sharp');

const aqui = (p) => fileURLToPath(new URL(p, import.meta.url));
const publicUrl = pathToFileURL(aqui('../public')).href;
const logo = readFileSync(aqui('../src/anteprime/morsi/svg/logo.svg'), 'utf8').replace(/<!--[\s\S]*?-->\s*/, '');
const html = readFileSync(aqui('../dev/morsi/og.html'), 'utf8').replaceAll('@PUBLIC@', publicUrl).replace('@LOGO@', logo);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
// file temporaneo: una pagina about:blank non può caricare immagini file://
const dir = mkdtempSync(join(tmpdir(), 'morsi-og-'));
writeFileSync(join(dir, 'og.html'), html);
await page.goto(pathToFileURL(join(dir, 'og.html')).href, { waitUntil: 'load' });
await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.decode())); });
const png = await page.screenshot({ type: 'png' });
await browser.close();
rmSync(dir, { recursive: true, force: true });
await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile(aqui('../public/assets/img/morsi-og.jpg'));
console.log('public/assets/img/morsi-og.jpg');
