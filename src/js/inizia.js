import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/inizia.css';

import { initForm } from './ui/form.js';

/* Landing /inizia: niente GSAP, niente Lenis, niente Three.js.
   Qui sotto: codice sorgente dai parametri UTM (nel testo WhatsApp e nel
   modulo), barra fissa che si nasconde quando il modulo è in vista, modulo. */

const params = new URLSearchParams(window.location.search);

// Solo lettere minuscole, numeri e trattino, al massimo 24 caratteri.
const pulisci = (valore) => (valore || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 24);

function codiceSorgente() {
  const sorgente = pulisci(params.get('utm_source'));
  const mezzo = pulisci(params.get('utm_medium'));
  if (sorgente === 'instagram' && mezzo) return `IG-${mezzo}`;
  if (sorgente && mezzo) return `${sorgente}-${mezzo}`;
  if (sorgente || mezzo) return sorgente || mezzo;
  return 'web';
}

const codice = codiceSorgente();

// Il testo precompilato di WhatsApp porta il codice: "[IG-bio]".
for (const link of document.querySelectorAll('a[data-wa]')) {
  link.href = link.href.replace('%5Bweb%5D', encodeURIComponent(`[${codice}]`));
}

// Il modulo si porta dietro il codice e i parametri UTM (solo quelli noti).
const sorgenteInput = document.querySelector('[data-sorgente]');
if (sorgenteInput) sorgenteInput.value = codice;
const utmInput = document.querySelector('[data-utm]');
if (utmInput) {
  const chiavi = ['utm_source', 'utm_medium', 'utm_campaign', 'v'];
  utmInput.value = chiavi
    .filter((chiave) => params.has(chiave))
    .map((chiave) => `${chiave}=${pulisci(params.get(chiave))}`)
    .join('&');
}

// La barra fissa lascia il posto al modulo: sopra la tastiera non serve.
const barra = document.querySelector('[data-barra]');
const richiesta = document.querySelector('#richiesta');
if (barra && richiesta && 'IntersectionObserver' in window) {
  new IntersectionObserver(([voce]) => {
    barra.classList.toggle('is-off', voce.isIntersecting);
  }, { threshold: 0.15 }).observe(richiesta);
}

initForm();
