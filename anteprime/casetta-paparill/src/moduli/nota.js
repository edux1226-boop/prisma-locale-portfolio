/* La lista "cosa manca" della nota di Prisma Locale: ricorda le spunte su
   questo dispositivo e le aggiunge al messaggio WhatsApp. Solo anteprima. */
const CHIAVE = 'casetta-anteprima-lista';

export function initNota() {
  const lista = document.querySelector('[data-lista]');
  if (!lista) return;
  const caselle = [...lista.querySelectorAll('input[type="checkbox"]')];
  const conto = document.querySelector('[data-conto]');
  const invia = document.querySelector('[data-invia]');
  let salvate = [];
  try { salvate = JSON.parse(localStorage.getItem(CHIAVE)) || []; } catch { /* lista vuota */ }
  caselle.forEach((c) => { c.checked = salvate.includes(c.value); });

  const aggiorna = () => {
    const pronte = caselle.filter((c) => c.checked);
    conto.textContent = String(pronte.length);
    const nomi = pronte.map((c) => c.closest('label').querySelector('b').textContent.toLowerCase());
    let testo = lista.dataset.messaggio;
    if (nomi.length) testo += ` ${lista.dataset.messaggioPronti} ${nomi.join(', ')}.`;
    invia.href = `https://wa.me/${lista.dataset.wa}?text=${encodeURIComponent(testo)}`;
    try { localStorage.setItem(CHIAVE, JSON.stringify(pronte.map((c) => c.value))); } catch { /* pazienza */ }
  };
  lista.addEventListener('change', aggiorna);
  aggiorna();
}
