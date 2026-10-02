/* Assembla l'anteprima di Destino in un unico index.html autonomo:
   font e foto in base64, script dai CDN.

   Uso: node dev/destino/build.mjs
   Esce in public/anteprime/destino/index.html (pubblicato così com'è). */

import { readFile, writeFile, mkdir } from 'node:fs/promises';

const qui = new URL('./', import.meta.url);
const leggi = (nome) => readFile(new URL(nome, qui));
const b64 = async (nome) => (await leggi(nome)).toString('base64');

let html = await readFile(new URL('index.src.html', qui), 'utf8');
const script = await readFile(new URL('destino.js', qui), 'utf8');

const sostituzioni = {
  __FONT_ITALIANA__: await b64('assets/italiana-latin-400.woff2'),
  __FONT_FAMILJEN__: await b64('assets/familjen-grotesk-latin-wght.woff2'),
  __IMG_TERRAZZA__: await b64('assets/terrazza.webp'),
  __IMG_LOVE__: await b64('assets/love.webp'),
  __SCRIPT__: script.trim(),
};

for (const [segnaposto, valore] of Object.entries(sostituzioni)) {
  if (!html.includes(segnaposto)) throw new Error(`Segnaposto mancante: ${segnaposto}`);
  html = html.replaceAll(segnaposto, () => valore);
}

const uscita = new URL('../../public/anteprime/destino/index.html', qui);
await mkdir(new URL('./', uscita), { recursive: true });
await writeFile(uscita, html);
console.log(`✓ ${uscita.pathname} · ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB`);
