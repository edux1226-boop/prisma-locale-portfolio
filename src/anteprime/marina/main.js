/* Vecchia Marina — anteprima di Prisma Locale.
   Design system in styles/ (token, tipografia, sezioni); motore del
   movimento condiviso con le altre anteprime in src/js/core/motion.js. */

import './styles/tokens.css';
import './styles/base.css';
import './styles/testata.css';
import './styles/hero.css';
import './styles/racconto.css';
import './styles/tavola.css';
import './styles/approdo.css';
import './styles/prenota.css';

import {
  gsap,
  ScrollTrigger,
  MQ,
  startSmoothScroll,
  refreshWhenAssetsLoad,
  whenIdle,
} from '../../js/core/motion.js';
import { initEmersione } from './animations/emersione.js';
import { initMarea } from './animations/marea.js';
import { initDeriva } from './animations/deriva.js';
import { initScandaglio } from './animations/scandaglio.js';
import { initTestata } from './sections/testata.js';
import { playAlba, initHeroScroll } from './sections/hero.js';
import { initBib } from './sections/bib.js';
import { initStoria } from './sections/storia.js';
import { initMare } from './sections/mare.js';
import { initSpecchio } from './sections/specchio.js';
import { initCarta } from './sections/carta.js';
import { initGalleria } from './sections/galleria.js';
import { initVoci } from './sections/voci.js';
import { initPrenota } from './sections/prenota.js';
import { initContatti } from './sections/contatti.js';
import { initNota } from './sections/nota.js';

const root = document.documentElement;

function caratteriPronti() {
  const attesa = new Promise((resolve) => { setTimeout(resolve, 1200); });
  return Promise.race([document.fonts?.ready ?? Promise.resolve(), attesa]);
}

/* Ogni preparazione nel suo task, cedendo il passo al browser tra l'una e
   l'altra: sul telefono nessun blocco lungo mentre la pagina si apre. */
const cedi = () => new Promise((resolve) => {
  if (globalThis.scheduler?.yield) globalThis.scheduler.yield().then(resolve);
  else setTimeout(resolve, 0);
});
async function inSequenza(lavori) {
  for (const lavoro of lavori) {
    lavoro();
    await cedi();
  }
}

function avvia() {
  const movimento = root.classList.contains('motion');
  const fine = window.matchMedia(MQ.finePointer).matches;
  const desktop = window.matchMedia(MQ.desktop).matches;
  const opzioni = { movimento, fine, desktop };

  // la testata subito: menu, ancore, prenota
  initTestata(opzioni);

  if (movimento) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    startSmoothScroll();
    // l'apertura completa solo su desktop (sul telefono il nome c'è già)
    if (root.classList.contains('is-alba')) {
      caratteriPronti().then(() => playAlba(() => {
        initHeroScroll();
        ScrollTrigger.refresh();
      }));
    }
  }

  const mm = gsap.matchMedia();
  inSequenza([
    initCarta,
    initPrenota,
    initGalleria,
    initContatti,
    initNota,
    () => initVoci(opzioni),
    ...(movimento ? [
      () => initMare(mm),
      () => initStoria(mm),
      initBib,
      initEmersione,
      initMarea,
    ] : []),
  ]).then(() => {
    if (!movimento) return;
    // le sezioni sono nate in ordine sparso: ScrollTrigger le misura dall'alto
    ScrollTrigger.sort();
    refreshWhenAssetsLoad();
    whenIdle(() => {
      initDeriva();
      initScandaglio();
      initSpecchio(opzioni);
    });
  });
}

if (root.classList.contains('is-scaduta')) {
  for (const nodo of document.querySelectorAll('body > :not(.scaduta)')) nodo.remove();
  document.title = 'Anteprima scaduta · Prisma Locale';
} else {
  avvia();
}
