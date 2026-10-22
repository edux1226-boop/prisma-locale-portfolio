import { traccia } from './analisi.js';

/* La mappa di Google arriva solo quando la si chiede: prima c'è un disegno,
   così nessun cookie di terze parti parte senza un clic. */
export function initMappa() {
  const box = document.querySelector('[data-mappa]');
  const bottone = box?.querySelector('[data-mappa-carica]');
  if (!bottone) return;
  bottone.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = box.dataset.src;
    iframe.title = box.dataset.titolo;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.allowFullscreen = true;
    iframe.className = 'mappa__iframe';
    box.replaceChildren(iframe);
    box.classList.add('is-caricata');
    traccia('mappa_caricata');
  });
}
