/* Prenota: WhatsApp col messaggio già scritto, orari, modulo per i gruppi. */
import { scaduta } from '../comune.js';
import '../styles/pagine.css';
import { initWhatsapp } from '../moduli/whatsapp.js';
import { initModuli } from '../moduli/moduli.js';
import { initOrari } from '../moduli/orari.js';

if (!scaduta) {
  initWhatsapp();
  initModuli();
  initOrari();
}
