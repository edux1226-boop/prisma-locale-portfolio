/* Disegna una tavola della Casetta: ?t=nome&w=larghezza&h=altezza.
   Il risultato (PNG in base64) finisce in window.__still. */
import { Caso, grana, vignetta, lucePrincipale } from './tavole/base.js';
import { PIATTI } from './tavole/piatti.js';
import { SCENE } from './tavole/scene.js';

const TAVOLE = { ...PIATTI, ...SCENE };

const q = new URLSearchParams(location.search);
const nome = q.get('t') || 'chitarra-pallottine';
const w = Number(q.get('w') || 1200);
const h = Number(q.get('h') || 900);

async function disegna() {
  await document.fonts.load('600 40px "Playfair Display"');
  await document.fonts.load('500 20px Inter');
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');
  const S = Math.min(w, h) / 900;
  const scena = TAVOLE[nome];
  if (!scena) throw new Error(`tavola sconosciuta: ${nome}`);
  const caso = new Caso(nome);
  scena(ctx, w, h, S, caso, q);
  lucePrincipale(ctx, w, h);
  vignetta(ctx, w, h, { forza: 0.22 });
  grana(ctx, w, h, caso.figlio('grana'), { alfa: 0.045 });
  window.__still = canvas.toDataURL('image/png');
}

disegna().catch((e) => { console.error(e); window.__errore = String(e); });
export { TAVOLE };
