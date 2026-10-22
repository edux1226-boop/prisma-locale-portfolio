import { apri, prepara } from './dialoghi.js';

/* Visore delle foto su <dialog>: frecce, tastiera, scorrimento col dito, Esc.
   Ogni pulsante con data-lightbox="gruppo" apre il visore sul suo gruppo;
   data-grande è il percorso della versione grande senza estensione. */
export function initLightbox() {
  const finestra = document.querySelector('[data-lightbox-finestra]');
  const pulsanti = [...document.querySelectorAll('[data-lightbox]')];
  if (!finestra || !pulsanti.length) return;

  const figura = finestra.querySelector('[data-lightbox-figura]');
  const dida = finestra.querySelector('[data-lightbox-dida]');
  const conto = finestra.querySelector('[data-lightbox-conto]');
  let voci = [];
  let indice = 0;

  const immagine = document.createElement('picture');
  const sorgente = document.createElement('source');
  sorgente.type = 'image/avif';
  const img = document.createElement('img');
  img.decoding = 'async';
  immagine.append(sorgente, img);
  figura.prepend(immagine);

  const mostra = (i) => {
    indice = (i + voci.length) % voci.length;
    const v = voci[indice].dataset;
    sorgente.srcset = `${v.grande}.avif`;
    img.src = `${v.grande}.webp`;
    img.alt = v.alt || '';
    dida.textContent = v.dida || '';
    conto.textContent = `${indice + 1} / ${voci.length}`;
  };

  prepara(finestra);
  for (const p of pulsanti) {
    p.addEventListener('click', () => {
      voci = pulsanti.filter((x) => x.dataset.lightbox === p.dataset.lightbox && x.offsetParent !== null);
      if (!voci.includes(p)) voci = [p];
      finestra.classList.toggle('is-singola', voci.length < 2);
      mostra(voci.indexOf(p));
      apri(finestra, p);
    });
  }
  finestra.querySelector('[data-lightbox-prec]').addEventListener('click', () => mostra(indice - 1));
  finestra.querySelector('[data-lightbox-succ]').addEventListener('click', () => mostra(indice + 1));
  finestra.querySelector('[data-lightbox-chiudi]').addEventListener('click', () => finestra.close());
  finestra.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') mostra(indice + 1);
    if (e.key === 'ArrowLeft') mostra(indice - 1);
  });

  let x0 = null;
  finestra.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  finestra.addEventListener('pointercancel', () => { x0 = null; });
  finestra.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50 && voci.length > 1) mostra(indice + (dx < 0 ? 1 : -1));
  });
}
