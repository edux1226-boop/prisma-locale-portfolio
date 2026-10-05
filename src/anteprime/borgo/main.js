import './styles/tokens.css';
import './styles/base.css';
import './styles/testata.css';
import './styles/hero.css';
import './styles/borgo.css';
import './styles/giornata.css';
import './styles/tavola.css';
import './styles/galleria.css';
import './styles/contatti.css';

import {
  gsap,
  MQ,
  startSmoothScroll,
  lockScroll,
  refreshWhenAssetsLoad,
  whenIdle,
} from '../../js/core/motion.js';
import { fontsReady } from '../../js/ui/intro.js';
import { initRivelazioni } from './animations/rivela.js';
import { initParallasse } from './animations/parallasse.js';
import { initCursore, initMagneti } from './animations/cursore.js';
import { playApertura } from './animations/apertura.js';
import { initTestata } from './sections/testata.js';
import { initHero } from './sections/hero.js';
import { initTerritorio } from './sections/territorio.js';
import { initLocation } from './sections/location.js';
import { initGiornata } from './sections/giornata.js';
import { initTavola } from './sections/tavola.js';
import { initEsperienze } from './sections/esperienze.js';
import { initGalleria } from './sections/galleria.js';
import { initVoci } from './sections/voci.js';
import { initRichiesta } from './sections/richiesta.js';
import { initNota } from './sections/nota.js';

const root = document.documentElement;

function avvia() {
  const movimento = root.classList.contains('motion');
  const fine = window.matchMedia(MQ.finePointer).matches;
  const desktop = window.matchMedia(MQ.desktop).matches;
  const opzioni = { movimento, fine, desktop };

  // ciò che serve anche senza movimento
  initTestata();
  initTavola(opzioni);
  initGalleria(opzioni);
  initVoci(opzioni);
  initRichiesta();
  initNota();

  if (!movimento) return;

  // la pagina si apre sempre dall'inizio: è il sipario che la presenta
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  startSmoothScroll();
  lockScroll(true);

  const mm = gsap.matchMedia();
  initLocation(mm);
  initGiornata();
  initTerritorio(opzioni);
  initRivelazioni();
  whenIdle(() => {
    if (fine) {
      initParallasse();
      initEsperienze();
      initCursore();
      initMagneti();
    }
  });
  refreshWhenAssetsLoad();

  fontsReady(1500).then(() => {
    playApertura(() => {
      lockScroll(false);
      initHero(opzioni);
    });
  });
}

if (root.classList.contains('is-scaduta')) {
  for (const nodo of document.querySelectorAll('body > :not(.scaduta)')) nodo.remove();
  document.title = 'Anteprima scaduta · Prisma Locale';
} else {
  avvia();
}
