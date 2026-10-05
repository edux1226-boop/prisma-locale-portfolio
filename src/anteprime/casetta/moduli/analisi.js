/* Eventi di Google Analytics 4. Il tracciamento parte solo se c'è un ID in
   sito.json e solo dopo il consenso ai cookie (vedi cookie.js): prima di
   allora gli eventi non escono dal browser.

   Eventi (nomi GA4, parametro event_category per le conversioni):
     prenota_click       categoria conversion · canale (sito | thefork) · posizione
     chiama_click        categoria conversion · posizione
     whatsapp_click      categoria conversion · posizione
     email_click         posizione
     menu_visualizzato   alla visita della pagina Menu
     menu_pdf_download   download del menu in PDF
   Ogni evento porta anche la pagina e la variante del titolo (test A/B).

   I link wa.me non accettano parametri UTM: la provenienza si legge da
   "posizione" (hero, barra, fascia, prenota…). */

const radice = document.documentElement;

export function traccia(evento, parametri = {}) {
  const dati = {
    pagina: radice.dataset.pagina,
    ...(radice.dataset.abTitolo ? { variante_titolo: radice.dataset.abTitolo } : {}),
    ...parametri,
  };
  if (typeof window.gtag === 'function') window.gtag('event', evento, dati);
  if (import.meta.env.DEV) console.info('[ga4]', evento, dati);
}

const posizione = (el) => el.dataset.posizione || el.dataset.prenota || el.closest('[data-posizione]')?.dataset.posizione || 'pagina';

export function initAnalisi() {
  // fase di cattura: l'evento si registra anche se un altro gestore ferma il link
  document.addEventListener('click', (e) => {
    const el = e.target.closest('a, button');
    if (!el || el.closest('.nota, .scaduta')) return;
    const href = el.getAttribute('href') || '';
    if (el.dataset.prenota) {
      traccia('prenota_click', { event_category: 'conversion', canale: el.dataset.prenota === 'thefork' ? 'thefork' : 'sito', posizione: posizione(el) });
    } else if (href.startsWith('tel:')) {
      traccia('chiama_click', { event_category: 'conversion', posizione: posizione(el) });
    } else if (href.includes('wa.me/')) {
      traccia('whatsapp_click', { event_category: 'conversion', posizione: posizione(el) });
    } else if (href.startsWith('mailto:')) {
      traccia('email_click', { posizione: posizione(el) });
    } else if (el.dataset.traccia === 'menu_pdf') {
      traccia('menu_pdf_download', { posizione: posizione(el) });
    }
  }, { capture: true });
}
