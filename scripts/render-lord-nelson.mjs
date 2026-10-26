/* Ricava dalle foto di riferimento (dev/lord-nelson/foto/, piccole, circa 200–260 px di lato)
   le immagini dell'anteprima Lord Nelson in AVIF e WebP, in public/assets/img/lord-nelson/,
   più la texture del legno bruciato (generata, non è una foto del locale).

   Le foto sono piccole: restano in dimensioni contenute, con una versione "-l" ingrandita e
   coperta da grana fine. Quando arrivano gli scatti in alta risoluzione basta rimetterli in
   dev/lord-nelson/foto/ con gli stessi nomi e rilanciare lo script.
   Le pagine del menu (menu-*.jpg) non si usano: servono solo come fonte dei contenuti.

   Uso:  npm i --no-save sharp && node scripts/render-lord-nelson.mjs */

import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

let sharp;
try {
  ({ default: sharp } = await import('sharp'));
} catch {
  console.error('Serve sharp: npm i --no-save sharp');
  process.exit(1);
}

const src = (n) => fileURLToPath(new URL(`../dev/lord-nelson/foto/${n}.jpg`, import.meta.url));
const out = fileURLToPath(new URL('../public/assets/img/lord-nelson/', import.meta.url));
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

async function famiglia(nome, base, { grano = 6 } = {}) {
  const orig = sharp(src(nome));
  const { width, height } = await orig.metadata();
  // -m: dimensione nativa. -l: raddoppiata con Lanczos e grana (schermi ad alta densità).
  await SALVA(await grana(await orig.clone().png().toBuffer(), grano), `${base}-m`);
  const grande = await orig.clone().resize(width * 2, height * 2, { kernel: 'lanczos3' }).sharpen({ sigma: 0.8 }).png().toBuffer();
  await SALVA(await grana(grande, grano * 2.4), `${base}-l`);
}

console.log('Immagini Lord Nelson:');
// Il logo ha il fondo bianco: in pagina sta su un medaglione color schiuma con mix-blend-mode: multiply.
await famiglia('logo', 'logo', { grano: 0.01 });
await famiglia('bancone-isola', 'isola');
await famiglia('bancone-spine', 'spine');
await famiglia('bancone-legno-bruciato', 'legno');

/* Texture del legno bruciato: venature orizzontali scure su fondo bruno, specchiata per essere
   ripetibile senza cuciture. Leggerissima (qualche kB), usata a bassa opacità sui fondi. */
const L = 512;
const venatura = async (w, h, sigma) =>
  sharp({ create: { width: w, height: h, channels: 3, noise: { type: 'gaussian', mean: 128, sigma } } })
    .resize(L, L, { fit: 'fill', kernel: 'cubic' })
    .greyscale()
    .normalise({ lower: 2, upper: 98 })
    .png()
    .toBuffer();
const lunghe = await venatura(10, 170, 70); // strisce lunghe e sottili
const fini = await venatura(24, 420, 70);
const base = await sharp(lunghe)
  .composite([{ input: fini, blend: 'soft-light' }])
  .gamma(1.6)
  .linear(0.55, 6)
  .tint('#8a5a34')
  .png()
  .toBuffer();
const mezzo = await sharp(base).extract({ left: 0, top: 0, width: L, height: L }).toBuffer();
const specchio = await sharp(mezzo).flop().toBuffer();
await sharp({ create: { width: L * 2, height: L, channels: 3, background: '#000' } })
  .composite([{ input: mezzo, left: 0, top: 0 }, { input: specchio, left: L, top: 0 }])
  .webp({ quality: 55, effort: 5 })
  .toFile(`${out}legno-bruciato.webp`);
console.log('   legno-bruciato (texture)');
