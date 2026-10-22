import { disegnaPala } from './pala.js';

/* Chi chiede una pala la riceve qui: dal worker quando si può (il primo
   caricamento resta libero), altrimenti nel thread principale. */
let worker = null;
let prossimo = 0;
const attese = new Map();

function avviaWorker() {
  if (worker !== null) return worker;
  worker = false;
  if (typeof OffscreenCanvas === 'undefined' || typeof Worker === 'undefined') return worker;
  try {
    worker = new Worker(new URL('./pala-worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => {
      const attesa = attese.get(data.id);
      attese.delete(data.id);
      if (!attesa) return;
      if (data.bitmap) attesa.risolvi(data.bitmap);
      else attesa.rifiuta(new Error(data.errore));
    };
    worker.onerror = () => {
      worker = false;
      for (const attesa of attese.values()) attesa.rifiuta(new Error('worker non disponibile'));
      attese.clear();
    };
  } catch {
    worker = false;
  }
  return worker;
}

function nelWorker(opzioni) {
  const w = avviaWorker();
  if (!w) return Promise.reject(new Error('niente worker'));
  const id = ++prossimo;
  return new Promise((risolvi, rifiuta) => {
    attese.set(id, { risolvi, rifiuta });
    w.postMessage({ id, opzioni });
  });
}

/** Disegna la pala nella tela, con le opzioni di disegnaPala. */
export async function preparaPala(tela, opzioni) {
  try {
    const bitmap = await nelWorker(opzioni);
    tela.width = bitmap.width;
    tela.height = bitmap.height;
    tela.getContext('2d').drawImage(bitmap, 0, 0);
    bitmap.close();
  } catch {
    disegnaPala(tela, opzioni);
  }
  return tela;
}

/* Larghezza in pixel reali per una tela larga `css` pixel sullo schermo. */
export function pixelPer(css, massimo = 2800) {
  return Math.min(Math.round(css * Math.min(window.devicePixelRatio || 1, 2)), massimo);
}

/* Ridisegna solo se la larghezza cambia davvero (non per la barra del browser). */
export function quandoCambiaLarghezza(fn) {
  let ultima = window.innerWidth;
  let timer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const ora = window.innerWidth;
      if (Math.abs(ora - ultima) / ultima < 0.12) return;
      ultima = ora;
      fn();
    }, 250);
  });
}
