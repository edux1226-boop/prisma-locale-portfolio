import './styles/tokens.css';
import './styles/base.css';
import './styles/apertura.css';
import './styles/impasti.css';
import './styles/carta.css';
import './styles/sezioni.css';

import { initTestata } from './sezioni/testata.js';
import { initLievita } from './sezioni/lievita.js';
import { initForno, puoUsare3D } from './sezioni/forno.js';
import { initCarta } from './sezioni/carta.js';
import { initDolci } from './sezioni/dolci.js';
import { initNota } from './sezioni/nota.js';

const root = document.documentElement;

function avvia() {
  initTestata();
  initCarta();
  initDolci();
  initNota();
  if (root.classList.contains('motion')) initLievita();
  if (puoUsare3D()) initForno();
}

if (root.classList.contains('is-scaduta')) {
  for (const nodo of document.querySelectorAll('body > :not(.scaduta)')) nodo.remove();
  document.title = 'Anteprima scaduta · Prisma Locale';
} else {
  avvia();
}
