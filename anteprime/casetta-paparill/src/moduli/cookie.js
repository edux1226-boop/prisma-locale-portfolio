/* Consenso ai cookie di analisi e caricamento di Google Analytics 4.
   Il banner esiste solo se in sito.json c'è un ID GA4 (nell'anteprima no).
   Rifiuta e Accetta hanno lo stesso peso, come chiede il Garante. */
const CHIAVE = 'casetta-cookie';

function caricaGa(id) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', id);
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.append(s);
}

export function initCookie() {
  const banner = document.querySelector('[data-cookie]');
  if (!banner) return;
  const id = banner.dataset.ga4;
  let scelta = null;
  try { scelta = localStorage.getItem(CHIAVE); } catch { /* niente archiviazione: si richiede */ }
  if (scelta === 'si') { caricaGa(id); return; }
  if (scelta === 'no') return;

  banner.hidden = false;
  banner.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cookie-scelta]');
    if (!b) return;
    const valore = b.dataset.cookieScelta;
    try { localStorage.setItem(CHIAVE, valore); } catch { /* vale per questa visita */ }
    banner.hidden = true;
    if (valore === 'si') caricaGa(id);
  });
}
