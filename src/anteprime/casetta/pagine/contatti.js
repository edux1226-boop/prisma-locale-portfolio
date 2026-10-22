/* Contatti: orari con il giorno di oggi e mappa su richiesta. */
import { scaduta } from '../comune.js';
import '../styles/pagine.css';
import { initOrari } from '../moduli/orari.js';
import { initMappa } from '../moduli/mappa.js';

if (!scaduta) {
  initOrari();
  initMappa();
}
