/* Galleria: le tre categorie a schede, il visore è nel comune. */
import { scaduta } from '../comune.js';
import '../styles/pagine.css';
import { initSchede } from '../moduli/galleria.js';

if (!scaduta) initSchede();
