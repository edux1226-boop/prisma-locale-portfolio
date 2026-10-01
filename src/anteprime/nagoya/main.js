import './nagoya.css';

import {
  gsap,
  ScrollTrigger,
  SplitText,
  startSmoothScroll,
  lockScroll,
  refreshWhenAssetsLoad,
} from '../../js/core/motion.js';
import { initHero, playTaglio } from './taglio.js';
import { initScena } from './scena.js';
import { initFette } from './fette.js';
import { initDettagli } from './dettagli.js';

const root = document.documentElement;

/* Titoli che entrano riga per riga, testi che salgono, tagli che si tracciano. */
function initRivelazioni() {
  for (const titolo of document.querySelectorAll('[data-rivela]')) {
    const { lines } = SplitText.create(titolo, { type: 'lines', mask: 'lines', linesClass: 'riga' });
    gsap.from(lines, {
      yPercent: 125,
      duration: 1.3,
      stagger: 0.09,
      scrollTrigger: { trigger: titolo, start: 'top 86%', once: true },
    });
  }
  for (const pezzo of document.querySelectorAll('[data-sfuma]')) {
    gsap.from(pezzo, {
      autoAlpha: 0,
      y: 22,
      duration: 1.1,
      scrollTrigger: { trigger: pezzo, start: 'top 90%', once: true },
    });
  }
  for (const linea of document.querySelectorAll('[data-linea]')) {
    gsap.from(linea, {
      scaleX: 0,
      duration: 1.4,
      ease: 'expo.inOut',
      scrollTrigger: { trigger: linea.parentElement, start: 'top 82%', once: true },
    });
  }
}

function caratteriPronti() {
  const attesa = new Promise((resolve) => { setTimeout(resolve, 1500); });
  return Promise.race([document.fonts?.ready ?? Promise.resolve(), attesa]);
}

function avvia() {
  initDettagli();
  const hero = initHero();
  const leggero = window.matchMedia('(max-width: 63.99em), (pointer: coarse)').matches;

  if (!root.classList.contains('motion')) {
    initFette();
    return;
  }

  // L'anteprima si apre sempre dall'inizio: è il taglio che la presenta.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  startSmoothScroll();
  lockScroll(true);

  hero.scivola();
  const scena = initScena({ leggero });
  initFette();
  initRivelazioni();
  ScrollTrigger.sort();
  refreshWhenAssetsLoad();

  caratteriPronti().then(() => {
    hero.misura();
    playTaglio(hero, () => {
      lockScroll(false);
      scena.carica();
    });
  });
}

if (root.classList.contains('is-scaduta')) {
  for (const nodo of document.querySelectorAll('body > :not(.scaduta)')) nodo.remove();
  document.title = 'Anteprima scaduta · Prisma Locale';
} else {
  avvia();
}
