import { gsap } from '../../../js/core/motion.js';

/* Visore a tutto schermo su <dialog>: frecce, tastiera, swipe, Esc.
   Mostra la versione grande dell'immagine quando esiste, nello stesso
   formato (AVIF o WebP) che il browser ha scelto per la miniatura. */
const grande = (src) => src.replace(/-m\.(avif|webp)$/, '-l.$1');

export function creaVisore(voci, { movimento }) {
  const finestra = document.querySelector('[data-visore-finestra]');
  const img = finestra.querySelector('[data-visore-img]');
  const dida = finestra.querySelector('[data-visore-dida]');
  const conto = finestra.querySelector('[data-visore-conto]');
  let indice = 0;
  let origine = null;

  const mostra = (i, verso = 0) => {
    indice = (i + voci.length) % voci.length;
    const voce = voci[indice];
    const cambia = () => {
      img.src = grande(voce.img.currentSrc || voce.img.src);
      img.alt = voce.img.alt;
      dida.textContent = voce.dida;
      conto.textContent = `${String(indice + 1).padStart(2, '0')} / ${String(voci.length).padStart(2, '0')}`;
    };
    if (!movimento || !verso) { cambia(); return; }
    gsap.timeline()
      .to(img, { opacity: 0, x: -40 * verso, duration: 0.3, ease: 'power2.in' })
      .add(cambia)
      .fromTo(img, { opacity: 0, x: 40 * verso }, { opacity: 1, x: 0, duration: 0.8, ease: 'expo.out', immediateRender: false });
  };

  const apri = (i, da) => {
    origine = da;
    mostra(i);
    finestra.showModal();
    if (movimento) gsap.fromTo(img, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 1, ease: 'expo.out' });
  };

  const passa = (verso) => mostra(indice + verso, verso);
  finestra.querySelector('[data-visore-prec]').addEventListener('click', () => passa(-1));
  finestra.querySelector('[data-visore-succ]').addEventListener('click', () => passa(1));
  finestra.querySelector('[data-visore-chiudi]').addEventListener('click', () => finestra.close());
  finestra.addEventListener('close', () => origine?.focus({ preventScroll: true }));
  finestra.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') passa(1);
    if (e.key === 'ArrowLeft') passa(-1);
  });
  // swipe orizzontale
  let x0 = null;
  finestra.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  finestra.addEventListener('pointercancel', () => { x0 = null; });
  finestra.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) passa(dx < 0 ? 1 : -1);
  });

  return { apri };
}
