import './styles/base.css';
import './styles/sezioni.css';

import {
  startSmoothScroll,
  refreshWhenAssetsLoad,
  whenIdle,
} from '../../js/core/motion.js';
import { initRivelazioni } from './sezioni/rivela.js';
import { initTestata } from './sezioni/testata.js';
import { initHero } from './sezioni/hero.js';
import { initOre } from './sezioni/ore.js';
import { initBinario } from './sezioni/binario.js';
import { initComponi } from './sezioni/componi.js';
import { initOrari } from './sezioni/orari.js';
import { initNota } from './sezioni/nota.js';

const root = document.documentElement;

function avvia() {
  const movimento = root.classList.contains('motion');
  const opzioni = { movimento };

  // subito: testata, hero e orari, cioè quello che si vede al primo colpo
  initTestata(opzioni);
  initOrari();
  initHero(opzioni);
  if (movimento) startSmoothScroll();

  // il resto sta sotto la piega: si prepara quando il browser è libero
  whenIdle(() => {
    initOre(opzioni);
    initBinario(opzioni);
    initComponi();
    initNota();
    if (!movimento) return;
    initRivelazioni();
    refreshWhenAssetsLoad();
  });
}

if (root.classList.contains('is-scaduta')) {
  for (const nodo of document.querySelectorAll('body > :not(.scaduta)')) nodo.remove();
  document.title = 'Anteprima scaduta · Prisma Locale';
} else {
  avvia();
}
