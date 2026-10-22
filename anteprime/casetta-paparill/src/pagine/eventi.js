/* Eventi privati: il modulo di richiesta. */
import { scaduta } from '../comune.js';
import '../styles/pagine.css';
import { initModuli } from '../moduli/moduli.js';

if (!scaduta) initModuli();
