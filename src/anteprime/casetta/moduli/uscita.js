import { apri, prepara, qualcunoAperto } from './dialoghi.js';
import { traccia } from './analisi.js';

/* Popup d'uscita, solo su desktop con il mouse: quando il puntatore esce
   dalla finestra verso l'alto (verso le schede o la chiusura), dopo almeno
   10 secondi di visita. Una volta per sessione, mai su telefono. */
const CHIAVE = 'casetta-uscita-vista';

export function initUscita() {
  const finestra = document.querySelector('[data-uscita]');
  if (!finestra) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 64em)').matches) return;
  try { if (sessionStorage.getItem(CHIAVE)) return; } catch { /* archiviazione assente: va bene */ }

  prepara(finestra);
  for (const b of finestra.querySelectorAll('[data-uscita-chiudi]')) b.addEventListener('click', () => finestra.close());
  finestra.addEventListener('click', (e) => { if (e.target.closest('a')) finestra.close(); });

  const inizio = Date.now();
  const suUscita = (e) => {
    if (e.relatedTarget || e.clientY > 0) return;
    if (Date.now() - inizio < 10_000 || qualcunoAperto()) return;
    document.removeEventListener('mouseout', suUscita);
    try { sessionStorage.setItem(CHIAVE, '1'); } catch { /* idem */ }
    apri(finestra, document.activeElement);
    traccia('popup_uscita_mostrato');
  };
  document.addEventListener('mouseout', suUscita);
}
