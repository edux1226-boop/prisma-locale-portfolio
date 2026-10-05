const CHIAVE = 'borgo-anteprima-lista';
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

/* La lista "cosa manca": ricorda le spunte su questo dispositivo e le mette
   nel messaggio WhatsApp per Prisma Locale. */
export function initNota() {
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
    let testo = 'Ciao Prisma Locale, sono di Borgo Spoltino. Ho visto l\'anteprima del sito.';
    if (nomi.length) testo += ` Abbiamo già pronto: ${nomi.join(', ')}.`;
    invia.href = WA_BASE + encodeURIComponent(testo);
    scrivi(pronte.map((c) => c.value));
  };
  lista.addEventListener('change', aggiorna);
  aggiorna();
}
