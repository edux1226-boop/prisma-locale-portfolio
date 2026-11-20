// Costruisce index.html: incorpora i font in base64 e genera i sottobicchieri SVG.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const fontDir = process.argv[2];
const b64 = (f) => readFileSync(join(fontDir, f)).toString('base64');

const CAFFE = '#2A1A0E', BAVARO = '#2F6FB0', AMBRA = '#E08A00', CARTONE = '#E8D3A4';

// anello di losanghe bavaresi
function rauten(n = 36, r = 177) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = (360 / n) * i;
    s += `<path d="M0 -12L8 0 0 12-8 0z" transform="rotate(${a}) translate(0 ${-r})"/>`;
  }
  return `<g fill="${BAVARO}">${s}</g>`;
}

function coaster(id, ring, centre) {
  return `<symbol id="${id}" viewBox="-210 -210 420 420">
<circle cx="7" cy="7" r="200" fill="${CAFFE}"/>
<circle r="200" fill="${CARTONE}" stroke="${CAFFE}" stroke-width="3"/>
${rauten()}
<circle r="150" fill="none" stroke="${CAFFE}" stroke-width="1.5"/>
<path id="${id}-p" d="M-126 0a126 126 0 1 1 252 0a126 126 0 1 1-252 0" fill="none"/>
<text font-family="Alfa Slab One, Georgia, serif" font-size="19" letter-spacing="2.2" fill="${CAFFE}"><textPath href="#${id}-p">${ring}</textPath></text>
<circle r="92" fill="${AMBRA}" stroke="${CAFFE}" stroke-width="3"/>
${centre}
</symbol>`;
}

const t = (txt, y, size, extra = '') =>
  `<text y="${y}" text-anchor="middle" font-family="Alfa Slab One, Georgia, serif" font-size="${size}" fill="${CAFFE}" ${extra}>${txt}</text>`;

const symbols =
  coaster('c-hero', 'RISTO PUB · ROSETO DEGLI ABRUZZI · BRACE · BIRRA · ', t('Ludwig', 8, 40) + t('PUB BAVARESE', 36, 11.5, 'letter-spacing="2" font-family="Hanken Grotesk, sans-serif" font-weight="700"')) +
  coaster('c-live', 'MUSICA DAL VIVO · IL GIOVEDÌ · ROSETO DEGLI ABRUZZI · ', t('GIOVEDÌ', -8, 30) + t('LIVE', 44, 50)) +
  `<symbol id="c-ring" viewBox="-210 -210 420 420">${rauten()}<circle r="150" fill="none" stroke="${CAFFE}" stroke-width="1.5"/></symbol>`;

let html = readFileSync(join(here, 'src.html'), 'utf8');
const map = {
  FONT_SLAB: b64('alfa-slab-one-latin-400-normal.woff2'),
  FONT_400: b64('hanken-grotesk-latin-400-normal.woff2'),
  FONT_700: b64('hanken-grotesk-latin-700-normal.woff2'),
  SYMBOLS: symbols,
};
for (const [k, v] of Object.entries(map)) html = html.replaceAll(`{{${k}}}`, v);
writeFileSync(join(here, 'index.html'), html);
console.log('index.html', (html.length / 1024).toFixed(1), 'KB');
