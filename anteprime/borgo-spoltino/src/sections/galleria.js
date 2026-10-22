import { creaVisore } from '../components/visore.js';

export function initGalleria({ movimento }) {
  const bottoni = [...document.querySelectorAll('[data-visore]')];
  const voci = bottoni.map((b) => {
    const dida = b.closest('.tavoletta').querySelector('.tavoletta__dida').lastChild.textContent.trim();
    return { img: b.querySelector('img'), dida };
  });
  const visore = creaVisore(voci, { movimento });
  bottoni.forEach((b, i) => {
    b.setAttribute('aria-label', `Apri a tutto schermo: ${voci[i].dida}`);
    b.addEventListener('click', () => visore.apri(i, b));
  });
}
