import { gsap } from '../../../js/core/motion.js';

/* Sopra l'elenco, un'immagine segue il puntatore e cambia con la voce.
   Solo con il mouse: su touch le descrizioni sono già tutte visibili. */
export function initEsperienze() {
  const elenco = document.querySelector('[data-occasioni]');
  const segui = document.querySelector('[data-occasioni-segui]');
  const voci = [...elenco.querySelectorAll('[data-occasione]')];
  // le immagini si scaricano solo quando il mouse arriva davvero sull'elenco
  let immagini = null;
  const prepara = () => {
    immagini ??= voci.map((voce) => {
      const foto = `/assets/img/borgo/${voce.dataset.foto}`;
      const picture = document.createElement('picture');
      picture.innerHTML = `<source type="image/avif" srcset="${foto}.avif"><img src="${foto}.webp" alt="">`;
      segui.append(picture);
      return picture.querySelector('img');
    });
  };
  const x = gsap.quickTo(segui, 'x', { duration: 0.9, ease: 'power3.out' });
  const y = gsap.quickTo(segui, 'y', { duration: 0.9, ease: 'power3.out' });
  const r = gsap.quickTo(segui, 'rotation', { duration: 1.2, ease: 'power3.out' });
  let ultimoX = 0;

  elenco.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    x(e.clientX);
    y(e.clientY);
    r(gsap.utils.clamp(-3, 3, (e.clientX - ultimoX) * 0.3));
    ultimoX = e.clientX;
  });
  elenco.addEventListener('pointerenter', (e) => {
    if (e.pointerType !== 'mouse') return;
    prepara();
    gsap.set(segui, { x: e.clientX, y: e.clientY });
    segui.classList.add('is-visibile');
  });
  elenco.addEventListener('pointerleave', () => {
    segui.classList.remove('is-visibile');
    r(0);
  });
  voci.forEach((voce, i) => {
    voce.addEventListener('pointerenter', () => {
      prepara();
      immagini.forEach((img, j) => img.classList.toggle('is-attiva', i === j));
    });
  });
}
