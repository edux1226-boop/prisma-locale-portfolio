import { apri, prepara } from './dialoghi.js';
import { traccia } from './analisi.js';

/* "Prenota un tavolo": invece di cambiare pagina si apre la scelta del
   canale (telefono, WhatsApp, TheFork). Senza script, o con Ctrl/Cmd, il
   link porta alla pagina Prenota come sempre. */
export function initPrenotazione() {
  const scelta = document.querySelector('[data-scelta]');
  if (!scelta) return;
  prepara(scelta);
  scelta.querySelector('[data-scelta-chiudi]').addEventListener('click', () => scelta.close());

  const paginaPrenota = document.documentElement.dataset.pagina === 'prenota';

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-prenota]');
    if (!link || e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (link.dataset.prenota === 'thefork' || scelta.contains(link)) return;
    if (paginaPrenota) return;
    e.preventDefault();
    apri(scelta, link);
    traccia('scelta_prenotazione_aperta', { posizione: link.dataset.prenota });
  });

  // chi sceglie un canale chiude la finestra (il link fa il resto)
  scelta.addEventListener('click', (e) => { if (e.target.closest('a')) scelta.close(); });
}
