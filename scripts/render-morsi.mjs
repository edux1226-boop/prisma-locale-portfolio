/* Ricava dalle foto di riferimento (dev/morsi/foto/, piccole, da telefono) le immagini
   dell'anteprima Morsi in AVIF e WebP, in public/assets/img/morsi/.

   Le foto hanno 290–500 px di lato: per non mostrarle sgranate si usano in dimensioni
   contenute, con una versione "-l" ingrandita e coperta da grana fine, e per l'hero con un
   trattamento duotono blu. Quando arrivano le foto in alta risoluzione basta rimetterle in
   dev/morsi/foto/ con gli stessi nomi e rilanciare lo script.

   Uso:  npm i --no-save sharp && node scripts/render-morsi.mjs */

import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

let sharp;
try {
  ({ default: sharp } = await import('sharp'));
} catch {
  console.error('Serve sharp: npm i --no-save sharp');
  process.exit(1);
}

const src = (n) => fileURLToPath(new URL(`../dev/morsi/foto/${n}.webp`, import.meta.url));
const out = fileURLToPath(new URL('../public/assets/img/morsi/', import.meta.url));
await mkdir(out, { recursive: true });

const SALVA = async (img, nome) => {
  await img.clone().webp({ quality: 82, effort: 5 }).toFile(`${out}${nome}.webp`);
  await img.clone().avif({ quality: 52, effort: 6 }).toFile(`${out}${nome}.avif`);
  console.log('  ', nome);
};

/** Grana fine sopra l'immagine: nasconde l'ingrandimento. */
const grana = async (buf, sigma = 14) => {
  const { width, height } = await sharp(buf).metadata();
  const rumore = await sharp({ create: { width, height, channels: 3, noise: { type: 'gaussian', mean: 128, sigma } } })
    .png()
    .toBuffer();
  return sharp(buf).composite([{ input: rumore, blend: 'soft-light' }]);
};

const lerp = (a, b, t) => a + (b - a) * t;
const MAPPA = [
  [0, [2, 2, 38]],
  [0.5, [5, 4, 255]],
  [1, [236, 236, 255]],
];
const colore = (t) => {
  const [a, b] = t < MAPPA[1][0] ? [MAPPA[0], MAPPA[1]] : [MAPPA[1], MAPPA[2]];
  const k = (t - a[0]) / (b[0] - a[0]);
  return a[1].map((v, i) => Math.round(lerp(v, b[1][i], k)));
};

async function duotono(img) {
  const { data, info } = await img.clone().greyscale().normalise({ lower: 2, upper: 98 }).raw().toBuffer({ resolveWithObject: true });
  const rgb = Buffer.alloc(info.width * info.height * 3);
  for (let i = 0; i < info.width * info.height; i++) {
    const [r, g, b] = colore(data[i * info.channels] / 255);
    rgb[i * 3] = r;
    rgb[i * 3 + 1] = g;
    rgb[i * 3 + 2] = b;
  }
  return sharp(rgb, { raw: { width: info.width, height: info.height, channels: 3 } });
}

async function famiglia(nomeFoto, base, { duo = false } = {}) {
  const orig = sharp(src(nomeFoto));
  const { width, height } = await orig.metadata();
  const sorgente = duo ? await duotono(orig) : orig;
  // -m: dimensione nativa. -l: raddoppiata con Lanczos e grana (per gli schermi ad alta densità).
  await SALVA(await grana(await sorgente.clone().png().toBuffer(), 6), `${base}-m`);
  const grande = await sorgente.clone().resize(width * 2, height * 2, { kernel: 'lanczos3' }).sharpen({ sigma: 0.8 }).png().toBuffer();
  await SALVA(await grana(grande, 16), `${base}-l`);
}

console.log('Immagini Morsi:');
await famiglia('morsi-melt', 'melt');
await famiglia('morsi-melt', 'melt-duo', { duo: true });
await famiglia('interno-sala', 'sala');
await famiglia('insegna-neon', 'neon');

// Piastrella di grana per l'overlay dell'hero (trasparente, ripetibile).
const lato = 220;
const { data, info } = await sharp({ create: { width: lato, height: lato, channels: 3, background: '#808080', noise: { type: 'gaussian', mean: 128, sigma: 60 } } })
  .raw()
  .toBuffer({ resolveWithObject: true });
const px = Buffer.alloc(lato * lato * 4);
for (let i = 0; i < lato * lato; i++) {
  const v = data[i * info.channels];
  const chiaro = v > 128 ? 255 : 0;
  px[i * 4] = px[i * 4 + 1] = px[i * 4 + 2] = chiaro;
  px[i * 4 + 3] = Math.abs(v - 128) > 40 ? 26 : 0;
}
await sharp(px, { raw: { width: lato, height: lato, channels: 4 } }).webp({ quality: 70 }).toFile(`${out}grana.webp`);
console.log('   grana');
