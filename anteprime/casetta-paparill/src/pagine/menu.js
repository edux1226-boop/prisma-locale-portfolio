/* Pagina Menu: filtri e indice delle sezioni. */
import { scaduta } from '../comune.js';
import '../styles/menu.css';
import { initMenu } from '../moduli/menu.js';

if (!scaduta) initMenu();
