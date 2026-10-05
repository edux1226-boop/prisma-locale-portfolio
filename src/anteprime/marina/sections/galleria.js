import { creaVisore } from '../components/visore.js';
import { lockScroll } from '../../../js/core/motion.js';

/* I provini si aprono nel visore; gli orizzontali nella versione larga. */
export function initGalleria() {
  const bottoni = [...document.querySelectorAll('[data-visore]')];
  const voci = bottoni.map((b) => {
    const img = b.querySelector('img');
    return {
      src: img.getAttribute('src').replace(/-m\.webp$/, '-l.webp'),
      alt: img.alt,
      dida: b.parentElement.querySelector('.provino__dida').lastChild.textContent.trim(),
    };
  });
  const finestra = document.querySelector('[data-visore-finestra]');
  const visore = creaVisore(finestra, voci);
  finestra.addEventListener('close', () => lockScroll(false));
  bottoni.forEach((b, i) => b.addEventListener('click', () => {
    lockScroll(true);
    visore.apri(i, b);
  }));
}
