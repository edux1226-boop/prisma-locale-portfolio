import { scrollToTarget } from '../../js/core/motion.js';

const CHIAVE = 'nagoya-anteprima-lista';
const WA_BASE = 'https://wa.me/393758350800?text=';

function leggi() {
  try {
    return JSON.parse(localStorage.getItem(CHIAVE)) || [];
  } catch {
    return [];
  }
}
function scrivi(valori) {
  try {
    localStorage.setItem(CHIAVE, JSON.stringify(valori));
  } catch {
    /* archiviazione non disponibile: la lista funziona lo stesso */
  }
}

/* La lista "cosa ci serve": si ricorda le spunte su questo dispositivo e
   le mette nel messaggio WhatsApp per Prisma Locale. */
function initLista() {
  const lista = document.querySelector('[data-lista]');
  const caselle = [...lista.querySelectorAll('input[type="checkbox"]')];
  const conto = document.querySelector('[data-conto]');
  const invia = document.querySelector('[data-invia]');
  const salvate = new Set(leggi());
  caselle.forEach((casella) => { casella.checked = salvate.has(casella.value); });

  const aggiorna = () => {
    const pronte = caselle.filter((c) => c.checked);
    conto.textContent = String(pronte.length);
    const nomi = pronte.map((c) => c.closest('label').querySelector('b').textContent.toLowerCase());
    let testo = 'Ciao Prisma Locale, sono di Nagoya Sushi. Ho visto l\'anteprima del sito.';
    if (nomi.length) testo += ` Ho già pronto: ${nomi.join(', ')}.`;
    invia.href = WA_BASE + encodeURIComponent(testo);
    scrivi(pronte.map((c) => c.value));
  };
  lista.addEventListener('change', aggiorna);
  aggiorna();
}

/* Evidenzia il giorno di oggi nella tabella degli orari. */
function initOggi() {
  const riga = document.querySelector(`[data-giorni] [data-giorno="${new Date().getDay()}"]`);
  riga?.classList.add('oggi');
}

/* Link interni: con Lenis quando c'è, e il focus segue lo scroll. */
function initAncore() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    scrollToTarget(target, () => {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
}

export function initDettagli() {
  initLista();
  initOggi();
  initAncore();
}
