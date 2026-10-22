/* Lavora con noi: il modulo di candidatura con il curriculum. */
import { scaduta } from '../comune.js';
import '../styles/pagine.css';
import { initModuli } from '../moduli/moduli.js';

if (!scaduta) initModuli();
