/* Ingresso comune a tutte le pagine della Casetta: stili di base e i
   comportamenti presenti ovunque. Ogni pagina ha il suo file in pagine/
   che importa questo e aggiunge il proprio. Niente librerie: ~6 kB. */
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';

import { initTestata } from './moduli/testata.js';
import { initPrenotazione } from './moduli/prenotazione.js';
import { initAnalisi } from './moduli/analisi.js';
import { initLightbox } from './moduli/lightbox.js';
import { initRivela } from './moduli/rivela.js';
import { initUscita } from './moduli/uscita.js';
import { initCookie } from './moduli/cookie.js';
import { initNota } from './moduli/nota.js';

const radice = document.documentElement;

/* Anteprima scaduta (lo decide lo script nella testa): resta solo l'avviso. */
export const scaduta = radice.classList.contains('is-scaduta');

if (scaduta) {
  for (const nodo of document.querySelectorAll('body > :not(.scaduta)')) nodo.remove();
  document.title = 'Anteprima scaduta · Prisma Locale';
} else {
  initAnalisi();
  initTestata();
  initPrenotazione();
  initLightbox();
  initRivela();
  initUscita();
  initCookie();
  initNota();
}
